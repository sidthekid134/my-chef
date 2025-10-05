import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  isVisible: false,
  showToast: (message: string, type: 'success' | 'error' | 'info') => {
    set({ message, type, isVisible: true });
    setTimeout(() => {
      set({ isVisible: false });
    }, 3000);
  },
  hideToast: () => set({ isVisible: false }),
}));

interface RecipeState {
  newRecipeId: string | null;
  setNewRecipeId: (id: string | null) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  newRecipeId: null,
  setNewRecipeId: (id) => set({ newRecipeId: id }),
}));