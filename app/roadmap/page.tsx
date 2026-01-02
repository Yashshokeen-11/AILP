'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { PYTHON_KNOWLEDGE_GRAPH } from '@/lib/knowledge-graph/python-graph';

// Mock data - in real app, this would come from the database
type ConceptStatus = 'locked' | 'available' | 'in_progress' | 'completed';

const mockConcepts = PYTHON_KNOWLEDGE_GRAPH.map((concept, index) => ({
  ...concept,
  status: (index === 0 ? 'completed' : index === 1 ? 'current' : 'locked') as ConceptStatus
}));

export default function RoadmapPage() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const completedCount = mockConcepts.filter(c => c.status === 'completed').length;
  const progressPercent = (completedCount / mockConcepts.length) * 100;

  const handleConceptClick = (conceptId: string, status: string) => {
    if (status !== 'locked') {
      router.push(`/learn/${conceptId}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="px-6 py-4 border-b border-neutral-200 sticky top-0 bg-neutral-50 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h2 className="text-lg tracking-tight text-neutral-900">LearnAI</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">
              {completedCount} of {mockConcepts.length} concepts mastered
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl tracking-tight text-neutral-900 mb-3">
              Your Learning Roadmap
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed mb-6">
              Progress from beginner to confident Python programmer
            </p>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Overall Progress</span>
                <span className="text-neutral-900">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>

          {/* Roadmap */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />

            {/* Concepts */}
            <div className="space-y-1">
              {mockConcepts.map((concept, index) => {
                const isHovered = hoveredId === concept.id;
                const isClickable = concept.status !== 'locked';

                return (
                  <div key={concept.id} className="relative">
                    {/* Level Marker */}
                    {(index === 0 || mockConcepts[index - 1].level !== concept.level) && (
                      <div className="mb-4 pl-14">
                        <span className="text-xs uppercase tracking-wider text-neutral-500">
                          {concept.level}
                        </span>
                      </div>
                    )}

                    {/* Concept Node */}
                    <div
                      className={`relative pl-14 pb-8 transition-all ${
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                      onMouseEnter={() => setHoveredId(concept.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => handleConceptClick(concept.id, concept.status)}
                    >
                      {/* Node Circle */}
                      <div
                        className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          concept.status === 'completed'
                            ? 'bg-emerald-500 border-4 border-emerald-100'
                            : concept.status === 'current'
                            ? 'bg-amber-400 border-4 border-amber-100 animate-pulse'
                            : 'bg-neutral-200 border-4 border-neutral-50'
                        }`}
                      >
                        {concept.status === 'completed' && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {concept.status === 'locked' && (
                          <svg className="w-4 h-4 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className={`p-5 rounded-lg border-2 transition-all ${
                          concept.status === 'current'
                            ? 'border-amber-300 bg-amber-50'
                            : isHovered && isClickable
                            ? 'border-emerald-300 bg-white shadow-md'
                            : 'border-neutral-200 bg-white'
                        } ${!isClickable && 'opacity-60'}`}
                      >
                        <h3 className="text-lg text-neutral-900 mb-1">
                          {concept.title}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {concept.status === 'completed' && 'Completed ✓'}
                          {concept.status === 'current' && 'Ready to learn'}
                          {concept.status === 'locked' && 'Unlocks after previous concepts'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

