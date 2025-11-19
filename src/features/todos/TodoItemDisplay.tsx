'use client';

import { useState } from 'react';
import { Link as LinkIcon, Paperclip } from 'lucide-react';
import type { TodoItem } from '@/src/types';
import { getItemStats, truncateText } from '@/src/lib/utils';
import { motion } from 'framer-motion';

interface TodoItemDisplayProps {
  item: TodoItem;
  onToggle: (itemId: string) => void;
  onUpdate: (itemId: string, text: string) => void;
  onDelete: (itemId: string) => void;
  onOpenDetail: (itemId: string) => void;
}

export function TodoItemDisplay({
  item,
  onToggle,
  onUpdate,
  onDelete,
  onOpenDetail,
}: TodoItemDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const stats = getItemStats(item);

  const handleUpdateText = () => {
    if (editText.trim() && editText !== item.text) {
      onUpdate(item.id, editText.trim());
    } else {
      setEditText(item.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateText();
    } else if (e.key === 'Escape') {
      setEditText(item.text);
      setIsEditing(false);
    }
  };

  // Render checkbox or progress indicator
  const renderCompletionIndicator = () => {
    if (stats.hasSubTasks) {
      // Show progress for items with sub-tasks
      return (
        <button
          onClick={() => onOpenDetail(item.id)}
          className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
        >
          <span>
            {stats.subTasksCompleted}/{stats.subTasksTotal}
          </span>
        </button>
      );
    }

    // Regular checkbox
    return (
      <motion.button
        onClick={() => onToggle(item.id)}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
          item.checked
            ? 'bg-primary border-primary'
            : 'border-muted-foreground hover:border-primary'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {item.checked && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-1 group"
    >
      {/* Main row: checkbox/progress, text, icons */}
      <div className="flex items-start gap-3">
        {renderCompletionIndicator()}

        {/* Item content - clickable to open detail view */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenDetail(item.id)}>
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleUpdateText}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className={`w-full bg-transparent border-none outline-none text-base ${
                item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-base ${
                  item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {item.text}
              </span>

              {/* Enhancement icons */}
              <div className="flex items-center gap-1">
                {stats.hasLinks && <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                {stats.hasAttachments && (
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description preview (if exists) */}
      {stats.hasDescription && item.description && (
        <div
          className="ml-8 text-sm text-muted-foreground line-clamp-2 cursor-pointer"
          onClick={() => onOpenDetail(item.id)}
        >
          {truncateText(item.description, 150)}
        </div>
      )}
    </motion.div>
  );
}
