import CookieBanner from '@/components/Cookies/CookieBanner';
import WebMcpProvider from '@/components/Agent/WebMcpProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ConsentProvider } from '@/helpers/ConsentProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import '@/app/globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'CheFu Academy | Smart Learners Platform',
    description: 'Smart Learning Starts Here',
    applicationName: 'CheFu Academy',
    authors: [{ name: 'CheFu Inc Team', url: 'https://chefuinc.com' }],
    creator: 'CheFu Inc Team',
    publisher: 'CheFu Inc',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2568872335031834"
                    crossOrigin="anonymous"
                    strategy="beforeInteractive"
                ></Script>
                {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
                    <>
                        <Script
                            async
                            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="google-analytics" strategy="afterInteractive">
                            {`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
                        </Script>
                    </>
                ) : null}
                <meta
                    name="google-adsense-account"
                    content="ca-pub-2568872335031834"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ConsentProvider>
                        <WebMcpProvider />
                        {children}
                        <CookieBanner />
                    </ConsentProvider>

                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
