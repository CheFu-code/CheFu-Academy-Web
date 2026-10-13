import { getApiUrl } from '@/lib/api-url';

export async function apiFetch(
    path: string,
    init: RequestInit = {},
): Promise<Response> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(getApiUrl(path), {
        ...init,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
            | { message?: string; error?: string; requestId?: string }
            | null;
        const message =
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}.`;
        const requestId = data?.requestId ? ` Request ID: ${data.requestId}` : '';
        throw new Error(`${message}${requestId}`);
    }

    return response;
}
