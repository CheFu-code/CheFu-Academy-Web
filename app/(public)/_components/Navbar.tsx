import Link from 'next/link';
import AuthNavAction from './AuthNavAction';
import DesktopMenu from './DesktopMenu';
import MobileMenu from './MobileMenu';
import Logo  from '@/components/Logo';

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center space-x-2 py-4 mr-4"
                >
                    <Logo
                        aria-hidden="true"
                        className="h-9 w-9 shrink-0 text-foreground"
                    />
                    <span className="font-bold">Chefu Academy</span>
                </Link>

                {/* Mobile Menu */}
                <MobileMenu authAction={<AuthNavAction />} />
                <DesktopMenu />
            </div>
        </header>
    );
}