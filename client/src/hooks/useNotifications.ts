import { useEffect, useState } from 'react';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        }
        return 'denied';
    };

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            new Notification(title, {
                icon: '/icon.png',
                badge: '/badge.png',
                ...options,
            });
        }
    };

    const notifySessionComplete = (isBreak: boolean) => {
        sendNotification(
            isBreak ? 'Break time! 🎉' : 'Work session complete! ✅',
            {
                body: isBreak
                    ? 'Time to relax and recharge.'
                    : 'Great job! Take a well-deserved break.',
                tag: 'pomodoro-session',
            }
        );
    };

    return {
        permission,
        requestPermission,
        sendNotification,
        notifySessionComplete,
    };
};