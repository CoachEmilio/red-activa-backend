import { Gender, ConsciousnessLevel, PersonStatus } from '../../enums';

export interface CreatePersonDto {
  estimatedAgeMin: number;
  estimatedAgeMax: number;
  gender: Gender;
  height?: number;
  weight?: number;
  distinctiveFeatures: string;
  consciousnessLevel: ConsciousnessLevel;
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
