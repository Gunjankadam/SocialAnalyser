'use client';

import { useEffect } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning'; // You can extend types as needed
  onClose: () => void; // Function to close alert
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const alertClasses = 'p-4 rounded-lg shadow-lg text-black mb-4'; // Changed to const
  let borderColor, bgColor;

  switch (type) {
    case 'success':
      borderColor = 'border-green-400';
      bgColor = 'bg-green-100';
      break;
    case 'error':
      borderColor = 'border-red-400';
      bgColor = 'bg-red-100';
      break;
    case 'info':
      borderColor = 'border-blue-400';
      bgColor = 'bg-blue-100';
      break;
    case 'warning':
      borderColor = 'border-yellow-400';
      bgColor = 'bg-yellow-100';
      break;
    default:
      borderColor = 'border-gray-400';
      bgColor = 'bg-gray-100';
  }

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Automatically close after 5 seconds
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timeout on component unmount
  }, [onClose]);

  return (
    <div
      className={`${bgColor} ${borderColor} border-4 ${alertClasses} flex justify-between items-center`}
    >
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 p-1 text-xs bg-white text-black rounded-full hover:bg-gray-300"
      >
        X
      </button>
    </div>
  );
};

export default Alert;
