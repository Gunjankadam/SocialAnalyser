'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BlackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const BlackButton = ({ children, className, ...props }: BlackButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        'bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700 transition',
        className
      )}
    >
      {children}
    </button>
  );
};
