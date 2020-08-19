import { Role } from '../models/enums';

export enum ClaimType {
    AUTH = 'auth',
    INVITATION = 'invitation',
}

export interface AuthClaims {
    type: ClaimType;
    userId: string;
    role: Role;
}
