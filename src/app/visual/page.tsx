'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Visbar from '@/components/VisBar';
import { BlackButton } from '@/components/BlackButton';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import html2canvas from 'html2canvas';
const COLORS = ['#00C49F', '#FFBB28', '#FF4D4F'];

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
const VisualPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]); // Typed as File[]
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Typed as File | null
  const [email, setEmail] = useState<string | null>(null);
 
const [sentimentSummary, setSentimentSummary] = useState<SentimentSummary>({});

    const [tfidf, setTfidf] = useState<[string, number][]>([]);
  const [topics, setTopics] = useState<string[][]>([]);
  const [centralities, setCentralities] = useState<[number][]>([]);
  const [wordcloudImg, setWordcloudImg] = useState<string>(''); 
    const [cooccurrenceImg, setCooccurrenceImg] = useState<string>('');
    const [sentimentImg, setSentimentImg] = useState<string>('');
    const [tfidfImg, setTfidfImg] = useState<string>('');
  const [topicImg, setTopicImg] = useState<string>('');
    const tfidfRef = React.useRef<HTMLDivElement>(null);
    const sentimentRef = React.useRef<HTMLDivElement>(null);
    const topicRef = React.useRef<HTMLDivElement>(null);



  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
      fetchUserFiles(userEmail);
    }
  }, []);

  const fetchUserFiles = async (email: string) => {
    try {
      const response = await fetch(`https://analysispython-d1ak.onrender.com/get-user-files?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setFiles(data.files);
      } else {
        console.error('Error fetching user files:', data.error);
      }
    } catch (err) {
      console.error('Error fetching user files:', err);
    }
  };

 const fetchAnalysis = async (blobId: string) => {
  setLoading(true);

  try {
    const response = await fetch(`https://analysispython-d1ak.onrender.com/get-analysis?blob_id=${blobId}`);
    const data = await response.json();

    if (response.ok) {
      

      setSentimentSummary(data.sentiment_summary || {});
      setTfidf(data.tfidf || []);
      setTopics(data.topics || []);
      setWordcloudImg(data.wordcloud || '');
      setCooccurrenceImg(data.cooccurrence_img || '');
      setCentralities(data.centralities || []);
      

      // This block runs after data is set
      setTimeout(() => {
        if (tfidfRef.current) {
          html2canvas(tfidfRef.current).then((canvas) => {
            setTfidfImg(canvas.toDataURL('image/png'));
          });
        }
        if (sentimentRef.current) {
          html2canvas(sentimentRef.current).then((canvas) => {
            setSentimentImg(canvas.toDataURL('image/png'));
          });
        }
        if (topicRef.current) {
          html2canvas(topicRef.current).then((canvas) => {
            setTopicImg(canvas.toDataURL('image/png'));
          });
        }
      }, 1000); // Give time to render

    } else {
      console.error('Error fetching analysis data:', data.error);
    }
  } catch (err) {
    console.error('Error fetching analysis:', err);
  } finally {
    setLoading(false);
  }
};


  const handleFileSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFileId = event.target.value;
    console.log('Selected file ID:', selectedFileId);
    // Find the selected file object based on the selectedFileId
    const file = files.find((file) => file.filename === selectedFileId);
    if (file) {
      setSelectedFile(file); // Set the selected file as the state
      console.log('Selected file:', file.csv_blob_id);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      fetchAnalysis(selectedFile.csv_blob_id); // Use the blob_id from the selected file
    } else {
      console.error('No file selected for analysis');
    }
  };

