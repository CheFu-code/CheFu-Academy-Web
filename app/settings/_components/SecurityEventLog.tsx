'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/api-url';
import { Activity, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

type SecurityEvent = {
    eventId: string;
    eventType: string;
    label: string;
    deviceName?: string;
    createdAt: string;
};

const eventLabels: Record<string, string> = {
    sign_in: 'Sign-in',
    password_changed: 'Password changed',
    passkey_enrolled: 'Passkey enrolled',
    mfa_enabled: '2FA enabled',
    mfa_disabled: '2FA disabled',
    verification_email_sent: 'Verification email sent',
};

export default function SecurityEventLog() {
    const [events, setEvents] = useState<SecurityEvent[]>([]);

    useEffect(() => {
        let active = true;
        const fetchEvents = async () => {
            try {
                const response = await fetch(getApiUrl('/auth/activity'), {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error(`Failed to load security activity (${response.status}).`);
                }
                const data = (await response.json()) as SecurityEvent[];
                if (active) setEvents(data.slice(0, 8));
            } catch (error) {
                console.error('Failed to load security activity:', error);
            }
        };
        const refreshOnFocus = () => void fetchEvents();
        void fetchEvents();
        const intervalId = window.setInterval(fetchEvents, 30_000);
        window.addEventListener('focus', refreshOnFocus);

        return () => {
            active = false;
            window.clearInterval(intervalId);
            window.removeEventListener('focus', refreshOnFocus);
        };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="size-4 text-cyan-500" />
                    Security Event Log
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {events.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Security events will appear here after sign-ins and account changes.
                    </p>
                )}

                {events.map(event => (
                    <div
                        key={event.eventId}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-md bg-background">
                                <EventIcon type={event.eventType} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {event.label || eventLabels[event.eventType] || event.eventType}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatEventDate(event.createdAt)}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline">
                            {event.deviceName || 'account'}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function EventIcon({ type }: { type: string }) {
    if (type === 'password_changed') {
        return <LockKeyhole className="size-4 text-cyan-500" />;
    }
    if (type === 'passkey_enrolled') {
        return <KeyRound className="size-4 text-cyan-500" />;
    }
    return <ShieldCheck className="size-4 text-cyan-500" />;
}

function formatEventDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
