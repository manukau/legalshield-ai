import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ResultDisplayProps {
  result: string;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Sedang membaca pasal-pasal kontrak... (Bisa memakan waktu 10-20 detik)
        </p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        📋 Hasil Analisis Hukum
      </h2>
      <div className="prose prose-blue max-w-none text-gray-700">
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
        <strong>Disclaimer:</strong> Analisis ini menggunakan AI dan bukan nasihat hukum profesional. 
        Selalu konsultasikan keputusan penting dengan pengacara sungguhan.
      </div>
    </div>
  );
};

export default ResultDisplay;
