import type {
  Fragment,
  FragmentType,
  PatchOperation,
  Workspace,
  TodoCard,
  CreateCardInput,
  UpdateCardInput,
  TodoItem,
} from '@/src/types';
import { serializeCardContent, getCardTags, fragmentToCard } from '@/src/lib/utils';

const API_URL = '/api/usable';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response body is not JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage += `: ${errorText}`;
        } catch {
          // Ignore if we can't read the error body
        }
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}

export const usableApi = {
  // Workspaces
  async listWorkspaces(): Promise<Workspace[]> {
    return fetchWithAuth('/workspaces');
  },

  // Fragment types
  async getFragmentTypes(workspaceId: string): Promise<FragmentType[]> {
    return fetchWithAuth(`/fragment-types?workspaceId=${workspaceId}`);
  },

  // List fragments (raw fragments, not converted to cards)
  async listFragments(params: {
    workspaceId: string;
    fragmentTypeId?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Fragment[]> {
    const queryParams = new URLSearchParams({
      workspaceId: params.workspaceId,
      limit: String(params.limit || 100),
      offset: String(params.offset || 0),
    });

    if (params.fragmentTypeId) {
      queryParams.append('fragmentTypeId', params.fragmentTypeId);
    }

    if (params.tags) {
      for (const tag of params.tags) {
        queryParams.append('tags', tag);
      }
    }

    const response = await fetchWithAuth(`/fragments?${queryParams.toString()}`);
    return response.fragments || [];
  },

  // Cards (fragments with items)
  async listCards(params: {
    workspaceId: string;
    fragmentTypeId?: string;
    collection?: string;
    limit?: number;
    offset?: number;
  }): Promise<TodoCard[]> {
    const tags = ['app:taskable'];

    if (params.collection && params.collection !== 'all') {
      tags.push(`collection:${params.collection}`);
    }

    const queryParams = new URLSearchParams({
      workspaceId: params.workspaceId,
      limit: String(params.limit || 100),
      offset: String(params.offset || 0),
    });

    if (params.fragmentTypeId) {
      queryParams.append('fragmentTypeId', params.fragmentTypeId);
    }

    for (const tag of tags) {
      queryParams.append('tags', tag);
    }

    const response = await fetchWithAuth(`/fragments?${queryParams.toString()}`);
    const fragments: Fragment[] = response.fragments || [];

    // Convert fragments to cards
    return fragments.map(fragmentToCard);
  },

  async createCard(data: {
    workspaceId: string;
    fragmentTypeId: string;
    input: CreateCardInput;
  }): Promise<TodoCard> {
    const content = serializeCardContent(data.input.items);
    const tags = getCardTags(data.input.collection);

    const fragment = await fetchWithAuth('/fragments', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId: data.workspaceId,
        fragmentTypeId: data.fragmentTypeId,
        title: data.input.title,
        content,
        summary: data.input.summary || data.input.title, // Use provided summary or fall back to title
        tags,
        createdVia: 'api',
      }),
    });

    return fragmentToCard(fragment);
  },

  async updateCard(id: string, data: UpdateCardInput): Promise<TodoCard> {
    const updateData: {
      title?: string;
      content?: string;
      summary?: string;
      tags?: string[];
    } = {};

    if (data.title) {
      updateData.title = data.title;
    }

    if (data.summary !== undefined) {
      // Use provided summary (can be empty string to clear it)
      updateData.summary = data.summary || data.title || '';
    }

    if (data.items) {
      updateData.content = serializeCardContent(data.items);
    }

    if (data.collection) {
      updateData.tags = getCardTags(data.collection);
    }

    const fragment = await fetchWithAuth(`/fragments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    return fragmentToCard(fragment);
  },

  async deleteCard(id: string): Promise<void> {
    return fetchWithAuth(`/fragments/${id}`, {
      method: 'DELETE',
    });
  },

  // Create a fragment (for templates, instruction sets, etc.)
  async createFragment(data: {
    workspaceId: string;
    fragmentTypeId: string;
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
  }): Promise<Fragment> {
    return fetchWithAuth('/fragments', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId: data.workspaceId,
        fragmentTypeId: data.fragmentTypeId,
        title: data.title,
        content: data.content,
        summary: data.summary || data.title,
        tags: data.tags || [],
        createdVia: 'api',
      }),
    });
  },

  // Update a fragment
  async updateFragment(
    id: string,
    data: {
      title?: string;
      content?: string;
      summary?: string;
      tags?: string[];
    },
  ): Promise<Fragment> {
    return fetchWithAuth(`/fragments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
