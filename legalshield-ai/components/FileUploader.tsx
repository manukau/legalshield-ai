import React, { useRef, useState } from 'react';
import { Upload, FileText, X, FileCheck2 } from 'lucide-react';

interface FileUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ selectedFile, onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Mohon upload file PDF saja.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Mohon upload file PDF saja.");
      }
    }
  };

  return (
    <div className="w-full">
      {/* INPUT TERSEMBUNYI */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
        disabled={disabled}
      />

      {/* AREA UPLOAD UTAMA */}
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center text-center overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          
          /* --- LOGIKA WARNA & HOVER ADA DI SINI --- */
          ${isDragging 
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02] shadow-[0_0_30px_rgba(52,211,153,0.3)]' // Saat file di-drag masuk
            : selectedFile 
              ? 'border-emerald-500/50 bg-slate-900/50' // Saat file sudah dipilih
              : 'border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-gradient-to-b hover:from-slate-900 hover:to-emerald-900/20' // Saat diam & di-hover (PERBAIKAN GLOW)
          }
        `}
      >
        
        {/* EFEK GRID BACKGROUND (Hiasan) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {selectedFile ? (
          // TAMPILAN JIKA FILE SUDAH DIPILIH
          <div className="relative z-10 animate-fade-in-up">
            <div className="bg-emerald-500/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <FileCheck2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1 truncate max-w-[300px]">
              {selectedFile.name}
            </h3>
            <p className="text-emerald-400 text-xs font-mono mb-4">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF READY
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 text-xs rounded-lg border border-slate-700 hover:border-red-500/50 transition-colors flex items-center gap-2 mx-auto"
            >
              <X className="w-3 h-3" /> Ganti File
            </button>
          </div>
        ) : (
          // TAMPILAN JIKA BELUM ADA FILE (DEFAULT)
          <div className="relative z-10">
            {/* Lingkaran Icon */}
            <div className={`
              w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300
              ${isDragging 
                ? 'bg-emerald-500 text-white scale-110 shadow-lg' 
                : 'bg-slate-800 text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]'
              }
            `}>
              <Upload className="w-10 h-10" />
            </div>
            
            {/* Teks Utama */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              {isDragging ? "Lepaskan File PDF Di Sini" : "Klik atau Drag File PDF"}
            </h3>
            
            {/* Teks Subjudul */}
            <p className="text-slate-500 text-sm max-w-xs mx-auto group-hover:text-slate-400 transition-colors">
              Analisa otomatis kontrak sewa, perjanjian kerja, atau dokumen legal lainnya.
            </p>

            {/* Badge Info */}
            <div className="mt-6 flex items-center justify-center gap-2">
               <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-500 border border-slate-700 group-hover:border-emerald-500/30 group-hover:text-emerald-500/70 transition-colors">
                 MAX 10MB
               </span>
               <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-500 border border-slate-700 group-hover:border-emerald-500/30 group-hover:text-emerald-500/70 transition-colors">
                 PDF ONLY
               </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
