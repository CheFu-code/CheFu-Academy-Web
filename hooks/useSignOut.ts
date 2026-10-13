import { clearSessionCookie } from '@/lib/clientSession';
import { chefuLogoutUrl } from '@/lib/chefu-account';
import { useState } from 'react';
import { toast } from 'sonner';

export const useSignOut = () => {
    const [loggingOut, setLoggingOut] = useState(false);
    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await clearSessionCookie();
            window.location.assign(chefuLogoutUrl());
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Could not sign out. Please try again.');
        } finally {
            setLoggingOut(false);
        }
    };
    return { handleLogout, loggingOut };
};
