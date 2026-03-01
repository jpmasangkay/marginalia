/** @file src/page.tsx
 * Main notes page that coordinates sidebar state and editor state.
 */
'use client';

import { useState } from 'react';
import { NotesSidebar } from '@/components/notes-sidebar';
import { NotesEditor } from '@/components/notes-editor';

interface Note {
  id: string;
  title: string;
  preview: string;
  date: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      preview: '',
      date: 'Today',
      category: 'Personal',
      isFavorite: false,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const handleDeleteNote = (id: string) => {
    const filtered = notes.filter(note => note.id !== id);
    setNotes(filtered);
    if (selectedNote?.id === id) {
      setSelectedNote(filtered[0] ?? null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleTitleChange = (title: string) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, title, preview: title };
    setSelectedNote(updated);
    setNotes(notes.map(n => n.id === updated.id ? updated : n));
  };

  const handleContentChange = (content: string) => {
    if (!selectedNote) return;
    const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
    const updated = { ...selectedNote, preview };
    setSelectedNote(updated);
    setNotes(notes.map(n => n.id === updated.id ? updated : n));
  };

  const handleCategoryChange = (category: string) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, category };
    setSelectedNote(updated);
    setNotes(notes.map(n => n.id === updated.id ? updated : n));
  };

  return (
    <div className="flex h-screen bg-background">
      <NotesSidebar
        notes={notes}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onToggleFavorite={handleToggleFavorite}
        selectedNoteId={selectedNote?.id}
      />
      {selectedNote ? (
        <NotesEditor
          key={selectedNote.id}
          note={selectedNote}
          onTitleChange={handleTitleChange}
          onContentChange={handleContentChange}
          onCategoryChange={handleCategoryChange}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
          Create your first note to get started.
        </div>
      )}
    </div>
  );
}



