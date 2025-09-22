'use client';
import React from 'react';

// components/StatCard.tsx
const StatCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className={`bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-md flex-1`}>
    <div className="text-gray-500 text-sm mb-2">{label}</div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="mt-2">{icon}</div>
  </div>
);

export default StatCard;
