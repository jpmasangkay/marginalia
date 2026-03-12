import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { NotesGrid } from "../components/notes-grid";
import { AddNoteModal } from "../components/add-note-modal";
import { Taskbar } from "../components/taskbar";
import { Calendar } from "../components/calendar";

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
  name: string;
  color: string;
}

const INITIAL_NOTES: Note[] = [];

const INITIAL_CATEGORIES: Category[] = [];

export function Dashboard() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Notes");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: Notification['type']) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type,
      read: false,
    };
    setNotifications([notification, ...notifications]);
  };

  const handleAddNote = (newNote: Omit<Note, "id" | "createdAt">) => {
    const note: Note = {
      ...newNote,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setNotes([note, ...notes]);
    addNotification(`Created note: "${newNote.title}"`, 'created');
    setIsAddModalOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    setNotes(notes.filter((note) => note.id !== id));
    if (noteToDelete) {
      addNotification(`Deleted note: "${noteToDelete.title}"`, 'deleted');
    }
  };

  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    const note = notes.find(n => n.id === noteId);
    setNotes(
      notes.map((note) => {
        if (note.id !== noteId || !note.checklist) return note;
        return {
          ...note,
          checklist: note.checklist.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      })
    );
    if (note) {
      const item = note.checklist?.find(i => i.id === itemId);
      if (item) {
        const action = item.checked ? 'unchecked' : 'checked';
        addNotification(`${action} "${item.text}" in "${note.title}"`, 'updated');
      }
    }
  };

  const handleAddCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const handleDeleteCategory = (name: string) => {
    setCategories(categories.filter((c) => c.name !== name));
    if (selectedCategory === name) setSelectedCategory("All Notes");
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Compute note counts per category
  const noteCounts: Record<string, number> = {};
  notes.forEach((note) => {
    noteCounts[note.category] = (noteCounts[note.category] || 0) + 1;
  });

  // Filter notes
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

  // Create marked dates from notes
  const markedDates = notes.map((note) => ({
    date: note.createdAt,
    color: note.color,
  }));

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