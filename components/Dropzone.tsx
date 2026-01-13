
import React, { useState } from 'react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  t: any;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, t }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
      onFilesAdded(files);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = (Array.from(e.target.files) as File[]).filter(f => f.type.startsWith('image/'));
      onFilesAdded(files);
    }
  };

  return (
    <div 
      className={`w-full max-w-xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10' 
          : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        onChange={handleInput} 
      />
      <div className="p-4 bg-slate-700 rounded-full mb-4 group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <p className="text-xl font-medium text-slate-200">{t.dragDrop}</p>
      <p className="text-sm text-slate-400 mt-2">{t.orClick}</p>
      <p className="text-xs text-slate-500 mt-4 font-mono uppercase tracking-widest">{t.supportedFiles}</p>
    </div>
  );
};

export default Dropzone;
