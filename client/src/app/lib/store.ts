import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  phone: string;
  role: 'customer' | 'valet' | 'admin';
  token: string;
}

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => {
        localStorage.setItem('token', user.token);
        set({ user });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
