
import React, { useState, useCallback, useEffect } from 'react';
import { LayoutType, ImageItem, ProcessingOptions, ResultStats, ImageAnnotation } from './types.ts';
import { Language, translations } from './translations.ts';
import Dropzone from './components/Dropzone.tsx';
import Sidebar from './components/Sidebar.tsx';
import ImageList from './components/ImageList.tsx';
import MergedPreview from './components/MergedPreview.tsx';
import EditorModal from './components/EditorModal.tsx';
import { processImages } from './services/imageProcessor.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('snapstitch_lang');
    return (saved as Language) || 'zh';
  });

  const t = translations[lang];

  const [images, setImages] = useState<ImageItem[]>([]);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  
  const [options, setOptions] = useState<ProcessingOptions>({
    layoutType: LayoutType.GRID,
    columns: 2,
    quality: 0.8,
    gap: 10,
    backgroundColor: '#ffffff',
    isOriginalSize: false
  });
  const [result, setResult] = useState<{ url: string; stats: ResultStats } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem('snapstitch_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const newItems: ImageItem[] = [];
    let processed = 0;

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          newItems.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string,
            width: img.width,
            height: img.height,
            annotations: []
          });
          processed++;
          if (processed === newFiles.length) {
            setImages(prev => [...prev, ...newItems]);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const reorderImages = (startIndex: number, endIndex: number) => {
    const result = Array.from(images);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setImages(result);
  };

  const updateImageAnnotations = (id: string, annotations: ImageAnnotation[]) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, annotations } : img));
    setEditingImageId(null);
  };

  useEffect(() => {
    if (images.length === 0) {
      setResult(null);
      return;
    }

    const triggerProcessing = async () => {
      setIsProcessing(true);
      try {
        const processed = await processImages(images, options);
        setResult(processed);
      } catch (err) {
        console.error("Processing failed", err);
      } finally {
        setIsProcessing(false);
      }
    };

    const timeout = setTimeout(triggerProcessing, 400);
    return () => clearTimeout(timeout);
  }, [images, options]);

  const activeEditingImage = images.find(img => img.id === editingImageId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200">
      <Sidebar 
        options={options} 
        setOptions={setOptions} 
        imagesCount={images.length}
        result={result}
        t={t}
      />

      <main className="flex-1 overflow-hidden flex flex-col relative">
        <header className="p-6 flex justify-between items-center border-b border-slate-800 glass-morphism sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              {t.title}
            </h1>
            <p className="text-sm text-slate-400">{t.subtitle}</p>
          </div>
          <div className="flex gap-3 items-center">
             <button 
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
             >
               {t.switchLang}
             </button>
             {result && (
               <a 
                href={result.url} 
                download="snapstitch-merged.jpg"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20"
               >
                 {t.download}
               </a>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {images.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Dropzone onFilesAdded={handleFilesAdded} t={t} />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <h2 className="text-lg font-semibold flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                     {t.selectedImages} ({images.length})
                     <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 ml-2 font-normal uppercase tracking-wider">{t.dragToReorder}</span>
                   </h2>
                   <button 
                    onClick={() => setImages([])}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                   >
                     {t.clearAll}
                   </button>
                </div>
                <ImageList 
                  images={images} 
                  onRemove={removeImage} 
                  onReorder={reorderImages}
                  onAddMore={handleFilesAdded}
                  onEdit={setEditingImageId}
                  t={t}
                />
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {t.grid} Preview
                </h2>
                <div className="sticky top-24">
                  <MergedPreview 
                    result={result} 
                    isProcessing={isProcessing} 
                    options={options}
                    t={t}
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {activeEditingImage && (
        <EditorModal 
          image={activeEditingImage}
          onSave={(anns) => updateImageAnnotations(activeEditingImage.id, anns)}
          onClose={() => setEditingImageId(null)}
          t={t}
        />
      )}
    </div>
  );
};

export default App;
