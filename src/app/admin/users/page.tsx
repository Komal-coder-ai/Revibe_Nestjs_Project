'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable, { TableAction } from '../DataTable';
import { TableColumn } from 'react-data-table-component';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedDate: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Customer',
      status: 'Active',
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Customer',
      status: 'Active',
      joinedDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Admin',
      status: 'Active',
      joinedDate: '2024-03-10',
    },
  ]);

  // Define table columns
  const columns: TableColumn<User>[] = [
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{row.name.charAt(0)}</span>
          </div>
          <span className="font-medium text-gray-800">{row.name}</span>
        </div>
      ),
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: 'Role',
      selector: (row) => row.role,
      sortable: true,
      cell: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {row.status}
        </span>
      ),
    },
    {
      name: 'Joined Date',
      selector: (row) => row.joinedDate,
      sortable: true,
    },
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      label: 'View',
      onClick: (row: User) => router.push(`/admin/users/Detail?id=${row.id}`),
      color: 'blue',
      title: 'View Details',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: 'Edit',
      onClick: (row: User) => console.log('Edit user:', row.id),
      color: 'green',
      title: 'Edit User',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      label: 'Delete',
      onClick: (row: User) => console.log('Delete user:', row.id),
      color: 'red',
      title: 'Delete User',
    },
  ];

  return (
    <div>
      <DataTable
        title="User List"
        columns={columns}
        data={users}
        actions={actions}
        searchPlaceholder="Search users..."
        pagination={true}
        striped={true}
        highlightOnHover={true}
      />
    </div>
  );
}
