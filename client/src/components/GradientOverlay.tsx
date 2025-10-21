import React from 'react';

interface GradientOverlayProps {
    variant?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export const GradientOverlay: React.FC<GradientOverlayProps> = ({ variant = 'morning' }) => {
    const gradients = {
        morning: 'from-orange-100/50 via-yellow-50/30 to-blue-100/50',
        afternoon: 'from-blue-100/50 via-cyan-50/30 to-teal-100/50',
        evening: 'from-purple-100/50 via-pink-50/30 to-orange-100/50',
        night: 'from-indigo-900/50 via-purple-900/30 to-blue-900/50',
    };

    return (
        <div
            className={`fixed inset-0 bg-gradient-to-br ${gradients[variant]} pointer-events-none transition-all duration-1000`}
        />
    );
};