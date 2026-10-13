"use client";

import { getApiUrl } from "@/lib/api-url";
import { User } from "@/types/user";
import { useEffect, useState } from "react";

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const loadUser = async () => {
            try {
                const response = await fetch(
                    getApiUrl('/api/academy/mobile/me'),
                    { credentials: 'include' },
                );
                if (response.status === 401 || response.status === 403) {
                    if (active) setUser(null);
                    return;
                }
                if (!response.ok) {
                    throw new Error(`Unable to load account (${response.status}).`);
                }

                const profile = (await response.json()) as User;
                if (active) setUser(profile);
            } catch (error) {
                console.error('Failed to load CheFu Academy session:', error);
                if (active) setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadUser();
        return () => {
            active = false;
        };
    }, []);

    return { user, loading };
}
