import { Gender, ConsciousnessLevel, PersonStatus } from '../../enums';

export interface CreatePersonDto {
  estimatedAge: number;
  gender: Gender;
  height: string;
  weight: string;
  distinctiveFeatures: string;
  consciousnessLevel: ConsciousnessLevel;
  notes?: string;
}

export interface UpdatePersonDto extends Partial<CreatePersonDto> {
  status?: PersonStatus;
  assignedTo?: string;
}

export interface PersonFilters {
  status?: PersonStatus;
  institution?: string;
  gender?: Gender;
}
