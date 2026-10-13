'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { Course } from '@/types/course';
import { Star } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

type ExistingReview = {
    rating: number;
    comment: string;
};

export default function CourseReviewPanel({
    course,
    completed,
}: {
    course: Course;
    completed: boolean;
}) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [existingReview, setExistingReview] =
        useState<ExistingReview | null>(null);
    const [editing, setEditing] = useState(false);
    const [loadingReview, setLoadingReview] = useState(true);
    const [stats, setStats] = useState({
        averageRating: Number(course.averageRating) || 0,
        reviewCount: Number(course.reviewCount) || 0,
    });
    const [pending, startTransition] = useTransition();
    const { user, loading: authLoading } = useAuthUser();

    useEffect(() => {
        setStats({
            averageRating: Number(course.averageRating) || 0,
            reviewCount: Number(course.reviewCount) || 0,
        });
    }, [course.averageRating, course.reviewCount]);

    useEffect(() => {
        if (!completed || authLoading) return;

        setLoadingReview(true);
        let active = true;
        const loadReview = async () => {
            if (!user) {
                setExistingReview(null);
                setRating(0);
                setComment('');
                setEditing(false);
                setLoadingReview(false);
                return;
            }

            try {
                const response = await apiFetch(
                    `/api/academy/mobile/courses/${encodeURIComponent(course.id)}/reviews/${encodeURIComponent(user.uid)}`,
                );
                const result = (await response.json()) as {
                    review: ExistingReview | null;
                };
                if (!active) return;
                if (result.review) {
                    const savedReview = {
                        rating: Number(result.review.rating) || 0,
                        comment: String(result.review.comment || ''),
                    };

                    setExistingReview(savedReview);
                    setRating(savedReview.rating);
                    setComment(savedReview.comment);
                    setEditing(false);
                } else {
                    setExistingReview(null);
                    setRating(0);
                    setComment('');
                    setEditing(true);
                }
            } catch (error) {
                console.error('Failed to load review:', error);
                toast.error('Could not check your existing review.');
            } finally {
                if (active) setLoadingReview(false);
            }
        };
        void loadReview();

        return () => {
            active = false;
        };
    }, [authLoading, completed, course.id, user]);

    if (!completed) return null;

    const submitReview = () => {
        if (!rating) {
            toast.error('Choose a rating first.');
            return;
        }

        startTransition(async () => {
            if (!user?.email) {
                toast.error('Please sign in again.');
                return;
            }

            try {
                const response = await apiFetch(
                    `/api/academy/mobile/courses/${encodeURIComponent(course.id)}/reviews`,
                    {
                        method: 'PUT',
                        body: JSON.stringify({ rating, comment: comment.trim() }),
                    },
                );
                const result = (await response.json()) as {
                    stats: { averageRating: number; reviewCount: number };
                    review: ExistingReview;
                };
                const savedReview = {
                    rating: result.review.rating,
                    comment: result.review.comment,
                };

                setStats(result.stats);
                setExistingReview(savedReview);
                setRating(savedReview.rating);
                setComment(savedReview.comment);
                setEditing(false);
                toast.success(
                    existingReview
                        ? 'Your review has been updated.'
                        : 'Thanks for reviewing this course.',
                );
            } catch (error) {
                console.error('Failed to submit review:', error);
                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Could not save your review.',
                );
            }
        });
    };

    return (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">
                        Course review
                    </p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight">
                        Rate this learning path
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Your rating helps improve recommendations for other learners.
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Current: {stats.averageRating.toFixed(1)} from{' '}
                    {stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''}
                </div>
            </div>

            {loadingReview ? (
                <div className="mt-5 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Checking your saved review...
                </div>
            ) : existingReview && !editing ? (
                <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold">
                                Your review is saved
                            </p>
                            <div className="mt-2 flex gap-1 text-yellow-500">
                                {[1, 2, 3, 4, 5].map(value => (
                                    <Star
                                        key={value}
                                        className="size-5"
                                        fill={
                                            value <= existingReview.rating
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                    />
                                ))}
                            </div>
                            {existingReview.comment ? (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {existingReview.comment}
                                </p>
                            ) : null}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditing(true)}
                        >
                            Edit review
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(value => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                className="rounded-md p-1 text-yellow-500 transition hover:bg-muted"
                                aria-label={`Rate ${value} stars`}
                            >
                                <Star
                                    className="size-6"
                                    fill={value <= rating ? 'currentColor' : 'none'}
                                />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        value={comment}
                        onChange={event => setComment(event.target.value)}
                        placeholder="What made this course useful?"
                        className="min-h-24"
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            onClick={submitReview}
                            disabled={pending}
                        >
                            {pending
                                ? 'Saving...'
                                : existingReview
                                  ? 'Update review'
                                  : 'Submit review'}
                        </Button>
                        {existingReview ? (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setRating(existingReview.rating);
                                    setComment(existingReview.comment);
                                    setEditing(false);
                                }}
                            >
                                Cancel
                            </Button>
                        ) : null}
                    </div>
                </div>
            )}
        </section>
    );
}
