import { StudentRepository } from './student-repository';
import { StudentState } from '../../types/student';
import { Result } from '../../types/result';

const STORAGE_KEY = 'sos_student_state';

export class LocalStudentRepository implements StudentRepository {
  async getStudent(): Promise<Result<StudentState | null>> {
    if (typeof window === 'undefined') {
      return { ok: true, value: null };
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return { ok: true, value: null };
      return { ok: true, value: JSON.parse(data) };
    } catch (e) {
      return { ok: false, error: 'Failed to load student state from localStorage' };
    }
  }

  async saveStudent(s: StudentState): Promise<Result<void>> {
    if (typeof window === 'undefined') {
      return { ok: false, error: 'localStorage is not available on the server' };
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: 'Failed to save student state' };
    }
  }

  async resetStudent(): Promise<Result<void>> {
    if (typeof window === 'undefined') {
      return { ok: false, error: 'localStorage is not available on the server' };
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      return { ok: true, value: undefined };
    } catch (e) {
      return { ok: false, error: 'Failed to reset student state' };
    }
  }
}
