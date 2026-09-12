import { create } from 'zustand';
import type { Note } from '../dashboard';

interface UiStore {
  // Add Note Modal
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;

  // Sidebar (mobile drawer)
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Command Palette (Cmd+K / Ctrl+K)
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;

  // Destructive Confirmation Targets (AlertDialog)
  deleteNoteTarget: Note | null;
  setDeleteNoteTarget: (note: Note | null) => void;

  deleteCategoryTarget: string | null;
  setDeleteCategoryTarget: (categoryName: string | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isAddModalOpen: false,
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),

  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  deleteNoteTarget: null,
  setDeleteNoteTarget: (note) => set({ deleteNoteTarget: note }),

  deleteCategoryTarget: null,
  setDeleteCategoryTarget: (categoryName) => set({ deleteCategoryTarget: categoryName }),
}));
