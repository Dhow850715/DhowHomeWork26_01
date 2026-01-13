
import React, { useState, useRef, useEffect } from 'react';
import { ImageItem, ImageAnnotation, EditType } from '../types.ts';

interface EditorModalProps {
  image: ImageItem;
  onSave: (annotations: ImageAnnotation[]) => void;
  onClose: () => void;
  t: any;
}

const EditorModal: React.FC<EditorModalProps> = ({ image, onSave, onClose, t }) => {
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>(image.annotations || []);
  const [selectedTool, setSelectedTool] = useState<EditType>('text');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [currentSize, setCurrentSize] = useState(40);
  const [currentStroke, setCurrentStroke] = useState(5);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [imgScale, setImgScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 40;
      const availableW = clientWidth - padding;
      const availableH = clientHeight - padding;
      
      const scale = Math.min(availableW / image.width, availableH / image.height, 1);
      setImgScale(scale);
      setOffset({
        x: (clientWidth - image.width * scale) / 2,
        y: (clientHeight - image.height * scale) / 2
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [image]);

  const addAnnotation = (e: React.MouseEvent) => {
    if (selectedId) {
      setSelectedId(null);
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - offset.x) / imgScale;
    const y = (e.clientY - rect.top - offset.y) / imgScale;

    if (x < 0 || y < 0 || x > image.width || y > image.height) return;

    const newAnn: ImageAnnotation = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedTool,
      x,
      y,
      color: currentColor,
      fontSize: currentSize,
      strokeWidth: currentStroke,
      width: selectedTool === 'text' ? 0 : 100,
      height: selectedTool === 'text' ? 0 : 100,
      text: selectedTool === 'text' ? 'Text' : undefined
    };

    setAnnotations([...annotations, newAnn]);
    setSelectedId(newAnn.id);
  };

  const deleteSelected = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedId) {
      setAnnotations(annotations.filter(a => a.id !== selectedId));
      setSelectedId(null);
    }
  };

  const updateSelectedText = (text: string) => {
    setAnnotations(annotations.map(a => a.id === selectedId ? { ...a, text } : a));
  };

  const currentSelection = annotations.find(a => a.id === selectedId);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-stretch">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 glass-morphism">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white">{t.editImage}</h2>
          <div className="flex bg-slate-800 rounded-lg p-1">
             {(['text', 'rect', 'circle'] as EditType[]).map(tool => (
                <button
                  key={tool}
                  onClick={() => setSelectedTool(tool)}
                  className={`px-3 py-1 rounded text-xs transition-all ${selectedTool === tool ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  {tool === 'text' ? t.addText : tool === 'rect' ? t.addRect : t.addCircle}
                </button>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">{t.cancel}</button>
          <button 
            onClick={() => onSave(annotations)} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all"
          >
            {t.save}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div 
          ref={containerRef}
          className="flex-1 relative cursor-crosshair overflow-hidden" 
          onClick={addAnnotation}
        >
          <div 
            className="absolute shadow-2xl" 
            style={{ 
              width: image.width * imgScale, 
              height: image.height * imgScale,
              left: offset.x,
              top: offset.y,
              backgroundImage: `url(${image.preview})`,
              backgroundSize: 'cover'
            }}
          >
            {annotations.map(ann => {
              const style: React.CSSProperties = {
                position: 'absolute',
                left: ann.x * imgScale,
                top: ann.y * imgScale,
                color: ann.color,
                borderColor: ann.color,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                cursor: 'pointer'
              };

              if (ann.type === 'text') {
                return (
                  <div 
                    key={ann.id} 
                    style={{ ...style, fontSize: (ann.fontSize || 20) * imgScale, fontWeight: 'bold' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(ann.id); }}
                    className={selectedId === ann.id ? 'outline outline-2 outline-blue-500 outline-offset-4 ring-2 ring-white/20' : ''}
                  >
                    {ann.text}
                  </div>
                );
              } else if (ann.type === 'rect') {
                return (
                  <div 
                    key={ann.id} 
                    style={{ 
                      ...style, 
                      width: 100 * imgScale, 
                      height: 80 * imgScale, 
                      borderWidth: (ann.strokeWidth || 2) * imgScale,
                      borderStyle: 'solid'
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(ann.id); }}
                    className={selectedId === ann.id ? 'outline outline-2 outline-blue-500 outline-offset-4' : ''}
                  />
                );
              } else {
                return (
                  <div 
                    key={ann.id} 
                    style={{ 
                      ...style, 
                      width: 100 * imgScale, 
                      height: 100 * imgScale, 
                      borderRadius: '50%',
                      borderWidth: (ann.strokeWidth || 2) * imgScale,
                      borderStyle: 'solid'
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(ann.id); }}
                    className={selectedId === ann.id ? 'outline outline-2 outline-blue-500 outline-offset-4' : ''}
                  />
                );
              }
            })}
          </div>
        </div>

        <aside className="w-full md:w-72 bg-slate-900 border-l border-white/10 p-6 flex flex-col gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">{t.color}</label>
            <input 
              type="color" 
              className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none"
              value={selectedId ? currentSelection?.color : currentColor}
              onChange={(e) => {
                if (selectedId) setAnnotations(annotations.map(a => a.id === selectedId ? { ...a, color: e.target.value } : a));
                else setCurrentColor(e.target.value);
              }}
            />
          </div>

          {selectedTool === 'text' || (selectedId && currentSelection?.type === 'text') ? (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">{t.size}</label>
              <input 
                type="range" min="10" max="200" 
                className="w-full accent-blue-500"
                value={selectedId ? currentSelection?.fontSize : currentSize}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (selectedId) setAnnotations(annotations.map(a => a.id === selectedId ? { ...a, fontSize: v } : a));
                  else setCurrentSize(v);
                }}
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">{t.stroke}</label>
              <input 
                type="range" min="1" max="40" 
                className="w-full accent-blue-500"
                value={selectedId ? currentSelection?.strokeWidth : currentStroke}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (selectedId) setAnnotations(annotations.map(a => a.id === selectedId ? { ...a, strokeWidth: v } : a));
                  else setCurrentStroke(v);
                }}
              />
            </div>
          )}

          {selectedId && (
            <div className="mt-4 pt-6 border-t border-white/5 space-y-4">
              {currentSelection?.type === 'text' && (
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{t.addText}</label>
                   <input 
                    type="text" 
                    value={currentSelection.text} 
                    onChange={(e) => updateSelectedText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                   />
                </div>
              )}
              <button 
                onClick={deleteSelected}
                className="w-full py-2 bg-red-600/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {t.delete}
              </button>
            </div>
          )}

          <div className="mt-auto text-[10px] text-slate-500 italic">
            {t.clickToEdit}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditorModal;
