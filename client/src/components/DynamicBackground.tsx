import React, { ReactNode } from 'react';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { GradientOverlay } from './GradientOverlay';
import { useBackgroundImage } from "@/hooks/useBackgroundImage";
import { RefreshCw } from "lucide-react";

interface DynamicBackgroundProps {
    children: ReactNode;
    opacity?: number;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
                                                                        children,
                                                                        opacity = 0.2
                                                                    }) => {
    const { imageUrl, changeImage, isLoading } = useBackgroundImage();
    const timeOfDay = useTimeOfDay();

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Nature Background Image */}
            {imageUrl && (
                <div
                    className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 animate-ken-burns"
                    style={{
                        backgroundImage: `url(${imageUrl})`,
                        opacity: opacity,
                    }}
                />
            )}

            {/* Time-based Gradient Overlay */}
            <GradientOverlay variant={timeOfDay} />

            {/* Glassmorphism Effect */}
            <div className="fixed inset-0 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Controls */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
                <button
                    onClick={changeImage}
                    disabled={isLoading}
                    className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full shadow-lg transition-all disabled:opacity-50"
                    title="Change background"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};