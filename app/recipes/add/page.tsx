import { AddRecipeFlow } from '../../../features/recipes/AddRecipeFlow';

export default function AddRecipePage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Recipe</h1>
        <p className="text-gray-600">Create a new recipe by URL, text, or generate one from a dish name</p>
      </div>
      
      <AddRecipeFlow />
    </main>
  );
}