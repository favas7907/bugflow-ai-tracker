'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui';

export default function HomePage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(profile ? '/dashboard' : '/login');
    }
  }, [loading, profile, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070B14]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-plasma-500/20 border-t-plasma-500 animate-spin" />
        </div>
        <p className="text-cyber-500 text-sm font-medium animate-pulse-soft">Loading BugFlow...</p>
      </div>
    </div>
  );
}
