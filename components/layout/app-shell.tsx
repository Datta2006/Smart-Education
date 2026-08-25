'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStudent } from '@/providers/student-provider';
import { useTyping } from '@/providers/typing-provider';
import {
  Home,
  Map,
  Compass,
  MessagesSquare,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Keyboard,
  Timer,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/journey', label: 'Journey', icon: Map },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/typing', label: 'Typing', icon: Keyboard },
  { href: '/focus', label: 'Focus', icon: Timer },
  { href: '/mentor', label: 'Mentor', icon: MessagesSquare },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/admin/kb', label: 'Admin KB', icon: ShieldCheck },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
        active ? 'text-accent' : 'text-muted hover:text-ink hover:bg-panel-2/60'
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-xl border border-accent/25 bg-accent/10"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <item.icon size={18} className="relative z-10" />
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { student, resetStudent } = useStudent();
  const { session, stats } = useTyping();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await resetStudent();
    router.push('/');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-5 py-5">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-base-ink shadow-glow transition-transform group-hover:scale-105">
            S
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Student&nbsp;OS
          </span>
        </Link>
        <button
          className="md:hidden text-faint hover:text-ink"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>

      <div className="hidden md:block border-t border-line p-4">
        {session.tests.length > 0 && (
          <div className="mb-3 rounded-xl border border-line bg-panel-2/40 p-3">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-faint">
              <span>Typing</span>
              <span className="text-accent">best {stats.maxWpm} wpm</span>
            </div>
            <div className="mt-1 font-mono text-sm text-ink">{session.tests.length} tests</div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-panel-2 text-sm font-bold text-accent">
            {student?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{student?.name ?? 'Demo'}</p>
            <p className="truncate text-xs text-faint">
              {student?.degree} · Y{student?.year}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-faint transition-colors hover:text-coral"
            aria-label="Reset demo & sign out"
            title="Reset demo & sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base text-ink md:flex">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:block md:w-60 md:shrink-0',
          'md:h-screen md:sticky md:top-0 md:overflow-y-auto',
          'border-r border-line bg-panel/40 backdrop-blur-xl'
        )}
      >
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-base/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={reduce ? false : { x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 left-0 w-64 border-r border-line bg-panel shadow-2xl"
            >
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 border-b border-line bg-base/80 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-display text-lg font-semibold text-ink">
              Student&nbsp;OS
            </Link>
            <button
              className="rounded-lg border border-line p-2 text-muted hover:text-ink"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}