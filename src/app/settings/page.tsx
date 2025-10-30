'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Setbar from '@/components/setBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlackButton } from '@/components/BlackButton';
import Alert from '@/components/Alerts';

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [youtubeKey, setYoutubeKey] = useState('');
  const [redditId, setRedditId] = useState('');
  const [redditSecret, setRedditSecret] = useState('');
  const [redditAgent, setRedditAgent] = useState('');
  const [youtubeUsageCount, setYoutubeUsageCount] = useState('Unlimited');
  const [redditUsageCount, setRedditUsageCount] = useState('Unlimited');
  const [error, setError] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning' | null>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
      fetchSavedApiKeys(userEmail);
    }
  }, []);

  // Fetch saved API keys and usage counts
  const fetchSavedApiKeys = async (email: string) => {
    try {
      const response = await fetch(`https://mainpython-kpk3.onrender.com/save-api-key?email=${email}`);
      const data = await response.json();

      setYoutubeKey(data.youtube_api || '');
      setRedditId(data.reddit_client_id || '');
      setRedditSecret(data.reddit_secret || '');
      setRedditAgent(data.reddit_user_agent || '');

      // Set the usage counts based on user or default keys
      setYoutubeUsageCount(data.youtube_use_count || 'Loading...');
      setRedditUsageCount(data.reddit_use_count || 'Loading...');
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  const handleSave = async () => {
    if (!email) return;
    const res = await fetch('https://mainpython-kpk3.onrender.com/save-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        youtube_api: youtubeKey,
        reddit_client_id: redditId,
        reddit_secret: redditSecret,
        reddit_user_agent: redditAgent
      }),
    });
    const result = await res.json();
    if (result.message) {
      setAlertType('success');
      setError('API keys saved successfully!');
      setEditMode(false);
      fetchSavedApiKeys(email); // Refresh keys after saving  
    }
  };

  return (
    <div className="flex min-h-screen bg-cover bg-center bg-no-repeat backdrop-blur-md">
      <Sidebar />
      <div className="flex-1 p-4">
        <Setbar email={email || ''}  />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <main className="max-w-5xl mx-auto w-full">
            {/* Render alert if there's an error message */}
            {error && alertType && (
              <Alert message={error} type={alertType} onClose={() => setError(null)} />
            )}

            {/* About Section */}
            <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">API Usage</h3>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>YouTube API Key Usage:</strong> {youtubeUsageCount}</p>
                <p><strong>Reddit API Key Usage:</strong> {redditUsageCount}</p>

                <p className="text-sm text-gray-600 dark:text-gray-300">Please enter your own API keys for YouTube and Reddit to start using them. Default keys will have a limited usage count.</p>
              </div>
            </div>

            {/* API Key Section */}
            <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">API Key Management</h3>

              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="text" value={email || ''} disabled />
                </div>
                <div>
                  <Label>YouTube API Key</Label>
                  <Input
                    type={editMode ? 'text' : 'password'}
                    value={youtubeKey}
                    disabled={!editMode}
                    onChange={(e) => setYoutubeKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Reddit Client ID</Label>
                  <Input
                    type={editMode ? 'text' : 'password'}
                    value={redditId}
                    disabled={!editMode}
                    onChange={(e) => setRedditId(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Reddit Client Secret</Label>
                  <Input
                    type={editMode ? 'text' : 'password'}
                    value={redditSecret}
                    disabled={!editMode}
                    onChange={(e) => setRedditSecret(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Reddit User Agent ("script:<app_name>:v1.0 (by u/<developers>))</Label>
                  <Input
                    type={editMode ? 'text' : 'password'}
                    value={redditAgent}
                    disabled={!editMode}
                    onChange={(e) => setRedditAgent(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                {editMode ? (
                  <>
                    <BlackButton onClick={handleSave}>Save</BlackButton>
                    <BlackButton onClick={() => setEditMode(false)} variant="outline">Cancel</BlackButton>
                  </>
                ) : (
                  <BlackButton onClick={() => setEditMode(true)}>Edit</BlackButton>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Version 1.0.0 - This platform helps you perform YouTube and Reddit sentiment analysis and visualize data trends.
                Use your own API keys for improved scraping accuracy.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

