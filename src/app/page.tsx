import Link from 'next/link';
import AdminLogin from './admin/login/page';

export default function Home() {
  return (
    // <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    //     <div className="text-center mb-16">
    //       <h1 className="text-5xl font-bold text-gray-800 mb-4">
    //         Welcome to NewRevibe
    //       </h1>
    //       <p className="text-xl text-gray-600 mb-8">
    //         A modern platform with separate admin and customer portals
    //       </p>
    //     </div>

    //     <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
    //       {/* Admin Card */}
    //       <div className="bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow">
    //         <div className="text-center">
    //           <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
    //             <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    //             </svg>
    //           </div>
    //           <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Portal</h2>
    //           <p className="text-gray-600 mb-6">
    //             Manage your platform, view analytics, and control customer data
    //           </p>
    //           <Link 
    //             href="/admin/login"
    //             className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    //           >
    //             Admin Login
    //           </Link>
    //         </div>
    //       </div>

    //       {/* Customer Card */}
    //       <div className="bg-white rounded-lg shadow-xl p-8 hover:shadow-2xl transition-shadow">
    //         <div className="text-center">
    //           <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
    //             <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //             </svg>
    //           </div>
    //           <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Portal</h2>
    //           <p className="text-gray-600 mb-6">
    //             Access your account, view orders, and manage your profile
    //           </p>
    //           <Link 
    //             href="/customer/login"
    //             className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
    //           >
    //             Customer Login
    //           </Link>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Features Section */}
    //     <div className="mt-20">
    //       <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
    //         Platform Features
    //       </h3>
    //       <div className="grid md:grid-cols-3 gap-8">
    //         <div className="text-center">
    //           <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
    //             <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    //             </svg>
    //           </div>
    //           <h4 className="text-xl font-semibold text-gray-800 mb-2">Secure Authentication</h4>
    //           <p className="text-gray-600">Password encryption with bcryptjs</p>
    //         </div>
    //         <div className="text-center">
    //           <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
    //             <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    //             </svg>
    //           </div>
    //           <h4 className="text-xl font-semibold text-gray-800 mb-2">MongoDB Database</h4>
    //           <p className="text-gray-600">Robust data storage with Mongoose</p>
    //         </div>
    //         <div className="text-center">
    //           <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
    //             <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    //             </svg>
    //           </div>
    //           <h4 className="text-xl font-semibold text-gray-800 mb-2">Next.js 15</h4>
    //           <p className="text-gray-600">Fast, modern React framework</p>
    //         </div>
    //       </div>
    //     </div>

    //     {/* API Documentation Link */}
    //     <div className="mt-16 text-center">
    //       <div className="inline-block bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md p-6">
    //         <h3 className="text-xl font-bold text-gray-800 mb-2">API Documentation</h3>
    //         <p className="text-gray-600 mb-4">Test and explore our APIs with Swagger UI</p>
    //         <Link 
    //           href="/api-docs"
    //           className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
    //         >
    //           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    //           </svg>
    //           View API Docs
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <AdminLogin/>
  );
}
