import { create } from 'zustand';
import { persist } from 'zustand/middleware'

type AuthUser = {
    id?: string;
    email?: string;
    full_name?: string;
    phone_number?: string;
    // Some UI screens reference `user.name`; map it here for compatibility.
    name?: string;
};

type AuthState = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    authToken: string | null;
    setAuthToken: (token: string | null) => void;
    setUser: (user: AuthUser | null) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            authToken: null,

            setAuthToken: (token: string | null) => set({ authToken: token }),
            setUser: (user: AuthUser | null) => set({ user, isAuthenticated: !!user }),
            logout: () =>set({ user: null, isAuthenticated: false, authToken: null})
        }),
        {
            name: 'auth-storage'
        }
    )
)