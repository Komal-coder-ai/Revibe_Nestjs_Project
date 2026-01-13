"use client";
import { useEffect, useState } from 'react';
// import DataTable from '../users/DataTable';
import { TableColumn } from 'react-data-table-component';
import { Button } from '@mui/material';
import Link from 'next/link';
import DataTable, { TableAction } from '../DataTable';
import CategoryFormModal from './CategoryFormModal';

interface Category {
  _id: string;
  name: string;
  active: number;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | undefined>(undefined);

  const fetchCategoryList = (search: string = '', currentPage: number = 1) => {
    setLoading(true);
    fetch('/api/admin/tribe/category/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: currentPage,
        limit: perPage,
        sort: { createdAt: -1 },
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
          setPagination(data.pagination);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategoryList(searchTerm, page);
  }, [page, searchTerm]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setPage(1);
    fetchCategoryList(search, 1);
  };

  const handleAdd = () => {
    setEditCategory(undefined);
    setModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setModalOpen(true);
  };

  const columns: TableColumn<Category>[] = [
    {
      name: 'ID',
      selector: (row) => row._id,
      sortable: true,
      cell: (row) => (
        <span className="text-blue-700 cursor-pointer" onClick={() => handleEdit(row)}>{row._id}</span>
      ),
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <span className="cursor-pointer" onClick={() => handleEdit(row)}>{row.name}</span>
      ),
    },
    {
      name: 'Status',
      selector: (row) => row.active === 1 ? 'Active' : 'Inactive',
      sortable: true,
    },
  ];

  return (
    <div>
      {/* <div className="flex justify-between items-center w-full mb-4">
        <span className="text-xl font-bold">Category List</span>
        <Button variant="contained" color="primary" onClick={handleAdd}  sx={{ textTransform: 'none' }}>Add Category</Button>
      </div> */}
      <DataTable
        title="Category List"
        columns={columns}
        data={categories}
        searchPlaceholder="Search categories by name..."
        onSearch={handleSearch}
        pagination={true}
        paginationServerMode={true}
        paginationDefaultPage={page}
        paginationTotalRows={pagination.total}
        onPageChange={(pageNumber: number) => setPage(pageNumber)}
        striped={true}
        highlightOnHover={true}
        loading={loading}
          showButton={true}
  buttonLabel="Add Category"
    onButtonClick={() => handleAdd()}
      />
      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchCategoryList(searchTerm, page)}
        initialData={editCategory}
      />
    </div>
  );
}
