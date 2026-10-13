'use client';

import Header from '@/components/Shared/Header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { chefuManageAccountUrl } from '@/lib/chefu-account';
import { ShieldCheck } from 'lucide-react';

export default function SystemSettings() {
    return (
        <div className="flex w-full flex-col gap-8">
            <Header
                header="System Control Center"
                description="Administrative security is managed centrally through CheFu Account."
            />
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary" />
                        Admin account security
                    </CardTitle>
                    <CardDescription>
                        Manage your password, two-factor authentication, passkeys,
                        trusted devices, and recovery options in CheFu Account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() =>
                            window.location.assign(
                                chefuManageAccountUrl(window.location.href, 'security'),
                            )
                        }
                    >
                        Manage account security
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
