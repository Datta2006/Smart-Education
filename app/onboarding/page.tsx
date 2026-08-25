'use client';

import { useStudent } from '@/providers/student-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import OnboardingForm from '@/components/onboarding/onboarding-form';

export default function OnboardingPage() {
  const reduce = useReducedMotion();
  const { student, isLoading } = useStudent();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && student) {
      router.push('/dashboard');
    }
  }, [student, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-muted">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base py-12">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 text-center"
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Welcome to SOS
        </h1>
        <p className="mt-1 text-muted">Let's build your student digital twin.</p>
      </motion.div>
      <OnboardingForm />
    </div>
  );
}