'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { chefuManageAccountUrl } from '@/lib/chefu-account';
import { ShieldCheck } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import SecurityEventLog from './SecurityEventLog';

export default function SecurityTab() {
    return (
        <TabsContent value="security" className="mt-4 space-y-4 px-2 sm:mt-6 sm:px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="size-5 text-cyan-500" />
                        CheFu Account security
                    </CardTitle>
                    <CardDescription>
                        Sign-in methods, password, two-factor authentication, passkeys,
                        trusted devices, and account deletion are managed centrally.
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
                        Manage security
                    </Button>
                </CardContent>
            </Card>
            <SecurityEventLog />
        </TabsContent>
    );
}
