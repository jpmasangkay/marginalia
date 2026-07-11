import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { StickyNote as StickyNoteIcon } from "lucide-react";
import { StickyNote } from "./sticky-note";
import type { Note } from "../dashboard";

interface NotesGridProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
}

export function NotesGrid({ notes, onDeleteNote, onToggleChecklistItem }: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 sm:py-32">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#ddd6fe] to-[#e9d5ff] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-200/30">
          <StickyNoteIcon className="w-10 h-10 sm:w-14 sm:h-14 text-[#a78bfa] opacity-60" />
        </div>
        <h3 className="text-xl sm:text-2xl text-[#4a4458] mb-2" style={{ fontWeight: 600 }}>
          No notes yet
        </h3>
        <p className="text-[#9b8fad] text-sm sm:text-base text-center px-4">
          Click "New Note" to create your first note!
        </p>
      </div>
    );
  }

  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 0: 1, 640: 2, 1024: 3 }}
    >
      <Masonry gutter="16px">
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onDelete={onDeleteNote}
            onToggleChecklistItem={onToggleChecklistItem}
          />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}