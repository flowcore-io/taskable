import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized', details: 'No access token' },
      { status: 401 },
    );
  }

  try {
    const { id: fileId } = await params;
    const body = await request.json();
    const { fragmentId, description, displayOrder } = body;

    if (!fragmentId) {
      return NextResponse.json({ error: 'Missing required field: fragmentId' }, { status: 400 });
    }

    const response = await fetch(`${env.USABLE_API_URL}/api/files/${fileId}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fragmentId,
        description,
        displayOrder: displayOrder ?? 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to attach file to fragment', details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exception attaching file:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
