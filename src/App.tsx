import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from '@/src/components/Editor';
import { StationeryBar } from '@/src/components/StationeryBar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Palette, 
  Feather, 
  Plus, 
  Check,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Book,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  PenTool,
  Save,
  Download,
  Upload,
  Clock,
  CloudOff,
  FileText,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandPalette } from '@/src/components/CommandPalette';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import html2pdf from 'html2pdf.js';
import { PaperTexture, NoteTheme, THEMES } from '@/src/types';

import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'Papyrus',
  storeName: 'notes'
});

interface Note {
  id: string;
  title: string;
  content: string;
  stickies: { id: string, text: string, color: string }[];
  texture: PaperTexture;
  themeId: string;
  isHandwriting: boolean;
}

interface Subject {
  id: string;
  name: string;
  notes: Note[];
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STICKY_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', dot: '#fef08a' },
  { id: 'blue', bg: 'bg-blue-200', dot: '#bfdbfe' },
  { id: 'pink', bg: 'bg-pink-300', dot: '#f9a8d4' },
  { id: 'green', bg: 'bg-green-200', dot: '#bbf7d0' },
  { id: 'orange', bg: 'bg-orange-200', dot: '#fed7aa' },
  { id: 'purple', bg: 'bg-purple-200', dot: '#e9d5ff' },
];

