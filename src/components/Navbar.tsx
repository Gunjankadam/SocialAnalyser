'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-transparent absolute top-0 left-0 w-full z-50">
      <div className="text-white font-bold text-xl">SocialAnalyser</div>
 
      <div className="flex gap-4">
        <Link href="/auth/signin" className="flex items-center gap-2 px-3 py-1.5 bg-black text-sm text-white rounded-md hover:bg-white hover:text-black transition border-t border-gray-200">
          Sign In
        </Link>
        <Link href="/auth/signup" className="flex items-center gap-2 px-3 py-1.5 bg-black text-sm text-white rounded-md hover:bg-white hover:text-black transition border-t border-gray-200">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
