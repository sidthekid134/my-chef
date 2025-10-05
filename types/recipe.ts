// This is a placeholder for the Recipe schema that will be implemented in a future story
// The actual implementation will include TypeScript interfaces and Zod schemas

export interface RecipeBase {
  title: string;
  description: string;
  // Will be expanded in future implementation
}

export interface Recipe extends RecipeBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}