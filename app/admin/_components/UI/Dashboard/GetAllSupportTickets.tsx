import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Ticket, TicketPriority } from '@/types/supportTicket';
import { Loader } from 'lucide-react';
import NoTicket from '../Tickets/NoTicket';
import {
    PriorityFilter,
    StatusFilter,
} from '@/app/admin/support-tickets/all/page';
import { PRIORITY_VALUES } from '@/constants/Data';
import { toJsDate } from '@/utils/toJSDate';

const GetAllSupportTickets = ({
    filteredTickets,
    router,
    loading,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    onlyOverdue,
    setOnlyOverdue,
    agentReply,
    setAgentReply,
    isStatusFilter,
}: {
    filteredTickets: Ticket[];
    router: ReturnType<typeof import('next/navigation').useRouter>;
    loading: boolean;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    status: Ticket['status'] | 'all';
    setStatus: React.Dispatch<React.SetStateAction<Ticket['status'] | 'all'>>;
    priority: Ticket['priority'] | 'all';
    setPriority: React.Dispatch<React.SetStateAction<'all' | TicketPriority>>;
    onlyOverdue: boolean;
    setOnlyOverdue: React.Dispatch<React.SetStateAction<boolean>>;
    agentReply: 'all' | 'agent' | 'none';
    setAgentReply: React.Dispatch<
        React.SetStateAction<'all' | 'agent' | 'none'>
    >;
    isStatusFilter: (v: string) => v is StatusFilter;
}) => {
    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title, user, or ID…"
                        className="h-9 w-55 rounded-md border bg-background px-3 text-sm shadow-sm"
                    />

                    <select
                        value={status}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const v = e.target.value;
                            if (isStatusFilter(v)) setStatus(v); // now v is correctly typed
                        }}
                        className="h-9 rounded-md border bg-background px-2 text-sm shadow-sm"
                        aria-label="Filter by status"
                    >
                        <option value="all">Status: All</option>
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const v = e.target.value;

                            if (PRIORITY_VALUES.includes(v as PriorityFilter)) {
                                setPriority(v as PriorityFilter);
                            }
                        }}
                        className="h-9 rounded-md border bg-background px-2 text-sm shadow-sm"
                        aria-label="Filter by priority"
                    >
                        <option value="all">Priority: All</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    <select
                        value={agentReply}
                        onChange={(e) =>
                            setAgentReply(
                                e.target.value as 'all' | 'agent' | 'none',
                            )
                        }
                        className="h-9 rounded-md border bg-background px-2 text-sm shadow-sm"
                        aria-label="Filter by agent reply"
                    >
                        <option value="all">Reply: All</option>
                        <option value="agent">Replied</option>
                        <option value="none">Not replied</option>
                    </select>

                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={onlyOverdue}
                            onChange={(e) => setOnlyOverdue(e.target.checked)}
                            className="h-4 w-4 accent-rose-600"
                        />
                        Overdue only
                    </label>

                    {/* Reset */}
                    <Button
                        onClick={() => {
                            setSearch('');
                            setStatus('all');
                            setPriority('all');
                            setOnlyOverdue(false);
                            setAgentReply('all');
                        }}
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer"
                        title="Reset filters"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            <Card className="shadow-xl mt-6">
                <CardHeader>
                    <CardTitle>Support Tickets</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader className="size-4 animate-spin" />
                            Loading tickets…
                        </div>
                    ) : filteredTickets?.length === 0 ? (
                        <NoTicket />
                    ) : (
                        filteredTickets?.map((t) => (
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
                                            router.push(
                                                `/admin/support-tickets/reply/${t.id}`,
                                            )
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
        </div>
    );
};

export default GetAllSupportTickets;
