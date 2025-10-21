import { useState, useEffect, useRef } from "react";
import { Settings, Timer as TimerIcon, ListTodo, BarChart3, Moon, Sun } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimerDisplay } from "@/components/TimerDisplay";
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

type Tab = "timer" | "tasks" | "analytics";

export default function Home() {
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
        return saved ? Number(saved) : 300000; // 5 minutes
    });

    const [workDuration, setWorkDuration] = useState(() => {
        const saved = localStorage.getItem("pomodoro-work-duration");
        return saved ? Number(saved) : 25;
    });

    const [breakDuration, setBreakDuration] = useState(() => {
        const saved = localStorage.getItem("pomodoro-break-duration");
        return saved ? Number(saved) : 5;
    });

    const [timeLeft, setTimeLeft] = useState(workDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
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

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const musicEngineRef = useRef<any>(null);

    const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
        queryKey: ["/api/tasks"],
    });

    const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
        queryKey: ["/api/sessions"],
    });

    const createTaskMutation = useMutation({
        mutationFn: async (text: string) => {
            return await apiRequest("POST", "/api/tasks", { text, completed: false });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            toast({
                title: "Task added",
                description: "Your task has been added successfully.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to add task. Please try again.",
                variant: "destructive",
            });
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
            return await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to update task. Please try again.",
                variant: "destructive",
            });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (id: number) => {
            return await apiRequest("DELETE", `/api/tasks/${id}`, undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
            toast({
                title: "Task deleted",
                description: "Your task has been removed.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to delete task. Please try again.",
                variant: "destructive",
            });
        },
    });

    const createSessionMutation = useMutation({
        mutationFn: async (session: { date: string; duration: number; type: string }) => {
            return await apiRequest("POST", "/api/sessions", session);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
        },
    });

    // Request notification permission on mount
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
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        playAlarm();
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRunning]);

    const playAlarm = () => {
        playTimerAlarm();
    };

    const handleSessionComplete = () => {
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().split(" ")[0]; // HH:MM:SS

        createSessionMutation.mutate({
            date,
            duration: isBreak ? breakDuration : workDuration,
            type: isBreak ? "break" : "work",
        });

        if (!isBreak) {
            setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
            toast({
                title: "Focus session complete!",
                description: "Great work! Time for a break.",
            });
            notifySessionComplete("work");
        } else {
            toast({
                title: "Break complete!",
                description: "Ready to focus again?",
            });
            notifySessionComplete("break");
        }

        setIsBreak(!isBreak);
        setTimeLeft(isBreak ? workDuration * 60 : breakDuration * 60);
        setIsRunning(false);
    };

    const handlePlayPause = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    };

    const handleWorkDurationChange = (duration: number) => {
        if (duration >= 1 && duration <= 60) {
            setWorkDuration(duration);
            if (!isBreak && !isRunning) {
                setTimeLeft(duration * 60);
            }
        }
    };

    const handleBreakDurationChange = (duration: number) => {
        if (duration >= 1 && duration <= 30) {
            setBreakDuration(duration);
            if (isBreak && !isRunning) {
                setTimeLeft(duration * 60);
            }
        }
    };

    const handleAddTask = (text: string) => {
        createTaskMutation.mutate(text);
    };

    const handleToggleTask = (id: number) => {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            updateTaskMutation.mutate({ id, completed: !task.completed });
        }
    };

    const handleDeleteTask = (id: number) => {
        deleteTaskMutation.mutate(id);
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
                interval={backgroundInterval} onOpacityChange={function (opacity: number): void {
                throw new Error("Function not implemented.");
            }} changeInterval={0} onIntervalChange={function (interval: number): void {
                throw new Error("Function not implemented.");
            }}            />

            <div className="absolute inset-0 opacity-5"
                 style={{
                     backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
                     backgroundSize: "48px 48px",
                 }}
            />

            <div className="relative z-10">
                <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-30">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold font-accent" data-testid="text-app-title">
                                Focus Flow
                            </h1>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={activeTab === "timer" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("timer")}
                                    data-testid="button-tab-timer"
                                >
                                    <TimerIcon className="w-4 h-4 mr-2" />
                                    Timer
                                </Button>
                                <Button
                                    variant={activeTab === "tasks" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("tasks")}
                                    data-testid="button-tab-tasks"
                                >
                                    <ListTodo className="w-4 h-4 mr-2" />
                                    Tasks
                                </Button>
                                <Button
                                    variant={activeTab === "analytics" ? "default" : "ghost"}
                                    onClick={() => setActiveTab("analytics")}
                                    data-testid="button-tab-analytics"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analytics
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={toggleColorMode}
                                    data-testid="button-color-mode"
                                >
                                    {colorMode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setSettingsOpen(true)}
                                    data-testid="button-settings"
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
                            <Card className="p-6">
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
                                    <TimerDisplay
                                        timeLeft={timeLeft}
                                        totalTime={isBreak ? breakDuration * 60 : workDuration * 60}
                                        isRunning={isRunning}
                                        isBreak={isBreak}
                                        onPlayPause={handlePlayPause}
                                        onReset={handleReset}
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

                            <Card className="p-6">
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
                                            <p className="text-sm text-muted-foreground">All tasks completed!</p>
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