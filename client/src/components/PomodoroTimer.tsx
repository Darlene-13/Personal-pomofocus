// src/components/PomodoroTimer.tsx
import { TimerDisplay } from './TimerDisplay';

interface PomodoroTimerProps {
    timeLeft: number;
    totalTime: number;
    isRunning: boolean;
    isBreak: boolean;
    onPlayPause: () => void;
    onReset: () => void;
}

export function PomodoroTimer({
                                  timeLeft,
                                  totalTime,
                                  isRunning,
                                  isBreak,
                                  onPlayPause,
                                  onReset,
                              }: PomodoroTimerProps) {
    return (
        <div className="space-y-8">
            <TimerDisplay
                timeLeft={timeLeft}
                totalTime={totalTime}
                isRunning={isRunning}
                isBreak={isBreak}
                onPlayPause={onPlayPause}
                onReset={onReset}
            />
        </div>
    );
}