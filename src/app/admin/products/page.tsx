'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image: string;
}

export default function ProductsPage() {
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 79.99,
      stock: 45,
      status: 'Active',
      image: '🎧',
    },
    {
      id: '2',
      name: 'Smart Watch',
      category: 'Electronics',
      price: 199.99,
      stock: 23,
      status: 'Active',
      image: '⌚',
    },
    {
      id: '3',
      name: 'Running Shoes',
      category: 'Sports',
      price: 89.99,
      stock: 67,
      status: 'Active',
      image: '👟',
    },
    {
      id: '4',
      name: 'Coffee Maker',
      category: 'Home',
      price: 49.99,
      stock: 0,
      status: 'Out of Stock',
      image: '☕',
    },
  ]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/add"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">In Stock</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{products.filter(p => p.stock > 0).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            ${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Categories</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {new Set(products.map(p => p.category)).size}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Product List</h3>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Sports</option>
                <option>Home</option>
              </select>
              <input
                type="text"
                placeholder="Search products..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-6xl text-center mb-3">{product.image}</div>
                <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
