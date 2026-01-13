
export enum LayoutType {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  GRID = 'GRID'
}

export type EditType = 'text' | 'rect' | 'circle';

export interface ImageAnnotation {
  id: string;
  type: EditType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  fontSize?: number;
  strokeWidth?: number;
}

export interface ImageItem {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  annotations: ImageAnnotation[];
}

export interface ProcessingOptions {
  layoutType: LayoutType;
  columns: number;
  quality: number; // 0 to 1
  gap: number;
  backgroundColor: string;
  isOriginalSize: boolean;
}

export interface ResultStats {
  originalSize: number;
  estimatedSize: number;
  dimensions: { width: number; height: number };
}
