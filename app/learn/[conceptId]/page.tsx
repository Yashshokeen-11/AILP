'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getConceptById } from '@/lib/knowledge-graph/python-graph';
import { LearningContent, LearningSection } from '@/lib/services/teaching-service';

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
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
  }, [conceptId]);

  const fetchLearningContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/learn/${conceptId}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load learning content');
      }
      const data = await response.json();
      setContent(data.content);
      setSessionId(data.sessionId);
    } catch (err) {
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

  if (error || !content) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl text-neutral-900 mb-4">Error loading content</h1>
          <p className="text-neutral-600 mb-6">{error || 'Content not available'}</p>
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
      if (sessionId) {
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
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Left Sidebar - Learning Path */}
      <aside className="w-80 border-r border-neutral-200 bg-white hidden lg:block">
        <div className="p-6 border-b border-neutral-200">
          <button
            onClick={() => router.push('/roadmap')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Roadmap</span>
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-4">
            Current Lesson
          </h2>
          <h3 className="text-lg text-neutral-900 mb-6">
            {content.title}
          </h3>

          <div className="space-y-2">
            {content.sections.map((s, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  index === currentSection
                    ? 'border-primary/30 bg-primary/10'
                    : index < currentSection
                    ? 'border-border bg-muted'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      index < currentSection
                        ? 'bg-primary text-primary-foreground'
                        : index === currentSection
                        ? 'bg-amber-400 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentSection ? '✓' : index + 1}
                  </div>
                  <span className={`text-sm ${
                    index === currentSection ? 'text-neutral-900' : 'text-neutral-600'
                  }`}>
                    {s.type === 'checkpoint' ? 'Checkpoint' : 'Section'} {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="text-sm text-neutral-600 mb-2">Progress</div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              {currentSection + 1} of {content.sections.length} sections
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 py-4 border-b border-neutral-200">
          <button
            onClick={() => router.push('/roadmap')}
            className="flex items-center gap-2 text-neutral-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Roadmap</span>
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Introduction Section */}
            {section.type === 'introduction' && (
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">
                  Introduction
                </div>
                <div className="prose prose-lg max-w-none">
                  {section.content?.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-neutral-700 leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Concept Section */}
            {section.type === 'concept' && (
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                  Core Concept
                </div>
                <div className="prose prose-lg max-w-none">
                  {section.content?.split('\n\n').map((block, i) => {
                    if (block.startsWith('```')) {
                      const code = block.replace(/```python\n?/, '').replace(/```/, '').trim();
                      return (
                        <pre key={i} className="bg-neutral-900 text-neutral-100 p-6 rounded-lg overflow-x-auto mb-6">
                          <code>{code}</code>
                        </pre>
                      );
                    }
                    if (block.startsWith('**') && block.includes('**\n')) {
                      const [title, ...rest] = block.split('\n');
                      return (
                        <div key={i}>
                          <h3 className="text-xl text-neutral-900 mb-4">
                            {title.replace(/\*\*/g, '')}
                          </h3>
                          <p className="text-neutral-700 leading-relaxed mb-6">
                            {rest.join('\n')}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-neutral-700 leading-relaxed mb-6">
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
                <div className="inline-block px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm">
                  Checkpoint
                </div>
                <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <p className="text-lg text-neutral-900 mb-4 leading-relaxed">
                    {section.question}
                  </p>
                  <Input
                    value={checkpointAnswer}
                    onChange={(e) => setCheckpointAnswer(e.target.value)}
                    placeholder="Type your thoughts here..."
                    className="mb-4 p-4 text-base"
                    disabled={showCheckpointFeedback}
                  />
                  {section.hint && !showCheckpointFeedback && (
                    <p className="text-sm text-amber-700">
                      💡 Hint: {section.hint}
                    </p>
                  )}
                  {showCheckpointFeedback && (
                    <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-primary">
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
                <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                  Building Intuition
                </div>
                <div className="prose prose-lg max-w-none">
                  {section.content?.split('\n\n').map((block, i) => {
                    if (block.startsWith('**') && block.includes('**\n')) {
                      const [title, ...rest] = block.split('\n');
                      return (
                        <div key={i}>
                          <h3 className="text-xl text-neutral-900 mb-4">
                            {title.replace(/\*\*/g, '')}
                          </h3>
                          <p className="text-neutral-700 leading-relaxed mb-6">
                            {rest.join('\n')}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-neutral-700 leading-relaxed mb-6">
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
                <div className="p-8 bg-gradient-to-br from-primary/10 to-amber-50 border-2 border-primary/20 rounded-lg">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg text-neutral-900 mb-2">Take a Moment</h3>
                      <p className="text-neutral-700 leading-relaxed">
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
        <footer className="border-t border-neutral-200 bg-white px-6 py-4">
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

