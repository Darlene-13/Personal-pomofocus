import React, { ReactNode } from 'react';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { GradientOverlay } from './GradientOverlay';
import { useBackgroundImage } from '@/hooks/useBackgroundImage';
import { RefreshCw } from 'lucide-react';

interface DynamicBackgroundProps {
    children: ReactNode;
    opacity?: number;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
                                                                        children,
                                                                        opacity = 0.15
                                                                    }) => {
    const { imageUrl, changeImage, isLoading } = useBackgroundImage();
    const timeOfDay = useTimeOfDay();

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Nature Background Image */}
            {imageUrl ? (
                <div
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 animate-ken-burns z-0"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        opacity: opacity,
                    }}
                />
            ) : (
                // Fallback gradient if no image
                <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 z-0" />
            )}

            {/* Time-based Gradient Overlay */}
            <GradientOverlay variant={timeOfDay} />

            {/* Glassmorphism Effect */}
            <div className="fixed inset-0 backdrop-blur-sm bg-white/60 dark:bg-gray-950/60 z-[2]" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Background Change Button */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
                <button
                    onClick={changeImage}
                    disabled={isLoading}
                    className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Change background image"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};