const handleDownloadReport = () => {
  const html = `
    <html>
    <head>
      <meta charset="utf-8">
      <title>Social Media Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1, h2, h3 { color: #111; }
        img { max-width: 100%; height: auto; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px; }
        ul { margin-left: 20px; }
      </style>
    </head>
    <body>
      <h1>Social Media Analysis Report</h1>
      <h2>Email: ${email}</h2>

      <h3>Sentiment Summary:</h3>
      <ul>
        ${Object.entries(sentimentSummary)
          .map(([k, v]) => `<li><b>${k}</b>: ${v}</li>`)
          .join('')}
      </ul>
      ${sentimentImg ? `<h3>Sentiment Distribution Chart:</h3><img src="${sentimentImg}" />` : ''}

      <h3>Top TF-IDF Terms:</h3>
      <ul>
        ${tfidf
          .map(([term, score]) => `<li>${term}: ${score.toFixed(3)}</li>`)
          .join('')}
      </ul>
      ${tfidfImg ? `<h3>TF-IDF Chart:</h3><img src="${tfidfImg}" />` : ''}

      <h3>Topics Discovered:</h3>
      <ul>
        ${topics
          .map((topic, i) => `<li><b>Topic ${i + 1}:</b> ${topic.join(', ')}</li>`)
          .join('')}
      </ul>
      ${topicImg ? `<h3>Topic Modeling Chart:</h3><img src="${topicImg}" />` : ''}

      ${cooccurrenceImg
        ? `<h3>Word Co-occurrence Graph:</h3><img src="data:image/png;base64,${cooccurrenceImg}" />`
        : ''}

      ${wordcloudImg
        ? `<h3>Word Cloud:</h3><img src="data:image/png;base64,${wordcloudImg}" />`
        : ''}

      ${
        centralities.length
          ? `<h3>Network Centralities:</h3>
            <ul>
              ${centralities.map((c, i) => `<li>Node ${i + 1}: ${c}</li>`).join('')}
            </ul>`
          : ''
      }
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SocialMediaAnalysis_Report.doc';
  a.click();
  URL.revokeObjectURL(url);
};

  

  const sentimentPieData = Object.entries(sentimentSummary).map(([label, count]) => ({
    name: label,
    value: count
  }));

  const tfidfBarData = tfidf.map(([term, score]) => ({
    term,
    score: parseFloat(score.toFixed(3))
  }));

  const topicBarData = topics.flatMap((words, topicIndex) =>
    words.map((word, wordIndex) => ({
      topic: `Topic ${topicIndex + 1}`,
      word,
      score: words.length - wordIndex
    }))
  );

  return (
    <div className="flex min-h-screen bg-cover bg-center bg-no-repeat backdrop-blur-md">
      <Sidebar />
      <div className="flex-1 p-4">
        <Visbar email={email || ''}  />
        <div className="container mx-auto p-6">
          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
            

            {/* File selection dropdown */}
            <div className="mb-4">
              <label htmlFor="file-select" className="text-base">Select File:</label>
              <select
                id="file-select"
                className="ml-4 p-2 border border-gray-400 rounded"
                onChange={handleFileSelection}
                value={selectedFile ? selectedFile._id : ''} // Set the selected file's ID
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
                Visualize
              </BlackButton>
            </div>
          </div>

          <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
           {loading ? (
        <p className="loading-text">Loading Sentiment Distribution...</p>
      ) : (
        <>
          {/* Row 1 */}
          
            {sentimentPieData.length > 0 && (
              <div className="vis-box flex flex-col items-center justify-center" ref={sentimentRef}>
                <h2 className="text-xl font-semibold mb-4">Sentiment Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {sentimentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

</>
            )}
</div>
<div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
                           {loading ? (
              <p className="loading-text">Loading Top TF-IDF Terms...</p>
            ) : (
              <>
                 {tfidfBarData.length > 0 && (
              <div className="vis-box flex flex-col items-center justify-center"ref={tfidfRef}>
                <h2 className='text-xl font-semibold mb-4'>Top TF-IDF Terms</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tfidfBarData}>
                    <XAxis dataKey="term" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          

                </>
            )}
</div><div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
                           {loading ? (
              <p className="loading-text">Loading Topic Modeling...</p>
            ) : (
              <> {/* Topics */}
  {topicBarData.length > 0 && (
    <div className="vis-box flex flex-col items-center justify-center"ref={topicRef}>
      <h2 className="text-xl font-semibold item-center justify-center mb-4">Topic Modeling</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topicBarData}>
          <XAxis dataKey="word" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )}
                </>
            )}
                </div>
<div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
  {loading ? (
    <p className="loading-text">Loading Word Co-occurrence Graph...</p>
  ) : (
    <> 
      {/* Word Co-occurrence Graph */}
      {cooccurrenceImg && (
        <div className="vis-box flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold  mb-4">Word Co-occurrence Graph</h2>
          <img
            src={`data:image/png;base64,${cooccurrenceImg}`}
            alt="Co-occurrence Graph"
            className="max-w-full h-auto"
            style={{ maxHeight: 400 }}
          />
        </div>
      )}
    </>
  )}
</div>

<div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
  {loading ? (
    <p className="loading-text">Loading Word Cloud...</p>
  ) : (
    <> 
      {/* Word Cloud */}
      {wordcloudImg && (
        <div className="vis-box flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">Word Cloud</h2>
          <img
            src={`data:image/png;base64,${wordcloudImg}`}
            alt="Word Cloud"
            className="max-w-200 h-auto"
            style={{ maxHeight: 300 }}
          />
        </div>
      )}
    </>
  )}
</div>


                {/* Download Button */}
                {(tfidf.length || topics.length || centralities.length) > 0 && (
                  <div className="flex justify-end pt-4 ">
                    <BlackButton className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-md hover:bg-white hover:text-black transition border-t border-gray-200" onClick={handleDownloadReport}>
                      Download Visualization Report
                    </BlackButton>
                  </div>
                    
                )}
             
          
        </div>
      </div>
    </div>
  );
};

export default VisualPage;


