import Masonry from "react-responsive-masonry";
import { StickyNote as StickyNoteIcon } from "lucide-react";
import { StickyNote } from "./sticky-note";
import type { Note } from "../pages/dashboard";

interface NotesGridProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
}

export function NotesGrid({ notes, onDeleteNote, onToggleChecklistItem }: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-32 h-32 bg-gradient-to-br from-[#ddd6fe] to-[#e9d5ff] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-200/30">
          <StickyNoteIcon className="w-14 h-14 text-[#a78bfa] opacity-60" />
        </div>
        <h3 className="text-2xl text-[#4a4458] mb-2" style={{ fontWeight: 600 }}>
          No notes yet
        </h3>
        <p className="text-[#9b8fad]">
          Click "New Note" to create your first note!
        </p>
      </div>
    );
  }

  return (
    <Masonry columnsCount={3} gutter="24px">
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onDelete={onDeleteNote}
          onToggleChecklistItem={onToggleChecklistItem}
        />
      ))}
    </Masonry>
  );
}