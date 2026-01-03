'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';

const questions = [
  {
    id: 1,
    question: "Have you ever written any code before in any programming language?",
    placeholder: "e.g., Yes, I've tried JavaScript / No, complete beginner"
  },
  {
    id: 2,
    question: "What do you hope to build or accomplish by learning Python?",
    placeholder: "e.g., Analyze data / Build websites / Automate tasks"
  },
  {
    id: 3,
    question: "When you encounter a problem, how do you prefer to solve it?",
    placeholder: "Describe your approach..."
  }
];

export default function AssessmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/assessment');
    }
  }, [user, authLoading, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  const handleNext = async () => {
    if (isLastQuestion) {
      // Submit assessment
      await handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const responses = questions.map(q => ({
        questionId: q.id.toString(),
        responseText: answers[q.id] || '',
      }));

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({ responses }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit assessment');
      }

      router.push('/roadmap');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg tracking-tight text-neutral-900">LearnAI</h2>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-neutral-600">
            Question {currentStep + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl tracking-tight text-neutral-900 mb-4 leading-tight">
              {currentQuestion.question}
            </h1>
            <p className="text-neutral-600 leading-relaxed">
              This helps us understand your background and tailor the learning experience to you.
            </p>
          </div>

          <div className="space-y-6">
            <Input
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="text-lg p-6 border-2 border-input focus:border-primary rounded-lg"
              autoFocus
            />

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
                <p className="text-red-900 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={isSubmitting}
                  className="px-6 py-3 border-2 border-neutral-200 hover:border-neutral-300"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]?.trim() || isSubmitting}
                className="px-6 py-3"
              >
                {isSubmitting ? 'Submitting...' : isLastQuestion ? 'View My Learning Path' : 'Continue'}
              </Button>
            </div>
          </div>

          {/* Why we ask */}
          <div className="mt-12 p-6 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">
              <span className="font-medium">Why we ask: </span>
              Your answers help us identify your starting point and create a personalized roadmap
              that builds on what you know while filling in any gaps.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

