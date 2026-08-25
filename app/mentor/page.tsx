"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useStudent } from "@/providers/student-provider";
import { useKB } from "@/providers/kb-provider";
import AppShell from "@/components/layout/app-shell";
import { ChatWindow } from "@/components/chatbot/chat-window";
import { Button, Badge } from "@/components/ui";
import { ArrowLeft, BrainCircuit, Cpu, Server, ShieldCheck } from "lucide-react";

const KNOWS = [
  "DSA patterns",
  "System design",
  "DBMS · OS · CN",
  "Interview prep",
  "Mentor advice",
  "Roadmaps",
];

export default function MentorPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { student, isLoading } = useStudent();
  const kb = useKB();

  if (isLoading || !student) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24 text-muted">Loading mentor…</div>
      </AppShell>
    );
  }

  const relevantNotes = kb.mentorNotes
    .filter((note) => {
      const goalsMatch = note.goals?.some((g) => student.goals.includes(g));
      const yearMatch = note.year && note.year >= student.year;
      return goalsMatch || yearMatch;
    })
    .slice(0, 3);

  const decisionGuides = kb.decisions.slice(0, 3);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-1" /> Dashboard
            </Button>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/15 text-accent border border-accent/25">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                  Mentor
                </h1>
                <Badge variant="accent" size="sm" className="ml-1">
                  local · no LLM
                </Badge>
              </div>
              <p className="text-muted">
                Answers drawn from this platform&apos;s knowledge base — vector retrieval, not
                a chatbot that makes things up.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-faint">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" /> on-device embedding
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-sky" /> cosine similarity
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 flex h-[620px] rounded-2xl border border-line bg-panel/60 shadow-card overflow-hidden"
          >
            <ChatWindow />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Profile */}
            <div className="rounded-2xl border border-line bg-panel/60 p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-sky text-base-ink font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-ink">{student.name}</p>
                  <p className="text-xs text-faint">
                    {student.degree} · Year {student.year} · {student.branch.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {student.goals.slice(0, 4).map((g) => (
                  <Badge key={g} variant="info" size="sm">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            {/* What it knows */}
            <div className="rounded-2xl border border-line bg-panel/60 p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <p className="text-sm font-semibold text-ink">Grounded in the KB</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {KNOWS.map((k) => (
                  <Badge key={k} variant="default" size="sm">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mentor notes */}
            {relevantNotes.length > 0 && (
              <div className="rounded-2xl border border-line bg-panel/60 p-5 shadow-card">
                <p className="text-sm font-semibold text-ink mb-3">Mentor notes for you</p>
                <div className="space-y-2">
                  {relevantNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/cards/${note.id}`}
                      className="block rounded-xl border border-line bg-panel-2/50 px-3 py-2.5 text-sm text-muted hover:border-accent/30 hover:text-ink transition-colors"
                    >
                      {note.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Decision guides */}
            {decisionGuides.length > 0 && (
              <div className="rounded-2xl border border-line bg-panel/60 p-5 shadow-card">
                <p className="text-sm font-semibold text-ink mb-3">Decision guides</p>
                <div className="space-y-2">
                  {decisionGuides.map((d) => (
                    <Link
                      key={d.id}
                      href={`/cards/${d.id}`}
                      className="block rounded-xl border border-line bg-panel-2/50 px-3 py-2.5 text-sm text-muted hover:border-accent/30 hover:text-ink transition-colors"
                    >
                      {d.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}