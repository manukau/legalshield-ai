import React, { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeContract } from './services/geminiService';
import { AnalysisStatus } from './types';
import { Scale, Loader2, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

// --- BAGIAN 1: KITA BIKIN MESIN TIKNYA DI SINI ---
// Custom Hook untuk efek mengetik
const useTypewriter = (text: string, speed: number = 50, startDelay: number = 500) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    // Reset saat text berubah
    setDisplayText('');
    
    // Timer untuk mulai mengetik (delay awal)
    const startTimeout = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timer);
        }
      }, speed); // Kecepatan ketik (ms)

      return () => clearInterval(timer);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return displayText;
};

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // --- BAGIAN 2: KITA GUNAKAN MESIN TIKNYA ---
  // Teks ini yang akan muncul satu per satu
  const typedText = useTypewriter("Dalam Hitungan Detik...", 70, 1000);

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
    // BACKGROUND DARK MODE
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans">
      
      {/* Navbar Gelap */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-lg shadow-black/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
              <ShieldCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              LegalShield <span className="text-emerald-400">AI</span>
            </span>
          </div>
          <div className="text-sm font-medium text-slate-400 hidden sm:block">
            Validasi Ide Bisnis Aman & Cepat
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight min-h-[120px] sm:min-h-[auto]">
            Analisa Risiko Kontrak <br />
            
            {/* --- BAGIAN 3: EFEK VISUALNYA --- */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              {typedText}
            </span>
            
            {/* CURSOR KEDAP-KEDIP */}
            <span className="inline-block w-1 h-8 md:h-12 ml-1 align-middle bg-emerald-400 animate-pulse"></span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload draft kontrak sewa atau kerjasama Anda. AI kami akan mencari pasal berbahaya 
            (<span className="text-red-400 font-semibold">Red Flags</span>) dan potensi biaya tersembunyi sebelum Anda tanda tangan.
          </p>
        </div>

        {/* Analysis Flow */}
        <div className="flex flex-col items-center w-full">
          
          {/* Step 1: Upload */}
          <div className="w-full max-w-xl">
             <FileUploader 
                selectedFile={file} 
                onFileSelect={setFile} 
                disabled={status === AnalysisStatus.ANALYZING}
              />
          </div>

          {/* Step 2: Action Button */}
          {file && status !== AnalysisStatus.COMPLETE && (
            <div className="mb-12 mt-8 animate-fade-in-up">
              <button
                onClick={handleAnalyze}
                disabled={status === AnalysisStatus.ANALYZING}
                className={`
                  group relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-full shadow-lg transition-all transform hover:-translate-y-1
                  ${status === AnalysisStatus.ANALYZING 
                    ? 'bg-slate-700 cursor-wait text-slate-400' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/50 border border-emerald-500/30'
                  }
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
                <p className="text-center mt-4 text-sm text-emerald-400 font-mono animate-pulse">
                  Sedang membaca pasal per pasal... (estimasi 10-20 detik)
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {status === AnalysisStatus.ERROR && (
            <div className="mb-8 w-full max-w-xl bg-red-900/20 border border-red-500/50 p-4 rounded-lg backdrop-blur-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200 font-medium">
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
              
              <div className="text-center mt-12 border-t border-slate-800 pt-8">
                <button
                  onClick={() => {
                    setFile(null);
                    setStatus(AnalysisStatus.IDLE);
                    setResult("");
                  }}
                  className="text-slate-400 hover:text-emerald-400 font-medium hover:underline transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                   ↺ Analisa Kontrak Lain
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
