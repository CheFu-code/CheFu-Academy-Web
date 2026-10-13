'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import {
    BookOpenCheck,
    Compass,
    Download,
    GraduationCap,
    MessageSquareText,
    Search,
    Settings2,
    ShieldCheck,
    Video,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type GuideStep = {
    title: string;
    description: string;
    bullets: string[];
    route: string;
    icon: React.ComponentType<{ className?: string }>;
    focus: string;
};

const guideSteps: GuideStep[] = [
    {
        title: 'Courses Hub',
        description: 'Discover all available courses and enroll in what you need next.',
        bullets: [
            'Use Search to find courses by topic, category, or goal',
            'Open My Courses to continue from your latest lesson',
            'Use Download as PDF, Word, PowerPoint, or Excel for offline study',
        ],
        route: '/courses',
        icon: GraduationCap,
        focus: 'Courses is your main learning workspace. Start here when you want to browse, enroll, resume, or export a course.',
    },
    {
        title: 'Search & Recommendations',
        description:
            'CheFu learns from your searches, course categories, ratings, and progress.',
        bullets: [
            'Search suggestions show recent and popular directions',
            'Filters help narrow by category, depth, and quality',
            'Because you learned sections recommend related courses',
        ],
        route: '/courses/search',
        icon: Search,
        focus: 'Use this when you know what skill you want next, or when you want the app to suggest nearby learning paths.',
    },
    {
        title: 'Practice Mode',
        description:
            'Strengthen retention with Quiz, Flashcards, and Q&A practice workflows.',
        bullets: [
            'Quiz for scored assessments',
            'Flashcards for active recall',
            'Q&A for concept reinforcement',
        ],
        route: '/courses/practice',
        icon: Compass,
        focus: 'Practice pulls from your enrolled courses, so it becomes more useful as your course library grows.',
    },
    {
        title: 'Videos Library',
        description: 'Use video tracks to deepen understanding beyond text lessons.',
        bullets: [
            'Watch beginner videos for fundamentals',
            'Move to advanced videos for mastery',
            'Pair videos with practice mode',
        ],
        route: '/videos/beginner',
        icon: Video,
        focus: 'Videos are best for visual explanations before or after a text-based course chapter.',
    },
    {
        title: 'Course Tools',
        description: 'Each course page includes actions for learning, review, and exporting.',
        bullets: [
            'Continue Learning opens the next chapter',
            'Download exports professional study material',
            'Rate completed courses to improve recommendations',
        ],
        route: '/courses/my-courses',
        icon: Download,
        focus: 'When you finish a course, leave a rating so the recommendation algorithm gets smarter.',
    },
    {
        title: 'Settings, Support & Feedback',
        description: 'Manage your account and reach us quickly when you need help.',
        bullets: [
            'Adjust profile, notifications, and security',
            'Review recent security events like sign-ins and password changes',
            'Open Support for assistance',
            'Submit Feedback to improve the platform',
        ],
        route: '/settings/account',
        icon: Settings2,
        focus: 'Security settings include passkeys, 2FA, password changes, and your recent security event log.',
    },
];

export default function AppGuideOnboarding() {
    const { user, loading } = useAuthUser();
    const router = useRouter();
    const pathname = usePathname();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [completedLocally, setCompletedLocally] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const isAppArea = useMemo(
        () =>
            pathname.startsWith('/courses') ||
            pathname.startsWith('/videos') ||
            pathname.startsWith('/settings') ||
            pathname.startsWith('/support') ||
            pathname.startsWith('/feedback'),
        [pathname],
    );

    if (loading || !user) return null;
    if (!isAppArea) return null;
    if (!user.onboardingComplete) return null;
    if (completedLocally || user.appGuideComplete) return null;
    if (collapsed) return null;

    const current = guideSteps[step];
    const Icon = current.icon;
    const progress = ((step + 1) / guideSteps.length) * 100;

    const handleDone = async () => {
        setSaving(true);
        try {
            await apiFetch('/api/academy/mobile/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    appGuideComplete: true,
                }),
            });
            setCompletedLocally(true);
            toast.success('Guide completed. You are all set.');
        } catch (error) {
            console.error('Failed to save app guide completion:', error);
            toast.error('Could not complete guide. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        await handleDone();
    };

    return (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-3xl border-border/60 shadow-2xl">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageSquareText className="h-4 w-4" />
                            <span>Platform guide</span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={saving}
                        >
                            Skip
                        </Button>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl border bg-muted/30 p-2">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{current.title}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {current.description}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-cyan-500/10 p-3 text-sm text-muted-foreground">
                        {current.focus}
                    </div>

                    <ul className="space-y-2 text-sm">
                        {current.bullets.map(bullet => (
                            <li key={bullet} className="flex items-start gap-2 rounded-md border bg-muted/20 p-2.5">
                                <BookOpenCheck className="mt-0.5 size-4 text-primary" />
                                {bullet}
                            </li>
                        ))}
                    </ul>

                    <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground sm:grid-cols-2">
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            Account safety is handled in Settings.
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <MessageSquareText className="size-4 text-primary" />
                            Support and feedback are available anytime.
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setStep(prev => Math.max(prev - 1, 0))}
                            disabled={step === 0 || saving}
                        >
                            Back
                        </Button>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCollapsed(true);
                                    router.push(current.route);
                                }}
                                disabled={saving}
                            >
                                Open This Section
                            </Button>
                            {step < guideSteps.length - 1 ? (
                                <Button
                                    onClick={() =>
                                        setStep(prev =>
                                            Math.min(prev + 1, guideSteps.length - 1),
                                        )
                                    }
                                    disabled={saving}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button onClick={handleDone} disabled={saving}>
                                    {saving ? 'Finishing...' : 'Done'}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
