'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import countryList from 'react-select-country-list';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';

const schema = z.object({
    countryCode: z.string().min(1, 'Please select your country'),
});

type AddCountryCodePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default function AddCountryCode({ params }: AddCountryCodePageProps) {
    const router = useRouter();
    const { id } = React.use(params);
    const countries = React.useMemo(() => countryList().getData(), []);
    const { user, loading } = useAuthUser();
    const routeUserId = id?.trim();

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: { countryCode: '' },
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        if (!user?.email) {
            toast.error('You must be signed in to save your country.');
            return;
        }
        if (!routeUserId) {
            toast.error('Invalid link. Missing user id.');
            return;
        }
        if (user.uid !== routeUserId) {
            toast.error('This link does not match your account.');
            return;
        }
        const selected = countries.find((c) => c.value === values.countryCode);
        const country = selected?.label ?? values.countryCode;

        try {
            await apiFetch('/api/academy/mobile/me', {
                method: 'PATCH',
                body: JSON.stringify({
                    countryCode: values.countryCode, // e.g., 'ZA'
                    country, // e.g., 'South Africa'
                }),
            });

            toast.success('Country saved', {
                description: `You selected: ${country}`,
            });

            router.push('/courses');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save country. Please try again.');
        }
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <main className="min-h-screen overflow-y-auto bg-muted/30 px-4 py-8 sm:py-12">
            <Card className="mx-auto w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Add your country</CardTitle>
                    <CardDescription>
                        Select your country to personalize course suggestions, language defaults, and regional support.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="countryCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Country</Label>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="mt-2 cursor-pointer bg-background">
                                                    <SelectValue placeholder="Select your country" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    position="popper"
                                                    sideOffset={8}
                                                    className="z-[200] max-h-[45vh]"
                                                >
                                                    {countries.map((c) => (
                                                        <SelectItem
                                                            key={c.value}
                                                            value={c.value}
                                                        >
                                                            {c.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="sticky bottom-0 -mx-6 border-t bg-card px-6 py-4">
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={isSubmitting || loading}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save & Continue'}
                                </Button>
                            </div>

                            {!user?.email && !loading && (
                                <p className="text-sm text-muted-foreground">
                                    Please sign in to continue.
                                </p>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    );
}
