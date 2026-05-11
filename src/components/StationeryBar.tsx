import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Highlighter, 
  Image as ImageIcon, 
  Sigma, 
  Type, 
  Palette, 
  Layers,
  StickyNote as StickyIcon,
  Download,
  Share2,
  Settings2,
  Save,
  Check,
  Loader2,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Heading1,
  Heading2,
  Heading3,
  Divide,
  List,
  ListOrdered,
  Pipette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaperTexture } from '@/src/types';
import { cn } from '@/lib/utils';

interface StationeryBarProps {
  onFormat: (type: string, value?: any) => void;
  onTextureChange: (texture: PaperTexture) => void;
  onImageUpload: () => void;
  onStickyAdd: () => void;
  onMathToggle: () => void;
  onExport: (format: 'bundle' | 'note' | 'md') => void;
  onImport: () => void;
  isSaving: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#ffff00' },
  { name: 'Blue', color: '#bfdbfe' },
  { name: 'Green', color: '#bbf7d0' },
  { name: 'Pink', color: '#f9a8d4' },
  { name: 'Orange', color: '#fed7aa' },
];

const TEXT_COLORS = [
  { name: 'Stone', color: '#1c1917' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Gold', color: '#d97706' },
];

export const StationeryBar: React.FC<StationeryBarProps> = ({
  onFormat,
  onTextureChange,
  onImageUpload,
  onStickyAdd,
  onMathToggle,
  onExport,
  onImport,
  isSaving,
}) => {
  return (
    <TooltipProvider>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-stone-900/90 dark:border-stone-800 backdrop-blur-md border border-stone-200 paper-shadow rounded-2xl px-5 py-2.5 flex items-center gap-1.5 z-50 animate-in fade-in slide-in-from-bottom-6 duration-700 text-stone-900 dark:text-stone-100">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('bold')} className="hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8">
                <Bold className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('italic')} className="hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8">
                <Italic className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('underline')} className="hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8">
                <Underline className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8">
                    <Type className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Headings</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[8rem]">
              <DropdownMenuItem onClick={() => onFormat('h1')} className="font-bold flex items-center gap-2">
                <Heading1 className="w-4 h-4" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('h2')} className="font-semibold flex items-center gap-2">
                <Heading2 className="w-4 h-4" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('h3')} className="font-medium flex items-center gap-2">
                <Heading3 className="w-4 h-4" /> Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Alignment</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[8rem]">
              <DropdownMenuItem onClick={() => onFormat('align', 'left')} className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4" /> Align Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('align', 'center')} className="flex items-center gap-2">
                <AlignCenter className="w-4 h-4" /> Align Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('align', 'right')} className="flex items-center gap-2">
                <AlignRight className="w-4 h-4" /> Align Right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('align', 'justify')} className="flex items-center gap-2">
                <AlignJustify className="w-4 h-4" /> Justify
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 dark:bg-stone-800" />

        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 w-8 h-8">
                    <Highlighter className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Highlighter</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="flex p-2 gap-2 paper-shadow border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.color}
                  className="w-6 h-6 rounded-full border border-black/5 hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: c.color }}
                  onClick={() => onFormat('highlight', c.color)}
                  title={c.name}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 w-8 h-8">
                    <Pipette className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Text Color</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="flex p-2 gap-2 paper-shadow border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
              {TEXT_COLORS.map(c => (
                <button
                  key={c.color}
                  className="w-6 h-6 rounded-full border border-black/5 hover:scale-110 transition-transform shadow-sm"
                  style={{ backgroundColor: c.color }}
                  onClick={() => onFormat('color', c.color)}
                  title={c.name}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat('hr')} className="hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8 text-stone-500 dark:text-stone-400">
                <Divide className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Separator Line</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={onMathToggle} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 w-8 h-8">
                <Sigma className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>LaTeX Equation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={onStickyAdd} className="hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-400 w-8 h-8">
                <StickyIcon className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sticky Note</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1 dark:bg-stone-800" />

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onMouseDown={(e) => e.preventDefault()} onClick={onImageUpload} className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 w-8 h-8">
                <ImageIcon className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8">
                    <Layers className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Paper Style</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
              <DropdownMenuItem onClick={() => onTextureChange('plain')}>Plain Paper</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTextureChange('laid')}>Laid Pattern</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTextureChange('grid')}>Graph Grid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTextureChange('linen')}>Linen Texture</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(
                    "hover:bg-stone-100 dark:hover:bg-stone-800 w-8 h-8 relative"
                  )}>
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Settings2 className="w-3.5 h-3.5" />}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{isSaving ? "Saving..." : "More Options"}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="paper-shadow border-stone-200 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 min-w-[12rem]">
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Data</div>
              <DropdownMenuItem onClick={onImport} className="font-semibold">Import (.papyrus)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('note')}>Export Current Note (.papyrus)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('bundle')}>Export All (Backup .papyrus)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
};