const StickyNote = ({ id, content, color, onRemove, onEdit, containerRef, isHandwriting }: { id: string, content: string, color: string, onRemove: () => void, onEdit: (sticky: {id: string, text: string, color: string}) => void, containerRef: React.RefObject<HTMLDivElement>, isHandwriting?: boolean }) => {
  const colorConfig = STICKY_COLORS.find(c => c.id === color) || STICKY_COLORS[0];
  const bgClass = colorConfig.bg;
  
  const fontClass = isHandwriting ? "font-handwriting" : "font-bangla";
  const proseFontClass = isHandwriting ? "[&_.ProseMirror]:font-handwriting [&_.ProseMirror_p]:font-handwriting [&_.ProseMirror_h1]:font-handwriting [&_.ProseMirror_h2]:font-handwriting [&_.ProseMirror_h3]:font-handwriting" : "[&_.ProseMirror]:font-bangla [&_.ProseMirror_p]:font-bangla [&_.ProseMirror_h1]:font-bangla [&_.ProseMirror_h2]:font-bangla [&_.ProseMirror_h3]:font-bangla";
  
  return (
    <motion.div 
      drag
      dragConstraints={containerRef}
      dragElastic={0}
      initial={{ scale: 0.8, rotate: Math.random() * 4 - 2, opacity: 0 }}
      animate={{ scale: 1, rotate: 2, opacity: 1 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
      className={cn(
        "absolute p-5 w-auto max-w-[320px] min-w-[240px] h-auto min-h-[224px] paper-shadow cursor-move z-40 flex flex-col justify-between group overflow-visible",
        bgClass,
        fontClass
      )}
    >
      <div className="flex-1 overflow-y-auto pr-1 overflow-x-hidden custom-scrollbar w-full text-stone-800">
        <Editor 
          content={content} 
          editable={false} 
          className="w-full pointer-events-none" 
          editorClass={cn("prose prose-sm prose-stone max-w-none focus:outline-none leading-relaxed pt-2 break-words text-stone-800",
                         proseFontClass, fontClass,
                         "[&_.katex-display]:my-2 [&_.katex]:text-base")}
        />
      </div>
      <div className="mt-4 flex justify-between items-center z-10 relative">
        <button onClick={() => onEdit({id, text: content, color})} className="text-[10px] text-stone-800/40 hover:text-stone-800 uppercase tracking-widest font-mono font-bold transition-all cursor-pointer pointer-events-auto">Edit</button>
        <button onClick={onRemove} className="text-[10px] text-stone-800/40 hover:text-stone-800 uppercase tracking-widest font-mono font-bold transition-all cursor-pointer pointer-events-auto">Remove</button>
      </div>
      <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-full pointer-events-none" />
    </motion.div>
  );
};

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 'default-subject',
      name: 'General Notes',
      notes: [
        {
          id: 'default-note',
          title: 'Chapter 1',
          content: '',
          stickies: [],
          texture: 'laid',
          themeId: 'light',
          isHandwriting: true,
        }
      ]
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState('default-note');
  const [isLoading, setIsLoading] = useState(true);
  const [fileHandle, setFileHandle] = useState<any>(null);

  // Load data from IndexedDB on mount
  useEffect(() => {
    async function loadData() {
      try {
        const savedSubjects = await localforage.getItem<Subject[]>('papyrus-subjects');
        const savedActiveId = await localforage.getItem<string>('papyrus-active-note-id');
        const savedHandle = await localforage.getItem<any>('papyrus-file-handle');

        if (savedSubjects) setSubjects(savedSubjects);
        if (savedActiveId) setActiveNoteId(savedActiveId);
        
        // Attempt to auto-restore from handle if it exists
        if (savedHandle) {
          try {
            if (await (savedHandle as any).queryPermission({ mode: 'readwrite' }) === 'granted') {
              setFileHandle(savedHandle);
            }
          } catch (e) {
            console.log('Permission to file lost or handle stale');
          }
        }
      } catch (err) {
        console.error('Failed to load data from persistence:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Volatile states for active note
  const [content, setContent] = useState('');
  const [texture, setTexture] = useState<PaperTexture>('laid');
  const [theme, setTheme] = useState<NoteTheme>(THEMES[0]);
  const [stickies, setStickies] = useState<{ id: string, text: string, color: string }[]>([]);
  const [isHandwriting, setIsHandwriting] = useState(true);

  const [editor, setEditor] = useState<any>(null);
  const [stickyEditor, setStickyEditor] = useState<any>(null);
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const mainAreaRef = useRef<HTMLDivElement>(null);

  // Auto-save logic
  useEffect(() => {
    if (isLoading) return; // Don't save while loading initial data

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Core DB Save
        await localforage.setItem('papyrus-subjects', subjects);
        await localforage.setItem('papyrus-active-note-id', activeNoteId);

        // Native Sync Logic
        if (fileHandle) {
          try {
            const writable = await (fileHandle as any).createWritable();
            await writable.write(JSON.stringify({
              version: '1.2',
              lastModified: new Date().toISOString(),
              data: subjects
            }, null, 2));
            await writable.close();
          } catch (fileErr) {
            console.error('Native File Sync failed:', fileErr);
          }
        }

        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [subjects, activeNoteId, isLoading, fileHandle]);

  // Connect/Restore local file
  const requestNativeFile = async () => {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: 'my-notebook.papyrus',
        types: [{
          description: 'Papyrus Notebook',
          accept: { 'application/json': ['.papyrus'] },
        }],
      });
      
      setFileHandle(handle);
      await localforage.setItem('papyrus-file-handle', handle);
      
      // Initial write
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify({
        version: '1.2',
        lastModified: new Date().toISOString(),
        data: subjects
      }, null, 2));
      await writable.close();
    } catch (err) {
      console.error('Could not connect to file:', err);
    }
  };
  const getActiveContext = () => {
    for (const subject of subjects) {
      const note = subject.notes.find(n => n.id === activeNoteId);
      if (note) return { subject, note };
    }
    return null;
  };

  // Sync active note states when switching notes
  useEffect(() => {
    const context = getActiveContext();
    if (context) {
      const { note } = context;
      setContent(note.content);
      setTexture(note.texture);
      const matchedTheme = THEMES.find(t => t.id === note.themeId) || THEMES[0];
      setTheme(matchedTheme);
      setStickies(note.stickies);
      setIsHandwriting(note.isHandwriting);
    }
  }, [activeNoteId]);

  // Update subjects collection when volatile states change
  useEffect(() => {
    setSubjects(prev => prev.map(s => ({
      ...s,
      notes: s.notes.map(n => n.id === activeNoteId ? {
        ...n,
        content,
        texture,
        themeId: theme.id,
        stickies,
        isHandwriting
      } : n)
    })));
  }, [content, texture, theme, stickies, isHandwriting]);

  const addNewSubject = (): string => {
    const newId = Date.now().toString();
    const newSubject: Subject = {
      id: newId,
      name: 'New Subject',
      notes: [
        {
          id: `note-${newId}`,
          title: 'New Chapter',
          content: '',
          stickies: [],
          texture: 'laid',
          themeId: 'light',
          isHandwriting: true,
        }
      ]
    };
    setSubjects([...subjects, newSubject]);
    setActiveNoteId(`note-${newId}`);
    return newId;
  };

  const addNewNote = (subjectId: string): string => {
    const newId = Date.now().toString();
    const newNote: Note = {
      id: newId,
      title: 'New Chapter',
      content: '',
      stickies: [],
      texture: 'laid',
      themeId: 'light',
      isHandwriting: true,
    };
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, notes: [...s.notes, newNote] } : s));
    setActiveNoteId(newId);
    return newId;
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const allNotesCount = subjects.reduce((acc, s) => acc + s.notes.length, 0);
    if (allNotesCount === 1) return;

    setSubjects(prev => {
      const updated = prev.map(s => ({
        ...s,
        notes: s.notes.filter(n => n.id !== id)
      })).filter(s => s.notes.length > 0 || prev.length === 1); // Keep subjects with notes or at least one subject
      
      // If active note was deleted, switch to another
      if (activeNoteId === id) {
        const remainingNote = updated.find(s => s.notes.length > 0)?.notes[0];
        if (remainingNote) setActiveNoteId(remainingNote.id);
      }
      return updated;
    });
  };

  const deleteSubject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (subjects.length === 1) return;
    
    const subjectToDelete = subjects.find(s => s.id === id);
    const isDeletingActive = subjectToDelete?.notes.some(n => n.id === activeNoteId);
    
    const newSubjects = subjects.filter(s => s.id !== id);
    setSubjects(newSubjects);
    
    if (isDeletingActive) {
      setActiveNoteId(newSubjects[0].notes[0].id);
    }
  };

  const renameNote = (id: string, newTitle: string) => {
    setSubjects(prev => prev.map(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id ? { ...n, title: newTitle } : n)
    })));
  };

  const renameSubject = (id: string, newName: string) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  // Modal States
  const [activeModal, setActiveModal] = useState<'sticky' | 'math' | 'image' | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [stickyColor, setStickyColor] = useState('yellow');

  const handleFormat = (type: string, value?: any) => {
    const targetEditor = activeModal === 'sticky' ? stickyEditor : editor;
    if (!targetEditor) return;
    targetEditor.chain().focus();
    
    if (type === 'bold') targetEditor.chain().toggleBold().run();
    else if (type === 'italic') targetEditor.chain().toggleItalic().run();
    else if (type === 'underline') targetEditor.chain().toggleUnderline().run();
    else if (type === 'subscript') targetEditor.chain().toggleSubscript().run();
    else if (type === 'superscript') targetEditor.chain().toggleSuperscript().run();
    else if (type === 'h1') targetEditor.chain().toggleHeading({ level: 1 }).run();
    else if (type === 'h2') targetEditor.chain().toggleHeading({ level: 2 }).run();
    else if (type === 'h3') targetEditor.chain().toggleHeading({ level: 3 }).run();
    else if (type === 'hr') targetEditor.chain().setHorizontalRule().run();
    else if (type === 'highlight') {
      targetEditor.chain().toggleHighlight({ color: value || (theme.id === 'dark' ? '#5E5E00' : '#ffff00') }).run();
    } else if (type === 'color') {
      targetEditor.chain().setColor(value).run();
    } else if (type === 'align') {
      targetEditor.chain().setTextAlign(value).run();
    }
  };

  const handleModalSubmit = () => {
    const finalInput = activeModal === 'sticky' ? (stickyEditor?.getHTML() || '') : modalInput;
    
    if (!finalInput && activeModal !== 'math') {
      setActiveModal(null);
      setEditingStickyId(null);
      return;
    }

    if (activeModal === 'sticky') {
      if (editingStickyId) {
        setStickies(prev => prev.map(s => s.id === editingStickyId ? { ...s, text: finalInput, color: stickyColor } : s));
      } else {
        setStickies(prev => [...prev, { 
          id: Date.now().toString(), 
          text: finalInput, 
          color: stickyColor 
        }]);
      }
      setEditingStickyId(null);
    } else if (activeModal === 'math') {
      editor?.chain().focus().insertContent({
        type: 'math',
        attrs: { latex: modalInput || 'E = mc^2' }
      }).run();
    } else if (activeModal === 'image') {
      editor?.chain().focus().setImage({ src: modalInput }).run();
    }

    setModalInput('');
    setActiveModal(null);
  };

  const openEditSticky = (sticky: { id: string, text: string, color: string }) => {
    setEditingStickyId(sticky.id);
    setModalInput(sticky.text);
    setStickyColor(sticky.color);
    setActiveModal('sticky');
  };

  const handleExport = (format: 'bundle' | 'note' | 'md') => {
    if (format === 'note') {
      const context = getActiveContext();
      if (!context) return;
      const blob = new Blob([JSON.stringify(context.note, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note-${context.note.title.replace(/\s+/g, '-').toLowerCase()}.papyrus`;
      a.click();
    } else if (format === 'md') {
      // Simple HTML to MD conversion
      const md = content
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>?/gm, '');
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note-${Date.now()}.md`;
      a.click();
    } else if (format === 'bundle') {
      const bundle = {
        subjects,
        activeNoteId,
        version: '1.2'
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `papyrus-backup-${new Date().toISOString().split('T')[0]}.papyrus`;
      a.click();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.subjects && Array.isArray(data.subjects)) {
          // Merge subjects Ecosystem
          setSubjects(prev => {
            const newSubjects = [...prev];
            data.subjects.forEach((importSubject: Subject) => {
              const existing = newSubjects.find(s => s.name === importSubject.name);
              if (existing) {
                // Merge notes into existing subject if names match
                importSubject.notes.forEach(note => {
                  if (!existing.notes.find(n => n.title === note.title)) {
                    existing.notes.push(note);
                  }
                });
              } else {
                newSubjects.push(importSubject);
              }
            });
            return newSubjects;
          });
          if (data.activeNoteId) setActiveNoteId(data.activeNoteId);
        } else if (data.notes && Array.isArray(data.notes)) {
          // Merge notes into a new "Imported" subject
          setSubjects(prev => [
            ...prev,
            {
              id: `imported-${Date.now()}`,
              name: 'Imported Bundle',
              notes: data.notes
            }
          ]);
          setActiveNoteId(data.notes[0].id);
        } else if (data.content !== undefined) {
          // Legacy single note import
          const newId = Date.now().toString();
          const newNote: Note = {
            id: newId,
            title: 'Imported Note',
            content: data.content,
            stickies: data.stickies || [],
            texture: data.texture || 'laid',
            themeId: data.themeId || 'light',
            isHandwriting: data.isHandwriting || true,
          };
          setSubjects(prev => {
            const first = prev[0];
            return [{ ...first, notes: [...first.notes, newNote] }, ...prev.slice(1)];
          });
          setActiveNoteId(newId);
        }
        
        alert('Note successfully imported into the ecosystem!');
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to import note. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset for next import
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 font-serif gap-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Book className="w-12 h-12 opacity-20" />
        </motion.div>
        <p className="text-stone-400 text-sm tracking-widest uppercase">Opening Notebook...</p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "h-screen transition-colors duration-1000 flex overflow-hidden",
        theme.id === 'dark' && "dark"
      )}
      style={{ backgroundColor: theme.bgColor, color: theme.inkColor }}
    >
      <CommandPalette 
        subjects={subjects} 
        onSelectNote={setActiveNoteId} 
        onNewNote={addNewNote} 
        onNewSubject={addNewSubject} 
        onDeleteNote={deleteNote}
        onDeleteSubject={deleteSubject}
        onRenameNote={renameNote}
        onRenameSubject={renameSubject}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col items-center relative">
        {/* Modals */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="paper-shadow border-stone-200 dark:border-stone-800 sm:max-w-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {activeModal === 'sticky' ? 'New Sticky Note' : activeModal === 'math' ? 'Insert Equation' : 'Insert Image'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="modal-input" className="mb-2 block text-xs uppercase tracking-widest opacity-60">
                {activeModal === 'sticky' ? 'Content' : activeModal === 'math' ? 'LaTeX Snippet' : 'Image URL'}
              </Label>
              {activeModal === 'sticky' ? (
                <div className="space-y-3">
                  <div className="flex border-b border-stone-100 dark:border-stone-800 pb-2 gap-1 overflow-x-auto">
                    <Button variant="ghost" size="sm" onClick={() => handleFormat('bold')} className="h-7 w-7 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Bold className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleFormat('italic')} className="h-7 w-7 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Italic className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleFormat('underline')} className="h-7 w-7 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><Underline className="w-3.5 h-3.5" /></Button>
                    <Separator orientation="vertical" className="h-4 mx-1 mx-1 dark:bg-stone-800" />
                    <Button variant="ghost" size="sm" onClick={() => handleFormat('align', 'left')} className="h-7 w-7 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><AlignLeft className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleFormat('align', 'center')} className="h-7 w-7 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><AlignCenter className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleFormat('align', 'right')} className="h-7 w-7 p-0 hover:bg-stone-100 dark:hover:bg-stone-800"><AlignRight className="w-3.5 h-3.5" /></Button>
                  </div>
                  <Editor 
                    content={modalInput} 
                    onChange={setModalInput} 
                    onInit={setStickyEditor}
                    className="w-full min-h-[200px] max-h-[300px] overflow-y-auto p-3 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus-within:ring-2 focus-within:ring-stone-400 font-serif text-sm prose prose-sm prose-stone dark:prose-invert [&_.ProseMirror]:min-h-[180px]"
                  />
                </div>
              ) : (
                <Input 
                   id="modal-input" 
                   value={modalInput}
                   onChange={(e) => setModalInput(e.target.value)}
                   placeholder={activeModal === 'math' ? "E = mc^2" : "https://example.com/image.jpg"}
                   onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                   autoFocus
                   className="dark:bg-stone-800 dark:border-stone-700"
                 />
              )}
            </div>

            {activeModal === 'sticky' && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest opacity-60">Color Variant</Label>
                <div className="flex gap-2">
                  {STICKY_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setStickyColor(c.id)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                        stickyColor === c.id ? "border-stone-800 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c.dot }}
                    >
                      {stickyColor === c.id && <Check className="w-4 h-4 text-stone-800" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button onClick={handleModalSubmit} className="bg-stone-800 text-white hover:bg-stone-900 px-8">
              {editingStickyId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="flex flex-col relative group">
            <input
              type="text"
              placeholder="Subject Name"
              value={getActiveContext()?.subject.name || ''}
              onChange={(e) => {
                const context = getActiveContext();
                if (context) renameSubject(context.subject.id, e.target.value);
              }}
              className="text-[10px] font-sans font-bold tracking-[0.2em] opacity-40 uppercase bg-transparent border-none p-0 m-0 focus:outline-none focus:opacity-100 transition-opacity w-full max-w-[300px] placeholder:text-stone-300 dark:placeholder:text-stone-700"
            />
            <input
              type="text"
              placeholder="Chapter Title"
              value={getActiveContext()?.note.title || ''}
              onChange={(e) => {
                const context = getActiveContext();
                if (context) renameNote(context.note.id, e.target.value);
              }}
              className="text-2xl font-serif tracking-tighter opacity-80 uppercase bg-transparent border-none p-0 m-0 focus:outline-none focus:opacity-100 transition-opacity w-full max-w-[300px] placeholder:text-stone-300 dark:placeholder:text-stone-700"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Settings / Configuration */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn("w-8 h-8 rounded-full", isHandwriting ? "bg-stone-200 dark:bg-stone-800 opacity-100" : "opacity-60")}
                    onClick={() => setIsHandwriting(!isHandwriting)}
                  >
                    <PenTool className="w-4 h-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Toggle Handwriting Font</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <PopoverTrigger render={
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-60">
                        <Palette className="w-4 h-4" />
                      </Button>
                    } />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Change Theme</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent align="end" className="w-auto p-2">
              <div className="flex items-center gap-2">
                {THEMES.map(t => (
                  <Button
                    key={t.id}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-6 h-6 rounded-full border transition-all shadow-sm",
                      theme.id === t.id ? "border-stone-500 scale-110" : "border-stone-200 dark:border-stone-800 opacity-50"
                    )}
                    style={{ backgroundColor: t.paperColor }}
                    onClick={() => setTheme(t)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-1" />

          {/* Search Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex items-center gap-2 px-3 py-1.5 h-auto text-xs font-medium border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm rounded-full transition-all"
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search notes</span>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full max-w-5xl mb-32" ref={mainAreaRef}>
        <AnimatePresence>
          {stickies.map(s => (
            <StickyNote 
              key={s.id} 
              id={s.id}
              content={s.text} 
              color={s.color} 
              containerRef={mainAreaRef}
              isHandwriting={isHandwriting}
              onEdit={openEditSticky}
              onRemove={() => setStickies(prev => prev.filter(p => p.id !== s.id))} 
            />
          ))}
        </AnimatePresence>

        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative min-h-[1000px] w-full p-16 md:p-24 paper-shadow transition-all duration-700 overflow-hidden",
            texture === 'laid' && "paper-laid",
            texture === 'grid' && "paper-grid",
            texture === 'linen' && "paper-linen",
            isHandwriting ? "font-handwriting" : "font-serif"
          )}
          style={{ backgroundColor: theme.paperColor }}
        >
          {/* Paper Edge Details */}
          <div className="absolute top-0 left-0 w-1 h-full bg-red-400/20" />
          
          <Editor 
            content={content} 
            onChange={setContent} 
            onInit={setEditor}
            className={cn("min-h-[700px]", isHandwriting ? "[&_.ProseMirror]:font-handwriting [&_.ProseMirror_p]:font-handwriting [&_.ProseMirror_h1]:font-handwriting [&_.ProseMirror_h2]:font-handwriting [&_.ProseMirror_h3]:font-handwriting" : "[&_.ProseMirror]:font-bangla [&_.ProseMirror_p]:font-bangla [&_.ProseMirror_h1]:font-bangla [&_.ProseMirror_h2]:font-bangla [&_.ProseMirror_h3]:font-bangla")}
          />
        </motion.div>
      </main>

      {/* UI Controls */}
      <StationeryBar 
        onFormat={handleFormat}
        onTextureChange={setTexture}
        onImageUpload={() => setActiveModal('image')}
        onStickyAdd={() => setActiveModal('sticky')}
        onMathToggle={() => setActiveModal('math')}
        onExport={handleExport}
        onImport={handleImport}
        isSaving={isSaving}
      />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept=".papyrus,application/json" 
        className="hidden" 
      />
    </div>
  </div>
  );
}
