import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ShieldCheck, AlertTriangle, Download, Loader2 } from 'lucide-react';
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
      // 1. Ambil elemen yang mau difoto
      const element = contentRef.current;
      
      // 2. Foto elemen tersebut (High Quality)
      const canvas = await html2canvas(element, {
        scale: 2, // Biar tajam saat di-zoom
        backgroundColor: '#0f172a', // Pastikan background tetap gelap (Slate-900)
        logging: false,
        useCORS: true
      });

      // 3. Siapkan PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 4. Hitung ukuran agar pas di kertas A4
      const imgWidth = 210; // Lebar A4 dalam mm
      const pageHeight = 297; // Tinggi A4 dalam mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // 5. Cetak Halaman Pertama
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 6. Jika panjang, buat halaman baru (Multipage)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 7. Simpan File
      pdf.save('LegalShield-Audit-Report.pdf');

    } catch (error) {
      console.error("Gagal download PDF:", error);
      alert("Maaf, gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* TOMBOL DOWNLOAD (Hanya muncul di layar, tidak ikut ter-print) */}
      <div className="flex justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sedang Mencetak...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Laporan PDF Resmi
            </>
          )}
        </button>
      </div>

      {/* AREA YANG AKAN DI-PRINT (Ref) */}
      <div 
        ref={contentRef} 
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden ring-1 ring-white/10"
      >
        
        {/* HEADER LAPORAN */}
        <div className="bg-slate-950 p-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              AUDIT RISIKO KONTRAK
            </h2>
            <div className="flex items-center gap-2 mt-2 ml-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <p className="text-slate-400 text-xs font-mono tracking-widest uppercase opacity-80">
                POWERED BY ADVANCED NEURAL LOGIC
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-slate-500 text-xs">DIGITAL SIGNATURE</p>
            <p className="text-emerald-500 font-mono text-xs mt-1">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* ISI KONTEN */}
        <div className="p-8 min-h-[500px]">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => (
                <h1 className="text-3xl font-extrabold text-white mb-6 pb-4 border-b border-slate-700" {...props} />
              ),
              h2: ({node, ...props}) => (
                <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4 flex items-center gap-2 bg-emerald-900/20 p-2 rounded-lg border-l-4 border-emerald-500" {...props} />
              ),
              h3: ({node, ...props}) => (
                <h3 className="text-lg font-semibold text-slate-200 mt-6 mb-2 ml-1" {...props} />
              ),
              ul: ({node, ...props}) => (
                <ul className="list-disc pl-5 space-y-3 text-slate-300 mb-6 marker:text-emerald-500" {...props} />
              ),
              li: ({node, ...props}) => (
                <li className="leading-relaxed pl-2" {...props} />
              ),
              strong: ({node, ...props}) => (
                <strong className="font-bold text-rose-400 bg-rose-400/10 px-1 rounded mx-1" {...props} />
              ),
              p: ({node, ...props}) => (
                <p className="text-slate-300 leading-relaxed mb-4 text-justify" {...props} />
              ),
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4 bg-slate-950/50 p-4 rounded-r-lg" {...props} />
              )
            }}
          >
            {result}
          </ReactMarkdown>
        </div>

        {/* FOOTER PDF */}
        <div className="bg-slate-950 p-6 border-t border-slate-800">
           <div className="flex items-start gap-3 max-w-3xl mx-auto text-xs text-slate-500 text-justify">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p>
                <strong>DISCLAIMER HUKUM:</strong> Laporan ini dihasilkan secara otomatis oleh sistem kecerdasan buatan (AI) LegalShield. 
                Hasil analisis ini bertujuan sebagai referensi mitigasi risiko awal dan tidak memiliki kekuatan hukum mengikat layaknya pendapat hukum (Legal Opinion) yang dikeluarkan oleh Advokat berlisensi. 
                Pengguna disarankan untuk memverifikasi temuan ini dengan konsultan hukum profesional sebelum mengambil keputusan hukum strategis.
              </p>
           </div>
           <div className="text-center mt-4 pt-4 border-t border-slate-900 text-slate-600 font-mono text-[10px]">
              DOCUMENT ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • SECURE GENERATION • LEGALSHIELD AI
           </div>
        </div>
      </div>
    </div>
  );
};
