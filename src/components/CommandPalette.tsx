import React, { useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Book, Plus, Search, FileText, Layout, Trash2 } from "lucide-react"

interface Note {
  id: string;
  title: string;
}

interface Subject {
  id: string;
  name: string;
  notes: Note[];
}

interface CommandPaletteProps {
  subjects: Subject[];
  onSelectNote: (noteId: string) => void;
  onNewNote: (subjectId: string) => string;
  onNewSubject: () => string;
  onDeleteNote: (noteId: string, e: React.MouseEvent) => void;
  onDeleteSubject: (subjectId: string, e: React.MouseEvent) => void;
  onRenameNote: (noteId: string, newTitle: string) => void;
  onRenameSubject: (subjectId: string, newName: string) => void;
}

export function CommandPalette({ 
  subjects, 
  onSelectNote, 
  onNewNote, 
  onNewSubject,
  onDeleteNote,
  onDeleteSubject,
  onRenameNote,
  onRenameSubject
}: CommandPaletteProps) {
  const [open, setOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setEditingId(null)
    }
  }, [open])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId)
    setOpen(false)
  }

  const handleNewNote = (subjectId: string) => {
    const id = onNewNote(subjectId)
    setEditingId(id)
  }

  const handleNewSubject = () => {
    const id = onNewSubject()
    setEditingId(id)
  }

  return (
    <CommandDialog 
      open={open} 
      onOpenChange={setOpen} 
      className="top-1/2 -translate-y-1/2 sm:max-w-xl"
    >
      <CommandInput placeholder="Search chapters, notes or subjects..." />
      <CommandList className="max-h-[50vh] overflow-y-auto border-t border-stone-100 dark:border-stone-800">
        <CommandEmpty className="flex flex-col items-center justify-center py-10 gap-2">
          <Search className="w-8 h-8 opacity-20" />
          <p className="text-stone-400">No results for this query.</p>
        </CommandEmpty>
        
        {subjects.map((subject) => (
          <CommandGroup 
            key={subject.id} 
            heading={
              <div className="flex items-center justify-between w-full pr-2 group/heading">
                {editingId === subject.id ? (
                  <input
                    value={subject.name}
                    onChange={(e) => onRenameSubject(subject.id, e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    autoFocus
                    onBlur={() => setEditingId(null)}
                    className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-stone-100 dark:focus:bg-stone-800 rounded px-1 -ml-1 transition-all h-6 w-full max-w-[200px] text-stone-900 dark:text-stone-100"
                  />
                ) : (
                  <span 
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingId(subject.id); }}
                    className="cursor-text hover:bg-stone-100 dark:hover:bg-stone-800 rounded px-1 -ml-1 h-6 flex items-center transition-colors"
                  >
                    {subject.name}
                  </span>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSubject(subject.id, e);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover/heading:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            } 
            className="px-2"
          >
            {subject.notes.map((note) => (
              <CommandItem 
                key={note.id} 
                value={`${note.title} ${subject.name}`}
                onSelect={() => handleSelectNote(note.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group/item"
              >
                <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 opacity-70" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  {editingId === note.id ? (
                    <input
                      value={note.title}
                      onChange={(e) => onRenameNote(note.id, e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') setEditingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      autoFocus
                      onBlur={() => setEditingId(null)}
                      className="font-medium text-stone-900 dark:text-stone-100 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white dark:focus:bg-stone-900 rounded px-1 -ml-1 transition-all max-w-[240px] truncate"
                    />
                  ) : (
                    <span 
                      className="font-medium text-stone-900 dark:text-stone-100 truncate cursor-text hover:bg-stone-100 dark:hover:bg-stone-800 rounded px-1 -ml-1 transition-colors"
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingId(note.id); }}
                    >
                      {note.title}
                    </span>
                  )}
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest leading-none mt-1 ml-1">{subject.name}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id, e);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover/item:opacity-100 text-stone-400 hover:text-red-500 transition-opacity ml-auto z-50 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </CommandItem>
            ))}
            <CommandItem 
              onSelect={() => handleNewNote(subject.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-stone-500"
            >
              <div className="w-8 h-8 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center flex-shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium">Add new chapter in {subject.name}</span>
            </CommandItem>
          </CommandGroup>
        ))}

        <CommandSeparator className="my-2 opacity-50" />

        <CommandGroup heading="System" className="px-2">
          <CommandItem onSelect={handleNewSubject} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 text-amber-600">
              <Layout className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-stone-900 dark:text-stone-100">Create new Subject</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest leading-none mt-1">Management</span>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      
      <div className="flex items-center justify-between p-4 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 font-mono uppercase tracking-widest bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><kbd className="bg-stone-100 dark:bg-stone-800 px-1 rounded border border-stone-200 dark:border-stone-700">↵</kbd> Select</span>
          <span className="flex items-center gap-1"><kbd className="bg-stone-100 dark:bg-stone-800 px-1 rounded border border-stone-200 dark:border-stone-700">↑↓</kbd> Navigate</span>
        </div>
        <span className="flex items-center gap-1">ESC to Close</span>
      </div>
    </CommandDialog>
  )
}

