'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinedDate: string;
  lastActive: string;
  address: string;
  city: string;
  country: string;
  profileImage: string;
}

interface Feed {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id') || '1';
  
  const [activeTab, setActiveTab] = useState<'details' | 'feeds'>('details');

  // Mock user data - replace with actual API call
  const userDetails: UserDetail = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Customer',
    status: 'Active',
    joinedDate: '2024-01-15',
    lastActive: '2024-12-30 14:30',
    address: '123 Main Street, Apt 4B',
    city: 'New York',
    country: 'United States',
    profileImage: 'JD',
  };

  const feeds: Feed[] = [
    {
      id: '1',
      type: 'Order',
      description: 'Placed order #ORD-001 for $299.99',
      timestamp: '2024-12-29 10:30',
      status: 'Completed',
    },
    {
      id: '2',
      type: 'Review',
      description: 'Left a 5-star review on product "Premium Headphones"',
      timestamp: '2024-12-28 15:45',
      status: 'Completed',
    },
    {
      id: '3',
      type: 'Purchase',
      description: 'Purchased item "Wireless Mouse" for $49.99',
      timestamp: '2024-12-25 09:20',
      status: 'Completed',
    },
    {
      id: '4',
      type: 'Account',
      description: 'Updated profile information',
      timestamp: '2024-12-20 11:00',
      status: 'Completed',
    },
    {
      id: '5',
      type: 'Login',
      description: 'Logged in from Chrome on Windows',
      timestamp: '2024-12-30 14:30',
      status: 'Active',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Order':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V10a1 1 0 011-1z" />
          </svg>
        );
      case 'Review':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'Purchase':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Account':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Login':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
          </div>
        </div>
      </div>

      {/* User Header Card */}
      <div className="bg-white mx-6 mt-6 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{userDetails.profileImage}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{userDetails.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{userDetails.email}</p>
              <div className="flex gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userDetails.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {userDetails.role}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {userDetails.status}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Joined</p>
            <p className="text-lg font-semibold text-gray-800">{userDetails.joinedDate}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mx-6 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Details
          </button>
          <button
            onClick={() => setActiveTab('feeds')}
            className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
              activeTab === 'feeds'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Feed List
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Full Name</label>
                    <p className="text-gray-800 mt-1">{userDetails.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Email Address</label>
                    <p className="text-gray-800 mt-1">{userDetails.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Phone Number</label>
                    <p className="text-gray-800 mt-1">{userDetails.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Role</label>
                    <p className="text-gray-800 mt-1">{userDetails.role}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Street Address</label>
                    <p className="text-gray-800 mt-1">{userDetails.address}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">City</label>
                    <p className="text-gray-800 mt-1">{userDetails.city}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Country</label>
                    <p className="text-gray-800 mt-1">{userDetails.country}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Account Status</label>
                    <p className="text-gray-800 mt-1">{userDetails.status}</p>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm text-gray-600 font-medium">Member Since</label>
                    <p className="text-gray-800 mt-2 font-semibold">{userDetails.joinedDate}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm text-gray-600 font-medium">Last Active</label>
                    <p className="text-gray-800 mt-2 font-semibold">{userDetails.lastActive}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feeds' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Feed</h3>
              <div className="space-y-4">
                {feeds.map((feed) => (
                  <div key={feed.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feed.type === 'Order' ? 'bg-blue-100 text-blue-600' :
                      feed.type === 'Review' ? 'bg-yellow-100 text-yellow-600' :
                      feed.type === 'Purchase' ? 'bg-green-100 text-green-600' :
                      feed.type === 'Account' ? 'bg-purple-100 text-purple-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {getActivityIcon(feed.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800">{feed.type}</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          feed.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {feed.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{feed.description}</p>
                      <p className="text-gray-500 text-xs mt-2">{feed.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white mx-6 mb-6 rounded-lg shadow-md p-6 flex gap-3 justify-end">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Edit User
        </button>
      </div>
    </div>
  );
}
