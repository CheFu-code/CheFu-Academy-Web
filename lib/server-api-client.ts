import { cookies } from 'next/headers';
import { getApiUrl } from '@/lib/api-url';

export async function serverApiFetch(path: string, init: RequestInit = {}) {
    const cookieHeader = (await cookies())
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join('; ');
    const headers = new Headers(init.headers);
    if (cookieHeader) headers.set('Cookie', cookieHeader);
    if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(getApiUrl(path), {
        ...init,
        headers,
        cache: 'no-store',
    });
    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
            | { message?: string; error?: string }
            | null;
        throw new Error(
            data?.message ||
                data?.error ||
                `API request failed with status ${response.status}.`,
        );
    }
    return response;
}
