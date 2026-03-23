import { create } from 'zustand';
import { persist } from 'zustand/middleware'

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            authToken: null,

            setAuthToken: (token: string | null) => set({ authToken: token }),
            setUser: (user: any) => set({ user, isAuthenticated: !!user }),
            logout: () =>set({ user: null, isAuthenticated: false, authToken: null})
        }),
        {
            name: 'auth-storage'
        }
    )
)