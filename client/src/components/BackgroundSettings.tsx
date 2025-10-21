import React, { useState } from 'react';
import { Settings, Image, Clock } from 'lucide-react';

interface BackgroundSettingsProps {
    opacity: number;
    onOpacityChange: (opacity: number) => void;
    changeInterval: number;
    onIntervalChange: (interval: number) => void;
}

export const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
                                                                          opacity,
                                                                          onOpacityChange,
                                                                          changeInterval,
                                                                          onIntervalChange,
                                                                      }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {isOpen && (
                <div className="absolute bottom-16 left-0 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                    <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">
                        Background Settings
                    </h3>

                    {/* Opacity Control */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                            <Image size={16} />
                            Background Opacity
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacity * 100}
                            onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
                            className="w-full"
                        />
                        <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
                    </div>

                    {/* Change Interval */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                            <Clock size={16} />
                            Change Every
                        </label>
                        <select
                            value={changeInterval}
                            onChange={(e) => onIntervalChange(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value={60000}>1 minute</option>
                            <option value={300000}>5 minutes</option>
                            <option value={600000}>10 minutes</option>
                            <option value={1800000}>30 minutes</option>
                            <option value={0}>Never (manual only)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};
