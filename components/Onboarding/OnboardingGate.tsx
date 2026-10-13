'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import {
    NotificationPreferences,
    normalizeNotificationPreferences,
} from '@/lib/notificationPreferences';
import { Bell, Globe2, Sparkles, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import countryList from 'react-select-country-list';
import { toast } from 'sonner';

const TOTAL_STEPS = 4;

export default function OnboardingGate() {
    const { user, loading } = useAuthUser();
    const pathname = usePathname();
    const countries = useMemo(() => countryList().getData(), []);

    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [completedLocally, setCompletedLocally] = useState(false);

    const [fullname, setFullname] = useState('');
    const [bio, setBio] = useState('');
    const [language, setLanguage] = useState('en');
    const [countryCode, setCountryCode] = useState('');
    const [emailPreferences, setEmailPreferences] =
        useState<NotificationPreferences>(
            normalizeNotificationPreferences({
                activity: true,
                general: true,
                marketing: false,
                security: true,
            }),
        );
    const initializedUserRef = useRef<string | null>(null);

    useEffect(() => {
        if (!user) return;
        if (initializedUserRef.current === user.uid) return;

        initializedUserRef.current = user.uid;
        setFullname(user.fullname || '');
        setBio(user.bio || '');
        setLanguage(user.language || 'en');
        setCountryCode(user.countryCode || '');
        setEmailPreferences(
            normalizeNotificationPreferences(
                user.emailPreferences || {
                activity: true,
                general: true,
                marketing: false,
                security: true,
                },
            ),
        );
    }, [user]);

    if (loading || !user) return null;

    if (completedLocally || user.onboardingComplete) return null;

    if (pathname.startsWith('/add-country')) return null;

    const country = countries.find(c => c.value === countryCode)?.label || '';

    const canProceed = () => {
        if (step === 1) return fullname.trim().length >= 2;
        if (step === 2) return countryCode.trim().length > 0;
        return true;
    };

    const goNext = () => {
        if (!canProceed()) return;
        setStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1));
    };

    const goBack = () => {
        setStep(prev => Math.max(prev - 1, 0));
    };

    const handleComplete = async () => {
        if (!user?.email) {
            toast.error('Email is required to complete onboarding.');
            return;
        }
        if (!countryCode) {
            toast.error('Please select your country before finishing.');
            return;
        }

        setSaving(true);
        try {
            await Promise.all([
                apiFetch('/api/academy/mobile/me', {
                    method: 'PATCH',
                    body: JSON.stringify({
                    fullname: fullname.trim(),
                    bio: bio.trim(),
                    language,
                    countryCode,
                    country,
                    onboardingComplete: true,
                    }),
                }),
                apiFetch('/notifications/preferences', {
                    method: 'PATCH',
                    body: JSON.stringify(emailPreferences),
                }),
            ]);
            setCompletedLocally(true);
            toast.success('Onboarding completed. Welcome to CheFu Academy.');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            toast.error('Failed to complete onboarding. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center py-6">
            <Card className="w-full max-w-2xl border-border/60 shadow-2xl">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4" />
                            <span>Account setup</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            Step {step + 1} of {TOTAL_STEPS}
                        </span>
                    </div>
                    <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-1.5" />
                    <CardTitle className="text-xl">
                        {step === 0 && 'Welcome to CheFu Academy'}
                        {step === 1 && 'Set up your profile'}
                        {step === 2 && 'Choose your location'}
                        {step === 3 && 'Pick notification preferences'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {step === 0 && (
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                We will take less than a minute to personalize your learning
                                workspace.
                            </p>
                            <ul className="space-y-1">
                                <li className="flex gap-2 rounded-lg border bg-muted/20 p-3">
                                    <UserRound className="mt-0.5 size-4 text-primary" />
                                    <span>Profile details help personalize your workspace and certificates.</span>
                                </li>
                                <li className="flex gap-2 rounded-lg border bg-muted/20 p-3">
                                    <Globe2 className="mt-0.5 size-4 text-primary" />
                                    <span>Country and language tune recommendations and support context.</span>
                                </li>
                                <li className="flex gap-2 rounded-lg border bg-muted/20 p-3">
                                    <Bell className="mt-0.5 size-4 text-primary" />
                                    <span>Notification choices keep account and learning updates useful.</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="onboarding-name">Display Name</Label>
                                <Input
                                    id="onboarding-name"
                                    value={fullname}
                                    onChange={e => setFullname(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="onboarding-bio">Bio (optional)</Label>
                                <Textarea
                                    id="onboarding-bio"
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    placeholder="Tell us about your learning goals"
                                    className="min-h-24"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Country</Label>
                                <Select value={countryCode} onValueChange={setCountryCode}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your country" />
                                    </SelectTrigger>
                                    <SelectContent
                                        position="popper"
                                        sideOffset={8}
                                        className="z-[210] max-h-[45vh]"
                                    >
                                        {countries.map(c => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[210]">
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="pt">Portuguese</SelectItem>
                                        <SelectItem value="sw">Swahili</SelectItem>
                                        <SelectItem value="zu">Zulu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-3">
                            {(
                                [
                                    ['activity', 'Activity Emails'],
                                    ['general', 'General Emails'],
                                    ['marketing', 'Marketing Emails'],
                                    ['security', 'Security Alerts'],
                                ] as const
                            ).map(([key, label]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <span className="text-sm">{label}</span>
                                    <Switch
                                        checked={emailPreferences[key]}
                                        onCheckedChange={checked =>
                                            setEmailPreferences(prev => ({
                                                ...prev,
                                                [key]: checked,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={goBack}
                            disabled={step === 0 || saving}
                        >
                            Back
                        </Button>

                        {step < TOTAL_STEPS - 1 ? (
                            <Button onClick={goNext} disabled={!canProceed() || saving}>
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleComplete} disabled={saving}>
                                {saving ? 'Finishing...' : 'Done'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
}
