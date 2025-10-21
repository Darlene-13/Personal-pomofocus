import { useState, useEffect } from 'react';

const NATURE_KEYWORDS = [
    'nature',
    'forest',
    'mountains',
    'ocean',
    'sunset',
    'sunrise',
    'lake',
    'landscape',
    'wilderness',
    'zen garden',
    'tech'
];

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
export const useBackgroundImage = (changeInterval: number = 300000) => { // 5 minutes
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchNewImage = async () => {
        try {
            const randomKeyword = NATURE_KEYWORDS[Math.floor(Math.random() * NATURE_KEYWORDS.length)];

            const response = await fetch(
                `https://api.unsplash.com/photos/random?query=${randomKeyword}&orientation=landscape`,
                {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                }
            );

            const data = await response.json();
            setImageUrl(data.urls.regular);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch background image:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNewImage();
        const interval = setInterval(fetchNewImage, changeInterval);
        return () => clearInterval(interval);
    }, [changeInterval]);

    const changeImage = () => {
        fetchNewImage();
    };

    return { imageUrl, isLoading, changeImage };
};