import { useState, useEffect } from 'react';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const useTimeOfDay = (): TimeOfDay => {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    });

    useEffect(() => {
        const updateTimeOfDay = () => {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                setTimeOfDay('morning');
            } else if (hour >= 12 && hour < 17) {
                setTimeOfDay('afternoon');
            } else if (hour >= 17 && hour < 21) {
                setTimeOfDay('evening');
            } else {
                setTimeOfDay('night');
            }
        };

        // Update immediately and then every minute
        updateTimeOfDay();
        const interval = setInterval(updateTimeOfDay, 60000);

        // Save state before leaving
        const handleBeforeUnload = () => {
            localStorage.setItem('lastTimeOfDay', timeOfDay);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [timeOfDay]);

    return timeOfDay;
};