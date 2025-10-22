import { useState, useEffect, useCallback } from 'react';

interface PomodoroState {
    timeLeft: number;
    totalTime: number;
    isRunning: boolean;
    isBreak: boolean;
}

export const usePomodoro = (workDuration = 25 * 60, breakDuration = 5 * 60) => {
    const [state, setState] = useState<PomodoroState>(() => {
        // Restore from localStorage if available
        const saved = localStorage.getItem('pomodoroState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...parsed, isRunning: false }; // Always start paused
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

    // Use timestamp-based timing for background tabs
    const [startTimestamp, setStartTimestamp] = useState<number | null>(null);

    // Main timer loop - uses requestAnimationFrame instead of setInterval
    useEffect(() => {
        if (!state.isRunning) return;

        const initialTimestamp = startTimestamp || Date.now();
        if (!startTimestamp) setStartTimestamp(initialTimestamp);

        let frameId: number;

        const tick = () => {
            const elapsed = Math.floor((Date.now() - initialTimestamp) / 1000);
            const newTimeLeft = Math.max(0, state.totalTime - elapsed);

            if (newTimeLeft <= 0) {
                // Timer finished
                setState(prev => ({
                    ...prev,
                    timeLeft: 0,
                    isRunning: false,
                    isBreak: !prev.isBreak,
                    totalTime: !prev.isBreak ? breakDuration : workDuration,
                }));
                setStartTimestamp(null);
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
        setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
        setStartTimestamp(null);
    }, []);

    const onReset = useCallback(() => {
        setState(prev => ({
            ...prev,
            timeLeft: prev.isBreak ? breakDuration : workDuration,
            totalTime: prev.isBreak ? breakDuration : workDuration,
            isRunning: false,
        }));
        setStartTimestamp(null);
        localStorage.removeItem('pomodoroState');
    }, [workDuration, breakDuration]);

    return {
        ...state,
        onPlayPause,
        onReset,
    };
};