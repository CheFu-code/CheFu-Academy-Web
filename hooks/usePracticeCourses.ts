'use client';

import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { Course } from '@/types/course';
import { useEffect, useState } from 'react';

type CourseListResponse = { courses: Course[] };

export const usePracticeCourses = () => {
    const { user, loading: authLoading } = useAuthUser();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setCourses([]);
            setLoading(false);
            return;
        }

        let active = true;
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await apiFetch(
                    '/api/academy/mobile/courses/my?limit=100',
                );
                const result = (await response.json()) as CourseListResponse;
                if (active) setCourses(result.courses);
            } catch (error) {
                console.error('Error fetching practice courses:', error);
                if (active) setCourses([]);
            } finally {
                if (active) setLoading(false);
            }
        };

        void fetchCourses();
        return () => {
            active = false;
        };
    }, [authLoading, user]);

    return { courses, loading };
};
