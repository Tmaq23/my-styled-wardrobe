'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-800">Loading...</span>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="text-green-800 font-medium">
                Welcome back, {session.user?.name || session.user?.email}!
              </p>
              <p className="text-green-600 text-sm">
                {session.user?.email === 'demo@mystyledwardrobe.com' 
                  ? 'Premium Account - Enjoy expanded wardrobe limits!'
                  : 'Free Account - Upload up to 6 items'}
              </p>
            </div>
          </div>
          <div className="text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-800 font-medium">Get the most out of your wardrobe!</p>
          <p className="text-purple-600 text-sm">
            Sign in to save your items, track outfits, and unlock premium features.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/auth/signin"
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-purple-600 border border-purple-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
