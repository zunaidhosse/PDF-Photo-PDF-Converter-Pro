export type ActiveTab = 'dashboard' | 'photo-to-pdf' | 'pdf-to-photo' | 'add-logo';

export interface SelectedPhoto {
  id: string;
  name: string;
  src: string; // base64 / blob URL
  size: string;
  file: File;
}

export interface ConvertedImage {
  pageNumber: number;
  src: string; // base64 high quality data URL
  width: number;
  height: number;
}

export interface LogoConfig {
  src: string | null;
  name: string | null;
  x: number; // percentage of target canvas width (0-100)
  y: number; // percentage of target canvas height (0-100)
  scale: number; // standard multiplier (e.g. 0.1 to 2.0)
  rotation: number; // rotation in degrees (0 to 360)
  opacity: number; // opacity (0 to 1)
  width: number; // base size
  height: number;
}
