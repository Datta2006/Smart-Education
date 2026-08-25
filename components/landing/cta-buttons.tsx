'use client';

import { useRouter } from 'next/navigation';
import { Keyboard } from 'lucide-react';
import { Magnetic } from '@/components/motion/spring-card';
import { LocalStudentRepository } from '@/lib/student/local-student-repository';

export default function LandingCTAs() {
  const router = useRouter();

  const startJourney = () => router.push('/onboarding');

  const tryDemo = async () => {
    const repo = new LocalStudentRepository();
    const existing = await repo.getStudent();

    if (existing.ok && existing.value) {
      router.push('/dashboard');
      return;
    }

    const demo = {
      id: crypto.randomUUID(),
      name: 'Demo Student',
      degree: 'B.Tech',
      branch: 'CSE',
      year: 1,
      semester: 1,
      goals: ['software-internship', 'placements'],
      skills: ['programming'],
      interests: [],
      weeklyHours: 10,
      learningStyle: 'visual' as const,
      concerns: [],
      completedTaskIds: [],
      savedOpportunityIds: [],
      dismissedWarningIds: [],
      journeyId: 'year-1-cse',
      currentPhaseId: 'phase-1',
      lastActiveAt: new Date().toISOString(),
    };

    const res = await repo.saveStudent(demo);
    if (res.ok) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Magnetic>
        <button
          onClick={() => router.push('/typing')}
          className="group flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-semibold text-base-ink shadow-glow transition-colors hover:bg-accent-hi"
        >
          <Keyboard size={18} className="transition-transform group-hover:-rotate-12" />
          Test your typing
        </button>
      </Magnetic>
      <button
        onClick={startJourney}
        className="rounded-full border border-line bg-panel/60 px-8 py-3 font-medium text-ink backdrop-blur transition-colors hover:border-accent/40 hover:text-accent"
      >
        Start your journey
      </button>
      <button
        onClick={tryDemo}
        className="rounded-full px-4 py-3 text-sm font-medium text-faint transition-colors hover:text-muted"
      >
        or try the demo student →
      </button>
    </div>
  );
}