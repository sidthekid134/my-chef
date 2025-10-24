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

// Recipe Import types

export interface ParsedRecipe {
  name: string;
  description?: string;
  prepTime?: number; // In minutes
  cookTime?: number; // In minutes
  totalTime?: number; // In minutes
  servings?: number;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  author?: string;
  sourceUrl: string;
  yield?: string;
  cuisine?: string[];
  category?: string[];
  keywords?: string[];
  nutrition?: RecipeNutrition;
  isPartial: boolean; // Indicates if any required fields are missing
}

export interface RecipeNutrition {
  calories?: string;
  carbohydrateContent?: string;
  proteinContent?: string;
  fatContent?: string;
  fiberContent?: string;
  sugarContent?: string;
  sodiumContent?: string;
  [key: string]: string | undefined;
}

export interface ImporterResult {
  recipe: ParsedRecipe;
  errors?: string[];
  warnings?: string[];
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