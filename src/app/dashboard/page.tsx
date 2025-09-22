'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import { Database, FileCheck2, TvMinimalPlay } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ScrapeHistoryItem {
  query: string;
  file_size: number;
  platform: string;
  uploaded_at: string;
}

interface ScrapeData {
  dates: string[];
  cumulativeScrapes: number[];
  growthRate: number[];
}

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>('User');
  const [pastQueries, setPastQueries] = useState<string[]>([]);
  const [totalDataScraped, setTotalDataScraped] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [youtubeScrapes, setYoutubeScrapes] = useState<number>(0);
  const [redditScrapes, setRedditScrapes] = useState<number>(0);
  const [scrapeData, setScrapeData] = useState<ScrapeData | null>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
      fetchUserHistory(userEmail);
    }
  }, []);

  const fetchUserHistory = async (email: string) => {
    try {
      const response = await fetch(`https://mainpython-fraa.onrender.com/user-history?email=${email}`);
      const data = await response.json();
      if (response.ok && data.history) {
        processScrapeData(data.history);
        const queries: string[] = [];
        let totalSize = 0;
        let youtubeCount = 0;
        let redditCount = 0;
        let fileCount = 0;

        data.history.forEach((item: ScrapeHistoryItem) => {
          queries.push(item.query);
          totalSize += item.file_size;
          fileCount++;

          if (item.platform === 'youtube') youtubeCount++;
          if (item.platform === 'reddit') redditCount++;
        });

        setPastQueries(queries);
        setTotalDataScraped(totalSize); // In bytes
        setTotalFiles(fileCount);
        setYoutubeScrapes(youtubeCount);
        setRedditScrapes(redditCount);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  };

  const processScrapeData = (history: ScrapeHistoryItem[]) => {
    const sortedHistory = history.sort(
      (a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
    );
    const dates = sortedHistory.map((item) => new Date(item.uploaded_at).toLocaleDateString());
    const cumulativeScrapes: number[] = [];
    let totalScrapes = 0;

    sortedHistory.forEach((item) => {
      totalScrapes += 1;
      cumulativeScrapes.push(totalScrapes);
    });

    const growthRate = cumulativeScrapes.map((value, index, array) => {
      if (index === 0) return 0;
      return ((value - array[index - 1]) / array[index - 1]) * 100;
    });

    setScrapeData({
      dates,
      cumulativeScrapes,
      growthRate,
    });
  };

  const chartData = {
    labels: scrapeData?.dates || [],
    datasets: [
      {
        label: 'Cumulative Scrapes',
        data: scrapeData?.cumulativeScrapes || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Scrape Growth Rate (%)',
        data: scrapeData?.growthRate || [],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        <Topbar email={email || ''} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard label="Total Data Scraped" value={`${(totalDataScraped / 1024 / 1024).toFixed(2)} MB`} icon={<Database size={20} />} />
          <StatCard label="Total Files Scraped" value={totalFiles.toString()} icon={<FileCheck2 size={20} />} />
          <StatCard label="Number of YouTube Scrapes" value={youtubeScrapes.toString()} icon={<TvMinimalPlay size={20} />} />
          <StatCard label="Number of Reddit Scrapes" value={redditScrapes.toString()} icon={<TvMinimalPlay size={20} />} />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold">Past Queries</h3>
            {pastQueries.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {pastQueries.map((query, index) => (
                  <li key={index} className="text-lg text-gray-600 dark:text-gray-300">
                    {query}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No past queries available</p>
            )}
          </div>
          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Scrape Progression Over Time</h3>
            <Line data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
