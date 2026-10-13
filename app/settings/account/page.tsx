'use client';

import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import AccountUI from '../_components/UI/AccountUI';
import AccountSkeleton from '@/components/skeletons/AccountSkeleton';

const Account = () => {
    const { user, loading } = useAuthUser();
    const [changing, setChanging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleChangeAvatar = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            toast.error('Image must be under 4MB');
            return;
        }

        setChanging(true);
        try {
            await apiFetch('/auth/profile-picture', {
                method: 'POST',
                body: JSON.stringify({
                    imageBase64: await readFileAsDataUrl(file),
                    contentType: file.type,
                }),
            });

            toast.success('Profile picture updated!');
            window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update profile picture');
        } finally {
            setChanging(false);
        }
    };

    if (loading) {
        return <AccountSkeleton />;
    }

    if (!user) {
        return (
            <div className="container mx-auto max-w-4xl p-4 sm:p-6">
                <p className="text-sm text-muted-foreground">Unable to load account data.</p>
            </div>
        );
    }
    return (
        <AccountUI
            handleAvatarUpload={handleAvatarUpload}
            handleChangeAvatar={handleChangeAvatar}
            user={user}
            changing={changing}
            fileInputRef={fileInputRef}
        />
    );
};

export default Account;

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error('Unable to read the selected image.'));
                return;
            }
            resolve(reader.result);
        };
        reader.onerror = () =>
            reject(reader.error || new Error('Unable to read the selected image.'));
        reader.readAsDataURL(file);
    });
}
