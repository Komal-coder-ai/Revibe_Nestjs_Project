'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-dark.css';

// Dynamically import SwaggerUI with no SSR and suppress React warnings
const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then((mod) => {
    // Suppress the unsafe lifecycle warnings from swagger-ui-react
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('UNSAFE_componentWillReceiveProps')
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    return mod;
  }),
  { ssr: false }
);

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/swagger')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading API spec:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading API Documentation...</div>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600">Failed to load API documentation</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">NewRevibe API Documentation</h1>
          <p className="mt-2 text-blue-100">Interactive API testing and documentation</p>
          <div className="mt-3 flex gap-4 text-sm">
            <a href="/" className="text-blue-100 hover:text-white transition-colors">← Back to Home</a>
            <a href="/admin/login" className="text-blue-100 hover:text-white transition-colors">Admin Login</a>
            <a href="/customer/login" className="text-blue-100 hover:text-white transition-colors">Customer Login</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        {spec ? <SwaggerUI spec={spec} /> : <div className="text-red-600">Failed to load API documentation</div>}
      </div>
    </div>
  );
}
