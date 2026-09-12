import { useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "../../../shared/ui/command";
import {
  Plus,
  StickyNote,
  Hash,
  LogOut,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useUiStore } from "../stores/useUiStore";
import { useAuth } from "../../../lib/auth-context";
import { useNavigate } from "react-router";
import type { Note } from "../dashboard";
import type { Category } from "../hooks/useNotesQuery";

interface CommandPaletteProps {
  notes: Note[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onSelectNote?: (noteId: string) => void;
  onClearSearch: () => void;
}

export function CommandPalette({
  notes,
  categories,
  selectedCategory,
  onSelectCategory,
  onClearSearch,
}: CommandPaletteProps) {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    openAddModal,
  } = useUiStore();

  const { logout } = useAuth();
  const navigate = useNavigate();

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const handleCreateNote = () => {
    setCommandPaletteOpen(false);
    openAddModal();
  };

  const handleSelectCat = (name: string) => {
    onSelectCategory(name);
    setCommandPaletteOpen(false);
  };

  const handleLogout = async () => {
    setCommandPaletteOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      title="Marginalia Command Palette"
      description="Search notes, jump to categories, or trigger actions"
    >
      <CommandInput placeholder="Type a command or search notes..." />
      <CommandList className="max-h-[350px] overflow-y-auto p-2">
        <CommandEmpty className="py-6 text-center text-sm text-[#9b8fad]">
          No matching notes or actions found.
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={handleCreateNote}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-purple-50"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[#4a4458] font-medium">Create New Note</span>
            <CommandShortcut className="text-xs text-[#9b8fad]">N</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => {
              onClearSearch();
              setCommandPaletteOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-purple-50"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-[#a78bfa]">
              <RotateCcw className="w-4 h-4" />
            </div>
            <span className="text-[#4a4458] font-medium">Reset Filters & Search</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Categories */}
        <CommandGroup heading="Categories">
          <CommandItem
            onSelect={() => handleSelectCat("All Notes")}
            className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-purple-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-[#a78bfa]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className={`font-medium ${selectedCategory === "All Notes" ? "text-[#a78bfa]" : "text-[#4a4458]"}`}>
                All Notes
              </span>
            </div>
            <span className="text-xs text-[#9b8fad] bg-purple-50 px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          </CommandItem>

          {categories.map((cat) => {
            const count = notes.filter((n) => n.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;

            return (
              <CommandItem
                key={cat.id}
                onSelect={() => handleSelectCat(cat.name)}
                className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-purple-50"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                  <span className={`font-medium ${isSelected ? "text-[#a78bfa]" : "text-[#4a4458]"}`}>
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs text-[#9b8fad] bg-purple-50 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Notes */}
        {notes.length > 0 && (
          <CommandGroup heading="Recent Notes">
            {notes.slice(0, 8).map((note) => (
              <CommandItem
                key={note.id}
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  // Highlight or select category of the note
                  onSelectCategory(note.category);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-purple-50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${note.color}dd` }}
                  >
                    <StickyNote className="w-3.5 h-3.5 text-[#4a4458]" />
                  </div>
                  <span className="text-[#4a4458] font-medium truncate text-sm">
                    {note.title}
                  </span>
                </div>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: note.color }}
                >
                  {note.category}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator className="my-2" />

        {/* Session */}
        <CommandGroup heading="Account">
          <CommandItem
            onSelect={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer hover:bg-rose-50 text-rose-500"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium text-rose-600">Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
