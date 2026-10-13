import type { SVGProps } from 'react';

/**
 * Chefu Academy mark: an open book with a center spine and stepped bars
 * (lessons building into a course).
 *
 * Fully transparent and drawn with `currentColor`, so it follows the text
 * color of its parent. Use Tailwind's `text-foreground` and it switches
 * automatically between light and dark mode.
 */
export default function Logo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Spine */}
            <rect x="22.75" y="8" width="2.5" height="32" rx="1.25" />

            {/* Left page */}
            <rect x="12" y="13.25" width="8" height="3.5" rx="1.75" />
            <rect x="8" y="22.25" width="12" height="3.5" rx="1.75" />
            <rect x="4" y="31.25" width="16" height="3.5" rx="1.75" />

            {/* Right page */}
            <rect x="28" y="13.25" width="8" height="3.5" rx="1.75" />
            <rect x="28" y="22.25" width="12" height="3.5" rx="1.75" />
            <rect x="28" y="31.25" width="16" height="3.5" rx="1.75" />
        </svg>
    );
}
