'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import type { TodoLink, SubTask } from '@/src/types';
import { isValidUrl, formatFileSize } from '@/src/lib/utils';
import { fileApi } from '@/src/lib/usable-api/files';

// ====================
// Add Description Dialog
// ====================

interface AddDescriptionDialogProps {
  isOpen: boolean;
  initialValue?: string;
  onClose: () => void;
  onSave: (description: string) => void;
}

export function AddDescriptionDialog({
  isOpen,
  initialValue = '',
  onClose,
  onSave,
}: AddDescriptionDialogProps) {
  const [description, setDescription] = useState(initialValue);
  const maxLength = 5000;

  const handleSave = () => {
    if (description.trim()) {
      onSave(description.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border border-border rounded-lg shadow-2xl z-[70] p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {initialValue ? 'Edit Description' : 'Add Description'}
              </h2>
              <button onClick={onClose} className="p-1 rounded hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a detailed description..."
              className="w-full min-h-[200px] p-3 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring resize-none"
              maxLength={maxLength}
              autoFocus
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {description.length} / {maxLength} characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!description.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ====================
// Manage Links Dialog
// ====================

interface ManageLinksDialogProps {
  isOpen: boolean;
  initialLinks: TodoLink[];
  onClose: () => void;
  onSave: (links: TodoLink[]) => void;
}

export function ManageLinksDialog({
  isOpen,
  initialLinks,
  onClose,
  onSave,
}: ManageLinksDialogProps) {
  const [links, setLinks] = useState<TodoLink[]>(initialLinks);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  const handleAddLink = () => {
    setError('');

    if (!newUrl.trim()) {
      setError('URL is required');
      return;
    }

    if (!isValidUrl(newUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    if (links.length >= 20) {
      setError('Maximum 20 links allowed');
      return;
    }

    const newLink: TodoLink = {
      id: crypto.randomUUID(),
      url: newUrl.trim(),
      title: newTitle.trim() || undefined,
    };

    setLinks([...links, newLink]);
    setNewUrl('');
    setNewTitle('');
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleSave = () => {
    onSave(links);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border border-border rounded-lg shadow-2xl z-[70] p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">Manage Links</h2>
              <button onClick={onClose} className="p-1 rounded hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing links */}
            {links.length > 0 && (
              <div className="mb-4 space-y-2 max-h-[200px] overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-start gap-2 p-2 bg-muted rounded-lg group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{link.title || link.url}</div>
                      {link.title && (
                        <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveLink(link.id)}
                      className="p-1 rounded hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new link */}
            <div className="space-y-2 mb-4">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Link title (optional)"
                className="w-full p-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                onClick={handleAddLink}
                className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ====================
// Manage Attachments Dialog
// ====================

interface ManageAttachmentsDialogProps {
  isOpen: boolean;
  workspaceId: string;
  cardId: string;
  onClose: () => void;
  onUploadComplete: (fileId: string, fileName: string, fileSize: number, mimeType: string) => void;
}

export function ManageAttachmentsDialog({
  isOpen,
  workspaceId,
  cardId,
  onClose,
  onUploadComplete,
}: ManageAttachmentsDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setProgress(0);

    // Validate file
    const validation = fileApi.validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploading(true);

      // Upload file
      const attachment = await fileApi.uploadAndAttach(
        workspaceId,
        cardId,
        file,
        (progressPercent) => {
          setProgress(progressPercent);
        },
      );

      // Notify parent
      onUploadComplete(
        attachment.fileId,
        attachment.fileName,
        attachment.fileSize,
        attachment.mimeType,
      );

      // Close dialog
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }

    // Reset file input
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border border-border rounded-lg shadow-2xl z-[70] p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">Attach Image</h2>
              <button onClick={onClose} className="p-1 rounded hover:bg-muted" disabled={uploading}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {!uploading ? (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to select an image or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    JPEG, PNG, GIF, or WEBP (max 10 MB)
                  </p>
                  <label className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    Select File
                  </label>
                </>
              ) : (
                <>
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground mb-2">Uploading...</p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}%</p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ====================
// Manage Sub-tasks Dialog
// ====================

interface ManageSubTasksDialogProps {
  isOpen: boolean;
  initialSubTasks: SubTask[];
  onClose: () => void;
  onSave: (subTasks: SubTask[]) => void;
}

export function ManageSubTasksDialog({
  isOpen,
  initialSubTasks,
  onClose,
  onSave,
}: ManageSubTasksDialogProps) {
  const [subTasks, setSubTasks] = useState<SubTask[]>(initialSubTasks);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddSubTask = () => {
    if (!newTaskText.trim()) return;

    if (subTasks.length >= 50) {
      alert('Maximum 50 sub-tasks allowed');
      return;
    }

    const newSubTask: SubTask = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      checked: false,
    };

    setSubTasks([...subTasks, newSubTask]);
    setNewTaskText('');
  };

  const handleToggleSubTask = (id: string) => {
    setSubTasks(subTasks.map((st) => (st.id === id ? { ...st, checked: !st.checked } : st)));
  };

  const handleRemoveSubTask = (id: string) => {
    setSubTasks(subTasks.filter((st) => st.id !== id));
  };

  const handleUpdateText = (id: string, text: string) => {
    setSubTasks(subTasks.map((st) => (st.id === id ? { ...st, text } : st)));
  };

  const handleSave = () => {
    onSave(subTasks);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border border-border rounded-lg shadow-2xl z-[70] p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold">Manage Sub-tasks</h2>
              <button onClick={onClose} className="p-1 rounded hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing sub-tasks */}
            {subTasks.length > 0 && (
              <div className="mb-4 space-y-2 max-h-[300px] overflow-y-auto">
                {subTasks.map((subTask) => (
                  <div key={subTask.id} className="flex items-start gap-2 group">
                    <button
                      onClick={() => handleToggleSubTask(subTask.id)}
                      className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
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
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </button>
                    <input
                      type="text"
                      value={subTask.text}
                      onChange={(e) => handleUpdateText(subTask.id, e.target.value)}
                      className={`flex-1 bg-transparent border-none outline-none text-sm ${
                        subTask.checked ? 'line-through text-muted-foreground' : ''
                      }`}
                    />
                    <button
                      onClick={() => handleRemoveSubTask(subTask.id)}
                      className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new sub-task */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="New sub-task..."
                className="flex-1 p-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubTask();
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleAddSubTask}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
