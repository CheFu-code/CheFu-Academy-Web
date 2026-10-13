'use client';

import CompletedLessonsUI from '@/components/Courses/UI/CompletedLessonsUI';
import Header from '@/components/Shared/Header';
import GridCourseCardSkeleton from '@/components/skeletons/GridCourseCardSkeleton';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { Course } from '@/types/course';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CompletedLessons() {
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
                    '/api/academy/mobile/courses/my?limit=100&status=completed',
                );
                const result = (await response.json()) as { courses: Course[] };
                const completed = result.courses.filter(
                    course =>
                        course.chapters.length > 0 &&
                        course.completedChapter?.length === course.chapters.length,
                );
                if (active) setCourses(completed);
            } catch (error) {
                console.error('Error fetching courses:', error);
                toast.error('Failed to fetch courses. Please try again later.');
            } finally {
                if (active) setLoading(false);
            }
        };

        void fetchCourses();
        return () => {
            active = false;
        };
    }, [authLoading, user]);

    if (loading) return <GridCourseCardSkeleton />;

    if (courses.length === 0)
        return (
            <>
                <Header
                    header="Completed Courses"
                    description="Your completed courses"
                />
                <div className="flex items-center justify-center h-full">
                    <p className="font-bold text-base sm:text-lg">
                        You haven&apos;t completed any course yet.
                    </p>
                </div>
            </>
        );

    return <CompletedLessonsUI courses={courses} />;
}
