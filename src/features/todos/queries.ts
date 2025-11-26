import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usableApi } from '@/src/lib/usable-api/client';
import type { TodoCard, CreateCardInput, UpdateCardInput, TodoItem } from '@/src/types';

// Query keys
export const cardKeys = {
  all: (workspaceId: string, fragmentTypeId: string) =>
    ['cards', workspaceId, fragmentTypeId] as const,
  filtered: (workspaceId: string, fragmentTypeId: string, filters: { collection?: string }) =>
    ['cards', workspaceId, fragmentTypeId, filters] as const,
};

// List cards
export function useCards(
  workspaceId: string,
  fragmentTypeId: string,
  filters?: { collection?: string },
  hasValidSession = true, // Default to true for backward compatibility
) {
  return useQuery({
    queryKey: cardKeys.filtered(workspaceId, fragmentTypeId, {
      collection: filters?.collection,
    }),
    queryFn: async () => {
      return usableApi.listCards({
        workspaceId,
        fragmentTypeId,
        collection: filters?.collection,
        limit: 100,
      });
    },
    enabled: !!workspaceId && !!fragmentTypeId && hasValidSession,
  });
}

// Create card
export function useCreateCard(workspaceId: string, fragmentTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCardInput) => {
      return usableApi.createCard({
        workspaceId,
        fragmentTypeId,
        input,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', workspaceId, fragmentTypeId] });
    },
  });
}

// Update card (including toggling individual items)
export function useUpdateCard(workspaceId: string, fragmentTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCardInput) => {
      return usableApi.updateCard(data.id, data);
    },
    onMutate: async (data) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['cards', workspaceId, fragmentTypeId] });

      // Get previous state
      const previousCards = queryClient.getQueriesData<TodoCard[]>({
        queryKey: ['cards', workspaceId, fragmentTypeId],
      });

      // Optimistically update
      queryClient.setQueriesData<TodoCard[]>(
        { queryKey: ['cards', workspaceId, fragmentTypeId] },
        (old) => {
          if (!old) return old;
          return old.map((card) =>
            card.id === data.id
              ? {
                  ...card,
                  ...(data.title && { title: data.title }),
                  ...(data.items && { items: data.items }),
                  ...(data.collection && {
                    tags: card.tags.map((t) =>
                      t.startsWith('collection:') ? `collection:${data.collection}` : t,
                    ),
                  }),
                }
              : card,
          );
        },
      );

      return { previousCards };
    },
    onError: (_err, _variables, context) => {
      // Revert on error
      if (context?.previousCards) {
        context.previousCards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', workspaceId, fragmentTypeId] });
    },
  });
}

// Delete card
export function useDeleteCard(workspaceId: string, fragmentTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return usableApi.deleteCard(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['cards', workspaceId, fragmentTypeId] });

      const previousCards = queryClient.getQueriesData<TodoCard[]>({
        queryKey: ['cards', workspaceId, fragmentTypeId],
      });

      // Optimistically remove
      queryClient.setQueriesData<TodoCard[]>(
        { queryKey: ['cards', workspaceId, fragmentTypeId] },
        (old) => {
          if (!old) return old;
          return old.filter((card) => card.id !== id);
        },
      );

      return { previousCards };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCards) {
        context.previousCards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', workspaceId, fragmentTypeId] });
    },
  });
}

// ==========================================
// Item Enhancement Hooks (v2.0)
// ==========================================

/**
 * Update a specific item within a card
 */
export function useUpdateItem(workspaceId: string, fragmentTypeId: string) {
  const updateCard = useUpdateCard(workspaceId, fragmentTypeId);

  return useMutation({
    mutationFn: async ({
      cardId,
      itemId,
      updates,
      allItems,
    }: {
      cardId: string;
      itemId: string;
      updates: Partial<TodoItem>;
      allItems: TodoItem[];
    }) => {
      const updatedItems = allItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      );

      return updateCard.mutateAsync({
        id: cardId,
        items: updatedItems,
      });
    },
  });
}

/**
 * Toggle sub-task completion
 */
export function useToggleSubTask(workspaceId: string, fragmentTypeId: string) {
  const updateCard = useUpdateCard(workspaceId, fragmentTypeId);

  return useMutation({
    mutationFn: async ({
      cardId,
      itemId,
      subTaskId,
      allItems,
    }: {
      cardId: string;
      itemId: string;
      subTaskId: string;
      allItems: TodoItem[];
    }) => {
      const updatedItems = allItems.map((item) => {
        if (item.id === itemId && item.subTasks) {
          return {
            ...item,
            subTasks: item.subTasks.map((subTask) =>
              subTask.id === subTaskId ? { ...subTask, checked: !subTask.checked } : subTask,
            ),
          };
        }
        return item;
      });

      return updateCard.mutateAsync({
        id: cardId,
        items: updatedItems,
      });
    },
  });
}
