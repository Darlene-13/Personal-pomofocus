import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle, Target } from "lucide-react";
import { Session, Task } from "@shared/schema";

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
    
    return {
      day: dayName,
      hours: Number((totalMinutes / 60).toFixed(1)),
    };
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  const taskData = [
    { name: "Completed", value: completedTasks, color: "hsl(var(--chart-1))" },
    { name: "Pending", value: pendingTasks, color: "hsl(var(--muted))" },
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6" data-testid="text-analytics-title">Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
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

          <Card className="p-6">
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

          <Card className="p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" data-testid="text-chart-daily-hours-title">
            Daily Focus Hours (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar 
                dataKey="hours" 
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" data-testid="text-chart-task-completion-title">
            Task Completion
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
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
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
