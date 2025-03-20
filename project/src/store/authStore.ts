import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

// Mock patient user for testing
const mockUser: User = {
  id: '11111111-1111-1111-1111-111111111111', // This matches our seeded user ID
  email: 'patient@example.com',
  role: 'patient',
  firstName: 'John',
  lastName: 'Doe',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));