'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { getConceptById } from '@/lib/knowledge-graph/python-graph';
import { LearningContent, LearningSection } from '@/lib/services/teaching-service';
import { useAuth } from '@/lib/hooks/use-auth';

// Dynamically import 3D teacher to avoid SSR issues
const Teacher3D = dynamic(() => import('@/components/teacher-3d').then(mod => ({ default: mod.Teacher3D })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center bg-muted/20 rounded-lg">
      <div className="text-muted-foreground text-sm">Loading teacher...</div>
    </div>
  ),
});

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout, isGuest } = useAuth();
  const conceptId = params.conceptId as string;
  const [currentSection, setCurrentSection] = useState(0);
  const [checkpointAnswer, setCheckpointAnswer] = useState('');
  const [showCheckpointFeedback, setShowCheckpointFeedback] = useState(false);
  const [content, setContent] = useState<LearningContent | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkpointFeedback, setCheckpointFeedback] = useState<string>('');

  const concept = getConceptById(conceptId);

  useEffect(() => {
    if (conceptId) {
      fetchLearningContent();
    }
  }, [conceptId, isGuest]);

  const fetchLearningContent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`[LearningPage] Fetching content for concept: ${conceptId}`);
      
      // Use guest API if user is a guest
      const apiRoute = isGuest ? `/api/guest/learn/${conceptId}` : `/api/learn/${conceptId}`;
      const response = await fetch(apiRoute, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401 && !isGuest) {
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('[LearningPage] API error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to load learning content');
      }
      const data = await response.json();
      console.log('[LearningPage] Received data:', {
        hasContent: !!data.content,
        title: data.content?.title,
        sectionsCount: data.content?.sections?.length,
        firstSection: data.content?.sections?.[0],
      });
      if (!data.content) {
        throw new Error('No content received from API');
      }
      // Clear any previous errors and set the content
      setError(null);
      setContent(data.content);
      setSessionId(data.sessionId);
      console.log('[LearningPage] Content set successfully');
    } catch (err) {
      console.error('[LearningPage] Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (!concept) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-neutral-900 mb-4">Concept not found</h1>
          <Button onClick={() => router.push('/roadmap')} variant="outline">
            Back to Roadmap
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4"></div>
          <p className="text-neutral-600">Loading learning content...</p>
        </div>
      </div>
    );
  }

  // Only show error if we're not loading and we have an error but no content
  if (!loading && error && !content) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl text-neutral-900 mb-4">Error loading content</h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <p className="text-xs text-neutral-500 mb-4">
            Check the browser console and server logs for details.
            <br />
            The AI content generation may be taking longer than expected.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchLearningContent} variant="outline">
              Retry
            </Button>
            <Button onClick={() => router.push('/roadmap')} variant="outline">
              Back to Roadmap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If we have content, show it even if there was a previous error
  if (!content) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mb-4"></div>
          <p className="text-neutral-600">Loading learning content...</p>
        </div>
      </div>
    );
  }

  const section = content.sections[currentSection];
  const isLastSection = currentSection === content.sections.length - 1;

  if (!section) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-neutral-900 mb-4">Section not found</h1>
          <Button onClick={() => router.push('/roadmap')} variant="outline">
            Back to Roadmap
          </Button>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    if (section.type === 'checkpoint' && !showCheckpointFeedback) {
      // Submit checkpoint
      if (sessionId && section.question) {
        try {
          const response = await fetch(`/api/learn/${conceptId}/checkpoint`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              checkpointIndex: currentSection,
              responseText: checkpointAnswer,
              question: section.question,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setCheckpointFeedback(data.feedback);
            setShowCheckpointFeedback(true);
          }
        } catch (err) {
          console.error('Failed to submit checkpoint:', err);
          setShowCheckpointFeedback(true);
          setCheckpointFeedback('Great thinking! Keep exploring these ideas.');
        }
      } else {
        setShowCheckpointFeedback(true);
      }
      return;
    }

    if (isLastSection) {
      // Complete concept
      if (isGuest) {
        // For guest users, update localStorage
        if (typeof window !== 'undefined') {
          const { updateGuestProgress, getGuestProgress } = await import('@/lib/auth/guest');
          const progress = getGuestProgress();
          const completedConcepts = progress.completedConcepts || [];
          if (!completedConcepts.includes(conceptId)) {
            updateGuestProgress({
              completedConcepts: [...completedConcepts, conceptId],
            });
          }
        }
      } else if (sessionId) {
        try {
          await fetch(`/api/learn/${conceptId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });
        } catch (err) {
          console.error('Failed to complete concept:', err);
        }
      }
      router.push('/roadmap');
    } else {
      setCurrentSection(prev => prev + 1);
      setCheckpointAnswer('');
      setShowCheckpointFeedback(false);
      setCheckpointFeedback('');
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setCheckpointAnswer('');
      setShowCheckpointFeedback(false);
    }
  };

  const progressPercent = ((currentSection + 1) / content.sections.length) * 100;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - Learning Path */}
      <aside className="w-80 border-r border-border bg-card hidden lg:block flex flex-col">
        <div className="p-6 border-b border-border space-y-4">
          <button
            onClick={() => router.push('/roadmap')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Roadmap</span>
          </button>
          {user && (
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">{user.email}</div>
              <div className="flex gap-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex-1 text-sm"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-sm uppercase tracking-wider text-primary mb-4 font-semibold">
            Current Lesson
          </h2>
          <h3 className="text-lg text-foreground mb-6 font-semibold">
            {content.title}
          </h3>

          <div className="space-y-2">
            {content.sections.map((s, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors classroom-card ${
                  index === currentSection
                    ? 'border-primary/40 bg-primary/10 teaching-highlight'
                    : index < currentSection
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      index < currentSection
                        ? 'bg-primary text-primary-foreground'
                        : index === currentSection
                        ? 'bg-primary text-primary-foreground animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentSection ? '✓' : index + 1}
                  </div>
                  <span className={`text-sm ${
                    index === currentSection ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {s.type === 'checkpoint' ? 'Checkpoint' : 'Section'} {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm text-muted-foreground mb-2 font-medium">Progress</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentSection + 1} of {content.sections.length} sections
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/roadmap')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Roadmap</span>
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Introduction Section */}
            {section.type === 'introduction' && (
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/15 text-primary rounded-full text-sm font-semibold border border-primary/20">
                  Introduction
                </div>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {section.content?.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-foreground leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Concept Section */}
            {section.type === 'concept' && (
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-semibold border border-accent/30">
                  Core Concept
                </div>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {section.content?.split('\n\n').map((block, i) => {
                    if (block.startsWith('```')) {
                      const code = block.replace(/```python\n?/, '').replace(/```/, '').trim();
                      return (
                        <pre key={i} className="bg-muted border border-border text-foreground p-6 rounded-lg overflow-x-auto mb-6 chalkboard-effect">
                          <code>{code}</code>
                        </pre>
                      );
                    }
                    if (block.startsWith('**') && block.includes('**\n')) {
                      const [title, ...rest] = block.split('\n');
                      return (
                        <div key={i} className="teaching-highlight p-4 rounded-lg mb-6">
                          <h3 className="text-xl text-foreground mb-4 font-semibold">
                            {title.replace(/\*\*/g, '')}
                          </h3>
                          <p className="text-foreground leading-relaxed">
                            {rest.join('\n')}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-foreground leading-relaxed mb-6">
                        {block}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Checkpoint Section */}
            {section.type === 'checkpoint' && (
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold border border-primary/30">
                  Checkpoint
                </div>
                <div className="p-6 bg-primary/5 border-2 border-primary/30 rounded-lg classroom-card teaching-highlight">
                  <p className="text-lg text-foreground mb-4 leading-relaxed font-medium">
                    {section.question}
                  </p>
                  <Input
                    value={checkpointAnswer}
                    onChange={(e) => setCheckpointAnswer(e.target.value)}
                    placeholder="Type your thoughts here..."
                    className="mb-4 p-4 text-base bg-background"
                    disabled={showCheckpointFeedback}
                  />
                  {section.hint && !showCheckpointFeedback && (
                    <p className="text-sm text-primary font-medium">
                      💡 Hint: {section.hint}
                    </p>
                  )}
                  {showCheckpointFeedback && (
                    <div className="mt-4 p-4 bg-primary/15 border border-primary/30 rounded-lg">
                      <p className="text-primary font-medium">
                        {checkpointFeedback || 'Great thinking! This kind of reflection is key to deep understanding.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analogy Section */}
            {section.type === 'analogy' && (
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-accent/20 text-accent-foreground rounded-full text-sm font-semibold border border-accent/30">
                  Building Intuition
                </div>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {section.content?.split('\n\n').map((block, i) => {
                    if (block.startsWith('**') && block.includes('**\n')) {
                      const [title, ...rest] = block.split('\n');
                      return (
                        <div key={i} className="teaching-highlight p-4 rounded-lg mb-6">
                          <h3 className="text-xl text-foreground mb-4 font-semibold">
                            {title.replace(/\*\*/g, '')}
                          </h3>
                          <p className="text-foreground leading-relaxed">
                            {rest.join('\n')}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-foreground leading-relaxed mb-6">
                        {block}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reflection Section */}
            {section.type === 'reflection' && (
              <div className="space-y-6">
                <div className="p-8 bg-gradient-to-br from-primary/15 to-accent/10 border-2 border-primary/30 rounded-lg classroom-card">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/25 rounded-full flex items-center justify-center border-2 border-primary/40">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg text-foreground mb-2 font-semibold">Take a Moment</h3>
                      <p className="text-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <footer className="border-t border-border bg-card px-6 py-4">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentSection === 0}
              className="px-6 py-3 disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={section.type === 'checkpoint' && !checkpointAnswer.trim() && !showCheckpointFeedback}
              className="px-6 py-3"
            >
              {isLastSection ? 'Complete Lesson' : 
               section.type === 'checkpoint' && !showCheckpointFeedback ? 'Submit' : 
               'Continue'}
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}

