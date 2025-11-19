// Workspace types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

// Fragment types
export interface FragmentType {
  id: string;
  name: string;
  description?: string;
}

// Fragment types
export interface Fragment {
  id: string;
  fragmentTypeId: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'stale' | 'archived';
}

// Link attached to a todo item (v2.0)
export interface TodoLink {
  id: string; // UUID
  url: string; // Full URL
  title?: string; // Optional title for the link
}

// File attachment for a todo item (v2.0)
export interface TodoAttachment {
  id: string; // UUID
  fileId: string; // Usable file ID
  fileName: string; // Original filename
  mimeType: string; // e.g., "image/png", "image/jpeg"
  fileSize: number; // Size in bytes
  thumbnailUrl?: string; // Optional thumbnail URL
}

// Sub-task within a todo item (v2.0)
export interface SubTask {
  id: string; // UUID
  text: string; // Sub-task text
  checked: boolean; // Completion status
}

// Checkable item within a card
export interface TodoItem {
  id: string; // Unique ID for the item (UUID)
  text: string;
  checked: boolean;

  // v2.0 enhancements (all optional for backward compatibility)
  description?: string; // Optional detailed description (max 5,000 chars)
  links?: TodoLink[]; // Optional external links (max 20)
  attachments?: TodoAttachment[]; // Optional image attachments (max 5)
  subTasks?: SubTask[]; // Optional nested sub-tasks (max 50)
}

// Computed statistics for a todo item (v2.0)
export interface TodoItemStats {
  hasDescription: boolean;
  hasLinks: boolean;
  hasAttachments: boolean;
  hasSubTasks: boolean;
  subTasksCompleted?: number;
  subTasksTotal?: number;
  completionPercentage?: number;
}

// Card (Google Keep style) - One fragment = One card with multiple items
export interface TodoCard extends Fragment {
  // Tags: app:taskable, collection:*, version:*
  items: TodoItem[]; // Parsed from content
}

// Patch operations for updates
export interface PatchOperation {
  type: 'add' | 'delete' | 'replace';
  lineNumber?: number;
  startLine?: number;
  endLine?: number;
  lines?: string[];
  searchText?: string;
  replaceText?: string;
  replaceAll?: boolean;
}

// Config storage
export interface TaskableConfig {
  workspaceId: string;
  fragmentTypeId: string;
  templatesConfig?: {
    templateFragmentId?: string;
    instructionSetFragmentId?: string;
    version: string;
    lastChecked: string; // ISO timestamp
  };
}

// Create/Update Input types
export interface CreateCardInput {
  title: string;
  summary?: string;
  items: Array<{ text: string; checked: boolean }>;
  collection: string;
}

export interface UpdateCardInput {
  id: string;
  title?: string;
  summary?: string;
  items?: TodoItem[];
  collection?: string;
}

// Collection (derived from tags)
export interface Collection {
  name: string;
  color: string;
}
