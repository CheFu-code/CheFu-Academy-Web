import EmailVerificationBanner from '@/components/Auth/EmailVerificationBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSessionMeta } from '@/lib/server-session';
import {
    fetchCoursesServer,
    fetchMyCoursesServer,
    fetchRecommendedCoursesForUserServer,
    fetchSmartResumeCourseServer,
} from '@/services/serverCourseService';
import { fetchPublicVideosServer } from '@/services/serverVideoService';
import type { Course } from '@/types/course';
import {
    BookOpen,
    Brain,
    Clock3,
    GraduationCap,
    Layers3,
    Plus,
    Sparkles,
    Flame,
    Star,
    Target,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Dashboard | CheFu Academy',
    description: 'Continue learning, practice, and explore CheFu Academy content.',
};

export default async function DashboardPage() {
    const [session, courses, videos] = await Promise.all([
        getServerSessionMeta(),
        fetchCoursesServer(6),
        fetchPublicVideosServer(),
    ]);
    const [smartResumeCourse, myCourses, recommended] = await Promise.all([
        fetchSmartResumeCourseServer(session?.email),
        fetchMyCoursesServer(session?.email),
        fetchRecommendedCoursesForUserServer(session?.email, 3),
    ]);
    const completedCourses = myCourses.filter(course => isCourseComplete(course));
    const activeCourses = myCourses.length - completedCourses.length;
    const focusCategory = getFocusCategory(myCourses);
    const streak = getLearningStreak(myCourses);
    const weeklyCompleted = getWeeklyCompletedChapters(myCourses);
    const weeklyGoal = 5;
    const featuredCourses = getDashboardRecommendations(
        courses,
        focusCategory,
    ).slice(0, 3);
    const featuredVideos = videos.slice(0, 3);
    const firstName =
        session?.name?.split(' ')[0] ||
        session?.email?.split('@')[0]?.replace(/[._-]+/g, ' ') ||
        'learner';

    return (
        <main className="flex flex-col gap-6">
            <EmailVerificationBanner />

            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-medium text-primary">
                                Learning dashboard
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                                Welcome back, {firstName}
                            </h1>
                            <p className="mt-3 text-muted-foreground">
                                Pick up where you left off, create a new course,
                                or jump into focused practice.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/courses/create-course">
                                    <Plus className="size-4" />
                                    Create Course
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/courses">Browse Courses</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="size-4 text-primary" />
                            {smartResumeCourse
                                ? 'Continue Where You Left Off'
                                : 'Next Best Step'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {smartResumeCourse ? (
                            <>
                                <div>
                                    <p className="line-clamp-1 text-sm font-medium">
                                        {smartResumeCourse.courseTitle}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                        {smartResumeCourse.lastStudiedChapterName ||
                                            'Resume your course'}
                                        {smartResumeCourse.lastStudiedTopic
                                            ? ` - ${smartResumeCourse.lastStudiedTopic}`
                                            : ''}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last studied {formatDashboardDate(
                                        smartResumeCourse.lastStudiedAt,
                                    )}
                                </p>
                                <Button variant="secondary" asChild>
                                    <Link
                                        href={`/courses/my-courses/course-view/${smartResumeCourse.id}/course-learning?chapter=${smartResumeCourse.lastStudiedChapterIndex || 0}&lesson=${smartResumeCourse.lastStudiedContentIndex || 0}`}
                                    >
                                        Continue Learning
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Build momentum with a short practice session
                                    or a beginner-friendly video.
                                </p>
                                <Button variant="secondary" asChild>
                                    <Link href="/courses/practice">Start Practice</Link>
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={BookOpen}
                    label="Your active courses"
                    value={activeCourses}
                />
                <StatCard
                    icon={Target}
                    label="Completed courses"
                    value={completedCourses.length}
                />
                <StatCard
                    icon={Brain}
                    label="Weekly chapters"
                    value={weeklyCompleted}
                />
                <StatCard
                    icon={Flame}
                    label="Learning streak"
                    value={streak}
                />
            </section>

            <section className="grid gap-4 md:grid-cols-[1fr_280px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="size-5 text-primary" />
                            Weekly Goal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-3xl font-bold">
                                    {weeklyCompleted}/{weeklyGoal}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    chapters completed this week
                                </p>
                            </div>
                            <Button variant="secondary" asChild>
                                <Link href="/courses/my-courses">Keep going</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="size-5 text-yellow-500" />
                            Quality signal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Course ratings now help CheFu rank better learning paths.
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <QuickActionCard
                    href={smartResumeCourse ? `/courses/my-courses/course-view/${smartResumeCourse.id}/course-learning?chapter=${smartResumeCourse.lastStudiedChapterIndex || 0}&lesson=${smartResumeCourse.lastStudiedContentIndex || 0}` : '/courses/my-courses'}
                    icon={Clock3}
                    title="Resume today"
                    description={
                        smartResumeCourse
                            ? smartResumeCourse.courseTitle
                            : 'Open your course list and choose a path.'
                    }
                />
                <QuickActionCard
                    href={focusCategory ? `/courses/search?query=${encodeURIComponent(focusCategory)}&category=${encodeURIComponent(focusCategory)}` : '/courses/search'}
                    icon={Sparkles}
                    title="Recommended focus"
                    description={
                        focusCategory
                            ? `More ${focusCategory} courses`
                            : 'Discover courses from your interests.'
                    }
                />
                <QuickActionCard
                    href="/courses/practice"
                    icon={Brain}
                    title="Practice session"
                    description="Turn your course material into recall practice."
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle>Continue With Courses</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/courses">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            {featuredCourses.map(course => (
                                <Link
                                    key={course.id}
                                    href={`/courses/course-view/${course.id}`}
                                    className="overflow-hidden rounded-lg border bg-background transition-colors hover:bg-muted/60"
                                >
                                    <div className="relative aspect-video">
                                        <Image
                                            src={course.banner_image}
                                            alt={course.courseTitle}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h2 className="line-clamp-1 text-sm font-semibold">
                                            {course.courseTitle}
                                        </h2>
                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {course.description ||
                                                'Open the course and keep learning.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Practice</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <QuickLink
                            href="/courses/practice/quiz"
                            icon={GraduationCap}
                            title="Quiz"
                            description="Test your recall."
                        />
                        <QuickLink
                            href="/courses/practice/flashcard"
                            icon={Layers3}
                            title="Flashcards"
                            description="Review concepts quickly."
                        />
                        <QuickLink
                            href="/courses/practice/questionAns"
                            icon={Brain}
                            title="Q&A"
                            description="Practice deeper answers."
                        />
                    </CardContent>
                </Card>
            </section>

            {recommended.courses.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle>
                            Because you studied {recommended.focusCategory || 'these topics'}
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/courses/search">Explore more</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3">
                            {recommended.courses.map(course => (
                                <CourseMiniLink key={course.id} course={course} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>Recommended Videos</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/videos/beginner">View videos</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                        {featuredVideos.map(video => (
                            <Link
                                key={video.id || video.videoURL}
                                href={video.id ? `/videos/details/${video.id}` : video.videoURL}
                                className="rounded-lg border bg-background p-3 transition-colors hover:bg-muted/60"
                            >
                                <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                                    <Image
                                        src={video.thumbnailURL}
                                        alt={video.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h2 className="mt-3 line-clamp-1 text-sm font-semibold">
                                    {video.title}
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {video.level || 'All levels'}
                                </p>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

function formatDashboardDate(value: unknown) {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        value instanceof Date
    ) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
    }
    if (
        value &&
        typeof value === 'object' &&
        'toDate' in value &&
        typeof value.toDate === 'function'
    ) {
        return value.toDate().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return 'recently';
}

function isCourseComplete(course: { chapters?: unknown[]; completedChapter?: string[] }) {
    const total = course.chapters?.length || 0;
    if (!total) return false;
    return (course.completedChapter?.length || 0) >= total;
}

function getFocusCategory(courses: { category?: string; lastStudiedAt?: unknown }[]) {
    const counts = new Map<string, number>();

    courses.forEach(course => {
        if (!course.category) return;
        counts.set(course.category, (counts.get(course.category) || 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

function getDashboardRecommendations(courses: Course[], focusCategory: string) {
    if (!focusCategory) return courses;

    return [...courses].sort((a, b) => {
        const aMatch = a.category === focusCategory ? 1 : 0;
        const bMatch = b.category === focusCategory ? 1 : 0;
        return bMatch - aMatch;
    });
}

function toMillis(value: unknown) {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    if (
        typeof value === 'object' &&
        'toMillis' in value &&
        typeof value.toMillis === 'function'
    ) {
        return value.toMillis();
    }
    if (
        typeof value === 'object' &&
        'seconds' in value &&
        typeof value.seconds === 'number'
    ) {
        return value.seconds * 1000;
    }
    return 0;
}

function getLearningStreak(courses: Course[]) {
    const dayKeys = new Set(
        courses
            .map(course => toMillis(course.lastStudiedAt))
            .filter(Boolean)
            .map(ms => new Date(ms).toISOString().slice(0, 10)),
    );
    let streak = 0;
    const cursor = new Date();

    while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}

function getWeeklyCompletedChapters(courses: Course[]) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    return courses.reduce((total, course) => {
        const events = course.completedChapterEvents || [];
        return (
            total +
            events.filter(event => Date.parse(event.completedAt) >= weekStart.getTime())
                .length
        );
    }, 0);
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function QuickLink({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/60"
        >
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4" />
            </div>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </Link>
    );
}

function CourseMiniLink({ course }: { course: Course }) {
    return (
        <Link
            href={`/courses/course-view/${course.id}`}
            className="overflow-hidden rounded-lg border bg-background transition-colors hover:bg-muted/60"
        >
            <div className="relative aspect-video">
                <Image
                    src={course.banner_image}
                    alt={course.courseTitle}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-3">
                <h2 className="line-clamp-1 text-sm font-semibold">
                    {course.courseTitle}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {(course.averageRating || 0).toFixed(1)} stars
                    {course.reviewCount ? ` from ${course.reviewCount}` : ''}
                </p>
            </div>
        </Link>
    );
}

function QuickActionCard({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/60"
        >
            <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </Link>
    );
}
