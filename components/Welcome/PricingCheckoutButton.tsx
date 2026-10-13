'use client';

import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { getApiUrl } from '@/lib/api-url';
import { loadClerkBilling } from '@/lib/clerk-billing';
import { BillingCheckoutResponse } from '@/types/billing';
import { CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type PricingCheckoutButtonProps = {
    planName: string;
};

const PricingCheckoutButton = ({ planName }: PricingCheckoutButtonProps) => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthUser();
    const [loading, setLoading] = useState(false);

    const startCheckout = async () => {
        setLoading(true);

        try {
            if (authLoading || !user) {
                router.push('/login');
                return;
            }

            const response = await fetch(getApiUrl('/billing/checkout'), {
                body: JSON.stringify({ plan: planName }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });
            const payload = (await response.json()) as
                | BillingCheckoutResponse
                | { message?: string };

            if (!response.ok || !('planId' in payload)) {
                const message = 'message' in payload ? payload.message : null;
                throw new Error(message || 'Unable to start checkout.');
            }

            const clerk = await loadClerkBilling();

            if (!clerk.user) {
                clerk.openSignIn({
                    afterSignInUrl: window.location.href,
                    afterSignUpUrl: window.location.href,
                });
                toast.info('Finish Clerk billing sign-in, then choose the plan again.');
                return;
            }

            if (!clerk.billing?.startCheckout) {
                throw new Error('Clerk Billing is not enabled for this Clerk app.');
            }

            await clerk.billing.startCheckout({
                planId: payload.planId,
                planPeriod: payload.planPeriod,
            });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Checkout could not be opened right now.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            className="mt-auto w-full"
            disabled={loading}
            onClick={startCheckout}
        >
            <CreditCard className="mr-2 size-4" />
            {loading ? 'Opening...' : 'Get Started'}
        </Button>
    );
};

export default PricingCheckoutButton;
