'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Toast } from '@/components/ui/toast';
import { useToastStore } from '@/lib/store';

// Mock function to fetch recipe by ID
async function fetchRecipe(id: string): Promise<Recipe | null> {
  // This will be replaced with actual API call
  // For now, simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock data for display
      resolve({
        id,
        title: `Recipe ${id}`,
        servings: "2-3",
        totalTimeMinutes: 30,
        activeTimeMinutes: 25,
        passiveTimeMinutes: 5,
        metadata: {
          cuisine: "Sample Cuisine",
          dishType: "Sample Dish",
          difficultyLevel: "Easy"
        },
        ingredients: [
          { name: "Ingredient 1", quantity: "1 cup", type: "main" },
          { name: "Ingredient 2", quantity: "2 tbsp", type: "seasoning" },
        ],
        steps: [
          {
            stepNumber: 1,
            title: "First Step",
            equipmentNeeded: ["Bowl", "Spoon"],
            instructions: "Mix ingredients together",
            ingredientsUsed: [
              { name: "Ingredient 1", quantity: "1 cup", type: "main" },
              { name: "Ingredient 2", quantity: "2 tbsp", type: "seasoning" },
            ],
            estimatedTimeMinutes: 10,
            definitionOfDone: "Ingredients are mixed well"
          }
        ],
        allEquipmentNeeded: ["Bowl", "Spoon"]
      });
    }, 1000);
  });
}

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToastStore();
  
  // Use TanStack Query to fetch recipe data
  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipe(id),
  });

  useEffect(() => {
    if (isError) {
      showToast('Failed to load recipe', 'error');
    }
  }, [isError, showToast]);

  const handleBackToDashboard = () => {
    router.push('/');
  };

  return (
    <>
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8 gap-4">
          <Button variant="outline" size="icon" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isLoading ? (
            <h1 className="text-3xl font-bold">Loading Recipe...</h1>
          ) : (
            <h1 className="text-3xl font-bold">{recipe?.title || 'Recipe Not Found'}</h1>
          )}
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {isError && (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Recipe not found</h3>
            <p className="text-muted-foreground mb-6">There was an error fetching this recipe.</p>
            <Button variant="outline" onClick={handleBackToDashboard}>
              Return to Dashboard
            </Button>
          </div>
        )}
        
        {!isLoading && !isError && recipe && (
          <div className="bg-card rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p>A delicious {recipe.metadata.cuisine} {recipe.metadata.dishType} that serves {recipe.servings}.</p>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                    <ul className="list-disc pl-5 space-y-1">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.quantity} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Instructions</h2>
                    <div className="space-y-4">
                      {recipe.steps.map((step) => (
                        <div key={step.stepNumber} className="border-l-2 border-primary pl-4 py-1">
                          <h3 className="font-medium">{step.stepNumber}. {step.title}</h3>
                          <p className="text-muted-foreground mt-1">{step.instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="bg-muted rounded-lg p-4 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4">Recipe Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Difficulty</h3>
                      <p>{recipe.metadata.difficultyLevel}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Total Time</h3>
                      <p>{recipe.totalTimeMinutes} minutes</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Servings</h3>
                      <p>{recipe.servings}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Equipment Needed</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {recipe.allEquipmentNeeded.map((equipment, index) => (
                          <li key={index}>{equipment}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast />
    </>
  );
}