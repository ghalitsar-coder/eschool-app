'use client';

import { useEffect } from 'react';
import { clearAuthCookies } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';

export default function ClearCookiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all cookies and storage
    clearAuthCookies();
    
    // Show success message
    alert('All authentication cookies and storage have been cleared!');
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Clearing Authentication Data
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we clear all cookies and storage...
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            You will be redirected to the login page shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
