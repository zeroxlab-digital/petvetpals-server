interface IWeight {
    value: number;
    date: Date
}
export interface PetProfileDTO {
    type: 'dog' | 'cat';
    name: string;
    date_of_birth: Date;
    gender: 'male' | 'female';
    weight: IWeight[];
    breed?: string;
}

export interface MedicalHistoryDTO {
    type: string;
    diagnosis: string;
    treatment?: string;
    vetOrClinic: string | null;
    date: Date;
    file?: string | null;
    description?: string;
    notes?: string;
}

export interface AddVaccinationDTO {
    vaccine: string;
    provider?: string;
    date_given: Date;
    next_due?: Date;
    notes?: string;
}
export interface UpdateVaccinationDTO {
    vaccine: string;
    provider?: string;
    date_given: Date;
    next_due?: Date;
    notes?: string;
    status: 'due' | 'up-to-date' | 'overdue'
}

export interface AllergyDTO {
    type: 'allergy' | 'condition';
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    diagnosedDate?: Date | null;
    description?: string;
}