
import React from 'react';
import { ResultStats, ProcessingOptions } from '../types';

interface MergedPreviewProps {
  result: { url: string; stats: ResultStats } | null;
  isProcessing: boolean;
  options: ProcessingOptions;
  t: any;
}

const MergedPreview: React.FC<MergedPreviewProps> = ({ result, isProcessing, options, t }) => {
  return (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl min-h-[400px] flex items-center justify-center">
      {isProcessing && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-blue-400 animate-pulse">{t.processing}</p>
        </div>
      )}

      {result ? (
        <div className="w-full h-full flex items-center justify-center p-4">
           <img 
            src={result.url} 
            alt="Stitched result" 
            className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded" 
            style={{ backgroundColor: options.backgroundColor }}
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => window.open(result.url, '_blank')}
              className="bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all shadow-lg"
              title="Open Full Size"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-slate-600 flex flex-col items-center gap-4 text-center px-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-lg font-medium opacity-50">{t.nothingPreview}</p>
            <p className="text-sm opacity-30 mt-1">{t.uploadHint}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MergedPreview;
