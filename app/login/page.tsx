'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Redirect to subjects page
      router.push('/subjects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl tracking-tight text-neutral-900 font-semibold">
            LearnAI
          </Link>
          <h1 className="text-3xl tracking-tight text-neutral-900 mt-6 mb-2">
            Welcome Back
          </h1>
          <p className="text-neutral-600">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-900 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-neutral-900 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

