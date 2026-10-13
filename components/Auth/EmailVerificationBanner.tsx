'use client';

import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { chefuManageAccountUrl } from '@/lib/chefu-account';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EmailVerificationBanner() {
    const { user } = useAuthUser();
    const [pending, setPending] = useState(false);

    const resendVerification = async () => {
        setPending(true);
        try {
            const response = await apiFetch('/auth/security/email-verification', {
                method: 'POST',
            });
            const result = (await response.json()) as {
                sent: boolean;
                verified: boolean;
            };
            if (result.verified) {
                toast.success('Your email is already verified.');
                window.location.reload();
            } else {
                toast.success('Verification email sent.');
            }
        } catch (error) {
            console.error('Failed to send verification email:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Could not send verification email.',
            );
        } finally {
            setPending(false);
        }
    };

    if (!user || user.isVerified !== false) return null;

    return (
        <section className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-cyan-500 text-white">
                        <MailCheck className="size-5" />
                    </div>
                    <div>
                        <p className="font-semibold">Verify your email</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Confirm your email to keep your account secure and recoverable.
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={resendVerification}
                    disabled={pending}
                >
                    {pending ? 'Sending...' : 'Resend email'}
                </Button>
                <Button
                    type="button"
                    variant="link"
                    onClick={() =>
                        window.location.assign(
                            chefuManageAccountUrl(window.location.href, 'profile'),
                        )
                    }
                >
                    Manage account
                </Button>
            </div>
        </section>
    );
}
