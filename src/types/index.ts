// Recipe types

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  RecipeDetail: { recipeId: string };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  AddRecipe: undefined;
  Settings: undefined;
};