/**
 * Guest User Utilities
 * Manages guest sessions using localStorage
 */

const GUEST_ID_KEY = 'ailp_guest_id';
const GUEST_PROGRESS_KEY = 'ailp_guest_progress';

export interface GuestProgress {
  completedConcepts: string[];
  currentConcept?: string;
  assessmentCompleted: boolean;
  assessmentResponses?: Array<{ questionId: string; responseText: string }>;
}

export function createGuestSession(): string {
  const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_ID_KEY, guestId);
    localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify({
      completedConcepts: [],
      assessmentCompleted: false,
    }));
  }
  return guestId;
}

export function getGuestId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_ID_KEY);
}

export function isGuest(): boolean {
  return !!getGuestId();
}

export function getGuestProgress(): GuestProgress {
  if (typeof window === 'undefined') {
    return { completedConcepts: [], assessmentCompleted: false };
  }
  const stored = localStorage.getItem(GUEST_PROGRESS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { completedConcepts: [], assessmentCompleted: false };
    }
  }
  return { completedConcepts: [], assessmentCompleted: false };
}

export function updateGuestProgress(progress: Partial<GuestProgress>): void {
  if (typeof window === 'undefined') return;
  const current = getGuestProgress();
  const updated = { ...current, ...progress };
  localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(updated));
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_PROGRESS_KEY);
}

