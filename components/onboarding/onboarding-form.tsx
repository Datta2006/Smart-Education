'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StudentOnboardingSchema, StudentOnboardingValues } from '@/lib/student/student-schema';
import { useStudent } from '@/providers/student-provider';
import { useKB } from '@/providers/kb-provider';
import { resolveSegment } from '@/lib/journey/segment-resolver';
import { LocalEventLogger } from '@/lib/events/local-event-logger';
import { Button } from '@/components/ui';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'goals', title: 'Goals & Interests' },
  { id: 'preferences', title: 'Preferences' },
];

const inputCls =
  'w-full rounded-xl border border-line bg-panel-2/60 px-4 py-2.5 text-sm text-ink placeholder:text-faint transition-all focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15';
const labelCls = 'block text-xs font-medium uppercase tracking-wider text-muted mb-1.5';
const errCls = 'mt-1 text-xs text-coral';

export default function OnboardingForm() {
  const [step, setStep] = useState(0);
  const { setStudent } = useStudent();
  const kb = useKB();
  const reduce = useReducedMotion();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<StudentOnboardingValues>({
    resolver: zodResolver(StudentOnboardingSchema) as any,
    defaultValues: {
      name: '',
      degree: 'B.Tech',
      branch: 'CSE',
      year: 1,
      semester: 1,
      goals: [],
      skills: [],
      interests: [],
      weeklyHours: 10,
      learningStyle: 'visual',
      concerns: [],
    },
  });

  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const isValid = await trigger(fields as any);
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  const getFieldsForStep = (stepIndex: number) => {
    if (stepIndex === 0) return ['name', 'degree', 'branch', 'year', 'semester'];
    if (stepIndex === 1) return ['goals', 'skills', 'interests'];
    if (stepIndex === 2) return ['weeklyHours', 'learningStyle', 'concerns'];
    return [];
  };

  const onSubmit = async (data: StudentOnboardingValues) => {
    const journeyIdResult = resolveSegment({ degree: data.degree, branch: data.branch, year: data.year });
    const journeyId = journeyIdResult.ok ? journeyIdResult.value : 'year-1-cse';
    const journey = kb.journeys.find((j) => j.id === journeyId);
    const currentPhaseId = journey?.phases[0]?.id ?? '';

    const newStudent = {
      ...data,
      id: crypto.randomUUID(),
      journeyId,
      currentPhaseId,
      completedTaskIds: [],
      savedOpportunityIds: [],
      dismissedWarningIds: [],
      lastActiveAt: new Date().toISOString(),
    };

    await setStudent(newStudent);
    await new LocalEventLogger().logEvent('onboarding_completed', { journeyId });
    window.location.href = '/dashboard';
  };

  const stepContent = [
    <div key="basic" className="space-y-4">
      <div>
        <label className={labelCls}>Full Name</label>
        <input {...register('name')} className={inputCls} placeholder="John Doe" />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Degree</label>
          <input {...register('degree')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Branch</label>
          <input {...register('branch')} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Year</label>
          <input type="number" {...register('year')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Semester</label>
          <input type="number" {...register('semester')} className={inputCls} />
        </div>
      </div>
    </div>,
    <div key="goals" className="space-y-4">
      <div>
        <label className={labelCls}>Goals (comma separated)</label>
        <input
          {...register('goals', { setValueAs: (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean) })}
          className={inputCls}
          placeholder="Get internship, Learn DSA"
        />
      </div>
      <div>
        <label className={labelCls}>Skills (comma separated)</label>
        <input
          {...register('skills', { setValueAs: (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean) })}
          className={inputCls}
          placeholder="Python, HTML"
        />
      </div>
      <div>
        <label className={labelCls}>Interests (comma separated)</label>
        <input
          {...register('interests', { setValueAs: (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean) })}
          className={inputCls}
          placeholder="Open source, AI"
        />
      </div>
    </div>,
    <div key="preferences" className="space-y-4">
      <div>
        <label className={labelCls}>Weekly Study Hours</label>
        <input type="number" {...register('weeklyHours')} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Learning Style</label>
        <select {...register('learningStyle')} className={cn(inputCls, 'appearance-none')}>
          <option value="visual">Visual</option>
          <option value="auditory">Auditory</option>
          <option value="reading-writing">Reading/Writing</option>
          <option value="kinesthetic">Kinesthetic</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Concerns (comma separated)</label>
        <input
          {...register('concerns', { setValueAs: (v) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean) })}
          className={inputCls}
          placeholder="Math, Coding speed"
        />
      </div>
    </div>,
  ];

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-line bg-panel/70 p-8 shadow-card backdrop-blur">
      <div className="mb-8">
        <div className="mb-2 flex justify-between">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                'text-sm font-medium transition-colors',
                i <= step ? 'text-accent' : 'text-faint'
              )}
            >
              {s.title}
            </span>
          ))}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-sky"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between pt-4">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={prevStep}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" variant="accent" className="ml-auto" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" variant="gradient" className="ml-auto">
              Finish
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}