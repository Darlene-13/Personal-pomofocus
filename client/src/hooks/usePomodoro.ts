import { useState, useEffect, useCallback } from 'react';

interface PomodoroState {
    timeLeft: number;
    totalTime: number;
    isRunning: boolean;
    isBreak: boolean;
}

export const usePomodoro = (
    workDuration = 25 * 60,
    breakDuration = 5 * 60,
    onAccumulatedTime?: (duration: number, type: 'work' | 'break') => void
) => {
    const [state, setState] = useState<PomodoroState>(() => {
        const saved = localStorage.getItem('pomodoroState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...parsed, isRunning: false };
            } catch {
                // Fall back to default
            }
        }
        return {
            timeLeft: workDuration,
            totalTime: workDuration,
            isRunning: false,
            isBreak: false,
        };
    });

    const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
    const [accumulatedTime, setAccumulatedTime] = useState(0);

    // Main timer loop
    useEffect(() => {
        if (!state.isRunning) return;

        const initialTimestamp = startTimestamp || Date.now();
        if (!startTimestamp) setStartTimestamp(initialTimestamp);

        let frameId: number;

        const tick = () => {
            const elapsed = Math.floor((Date.now() - initialTimestamp) / 1000);
            const newTimeLeft = Math.max(0, state.totalTime - elapsed);

            if (newTimeLeft <= 0) {
                // Timer finished - full session completed
                setState(prev => ({
                    ...prev,
                    timeLeft: 0,
                    isRunning: false,
                    isBreak: !prev.isBreak,
                    totalTime: !prev.isBreak ? breakDuration : workDuration,
                }));
                setStartTimestamp(null);
                setAccumulatedTime(0); // Reset accumulated time on completion
            } else {
                setState(prev => ({ ...prev, timeLeft: newTimeLeft }));
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [state.isRunning, startTimestamp, state.totalTime, workDuration, breakDuration]);

    // Save to localStorage before unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem('pomodoroState', JSON.stringify(state));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state]);

    const onPlayPause = useCallback(() => {
        setState(prev => {
            const newIsRunning = !prev.isRunning;

            // When pausing (transitioning from running to not running)
            if (prev.isRunning && !newIsRunning) {
                const timeSpent = prev.totalTime - prev.timeLeft;

                // Only save if at least 1 minute (60 seconds) has been spent
                if (timeSpent >= 60 && onAccumulatedTime) {
                    onAccumulatedTime(timeSpent, prev.isBreak ? 'break' : 'work');
                }
            }

            return { ...prev, isRunning: newIsRunning };
        });
        setStartTimestamp(null);
    }, [onAccumulatedTime]);

    const onReset = useCallback(() => {
        setState(prev => ({
            ...prev,
            timeLeft: prev.isBreak ? breakDuration : workDuration,
            totalTime: prev.isBreak ? breakDuration : workDuration,
            isRunning: false,
        }));
        setStartTimestamp(null);
        setAccumulatedTime(0);
        localStorage.removeItem('pomodoroState');
    }, [workDuration, breakDuration]);

    return {
        ...state,
        accumulatedTime,
        onPlayPause,
        onReset,
    };
};