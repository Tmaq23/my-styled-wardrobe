```tsx
// NOTE: Ensure app/auth/debug/route.ts is deleted to avoid Next.js conflict with this page.
// API helper endpoint (if needed) now lives at /api/auth-debug.
"use client";
import { useSession, signOut } from 'next-auth/react';
import Header from '@/components/Header';
import { useState, useCallback, memo } from 'react';

const SessionDisplay = memo(({ session }: { session: any }) => (
  <pre className="bg-gray-100 p-4 rounded-md overflow-auto mb-6 text-sm">
    {JSON.stringify(session, null, 2)}
  </pre>
));
SessionDisplay.displayName = 'SessionDisplay';

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyCookies = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(document.cookie);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Failed to copy cookies. This may not work in all browsers.");
      setTimeout(() => setError(null), 3000);
    }
  }, []);

  const handleSignOut = useCallback(() => {
    try {
      signOut({ callbackUrl: '/' });
    } catch {
      setError("Failed to sign out. Please try again.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brown-400 via-brown-600 to-brown-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Auth Debug</h1>
          <p className="mb-2 text-gray-700">Status: <b>{status}</b></p>
          <p className="mb-4 text-xs text-gray-500">
            If this page failed before: delete app/auth/debug/route.ts (conflict) then restart.
          </p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <SessionDisplay session={session} />
          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full bg-brown-600 hover:bg-brown-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Sign Out
            </button>
            <button
              className="w-full border border-brown-600 text-brown-600 hover:bg-brown-50 font-bold py-2 px-4 rounded transition-colors"
              onClick={handleCopyCookies}
            >
              Copy Cookies {copied && '✓'}
            </button>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Troubleshooting</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Delete app/auth/debug/route.ts (cannot coexist with this page).</li>
              <li>Restart dev server after file removal.</li>
              <li>Ensure NEXTAUTH_URL + NEXTAUTH_SECRET are set.</li>
              <li>Clear cookies then refresh if session stale.</li>
              <li>Test /api/auth/session and /api/auth-debug for diagnostics.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
```