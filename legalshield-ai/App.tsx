import React, { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeContract } from './services/geminiService';
import { AnalysisStatus } from './types';
import { Loader2, CheckCircle2, ShieldCheck, AlertTriangle, Zap, Lock, BrainCircuit } from 'lucide-react';

// Custom Hook Typewriter V2 (Stabil)
const useTypewriter = (text: string, speed: number = 50, startDelay: number = 500) => {
  const [displayText, setDisplayText] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const startTimeout = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setDisplayText(text.slice(0, i)); 
        if (i >= text.length) clearInterval(timer);
      }, speed);
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
    // 1. BACKGROUND DENGAN EFEK GRID MATRIX (SILICON VALLEY VIBE)
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      
      {/* Background Grid Pattern (Garis-garis tipis) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Aurora Glow (Cahaya Hijau di tengah atas) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10"></div>

      {/* Navbar Glassmorphism (Kaca Buram) */}
      <nav className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 p-2 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              LegalShield <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">AI</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-500/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SYSTEM ONLINE v1.0
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-sm mb-8 hover:border-emerald-500/50 transition-colors cursor-default">
            <span className="text-emerald-400">✨ New Engine:</span> Gemini 2.5 Flash Integrated
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
            Analisa Risiko Kontrak <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-300% animate-gradient">
              {typedText}
            </span>
            <span className="inline-block w-1 h-8 md:h-12 ml-1 align-middle bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Asisten hukum pribadi berbasis <span className="text-white font-medium">Neural AI</span>. 
            Deteksi pasal jebakan dan risiko tersembunyi sebelum Anda tanda tangan.
          </p>
        </div>

        {/* 3 FITUR UNGGULAN (BENTO GRID STYLE) */}
        {!file && !result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 px-4">
            {[
              { icon: Zap, title: "Analisa Kilat", desc: "Scan 50 halaman dalam <10 detik" },
              { icon: BrainCircuit, title: "Neural Logic", desc: "Paham konteks hukum Indonesia" },
              { icon: Lock, title: "Zero Retention", desc: "Dokumen tidak disimpan di server" }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-all hover:bg-slate-900/80 group">
                <feature.icon className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 mb-4 transition-colors" />
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Flow Utama */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-xl relative group">
             {/* Efek Glow di belakang uploader saat hover */}
             <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative bg-slate-950 rounded-xl">
                <FileUploader 
                  selectedFile={file} 
                  onFileSelect={setFile} 
                  disabled={status === AnalysisStatus.ANALYZING}
                />
             </div>
          </div>

          {file && status !== AnalysisStatus.COMPLETE && (
            <div className="mb-12 mt-8 animate-fade-in-up">
              <button
                onClick={handleAnalyze}
                disabled={status === AnalysisStatus.ANALYZING}
                className={`
                  group relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]
                  ${status === AnalysisStatus.ANALYZING 
                    ? 'bg-slate-800 cursor-wait text-slate-400 border border-slate-700' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/50'
                  }
                `}
              >
                {status === AnalysisStatus.ANALYZING ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6" />
                    Neural Engine Working...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Analisa Risiko Sekarang
                  </>
                )}
              </button>
            </div>
          )}

          {status === AnalysisStatus.ERROR && (
            <div className="mb-8 w-full max-w-xl bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-200">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {status === AnalysisStatus.COMPLETE && result && (
            <div className="w-full animate-fade-in-up">
              <ResultDisplay result={result} /> 
              <div className="text-center mt-12 border-t border-slate-800/50 pt-8">
                <button
                  onClick={() => {
                    setFile(null);
                    setStatus(AnalysisStatus.IDLE);
                    setResult("");
                  }}
                  className="px-6 py-2 rounded-full border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-sm font-medium"
                >
                   ↺ Upload Dokumen Lain
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="border-t border-white/5 bg-slate-950 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-slate-600 text-xs">
              &copy; 2025 LegalShield AI. <span className="mx-2">•</span> Secure & Private. <span className="mx-2">•</span> Jakarta, Indonesia.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
