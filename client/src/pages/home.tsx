import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, Timer as TimerIcon, ListTodo, BarChart3, Moon, Sun, LogIn, LogOut } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TaskList } from "@/components/TaskList";
import { MusicPlayer } from "@/components/MusicPlayer";
import { QuoteCard } from "@/components/QuoteCard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { BackgroundSettings } from "@/components/BackgroundSettings";
import { useTheme } from "@/contexts/ThemeContext";
import { motivationalQuotes } from "@/lib/themes";
import { Task, Session } from "../../../server/db/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MusicEngine, playTimerAlarm } from "@/lib/audio";
import { useNotifications } from "@/hooks/useNotifications";
import { getAuthToken, removeAuthToken } from "@/lib/auth";
import { usePomodoro } from '@/hooks/usePomodoro';

type Tab = "timer" | "tasks" | "analytics";

export default function Home() {
    const [location, setLocation] = useLocation();
    const { theme, setTheme, colorMode, toggleColorMode } = useTheme();
    const { toast } = useToast();
    const { notifySessionComplete, requestPermission } = useNotifications();

    const [activeTab, setActiveTab] = useState<Tab>("timer");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [backgroundOpacity, setBackgroundOpacity] = useState(() => {
        const saved = localStorage.getItem("pomodoro-bg-opacity");
        return saved ? Number(saved) : 0.15;
    });
    const [backgroundInterval, setBackgroundInterval] = useState(() => {
        const saved = localStorage.getItem("pomodoro-bg-interval");
        return saved ? Number(saved) : 300000;
    });

    const [workDuration, setWorkDuration] = useState(() => {
        const saved = localStorage.getItem("pomodoro-work-duration");
        return saved ? Number(saved) : 25;
    });

    const [breakDuration, setBreakDuration] = useState(() => {
        const saved = localStorage.getItem("pomodoro-break-duration");
        return saved ? Number(saved) : 5;
    });

    const [quoteIndex, setQuoteIndex] = useState(0);

    const [musicPlaying, setMusicPlaying] = useState(false);
    const [musicGenre, setMusicGenre] = useState(() => {
        const saved = localStorage.getItem("pomodoro-music-genre");
        return saved || "lofi";
    });
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem("pomodoro-music-volume");
        return saved ? Number(saved) : 0.5;
    });

    const musicEngineRef = useRef<any>(null);

    const { timeLeft, totalTime, isRunning, isBreak, onPlayPause, onReset } = usePomodoro(
        workDuration * 60,
        breakDuration * 60
    );

    const prevTimeLeftRef = useRef(timeLeft);
    const prevIsBreakRef = useRef(isBreak);

    const isLoggedIn = !!getAuthToken();

    const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
        queryKey: ["/api/tasks"],
        enabled: isLoggedIn,
    });

    const { data: sessions = [], isLoading: sessionsLoading, refetch: refetchSessions } = useQuery<Session[]>({
        queryKey: ["/api/sessions"],
        enabled: isLoggedIn,
    });

    const createTaskMutation = useMutation({
        mutationFn: async ({ text, priority }: { text: string; priority: string }) => {
            console.log("📤 Sending task creation request:", { text, priority });
            return await apiRequest("POST", "/api/tasks", {
                text,
                priority,
                completed: false
            });
        },
        onSuccess: (data) => {
            console.log("✅ Task created successfully:", data);
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            toast({
                title: "Task added",
                description: "Your task has been added successfully.",
            });
        },
        onError: (error: any) => {
            console.error("❌ Task creation error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to add task. Please try again.",
                variant: "destructive",
            });
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
            console.log("📤 Updating task:", { id, completed });
            return await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
        },
        onSuccess: (data) => {
            console.log("✅ Task updated successfully:", data);
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        },
        onError: (error: any) => {
            console.error("❌ Task update error:", error);
            toast({
                title: "Error",
                description: "Failed to update task. Please try again.",
                variant: "destructive",
            });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (id: number) => {
            console.log("📤 Deleting task:", id);
            return await apiRequest("DELETE", `/api/tasks/${id}`, undefined);
        },
        onSuccess: (data, id) => {
            console.log("✅ Task deleted successfully:", id);
            queryClient.setQueryData<Task[]>(["/api/tasks"], (old) =>
                old ? old.filter(task => task.id !== id) : []
            );
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            toast({
                title: "Task deleted",
                description: "Your task has been removed.",
            });
        },
        onError: (error: any) => {
            console.error("❌ Task deletion error:", error);
            toast({
                title: "Error",
                description: "Failed to delete task. Please try again.",
                variant: "destructive",
            });
        },
    });

    // FIXED: Proper session mutation with refetch
    const createSessionMutation = useMutation({
        mutationFn: async (session: { date: string; duration: number; type: string }) => {
            console.log("📤 Creating session:", session);
            return await apiRequest("POST", "/api/sessions", session);
        },
        onSuccess: (data) => {
            console.log("✅ Session created successfully:", data);

            // Update cache immediately
            queryClient.setQueryData<Session[]>(["/api/sessions"], (old) => {
                if (!old) return [data];
                return [...old, data];
            });

            // Force refetch from server
            refetchSessions();
        },
        onError: (error: any) => {
            console.error("❌ Session creation error:", error);
            toast({
                title: "Warning",
                description: "Session completed but failed to save. Your progress is safe.",
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    useEffect(() => {
        localStorage.setItem("pomodoro-work-duration", String(workDuration));
    }, [workDuration]);

    useEffect(() => {
        localStorage.setItem("pomodoro-break-duration", String(breakDuration));
    }, [breakDuration]);

    useEffect(() => {
        localStorage.setItem("pomodoro-music-genre", musicGenre);
    }, [musicGenre]);

    useEffect(() => {
        localStorage.setItem("pomodoro-music-volume", String(musicVolume));
    }, [musicVolume]);

    useEffect(() => {
        localStorage.setItem("pomodoro-bg-opacity", String(backgroundOpacity));
    }, [backgroundOpacity]);

    useEffect(() => {
        localStorage.setItem("pomodoro-bg-interval", String(backgroundInterval));
    }, [backgroundInterval]);

    useEffect(() => {
        if (!musicEngineRef.current) {
            musicEngineRef.current = new MusicEngine();
        }

        return () => {
            if (musicEngineRef.current) {
                musicEngineRef.current.cleanup();
            }
        };
    }, []);

    useEffect(() => {
        if (musicEngineRef.current) {
            if (musicPlaying) {
                musicEngineRef.current.play(musicGenre, musicVolume);
            } else {
                musicEngineRef.current.pause();
            }
        }
    }, [musicPlaying, musicGenre, musicVolume]);

    useEffect(() => {
        if (prevTimeLeftRef.current > 0 && timeLeft === 0) {
            const completedSessionType = prevIsBreakRef.current ? "break" : "work";
            console.log("⏰ Timer completed! Session type:", completedSessionType);
            handleSessionComplete(completedSessionType);
        }

        prevTimeLeftRef.current = timeLeft;
        prevIsBreakRef.current = isBreak;
    }, [timeLeft, isBreak]);

    const handleSessionComplete = useCallback((sessionType: "work" | "break") => {
        console.log(`🎉 Session completed: ${sessionType}`);

        playTimerAlarm();

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        const duration = sessionType === "work" ? workDuration : breakDuration;

        console.log("💾 Saving session to database:", { date, duration, type: sessionType });

        if (isLoggedIn) {
            createSessionMutation.mutate({
                date,
                duration,
                type: sessionType,
            });
        }

        if (sessionType === "work") {
            setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
            toast({
                title: "Focus session complete! 🎯",
                description: `You completed a ${workDuration}-minute focus session!`,
            });
            notifySessionComplete("work");
        } else {
            toast({
                title: "Break complete! 💪",
                description: "Ready to focus again?",
            });
            notifySessionComplete("break");
        }
    }, [isLoggedIn, workDuration, breakDuration, createSessionMutation, toast, notifySessionComplete]);

    const handleWorkDurationChange = (duration: number) => {
        if (duration >= 1 && duration <= 120) {
            setWorkDuration(duration);
        }
    };

    const handleBreakDurationChange = (duration: number) => {
        if (duration >= 1 && duration <= 30) {
            setBreakDuration(duration);
        }
    };

    const handleAddTask = (text: string, priority: string) => {
        console.log("➕ Adding task:", { text, priority });
        createTaskMutation.mutate({ text, priority });
    };

    const handleToggleTask = (id: number) => {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            updateTaskMutation.mutate({ id, completed: !task.completed });
        }
    };

    const handleDeleteTask = (id: number) => {
        console.log("🗑️ Deleting task:", id);
        if (window.confirm("Are you sure you want to delete this task? This won't affect your timer or session history.")) {
            deleteTaskMutation.mutate(id);
        }
    };

    const handleLogout = () => {
        removeAuthToken();
        toast({
            title: "Logged out",
            description: "You have been logged out successfully.",
        });
        setLocation("/login");
    };

    const currentQuote = motivationalQuotes[quoteIndex];

    const completedTasks = tasks.filter((t) => t.completed).length;
    const todaySessions = sessions.filter(
        (s) => s.date === new Date().toISOString().split("T")[0] && s.type === "work"
    );

    if (tasksLoading || sessionsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading your productivity dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                background: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)`,
            }}
        >
            <BackgroundSettings
                opacity={backgroundOpacity}
                onOpacityChange={setBackgroundOpacity}
                changeInterval={backgroundInterval}
                onIntervalChange={setBackgroundInterval}
            />

            <div className="absolute inset-0 opacity-5"
                 style={{
                     backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
                     backgroundSize: "48px 48px",
                 }}
            />

            <div className="relative z-10">
                <header className="border-b border-border backdrop-blur-sm bg-background/95 sticky top-0 z-30 shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold font-accent text-foreground" data-testid="text-app-title">
                                Focus Flow
                            </h1>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={activeTab === "timer" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("timer")}
                                    data-testid="button-tab-timer"
                                    className="text-foreground"
                                >
                                    <TimerIcon className="w-4 h-4 mr-2" />
                                    Timer
                                </Button>
                                <Button
                                    variant={activeTab === "tasks" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("tasks")}
                                    data-testid="button-tab-tasks"
                                    className="text-foreground"
                                >
                                    <ListTodo className="w-4 h-4 mr-2" />
                                    Tasks
                                </Button>
                                <Button
                                    variant={activeTab === "analytics" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("analytics")}
                                    data-testid="button-tab-analytics"
                                    className="text-foreground"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analytics
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={toggleColorMode}
                                    data-testid="button-color-mode"
                                    className="text-foreground hover:bg-accent"
                                >
                                    {colorMode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </Button>

                                {isLoggedIn ? (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleLogout}
                                        title="Logout"
                                        className="text-foreground hover:bg-accent"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setLocation("/login")}
                                        title="Login"
                                        className="text-foreground hover:bg-accent"
                                    >
                                        <LogIn className="w-5 h-5" />
                                    </Button>
                                )}

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setSettingsOpen(true)}
                                    data-testid="button-settings"
                                    className="text-foreground hover:bg-accent"
                                >
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-8">
                        <aside className="space-y-6">
                            <Card className="p-6 bg-card text-card-foreground">
                                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Total Tasks</span>
                                        <span className="font-semibold" data-testid="text-quick-stat-total-tasks">
                                            {tasks.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Completed</span>
                                        <span className="font-semibold text-green-500" data-testid="text-quick-stat-completed">
                                            {completedTasks}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Sessions Today</span>
                                        <span className="font-semibold" data-testid="text-quick-stat-sessions">
                                            {todaySessions.length}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {activeTab === "timer" && (
                                <div className="hidden lg:block">
                                    <QuoteCard text={currentQuote.text} author={currentQuote.author} />
                                </div>
                            )}
                        </aside>

                        <div className="min-w-0">
                            {activeTab === "timer" && (
                                <div className="space-y-8">
                                    <PomodoroTimer
                                        timeLeft={timeLeft}
                                        totalTime={totalTime}
                                        isRunning={isRunning}
                                        isBreak={isBreak}
                                        onPlayPause={onPlayPause}
                                        onReset={onReset}
                                    />
                                    <div className="lg:hidden">
                                        <QuoteCard text={currentQuote.text} author={currentQuote.author} />
                                    </div>
                                </div>
                            )}

                            {activeTab === "tasks" && (
                                <TaskList
                                    tasks={tasks}
                                    onAddTask={handleAddTask}
                                    onToggleTask={handleToggleTask}
                                    onDeleteTask={handleDeleteTask}
                                />
                            )}

                            {activeTab === "analytics" && (
                                <AnalyticsDashboard sessions={sessions} tasks={tasks} />
                            )}
                        </div>

                        <aside className="space-y-6">
                            {activeTab === "timer" && (
                                <MusicPlayer
                                    isPlaying={musicPlaying}
                                    genre={musicGenre}
                                    volume={musicVolume}
                                    onPlayPause={() => setMusicPlaying(!musicPlaying)}
                                    onGenreChange={setMusicGenre}
                                    onVolumeChange={setMusicVolume}
                                />
                            )}

                            <Card className="p-6 bg-card text-card-foreground">
                                <h3 className="text-lg font-semibold mb-4">Current Task</h3>
                                {tasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No tasks yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {tasks
                                            .filter((t) => !t.completed)
                                            .slice(0, 3)
                                            .map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="text-sm p-2 rounded bg-muted/50"
                                                    data-testid={`text-sidebar-task-${task.id}`}
                                                >
                                                    {task.text}
                                                </div>
                                            ))}
                                        {tasks.filter((t) => !t.completed).length === 0 && (
                                            <p className="text-sm text-muted-foreground">All tasks completed! 🎉</p>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </aside>
                    </div>
                </main>
            </div>

            <SettingsPanel
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                theme={theme}
                onThemeChange={setTheme}
                workDuration={workDuration}
                breakDuration={breakDuration}
                onWorkDurationChange={handleWorkDurationChange}
                onBreakDurationChange={handleBreakDurationChange}
                backgroundOpacity={backgroundOpacity}
                backgroundInterval={backgroundInterval}
            />
        </div>
    );
}