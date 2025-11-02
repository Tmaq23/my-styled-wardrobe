'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { TIER_PRICING } from '../lib/subscription';
import type { UserTier } from '../lib/subscription';

interface UpgradePromptProps {
  currentTier: UserTier;
  reason: string;
  onUpgrade: () => void;
  onClose: () => void;
  isAuthenticated?: boolean;
}

export default function UpgradePrompt({ currentTier, reason, onUpgrade, onClose, isAuthenticated = false }: UpgradePromptProps) {
  const { data: session } = useSession();

  // If not authenticated, show sign-in prompt instead
  if (!isAuthenticated && !session) {
    return (
      <div className="upgrade-prompt-overlay">
        <div className="upgrade-prompt">
          <button className="close-btn" onClick={onClose}>×</button>
          <h3>Sign In Required</h3>
          <p>{reason}</p>
          
          <div className="auth-prompt">
            <p className="mb-4">Please sign in to save items to your wardrobe and unlock premium features.</p>
            
            <div className="flex space-x-4 justify-center">
              <Link
                href="/auth/signin"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-white text-purple-600 border border-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              Demo account: demo@mystyledwardrobe.com / demo123
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="upgrade-prompt-overlay">
      <div className="upgrade-prompt">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Upgrade Required</h3>
        <p>{reason}</p>
        
        <div className="tier-comparison">
          <div className="tier-card premium">
            <h4>Premium</h4>
            <div className="price">£{TIER_PRICING.premium.monthly}/month</div>
            <ul>
              <li>30 clothing items</li>
              <li>Unlimited outfits</li>
              <li>Seasonal trend suggestions</li>
              <li>Priority support</li>
            </ul>
            <button className="upgrade-btn" onClick={() => onUpgrade()}>
              Upgrade to Premium
            </button>
          </div>
          
          <div className="tier-card stylist-pro">
            <h4>Stylist Pro</h4>
            <div className="price">£{TIER_PRICING.stylist_pro.monthly}/month</div>
            <ul>
              <li>Everything in Premium</li>
              <li>AI stylist chat</li>
              <li>Budget breakdowns</li>
              <li>1:1 lookbook requests</li>
            </ul>
            <button className="upgrade-btn premium-btn" onClick={() => onUpgrade()}>
              Upgrade to Stylist Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TierBadge({ tier }: { tier: UserTier }) {
  const badgeClass = tier === 'free' ? 'tier-free' : tier === 'premium' ? 'tier-premium' : 'tier-pro';
  const tierName = tier === 'stylist_pro' ? 'Stylist Pro' : tier.charAt(0).toUpperCase() + tier.slice(1);
  
  return <span className={`tier-badge ${badgeClass}`}>{tierName}</span>;
}
