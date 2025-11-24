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

      pdf.save('LegalShield-Audit-Report.pdf');
    } catch (error) {
      console.error("Gagal download PDF:", error);
      alert("Maaf, gagal membuat PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* HEADER CONTROLS (Tombol Download) */}
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
          
          {/* --- BAGIAN INI YANG MENGATUR TEXT RESPONSIVE --- */}
          {/* 1. Tampil di HP saja (Layar Kecil) */}
          <span className="sm:hidden">Download</span>
          
          {/* 2. Tampil di Laptop/Tablet (Layar Besar) */}
          <span className="hidden sm:inline">Download PDF Resmi</span>
        </button>
      </div>

      {/* AREA UTAMA (Efek Kaca & Border Bercahaya) */}
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
                      AUDIT RISIKO KONTRAK
                    </span>
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 tracking-wider">
                      CONFIDENTIAL
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                      <p className="text-slate-400 text-xs font-mono tracking-widest uppercase opacity-80 hidden sm:block">
                        POWERED BY ADVANCED NEURAL LOGIC
                      </p>
                      <p className="text-slate-400 text-xs font-mono tracking-widest uppercase opacity-80 sm:hidden">
                        NEURAL AI
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
                  h2: ({node, ...props}) => (
                    <div className="mt-10 mb-6 group">
                      <h2 className="text-lg sm:text-xl font-bold text-emerald-400 flex items-center gap-3 bg-emerald-950/30 p-3 rounded-lg border-l-4 border-emerald-500 group-hover:bg-emerald-950/50 transition-colors" {...props} />
                    </div>
                  ),
                  h3: ({node, ...props}) => (
                    <h3 className="text-base sm:text-lg font-semibold text-slate-200 mt-6 mb-3 ml-1 border-l-2 border-slate-700 pl-3" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="space-y-3 text-slate-300 mb-6" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="flex items-start gap-3 leading-relaxed group text-sm sm:text-base" {...props}>
                       <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-emerald-500 transition-colors flex-shrink-0"></span>
                       <span>{props.children}</span>
                    </li>
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-semibold text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded mx-0.5 border border-rose-500/20" {...props} />
                  ),
                  p: ({node, ...props}) => (
                    <p className="text-slate-300 leading-relaxed mb-5 text-justify text-sm sm:text-base" {...props} />
                  ),
                  blockquote: ({node, ...props}) => (
                    <div className="my-6 p-4 rounded-r-lg border-l-4 border-amber-500/50 bg-amber-500/5 text-amber-200/80 italic text-sm">
                      {props.children}
                    </div>
                  )
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>

          {/* FOOTER PDF */}
          <div className="bg-slate-900/50 p-6 border-t border-white/5 backdrop-blur-sm">
             <div className="flex items-start gap-3 max-w-3xl mx-auto text-xs text-slate-500 text-justify bg-slate-800/50 p-4 rounded-lg border border-white/5">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p>
                  <strong>DISCLAIMER SISTEM:</strong> Laporan ini dihasilkan otomatis oleh Neural Engine AI. 
                  Hasil tidak mengikat secara hukum. Verifikasi dengan ahli profesional.
                </p>
             </div>
             <div className="text-center mt-6 text-slate-700 font-mono text-[10px] tracking-widest uppercase">
                ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • LEGALSHIELD AI
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
