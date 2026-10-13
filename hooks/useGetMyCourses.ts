import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { Course } from '@/types/course';
import { useCallback, useEffect, useState } from 'react';

type CourseListResponse = { courses: Course[] };

export const useGetMyCourse = () => {
    const { user, loading: authLoading } = useAuthUser();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = useCallback(async () => {
        if (!user) {
            setCourses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch(
                '/api/academy/mobile/courses/my?limit=100',
            );
            const result = (await response.json()) as CourseListResponse;
            setCourses(result.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) void fetchCourses();
    }, [authLoading, fetchCourses]);

    return { courses, loading, setLoading, fetchCourses };
};
