'use client';

import NoCourse from '@/components/Courses/noCourse';
import CourseCardSkeleton from '@/components/skeletons/CourseCardSkeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { downloadCoursePDF_Office } from '@/helpers/downloadCourse';
import { useFavoriteCourse } from '@/hooks/useFavoriteCourse';
import { useAuthUser } from '@/hooks/useAuthUser';
import { isCourseOwnerEmail } from '@/lib/courseOwnership';
import { apiFetch } from '@/lib/api-client';
import { CoursesQuery } from '@/lib/firestore/courseQueries';
import { Course } from '@/types/course';
import { formatParagraph } from '@/utils/formatParagraph';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Download,
    FileQuestion,
    Heart,
    Layers3,
    LibraryBig,
    LockKeyhole,
    PlayCircle,
    Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const CourseView = () => {
    const router = useRouter();
    const params = useParams();
    const mainWrapperRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthUser();
    const { fetchCourseById, fetchingCourseById } = CoursesQuery();
    const [course, setCourse] = useState<Course | null>(null);
    const [enrolling, setEnrolling] = useState(false);
    const { isFavorite, favoritePending, toggleFavorite } = useFavoriteCourse(
        course,
        user,
    );

    useEffect(() => {
        const id = params.id;
        if (!id || Array.isArray(id)) return;

        const fetchData = async () => {
            const courseData = await fetchCourseById(id);
            setCourse(courseData);
        };

        fetchData();
    }, [params.id, fetchCourseById]);

    const enrollCourse = async () => {
        if (!course || !user) return;

        const rootCourseId = course.originalCourseId ?? course.id;

        try {
            setEnrolling(true);
            if (isCourseOwnerEmail(course.createdBy, user.email)) {
                toast.error("You can't enroll in your own course.");
                router.replace(`/courses/my-courses/course-view/${course.id}`);
                return;
            }

            const response = await apiFetch(
                `/api/academy/mobile/courses/${encodeURIComponent(rootCourseId)}/enroll`,
                { method: 'POST' },
            );
            const result = (await response.json()) as {
                course: Course;
                alreadyEnrolled: boolean;
            };
            toast.success(
                result.alreadyEnrolled
                    ? 'You are already enrolled in this course.'
                    : 'Course enrolled successfully!',
            );
            router.replace(
                `/courses/my-courses/course-view/${result.course.id}`,
            );
        } catch (error) {
            console.error('Failed to enroll course:', error);
            toast.error('Failed to enroll. Please try again.');
        } finally {
            setEnrolling(false);
        }
    };

    const handleClick = () => {
        if (!course) return;
        if (isCourseOwnerEmail(course?.createdBy, user?.email)) {
            router.push(`/courses/my-courses/course-view/${course?.id}`);
            return;
        } else {
            toast.error('Please enroll in the course first.');
            if (mainWrapperRef.current) {
                mainWrapperRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                });
            }
            return;
        }
    };

    if (fetchingCourseById) {
        return <CourseCardSkeleton />;
    }
    if (!course) {
        return <NoCourse />;
    }

    const lessonCount = course.chapters.reduce(
        (count, chapter) => count + (chapter.content?.length || 0),
        0,
    );
    const isOwner = isCourseOwnerEmail(course.createdBy, user?.email);
    const rootCourseId = course.originalCourseId ?? course.id;
    const previewChapters = course.chapters.slice(0, 6);

    return (
        <main ref={mainWrapperRef} className="mx-auto max-w-6xl space-y-6 p-4">
            <section className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="grid min-h-[520px] lg:grid-cols-[1fr_360px]">
                    <div className="relative min-h-[420px]">
                        {course.banner_image && (
                            <Image
                                fill
                                priority
                                src={course.banner_image}
                                alt={course.courseTitle}
                                className="object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
                        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                            <div className="max-w-3xl space-y-5 text-white">
                                <div className="flex flex-wrap items-center gap-2">
                                    {course.category && (
                                        <Badge
                                            onClick={() =>
                                                router.push(
                                                    `/courses/search?query=${encodeURIComponent(course.category)}`,
                                                )
                                            }
                                            className="cursor-pointer border-white/20 bg-white/15 text-white backdrop-blur hover:bg-primary"
                                        >
                                            {course.category}
                                        </Badge>
                                    )}
                                    <Badge className="bg-primary text-primary-foreground">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        AI learning path
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
                                        {course.courseTitle}
                                    </h1>
                                    <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                                        {course.description ||
                                            'A guided course built to help you learn step by step.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        size="lg"
                                        onClick={
                                            isOwner ? handleClick : enrollCourse
                                        }
                                        disabled={enrolling}
                                        className="cursor-pointer"
                                    >
                                        {isOwner ? (
                                            <>
                                                <PlayCircle className="h-4 w-4" />
                                                Open Course
                                            </>
                                        ) : (
                                            <>
                                                <LibraryBig className="h-4 w-4" />
                                                {enrolling
                                                    ? 'Enrolling...'
                                                    : 'Enroll Now'}
                                            </>
                                        )}
                                    </Button>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="lg"
                                                variant="secondary"
                                                onClick={() =>
                                                    downloadCoursePDF_Office(
                                                        course,
                                                    )
                                                }
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Download course
                                        </TooltipContent>
                                    </Tooltip>
                                    <Button
                                        size="lg"
                                        variant={isFavorite ? 'default' : 'secondary'}
                                        onClick={toggleFavorite}
                                        disabled={favoritePending}
                                        aria-pressed={isFavorite}
                                    >
                                        <Heart
                                            className={`h-4 w-4 ${
                                                isFavorite ? 'fill-current' : ''
                                            }`}
                                        />
                                        {isFavorite
                                            ? 'In Favourites'
                                            : 'Add to Favourites'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="flex flex-col justify-between gap-6 border-t bg-background/95 p-5 lg:border-l lg:border-t-0">
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-primary">
                                Course preview
                            </p>
                            <div className="grid gap-3">
                                <StatCard
                                    icon={Layers3}
                                    label="Chapters"
                                    value={course.chapters.length}
                                />
                                <StatCard
                                    icon={BookOpen}
                                    label="Lessons"
                                    value={lessonCount}
                                />
                                <StatCard
                                    icon={FileQuestion}
                                    label="Practice prompts"
                                    value={
                                        (course.quiz?.length || 0) +
                                        (course.qa?.length || 0) +
                                        (course.flashcards?.length || 0)
                                    }
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {isOwner ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <LockKeyhole className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-base font-semibold">
                                        {isOwner
                                            ? 'Ready in your library'
                                            : 'Enroll to start learning'}
                                    </h2>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {isOwner
                                            ? 'You created this course, so you can open the full learning path anytime.'
                                            : 'Enrollment adds a personal copy to your courses and unlocks the lessons.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <LearningFeature
                    icon={BookOpen}
                    title="Guided roadmap"
                    description="Move through clear chapters in a practical learning order."
                />
                <LearningFeature
                    icon={Sparkles}
                    title="AI generated"
                    description="Built around your topic with explanations, examples, and practice."
                />
                <LearningFeature
                    icon={Download}
                    title="Offline friendly"
                    description="Download the course when you want a portable copy."
                />
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Learning path
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight">
                            What you will cover
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {course.chapters.length} chapters in this course
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {previewChapters.map((chapter, idx) => {
                        const preview =
                            chapter.content?.[0]?.explain ||
                            chapter.content?.[0]?.topic ||
                            '';

                        return (
                            <button
                                type="button"
                                onClick={handleClick}
                                key={`${chapter.chapterName}-${idx}`}
                                className="group flex min-h-56 flex-col rounded-xl border bg-card p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                                        {idx + 1}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="bg-background"
                                    >
                                        {chapter.content?.length || 0} lessons
                                    </Badge>
                                </div>

                                <div className="mt-4 flex-1">
                                    <h3 className="line-clamp-2 text-base font-semibold">
                                        {chapter.chapterName}
                                    </h3>
                                    {preview && (
                                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                                            {formatParagraph(preview)}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t pt-3">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {isOwner
                                            ? 'Open chapter'
                                            : 'Enroll to unlock'}
                                    </span>
                                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition group-hover:translate-x-1">
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {course.chapters.length > previewChapters.length && (
                    <div className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                        {course.chapters.length - previewChapters.length} more
                        chapters are included after enrollment.
                    </div>
                )}
            </section>

            {!isOwner && (
                <section className="sticky bottom-4 z-10 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold">
                                Start {course.courseTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Course ID: {rootCourseId}
                            </p>
                        </div>
                        <Button
                            disabled={enrolling}
                            onClick={enrollCourse}
                            className="cursor-pointer"
                        >
                            <LibraryBig className="h-4 w-4" />
                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                        </Button>
                    </div>
                </section>
            )}
        </main>
    );
};

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number | string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

function LearningFeature({
    icon: Icon,
    title,
    description,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <Card>
            <CardContent className="flex gap-3 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default CourseView;
