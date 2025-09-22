import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Background container with a blurred effect */}
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/directd.jpg')] backdrop-blur-lg">
        {/* FULLSCREEN BLUR LAYER */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[8px] z-0" />
        {/* You can replace the background URL with any image */}
      </div>

      {children}
    </div>
  );
}
