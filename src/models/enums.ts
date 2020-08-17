export enum Role {
    ADMIN = 'ADMIN',
    CLIENT = 'CLIENT',
}

export enum ClientRole {
    ADMIN = 'ADMIN',
    ANALYST = 'ANALYST',
    VETTER = 'VETTER',
}

export enum AlertType {
    NOOP = 'NOOP',
    EMAIL = 'EMAIL',
}

export enum AlertFrequency {
    DAILY = 'DAILY',
    AS_IT_HAPPENS = 'AS_IT_HAPPENS'
}
