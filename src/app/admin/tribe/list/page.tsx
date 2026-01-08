"use client";

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import DataTable from '../../DataTable';
import type { TableColumn } from 'react-data-table-component';
import Switch from '../../Switch';
import Link from 'next/link';

interface Tribe {
  tribeId: string;
  tribeName: string;
  category: string;
  createdDate: string;
  createdBy: string;
  totalMembers: number;
  totalPosts: number;
  icon: string;
  coverImage: string;
  isActive: boolean;
  statusLoading?: boolean;
}

export default function TribeListPage() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchTribeList = useCallback((currentPage: number = 1) => {
    setLoading(true);
    fetch('/api/admin/tribe/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: perPage,
        offset: (currentPage - 1) * perPage,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setTribes(data.data);
          setPagination((prev) => ({ ...prev, total: data.data.length }));
        }
      })
      .catch((error) => {
        console.error('Error fetching tribes:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [perPage]);

  useEffect(() => {
    fetchTribeList(page);
  }, [page, fetchTribeList]);

  const handleStatusChange = async (tribeId: string, newStatus: boolean) => {
    setTribes((prev) =>
      prev.map((tribe) =>
        tribe.tribeId === tribeId ? { ...tribe, statusLoading: true } : tribe
      )
    );

    try {
      const response = await fetch('/api/admin/tribe/activeinactive', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tribeId, isActive: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchTribeList(page);
      } else {
        toast.error(data.message || 'Failed to update tribe status');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error updating tribe status:', error);
    } finally {
      setTribes((prev) =>
        prev.map((tribe) =>
          tribe.tribeId === tribeId ? { ...tribe, statusLoading: false } : tribe
        )
      );
    }
  };

  const columns: TableColumn<Tribe>[] = [
    {
      name: 'Tribe ID',
      selector: (row: Tribe) => row.tribeId,
      sortable: true,
      cell: (row: Tribe) => (
        <Link href={`/admin/tribe/Detail/${row.tribeId}`} className="text-blue-500 underline">
          {row.tribeId}
        </Link>
      ),
    },
    {
      name: 'Tribe Name',
      selector: (row: Tribe) => row.tribeName,
      sortable: true,
    },
    {
      name: 'Category',
      selector: (row: Tribe) => row.category,
      sortable: true,
    },
    {
      name: 'Created Date',
      selector: (row: Tribe) => row.createdDate,
      sortable: true,
    },
    {
      name: 'Created By',
      selector: (row: Tribe) => row.createdBy,
      sortable: true,
    },
    {
      name: 'Total Members',
      selector: (row: Tribe) => row.totalMembers,
      sortable: true,
    },
    {
      name: 'Total Posts',
      selector: (row: Tribe) => row.totalPosts,
      sortable: true,
    },
    {
      name: 'Icon',
      cell: (row: Tribe) => (
        <img
          src={row.icon}
          alt="Icon"
          className="w-10 h-10 rounded-full object-cover border"
        />
      ),
    },
    {
      name: 'Cover Image',
      cell: (row: Tribe) => (
        <img
          src={row.coverImage}
          alt="Cover"
          className="w-10 h-10 rounded object-cover border"
        />
      ),
    },
    {
      name: 'Status',
      cell: (row: Tribe) => (
        <Switch
          checked={row.isActive}
          onChange={(checked) => handleStatusChange(row.tribeId, checked)}
          loading={row.statusLoading}
        />
      ),
    },
  ];

  return (
    <div>
      <DataTable
        title="Tribe List"
        columns={columns}
        data={tribes}
        pagination
        paginationServerMode
        paginationDefaultPage={page}
        paginationTotalRows={pagination.total}
        onPageChange={(pageNumber) => setPage(pageNumber)}
        striped
        highlightOnHover
        loading={loading}
      />
    </div>
  );
}