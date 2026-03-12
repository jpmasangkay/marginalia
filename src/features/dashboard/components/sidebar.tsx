import { useState } from "react";
import { Sparkles, StickyNote, Plus, Hash, Trash2 } from "lucide-react";

interface Category {
  name: string;
  color: string;
}

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (name: string) => void;
  noteCounts: Record<string, number>;
  totalNotes: number;
}

const CATEGORY_COLORS = [
  "#a78bfa", "#fb7185", "#60a5fa", "#34d399", "#f59e0b", "#f472b6", "#818cf8", "#2dd4bf",
];

export function Sidebar({
  selectedCategory,
  onSelectCategory,
  categories,
  onAddCategory,
  onDeleteCategory,
  noteCounts,
  totalNotes,
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.some((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) return;
    onAddCategory({ name: newCategoryName.trim(), color: selectedColor });
    setNewCategoryName("");
    setSelectedColor(CATEGORY_COLORS[0]);
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddCategory();
    if (e.key === "Escape") setIsAdding(false);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-[rgba(167,139,250,0.15)] p-6 flex flex-col shadow-lg shadow-purple-100/20 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] rounded-2xl flex items-center justify-center shadow-md shadow-purple-200/50 transform -rotate-3 hover:rotate-0 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl text-[#4a4458]" style={{ fontWeight: 700 }}>Marginilia</span>
      </div>

      {/* All Notes */}
      <button
        onClick={() => onSelectCategory("All Notes")}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 mb-2 transform hover:scale-105 ${
          selectedCategory === "All Notes"
            ? "bg-gradient-to-r from-[#f3eeff] to-[#e9d5ff] text-[#a78bfa] shadow-md -rotate-1"
            : "text-[#9b8fad] hover:bg-[#faf8fc]"
        }`}
      >
        <div className="flex items-center gap-3">
          <StickyNote className="w-5 h-5" />
          <span style={{ fontWeight: 600 }}>all notes</span>
        </div>
        <span className="text-xs bg-white/90 px-2.5 py-1 rounded-full font-semibold shadow-sm">{totalNotes}</span>
      </button>

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto mt-6">
        <div className="flex items-center justify-between mb-4 px-4">
          <p className="text-xs uppercase tracking-wider text-[#9b8fad]" style={{ fontWeight: 600 }}>
            categories
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="w-7 h-7 bg-gradient-to-br from-[#f3eeff] to-[#e9d5ff] rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-sm transform -rotate-6 hover:rotate-0"
          >
            <Plus className="w-4 h-4 text-[#a78bfa]" />
          </button>
        </div>

        {/* Add Category Form */}
        {isAdding && (
          <div className="mx-2 mb-3 p-4 bg-[#fef3c7] rounded-3xl border-b-4 border-amber-200/50 shadow-lg transform -rotate-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="new category..."
              autoFocus
              className="w-full px-4 py-2.5 bg-white/80 border-2 border-white/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all mb-3 text-[#4a4458] placeholder:text-[#9b8fad]"
            />
            <div className="flex gap-2 mb-3 flex-wrap">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-xl transition-all duration-200 shadow-sm hover:scale-110 ${
                    selectedColor === color ? "ring-3 ring-white scale-125 shadow-md" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-sm text-[#6b5a3d] bg-white/70 rounded-xl hover:bg-white transition-colors font-semibold"
              >
                cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 py-2 text-sm text-white bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
              >
                add!
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {categories.length === 0 && !isAdding && (
            <div className="mx-2 p-6 text-center bg-[#fef3c7] rounded-3xl transform rotate-1 border-b-4 border-amber-200/50 shadow-md">
              <p className="text-sm text-[#6b5a3d]" style={{ fontWeight: 600 }}>
                no categories yet!
              </p>
              <p className="text-xs text-[#9b8fad] mt-1">
                click + to create one
              </p>
            </div>
          )}
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category.name;
            const count = noteCounts[category.name] || 0;
            const rotations = ['rotate-0', '-rotate-1', 'rotate-1'];
            const rotation = rotations[index % rotations.length];

            return (
              <div
                key={category.name}
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 transform hover:scale-105 ${rotation} ${
                  isSelected
                    ? "bg-gradient-to-r from-[#f3eeff] to-[#e9d5ff] shadow-md scale-105"
                    : "hover:bg-[#faf8fc]"
                }`}
              >
                <button
                  onClick={() => onSelectCategory(category.name)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Hash
                    className="w-4 h-4 transform -rotate-12"
                    style={{ color: isSelected ? category.color : "#9b8fad" }}
                  />
                  <span className={isSelected ? "text-[#4a4458] font-semibold" : "text-[#9b8fad]"}>
                    {category.name}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/90 px-2 py-0.5 rounded-full font-semibold shadow-sm">{count}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCategory(category.name);
                    }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#fecdd3] transition-all duration-200 transform hover:scale-110"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#fb7185]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}