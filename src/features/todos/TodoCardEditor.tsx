'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import type { TodoCard, TodoItem, TodoLink, SubTask } from '@/src/types';
import { getCollection } from '@/src/lib/utils';
import { TodoItemDisplay } from './TodoItemDisplay';
import { ItemDetailDialog } from './ItemDetailDialog';
import {
  AddDescriptionDialog,
  ManageLinksDialog,
  ManageAttachmentsDialog,
  ManageSubTasksDialog,
} from './EnhancementDialogs';

interface TodoCardEditorProps {
  card: TodoCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    summary?: string;
    items: TodoItem[];
    collection: string;
  }) => void;
  onUpdate?: (data: {
    id?: string;
    title: string;
    summary?: string;
    items: TodoItem[];
    collection: string;
  }) => void;
  onDelete?: (id: string) => void;
  onAnimationComplete?: () => void;
  cardPosition?: { top: number; left: number; width: number; height: number };
  workspaceId: string; // Added for file uploads
}

export function TodoCardEditor({
  card,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  onAnimationComplete,
  cardPosition,
  workspaceId,
}: TodoCardEditorProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [items, setItems] = useState<TodoItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [collection, setCollection] = useState('default');
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // Enhancement dialog state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [showLinksDialog, setShowLinksDialog] = useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
  const [showSubTasksDialog, setShowSubTasksDialog] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setSummary(card.summary || '');
      setItems(card.items);
      setCollection(getCollection(card.tags));
    } else {
      setTitle('');
      setSummary('');
      setItems([]);
      setCollection('default');
    }
  }, [card]);

  // Handle browser back button / swipe back gesture
  useEffect(() => {
    if (!isOpen) return;

    // Push a new history state when card opens
    window.history.pushState({ cardOpen: true }, '');

    // Listen for back navigation (back button or swipe gesture)
    const handlePopState = () => {
      // When user goes back, close the card
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const autoSave = (updatedItems: TodoItem[]) => {
    if (!title.trim() || !onUpdate) return;

    onUpdate({
      id: card?.id,
      title: title.trim(),
      summary: summary.trim() || undefined,
      items: updatedItems,
      collection,
    });
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      checked: false,
      links: [],
      attachments: [],
      subTasks: [],
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setNewItemText('');
    newItemInputRef.current?.focus();

    // Auto-save
    autoSave(updatedItems);
  };

  const handleToggleItem = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
    setItems(updatedItems);

    // Auto-save
    autoSave(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);

    // Auto-save
    autoSave(updatedItems);
  };

  const handleUpdateItemText = (id: string, text: string) => {
    const updatedItems = items.map((item) => (item.id === id ? { ...item, text } : item));
    setItems(updatedItems);
  };

  const handleClose = () => {
    // Auto-save on close if title is provided
    if (title.trim()) {
      onSave({
        id: card?.id,
        title: title.trim(),
        summary: summary.trim() || undefined,
        items,
        collection,
      });
    }

    // If card is open and we're closing it via button, go back in history
    if (isOpen && window.history.state?.cardOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    if (card?.id && onDelete) {
      if (confirm('Are you sure you want to delete this card?')) {
        onDelete(card.id);
        onClose();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Get selected item for enhancement dialogs
  const selectedItem = items.find((item) => item.id === selectedItemId);

  // Enhancement handlers
  const handleUpdateItem = (itemId: string, updates: Partial<TodoItem>) => {
    const updatedItems = items.map((item) => (item.id === itemId ? { ...item, ...updates } : item));
    setItems(updatedItems);
    autoSave(updatedItems);
  };

  const handleToggleSubTask = (itemId: string, subTaskId: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === itemId && item.subTasks) {
        return {
          ...item,
          subTasks: item.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, checked: !st.checked } : st,
          ),
        };
      }
      return item;
    });
    setItems(updatedItems);
    autoSave(updatedItems);
  };

  const handleSaveDescription = (description: string) => {
    if (selectedItemId) {
      handleUpdateItem(selectedItemId, { description });
    }
  };

  const handleSaveLinks = (links: TodoLink[]) => {
    if (selectedItemId) {
      handleUpdateItem(selectedItemId, { links });
    }
  };

  const handleUploadComplete = (
    fileId: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
  ) => {
    if (selectedItemId) {
      const newAttachment = {
        id: crypto.randomUUID(),
        fileId,
        fileName,
        mimeType,
        fileSize,
      };
      const item = items.find((i) => i.id === selectedItemId);
      if (item) {
        const attachments = [...(item.attachments || []), newAttachment];
        handleUpdateItem(selectedItemId, { attachments });
      }
    }
  };

  const handleSaveSubTasks = (subTasks: SubTask[]) => {
    if (selectedItemId) {
      handleUpdateItem(selectedItemId, { subTasks });
    }
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleClose}
          />

          {/* Full-screen card */}
          <motion.div
            key="card-editor"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--background))' }}
            onKeyDown={handleKeyDown}
          >
            <div
              className="h-full w-full flex flex-col max-w-3xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'hsl(var(--background))' }}
            >
              {/* Header */}
              <motion.div
                className="p-4 border-b border-border"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Top row: Back button and Delete button */}
                <div className="flex items-center justify-between mb-3">
                  <motion.button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>

                  {card && onDelete && (
                    <motion.button
                      onClick={handleDelete}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Delete card"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full text-2xl font-semibold bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground mb-2"
                />

                {/* Description */}
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Add a description to help identify this list..."
                  className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground resize-none"
                  rows={2}
                />
              </motion.div>

              {/* Content - Scrollable items */}
              <motion.div
                className="flex-1 overflow-y-auto p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-4">
                  {items.map((item) => (
                    <TodoItemDisplay
                      key={item.id}
                      item={item}
                      onToggle={handleToggleItem}
                      onUpdate={handleUpdateItemText}
                      onDelete={handleDeleteItem}
                      onOpenDetail={(itemId) => {
                        setSelectedItemId(itemId);
                        setShowItemDetail(true);
                      }}
                    />
                  ))}

                  {/* Add new item */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddItem();
                    }}
                    className="flex items-center gap-3 pt-2"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <input
                      ref={newItemInputRef}
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onFocus={(e) => {
                        // Scroll the input into view when keyboard appears
                        // Use setTimeout to wait for keyboard animation
                        setTimeout(() => {
                          e.target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }, 100);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem();
                        }
                      }}
                      placeholder="Add item"
                      enterKeyHint="done"
                      className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
                      aria-label="Add new item"
                    />
                  </form>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="p-4 border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="collection-select"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Collection:
                  </label>
                  <select
                    id="collection-select"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    className="px-3 py-1.5 bg-muted text-foreground border border-border rounded-full text-sm capitalize focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="default">Default</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhancement Dialogs */}
          {selectedItem && (
            <>
              <ItemDetailDialog
                item={selectedItem}
                isOpen={showItemDetail}
                onClose={() => {
                  setShowItemDetail(false);
                  setSelectedItemId(null);
                }}
                onUpdate={handleUpdateItem}
                onToggleSubTask={handleToggleSubTask}
                onEditDescription={() => {
                  setShowItemDetail(false);
                  setShowDescriptionDialog(true);
                }}
                onManageLinks={() => {
                  setShowItemDetail(false);
                  setShowLinksDialog(true);
                }}
                onManageAttachments={() => {
                  setShowItemDetail(false);
                  setShowAttachmentsDialog(true);
                }}
                onManageSubTasks={() => {
                  setShowItemDetail(false);
                  setShowSubTasksDialog(true);
                }}
              />

              <AddDescriptionDialog
                isOpen={showDescriptionDialog}
                initialValue={selectedItem.description || ''}
                onClose={() => {
                  setShowDescriptionDialog(false);
                  setSelectedItemId(null);
                }}
                onSave={handleSaveDescription}
              />

              <ManageLinksDialog
                isOpen={showLinksDialog}
                initialLinks={selectedItem.links || []}
                onClose={() => {
                  setShowLinksDialog(false);
                  setSelectedItemId(null);
                }}
                onSave={handleSaveLinks}
              />

              {card && (
                <ManageAttachmentsDialog
                  isOpen={showAttachmentsDialog}
                  workspaceId={workspaceId}
                  cardId={card.id}
                  onClose={() => {
                    setShowAttachmentsDialog(false);
                    setSelectedItemId(null);
                  }}
                  onUploadComplete={handleUploadComplete}
                />
              )}

              <ManageSubTasksDialog
                isOpen={showSubTasksDialog}
                initialSubTasks={selectedItem.subTasks || []}
                onClose={() => {
                  setShowSubTasksDialog(false);
                  setSelectedItemId(null);
                }}
                onSave={handleSaveSubTasks}
              />
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
