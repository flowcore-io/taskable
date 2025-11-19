import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId is required' },
        { status: 400 }
      );
    }

    // Fetch from the MCP system prompt endpoint which includes fragment types
    const url = `${env.USABLE_API_URL}/api/workspaces/${workspaceId}/mcp-system-prompt`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch fragment types', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract just the fragment types from the response
    const fragmentTypes = data.fragmentTypes || [];
    
    return NextResponse.json(fragmentTypes);
  } catch (error) {
    console.error('Fragment types error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

