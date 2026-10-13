'use client';

import SupportTicketsUI from '@/components/ui/SupportTicketsUI';
import { generateTicketID } from '@/helpers/generateRandomID';
import { useAuthUser } from '@/hooks/useAuthUser';
import { apiFetch } from '@/lib/api-client';
import { Ticket, TicketPriority } from '@/types/supportTicket';
import { downloadTicketPDF } from '@/utils/download-pdf';
import { toJsDate } from '@/utils/toJSDate';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const SupportTickets = () => {
    const router = useRouter();
    const { user } = useAuthUser();
    const [title, setTitle] = React.useState<string>('');
    const [message, setMessage] = React.useState<string>('');
    const [priority, setPriority] = React.useState<TicketPriority>('low');
    const [ticketID, setTicketID] = React.useState<string>('');
    const [userTickets, setUserTickets] = React.useState<Ticket[]>([]);
    const [loadingTickets, setLoadingTickets] = React.useState(true);

    const [submittingTicket, setSubmittingTicket] =
        React.useState<boolean>(false);

    const handleGenerateTicketID = () => {
        const id = generateTicketID();
        setTicketID(id);
    };

    const submitTicket = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title.');
            return;
        }
        if (!message.trim()) {
            toast.error('Please enter a message/description.');
            return;
        }

        setSubmittingTicket(true);
        try {
            const response = await apiFetch('/api/academy/mobile/support-tickets', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    message: message.trim(),
                    priority,
                    requestedId: ticketID || undefined,
                }),
            });
            const result = (await response.json()) as { ticket: Ticket };
            const ticket = {
                ...result.ticket,
                createdAt: new Date(result.ticket.createdAt || Date.now()),
                updatedAt: new Date(result.ticket.updatedAt || Date.now()),
            };

            toast.success('Ticket submitted successfully!', {
                description:
                    'Your ticket has been created and our support team will contact you soon.',
            });
            setTitle('');
            setMessage('');
            setTicketID('');

            downloadTicketPDF(ticket, {
                title: 'Support Ticket',
                fileName: `${ticket.id}-ticket.pdf`,
                logoDataUrl: '/logo.png',
            });

            router.back();
        } catch (error) {
            toast.error('Failed to submit ticket. Please try again.');
            console.error('Error submitting ticket:', error);
        } finally {
            setSubmittingTicket(false);
        }
    };

    React.useEffect(() => {
        if (!user?.email) return;

        const fetchTickets = async () => {
            try {
                const response = await apiFetch(
                    '/api/academy/mobile/support-tickets',
                );
                const result = (await response.json()) as {
                    tickets: Array<Ticket & { createdAt: string; updatedAt: string }>;
                };
                setUserTickets(
                    result.tickets.map((ticket) => ({
                        ...ticket,
                        createdAt: toJsDate(ticket.createdAt),
                        updatedAt: toJsDate(ticket.updatedAt),
                    })),
                );
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoadingTickets(false);
            }
        };

        fetchTickets();
    }, [user?.email]);

    return (
        <SupportTicketsUI
            ticketID={ticketID}
            handleGenerateTicketID={handleGenerateTicketID}
            submittingTicket={submittingTicket}
            submitTicket={submitTicket}
            title={title}
            setTitle={setTitle}
            message={message}
            setMessage={setMessage}
            priority={priority}
            setPriority={setPriority}
            userTickets={userTickets}
            loadingTickets={loadingTickets}
        />
    );
};

export default SupportTickets;
