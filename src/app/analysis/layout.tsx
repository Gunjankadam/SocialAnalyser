'use client'

// app/dashboard/layout.tsx
import React from 'react';

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat backdrop-blur-md"
      style={{ backgroundImage: "url('/directd.jpg')" }}
    >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[8px] z-0" />
      {children}
    </div>
  );
}
