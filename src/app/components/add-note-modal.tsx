import { useState } from "react";
import { X, Plus, ListChecks, FileText, Trash2 } from "lucide-react";
import type { Note, ChecklistItem } from "../pages/dashboard";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (note: Omit<Note, "id" | "createdAt">) => void;
  categories: { name: string; color: string }[];
}

const NOTE_COLORS = [
  { name: "Sunshine", color: "#fef3c7" },
  { name: "Lavender", color: "#ddd6fe" },
  { name: "Rose", color: "#fecdd3" },
  { name: "Mint", color: "#c7f9cc" },
  { name: "Purple", color: "#e9d5ff" },
  { name: "Sky", color: "#bfdbfe" },
  { name: "Peach", color: "#fed7aa" },
  { name: "Lilac", color: "#c4b5fd" },
];

export function AddNoteModal({ isOpen, onClose, onAdd, categories }: AddNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "");
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].color);
  const [noteType, setNoteType] = useState<"text" | "checklist">("text");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newItemText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      { id: Date.now().toString(), text: newItemText.trim(), checked: false },
    ]);
    setNewItemText("");
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
  };

  const handleChecklistKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddChecklistItem();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (noteType === "text" && !content.trim()) return;
    if (noteType === "checklist" && checklistItems.length === 0) return;

    onAdd({
      title,
      content: noteType === "text" ? content : "",
      category: category || "Uncategorized",
      color: selectedColor,
      checklist: noteType === "checklist" ? checklistItems : undefined,
    });

    // Reset
    setTitle("");
    setContent("");
    setCategory(categories[0]?.name || "");
    setSelectedColor(NOTE_COLORS[0].color);
    setNoteType("text");
    setChecklistItems([]);
    setNewItemText("");
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto transform rotate-1 border-b-4"
        style={{
          backgroundColor: selectedColor || '#fef3c7',
          borderBottomColor: `${selectedColor}dd`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl text-[#4a4458] transform -rotate-1" style={{ fontWeight: 700 }}>new note!</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 bg-white/80 rounded-full flex items-center justify-center hover:bg-[#fb7185] transition-all duration-200 shadow-md hover:scale-110 group"
          >
            <X className="w-5 h-5 text-[#fb7185] group-hover:text-white" />
          </button>
        </div>

        {/* Note Type Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setNoteType("text")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-300 text-sm transform hover:scale-105 ${
              noteType === "text"
                ? "bg-white text-[#4a4458] shadow-md -rotate-1 scale-105"
                : "bg-white/40 text-[#6b5578] hover:bg-white/60"
            }`}
            style={{ fontWeight: 600 }}
          >
            <FileText className="w-4 h-4" />
            text note
          </button>
          <button
            type="button"
            onClick={() => setNoteType("checklist")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all duration-300 text-sm transform hover:scale-105 ${
              noteType === "checklist"
                ? "bg-white text-[#4a4458] shadow-md rotate-1 scale-105"
                : "bg-white/40 text-[#6b5578] hover:bg-white/60"
            }`}
            style={{ fontWeight: 600 }}
          >
            <ListChecks className="w-4 h-4" />
            checklist
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[#4a4458] mb-2 text-sm" style={{ fontWeight: 600 }}>title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="give it a cute name..."
              className="w-full px-4 py-3.5 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/90 transition-all duration-200 text-[#4a4458] placeholder:text-[#9b8fad]"
              autoFocus
            />
          </div>

          {/* Content or Checklist */}
          {noteType === "text" ? (
            <div>
              <label className="block text-[#4a4458] mb-2 text-sm" style={{ fontWeight: 600 }}>what's on your mind?</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="write your thoughts here..."
                rows={6}
                className="w-full px-4 py-3.5 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/90 transition-all duration-200 resize-none text-[#4a4458] placeholder:text-[#9b8fad]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[#4a4458] mb-3 text-sm" style={{ fontWeight: 600 }}>checklist items</label>
              <div className="space-y-2 mb-3">
                {checklistItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 bg-white/70 rounded-2xl border-2 border-white/50 transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
                  >
                    <div className="w-5 h-5 border-2 border-[#a78bfa] rounded-lg" />
                    <span className="flex-1 text-[#4a4458] text-sm">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#fb7185] transition-all hover:scale-110 group"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#fb7185] group-hover:text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={handleChecklistKeyDown}
                  placeholder="add an item..."
                  className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/90 transition-all duration-200 text-sm text-[#4a4458] placeholder:text-[#9b8fad]"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="w-11 h-11 bg-white/80 rounded-2xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-5 h-5 text-[#a78bfa]" />
                </button>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-[#4a4458] mb-3 text-sm" style={{ fontWeight: 600 }}>pick a category</label>
            {categories.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat, index) => {
                  const rotations = ['rotate-0', '-rotate-1', 'rotate-1'];
                  const rotation = rotations[index % rotations.length];
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`px-4 py-2.5 rounded-full transition-all duration-200 text-sm transform hover:scale-110 ${rotation} ${
                        category === cat.name
                          ? "bg-white text-[#4a4458] shadow-md scale-110"
                          : "bg-white/40 text-[#6b5578] hover:bg-white/60"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/60 rounded-2xl px-4 py-4 text-center transform rotate-1 border-2 border-white/50">
                <p className="text-sm text-[#6b5578]" style={{ fontWeight: 600 }}>
                  no categories yet!
                </p>
                <p className="text-xs text-[#9b8fad] mt-1">
                  create one in the sidebar first
                </p>
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-[#4a4458] mb-3 text-sm" style={{ fontWeight: 600 }}>choose a color!</label>
            <div className="grid grid-cols-4 gap-3">
              {NOTE_COLORS.map((colorOption, index) => {
                const rotations = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1', 'rotate-0'];
                const rotation = rotations[index % rotations.length];
                return (
                  <button
                    key={colorOption.name}
                    type="button"
                    onClick={() => setSelectedColor(colorOption.color)}
                    className={`h-16 rounded-3xl transition-all duration-200 transform hover:scale-110 hover:rotate-0 border-4 ${rotation} ${
                      selectedColor === colorOption.color
                        ? "border-white scale-110 shadow-lg"
                        : "border-white/50 hover:border-white shadow-md"
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                  >
                    <span className="sr-only">{colorOption.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-white/70 text-[#6b5578] rounded-2xl hover:bg-white transition-all duration-200 transform hover:scale-105"
              style={{ fontWeight: 600 }}
            >
              cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              style={{ fontWeight: 600 }}
            >
              create!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}