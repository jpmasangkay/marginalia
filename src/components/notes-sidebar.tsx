/** @file src/components/notes-sidebar.tsx
 * Sidebar for note search, categories, favorites, and note selection.
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import noteColorLogo from '@/public/note-color.svg';
import { Plus, Trash2, Star, Search, ChevronDown, Folder } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  preview: string;
  date: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

interface NotesSidebarProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  selectedNoteId?: string;
}

// Function NotesSidebar: handles a specific piece of application logic.
export function NotesSidebar({ 
  notes, 
  onSelectNote, 
  onCreateNote, 
  onDeleteNote,
  onToggleFavorite,
  selectedNoteId 
}: NotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Work', 'Personal']));

  const toggleCategory =   // Function toggleCategory: implements reusable behavior.
(category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const favorites = notes.filter(  // Function: implements scoped behavior for this module.
note => note.isFavorite);
  const filteredNotes = notes.filter(  // Function: implements scoped behavior for this module.
note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(notes.map(  // Function: implements scoped behavior for this module.
n => n.category)));
  const notesByCategory = categories.reduce(  // Function: implements scoped behavior for this module.
(acc, cat) => {
    acc[cat] = filteredNotes.filter(    // Function: implements scoped behavior for this module.
n => n.category === cat);
    return acc;
  }, {} as Record<string, Note[]>);

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-sidebar-foreground flex items-center gap-2">
            <img src={noteColorLogo} alt="Marginilia logo" className="w-5 h-5 object-contain" />
            Marginilia
          </h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={            // Function: implements scoped behavior for this module.
(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-sidebar-accent text-sidebar-foreground rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
          />
        </div>

        <Button 
          onClick={onCreateNote}
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="px-2 py-3 border-b border-sidebar-border">
            <p className="text-xs font-semibold text-sidebar-foreground/70 px-2 mb-2 uppercase">Favorites</p>
            <div className="space-y-1">
              {favorites.map(              // Function: implements scoped behavior for this module.
(note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onSelect={onSelectNote}
                  onDelete={onDeleteNote}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.map(        // Function: implements scoped behavior for this module.
category => (
          <div key={category} className="border-b border-sidebar-border/50">
            <button
              onClick={              // Function: implements scoped behavior for this module.
() => toggleCategory(category)}
              className="w-full px-2 py-2 flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedCategories.has(category) ? '' : '-rotate-90'
                }`}
              />
              <Folder className="w-4 h-4" />
              {category}
              <span className="ml-auto text-sidebar-foreground/50">({notesByCategory[category]?.length || 0})</span>
            </button>
            
            {expandedCategories.has(category) && (
              <div className="px-2 py-1 space-y-1">
                {notesByCategory[category]?.map(                // Function: implements scoped behavior for this module.
(note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    onSelect={onSelectNote}
                    onDelete={onDeleteNote}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/70">
        <p>{notes.length} note{notes.length !== 1 ? 's' : ''} total</p>
      </div>
    </aside>
  );
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

// Function NoteItem: handles a specific piece of application logic.
function NoteItem({ note, isSelected, onSelect, onDelete, onToggleFavorite }: NoteItemProps) {
  return (
    <div
      onClick={      // Function: implements scoped behavior for this module.
() => onSelect(note)}
      className={`p-2 rounded-lg cursor-pointer transition-all group ${
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{note.title}</p>
          <p className="text-xs opacity-70 truncate mt-1">{note.preview}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={            // Function: implements scoped behavior for this module.
(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className="transition-colors"
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
          </button>
          <button
            onClick={            // Function: implements scoped behavior for this module.
(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="transition-colors"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </div>
      <p className="text-xs opacity-50 mt-2">{note.date}</p>
    </div>
  );
}



