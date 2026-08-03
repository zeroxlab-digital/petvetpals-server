// ---------------------------------------------
// PET OWNER DTOs
//----------------------------------------------
export interface LoginUserDTO {
    email: string;
    password: string
}
export interface RegisterUserDTO {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}
export interface UpdateUserDTO {
    fullName: string;
    gender: 'male' | 'female';
    image: string;
    address?: string;
    city?: string;
    zip?: string;
    state?: string;
}
export interface UserTimeZone {
    timezone: string;
}

// ---------------------------------------------
// VET DTOs
//----------------------------------------------
export interface UpdateVetDTO {
    fullName: string;
    fees: number;
    gender: 'male' | 'female';
    image?: string | null;
    banner?: string | null;
    about: string;
    experience_years: number;
    experiences?: [];
    degrees?: [];
    specialities?: [];
    works_at?: string;
    languages?: [];
    based_in: string
}