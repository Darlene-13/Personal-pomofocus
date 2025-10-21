import { Play, Pause, RotateCcw, Clock, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "./CircularProgress";

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  isBreak: boolean;
  onPlayPause: () => void;
  onReset: () => void;
}

export function TimerDisplay({
  timeLeft,
  totalTime,
  isRunning,
  isBreak,
  onPlayPause,
  onReset,
}: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Badge 
        variant={isBreak ? "secondary" : "default"}
        className="px-6 py-2 text-sm font-medium rounded-full"
        data-testid="badge-timer-status"
      >
        {isBreak ? (
          <>
            <Coffee className="w-4 h-4 mr-2" />
            Break Time
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 mr-2" />
            Focus Time
          </>
        )}
      </Badge>

      <div className="relative flex items-center justify-center">
        <CircularProgress progress={progress} size={320} strokeWidth={12} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div 
              className="font-accent font-bold text-8xl tabular-nums tracking-tight"
              style={{ color: "hsl(var(--primary))" }}
              data-testid="text-timer-display"
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          onClick={onReset}
          className="h-12 w-12 rounded-full"
          data-testid="button-timer-reset"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          size="default"
          onClick={onPlayPause}
          className="h-14 w-14 rounded-full"
          data-testid="button-timer-play-pause"
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
