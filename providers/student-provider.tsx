'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StudentState } from '../types/student';
import { StudentRepository } from '../lib/student/student-repository';
import { getStudentRepository } from '../lib/student/student-repository-factory';

interface StudentContextType {
  student: StudentState | null;
  isLoading: boolean;
  updateStudent: (updates: Partial<StudentState>) => Promise<void>;
  setStudent: (s: StudentState) => Promise<void>;
  resetStudent: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | null>(null);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [studentState, setStudentState] = useState<StudentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [repository] = useState<StudentRepository>(() => getStudentRepository());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await repository.getStudent();
      if (!cancelled) {
        if (res.ok) setStudentState(res.value);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const setStudent = async (s: StudentState) => {
    setStudentState(s);
    await repository.saveStudent(s);
  };

  const updateStudent = async (updates: Partial<StudentState>) => {
    if (!studentState) return;
    const updated = { ...studentState, ...updates };
    setStudentState(updated);
    await repository.saveStudent(updated);
  };

  const resetStudent = async () => {
    await repository.resetStudent();
    setStudentState(null);
  };

  return (
    <StudentContext.Provider
      value={{ student: studentState, isLoading, updateStudent, setStudent, resetStudent }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent(): StudentContextType {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used within a StudentProvider');
  return context;
}