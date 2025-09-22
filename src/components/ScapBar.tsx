'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import React from 'react';

const Scapbar = ({ email }: { email: string }) => {
  const router = useRouter();

  const getInitials = (email: string) => {
    if (!email) return '?';
    const name = email.split('@')[0];
    const parts = name.split('.');
    return parts.length > 1
      ? parts.map(p => p[0].toUpperCase()).join('')
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800">SCRAPED RESULTS</h1>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 group">
          <div
            title={email}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-105 transition"
          >
            {getInitials(email)}
          </div>
          <div className="text-base text-gray-600 dark:text-gray-300 hidden sm:block">
            <p className="font-semibold">{email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('userEmail');
            router.push('/auth/signin');
          }}
          className="flex items-center gap-1 text-sm px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Scapbar;
