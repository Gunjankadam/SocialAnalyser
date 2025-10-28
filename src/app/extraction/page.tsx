'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Exbar from '@/components/ExBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlackButton } from '@/components/BlackButton';
import Alert from '@/components/Alerts';

export default function DataExtractionPage() {
  const [platform, setPlatform] = useState<'youtube' | 'reddit' | ''>('');

  // YouTube
  const [ytQuery, setYtQuery] = useState('');
  const [videoIds, setVideoIds] = useState('');
  const [ytSearchLimit, setYtSearchLimit] = useState('5');
  const [ytCommentLimit, setYtCommentLimit] = useState('100');

  // Reddit
  const [redditQuery, setRedditQuery] = useState('');
  const [redditSearchLimit, setRedditSearchLimit] = useState('5');
  const [redditCommentLimit, setRedditCommentLimit] = useState('50');

  // Filename
  const [filename, setFilename] = useState('');
  const [email, setEmail] = useState<string | null>('User');

  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning' | null>(null);

  // ✅ FIX: localStorage only in client effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) setEmail(userEmail);
    }
  }, []);


  const handleScrape = async () => {
    if (!email || !platform || !filename) return;

    setIsScraping(true);

    try {
      const baseUrl = platform === 'youtube' ? '/scrape-comments' : '/scrape-reddit';
      const params = new URLSearchParams({ email, filename });

      if (platform === 'youtube') {
        params.append('query', ytQuery);
        params.append('video_ids', videoIds);
        params.append('search_limit', ytSearchLimit);
        params.append('comment_limit', ytCommentLimit);
      } else {
        params.append('query', redditQuery);
        params.append('sub_limit', redditSearchLimit);
        params.append('post_limit', '5');
        params.append('comment_limit', redditCommentLimit);
      }

      const res = await fetch(`https://mainpython-fraa.onrender.com${baseUrl}?${params.toString()}`);
      const data = await res.json();
      if (data.status === 'success') {
        setAlertType('success');
        setError('Scraping successful!');
      } else {
        setAlertType('error');
        setError1(JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      setAlertType('error');
      setError2('Scraping failed. Please try different input parameters.');

    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-cover bg-center bg-no-repeat backdrop-blur-md">
      <Sidebar />
      <div className="flex-1 p-4">
        <Exbar email={email || ''} />
        <main className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Alert Component */}
         {error && alertType && (
          <Alert message={error} type={alertType} onClose={() => setError(null)} />
        )}
        {error1 && alertType && (
          <Alert message={error1} type={alertType} onClose={() => setError1(null)} /> 
        )}
        {error2 && alertType && (
          <Alert message={error2} type={alertType} onClose={() => setError2(null)} />
        )}

          {/* Platform Selection */}
          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-6 mb-4">
              <BlackButton
                onClick={() => setPlatform('youtube')}
                className={`p-2 rounded-full text-white bg-black ${platform === 'youtube' ? 'bg-black' : 'bg-black/50'}`}
              >
                YouTube
              </BlackButton>
              <BlackButton
                onClick={() => setPlatform('reddit')}
                className={`p-2 rounded-full text-white ${platform === 'reddit' ? 'bg-black' : 'bg-black/50'}`}
              >
                Reddit
              </BlackButton>
            </div>
          </div>

          {/* Filename Input */}
          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
            <Label htmlFor="file">Filename (enter before scraping)</Label>
            <Input
              id="file"
              type="text"
              label="Filename (enter before scraping)"
              placeholder="Enter filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Please save file extension as .csv For example, <strong>comments.csv</strong>.
            </p>  
          </div>

          {/* YouTube Fields */}
          {platform === 'youtube' && (
            <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
              <div>
                <Label htmlFor="video">Video IDs (comma-separated)</Label>
                <Input id="video" label="Video IDs (comma-separated)" value={videoIds} onChange={(e) => setVideoIds(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="query">Query (optional)</Label>
                <Input id="query" label="Query (optional)" value={ytQuery} onChange={(e) => setYtQuery(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="search">Search Limit</Label>
                <Input id="search" label="Search Limit" type="number" value={ytSearchLimit} onChange={(e) => setYtSearchLimit(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="comment">Comment Limit</Label>
                <Input id="comment" label="Comment Limit" type="number" value={ytCommentLimit} onChange={(e) => setYtCommentLimit(e.target.value)} />
              </div>
            </div>
          )}

          {/* Reddit Fields */}
          {platform === 'reddit' && (
            <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
              <div>
                <Label htmlFor="querys">Search Query</Label>
                <Input id="querys" label="Search Query" value={redditQuery} onChange={(e) => setRedditQuery(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="searchs">Subreddit Search Limit</Label>
                <Input id="searchs" label="Subreddit Search Limit"  type="number" value={redditSearchLimit} onChange={(e) => setRedditSearchLimit(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="comments" >Comment Limit</Label>
                <Input id="comments" label="Comment Limit"  type="number" value={redditCommentLimit} onChange={(e) => setRedditCommentLimit(e.target.value)} />
              </div>
            </div>
          )}

          {/* Scrape Button */}
          {platform && (
            <div className="flex justify-end pt-4 ">
              <BlackButton className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md hover:bg-white hover:text-black transition border-t border-gray-200" onClick={handleScrape} disabled={isScraping}>
                {isScraping ? 'Scraping...' : 'Start Scraping'}
              </BlackButton>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

