'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import NoCourse from '@/components/Courses/noCourse';
import CourseViewUI from '@/components/Courses/UI/CourseViewUI';
import CourseCardSkeleton from '@/components/skeletons/CourseCardSkeleton';
import { useFavoriteCourse } from '@/hooks/useFavoriteCourse';
import { useCourseFunctions } from '@/hooks/useCourseFunctions';
import { getApiUrl } from '@/lib/api-url';
import { canAccessCourseAsLearner } from '@/lib/courseOwnership';
import { Course } from '@/types/course';
import { toast } from 'sonner';

const CourseView = () => {
    const params = useParams();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [course, setCourse] = useState<Course | undefined>();
    const [loading, setLoading] = useState(true);
    const {
        user,
        router,
        handleChapterClick,
        completedChaptersState,
        setCompletedChaptersState,
    } = useCourseFunctions(course);
    const { isFavorite, favoritePending, toggleFavorite } = useFavoriteCourse(
        course,
        user,
    );

    useEffect(() => {
        setCompletedChaptersState(course?.completedChapter || []);
    }, [course?.completedChapter, setCompletedChaptersState]);

    useEffect(() => {
        if (!courseId) return;

        let cancelled = false;

        const fetchCourse = async () => {
            try {
                setLoading(true);
                setCourse(undefined);

                const response = await fetch(
                    getApiUrl(
                        `/api/academy/mobile/courses/${encodeURIComponent(courseId)}`,
                    ),
                    { credentials: 'include' },
                );

                if (cancelled) return;

                if (response.status === 404) {
                    setCourse(undefined);
                } else if (!response.ok) {
                    throw new Error(`Failed to load course (${response.status}).`);
                } else {
                    setCourse((await response.json()) as Course);
                }
            } catch (error) {
                console.error('Failed to fetch course:', error);
                toast.error('Failed to load course. Please try again.');
                if (!cancelled) setCourse(undefined);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchCourse();

        return () => {
            cancelled = true;
        };
    }, [courseId]);

    useEffect(() => {
        if (!user || loading) return;
        if (course && !canAccessCourseAsLearner(course, user)) {
            toast.error('You are not authorized to view this course!');
            router.replace('/courses');
        }
    }, [user, course, loading, router]);

    if (loading) return <CourseCardSkeleton />;
    if (!course) return <NoCourse />;

    const completedChapters = course.completedChapter?.length || 0;
    const totalChapters = course.chapters?.length || 0;
    const progress =
        totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    return (
        <CourseViewUI
            course={course}
            completedChapters={completedChapters}
            totalChapters={totalChapters}
            progress={progress}
            handleChapterClick={handleChapterClick}
            completedChaptersState={completedChaptersState}
            isFavorite={isFavorite}
            favoritePending={favoritePending}
            toggleFavorite={toggleFavorite}
            router={router}
        />
    );
};

export default CourseView;
