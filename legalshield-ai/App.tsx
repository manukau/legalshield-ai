import React, { useState, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeContract } from './services/geminiService';
import { AnalysisStatus } from './types';
import { Loader2, CheckCircle2, ShieldCheck, AlertTriangle, Zap, Lock, BrainCircuit, X, ChevronRight, Activity } from 'lucide-react';

// --- BAGIAN 1: DATA FITUR (LINEAR STYLE) ---
const FEATURES = [
  {
    id: 'speed',
    icon: Zap,
    title: "Analisa Kilat",
    subtitle: "Speed-first Architecture",
    desc: "Scan dokumen 50 halaman dalam < 10 detik.",
    longDesc: "Menggunakan arsitektur pemrosesan paralel Gemini versi terakhir. Sistem memecah dokumen menjadi token vektor, menganalisanya secara simultan, dan menyusun kembali menjadi laporan hukum dalam hitungan milidetik. Tidak ada antrian, tidak ada loading lama.",
    gradient: "from-amber-400 to-orange-500"
  },
  {
    id: 'neural',
    icon: BrainCircuit,
    title: "Neural Logic",
    subtitle: "Context-Aware AI",
    desc: "Paham konteks hukum & KUHPerdata Indonesia.",
    longDesc: "Berbeda dengan keyword search biasa, Neural Logic memahami 'konteks' dan 'niat' di balik pasal. Sistem dilatih dengan dataset KUHPerdata, UU Cipta Kerja, dan yurisprudensi Indonesia untuk mendeteksi jebakan bahasa yang sering dilewatkan mata manusia.",
    gradient: "from-emerald-400 to-teal-500"
  },
  {
    id: 'privacy',
    icon: Lock,
    title: "Zero Retention",
    subtitle: "Enterprise Grade Security",
    desc: "Dokumen tidak disimpan di server (Stateless).",
    longDesc: "Kami menerapkan protokol 'Fire & Forget'. Saat dokumen diupload, ia dienkripsi di memori sementara (RAM), diproses, dan langsung dihapus permanen (Wipe) segera setelah hasil keluar. Tidak ada database penyimpanan dokumen. Privasi 100% terkendali.",
    gradient: "from-blue-400 to-indigo-500"
  }
];

// Custom Hook Typewriter V2
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
  
  // STATE BARU UNTUK MODAL DETAIL
  const [selectedFeature, setSelectedFeature] = useState<typeof FEATURES[0] | null>(null);
  
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
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10"></div>

      {/* MODAL DETAIL (POPUP SAAT CARD DIKLIK) */}
      {selectedFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur Gelap */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedFeature(null)}
          ></div>
          
          {/* Content Modal */}
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Hiasan Atas */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedFeature.gradient}`}></div>
            
            <div className="p-8">
              <button 
                onClick={() => setSelectedFeature(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedFeature.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                <selectedFeature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{selectedFeature.title}</h3>
              <p className="text-emerald-400 font-mono text-sm mb-6">{selectedFeature.subtitle}</p>
              
              <div className="prose prose-invert">
                <p className="text-slate-300 leading-relaxed text-lg">
                  {selectedFeature.longDesc}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-sm text-slate-500">
                <Activity className="w-4 h-4" />
                <span>Teknologi aktif di versi 1.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 p-2 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="text-emerald-400 w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              KontrakAman <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">AI</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-500/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SYSTEM ONLINE
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight leading-tight min-h-[120px] sm:min-h-[auto]">
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

        {/* FLOW UTAMA */}
        <div className="flex flex-col items-center w-full">
          
          {/* 1. UPLOAD SECTION */}
          <div className="w-full max-w-xl relative group z-20">
             <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative bg-slate-950 rounded-xl">
                <FileUploader 
                  selectedFile={file} 
                  onFileSelect={setFile} 
                  disabled={status === AnalysisStatus.ANALYZING}
                />
             </div>
          </div>

          {/* 2. FITUR CARDS (LINEAR STYLE) */}
{!file && !result && (
  <div className="w-full mt-24 animate-fade-in-up">
    
    {/* --- GANTI BAGIAN DI BAWAH INI --- */}
    <div className="flex items-center gap-4 mb-8 px-2">
      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-slate-700 flex-1 opacity-50"></div>
      <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] font-mono whitespace-nowrap">
         <span className="text-emerald-500">///</span> BUILT FOR MODERN BUSINESS
      </p>
      <div className="h-px bg-gradient-to-r from-slate-700 via-slate-700 to-transparent flex-1 opacity-50"></div>
    </div>

              {/* GRID CARD LINEAR STYLE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURES.map((feature) => (
                  <div 
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature)}
                    className="group relative p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-white/0 hover:from-emerald-500/50 hover:to-teal-500/50 transition-all duration-500 cursor-pointer"
                  >
                    {/* Inner Card */}
                    <div className="bg-slate-950 rounded-[23px] h-full p-6 relative overflow-hidden group-hover:bg-slate-900/80 transition-colors duration-500">
                      
                      {/* Glow Effect on Hover */}
                      <div className={`absolute top-0 right-0 w-[100px] h-[100px] bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-[40px] transition-opacity duration-500 rounded-full -mr-10 -mt-10`}></div>

                      {/* Icon */}
                      <div className="mb-4 text-slate-400 group-hover:text-white transition-colors">
                        <feature.icon className="w-8 h-8" />
                      </div>

                      {/* Text */}
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4 group-hover:text-slate-400 transition-colors">
                        {feature.desc}
                      </p>

                      {/* 'Learn More' Link */}
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        Lihat Detail <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. BUTTON ACTION */}
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

          {/* 4. ERROR & RESULT */}
          {status === AnalysisStatus.ERROR && (
            <div className="mb-8 w-full max-w-xl bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-200 mt-8">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {status === AnalysisStatus.COMPLETE && result && (
            <div className="w-full mt-12 animate-fade-in-up">
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

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-8 mt-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-slate-600 text-xs">
              &copy; 2025 KontrakAman AI. <span className="mx-2">•</span> Secure & Private.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;


