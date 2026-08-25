'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import LandingCTAs from '@/components/landing/cta-buttons';
import { TiltCard } from '@/components/motion/spring-card';
import { Compass, Map, MessagesSquare, User, Keyboard, Timer } from 'lucide-react';

const FEATURES = [
  {
    icon: Compass,
    title: 'A mentor that actually knows you',
    body: 'Your degree, branch, year, goals and habits shape every recommendation. No generic chatbot advice.',
    tag: 'Mentor',
    color: 'text-sky',
  },
  {
    icon: Map,
    title: 'A roadmap, not a firehose',
    body: 'Phase-by-phase journey built from a human-curated knowledge base. You always know what to focus on next.',
    tag: 'Journey',
    color: 'text-accent',
  },
  {
    icon: Keyboard,
    title: 'Speed you can measure',
    body: 'A one-button typing test with generated text at four difficulties. Every result feeds your profile graph.',
    tag: 'Typing',
    color: 'text-sun',
  },
  {
    icon: MessagesSquare,
    title: 'Honest answers',
    body: '“Should I worry about CGPA?” gets a grounded answer drawn from real mentor notes and decision guides.',
    tag: 'KB Chat',
    color: 'text-accent-hi',
  },
];

const STEPS = [
  ['01', 'Tell SOS about yourself', 'Degree, year, goals, skills, time you actually have each week.'],
  ['02', 'Get a phase-by-phase plan', 'Your current phase, its tasks, warnings and opportunities.'],
  ['03', 'Work, type, log, ask', 'Mark tasks done, drill your typing, ask grounded questions, review weekly.'],
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-base text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-xs font-bold text-base-ink">S</span>
          Student OS
        </span>
        <span className="text-sm text-faint">v1 · runs fully on device</span>
      </header>

      <main>
        {/* Hero */}
        <motion.section
          ref={heroRef}
          style={{ y: reduce ? 0 : heroY, opacity: reduce ? 1 : heroOpacity }}
          className="relative mx-auto max-w-3xl px-6 pb-24 pt-16 text-center md:pt-24"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                'radial-gradient(ellipse 60% 40% at 50% 0%, rgb(180 243 74 / 0.08), transparent 70%), radial-gradient(ellipse 40% 30% at 80% 10%, rgb(122 162 255 / 0.08), transparent 70%)',
            }}
          />

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="mb-6 inline-block rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent"
          >
            A student digital twin that tells you what to focus on next
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: easeOut }}
            className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl"
          >
            Stop guessing what to do
            <span className="text-accent"> in college.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            SOS understands your degree, your year, your goals and how much time you really have —
            then it gives you one clear thing to work on, and explains why.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: easeOut }}
            className="mt-10"
          >
            <LandingCTAs />
          </motion.div>

          {/* Terminal mock */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
            className="mx-auto mt-16 max-w-xl"
          >
            <div className="overflow-hidden rounded-2xl border border-line bg-panel/80 text-left shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-coral/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-sun/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
                <span className="ml-2 font-mono text-xs text-faint">sos — mentor terminal</span>
              </div>
              <div className="space-y-2 p-5 font-mono text-sm">
                <p className="text-faint">$ ask "what should I do this week?"</p>
                <p className="text-ink">
                  Based on your <span className="text-accent">Year 1 · CSE</span> journey, finish the
                  DSA foundations phase. Task <span className="text-accent">binary-search</span> is up next.
                </p>
                <p className="text-faint">$ type --run</p>
                <p className="text-ink">
                  wpm <span className="text-sun">64</span> · acc <span className="text-accent">97%</span> ·
                  best <span className="text-sun">72</span> · <span className="text-accent">saved ✓</span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="text-center font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl"
          >
            Everything in one place
          </motion.h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
              >
                <TiltCard intensity={5}>
                  <div className="h-full rounded-2xl border border-line bg-panel/60 p-6 shadow-card transition-colors hover:border-accent/25">
                    <div className="mb-4 flex items-center justify-between">
                      <f.icon size={22} className={f.color} />
                      <span className="rounded-full border border-line bg-panel-2/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-faint">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="mb-1 font-semibold text-ink">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{f.body}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-3xl px-6 py-16">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="text-center font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl"
          >
            How it works
          </motion.h2>
          <div className="mt-10 space-y-8">
            {STEPS.map(([num, title, body], i) => (
              <motion.div
                key={num}
                initial={reduce ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                className="flex gap-5"
              >
                <span className="font-mono text-lg font-bold text-accent">{num}</span>
                <div>
                  <h3 className="font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
            className="mt-14 flex justify-center"
          >
            <LandingCTAs />
          </motion.div>
        </section>

        {/* Features strip */}
        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: User, label: 'Resume builder' },
              { icon: Timer, label: 'Focus timer' },
              { icon: Map, label: 'Journey map' },
              { icon: MessagesSquare, label: 'KB answers' },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-xl border border-line bg-panel/40 px-3 py-2.5 text-sm text-muted"
              >
                <f.icon size={15} className="shrink-0 text-accent" />
                {f.label}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-faint">
        Student OS · Built for engineering students · MVP runs fully on device, no account needed
      </footer>
    </div>
  );
}