import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeContract } from './services/geminiService';
import { AnalysisStatus } from './types';
import { Scale, Loader2, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult("");

    try {
      const analysisText = await analyzeContract(file);
      setResult(analysisText);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat menganalisa dokumen.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scale className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">LegalShield AI</span>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Validasi Ide Bisnis Aman & Cepat
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Analisa Risiko Kontrak dalam Detik
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload draft kontrak sewa atau kerjasama Anda. AI kami akan mencari pasal berbahaya ("Red Flags") dan potensi biaya tersembunyi sebelum Anda tanda tangan.
          </p>
        </div>

        {/* Analysis Flow */}
        <div className="flex flex-col items-center w-full">
          
          {/* Step 1: Upload */}
          <FileUploader 
            selectedFile={file} 
            onFileSelect={setFile} 
            disabled={status === AnalysisStatus.ANALYZING}
          />

          {/* Step 2: Action Button */}
          {file && status !== AnalysisStatus.COMPLETE && (
            <div className="mb-12 animate-fade-in-up">
              <button
                onClick={handleAnalyze}
                disabled={status === AnalysisStatus.ANALYZING}
                className={`
                  group relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-full shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1
                  ${status === AnalysisStatus.ANALYZING ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/40'}
                `}
              >
                {status === AnalysisStatus.ANALYZING ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" />
                    Sedang Menganalisa...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Analisa Risiko Kontrak Sekarang
                  </>
                )}
              </button>
              {status === AnalysisStatus.ANALYZING && (
                <p className="text-center mt-4 text-sm text-gray-500 animate-pulse">
                  Sedang membaca pasal per pasal... (estimasi 10-20 detik)
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {status === AnalysisStatus.ERROR && (
            <div className="mb-8 w-full max-w-xl bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {status === AnalysisStatus.COMPLETE && result && (
            <div className="w-full animate-fade-in-up">
              <ResultDisplay result={result} />
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setFile(null);
                    setStatus(AnalysisStatus.IDLE);
                    setResult("");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Analisa Kontrak Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
