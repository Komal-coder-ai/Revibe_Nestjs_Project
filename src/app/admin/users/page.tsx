'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DataTable, { TableAction } from '../DataTable';
import { TableColumn } from 'react-data-table-component';
import Switch from '../Switch';

interface User {
    id: string;
    name: string;
    email: string;
    username?: string;
    mobile?: string;
    aadhar?: string;
    isVerified: boolean;
    profileType: string;
    profileImage?: string;
    joinedDate: string;
    status: number; // Changed to number (0 or 1)
    statusLoading?: boolean;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField] = useState('createdAt');
    const [sortDir] = useState(-1);
    const [pagination, setPagination] = useState({
        current: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Fetch users from API
    const fetchUserList = useCallback(
        (search: string = '', currentPage: number = 1) => {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: perPage.toString(),
                ...(search && { search }),
                sortBy: sortField,
                order: sortDir.toString(),
            });

            fetch(`/api/admin/user/userlist?${params}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        // Format the data: convert "N/A" strings to "-" and empty strings to "-"
                        const formattedUsers = data.data.map((user: User) => ({
                            ...user,
                            name: (user.name && user.name !== 'N/A') ? user.name : '-',
                            email: (user.email && user.email !== 'N/A') ? user.email : '-',
                            username: (user.username && user.username !== 'N/A') ? user.username : '-',
                            aadhar: (user.aadhar && user.aadhar !== 'N/A') ? user.aadhar : '-',
                            profileImage: user.profileImage || '',
                            mobile: (user.mobile && user.mobile !== 'N/A') ? user.mobile : '-',
                        }));
                        setUsers(formattedUsers);
                        setPagination(data.pagination);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching users:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [perPage, sortField, sortDir]
    );

    // Fetch on component mount and when dependencies change
    useEffect(() => {
        fetchUserList(searchTerm, page);
    }, [page, searchTerm, fetchUserList]);

    // Handle search
    const handleSearch = (search: string) => {
        setSearchTerm(search);
        setPage(1);
        fetchUserList(search, 1);
    };

    // Handle status change
    const handleStatusChange = async (userId: string, newStatus: number) => {
        // Update UI immediately with loading state
        setUsers(users.map(user =>
            user.id === userId ? { ...user, statusLoading: true } : user
        ));

        try {
            const response = await fetch('/api/admin/user/status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    status: newStatus,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Show success toast with API response message
                toast.success(data.message, {
                    duration: 3000,
                });
                
                // Refresh the user list from API to get updated data
                fetchUserList(searchTerm, page);
            } else {
                // Show error toast with API response message
                toast.error(data.message || 'Failed to update user status', {
                    duration: 3000,
                });
                
                // Revert on error
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, statusLoading: false } : user
                ));
                console.error('Failed to update status:', data.message);
            }
        } catch (error) {
            // Show error toast
            toast.error(error instanceof Error ? error.message : 'An unexpected error occurred', {
                duration: 3000,
            });
            
            console.error('Error updating user status:', error);
            // Revert on error
            setUsers(users.map(user =>
                user.id === userId ? { ...user, statusLoading: false } : user
            ));
        }
    };

    // Define table columns
    const columns: TableColumn<User>[] = [
        {
            name: 'ID',
            selector: (row) => row.id,
            sortable: true,
            cell: (row) => (
                <Link href={`/admin/users/Detail/${row.id}`}>
                    {row.id}
                </Link>
            ),
        },
        {
            name: 'Username',
            selector: (row) => row.username || '',
            sortable: true,
            cell: (row) => <span>{row.username}</span>,
        },
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <div className="flex items-center gap-3 py-2">

                    <span className="font-medium text-gray-800">{row.name}</span>
                </div>
            ),
        },

        {
            name: 'Email',
            selector: (row) => row.email,
            sortable: true,
            cell: (row) => <span>{row.email}</span>,
        },
        {
            name: 'Profile Image',
            selector: (row) => row.profileImage || '',
            sortable: true,
            cell: (row) => <span>
                {row.profileImage && row.profileImage !== '' ? (
                    <img
                        src={row.profileImage}
                        alt={row.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                            {row.name && row.name !== '-' ? row.name.charAt(0).toUpperCase() : '?'}
                        </span>
                    </div>
                )}
            </span>,
        },

        {
            name: 'Account Type',
            selector: (row) => row.profileType,
            sortable: true,
            cell: (row) => <span>{row.profileType}</span>,
        },
        {
            name: 'Aadhar',
            selector: (row) => row.aadhar || '',
            sortable: true,
            cell: (row) => <span>{row.aadhar}</span>,
        },
        {
            name: 'Joined Date',
            selector: (row) => row.joinedDate,
            sortable: true,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <Switch
                    checked={row.status === 1}
                    onChange={(checked) => handleStatusChange(row.id, checked ? 1 : 0)}
                    loading={row.statusLoading}
                />
            ),
        },

    ];



    return (
        <div>
            <DataTable
                title="User List"
                columns={columns}
                data={users}
                // actions={actions}
                searchPlaceholder="Search users by name, email, username, or mobile..."
                onSearch={handleSearch}
                pagination={true}
                paginationServerMode={true}
                paginationDefaultPage={page}
                paginationTotalRows={pagination.total}
                onPageChange={(pageNumber: number) => setPage(pageNumber)}
                striped={true}
                highlightOnHover={true}
                loading={loading}
            />
        </div>
    );
}
