'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';

interface Note {
  id: number;
  content: string;
  color: string;
  isPinned: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Connection {
  from: number;
  to: number;
}

const noteColors = [
  { name: 'Yellow', class: 'bg-yellow-200 border-yellow-300' },
  { name: 'Pink', class: 'bg-pink-200 border-pink-300' },
  { name: 'Blue', class: 'bg-blue-200 border-blue-300' },
  { name: 'Green', class: 'bg-green-200 border-green-300' },
  { name: 'Purple', class: 'bg-purple-200 border-purple-300' },
];

export default function StickyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('sticky-notes-v4-notes');
      const savedConnections = localStorage.getItem('sticky-notes-v4-connections');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      if (savedConnections) {
        setConnections(JSON.parse(savedConnections));
      }
    } catch (e) {
      console.error("Failed to parse from localStorage", e);
      toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.loadingError') });
    }
  }, [toast, t]);

  const saveState = (updatedNotes: Note[], updatedConnections: Connection[]) => {
    setNotes(updatedNotes);
    setConnections(updatedConnections);
    try {
      localStorage.setItem('sticky-notes-v4-notes', JSON.stringify(updatedNotes));
      localStorage.setItem('sticky-notes-v4-connections', JSON.stringify(updatedConnections));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      toast({ variant: 'destructive', title: t('toast.error'), description: t('toast.saveError') });
    }
  };

  const addNote = () => {
    const newNote: Note = {
      id: Date.now(),
      content: '',
      color: noteColors[Math.floor(Math.random() * noteColors.length)].class,
      isPinned: false,
      x: 50,
      y: 50,
      width: 224,
      height: 224,
    };
    const updatedNotes = [newNote, ...notes];
    saveState(updatedNotes, connections);
  };

  const deleteNote = (id: number) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    const updatedConnections = connections.filter(c => c.from !== id && c.to !== id);
    saveState(updatedNotes, updatedConnections);
  };

  const updateNoteContent = (id: number, content: string) => {
    const updatedNotes = notes.map((note) => (note.id === id ? { ...note, content } : note));
    saveState(updatedNotes, connections);
  };

  const handleDragEnd = (id: number, event: any, info: any) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, x: note.x + info.offset.x, y: note.y + info.offset.y } : note
    );
    saveState(updatedNotes, connections);
  };
  
  const handleResize = (id: number, info: any) => {
     const updatedNotes = notes.map(note => {
      if (note.id === id) {
        // Correctly calculate new size based on delta
        const newWidth = note.width + info.delta.x;
        const newHeight = note.height + info.delta.y;

        // Ensure minimum size
        return { 
          ...note, 
          width: Math.max(150, newWidth), 
          height: Math.max(100, newHeight) 
        };
      }
      return note;
    });
    saveState(updatedNotes, connections);
  };
  
  const handleConnectClick = (noteId: number) => {
    if (connectingFrom === null) {
      setConnectingFrom(noteId);
      toast({ title: 'Creando Conexión', description: 'Haz clic en otra nota para conectarla.'});
    } else {
      if (connectingFrom !== noteId && !connections.some(c => (c.from === connectingFrom && c.to === noteId) || (c.from === noteId && c.to === connectingFrom))) {
        const newConnection: Connection = { from: connectingFrom, to: noteId };
        saveState(notes, [...connections, newConnection]);
      }
      setConnectingFrom(null);
    }
  }

  const changeNoteColor = (id: number, colorClass: string) => {
    const updatedNotes = notes.map(note => note.id === id ? { ...note, color: colorClass } : note);
    saveState(updatedNotes, connections);
  }
  
  const getNoteById = (id: number) => notes.find(n => n.id === id);

  return (
    <div className="w-full h-[calc(100vh-10rem)] relative overflow-hidden bg-grid-pattern" ref={containerRef}>
        <div className="absolute top-4 left-4 z-10">
             <Button onClick={addNote}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Nota
            </Button>
        </div>

      <AnimatePresence>
        {notes.map((note) => (
          <DropdownMenu key={note.id}>
            <DropdownMenuTrigger asChild>
                <motion.div
                    drag
                    dragMomentum={false}
                    onDragEnd={(event, info) => handleDragEnd(note.id, event, info)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, x: note.x, y: note.y, width: note.width, height: note.height }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={cn(
                        `flex flex-col p-4 rounded-lg shadow-md absolute cursor-grab active:cursor-grabbing border-2`,
                        note.color,
                        connectingFrom === note.id ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                    )}
                    onClick={() => connectingFrom !== null && handleConnectClick(note.id)}
                    style={{ x: note.x, y: note.y, width: note.width, height: note.height }}
                >
                    <Textarea
                    value={note.content}
                    onChange={(e) => {
                        e.stopPropagation();
                        updateNoteContent(note.id, e.target.value);
                    }}
                    className="flex-grow bg-transparent border-0 resize-none focus:ring-0 text-gray-800 placeholder:text-gray-600 cursor-text"
                    placeholder="Escribe algo..."
                    />
                     <motion.div 
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                        drag="x,y"
                        dragMomentum={false}
                        onDrag={(e, i) => handleResize(note.id, i)}
                        dragConstraints={containerRef}
                      >
                       <div className="w-full h-full border-r-2 border-b-2 border-gray-500/50" />
                     </motion.div>
                </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleConnectClick(note.id)}>
                    <Link2 className="mr-2 h-4 w-4" />
                    {connectingFrom === note.id ? "Cancelar Conexión" : "Crear Conexión"}
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <div className="mr-2 h-4 w-4 rounded-full" style={{backgroundColor: note.color.split(' ')[0].replace('bg-','').replace('-200','')}} />
                        Cambiar Color
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {noteColors.map(color => (
                            <DropdownMenuItem key={color.name} onClick={() => changeNoteColor(note.id, color.class)}>
                                {color.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => deleteNote(note.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Nota
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </AnimatePresence>
      
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <AnimatePresence>
            {connections.map(({ from, to }) => {
                const fromNote = getNoteById(from);
                const toNote = getNoteById(to);
                if (!fromNote || !toNote) return null;
                
                const x1 = fromNote.x + fromNote.width / 2;
                const y1 = fromNote.y + fromNote.height / 2;
                const x2 = toNote.x + toNote.width / 2;
                const y2 = toNote.y + toNote.height / 2;
                
                return (
                    <motion.line
                        key={`${from}-${to}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )
            })}
          </AnimatePresence>
      </svg>
      
       {notes.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
                <p className="mb-2 font-semibold">Tu lienzo de notas está vacío.</p>
                <p>Haz clic en "Añadir Nota" para empezar a plasmar tus ideas.</p>
            </div>
          </div>
        )}
    </div>
  );
}
