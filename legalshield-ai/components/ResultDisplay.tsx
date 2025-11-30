import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ShieldCheck, AlertTriangle, Download, Loader2, FileCheck, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResultDisplayProps {
  result: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);

    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#020617', // Slate-950
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210; 
      const pageHeight = 297; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('VerifAI-Audit-Report.pdf');
    } catch (error) {
      console.error("Gagal download PDF:", error);
      alert("Maaf, gagal membuat PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center px-2">
        <div className="text-sm text-slate-400 font-mono flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">ANALYSIS_COMPLETE</span>
          <span className="sm:hidden">DONE</span>
        </div>
        
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="group flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/50 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          )}
          <span className="sm:hidden">Download</span>
          <span className="hidden sm:inline">Download PDF Resmi</span>
        </button>
      </div>

      {/* AREA UTAMA */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        
        <div 
          ref={contentRef} 
          className="relative bg-slate-950 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl"
        >
          
          {/* HEADER LAPORAN */}
          <div className="relative bg-slate-900 p-6 sm:p-8 border-b border-white/5 overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <ShieldCheck className="w-64 h-64 text-white" />
             </div>
             
             <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                      VERIFAI AUDIT REPORT
                    </span>
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 tracking-wider">
                      CONFIDENTIAL
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                      <p className="text-slate-400 text-xs font-mono tracking-widest uppercase opacity-80 hidden sm:block">
                        POWERED BY VERIFAI ENGINE
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right hidden sm:block font-mono text-xs text-slate-500">
                   <p className="mb-1">DIGITAL SIGNATURE</p>
                   <p className="text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 inline-block">
                     {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                   </p>
                </div>
             </div>
          </div>
          
          {/* ISI KONTEN */}
          <div className="p-6 sm:p-10 min-h-[500px] bg-slate-950 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

            <div className="relative z-10">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => (
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8 pb-4 border-b border-slate-800 flex items-center gap-3" {...props} />
                  ),
                  
                  // DESIGN BARU: H2 (Sub-Bab Utama seperti 'RED FLAGS')
                  h2: ({node, ...props}) => (
                    <div className="mt-12 mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-emerald-400 flex items-center gap-3 uppercase tracking-wide border-b border-emerald-500/30 pb-2" {...props} />
                    </div>
                  ),

                  // DESIGN BARU: H4 (Judul Per-Pasal / Card Red Flag)
                  // Kita ubah #### menjadi Kotak Merah Elegan
                  h4: ({node, ...props}) => (
                    <div className="mt-8 mb-4 bg-rose-500/10 border-l-4 border-rose-500 p-3 rounded-r-lg">
                      <h4 className="text-base sm:text-lg font-bold text-rose-200 flex items-center gap-2" {...props} />
                    </div>
                  ),

                  // DESIGN BARU: Separator (Garis Pemisah antar pasal)
                  hr: ({node, ...props}) => (
                    <hr className="border-slate-800 my-8" {...props} />
                  ),

                  h3: ({node, ...props}) => (
                    <h3 className="text-base sm:text-lg font-semibold text-slate-200 mt-6 mb-3" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="space-y-2 text-slate-300 mb-6 ml-1" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="flex items-start gap-3 leading-relaxed group text-sm sm:text-base" {...props}>
                       <span className="mt-2 w-1 h-1 rounded-full bg-slate-500 group-hover:bg-emerald-500 transition-colors flex-shrink-0"></span>
                       <span>{props.children}</span>
                    </li>
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-semibold text-white bg-slate-800 px-1 rounded mx-0.5" {...props} />
                  ),
                  p: ({node, ...props}) => (
                    <p className="text-slate-300 leading-relaxed mb-4 text-justify text-sm sm:text-base" {...props} />
                  )
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>

          {/* FOOTER */}
          <div className="bg-slate-900/50 p-6 border-t border-white/5 backdrop-blur-sm">
             <div className="flex items-start gap-3 max-w-3xl mx-auto text-xs text-slate-500 text-justify bg-slate-800/50 p-4 rounded-lg border border-white/5">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p>
                  <strong>DISCLAIMER:</strong> Analisis ini dihasilkan oleh AI (VerifAI Engine) sebagai referensi awal mitigasi risiko dan 
                  <u>BUKAN</u> pengganti nasihat hukum profesional. Pengguna wajib memverifikasi temuan ini dengan ahli hukum berlisensi.
                </p>
             </div>
             <div className="text-center mt-6 text-slate-700 font-mono text-[10px] tracking-widest uppercase">
                ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • VERIFAI SYSTEM
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
