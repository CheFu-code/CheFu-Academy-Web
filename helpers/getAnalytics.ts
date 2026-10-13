import { apiFetch } from '@/lib/api-client';

export type AdminMetrics = {
    totalUsers: number;
    monthlyUsers: number;
    totalCourses: number;
    monthlyCourses: number;
    totalVideos: number;
    monthlyVideos: number;
    totalAPIKeys: number;
    monthlyAPIKeys: number;
    openTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
    overdueTickets: number;
    unreadTickets: number;
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
    const response = await apiFetch('/api/academy/mobile/admin/metrics');
    return (await response.json()) as AdminMetrics;
}

export async function getTotalUnreadTickets() {
    const metrics = await getAdminMetrics();
    return metrics.unreadTickets;
}
