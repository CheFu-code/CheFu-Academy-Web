'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
    interface Window {
        gtag?: (
            command: string,
            eventName: string,
            eventParameters?: Record<string, string>,
        ) => void;
    }
}

export function TrackPageView() {
    const pathname = usePathname();

    useEffect(() => {
        window.gtag?.('event', 'page_view', {
            page_path: pathname,
        });
    }, [pathname]);

    return null;
}
