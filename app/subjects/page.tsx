'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { getGuestId } from '@/lib/auth/guest';

export default function SubjectSelectionPage() {
  const router = useRouter();
  const { user, loading: authLoading, isGuest } = useAuth();

  // Check if user has completed assessment and redirect accordingly
  useEffect(() => {
    if (!authLoading) {
      // First check if user is a guest (from localStorage) - this is synchronous
      const guestId = typeof window !== 'undefined' ? getGuestId() : null;
      if (guestId) {
        // User is a guest, check if they've done assessment
        const guestProgress = JSON.parse(
          localStorage.getItem('ailp_guest_progress') || '{"assessmentCompleted": false}'
        );
        if (!guestProgress.assessmentCompleted) {
          router.push('/assessment');
        } else {
          router.push('/roadmap');
        }
        return; // Don't make any API calls
      }

      // If we have a user (authenticated), check status
      if (user && !isGuest) {
        // User is authenticated, check status and redirect
        fetch('/api/auth/status', {
          credentials: 'include',
        })
          .then(res => {
            if (res.ok) {
              return res.json();
            }
            // If status check fails, still redirect to assessment
            return { redirectTo: '/assessment' };
          })
          .then(data => {
            // Automatically redirect based on assessment status
            router.push(data.redirectTo || '/assessment');
          })
          .catch(() => {
            // If error, redirect to assessment as default
            router.push('/assessment');
          });
      } else if (!user && !isGuest) {
        // Not authenticated and not a guest - wait a moment for cookie to be available, then check again
        const checkAuth = async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check for guest again (in case it was just created)
          const guestIdCheck = typeof window !== 'undefined' ? getGuestId() : null;
          if (guestIdCheck) {
            // Guest session was created, let useAuth hook handle it
            return;
          }
          
          const res = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              // Cookie is now available, check status
              const statusRes = await fetch('/api/auth/status', {
                credentials: 'include',
              });
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                router.push(statusData.redirectTo || '/assessment');
                return;
              }
            }
          }
          // Still not authenticated after waiting, redirect to login
          router.push('/login');
        };
        checkAuth();
      }
    }
  }, [user, authLoading, isGuest, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-lg tracking-tight text-neutral-900 hover:text-neutral-600 transition-colors">
            LearnAI
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl tracking-tight text-neutral-900 mb-3">
              Choose Your Journey
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed">
              Select a subject to begin your learning path
            </p>
          </div>

          {/* Subject Card */}
          <Link href="/assessment">
            <Card className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 border-border hover:border-primary bg-card">
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl text-neutral-900 mb-2">
                    Python for Absolute Beginners
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    Master Python from first principles. No prior programming experience needed.
                    Learn to think like a programmer through intuitive explanations and thoughtful practice.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      First Principles
                    </span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full">
                      Interactive
                    </span>
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full">
                      4-6 weeks
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>

          {/* Coming Soon */}
          <div className="mt-8 p-6 bg-neutral-100 rounded-lg border border-neutral-200">
            <p className="text-neutral-600 text-center">
              More subjects coming soon: Mathematics, Physics, Web Development, and more
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

