type SerializedDate = Date | string | number | null;

/* -------------------- Chat Typing State -------------------- */
export type ChatTypingStatus = {
    user: boolean;
    admin: boolean;
};

/* -------------------- Support Chat Document -------------------- */
export type SupportChat = {
    userId: string;
    userName: string;
    userEmail: string;

    status: 'open' | 'closed';

    lastMessage: string;
    lastMessageAt: SerializedDate;

    createdAt: SerializedDate;
    updatedAt: SerializedDate;

    userOnline: boolean;
    adminOnline: boolean;

    typing: ChatTypingStatus;
};

/* -------------------- Message Document -------------------- */
export type SupportMessage = {
    sender: 'user' | 'admin';
    text: string;
    createdAt: SerializedDate;
    read: boolean;
};
