import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface ResultDisplayProps {
  result: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    // CONTAINER UTAMA: Ubah bg-white jadi bg-slate-900 (Gelap)
    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden ring-1 ring-white/10">
      
      {/* HEADER BAGIAN ATAS */}
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            Hasil Analisa LegalShield
          </h2>
          <div className="flex items-center gap-2 mt-1 ml-1">
  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
  <p className="text-slate-400 text-xs font-mono tracking-widest uppercase opacity-80">
    POWERED BY ADVANCED NEURAL LOGIC
  </p>
</div>
        </div>
      </div>
      
      {/* ISI KONTEN (MARKDOWN) */}
      <div className="p-8">
        <ReactMarkdown
          components={{
            // JUDUL BESAR (H1)
            h1: ({node, ...props}) => (
              <h1 className="text-3xl font-extrabold text-white mb-6 pb-4 border-b border-slate-700" {...props} />
            ),
            // JUDUL SUB-BAB (H2) - Biasanya untuk "Red Flags" atau "Kesimpulan"
            h2: ({node, ...props}) => (
              <h2 className="text-xl font-bold text-emerald-400 mt-8 mb-4 flex items-center gap-2" {...props} />
            ),
            // JUDUL KECIL (H3)
            h3: ({node, ...props}) => (
              <h3 className="text-lg font-semibold text-slate-200 mt-6 mb-2" {...props} />
            ),
            // LIST (Titik-titik)
            ul: ({node, ...props}) => (
              <ul className="list-disc pl-5 space-y-3 text-slate-300 mb-6 marker:text-emerald-500" {...props} />
            ),
            // LIST ITEM
            li: ({node, ...props}) => (
              <li className="leading-relaxed" {...props} />
            ),
            // TEKS TEBAL (STRONG) - Kita ganti jadi Merah Terang/Kuning untuk highlight bahaya
            strong: ({node, ...props}) => (
              <strong className="font-bold text-rose-400 bg-rose-400/10 px-1 rounded" {...props} />
            ),
            // PARAGRAF BIASA
            p: ({node, ...props}) => (
              <p className="text-slate-300 leading-relaxed mb-4" {...props} />
            ),
            // BLOCKQUOTE (Kutipan Pasal)
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4" {...props} />
            )
          }}
        >
          {result}
        </ReactMarkdown>
      </div>

      {/* FOOTER DISCLAIMER */}
      <div className="bg-slate-950/50 p-4 border-t border-slate-800">
         <div className="flex items-start gap-3 max-w-2xl mx-auto text-xs text-slate-500 text-center sm:text-left">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 mx-auto sm:mx-0" />
            <p>
              <strong>Disclaimer Penting:</strong> Analisis ini dihasilkan secara otomatis oleh kecerdasan buatan (AI). 
              Hasil ini hanya untuk tujuan referensi awal dan <u>bukan pengganti nasihat hukum profesional</u>. 
              Selalu konsultasikan kontrak bernilai tinggi dengan pengacara berlisensi sebelum tanda tangan.
            </p>
         </div>
      </div>
    </div>
  );
};

