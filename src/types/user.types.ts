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