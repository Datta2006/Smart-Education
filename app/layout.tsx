import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { KBProvider } from "@/providers/kb-provider";
import { StudentProvider } from "@/providers/student-provider";
import { TypingProvider } from "@/providers/typing-provider";
import { FocusProvider } from "@/providers/focus-provider";
import { CourseProvider } from "@/providers/course-provider";
import { loadKB } from "@/lib/kb/loader";
import { KBSnapshot } from "@/lib/kb/loader";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Student OS — your personal student operating system",
  description:
    "A personalized mentoring platform for engineering students — journey plans, a grounded mentor, typing practice and a resume that writes itself.",
};

async function getKBData(): Promise<KBSnapshot> {
  const res = await loadKB();
  if (res.ok) return res.value;

  // Return empty snapshot if loading fails to prevent crash
  return {
    tasks: [],
    antiPatterns: [],
    decisions: [],
    mentorNotes: [],
    opportunities: [],
    journeys: [],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const kbValue = await getKBData();

  return (
    <html lang="en">
      <body className={`${display.variable} ${mono.variable} antialiased`}>
        <KBProvider initialValue={kbValue}>
          <StudentProvider>
            <TypingProvider>
              <FocusProvider>
                <CourseProvider>{children}</CourseProvider>
              </FocusProvider>
            </TypingProvider>
          </StudentProvider>
        </KBProvider>
      </body>
    </html>
  );
}