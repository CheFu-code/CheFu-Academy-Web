'use client';

import * as React from 'react';

import { NavDocuments } from '@/components/sidebar/nav-documents';
import { NavMain } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { useAuthUser } from '@/hooks/useAuthUser';
import Image from 'next/image';
import { advanced, documents, navMain } from '@/constants/Data';
import { NavAdvanced } from './nav-advanced';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, loading } = useAuthUser();

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <a href="/admin">
                                <Image
                                    src="/logo.png"
                                    alt="CheFu Academy"
                                    width={30}
                                    height={30}
                                    className='bg-muted-foreground/20 rounded-full'
                                />
                                <span className="text-base font-semibold">
                                    CheFu Academy
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navMain} />
                <NavDocuments items={documents} />
                <NavAdvanced items={advanced}/>
            </SidebarContent>

            <SidebarFooter>
                {!loading && user && (
                    <NavUser
                        user={{
                            fullname: user.fullname ?? 'Unnamed User',
                            email: user.email,
                            avatar: user.profilePicture || 'logo.png',
                        }}
                    />
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
