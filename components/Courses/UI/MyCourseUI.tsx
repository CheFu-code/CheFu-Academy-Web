'use client';

import Header from '@/components/Shared/Header';
import CourseCard from '@/components/Shared/CourseCard';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getApiUrl } from '@/lib/api-url';
import { Course } from '@/types/course';
import HomeCourseCard from '../HomeCourseCard';
import {
    ArrowDownAZ,
    Clock3,
    PlayCircle,
    PlusSquare,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type SortOption =
    | 'last-opened'
    | 'newest'
    | 'progress'
    | 'completed'
    | 'title'
    | 'category';

type TimestampLike = {
    seconds?: number;
    toDate?: () => Date;
};

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'last-opened', label: 'Last opened' },
    { value: 'newest', label: 'Newest created' },
    { value: 'progress', label: 'Most progress' },
    { value: 'completed', label: 'Completed first' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'category', label: 'Category A-Z' },
];

const toMillis = (value: unknown) => {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    const timestamp = value as TimestampLike;
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().getTime();
    }
    if (typeof timestamp.seconds === 'number') {
        return timestamp.seconds * 1000;
    }

    return 0;
};

const getProgress = (course: Course) => {
    const completedChapters = course.completedChapter?.length || 0;
    const totalChapters = course.chapters.length;

    return totalChapters > 0 ? completedChapters / totalChapters : 0;
};

const MyCourseUI = ({ courses }: { courses: Course[] }) => {
    const router = useRouter();
    const [sortBy, setSortBy] = useState<SortOption>('last-opened');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

    const categories = useMemo(
        () =>
            Array.from(
                new Set(
                    courses
                        .map((course) => course.category?.trim())
                        .filter(Boolean),
                ),
            ).sort((a, b) => a.localeCompare(b)),
        [courses],
    );

    const visibleCourses = useMemo(() => {
        const filtered =
            categoryFilter === 'all'
                ? courses
                : courses.filter((course) => course.category === categoryFilter);

        return [...filtered].sort((a, b) => {
            if (sortBy === 'last-opened') {
                return toMillis(b.lastStudiedAt) - toMillis(a.lastStudiedAt);
            }

            if (sortBy === 'newest') {
                return toMillis(b.createdOn) - toMillis(a.createdOn);
            }

            if (sortBy === 'progress') {
                return getProgress(b) - getProgress(a);
            }

            if (sortBy === 'completed') {
                return Number(getProgress(b) === 1) - Number(getProgress(a) === 1);
            }

            if (sortBy === 'category') {
                return (a.category || '').localeCompare(b.category || '');
            }

            return (a.courseTitle || '').localeCompare(b.courseTitle || '');
        });
    }, [categoryFilter, courses, sortBy]);

    const continueCourse = useMemo(
        () =>
            [...courses]
                .filter(course => course.lastStudiedAt)
                .sort((a, b) => toMillis(b.lastStudiedAt) - toMillis(a.lastStudiedAt))[0],
        [courses],
    );

    const focusCategory = categories[0] || '';

    useEffect(() => {
        let cancelled = false;

        const fetchRecommendations = async () => {
            if (!focusCategory) return;

            const response = await fetch(
                getApiUrl('/api/academy/mobile/courses?limit=80'),
                { credentials: 'include' },
            );
            if (!response.ok) {
                throw new Error(`Failed to load recommendations (${response.status}).`);
            }
            const result = (await response.json()) as { courses: Course[] };
            const ownedIds = new Set(
                courses.map(course => course.originalCourseId || course.id),
            );
            const nextCourses = result.courses
                .filter(
                    course =>
                        !course.enrolled &&
                        !course.originalCourseId &&
                        !ownedIds.has(course.id) &&
                        course.category === focusCategory,
                )
                .sort(
                    (a, b) =>
                        (b.averageRating || 0) - (a.averageRating || 0) ||
                        (b.reviewCount || 0) - (a.reviewCount || 0),
                )
                .slice(0, 3);

            if (!cancelled) setRecommendedCourses(nextCourses as Course[]);
        };

        void fetchRecommendations();

        return () => {
            cancelled = true;
        };
    }, [courses, focusCategory]);

    return (
        <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <Header
                    header="My Courses"
                    description="Your active learning journey"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card/60 p-2">
                        <div className="flex items-center gap-2 px-1 text-sm font-medium text-muted-foreground">
                            <SlidersHorizontal className="size-4" />
                            Sort
                        </div>
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as SortOption)}
                        >
                            <SelectTrigger className="w-[170px] bg-background">
                                <SelectValue placeholder="Sort courses" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger className="w-[170px] bg-background">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={() => router.push('/courses/create-course')}
                        variant="outline"
                        className="cursor-pointer"
                    >
                        <PlusSquare className="size-5" />
                        New course
                    </Button>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-4" />
                    {visibleCourses.length} course
                    {visibleCourses.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1">
                    <ArrowDownAZ className="size-4" />
                    {sortOptions.find((option) => option.value === sortBy)?.label}
                </span>
            </div>

            {continueCourse && (
                <section className="mt-5 rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">
                                Continue lesson
                            </p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight">
                                {continueCourse.courseTitle}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {continueCourse.lastStudiedChapterName || 'Resume your course'}
                                {continueCourse.lastStudiedTopic
                                    ? ` - ${continueCourse.lastStudiedTopic}`
                                    : ''}
                            </p>
                        </div>
                        <Button
                            onClick={() =>
                                router.push(
                                    `/courses/my-courses/course-view/${continueCourse.id}/course-learning?chapter=${continueCourse.lastStudiedChapterIndex || 0}&lesson=${continueCourse.lastStudiedContentIndex || 0}`,
                                )
                            }
                        >
                            <PlayCircle className="size-4" />
                            Continue
                        </Button>
                    </div>
                </section>
            )}

            {recommendedCourses.length > 0 && (
                <section className="mt-5 space-y-3">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-primary">
                            <Sparkles className="size-4" />
                            Because you studied {focusCategory}
                        </p>
                        <h2 className="text-xl font-bold tracking-tight">
                            Recommended next
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {recommendedCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                bannerImage={course.banner_image}
                                title={course.courseTitle}
                                description={course.description}
                                chaptersCount={course.chapters?.length || 0}
                                category={course.category}
                                qualityLabel={`${(course.averageRating || 0).toFixed(1)} stars`}
                            />
                        ))}
                    </div>
                </section>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCourses.map((course) => {
                    const completedChapters =
                        course?.completedChapter?.length || 0;
                    const totalChapters = course.chapters.length;
                    const progress =
                        totalChapters > 0
                            ? (completedChapters / totalChapters) * 100
                            : 0;

                    return (
                        <HomeCourseCard
                            key={course.id}
                            id={course.id}
                            banner_image={course.banner_image}
                            courseTitle={course.courseTitle}
                            category={course.category}
                            totalChapters={totalChapters}
                            completedChapters={completedChapters}
                            progress={progress}
                            lastStudiedAt={course.lastStudiedAt}
                            lastStudiedChapterIndex={course.lastStudiedChapterIndex}
                            lastStudiedContentIndex={course.lastStudiedContentIndex}
                            lastStudiedChapterName={course.lastStudiedChapterName}
                            lastStudiedTopic={course.lastStudiedTopic}
                            course={course}
                        />
                    );
                })}
            </div>
        </>
    );
};

export default MyCourseUI;
