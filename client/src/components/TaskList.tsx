import { useState } from "react";
import { Check, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Task } from "../../../server/db/schema";

interface TaskListProps {
    tasks: Task[];
    onAddTask: (text: string, priority: string) => void;
    onToggleTask: (id: number) => void;
    onDeleteTask: (id: number) => void;
}

export function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskListProps) {
    const [newTask, setNewTask] = useState("");
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim()) {
            onAddTask(newTask.trim(), priority);
            setNewTask("");
            setPriority('medium');
        }
    };

    const completedCount = tasks.filter((t) => t.completed).length;
    const pendingCount = tasks.length - completedCount;

    const getPriorityBadge = (priority: string | null) => {
        switch (priority) {
            case 'high':
                return 'border-red-200 bg-red-50 text-red-700';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50 text-yellow-700';
            case 'low':
                return 'border-blue-200 bg-blue-50 text-blue-700';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold" data-testid="text-tasks-title">
                    Tasks
                </h2>
                <div className="flex gap-4 text-sm" data-testid="text-task-counters">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{completedCount}</span> completed
          </span>
                    <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{pendingCount}</span> pending
          </span>
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                    placeholder="Add a new task..."
                    className="flex-1"
                    data-testid="input-new-task"
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <Button
                    onClick={handleSubmit}
                    size="icon"
                    data-testid="button-add-task"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-2">
                {tasks.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground" data-testid="text-empty-tasks">
                            No tasks yet. Add your first task to get started!
                        </p>
                    </Card>
                ) : (
                    tasks.map((task) => (
                        <Card
                            key={task.id}
                            className={`p-4 flex items-center gap-3 group hover:shadow-md transition-all duration-200 ${
                                task.completed ? "opacity-70 bg-muted" : ""
                            }`}
                            data-testid={`card-task-${task.id}`}
                        >
                            <button
                                onClick={() => onToggleTask(task.id)}
                                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                    task.completed
                                        ? "bg-green-500 border-green-500"
                                        : "border-muted-foreground hover:border-primary"
                                }`}
                                data-testid={`button-toggle-task-${task.id}`}
                            >
                                {task.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span
                                className={`flex-1 transition-all duration-200 ${
                                    task.completed ? "line-through text-muted-foreground" : ""
                                }`}
                                data-testid={`text-task-${task.id}`}
                            >
                {task.text}
              </span>
                            <span
                                className={`text-xs px-2 py-1 rounded-full border ${getPriorityBadge(
                                    task.priority
                                )}`}
                            >
                {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
              </span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onDeleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                                data-testid={`button-delete-task-${task.id}`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}