'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Scapbar from '@/components/ScapBar';
import { BlackButton } from '@/components/BlackButton';
import Papa from 'papaparse';
import Link from 'next/link';

interface HistoryFile {
  filename: string;
  platform: string;
  query: string;
  csv_blob_id: string;
  uploaded_at: string;
  file_size: number;  // File size
  keyword_count: object; // Keyword stats
}

export default function ScrapedResultsPage() {
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState<HistoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<HistoryFile | null>(null);
  const [fileData, setFileData] = useState<string[][]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setEmail(userEmail);
      fetch(`https://mainpython-fraa.onrender.com/user-history?email=${userEmail}`)
        .then(res => res.json())
        .then(data => {
          setFiles(data.history);
          setLoading(false); // Set loading to false after data is fetched
        })
        .catch(() => setLoading(false)); // In case of error, stop loading
    }
  }, []);

  const fetchFileData = async (blob_id: string) => {
    setLoading(true); // Set loading when fetching file data
    const res = await fetch(`https://mainpython-fraa.onrender.com/download-csv/${blob_id}`);
    const text = await res.text();
    const parsed = Papa.parse(text.trim(), { skipEmptyLines: true });
    setFileData(parsed.data as string[][]);
    setPage(1);
    setLoading(false); // Stop loading when file data is fetched
  };

  const handleSelect = (file: HistoryFile) => {
    setSelectedFile(file);
    fetchFileData(file.csv_blob_id);
  };

  const handleDelete = async (blob_id: string) => {
    await fetch(`https://mainpython-fraa.onrender.com/delete-file/${blob_id}`, { method: 'DELETE' });
    setFiles(files.filter(f => f.csv_blob_id !== blob_id));
    if (selectedFile?.csv_blob_id === blob_id) setSelectedFile(null);
  };

  const handleDownload = (blobId: string) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = `https://mainpython-fraa.onrender.com/download-csv/${blobId}`;
    downloadLink.download = "download.csv";  // Optionally specify a filename
    downloadLink.click();
  };

  return (
    <div className="flex min-h-screen bg-cover bg-center bg-no-repeat backdrop-blur-md">
      <Sidebar />
      <div className="flex-1 p-4">
        <Scapbar email={email || ''} />
        <main className="p-6 max-w-6xl mx-auto overflow-y-auto">

          {/* Loading State */}
          {loading && <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">Loading files...</div>}

          {/* No Files Found */}
          {!loading && files.length === 0 && (
            <div className="text-center text-lg">
              <p>No files found. Please <Link href="/extraction" className="text-blue-500">scrape data</Link> to get started.</p>
            </div>
          )}

          {/* Files List */}
          {!loading && files.length > 0 && (
            <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
              {files.map((file) => (
                <div
                  key={file.csv_blob_id}
                  className={`border p-4 rounded-lg cursor-pointer ${
                    selectedFile?.csv_blob_id === file.csv_blob_id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => handleSelect(file)}
                >
                  <h4 className="font-semibold">{file.filename}</h4>
                  <p className="text-sm text-gray-500">Platform: {file.platform}</p>
                  <p className="text-sm text-gray-500">Uploaded: {file.uploaded_at}</p>
                  <p className="text-sm text-gray-500">Size: {formatFileSize(file.file_size)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Selected File Data */}
          {selectedFile && fileData.length > 0 && (
            <div className="dark:bg-gray-800 rounded-lg p-6 mb-6 shadow bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">{selectedFile.filename}</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr>
                      {fileData[0].map((head, i) => (
                        <th key={i} className="p-2 border-b text-left font-medium">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.slice((page - 1) * perPage + 1, page * perPage + 1).map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="p-2 border-b">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <BlackButton onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Previous</BlackButton>
                <span>Page {page}</span>
                <BlackButton
                  onClick={() => setPage(p => (p * perPage < fileData.length - 1 ? p + 1 : p))}
                  disabled={page * perPage >= fileData.length - 1}
                >
                  Next
                </BlackButton>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-4">
                <BlackButton onClick={() => handleDownload(selectedFile.csv_blob_id)} variant="outline">
                  Download
                </BlackButton>
                <BlackButton onClick={() => handleDelete(selectedFile.csv_blob_id)} variant="outline">
                  Delete
                </BlackButton>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Helper function to format file size
const formatFileSize = (size: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let sizeInUnit = size;

  while (sizeInUnit >= 1024 && unitIndex < units.length - 1) {
    unitIndex++;
    sizeInUnit /= 1024;
  }

  return `${sizeInUnit.toFixed(2)} ${units[unitIndex]}`;
};
