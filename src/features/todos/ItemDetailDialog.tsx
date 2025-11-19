'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Link as LinkIcon,
  Paperclip,
  ListChecks,
  ExternalLink,
  Download,
  Plus,
} from 'lucide-react';
import type { TodoItem, SubTask } from '@/src/types';
import { getItemStats, formatFileSize } from '@/src/lib/utils';

interface ItemDetailDialogProps {
  item: TodoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (itemId: string, updates: Partial<TodoItem>) => void;
  onToggleSubTask: (itemId: string, subTaskId: string) => void;
  onEditDescription: () => void;
  onManageLinks: () => void;
  onManageAttachments: () => void;
  onManageSubTasks: () => void;
}

export function ItemDetailDialog({
  item,
  isOpen,
  onClose,
  onUpdate,
  onToggleSubTask,
  onEditDescription,
  onManageLinks,
  onManageAttachments,
  onManageSubTasks,
}: ItemDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const descriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (item) {
      setEditText(item.text);
      setLocalDescription(item.description || '');
      setIsAddingLink(false);
      setNewLinkUrl('');
    }
  }, [item]);

  if (!item) return null;

  const stats = getItemStats(item);

  const handleSaveTitle = () => {
    if (editText.trim() && editText !== item.text) {
      onUpdate(item.id, { text: editText.trim() });
    } else {
      setEditText(item.text);
    }
    setIsEditing(false);
  };

  // Debounced description update
  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value);

    // Clear existing timeout
    if (descriptionTimeoutRef.current) {
      clearTimeout(descriptionTimeoutRef.current);
    }

    // Set new timeout to save after 500ms of no typing
    descriptionTimeoutRef.current = setTimeout(() => {
      onUpdate(item.id, { description: value });
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (descriptionTimeoutRef.current) {
        clearTimeout(descriptionTimeoutRef.current);
      }
    };
  }, []);

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) {
      setIsAddingLink(false);
      return;
    }

    // Validate URL
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
      const newLink = {
        id: crypto.randomUUID(),
        url,
      };
      const updatedLinks = [...(item.links || []), newLink];
      onUpdate(item.id, { links: updatedLinks });
      setNewLinkUrl('');
      setIsAddingLink(false);
    } catch {
      // Invalid URL, just reset
      setNewLinkUrl('');
      setIsAddingLink(false);
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    } else if (e.key === 'Escape') {
      setIsAddingLink(false);
      setNewLinkUrl('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      if (isEditing) {
        setEditText(item.text);
        setIsEditing(false);
      } else {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-60"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-card border border-border rounded-lg shadow-2xl z-60 flex flex-col overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between gap-4 mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-2xl font-semibold bg-transparent border-none outline-none focus:ring-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 text-left text-2xl font-semibold cursor-pointer hover:text-muted-foreground transition-colors"
                  >
                    {item.text}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress indicator for sub-tasks */}
              {stats.hasSubTasks && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {stats.subTasksCompleted} of {stats.subTasksTotal} completed
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completionPercentage}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Description</h3>
                </div>
                <textarea
                  value={localDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Add a description to provide more context..."
                  className="w-full min-h-[100px] p-3 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                />
              </section>

              {/* Links Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Links</h3>
                </div>
                <div className="space-y-2">
                  {item.links && item.links.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {item.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-2 p-2 bg-muted rounded group"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center gap-2 text-sm text-primary hover:underline min-w-0"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            <span className="truncate">{link.url}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedLinks =
                                item.links?.filter((l) => l.id !== link.id) || [];
                              onUpdate(item.id, { links: updatedLinks });
                            }}
                            className="p-1.5 rounded hover:bg-background transition-colors shrink-0"
                            title="Remove link"
                          >
                            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline link input */}
                  {isAddingLink ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        onBlur={handleAddLink}
                        onKeyDown={handleLinkKeyDown}
                        placeholder="Paste or type URL..."
                        className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(true)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add link</span>
                    </button>
                  )}
                </div>
              </section>

              {/* Attachments Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Attachments</h3>
                </div>
                <div className="space-y-2">
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {item.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {attachment.fileName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.fileSize)}
                            </div>
                          </div>
                          {attachment.thumbnailUrl && (
                            <a
                              href={attachment.thumbnailUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded hover:bg-background transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onManageAttachments}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Attach image</span>
                  </button>
                </div>
              </section>

              {/* Sub-tasks Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Sub-tasks</h3>
                </div>
                <div className="space-y-2">
                  {item.subTasks && item.subTasks.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {item.subTasks.map((subTask) => (
                        <div key={subTask.id} className="flex items-center gap-3 group">
                          <button
                            type="button"
                            onClick={() => onToggleSubTask(item.id, subTask.id)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                              subTask.checked
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground hover:border-primary'
                            }`}
                          >
                            {subTask.checked && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2.5 h-2.5 text-primary-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-label="Completed"
                              >
                                <title>Completed</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </motion.svg>
                            )}
                          </button>
                          <span
                            className={`flex-1 text-sm ${
                              subTask.checked ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {subTask.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedSubTasks =
                                item.subTasks?.filter((st) => st.id !== subTask.id) || [];
                              onUpdate(item.id, { subTasks: updatedSubTasks });
                            }}
                            className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onManageSubTasks}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add sub-task</span>
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
