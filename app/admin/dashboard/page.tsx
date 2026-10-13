'use client';

import {
    getAdminMetrics,
} from '@/helpers/getAnalytics';
import { subscribeToRecentTickets } from '@/services/tickets';
import { Analytics } from '@/types/analytics';
import { Ticket } from '@/types/supportTicket';
import { useEffect, useState } from 'react';
import DashboardUI from '../_components/UI/DashboardUI';

const Dashboard = () => {
    const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);

    const [analytics, setAnalytics] = useState<Analytics>({
        totalUsers: null,
        monthlyUsers: null,
        totalCourses: null,
        monthlyCourses: null,
        totalVideos: null,
        monthlyVideos: null,
        totalAPIKeys: null,
        monthlyAPIKeys: null,
        openTickets: null,
        pendingTickets: null,
        resolvedTickets: null,
        overdueTickets: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const result = await getAdminMetrics();
                setAnalytics(result);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToRecentTickets(setRecentTickets);
        return () => unsubscribe(); // cleanup on unmount
    }, []);

    return (
        <DashboardUI
            totalUsers={analytics.totalUsers}
            monthlyUsers={analytics.monthlyUsers}
            loading={loading}
            totalCourses={analytics.totalCourses}
            monthlyCourses={analytics.monthlyCourses}
            totalVideos={analytics.totalVideos}
            monthlyVideos={analytics.monthlyVideos}
            totalAPIKeys={analytics.totalAPIKeys}
            monthlyAPIKeys={analytics.monthlyAPIKeys}
            recentTickets={recentTickets}
            openTickets={analytics.openTickets}
            pendingTickets={analytics.pendingTickets}
            resolvedTickets={analytics.resolvedTickets}
            overdueTickets={analytics.overdueTickets}
        />
    );
};

export default Dashboard;
