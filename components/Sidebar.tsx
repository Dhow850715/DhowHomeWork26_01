
import React from 'react';
import { LayoutType, ProcessingOptions, ResultStats } from '../types';

interface SidebarProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  imagesCount: number;
  result: { url: string; stats: ResultStats } | null;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ options, setOptions, imagesCount, result, t }) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <aside className="w-full md:w-80 glass-morphism border-r border-slate-800 p-6 flex flex-col gap-8 h-auto md:h-screen overflow-y-auto">
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.layoutOptions}</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-2">{t.stitchMode}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: LayoutType.GRID, label: t.grid },
                { type: LayoutType.HORIZONTAL, label: t.row },
                { type: LayoutType.VERTICAL, label: t.col },
              ].map((m) => (
                <button
                  key={m.type}
                  onClick={() => setOptions(prev => ({ ...prev, layoutType: m.type }))}
                  className={`py-2 px-1 rounded-md text-[10px] font-bold transition-all ${
                    options.layoutType === m.type 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {options.layoutType === LayoutType.GRID && (
            <div>
              <label className="text-xs font-medium block mb-2">{t.columns}: {options.columns}</label>
              <input 
                type="range" min="1" max="12" step="1"
                value={options.columns}
                onChange={(e) => setOptions(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium block mb-2">{t.gapSize}: {options.gap}px</label>
            <input 
              type="range" min="0" max="100" step="1"
              value={options.gap}
              onChange={(e) => setOptions(prev => ({ ...prev, gap: parseInt(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-2">{t.backgroundColor}</label>
            <div className="flex gap-2 items-center">
              <input 
                type="color"
                value={options.backgroundColor}
                onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer bg-transparent"
              />
              <span className="text-sm font-mono uppercase text-slate-400">{options.backgroundColor}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t.outputQuality}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">{t.useOriginal}</label>
            <button 
              onClick={() => setOptions(prev => ({ ...prev, isOriginalSize: !prev.isOriginalSize }))}
              className={`w-10 h-5 rounded-full relative transition-colors ${options.isOriginalSize ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${options.isOriginalSize ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {!options.isOriginalSize && (
            <div>
              <label className="text-xs font-medium block mb-2">{t.compressionQuality}: {Math.round(options.quality * 100)}%</label>
              <input 
                type="range" min="0.1" max="1.0" step="0.05"
                value={options.quality}
                onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full accent-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-1 italic">{t.compressionHint}</p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.statsEstimate}</h3>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">{t.originalTotal}:</span>
              <span className="font-mono">{formatSize(result.stats.originalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.outputSize}:</span>
              <span className="font-mono text-green-400">{formatSize(result.stats.estimatedSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t.dimensions}:</span>
              <span className="font-mono">{result.stats.dimensions.width} x {result.stats.dimensions.height}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1 text-green-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.privacyNotice}</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {t.privacyDesc}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
