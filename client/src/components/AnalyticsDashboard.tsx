import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, Target, Download, TrendingUp, Calendar } from "lucide-react";
import { Session, Task } from "../../../server/db/schema";
import { exportSessionsToCSV, exportTasksToCSV } from '../lib/exportCSV';

interface AnalyticsDashboardProps {
    sessions: Session[];
    tasks: Task[];
}

export function AnalyticsDashboard({ sessions, tasks }: AnalyticsDashboardProps) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
    });

    const dailyHours = last7Days.map((date) => {
        const daySessions = sessions.filter((s) => s.date === date && s.type === "work");
        const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
        const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
        const fullDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

        return {
            day: dayName,
            fullDate: fullDate,
            hours: Number((totalMinutes / 60).toFixed(1)),
            minutes: totalMinutes,
            sessions: daySessions.length,
        };
    });

    const weekTotalMinutes = dailyHours.reduce((sum, day) => sum + day.minutes, 0);
    const weekTotalHours = (weekTotalMinutes / 60).toFixed(1);
    const weekTotalSessions = dailyHours.reduce((sum, day) => sum + day.sessions, 0);
    const weekAvgHours = (weekTotalMinutes / 7 / 60).toFixed(1);
    const weekAvgSessions = (weekTotalSessions / 7).toFixed(1);

    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    const taskData = [
        { name: "Completed", value: completedTasks, color: "hsl(var(--chart-1))" },
        { name: "Pending", value: pendingTasks, color: "hsl(var(--chart-2))" },
    ];

    const todaySessions = sessions.filter(
        (s) => s.date === new Date().toISOString().split("T")[0] && s.type === "work"
    );
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const todayHours = (todayMinutes / 60).toFixed(1);
    const todayCompleted = tasks.filter(
        (t) => t.completed && t.createdAt && new Date(t.createdAt).toISOString().split("T")[0] === new Date().toISOString().split("T")[0]
    ).length;
    const todayPomodoros = todaySessions.length;

    return (
        <div className="space-y-8 p-6">
            {/* Header with Export Buttons */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold" data-testid="text-analytics-title">
                    Analytics Dashboard
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportSessionsToCSV(sessions)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Download size={18} />
                        Export Sessions
                    </button>
                    <button
                        onClick={() => exportTasksToCSV(tasks)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Download size={18} />
                        Export Tasks
                    </button>
                </div>
            </div>

            {/* Today's Stats */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Today's Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Clock className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Focus Time Today</p>
                                <p className="text-4xl font-bold font-accent" data-testid="text-stat-focus-time">
                                    {todayHours}h
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <CheckCircle className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                                <p className="text-4xl font-bold font-accent" data-testid="text-stat-tasks-completed">
                                    {todayCompleted}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Target className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pomodoros</p>
                                <p className="text-4xl font-bold font-accent" data-testid="text-stat-pomodoros">
                                    {todayPomodoros}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Weekly Summary Stats */}
            <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Weekly Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
                        <p className="text-3xl font-bold text-primary">{weekTotalHours}h</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                        <p className="text-3xl font-bold text-primary">{weekTotalSessions}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Avg Hours/Day</p>
                        <p className="text-3xl font-bold text-primary">{weekAvgHours}h</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Avg Sessions/Day</p>
                        <p className="text-3xl font-bold text-primary">{weekAvgSessions}</p>
                    </div>
                </div>
            </Card>

            {/* Bar Chart - Daily Focus Hours */}
            <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-6" data-testid="text-chart-daily-hours-title">
                    Daily Focus Hours (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={dailyHours} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="day"
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: "14px", fontWeight: 500 }}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: "14px" }}
                            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                            formatter={(value: number, name: string) => {
                                if (name === 'hours') return [`${value} hours`, 'Focus Time'];
                                return [value, name];
                            }}
                        />
                        <Bar
                            dataKey="hours"
                            fill="url(#colorHours)"
                            radius={[12, 12, 0, 0]}
                            maxBarSize={80}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Pie Chart - Task Completion */}
            <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-6" data-testid="text-chart-task-completion-title">
                    Task Completion Overview
                </h3>
                <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                        <Pie
                            data={taskData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {taskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                fontSize: "14px",
                                paddingTop: "20px",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Card>

            {/* Table - Daily Breakdown */}
            <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Daily Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b">
                        <tr className="text-left">
                            <th className="pb-3 px-4 font-semibold text-muted-foreground">Day</th>
                            <th className="pb-3 px-4 font-semibold text-muted-foreground">Date</th>
                            <th className="pb-3 px-4 font-semibold text-muted-foreground text-right">Hours</th>
                            <th className="pb-3 px-4 font-semibold text-muted-foreground text-right">Minutes</th>
                            <th className="pb-3 px-4 font-semibold text-muted-foreground text-right">Sessions</th>
                            <th className="pb-3 px-4 font-semibold text-muted-foreground text-right">Avg/Session</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dailyHours.map((day, index) => (
                            <tr
                                key={index}
                                className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                            >
                                <td className="py-4 px-4 font-medium">{day.day}</td>
                                <td className="py-4 px-4 text-muted-foreground">{day.fullDate}</td>
                                <td className="py-4 px-4 text-right font-bold text-primary">
                                    {day.hours}h
                                </td>
                                <td className="py-4 px-4 text-right text-muted-foreground">
                                    {day.minutes} min
                                </td>
                                <td className="py-4 px-4 text-right font-medium">
                                    {day.sessions}
                                </td>
                                <td className="py-4 px-4 text-right text-muted-foreground">
                                    {day.sessions > 0 ? Math.round(day.minutes / day.sessions) : 0} min
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-primary/5 font-bold">
                            <td className="py-4 px-4" colSpan={2}>Total / Average</td>
                            <td className="py-4 px-4 text-right text-primary">{weekTotalHours}h</td>
                            <td className="py-4 px-4 text-right">{weekTotalMinutes} min</td>
                            <td className="py-4 px-4 text-right">{weekTotalSessions}</td>
                            <td className="py-4 px-4 text-right">
                                {weekTotalSessions > 0 ? Math.round(weekTotalMinutes / weekTotalSessions) : 0} min
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}