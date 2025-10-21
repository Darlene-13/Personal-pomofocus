import { useState } from "react";
import { Check, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Task } from "@shared/schema";

interface TaskListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskListProps) {
  const [newTask, setNewTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask("");
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold" data-testid="text-tasks-title">Tasks</h2>
        <div className="flex gap-4 text-sm" data-testid="text-task-counters">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{completedCount}</span> completed
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{pendingCount}</span> pending
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
          data-testid="input-new-task"
        />
        <Button type="submit" size="icon" data-testid="button-add-task">
          <Plus className="w-4 h-4" />
        </Button>
      </form>

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
              className={`p-4 flex items-center gap-3 group hover-elevate transition-all duration-200 ${
                task.completed ? "opacity-70" : ""
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
