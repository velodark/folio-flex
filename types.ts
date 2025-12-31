
export type ElementType = 'text' | 'image' | 'hotspot' | 'video' | 'headline';

export interface MagazineElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style?: Record<string, any>;
  animation?: 'fade' | 'parallax' | 'slide-up' | 'none';
  action?: {
    type: 'link' | 'page' | 'reveal';
    value: string;
  };
  isSuggestion?: boolean;
}

export interface Page {
  id: string;
  elements: MagazineElement[];
  background?: string;
}

export interface Magazine {
  id: string;
  title: string;
  pages: Page[];
  brandKit: BrandKit;
  style: 'editorial' | 'bold' | 'minimal' | 'warm';
  aspectRatio: number; // width / height of a single page
}

export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  logo?: string;
}

export type ViewMode = 'onboarding' | 'editor' | 'preview' | 'publishing';
