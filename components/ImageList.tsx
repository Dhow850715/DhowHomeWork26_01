
import React, { useState } from 'react';
import { ImageItem } from '../types';

interface ImageListProps {
  images: ImageItem[];
  onRemove: (id: string) => void;
  onReorder: (start: number, end: number) => void;
  onAddMore: (files: File[]) => void;
  onEdit: (id: string) => void;
  t: any;
}

const ImageList: React.FC<ImageListProps> = ({ images, onRemove, onReorder, onAddMore, onEdit, t }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddMore(Array.from(e.target.files) as File[]);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {images.map((img, index) => (
        <div 
          key={img.id} 
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          className={`group relative aspect-square rounded-xl overflow-hidden bg-slate-800 border-2 transition-all shadow-lg cursor-grab active:cursor-grabbing
            ${draggedIndex === index ? 'opacity-40 border-blue-500' : 'border-slate-700 hover:border-blue-500'}
          `}
        >
          <img 
            src={img.preview} 
            alt="Preview" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(img.id); }}
              className="px-3 py-1.5 bg-blue-600 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              {t.editImage}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
              className="p-2 bg-red-600 rounded-full hover:bg-red-500 transition-colors shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
            {index + 1}
          </div>
          {img.annotations.length > 0 && (
             <div className="absolute top-1 right-1 bg-blue-500/80 p-1 rounded-full border border-white/20">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
             </div>
          )}
        </div>
      ))}
      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-800/30 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-all">
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleInput} />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{t.addMore}</span>
      </label>
    </div>
  );
};

export default ImageList;
