'use client';

import { apiFetch } from '@/lib/api-client';

export async function clearSessionCookie() {
    await apiFetch('/auth/session', {
        method: 'DELETE',
    });
}
