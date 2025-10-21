import React from 'react';

interface GradientOverlayProps {
    variant?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export const GradientOverlay: React.FC<GradientOverlayProps> = ({ variant = 'morning' }) => {
    const gradients = {
        morning: 'from-amber-200/40 via-orange-100/30 to-yellow-100/40 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40',
        afternoon: 'from-sky-200/40 via-blue-100/30 to-cyan-100/40 dark:from-sky-900/40 dark:via-blue-900/30 dark:to-cyan-900/40',
        evening: 'from-purple-200/40 via-pink-100/30 to-rose-100/40 dark:from-purple-900/40 dark:via-pink-900/30 dark:to-rose-900/40',
        night: 'from-indigo-300/40 via-blue-200/30 to-purple-200/40 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-purple-950/40',
    };

    return (
        <div
            className={`fixed inset-0 bg-gradient-to-br ${gradients[variant]} pointer-events-none transition-all duration-1000 z-[1]`}
        />
    );
};