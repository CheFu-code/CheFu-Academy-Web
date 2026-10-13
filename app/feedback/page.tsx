'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { ArrowLeft, Bug, Lightbulb, MessageSquareHeart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const Feedback = () => {
    const router = useRouter();
    const { user } = useAuthUser();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messageLength = message.trim().length;

    useEffect(() => {
        if (!user) return;
        setName(prev => prev || user.fullname || '');
        setEmail(prev => prev || user.email || '');
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !message) {
            toast.error('Please fill in all fields.');
            return;
        }

        setLoading(true);

        try {
            await apiFetch('/api/academy/mobile/feedback', {
                method: 'POST',
                body: JSON.stringify({
                name,
                email,
                message,
                device: navigator.userAgent,
                pageURL: window.location.href,
                referrer: document.referrer || null,
                }),
            });

            setName('');
            setEmail('');
            setMessage('');
            toast.success('Feedback submitted successfully!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
                <Button
                    variant="ghost"
                    className="w-fit"
                    onClick={() => router.push('/courses')}
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Courses
                </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_1.35fr]">
                <Card className="border-border/60 bg-linear-to-br from-sky-500/10 via-cyan-500/5 to-transparent">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-2xl sm:text-3xl">
                            Help Us Improve CheFu Academy
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Share what works, what feels confusing, and what you
                            want next.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2 rounded-lg border bg-background/60 p-3">
                            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <p>
                                Suggest features that would make your learning
                                flow faster or clearer.
                            </p>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border bg-background/60 p-3">
                            <Bug className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                            <p>
                                Report bugs with exact steps, so we can fix
                                them quickly.
                            </p>
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border bg-background/60 p-3">
                            <MessageSquareHeart className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <p>
                                Your feedback directly shapes product
                                priorities.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Submit Feedback</CardTitle>
                        <CardDescription>
                            Please include enough detail for us to understand
                            your context.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Label htmlFor="message">Message</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {messageLength} characters
                                    </span>
                                </div>
                                <Textarea
                                    id="message"
                                    placeholder="What happened, what you expected, and any suggestions..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="min-h-40"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={
                                    loading ||
                                    !name.trim() ||
                                    !email.trim() ||
                                    !message.trim()
                                }
                            >
                                {loading ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Feedback;
