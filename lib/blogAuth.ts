import { verifyAdminAccess } from '@/lib/apiAuth';

export interface AuthResult {
  userId: string;
  isAdmin: boolean;
  error?: string;
}

/**
 * Check authentication for blog operations
 * Supports both regular auth-session and admin authentication
 */
export async function checkBlogAuth(): Promise<AuthResult | null> {
  try {
    const access = await verifyAdminAccess();

    if (access.status !== 'ok') {
      return null;
    }

    return {
      userId: access.context.user.id,
      isAdmin: true,
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}


