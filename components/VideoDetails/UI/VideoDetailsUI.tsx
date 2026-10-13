import Overview from '@/components/Overview';
import Reviews from '@/components/Reviews/Reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video } from '@/types/video';
import {
    ArrowLeft,
    BookOpenCheck,
    CalendarDays,
    Clock3,
    Eye,
    Globe2,
    GraduationCap,
    Lock,
    PlayCircle,
    ShieldCheck,
    UserRound,
    VideoIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function getYouTubeEmbedUrl(video: Video) {
    const youtubeVideoId = video.youtubeVideoId || video.videoId;
    if (!youtubeVideoId) return video.embedURL || '';

    return `https://www.youtube.com/embed/${encodeURIComponent(
        youtubeVideoId,
    )}`;
}

function formatVideoDate(value: Video['uploadedAt']) {
    if (!value) return 'Recently added';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Recently added'
        : date.toLocaleDateString();
}

function formatDuration(duration = 0) {
    if (!duration) return 'On demand';
    return `${Math.floor(duration / 60)}m ${duration % 60}s`;
}

function formatLevel(level?: string) {
    if (!level) return 'Beginner';
    return level.charAt(0).toUpperCase() + level.slice(1);
}

function getInstructor(video: Video) {
    return video.instructorName || video.uploadedBy || 'CheFu Academy';
}

const VideoDetailsUI = ({
    enrolled,
    video,
    handleEnroll,
    enrolling,
    isAuthenticated,
}: {
    enrolled: boolean;
    video: Video;
    handleEnroll: () => Promise<void>;
    enrolling: boolean;
    isAuthenticated: boolean;
}) => {
    const isYouTubeVideo = video.source === 'youtube' || Boolean(video.videoId);
    const youtubeEmbedUrl = getYouTubeEmbedUrl(video);
    const duration = formatDuration(video.duration);
    const level = formatLevel(video.level);
    const uploadedAt = formatVideoDate(video.uploadedAt);
    const instructor = getInstructor(video);
    const topics = video.topics?.filter(Boolean).slice(0, 4) ?? [];
    const thumbnailURL = video.thumbnailURL || '/tech-coding.jpg';
    const enrollLabel = !isAuthenticated
        ? 'Sign in to enroll'
        : enrolling
          ? 'Enrolling...'
          : 'Enroll and watch';

    return (
        <div className="flex w-full flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" asChild className="gap-2 px-2">
                    <Link href="/videos/all-videos">
                        <ArrowLeft className="size-4" />
                        All videos
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5">
                        <VideoIcon className="size-3.5" />
                        {isYouTubeVideo ? 'YouTube' : 'Academy video'}
                    </Badge>
                    {enrolled && (
                        <Badge className="gap-1.5 bg-emerald-600 text-white">
                            <ShieldCheck className="size-3.5" />
                            Enrolled
                        </Badge>
                    )}
                </div>
            </div>

            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="relative aspect-video w-full bg-black">
                    {enrolled && isYouTubeVideo && youtubeEmbedUrl ? (
                        <iframe
                            src={youtubeEmbedUrl}
                            title={video.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    ) : enrolled ? (
                        <video
                            src={video.videoURL}
                            controls
                            className="h-full w-full bg-black object-contain"
                        />
                    ) : (
                        <>
                            <Image
                                priority
                                fill
                                src={thumbnailURL}
                                alt={video.title}
                                sizes="(min-width: 1280px) 1120px, 100vw"
                                className="object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
                            <div className="absolute inset-0 flex items-center justify-center p-5">
                                <div className="flex max-w-md flex-col items-center text-center text-white">
                                    <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur">
                                        <Lock className="size-6" />
                                    </div>
                                    <h2 className="text-xl font-semibold sm:text-2xl">
                                        Enroll to watch
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-white/75">
                                        {video.title}
                                    </p>
                                    <Button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        size="lg"
                                        className="mt-5 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        <PlayCircle className="size-5" />
                                        {enrollLabel}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    <Badge className="absolute left-4 top-4 max-w-[calc(100%-2rem)] bg-black/70 text-white backdrop-blur">
                        {video.category}
                    </Badge>
                </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="min-w-0 space-y-5">
                    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Badge variant="outline" className="gap-1.5">
                                <GraduationCap className="size-3.5" />
                                {level}
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <Clock3 className="size-3.5" />
                                {duration}
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <Eye className="size-3.5" />
                                {(video.views || 0).toLocaleString()} views
                            </Badge>
                        </div>

                        <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            {video.title}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <UserRound className="size-4" />
                                {instructor}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CalendarDays className="size-4" />
                                {uploadedAt}
                            </span>
                        </div>

                        {topics.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {topics.map((topic) => (
                                    <Badge
                                        key={topic}
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList className="h-auto rounded-xl border bg-card p-1">
                            <TabsTrigger
                                value="overview"
                                className="gap-2 rounded-lg px-4 py-2"
                            >
                                <BookOpenCheck className="size-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="gap-2 rounded-lg px-4 py-2"
                            >
                                <ShieldCheck className="size-4" />
                                Reviews
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="overview"
                            className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
                        >
                            <Overview video={video} />
                        </TabsContent>
                        <TabsContent
                            value="reviews"
                            className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
                        >
                            <Reviews video={video} />
                        </TabsContent>
                    </Tabs>
                </section>

                <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                        <h2 className="font-semibold">Video details</h2>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-3 py-2.5">
                                <dt className="text-muted-foreground">Level</dt>
                                <dd className="font-medium">{level}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-3 py-2.5">
                                <dt className="text-muted-foreground">Duration</dt>
                                <dd className="font-medium">{duration}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-3 py-2.5">
                                <dt className="text-muted-foreground">Language</dt>
                                <dd className="inline-flex items-center gap-1.5 font-medium">
                                    <Globe2 className="size-4" />
                                    English
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-3 py-2.5">
                                <dt className="text-muted-foreground">Source</dt>
                                <dd className="font-medium">
                                    {isYouTubeVideo ? 'YouTube' : 'Academy'}
                                </dd>
                            </div>
                        </dl>

                        {!enrolled && (
                            <Button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="mt-5 w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                <PlayCircle className="size-4" />
                                {enrollLabel}
                            </Button>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default VideoDetailsUI;
