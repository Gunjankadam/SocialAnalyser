// components/ui/input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700" htmlFor={props.id}>
          {label}
        </label>
        <input
          {...props}
          ref={ref}
          className={`px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
