'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Anabar from '@/components/AnaBar';
import { BlackButton } from '@/components/BlackButton';

interface File {
  id: string;
  filename: string;
  csv_blob_id: string;
}

interface SentimentSummary {
  positive?: number;
  neutral?: number;
  negative?: number;
}

const AnalysisPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [sentiments, setSentiments] = useState<number[]>([]);
  const [sentimentSummary, setSentimentSummary] = useState<SentimentSummary>({});
  const [topics, setTopics] = useState<string[][]>([]);
  const [tfidf, setTfidf] = useState<[string, number][]>([]);
  const [centralities, setCentralities] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
      fetchUserFiles(userEmail);
    }
  }, []);

  const fetchUserFiles = async (email: string) => {
    try {
      const response = await fetch(`https://analysispython.onrender.com/get-user-files?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setFiles(data.files);
      } else {
        // Handle error silently or log if needed
      }
    } catch {
      // Handle error silently or log if needed
    }
  };

  const fetchAnalysis = async (blobId: string) => {
    setLoading(true);

    try {
      const response = await fetch(`https://analysispython.onrender.com/get-analysis?blob_id=${blobId}`);
      const data = await response.json();

      if (response.ok) {
        setSentiments(data.sentiments || []);
        setSentimentSummary(data.sentiment_summary || {});
        setTopics(data.topics || []);
        setTfidf(data.tfidf || []);
        setCentralities(data.centralities || []);
      }
    } catch {
      // Handle error silently or log if needed
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFileId = event.target.value;
    const file = files.find((file) => file.id === selectedFileId);
    if (file) {
      setSelectedFile(file); // Set the selected file as the state
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      fetchAnalysis(selectedFile.csv_blob_id); // Use the blob_id from the selected file
    }
  };

  const averageSentiment = sentiments.length
    ? (sentiments.reduce((a, b) => a + b, 0) / sentiments.length).toFixed(3)
    : 'N/A';

  const handleDownloadCSV = () => {
    const csvData = [];

    csvData.push(['Section', 'Key', 'Value']);

    // Sentiment Summary
    csvData.push(['Sentiment Summary', 'Average Sentiment', averageSentiment]);
    Object.entries(sentimentSummary).forEach(([key, val]) =>
      csvData.push(['Sentiment Summary', key, val])
    );

    // TF-IDF
    tfidf.forEach(([term, score]) =>
      csvData.push(['TF-IDF', term, score.toFixed(3)])
    );

    // Topics
    topics.forEach((topicWords, idx) =>
      csvData.push(['Topic ' + (idx + 1), 'Words', topicWords.join(', ')])
    );

    // Centralities
    centralities.forEach(([word, score]) =>
      csvData.push(['Centrality', word, score.toFixed(3)])
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvData.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);

    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${email}_analysis_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-cover bg-center bg-no-repeat backdrop-blur-md">
      <Sidebar />
      <div className="flex-1 p-4">
        <Anabar email={email || ''} />
        <div className="container mx-auto p-6">
          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
           {/* File selection dropdown */}
            <div className="mb-4">
              <label htmlFor="file-select" className="text-base">Select File:</label>
              <select
                id="file-select"
                className="ml-4 p-2 border border-gray-400 rounded"
                onChange={handleFileSelection}
                value={selectedFile ? selectedFile.id : ''} // Set the selected file's ID
              >
                <option value="">Select a file</option>
                {files.length > 0 ? (
                  files.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.filename}
                    </option>
                  ))
                ) : (
                  <option value="">No files available</option>
                )}
              </select>
              {/* Add Analyze Button */}
              <BlackButton
                className="ml-4 p-2 bg-black text-white rounded"
                onClick={handleAnalyze}
                disabled={!selectedFile}
              >
                Analyze
              </BlackButton>
            </div>
          </div>

          {/* Display Analysis Results */}
          {/* Sentiment, TF-IDF, Topics, Centrality sections */}

          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
            {loading ? (
              <p className="loading-text">Loading Sentiment Summary...</p>
            ) : (
              <>
                {sentiments.length > 0 && (
                  <div className="section">
                    <h2 className="text-base font-semibold mb-4">Sentiment Summary</h2>
                    <table className="py-14 table-auto w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border border-gray-300 bg-black text-white ">Metric</th>
                          <th className="px-4 py-2 border border-gray-300 bg-black text-white">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 border border-black">Average Sentiment</td>
                          <td className="px-4 py-2 border border-black">{averageSentiment}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border border-black">Positive</td>
                          <td className="px-4 py-2 border border-black">{sentimentSummary.positive || 0}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border border-black">Neutral</td>
                          <td className="px-4 py-2 border border-black">{sentimentSummary.neutral || 0}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 border border-black">Negative</td>
                          <td className="px-4 py-2 border border-black">{sentimentSummary.negative || 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Continue for other sections (TF-IDF, Topics, Centralities) */}

          <div className="flex justify-end pt-4 ">
            {(sentiments.length || tfidf.length || topics.length || centralities.length) > 0 && (
              <BlackButton
                className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md hover:bg-white hover:text-black transition border-t border-gray-200"
                onClick={handleDownloadCSV}
              >
                Download Analysis Report
              </BlackButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;


