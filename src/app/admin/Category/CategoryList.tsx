import { useEffect, useState } from 'react';
import DataTable from '../users/DataTable';
import { TableColumn } from 'react-data-table-component';
import { Button } from '@mui/material';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  active: number;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tribe/category/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 1, limit: 50, sort: { createdAt: -1 } })
      });
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns: TableColumn<Category>[] = [
    {
      name: 'ID',
      selector: (row) => row._id,
      sortable: true,
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row) => row.active === 1 ? 'Active' : 'Inactive',
      sortable: true,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Category List</h2>
        <Link href="/admin/Category/AddUpdate">
          <Button variant="contained" color="primary">Add Category</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        pagination={false}
        striped
        highlightOnHover
      />
    </div>
  );
}
