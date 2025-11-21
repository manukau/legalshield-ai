import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ShieldCheck } from 'lucide-react';

interface ResultDisplayProps {
  result: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-green-400" />
          Hasil Analisa LegalShield
        </h2>
        <p className="opacity-80 mt-1">Dianalisa oleh AI Senior Lawyer (Gemini 2.5 Flash)</p>
      </div>
      
      <div className="p-8 prose prose-blue max-w-none">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-blue-900 mt-6 mb-3 flex items-center gap-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-4" {...props} />,
            li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-red-700" {...props} />,
            p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />
          }}
        >
          {result}
        </ReactMarkdown>
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-200 text-center text-sm text-gray-500">
        Disclaimer: Hasil analisa ini dibuat oleh AI dan bukan nasihat hukum resmi. Selalu konsultasikan dengan pengacara manusia untuk keputusan final.
      </div>
    </div>
  );
};
