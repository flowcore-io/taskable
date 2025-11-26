import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized', details: 'No access token' },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { workspaceId, fileName, mimeType, sizeBytes, tags } = body;

    // Validate required fields
    if (!workspaceId || !fileName || !mimeType || !sizeBytes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await fetch(`${env.USABLE_API_URL}/api/files/upload/request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        fileName,
        mimeType,
        sizeBytes,
        tags: tags || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to request upload URL', details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exception requesting upload URL:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}



