"use client";

import { apiFetch } from '@/lib/api-client';
import { Course } from '@/types/course';
import { User } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const getFavoriteCourseId = (course?: Course | null) =>
    course?.originalCourseId || course?.id || '';

export const useFavoriteCourse = (
    course?: Course | null,
    user?: User | null,
) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoritePending, setFavoritePending] = useState(false);
    const favoriteCourseId = getFavoriteCourseId(course);

    useEffect(() => {
        const favoriteIds = Array.isArray(user?.favoriteCourseIds)
            ? user.favoriteCourseIds.map(String)
            : [];

        setIsFavorite(
            Boolean(favoriteCourseId && favoriteIds.includes(favoriteCourseId)),
        );
    }, [favoriteCourseId, user?.favoriteCourseIds]);

    const toggleFavorite = useCallback(async () => {
        if (!course || !favoriteCourseId) return;

        if (!user?.email) {
            toast.error('Please sign in to add favourites.');
            return;
        }

        const nextIsFavorite = !isFavorite;

        try {
            setFavoritePending(true);
            const favoriteIds = Array.isArray(user.favoriteCourseIds)
                ? user.favoriteCourseIds.map(String)
                : [];
            const updatedFavoriteIds = nextIsFavorite
                ? [...new Set([...favoriteIds, favoriteCourseId])]
                : favoriteIds.filter(id => id !== favoriteCourseId);
            await apiFetch('/api/academy/mobile/me', {
                method: 'PATCH',
                body: JSON.stringify({ favoriteCourseIds: updatedFavoriteIds }),
            });

            setIsFavorite(nextIsFavorite);
            toast.success(
                nextIsFavorite
                    ? 'Course added to favourites.'
                    : 'Course removed from favourites.',
            );
        } catch (error) {
            console.error('Failed to update favourites:', error);
            toast.error('Could not update favourites. Please try again.');
        } finally {
            setFavoritePending(false);
        }
    }, [course, favoriteCourseId, isFavorite, user?.email]);

    return {
        isFavorite,
        favoritePending,
        toggleFavorite,
    };
};
