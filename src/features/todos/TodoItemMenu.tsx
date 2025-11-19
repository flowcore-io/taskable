'use client';

import { useEffect, useRef } from 'react';
import { FileText, Link as LinkIcon, Paperclip, ListChecks, Pencil, Trash2 } from 'lucide-react';
import type { TodoItem, TodoItemStats } from '@/src/types';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoItemMenuProps {
  item: TodoItem;
  stats: TodoItemStats;
  onClose: () => void;
  onEdit: () => void;
  onAddDescription: () => void;
  onAddLink: () => void;
  onAddAttachment: () => void;
  onAddSubTasks: () => void;
  onDelete: () => void;
}

export function TodoItemMenu({
  item,
  stats,
  onClose,
  onEdit,
  onAddDescription,
  onAddLink,
  onAddAttachment,
  onAddSubTasks,
  onDelete,
}: TodoItemMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const menuItems = [
    {
      icon: Pencil,
      label: 'Edit text',
      action: onEdit,
    },
    {
      icon: FileText,
      label: stats.hasDescription ? 'Edit description' : 'Add description',
      action: onAddDescription,
    },
    {
      icon: LinkIcon,
      label: stats.hasLinks ? `Manage links (${item.links?.length})` : 'Add link',
      action: onAddLink,
    },
    {
      icon: Paperclip,
      label: stats.hasAttachments
        ? `Manage attachments (${item.attachments?.length})`
        : 'Attach image',
      action: onAddAttachment,
    },
    {
      icon: ListChecks,
      label: stats.hasSubTasks ? `Manage sub-tasks (${item.subTasks?.length})` : 'Add sub-tasks',
      action: onAddSubTasks,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-1">
          {menuItems.map((menuItem, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                menuItem.action();
              }}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left"
            >
              <menuItem.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">{menuItem.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="my-1 border-t border-border" />

          {/* Delete item */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this item?')) {
                onDelete();
              }
            }}
            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-destructive/10 text-destructive transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span className="text-sm">Delete item</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
