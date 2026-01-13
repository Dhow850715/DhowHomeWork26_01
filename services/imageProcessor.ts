
import { ImageItem, ProcessingOptions, LayoutType, ResultStats, ImageAnnotation } from '../types';

const drawAnnotations = (ctx: CanvasRenderingContext2D, annotations: ImageAnnotation[], x: number, y: number, scale: number) => {
  annotations.forEach(ann => {
    ctx.save();
    ctx.translate(x + ann.x * scale, y + ann.y * scale);
    
    ctx.fillStyle = ann.color;
    ctx.strokeStyle = ann.color;
    ctx.lineWidth = (ann.strokeWidth || 2) * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (ann.type === 'text') {
      ctx.font = `bold ${Math.round((ann.fontSize || 40) * scale)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Basic text shadowing for visibility
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4 * scale;
      ctx.fillText(ann.text || '', 0, 0);
    } else if (ann.type === 'rect') {
      const w = 100 * scale;
      const h = 80 * scale;
      ctx.strokeRect(-w/2, -h/2, w, h);
    } else if (ann.type === 'circle') {
      const radius = 50 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  });
};

export const processImages = async (
  items: ImageItem[],
  options: ProcessingOptions
): Promise<{ url: string; stats: ResultStats }> => {
  if (items.length === 0) throw new Error("No images provided");

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not initialize canvas");

  const { layoutType, columns: configCols, gap, backgroundColor, quality, isOriginalSize } = options;

  let columns = configCols;
  if (layoutType === LayoutType.HORIZONTAL) columns = items.length;
  if (layoutType === LayoutType.VERTICAL) columns = 1;
  
  const rows = Math.ceil(items.length / columns);

  const maxWidth = Math.max(...items.map(i => i.width));
  const maxHeight = Math.max(...items.map(i => i.height));

  const cellWidth = maxWidth;
  const cellHeight = maxHeight;

  canvas.width = (columns * cellWidth) + ((columns + 1) * gap);
  canvas.height = (rows * cellHeight) + ((rows + 1) * gap);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const loadPromises = items.map(item => {
    return new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = item.preview;
    });
  });

  const loadedImages = await Promise.all(loadPromises);

  loadedImages.forEach((img, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    const x = gap + (col * (cellWidth + gap));
    const y = gap + (row * (cellHeight + gap));

    const ratio = Math.max(cellWidth / img.width, cellHeight / img.height);
    const drawWidth = img.width * ratio;
    const drawHeight = img.height * ratio;
    const drawX = x + (cellWidth - drawWidth) / 2;
    const drawY = y + (cellHeight - drawHeight) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, cellWidth, cellHeight);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
    // Draw annotations on this specific image cell
    const annotations = items[index].annotations;
    if (annotations && annotations.length > 0) {
       drawAnnotations(ctx, annotations, drawX, drawY, ratio);
    }

    ctx.restore();
  });

  const mimeType = 'image/jpeg';
  const finalQuality = isOriginalSize ? 1.0 : quality;
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Blob creation failed");
      const url = URL.createObjectURL(blob);
      const originalSize = items.reduce((acc, curr) => acc + curr.file.size, 0);
      
      resolve({
        url,
        stats: {
          originalSize,
          estimatedSize: blob.size,
          dimensions: {
            width: canvas.width,
            height: canvas.height
          }
        }
      });
    }, mimeType, finalQuality);
  });
};
