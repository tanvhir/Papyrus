export type PaperTexture = 'plain' | 'laid' | 'grid' | 'linen';

export interface NoteTheme {
  id: string;
  name: string;
  bgColor: string;
  paperColor: string;
  inkColor: string;
  accentColor: string;
}

export const THEMES: NoteTheme[] = [
  {
    id: 'classic',
    name: 'Classic Cream',
    bgColor: '#F4F1EA',
    paperColor: '#FFFCF5',
    inkColor: '#1A1A1A',
    accentColor: '#C0A080',
  },
  {
    id: 'dark',
    name: 'Midnight Ink',
    bgColor: '#1A1A1A',
    paperColor: '#262626',
    inkColor: '#E4E4E4',
    accentColor: '#3B82F6',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    bgColor: '#EBEFE7',
    paperColor: '#F7FAF5',
    inkColor: '#2D3436',
    accentColor: '#6B8E23',
  }
];

export interface Note {
  id: string;
  title: string;
  content: string;
  texture: PaperTexture;
  themeId: string;
  createdAt: number;
  updatedAt: number;
}
