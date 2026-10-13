import { useAuthUser } from '@/hooks/useAuthUser';
import { useSignOut } from '@/hooks/useSignOut';
import { apiFetch } from '@/lib/api-client';
import countryList from 'react-select-country-list';
import { useState } from 'react';
import { toast } from 'sonner';
import ProfileTabUI from './UI/ProfileTabUI';

const ProfileTab = () => {
    const { user } = useAuthUser();
    const { loggingOut, handleLogout } = useSignOut();
    const [name, setName] = useState(user?.fullname ?? '');
    const [saving, setSaving] = useState<
        | null
        | 'fullname'
        | 'bio'
        | 'country'
        | 'learning'
        | 'privacy'
        | 'export'
        | 'resetOnboarding'
        | 'clearProgress'
    >(null);
    const [bio, setBio] = useState(user?.bio ?? '');
    if (!user) return null;

    const updateField = async (field: 'fullname' | 'bio', value: string) => {
        if (!user) return;

        if (value.trim() === user[field]) {
            toast.info(`No changes to save`);
            return;
        }

        setSaving(field);

        try {
            await apiFetch('/api/academy/mobile/me', {
                method: 'PATCH',
                body: JSON.stringify({ [field]: value.trim() }),
            });

            window.location.reload();
            toast.success(
                `${field === 'fullname' ? 'Name' : 'Bio'} updated successfully`,
            );
        } catch (err) {
            console.error(`Failed to update ${field}:`, err);
            toast.error(`Failed to update ${field}`);
        } finally {
            setSaving(null);
        }
    };

    const updateCountry = async (countryCode: string) => {
        if (!user) return;

        const selected = countryList()
            .getData()
            .find(c => c.value === countryCode);
        const country = selected?.label ?? countryCode;

        if (
            countryCode.trim() === (user.countryCode || '').trim() &&
            country.trim() === (user.country || '').trim()
        ) {
            toast.info('No changes to save');
            return;
        }

        setSaving('country');

        try {
            await apiFetch('/api/academy/mobile/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    countryCode: countryCode.trim(),
                    country: country.trim(),
                }),
            });

            window.location.reload();
            toast.success('Country updated successfully');
        } catch (err) {
            console.error('Failed to update country:', err);
            toast.error('Failed to update country');
        } finally {
            setSaving(null);
        }
    };

    const updateAccountSettings = async (
        payload: Record<string, unknown>,
        savingKey: NonNullable<typeof saving>,
        successMessage: string,
    ) => {
        if (!user) return;

        setSaving(savingKey);
        try {
            await apiFetch('/api/academy/mobile/me', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            toast.success(successMessage);
            window.location.reload();
        } catch (error) {
            console.error('Failed to update account settings:', error);
            toast.error('Failed to update account settings.');
        } finally {
            setSaving(null);
        }
    };

    const exportAccountData = async () => {
        if (!user) return;

        setSaving('export');
        try {
            const response = await apiFetch('/api/academy/mobile/me/export');
            const exportData = await response.json();
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chefu-account-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Account data export prepared.');
        } catch (error) {
            console.error('Failed to export account data:', error);
            toast.error('Failed to export account data.');
        } finally {
            setSaving(null);
        }
    };

    const resetOnboarding = async () => {
        await updateAccountSettings(
            {
                onboardingComplete: false,
                appGuideComplete: false,
            },
            'resetOnboarding',
            'Onboarding and app guide reset.',
        );
    };

    const clearLearningProgress = async () => {
        if (!user) return;

        setSaving('clearProgress');
        try {
            await apiFetch('/courses/my/progress/reset', {
                method: 'POST',
            });
            toast.success('Learning progress cleared.');
        } catch (error) {
            console.error('Failed to clear learning progress:', error);
            toast.error('Failed to clear learning progress.');
        } finally {
            setSaving(null);
        }
    };

    
    return (
        <ProfileTabUI
            user={user}
            name={name}
            setName={setName}
            bio={bio}
            setBio={setBio}
            updateField={updateField}
            updateCountry={updateCountry}
            updateAccountSettings={updateAccountSettings}
            exportAccountData={exportAccountData}
            resetOnboarding={resetOnboarding}
            clearLearningProgress={clearLearningProgress}
            saving={saving}
            loggingOut={loggingOut}
            handleLogout={handleLogout}
        />
    );
};

export default ProfileTab;
