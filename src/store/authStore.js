import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  // Optional helpers
  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : state.user,
    })),

  resetAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
