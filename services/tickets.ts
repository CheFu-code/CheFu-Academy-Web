import { apiFetch } from '@/lib/api-client';
import { Ticket } from '@/types/supportTicket';
import { toJsDate } from '@/utils/toJSDate';

type TicketResponse = {
    tickets: Ticket[];
};

function normalizeTicket(ticket: Ticket): Ticket {
    return {
        ...ticket,
        createdAt: toJsDate(ticket.createdAt),
        updatedAt: toJsDate(ticket.updatedAt),
        lastAgentReplyAt: toJsDate(ticket.lastAgentReplyAt),
    };
}

async function fetchTickets(scope?: 'all' | 'recent') {
    const params = new URLSearchParams();
    if (scope === 'all') params.set('scope', 'all');
    const query = params.toString();
    const response = await apiFetch(
        `/api/academy/mobile/support-tickets${query ? `?${query}` : ''}`,
    );
    const result = (await response.json()) as TicketResponse;
    return result.tickets.map(normalizeTicket);
}

function subscribe(
    scope: 'all' | 'recent',
    onUpdate: (tickets: Ticket[]) => void,
    onError?: (error: Error) => void,
) {
    let active = true;
    let pending = false;
    const load = async () => {
        if (pending) return;
        pending = true;
        try {
            const tickets = await fetchTickets('all');
            if (active) onUpdate(scope === 'recent' ? tickets.slice(0, 3) : tickets);
        } catch (error) {
            const normalized =
                error instanceof Error ? error : new Error('Unable to load tickets.');
            if (onError) onError(normalized);
            else console.error('Ticket list request failed:', normalized);
        } finally {
            pending = false;
        }
    };
    void load();
    const timer = window.setInterval(load, 30_000);
    return () => {
        active = false;
        window.clearInterval(timer);
    };
}

export function subscribeToRecentTickets(
    onUpdate: (tickets: Ticket[]) => void,
    onError?: (error: Error) => void,
) {
    return subscribe('recent', onUpdate, onError);
}

export function subscribeToAllTickets(
    onUpdate: (tickets: Ticket[]) => void,
    onError?: (error: Error) => void,
) {
    return subscribe('all', onUpdate, onError);
}

export async function getTicketById(id: string): Promise<Ticket> {
    const response = await apiFetch(
        `/api/academy/mobile/support-tickets/${encodeURIComponent(id)}`,
    );
    const result = (await response.json()) as { ticket: Ticket };
    return normalizeTicket(result.ticket);
}
