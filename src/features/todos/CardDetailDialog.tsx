'use client';

import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import type { TodoCard, TodoItem } from '@/src/types';
import { getCardStats } from '@/src/lib/utils';

interface CardDetailDialogProps {
  card: TodoCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (cardId: string, updates: { title?: string; items?: TodoItem[] }) => void;
  onDelete: (cardId: string) => void;
  isLoading?: boolean;
}

export function CardDetailDialog({
  card,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  isLoading,
}: CardDetailDialogProps) {
  const [title, setTitle] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  // Initialize state when card changes
  if (card && title !== card.title && !editingItemId) {
    setTitle(card.title);
  }

  if (!card) return null;

  const stats = getCardStats(card);

  const handleTitleUpdate = () => {
    if (title.trim() && title !== card.title) {
      onUpdate(card.id, { title: title.trim() });
    }
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      checked: false,
    };

    onUpdate(card.id, {
      items: [...card.items, newItem],
    });

    setNewItemText('');
  };

  const handleToggleItem = (itemId: string) => {
    const updatedItems = card.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdate(card.id, { items: updatedItems });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = card.items.filter((item) => item.id !== itemId);
    onUpdate(card.id, { items: updatedItems });
  };

  const handleStartEdit = (item: TodoItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveEdit = () => {
    if (!editingItemId || !editingItemText.trim()) {
      setEditingItemId(null);
      return;
    }

    const updatedItems = card.items.map((item) =>
      item.id === editingItemId ? { ...item, text: editingItemText.trim() } : item
    );

    onUpdate(card.id, { items: updatedItems });
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleDeleteCard = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      onDelete(card.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogClose onClick={() => onOpenChange(false)} />
        
        <DialogHeader>
          <div className="flex items-start gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTitleUpdate();
                }
              }}
              className="text-xl font-semibold border-none focus-visible:ring-0 px-0"
              placeholder="Card title..."
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteCard}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {stats.completed} / {stats.total} completed
          </div>
        </DialogHeader>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto space-y-2 py-4">
          {card.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items yet</p>
              <p className="text-sm">Add your first item below</p>
            </div>
          ) : (
            card.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 group p-2 rounded hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggleItem(item.id)}
                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                
                {editingItemId === item.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editingItemText}
                      onChange={(e) => setEditingItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveEdit();
                        }
                        if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      onBlur={handleSaveEdit}
                      autoFocus
                      className="flex-1"
                    />
                  </div>
                ) : (
                  <>
                    <span
                      onClick={() => handleStartEdit(item)}
                      className={`flex-1 cursor-pointer ${
                        item.checked
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-destructive transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add item input */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-muted-foreground" />
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="Add an item..."
              disabled={isLoading}
            />
            <Button
              onClick={handleAddItem}
              disabled={!newItemText.trim() || isLoading}
              size="sm"
            >
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

