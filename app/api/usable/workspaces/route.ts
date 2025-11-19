import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  console.log('Session:', {
    exists: !!session,
    hasAccessToken: !!session?.accessToken,
    user: session?.user,
    userId: session?.user?.email || session?.user?.name,
  });
  
  if (!session) {
    return NextResponse.json(
      { 
        error: 'Unauthorized', 
        details: 'No session found. Please sign in.',
        code: 'NO_SESSION'
      }, 
      { status: 401 }
    );
  }
  
  if (!session.accessToken) {
    return NextResponse.json(
      { 
        error: 'Unauthorized', 
        details: 'No access token in session. Please sign out and sign back in to refresh your authentication.',
        code: 'NO_ACCESS_TOKEN'
      }, 
      { status: 401 }
    );
  }
  
  // Decode JWT to check claims
  const tokenParts = session.accessToken.split('.');
  const payload = tokenParts[1] ? JSON.parse(Buffer.from(tokenParts[1], 'base64').toString()) : null;
  console.log('FULL JWT Payload:', JSON.stringify(payload, null, 2));

  try {
    console.log('Calling Usable API:', {
      url: `${env.USABLE_API_URL}/api/workspaces`,
      tokenPreview: session.accessToken?.substring(0, 20) + '...',
    });

    const response = await fetch(`${env.USABLE_API_URL}/api/workspaces`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Usable API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Usable API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch workspaces', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    // The API returns { success: true, workspaces: [...] }
    // Extract and return just the workspaces array
    if (data.workspaces && Array.isArray(data.workspaces)) {
      return NextResponse.json(data.workspaces);
    }
    
    // Fallback: if the response is already an array, return it as-is
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    }
    
    // If neither format matches, return empty array with a warning
    console.warn('Unexpected API response format:', data);
    return NextResponse.json([]);
  } catch (error) {
    console.error('Exception calling Usable API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
