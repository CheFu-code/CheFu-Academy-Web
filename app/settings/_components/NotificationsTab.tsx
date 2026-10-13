import { NotificationsTabSkeleton } from '@/components/skeletons/NotificationTabSkeleton';
import { useAuthUser } from '@/hooks/useAuthUser';
import { getApiUrl } from '@/lib/api-url';
import {
    NotificationPreferenceKey,
    NotificationPreferences,
    normalizeNotificationPreferences,
} from '@/lib/notificationPreferences';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import NotificationsTabUI from './UI/NotificationsTabUI';

const NotificationsTab = () => {
    const { user, loading } = useAuthUser();
    const [prefs, setPrefs] = useState<NotificationPreferences>(
        normalizeNotificationPreferences(user?.emailPreferences),
    );
    const [changingPrefKey, setChangingPrefKey] = useState<
        NotificationPreferenceKey | 'bulk' | null
    >(null);
    const [loadingPreferences, setLoadingPreferences] = useState(true);

    useEffect(() => {
        if (user?.emailPreferences) {
            setPrefs(normalizeNotificationPreferences(user.emailPreferences));
        }
    }, [user]);

    useEffect(() => {
        let cancelled = false;

        const fetchPreferences = async () => {
            if (!user || loading) return;

            try {
                setLoadingPreferences(true);
                const response = await fetch(
                    getApiUrl('/notifications/preferences'),
                    {
                        credentials: 'include',
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to load notification preferences.');
                }

                const data = await response.json();
                if (!cancelled) {
                    setPrefs(normalizeNotificationPreferences(data.preferences));
                }
            } catch (error) {
                console.error('Failed to load notification preferences:', error);
                toast.error('Failed to load notification preferences.');
            } finally {
                if (!cancelled) setLoadingPreferences(false);
            }
        };

        void fetchPreferences();

        return () => {
            cancelled = true;
        };
    }, [loading, user]);

    const persistPrefs = async (
        nextPrefs: NotificationPreferences,
        changingKey: NotificationPreferenceKey | 'bulk',
        rollbackPrefs: NotificationPreferences,
    ) => {
        if (!user) return;

        try {
            setChangingPrefKey(changingKey);
            setPrefs(nextPrefs);

            const response = await fetch(getApiUrl('/notifications/preferences'), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(nextPrefs),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.message || 'Failed to update preference.');
            }

            const data = await response.json();
            setPrefs(normalizeNotificationPreferences(data.preferences));
        } catch (err) {
            setPrefs(rollbackPrefs);
            console.error('Failed to update preference:', err);
            toast.error('Failed to update preference');
        } finally {
            setChangingPrefKey(null);
        }
    };

    const handleToggle = async (key: NotificationPreferenceKey, value: boolean) => {
        if (!user) return;
        const previousPrefs = prefs;
        const newPrefs = { ...previousPrefs, [key]: value };
        await persistPrefs(newPrefs, key, previousPrefs);
    };

    const handleBulkUpdate = async (type: 'all' | 'essential') => {
        if (!user) return;
        const previousPrefs = prefs;
        const newPrefs: NotificationPreferences =
            type === 'all'
                ? {
                    activity: true,
                    general: true,
                    marketing: true,
                    security: true,
                    courseReminders: true,
                    aiCourseCompletion: true,
                    weeklyProgressSummary: true,
                }
                : {
                    activity: true,
                    general: true,
                    marketing: false,
                    security: true,
                    courseReminders: true,
                    aiCourseCompletion: true,
                    weeklyProgressSummary: true,
                };

        await persistPrefs(newPrefs, 'bulk', previousPrefs);
        toast.success(
            type === 'all'
                ? 'All notifications enabled.'
                : 'Switched to essential notifications.',
        );
    };

    if (loading || loadingPreferences) {
        return <NotificationsTabSkeleton />;
    }

    return (
        <NotificationsTabUI
            prefs={prefs}
            handleToggle={handleToggle}
            handleBulkUpdate={handleBulkUpdate}
            changingPrefKey={changingPrefKey}
        />
    );
};

export default NotificationsTab;
