import { useAuthUser } from '@/hooks/useAuthUser';
import { getApiUrl } from '@/lib/api-url';
import { Course } from '@/types/course';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type CourseListResponse = {
    courses: Course[];
    nextCursor: string | null;
    total: number;
};

const isCanonicalCourse = (course: Course) =>
    !course.enrolled && !course.originalCourseId;

async function fetchCourseList(path: string) {
    const response = await fetch(getApiUrl(path), { credentials: 'include' });
    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
            | { message?: string; error?: string }
            | null;
        throw new Error(
            data?.message || data?.error || 'Failed to load courses.',
        );
    }
    return (await response.json()) as CourseListResponse;
}

export const CoursesQuery = () => {
    const { user } = useAuthUser();
    const [courses, setCourses] = useState<Course[]>([]);
    const [fetchingCourses, setFetchingCourses] = useState(true);
    const [fetchingCourseById, setFetchingCourseById] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchCourses = useCallback(async () => {
        if (!user?.email) {
            setCourses([]);
            setNextCursor(null);
            setHasMore(false);
            setFetchingCourses(false);
            return;
        }

        setFetchingCourses(true);
        try {
            const result = await fetchCourseList(
                '/api/academy/mobile/courses?limit=10',
            );
            const visibleCourses = result.courses.filter(
                course =>
                    isCanonicalCourse(course) &&
                    course.createdBy?.toLowerCase() !== user.email.toLowerCase(),
            );
            setCourses(visibleCourses);
            setNextCursor(result.nextCursor);
            setHasMore(Boolean(result.nextCursor));
        } catch (error) {
            console.error('Failed to load courses:', error);
            toast.error('Failed to load courses.');
        } finally {
            setFetchingCourses(false);
        }
    }, [user?.email]);

    const fetchSearchedCourses = useCallback(
        async (search = ''): Promise<Course[]> => {
            const params = new URLSearchParams({ limit: '100' });
            if (search.trim()) params.set('query', search.trim());
            const result = await fetchCourseList(
                `/api/academy/mobile/courses?${params.toString()}`,
            );
            return result.courses.filter(isCanonicalCourse);
        },
        [],
    );

    const fetchMoreCourses = useCallback(async () => {
        if (!nextCursor || loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const params = new URLSearchParams({
                cursor: nextCursor,
                limit: '10',
            });
            const result = await fetchCourseList(
                `/api/academy/mobile/courses?${params.toString()}`,
            );
            const visibleCourses = result.courses.filter(
                course =>
                    isCanonicalCourse(course) &&
                    course.createdBy?.toLowerCase() !== user?.email?.toLowerCase(),
            );
            setCourses(previous => [...previous, ...visibleCourses]);
            setNextCursor(result.nextCursor);
            setHasMore(Boolean(result.nextCursor));
        } catch (error) {
            console.error('Failed to load more courses:', error);
            toast.error('Failed to load more courses.');
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor, user?.email]);

    const fetchCourseById = useCallback(
        async (id: string): Promise<Course | null> => {
            if (!user?.email || !id) return null;

            setFetchingCourseById(true);
            try {
                const response = await fetch(
                    getApiUrl(
                        `/api/academy/mobile/courses/${encodeURIComponent(id)}`,
                    ),
                    { credentials: 'include' },
                );
                if (response.status === 404) return null;
                if (!response.ok) {
                    throw new Error(`Failed to load course (${response.status}).`);
                }
                return (await response.json()) as Course;
            } catch (error) {
                console.error('Failed to load course:', error);
                toast.error('Failed to load course.');
                return null;
            } finally {
                setFetchingCourseById(false);
            }
        },
        [user?.email],
    );

    return {
        user,
        fetchCourses,
        fetchMoreCourses,
        courses,
        setCourses,
        hasMore,
        setHasMore,
        fetchingCourses,
        setFetchingCourses,
        loadingMore,
        fetchCourseById,
        fetchingCourseById,
        setFetchingCourseById,
        fetchSearchedCourses,
    };
};
