console.log('ENV Check:', import.meta.env.VITE_UNSPLASH_ACCESS_KEY);

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

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

interface Photographer {
    name: string;
    username: string;
}

export const useBackgroundImage = (changeInterval: number = 300000) => { // 5 minutes
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [photographer, setPhotographer] = useState<Photographer | null>(null);
    const [photoLink, setPhotoLink] = useState<string>('');

    const fetchNewImage = async () => {
        if (!UNSPLASH_ACCESS_KEY) {
            console.error('Unsplash API key is missing!');
            setIsLoading(false);
            return;
        }

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // REQUIRED: Trigger download endpoint for Unsplash API compliance
            if (data.links?.download_location) {
                fetch(data.links.download_location, {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                }).catch(err => console.error('Download trigger failed:', err));
            }

            // Set image data with null checks
            setImageUrl(data.urls?.regular || '');
            setPhotographer(data.user ? {
                name: data.user.name,
                username: data.user.username
            } : null);
            setPhotoLink(data.links?.html || '');
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
        setIsLoading(true);
        fetchNewImage();
    };

    return { imageUrl, isLoading, changeImage, photographer, photoLink };
};