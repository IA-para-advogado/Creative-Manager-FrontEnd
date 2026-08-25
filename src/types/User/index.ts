export interface UserMetadata {
    name?: string;
    phone?: string;
    avatar_url?: string;
    role?: string;
}

export interface User {
    id: string;
    email: string;
    user_metadata?: UserMetadata;
    created_at?: string;
    updated_at?: string;
}
