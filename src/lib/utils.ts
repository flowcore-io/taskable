import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TodoItem, TodoCard, Fragment, TodoItemStats } from '@/src/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tag utilities for cards
export function getCardTags(collection: string, version = '2.0.0'): string[] {
  return ['app:taskable', `collection:${collection}`, `version:${version}`];
}

export function parseTagValue(tags: string[], prefix: string): string | null {
  const tag = tags.find((t) => t.startsWith(`${prefix}:`));
  return tag ? tag.split(':')[1] || null : null;
}

export function getCollection(tags: string[]): string {
  return parseTagValue(tags, 'collection') || 'default';
}

// Card content serialization
export function serializeCardContent(
  items: TodoItem[] | Array<{ text: string; checked: boolean }>,
): string {
  return JSON.stringify(items, null, 2);
}

export function parseCardContent(content: string): TodoItem[] {
  try {
    const parsed = JSON.parse(content);
    // Validate structure
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (item) =>
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.text === 'string' &&
            typeof item.checked === 'boolean',
        )
        .map((item) => ({
          // v1.0 fields (required)
          id: item.id,
          text: item.text,
          checked: item.checked,

          // v2.0 fields (optional, default to empty arrays if undefined)
          description: item.description,
          links: item.links || [],
          attachments: item.attachments || [],
          subTasks: item.subTasks || [],
        }));
    }
    return [];
  } catch {
    return [];
  }
}

// Convert Fragment to TodoCard
export function fragmentToCard(fragment: Fragment): TodoCard {
  return {
    ...fragment,
    items: parseCardContent(fragment.content),
  };
}

// Get card statistics
export function getCardStats(card: TodoCard): { total: number; completed: number } {
  return {
    total: card.items.length,
    completed: card.items.filter((item) => item.checked).length,
  };
}

// Get statistics for a todo item (v2.0)
export function getItemStats(item: TodoItem): TodoItemStats {
  const hasDescription = !!item.description && item.description.length > 0;
  const hasLinks = !!item.links && item.links.length > 0;
  const hasAttachments = !!item.attachments && item.attachments.length > 0;
  const hasSubTasks = !!item.subTasks && item.subTasks.length > 0;

  let subTasksCompleted = 0;
  let subTasksTotal = 0;
  let completionPercentage = 0;

  if (hasSubTasks && item.subTasks) {
    subTasksTotal = item.subTasks.length;
    subTasksCompleted = item.subTasks.filter((st) => st.checked).length;
    completionPercentage =
      subTasksTotal > 0 ? Math.round((subTasksCompleted / subTasksTotal) * 100) : 0;
  }

  return {
    hasDescription,
    hasLinks,
    hasAttachments,
    hasSubTasks,
    subTasksCompleted,
    subTasksTotal,
    completionPercentage,
  };
}

// Check if an item is complete (considers sub-tasks in v2.0)
export function isItemComplete(item: TodoItem): boolean {
  // If item has sub-tasks, ALL must be completed
  if (item.subTasks && item.subTasks.length > 0) {
    return item.subTasks.every((subTask) => subTask.checked);
  }

  // Otherwise, check the item's own checked status
  return item.checked;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Block javascript: protocol for security
    if (urlObj.protocol === 'javascript:') return false;
    return true;
  } catch {
    return false;
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}
