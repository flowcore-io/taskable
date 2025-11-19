import type { TodoAttachment } from '@/src/types';

const API_URL = '/api/usable';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Include session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface UploadRequestResponse {
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface FileMetadata {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  downloadUrl?: string;
}

export const fileApi = {
  /**
   * Request a presigned upload URL from the Usable API
   */
  async requestUpload(data: {
    workspaceId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    tags?: string[];
  }): Promise<UploadRequestResponse> {
    return fetchWithAuth('/files/upload/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload a file to the presigned URL
   * Note: This bypasses our API routes and uploads directly
   */
  async uploadFile(
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },

  /**
   * Attach a file to a fragment (card)
   */
  async attachToFragment(fragmentId: string, fileId: string, description?: string): Promise<void> {
    return fetchWithAuth(`/files/${fileId}/attachments`, {
      method: 'POST',
      body: JSON.stringify({
        fragmentId,
        description,
        displayOrder: 0,
      }),
    });
  },

  /**
   * Get a download URL for a file
   */
  async getDownloadUrl(fileId: string): Promise<FileMetadata> {
    return fetchWithAuth(`/files/${fileId}/download`);
  },

  /**
   * Complete file upload flow: request URL, upload, attach to fragment
   */
  async uploadAndAttach(
    workspaceId: string,
    fragmentId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<TodoAttachment> {
    // Step 1: Request upload URL
    const uploadRequest = await this.requestUpload({
      workspaceId,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      tags: ['app:taskable', 'type:item-attachment'],
    });

    // Step 2: Upload file to presigned URL
    await this.uploadFile(uploadRequest.uploadUrl, file, onProgress);

    // Step 3: Attach file to fragment
    await this.attachToFragment(fragmentId, uploadRequest.fileId);

    // Step 4: Get download URL (includes thumbnail if available)
    const fileMetadata = await this.getDownloadUrl(uploadRequest.fileId);

    // Return TodoAttachment format
    return {
      id: crypto.randomUUID(),
      fileId: uploadRequest.fileId,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      thumbnailUrl: fileMetadata.downloadUrl, // Use download URL as thumbnail for now
    };
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 10 MB. Current size: ${Math.round(file.size / 1024 / 1024)} MB`,
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: JPEG, PNG, GIF, WEBP`,
      };
    }

    return { valid: true };
  },
};
