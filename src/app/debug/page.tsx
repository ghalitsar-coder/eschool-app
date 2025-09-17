'use client';

import { useState } from 'react';
import { clearAuthCookies, getCookieValue, isTokenExpired } from '@/lib/auth-utils';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loginResponse, setLoginResponse] = useState<any>(null);

  const checkCookies = () => {
    const token = getCookieValue('token');
    const refreshToken = getCookieValue('refresh_token');
    
    const info = {
      token: token ? 'exists' : 'none',
      tokenValue: token || 'N/A',
      refreshToken: refreshToken ? 'exists' : 'none',
      isExpired: token ? isTokenExpired(token) : 'N/A',
      allCookies: document.cookie
    };
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        info.tokenPayload = payload;
      } catch (e) {
        info.tokenPayload = 'Invalid token';
      }
    }
    
    setDebugInfo(info);
  };

  const testLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'bendahara1@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();
      setLoginResponse(data);

      if (data.success && data.data.access_token) {
        // Set cookies manually
        document.cookie = `token=${data.data.access_token}; path=/; max-age=86400`;
        if (data.data.refresh_token) {
          document.cookie = `refresh_token=${data.data.refresh_token}; path=/; max-age=604800`;
        }
        
        // Check cookies after setting
        setTimeout(checkCookies, 1000);
      }
    } catch (error) {
      setLoginResponse({ error: error.message });
    }
  };

  const clearAll = () => {
    clearAuthCookies();
    setDebugInfo({});
    setLoginResponse(null);
    setTimeout(checkCookies, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="space-y-4">
              <button
                onClick={checkCookies}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Check Cookies & Token
              </button>
              
              <button
                onClick={testLogin}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Test Login (bendahara1)
              </button>
              
              <button
                onClick={clearAll}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
              >
                Clear All Cookies
              </button>
            </div>
          </div>

          {/* Cookie Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cookie Information</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Login Response */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Login Response</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {loginResponse ? JSON.stringify(loginResponse, null, 2) : 'No login response yet'}
            </pre>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/login" className="bg-gray-200 text-center py-2 px-4 rounded hover:bg-gray-300">
              Login Page
            </a>
            <a href="/dashboard" className="bg-gray-200 text-center py-2 px-4 rounded hover:bg-gray-300">
              Dashboard
            </a>
            <a href="/kas" className="bg-gray-200 text-center py-2 px-4 rounded hover:bg-gray-300">
              Kas Page
            </a>
            <a href="/clear-cookies" className="bg-gray-200 text-center py-2 px-4 rounded hover:bg-gray-300">
              Clear Cookies Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
