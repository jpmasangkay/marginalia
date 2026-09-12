import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { Sidebar } from "./components/sidebar";
import { NotesGrid } from "./components/notes-grid";
import { AddNoteModal } from "./components/add-note-modal";
import { Taskbar } from "./components/taskbar";
import { NotesSkeleton } from "./components/notes-skeleton";
import { CommandPalette } from "./components/command-palette";
import { ErrorBoundary } from "../../shared/components/error-boundary";
import { useUiStore } from "./stores/useUiStore";
import {
  useNotes,
  useCategories,
  useCreateNote,
  useDeleteNote,
  useToggleChecklistItem,
  useCreateCategory,
  useDeleteCategory,
} from "./hooks/useNotesQuery";
import type { NotePayload } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

// ─── Exported Types ──────────────────────────────────────────────────────────
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
  type: "created" | "updated" | "deleted";
  read: boolean;
}

export function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── URL State Synchronization ──────────────────────────────────────────────
  const selectedCategory = searchParams.get("category") || "All Notes";
  const setSelectedCategory = (category: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (category === "All Notes") {
        next.delete("category");
      } else {
        next.set("category", category);
      }
      return next;
    });
  };

  // ─── Client UI State (Zustand Store) ────────────────────────────────────────
  const {
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    isSidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  } = useUiStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ─── Server State (TanStack Query) ──────────────────────────────────────────
  const {
    data: notes = [],
    isLoading: isNotesLoading,
    isError: isNotesError,
    refetch: refetchNotes,
  } = useNotes();

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useCategories();

  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const toggleChecklistMutation = useToggleChecklistItem();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  // ─── Notifications helper ───────────────────────────────────────────────────
  const addNotification = (message: string, type: Notification["type"]) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type,
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  };

  // ─── Note Handlers ──────────────────────────────────────────────────────────
  const handleAddNote = async (newNote: Omit<Note, "id" | "createdAt">) => {
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

    createNoteMutation.mutate(payload, {
      onSuccess: () => {
        addNotification(`Created note: "${newNote.title}"`, "created");
        closeAddModal();
        toast.success("Note created! ✨");
      },
      onError: () => {
        toast.error("Failed to create note. Please try again.");
      },
    });
  };

  const handleDeleteNote = async (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);

    deleteNoteMutation.mutate(id, {
      onSuccess: () => {
        if (noteToDelete) {
          addNotification(`Deleted note: "${noteToDelete.title}"`, "deleted");
        }
        // Action feedback with built-in Undo action
        toast.success("Note deleted.", {
          action: noteToDelete
            ? {
                label: "Undo",
                onClick: () => {
                  handleAddNote({
                    title: noteToDelete.title,
                    content: noteToDelete.content,
                    category: noteToDelete.category,
                    color: noteToDelete.color,
                    checklist: noteToDelete.checklist,
                  });
                },
              }
            : undefined,
        });
      },
      onError: () => {
        toast.error("Failed to delete note. Restoring view...");
      },
    });
  };

  const handleToggleChecklistItem = async (noteId: string, itemId: string) => {
    const note = notes.find((n) => n.id === noteId);
    const item = note?.checklist?.find((i) => i.id === itemId);

    toggleChecklistMutation.mutate(
      { noteId, itemId },
      {
        onSuccess: () => {
          if (item && note) {
            const action = item.checked ? "unchecked" : "checked";
            addNotification(`${action} "${item.text}" in "${note.title}"`, "updated");
          }
        },
        onError: () => {
          toast.error("Failed to update checklist item. Reverted.");
        },
      }
    );
  };

  // ─── Category Handlers ──────────────────────────────────────────────────────
  const handleAddCategory = async (category: { name: string; color: string }) => {
    createCategoryMutation.mutate(category, {
      onSuccess: () => {
        toast.success(`Category "${category.name}" created!`);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? "Failed to create category.";
        toast.error(msg);
      },
    });
  };

  const handleDeleteCategory = async (name: string) => {
    const category = categories.find((c) => c.name === name);
    if (!category) return;

    if (selectedCategory === name) {
      setSelectedCategory("All Notes");
    }

    deleteCategoryMutation.mutate(category.id, {
      onSuccess: () => {
        toast.success(`Category "${name}" deleted.`);
      },
      onError: () => {
        toast.error("Failed to delete category.");
      },
    });
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => setNotifications([]);

  // ─── Derived State ──────────────────────────────────────────────────────────
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

  const isLoading = isNotesLoading || isCategoriesLoading;

  return (
    <div className="min-h-screen bg-[#faf8fc] flex">
      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        notes={notes}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onClearSearch={() => setSearchQuery("")}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSidebarOpen(false); // close drawer on mobile after selection
        }}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        noteCounts={noteCounts}
        totalNotes={notes.length}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Taskbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewNote={openAddModal}
          userName={user?.name}
          markedDates={markedDates}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearAllNotifications={handleClearAllNotifications}
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-4xl text-[#4a4458] mb-2 font-bold">
                  {selectedCategory}
                </h1>
                <p className="text-[#9b8fad] text-sm sm:text-base">
                  {isLoading
                    ? "Loading your notes..."
                    : `${filteredNotes.length} ${
                        filteredNotes.length === 1 ? "note" : "notes"
                      }${searchQuery ? ` matching "${searchQuery}"` : ""}`}
                </p>
              </div>

              {selectedCategory !== "All Notes" && (
                <button
                  onClick={() => setSelectedCategory("All Notes")}
                  className="text-xs font-semibold text-[#a78bfa] hover:underline self-start sm:self-auto"
                >
                  ← Back to All Notes
                </button>
              )}
            </div>

            {/* Error or Content or Layout-Matched Skeletons (Zero CLS) */}
            <ErrorBoundary fallbackTitle="Could not load notes">
              {isLoading ? (
                <NotesSkeleton />
              ) : isNotesError ? (
                <div className="p-8 bg-white rounded-3xl border-b-4 border-rose-200 text-center shadow-md">
                  <p className="text-rose-500 font-semibold mb-3">
                    Failed to fetch notes from the server.
                  </p>
                  <button
                    onClick={() => refetchNotes()}
                    className="px-4 py-2 bg-purple-100 text-[#a78bfa] rounded-xl text-sm font-semibold hover:bg-purple-200 transition-colors"
                  >
                    Try Refreshing
                  </button>
                </div>
              ) : (
                <NotesGrid
                  notes={filteredNotes}
                  onDeleteNote={handleDeleteNote}
                  onToggleChecklistItem={handleToggleChecklistItem}
                  onNewNote={openAddModal}
                  onResetFilter={() => {
                    setSearchQuery("");
                    setSelectedCategory("All Notes");
                  }}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAdd={handleAddNote}
        categories={categories}
      />
    </div>
  );
}
export default Dashboard;