import Header from '@/components/Shared/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EditableRolesCell } from '@/app/admin/_components/EditableRoleCell';
import DeleteModal from '@/app/admin/_components/UI/DeleteModal';
import { apiFetch } from '@/lib/api-client';
import { ManageUsersProps } from '@/types';
import { toJsDate } from '@/utils/toJSDate';
import { Loader2, Search, Trash2 } from 'lucide-react';
import React from 'react';

const ManageUsersUI: React.FC<ManageUsersProps> = ({
    loading,
    search,
    setSearch,
    filteredUsers,
    total,
    confirmOpen,
    setConfirmOpen,
    selectedUser,
    deletingId,
    isDeletingSelected,
    deleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
}) => (
    <div className="space-y-4 p-2 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Header
                header="Manage Users"
                description="Manage user access across your platform."
            />
            <div className="relative w-full sm:w-90">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, email, or role..."
                    className="pl-9"
                    aria-label="Search users"
                />
            </div>
        </div>

        <Card className="border-muted/60 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Users
                    <Badge variant="secondary">{loading ? '…' : total}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex justify-center py-14">
                        <Loader2 className="size-5 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Last sign-in</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => {
                                    const createdAt = toJsDate(user.createdAt);
                                    const lastLogin = toJsDate(user.lastLogin);
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={user.profilePicture} />
                                                        <AvatarFallback>
                                                            {(user.fullname || user.email || '?')
                                                                .slice(0, 1)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">
                                                        {user.fullname || 'Unnamed user'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <EditableRolesCell
                                                    userEmail={user.email}
                                                    roles={user.roles ?? []}
                                                    allRoles={[
                                                        'admin',
                                                        'founder',
                                                        'viewer',
                                                        'support',
                                                        'manager',
                                                        'student',
                                                    ]}
                                                    onSave={async (email, roles) => {
                                                        await apiFetch(
                                                            '/api/academy/mobile/admin/users/roles',
                                                            {
                                                                method: 'PATCH',
                                                                body: JSON.stringify({
                                                                    email,
                                                                    roles,
                                                                }),
                                                            },
                                                        );
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {createdAt?.toLocaleDateString() || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {lastLogin?.toLocaleDateString() || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!user.roles?.includes('admin') && (
                                                    <Button
                                                        disabled={deleting}
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(user)}
                                                    >
                                                        {deleting &&
                                                        deletingId === (user.uid || user.id) ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-4" />
                                                        )}
                                                        Delete
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>

        <DeleteModal
            confirmOpen={confirmOpen}
            setConfirmOpen={setConfirmOpen}
            selectedUser={selectedUser}
            closeDeleteModal={closeDeleteModal}
            confirmDelete={confirmDelete}
            deletingId={deletingId}
            isDeletingSelected={isDeletingSelected}
        />
    </div>
);

export default ManageUsersUI;
