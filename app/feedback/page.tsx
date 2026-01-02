'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function FeedbackPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg tracking-tight text-neutral-900">LearnAI</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Feedback Message */}
          <div className="mb-12">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <h1 className="text-3xl tracking-tight text-neutral-900 mb-4">
              Let's Strengthen Your Foundation
            </h1>
            
            <p className="text-lg text-neutral-600 leading-relaxed">
              Based on your recent practice, it looks like your understanding of loops could use some reinforcement.
              This is completely normal and an important part of the learning process.
            </p>
          </div>

          {/* Insight */}
          <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h2 className="text-lg text-neutral-900 mb-3">What We Noticed</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              When working with loops, you seem to be struggling with understanding when to use
              <code className="px-2 py-1 bg-white rounded text-sm mx-1">while</code> versus
              <code className="px-2 py-1 bg-white rounded text-sm mx-1">for</code> loops.
              This is one of the most common challenges beginners face.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              The good news: this concept becomes intuitive once you understand the underlying pattern.
              Let's revisit it with a fresh perspective.
            </p>
          </div>

          {/* Recommended Path */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl text-neutral-900">Recommended Next Steps</h2>
            
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-5 bg-white border-2 border-neutral-200 rounded-lg hover:border-emerald-300 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-neutral-900 mb-1">
                      Review: Loop Fundamentals
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      Revisit the core concepts with new examples and analogies
                    </p>
                  </div>
                  <span className="text-sm text-neutral-500">15 min</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 bg-white border-2 border-neutral-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-neutral-900 mb-1">
                      Practice: Pattern Recognition
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      Work through guided examples to build intuition
                    </p>
                  </div>
                  <span className="text-sm text-neutral-500">20 min</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 bg-white border-2 border-neutral-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-neutral-900 mb-1">
                      Return to Main Path
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      Continue with Lists, now with stronger fundamentals
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-lg border-2 border-emerald-200 mb-8">
            <p className="text-neutral-800 leading-relaxed">
              <strong>Remember:</strong> Mastery comes from addressing gaps as they appear.
              Taking time to strengthen your foundation now will make everything that follows easier
              and more intuitive. This detour is an investment in your long-term understanding.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/learn/loops')}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Start Review
            </Button>
            <Button
              onClick={() => router.push('/roadmap')}
              variant="outline"
              className="px-6 py-3 border-2 border-neutral-200 hover:border-neutral-300"
            >
              Back to Roadmap
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

