
import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  MousePointer, 
  PlayCircle, 
  Layout, 
  Palette, 
  Layers,
  Sparkles,
  Zap,
  Download,
  Share2,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Settings,
  Monitor,
  Video,
  Undo as UndoIcon,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

export const ICONS = {
  Text: <Type size={18} />,
  Image: <ImageIcon size={18} />,
  Hotspot: <MousePointer size={18} />,
  Video: <PlayCircle size={18} />,
  Layout: <Layout size={18} />,
  Palette: <Palette size={18} />,
  Layers: <Layers size={18} />,
  Sparkles: <Sparkles size={18} />,
  Zap: <Zap size={18} />,
  Download: <Download size={18} />,
  Share: <Share2 size={18} />,
  Trash: <Trash2 size={18} />,
  Copy: <Copy size={18} />,
  Prev: <ChevronLeft size={20} />,
  Next: <ChevronRight size={20} />,
  Plus: <Plus size={20} />,
  ArrowRight: <ArrowRight size={18} />,
  Settings: <Settings size={18} />,
  Monitor: <Monitor size={18} />,
  Animate: <Video size={18} />,
  Undo: <UndoIcon size={18} />,
  ThumbsUp: <ThumbsUp size={18} />,
  ThumbsDown: <ThumbsDown size={18} />
};

export const STYLE_PRESETS = [
  { id: 'editorial', name: 'Editorial Classic', description: 'Refined grids, serif headlines, generous margins' },
  { id: 'bold', name: 'Bold Contemporary', description: 'High contrast, oversized type, bleeding images' },
  { id: 'minimal', name: 'Minimal Clean', description: 'Whitespace-forward, subtle type, restrained palette' },
  { id: 'warm', name: 'Warm Lifestyle', description: 'Soft tones, organic shapes, approachable feel' }
];

export const INITIAL_BRAND_KIT = {
  primaryColor: '#0f172a',
  secondaryColor: '#ffffff',
  accentColor: '#3b82f6',
  headingFont: 'Playfair Display',
  bodyFont: 'Inter'
};
