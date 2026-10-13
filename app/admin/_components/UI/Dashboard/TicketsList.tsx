import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Ticket } from '@/types/supportTicket';
import { toJsDate } from '@/utils/toJSDate';
import { Loader } from 'lucide-react';
import NoTicket from '../Tickets/NoTicket';

const TicketsList = ({
    loading,
    recentTickets,
    router,
}: {
    loading: boolean;
    recentTickets?: Ticket[];
    router: ReturnType<typeof import('next/navigation').useRouter>;
}) => {
    return (
        <Card className="lg:col-span-2 shadow-xl">
            <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader className="size-4 animate-spin" />
                        Loading tickets…
                    </div>
                ) : recentTickets?.length === 0 ? (
                    <NoTicket />
                ) : (
                    recentTickets?.map((t) => (
                        <div
                            key={t.id}
                            className="flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="truncate font-medium">
                                        {t.title}
                                    </span>
                                    <span
                                        className={[
                                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs',
                                            t.status === 'open'
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                : t.status === 'pending'
                                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                                  : t.status === 'resolved'
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                                        ].join(' ')}
                                    >
                                        {t.status.charAt(0).toUpperCase() +
                                            t.status.slice(1)}
                                    </span>
                                    {t.overdue && (
                                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                                            Overdue
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                    {t.userName} • Priority:{' '}
                                    <span
                                        className={cn(
                                            'font-bold',
                                            t.priority === 'urgent'
                                                ? 'text-red-500'
                                                : t.priority === 'high'
                                                  ? 'text-amber-500'
                                                  : t.priority === 'medium'
                                                    ? 'text-blue-500'
                                                    : 'text-green-500',
                                        )}
                                    >
                                        {t.priority}{' '}
                                    </span>
                                    • Created{' '}
                                    {toJsDate(t.createdAt)?.toLocaleDateString() ||
                                        'Unknown'}
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        router.push(`/admin/support-tickets/reply/${t.id}`)
                                    }
                                >
                                    View
                                </Button>
                                {(t.status === 'open' ||
                                    t.status === 'pending') && (
                                    <Button
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={() =>
                                            router.push(
                                                `/admin/support-tickets/reply/${t.id}?action=reply`,
                                            )
                                        }
                                    >
                                        Reply
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default TicketsList;
