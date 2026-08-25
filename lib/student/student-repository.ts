import { StudentState } from '../../types/student';
import { Result } from '../../types/result';

export interface StudentRepository {
  getStudent(): Promise<Result<StudentState | null>>;
  saveStudent(s: StudentState): Promise<Result<void>>;
  resetStudent(): Promise<Result<void>>;
}
