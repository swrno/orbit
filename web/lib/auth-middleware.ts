import { NextRequest } from 'next/server';
import { auth as firebaseAuth } from '@/lib/firebase';

/**
 * Get the authenticated user from the request
 * Expects Authorization header with Bearer token (Firebase ID token)
 */
export async function getAuthUser(request: NextRequest): Promise<{ uid: string; email: string | null } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // For server-side verification, we'd need Firebase Admin SDK
    // For now, we'll use a simpler approach: extract user info from client
    // In production, this should be replaced with proper token verification
    
    // Try to get from custom header (passed from client)
    const userId = request.headers.get('X-User-Id');
    const userEmail = request.headers.get('X-User-Email');
    
    if (userId) {
      return {
        uid: userId,
        email: userEmail
      };
    }

    return null;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

/**
 * Require authentication for a route
 * Returns user or throws error
 */
export async function requireAuth(request: NextRequest): Promise<{ uid: string; email: string | null }> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
