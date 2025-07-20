"use client";

import { useState } from 'react';
import { axios } from '@/_lib/axios';

export const UploadDebug = () => {
  const [allUploads, setAllUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [deleteResult, setDeleteResult] = useState('');

  const fetchAllUploads = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/uploads/debug/all');
      setAllUploads(response.data);
      console.log('All uploads:', response.data);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDelete = async () => {
    if (!testUrl) return;
    
    setLoading(true);
    setDeleteResult('');
    
    try {
      // Use the test endpoint for better debugging
      const response = await axios.post('/uploads/debug/test-delete', {
        fileUrl: testUrl
      });
      
      if (response.data.success) {
        setDeleteResult('✅ Delete successful!');
        console.log('Delete successful for:', testUrl);
      } else {
        setDeleteResult(`❌ Delete failed: ${response.data.message}`);
        console.error('Delete failed:', response.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      setDeleteResult(`❌ Delete failed: ${errorMessage}`);
      console.error('Delete failed:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Upload Debug Tool</h3>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={fetchAllUploads}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch All Uploads'}
          </button>
        </div>

        {allUploads.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">All Uploads ({allUploads.length}):</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {allUploads.map((upload, index) => (
                <div key={upload.id} className="p-2 bg-white rounded border text-sm">
                  <div><strong>ID:</strong> {upload.id}</div>
                  <div><strong>File:</strong> {upload.fileName}</div>
                  <div><strong>URL:</strong> {upload.finalUrl}</div>
                  <div><strong>User:</strong> {upload.userId || 'Anonymous'}</div>
                  <div><strong>Status:</strong> {upload.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">Test Delete by URL:</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter file URL to delete"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={testDelete}
              disabled={loading || !testUrl}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          {deleteResult && (
            <div className="mt-2 p-2 bg-white rounded border">
              {deleteResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 