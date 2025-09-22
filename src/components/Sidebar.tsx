'use client';

// components/Sidebar.tsx
import { Home, BarChart2, FileText, PieChart, Activity, Settings } from 'lucide-react'; // Removed User import
import Link from 'next/link';

const Sidebar = () => (
  <aside className="w-64 bg-white/80 backdrop-blur-md p-4 shadow-md min-h-screen hidden md:block">
    <h2 className="text-xl font-bold mb-6">SocialAnalyser</h2>
    <nav className="space-y-3 text-sm">
      <Link href="/dashboard" className="flex items-center gap-2 text-base hover:text-blue-600">
        <Home size={16} />
        Dashboard
      </Link>
      <Link href="/extraction" className="flex items-center gap-2 text-base hover:text-blue-600">
        <BarChart2 size={16} />
        Data Extraction
      </Link>
      <Link href="/scraped" className="flex items-center gap-2 text-base hover:text-blue-600">
        <FileText size={16} />
        Scraped Results
      </Link>
      <Link href="/analysis" className="flex items-center gap-2 text-base hover:text-blue-600">
        <Activity size={16} />
        Analysis
      </Link>
      <Link href="/visual" className="flex items-center gap-2 text-base hover:text-blue-600">
        <PieChart size={16} />
        Visualization
      </Link>
      <Link href="/settings" className="flex items-center gap-2 text-base hover:text-blue-600">
        <Settings size={16} />
        Settings
      </Link>
    </nav>
  </aside>
);

export default Sidebar;
