import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Sidebar } from "./components/sidebar";
import { NotesGrid } from "./components/notes-grid";
import { AddNoteModal } from "./components/add-note-modal";
import { Taskbar } from "./components/taskbar";
import { notesApi, categoriesApi } from "../../lib/api";
import type { ApiNote, ApiCategory, NotePayload } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

// ─── Local types (mapped from API types) ─────────────────────────────────────

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  createdAt: Date;
  checklist?: ChecklistItem[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  type: 'created' | 'updated' | 'deleted';
  read: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapNote(apiNote: ApiNote): Note {
  return {
    id: apiNote._id,
    title: apiNote.title,
    content: apiNote.content,
    category: apiNote.category,
    color: apiNote.color,
    createdAt: new Date(apiNote.createdAt),
    checklist: apiNote.checklist.map((item) => ({
      id: item._id,
      text: item.text,
      checked: item.checked,
    })),
  };
}

function mapCategory(apiCat: ApiCategory): Category {
  return { id: apiCat._id, name: apiCat.name, color: apiCat.color };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Notes");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Load initial data ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [notesRes, catsRes] = await Promise.all([
        notesApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setNotes(notesRes.data.notes.map(mapNote));
      setCategories(catsRes.data.categories.map(mapCategory));
    } catch {
      toast.error("Failed to load your notes. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // ─── Notifications helper ───────────────────────────────────────────────
  const addNotification = (message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type,
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  // ─── Note handlers ──────────────────────────────────────────────────────
  const handleAddNote = async (newNote: Omit<Note, "id" | "createdAt">) => {
    try {
      const payload: NotePayload = {
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        color: newNote.color,
        checklist: newNote.checklist?.map((item) => ({
          text: item.text,
          checked: item.checked,
        })),
      };
      const { data } = await notesApi.create(payload);
      const note = mapNote(data.note);
      setNotes((prev) => [note, ...prev]);
      addNotification(`Created note: "${newNote.title}"`, 'created');
      setIsAddModalOpen(false);
      toast.success("Note created! ✨");
    } catch {
      toast.error("Failed to create note. Please try again.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    // Optimistic update
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.delete(id);
      if (noteToDelete) {
        addNotification(`Deleted note: "${noteToDelete.title}"`, 'deleted');
      }
      toast.success("Note deleted.");
    } catch {
      // Rollback
      if (noteToDelete) {
        setNotes((prev) => [noteToDelete, ...prev]);
      }
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const handleToggleChecklistItem = async (noteId: string, itemId: string) => {
    // Optimistic update
    const prevNotes = notes;
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== noteId || !note.checklist) return note;
        return {
          ...note,
          checklist: note.checklist.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      })
    );

    try {
      const { data } = await notesApi.toggleChecklistItem(noteId, itemId);
      const updatedNote = mapNote(data.note);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updatedNote : n)));

      const note = prevNotes.find((n) => n.id === noteId);
      const item = note?.checklist?.find((i) => i.id === itemId);
      if (item) {
        const action = item.checked ? 'unchecked' : 'checked';
        addNotification(`${action} "${item.text}" in "${note!.title}"`, 'updated');
      }
    } catch {
      // Rollback
      setNotes(prevNotes);
      toast.error("Failed to update checklist item.");
    }
  };

  // ─── Category handlers ──────────────────────────────────────────────────
  const handleAddCategory = async (category: { name: string; color: string }) => {
    try {
      const { data } = await categoriesApi.create(category.name, category.color);
      setCategories((prev) => [...prev, mapCategory(data.category)]);
      toast.success(`Category "${category.name}" created!`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message ?? "Failed to create category.";
      toast.error(msg);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    const category = categories.find((c) => c.name === name);
    if (!category) return;

    // Optimistic update
    setCategories((prev) => prev.filter((c) => c.name !== name));
    if (selectedCategory === name) setSelectedCategory("All Notes");

    try {
      await categoriesApi.delete(category.id);
      // Backend already reassigns notes — refresh them
      const { data } = await notesApi.getAll();
      setNotes(data.notes.map(mapNote));
      toast.success(`Category "${name}" deleted.`);
    } catch {
      // Rollback
      setCategories((prev) => [...prev, category]);
      toast.error("Failed to delete category.");
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => setNotifications([]);

  // ─── Derived state ──────────────────────────────────────────────────────
  const noteCounts: Record<string, number> = {};
  notes.forEach((note) => {
    noteCounts[note.category] = (noteCounts[note.category] || 0) + 1;
  });

  let filteredNotes =
    selectedCategory === "All Notes"
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.category.toLowerCase().includes(q) ||
        note.checklist?.some((item) => item.text.toLowerCase().includes(q))
    );
  }

  const markedDates = notes.map((note) => ({
    date: note.createdAt,
    color: note.color,
  }));

  // ─── Loading state ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] animate-pulse shadow-lg shadow-purple-200/50" />
          <p className="text-[#9b8fad] font-medium">loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8fc] flex">
      <Sidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        noteCounts={noteCounts}
        totalNotes={notes.length}
      />

      <div className="flex-1 ml-64 flex flex-col">
        <Taskbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewNote={() => setIsAddModalOpen(true)}
          userName={user?.name}
          markedDates={markedDates}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearAllNotifications={handleClearAllNotifications}
        />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl text-[#4a4458] mb-2" style={{ fontWeight: 700 }}>
                {selectedCategory}
              </h1>
              <p className="text-[#9b8fad]">
                {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            <NotesGrid
              notes={filteredNotes}
              onDeleteNote={handleDeleteNote}
              onToggleChecklistItem={handleToggleChecklistItem}
            />
          </div>
        </main>
      </div>

      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNote}
        categories={categories}
      />
    </div>
  );
}