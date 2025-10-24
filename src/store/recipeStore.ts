import { create } from 'zustand';
import { RecipeFilter, RecipePagination, RecipeWithDetails } from '../data/models/RecipeModels';
import { RecipeRepository } from '../data/repositories/RecipeRepository';

interface RecipeState {
  // Recipes and state
  recipes: RecipeWithDetails[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  pagination: RecipePagination;

  // Repository
  repository: RecipeRepository;

  // Actions
  fetchRecipes: (page?: number) => Promise<void>;
  searchRecipes: (term: string) => Promise<void>;
  resetSearch: () => void;
  refreshRecipes: () => Promise<void>;
  deleteRecipe: (id: number) => Promise<boolean>;
}

export const useRecipeStore = create<RecipeState>((set, get) => {
  const repository = new RecipeRepository();

  // Default pagination state
  const defaultPagination: RecipePagination = {
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  };

  return {
    recipes: [],
    isLoading: false,
    error: null,
    searchTerm: '',
    pagination: defaultPagination,
    repository,

    // Fetch recipes with pagination
    fetchRecipes: async (page = 0) => {
      const { pagination, searchTerm } = get();
      const limit = pagination.limit;
      const offset = page * limit;

      try {
        set({ isLoading: true, error: null });

        const filter: RecipeFilter = {
          searchTerm: searchTerm || undefined,
          limit,
          offset,
        };

        const result = await repository.getRecipes(filter);

        // If this is page 0, replace recipes, otherwise append
        const updatedRecipes = page === 0
          ? result.recipes
          : [...get().recipes, ...result.recipes];

        set({
          recipes: updatedRecipes,
          pagination: result.pagination,
          isLoading: false
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch recipes',
          isLoading: false
        });
      }
    },

    // Search recipes by term
    searchRecipes: async (term: string) => {
      try {
        set({ isLoading: true, searchTerm: term, error: null });

        const filter: RecipeFilter = {
          searchTerm: term,
          limit: get().pagination.limit,
          offset: 0, // Always start from first page on search
        };

        const result = await repository.getRecipes(filter);

        set({
          recipes: result.recipes,
          pagination: result.pagination,
          isLoading: false
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to search recipes',
          isLoading: false
        });
      }
    },

    // Reset search
    resetSearch: () => {
      const { searchTerm } = get();
      if (searchTerm !== '') {
        set({ searchTerm: '' });
        get().fetchRecipes(0);
      }
    },

    // Refresh recipes (pull to refresh)
    refreshRecipes: async () => {
      try {
        set({ isLoading: true, error: null });

        // Keep the current search term if any
        const filter: RecipeFilter = {
          searchTerm: get().searchTerm || undefined,
          limit: get().pagination.limit,
          offset: 0, // Start from first page
        };

        const result = await repository.getRecipes(filter);

        set({
          recipes: result.recipes,
          pagination: result.pagination,
          isLoading: false
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to refresh recipes',
          isLoading: false
        });
      }
    },

    // Delete a recipe
    deleteRecipe: async (id: number) => {
      try {
        set({ isLoading: true, error: null });

        const result = await repository.deleteRecipe(id);

        // If successful, remove from local state
        if (result) {
          const updatedRecipes = get().recipes.filter(recipe => recipe.id !== id);
          set({
            recipes: updatedRecipes,
            pagination: {
              ...get().pagination,
              total: get().pagination.total - 1
            },
            isLoading: false
          });
        }

        return result;
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to delete recipe',
          isLoading: false
        });
        return false;
      }
    },
  };
});