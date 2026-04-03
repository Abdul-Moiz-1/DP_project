export enum UserRole {
    ORGANIZER = 'ORGANIZER',
    USER = 'USER'
}

export interface User {

    id: number;
    name: string;
    email: string;
    role: UserRole;
}