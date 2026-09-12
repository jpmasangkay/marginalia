import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { StickyNote as StickyNoteIcon, Plus, RotateCcw, Sparkles } from "lucide-react";
import { StickyNote } from "./sticky-note";
import type { Note } from "../dashboard";

interface NotesGridProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
  onNewNote?: () => void;
  onResetFilter?: () => void;
  searchQuery?: string;
  selectedCategory?: string;
}

export function NotesGrid({
  notes,
  onDeleteNote,
  onToggleChecklistItem,
  onNewNote,
  onResetFilter,
  searchQuery,
  selectedCategory = "All Notes",
}: NotesGridProps) {
  if (notes.length === 0) {
    const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0);
    const isCategoryFiltered = selectedCategory !== "All Notes";

    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 px-4 text-center animate-fade-in">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#ddd6fe] to-[#e9d5ff] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-purple-200/30 transform -rotate-3 hover:rotate-0 transition-transform">
          {isSearching ? (
            <StickyNoteIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#a78bfa]" />
          ) : isCategoryFiltered ? (
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#a78bfa]" />
          ) : (
            <StickyNoteIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#a78bfa]" />
          )}
        </div>

        <h3 className="text-xl sm:text-2xl text-[#4a4458] mb-2 font-bold">
          {isSearching
            ? `No notes matching "${searchQuery}"`
            : isCategoryFiltered
            ? `No notes in "${selectedCategory}" yet`
            : "Your canvas is clean"}
        </h3>

        <p className="text-[#9b8fad] text-sm sm:text-base max-w-md mb-6 leading-relaxed">
          {isSearching
            ? "We couldn't find any sticky notes or checklist items matching your search. Try adjusting the query or reset your filters."
            : isCategoryFiltered
            ? `There are no notes categorized under "${selectedCategory}". Click below to add your first note to this category.`
            : "Capture thoughts, organize checklists, and color-code your ideas with delight."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {isSearching && onResetFilter ? (
            <button
              onClick={onResetFilter}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-purple-200 text-[#4a4458] rounded-2xl shadow-sm hover:bg-purple-50 transition-all font-semibold text-sm hover:scale-102"
            >
              <RotateCcw className="w-4 h-4 text-[#a78bfa]" />
              Clear Search Filter
            </button>
          ) : null}

          {onNewNote ? (
            <button
              onClick={onNewNote}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] text-white rounded-2xl shadow-md hover:shadow-lg transition-all font-semibold text-sm hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              {isCategoryFiltered ? `Add Note to ${selectedCategory}` : "Create First Note"}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 640: 2, 1024: 3 }}>
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