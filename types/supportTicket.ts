export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type Ticket = {
    id: string;
    title: string;
    message: string;
    createdAt: Date | string | number | null;
    email: string;
    userId: string;
    status: TicketStatus;
    priority: TicketPriority;
    userName: string;
    updatedAt: Date | string | number | null;
    overdue?: boolean;
    hasAgentReply?: boolean;
    lastAgentReplyAt?: Date | string | number | null;
};
