import { Trash2, CheckSquare, Square, CalendarDays } from "lucide-react";
import type { Note, ChecklistItem } from "../dashboard";

interface StickyNoteProps {
  note: Note;
  onDelete: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
}

export function StickyNote({ note, onDelete, onToggleChecklistItem }: StickyNoteProps) {
  const completedCount = note.checklist?.filter((item) => item.checked).length || 0;
  const totalCount = note.checklist?.length || 0;
  
  // Random slight rotations for more organic feel
  const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'];
  const rotation = rotations[parseInt(note.id) % rotations.length];

  return (
    <div
      className={`rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-0 relative group border-b-4 ${rotation}`}
      style={{ 
        backgroundColor: note.color,
        borderBottomColor: `${note.color}dd`
      }}
    >
      {/* Top row: category badge + delete button */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="inline-block px-3 py-1.5 bg-white/70 backdrop-blur-sm rounded-full text-xs text-[#4a4458] shadow-sm border border-white/50 transform -rotate-1 max-w-[calc(100%-44px)] truncate">
          {note.category}
        </div>
        {/* Delete Button */}
        <button
          onClick={() => onDelete(note.id)}
          className="flex-shrink-0 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#fb7185] hover:scale-110 shadow-md group/delete"
        >
          <Trash2 className="w-4 h-4 text-[#fb7185] group-hover/delete:text-white transition-colors" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-[#4a4458] mb-3 text-lg leading-snug" style={{ fontWeight: 700 }}>
        {note.title}
      </h3>

      {/* Content */}
      {note.content && (
        <p className="text-[#4a4458]/80 leading-relaxed mb-4 whitespace-pre-wrap text-sm">
          {note.content}
        </p>
      )}

      {/* Checklist */}
      {note.checklist && note.checklist.length > 0 && (
        <div className="space-y-2 mb-4">
          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="flex items-center gap-2 mb-3 bg-white/40 rounded-full p-1.5">
              <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-[#4a4458] font-semibold px-1">
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
          {note.checklist.map((item: ChecklistItem) => (
            <button
              key={item.id}
              onClick={() => onToggleChecklistItem(note.id, item.id)}
              className="flex items-center gap-3 w-full text-left group/item hover:bg-white/30 rounded-2xl px-3 py-2 transition-all duration-150 transform hover:scale-102"
            >
              {item.checked ? (
                <CheckSquare className="w-5 h-5 text-[#a78bfa] shrink-0 transform group-hover/item:scale-110 transition-transform" />
              ) : (
                <Square className="w-5 h-5 text-[#4a4458]/50 shrink-0 transform group-hover/item:scale-110 transition-transform" />
              )}
              <span
                className={`text-sm transition-all duration-200 ${
                  item.checked
                    ? "line-through text-[#4a4458]/40"
                    : "text-[#4a4458]/80"
                }`}
              >
                {item.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Date */}
      <div className="text-xs text-[#4a4458]/60 flex items-center gap-1.5">
        <CalendarDays className="w-3.5 h-3.5" />
        {note.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    </div>
  );
}