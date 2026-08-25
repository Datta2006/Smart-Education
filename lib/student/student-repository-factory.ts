import { StudentRepository } from './student-repository';
import { LocalStudentRepository } from './local-student-repository';
import { env } from '../config/env';

export function getStudentRepository(): StudentRepository {
  // Not wired up yet: if Supabase is configured but no adapter exists that is a
  // programmer error and must fail loudly rather than fake local data.
  if (env.hasSupabase) {
    throw new Error('SupabaseStudentRepository not implemented yet');
  }
  // Demo mode (or no Supabase config) -> localStorage-backed local repository.
  return new LocalStudentRepository();
}