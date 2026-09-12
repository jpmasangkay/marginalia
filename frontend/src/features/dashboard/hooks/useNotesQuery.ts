import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, categoriesApi } from '../../../lib/api';
import type { ApiNote, ApiCategory, NotePayload } from '../../../lib/api';
import type { Note } from '../dashboard';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export function mapNote(apiNote: ApiNote): Note {
  return {
    id: apiNote._id,
    title: apiNote.title,
    content: apiNote.content,
    category: apiNote.category,
    color: apiNote.color,
    createdAt: new Date(apiNote.createdAt),
    checklist: apiNote.checklist?.map((item) => ({
      id: item._id,
      text: item.text,
      checked: item.checked,
    })) || [],
  };
}

export function mapCategory(apiCat: ApiCategory): Category {
  return { id: apiCat._id, name: apiCat.name, color: apiCat.color };
}

// ─── Query: Fetch Notes ───────────────────────────────────────────────────────
export function useNotes(search?: string) {
  return useQuery<Note[]>({
    queryKey: ['notes', search ?? ''],
    queryFn: async () => {
      const res = await notesApi.getAll(search);
      return res.data.notes.map(mapNote);
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

// ─── Query: Fetch Categories ──────────────────────────────────────────────────
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.getAll();
      return res.data.categories.map(mapCategory);
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// ─── Mutation: Create Note ────────────────────────────────────────────────────
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotePayload) => notesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// ─── Mutation: Delete Note (Optimistic UI with Rollback) ──────────────────────
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      const queryCache = queryClient.getQueryCache();
      const noteQueries = queryCache.findAll({ queryKey: ['notes'] });

      // Save snapshots for all active notes queries
      const previousData = noteQueries.map((query) => ({
        queryKey: query.queryKey,
        data: queryClient.getQueryData<Note[]>(query.queryKey),
      }));

      // Optimistically update all note queries
      previousData.forEach(({ queryKey, data }) => {
        if (data) {
          queryClient.setQueryData<Note[]>(
            queryKey,
            data.filter((note) => note.id !== id)
          );
        }
      });

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Rollback to snapshots
      context?.previousData.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// ─── Mutation: Toggle Checklist (Optimistic UI with Rollback) ─────────────────
export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, itemId }: { noteId: string; itemId: string }) =>
      notesApi.toggleChecklistItem(noteId, itemId),
    onMutate: async ({ noteId, itemId }) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      const queryCache = queryClient.getQueryCache();
      const noteQueries = queryCache.findAll({ queryKey: ['notes'] });

      const previousData = noteQueries.map((query) => ({
        queryKey: query.queryKey,
        data: queryClient.getQueryData<Note[]>(query.queryKey),
      }));

      // Optimistically toggle checkbox state in cache
      previousData.forEach(({ queryKey, data }) => {
        if (data) {
          queryClient.setQueryData<Note[]>(
            queryKey,
            data.map((note) => {
              if (note.id !== noteId || !note.checklist) return note;
              return {
                ...note,
                checklist: note.checklist.map((item) =>
                  item.id === itemId ? { ...item, checked: !item.checked } : item
                ),
              };
            })
          );
        }
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      context?.previousData.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// ─── Mutation: Create Category ────────────────────────────────────────────────
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: { name: string; color: string }) =>
      categoriesApi.create(category.name, category.color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ─── Mutation: Delete Category (Optimistic UI with Rollback) ──────────────────
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previousCategories = queryClient.getQueryData<Category[]>(['categories']);

      if (previousCategories) {
        queryClient.setQueryData<Category[]>(
          ['categories'],
          previousCategories.filter((c) => c.id !== id)
        );
      }

      return { previousCategories };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
