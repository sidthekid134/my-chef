'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import { RecipeCardSkeleton } from './RecipeCardSkeleton';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';

// Mock data for initial development
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Spaghetti Carbonara",
    servings: "2-3",
    totalTimeMinutes: 30,
    activeTimeMinutes: 25,
    passiveTimeMinutes: 5,
    metadata: {
      cuisine: "Italian",
      dishType: "Main Course",
      difficultyLevel: "Easy"
    },
    ingredients: [
      { name: "Spaghetti", quantity: "200g", type: "pasta" },
      { name: "Pancetta", quantity: "100g", type: "meat" },
      { name: "Eggs", quantity: "2 large", type: "dairy" },
      { name: "Parmesan Cheese", quantity: "50g", type: "dairy" },
      { name: "Black Pepper", quantity: "to taste", type: "spice" },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Prepare Ingredients",
        equipmentNeeded: ["Cutting Board", "Knife"],
        instructions: "Cut pancetta into small cubes. Grate parmesan cheese. Beat eggs in a bowl and mix with grated cheese.",
        ingredientsUsed: [
          { name: "Pancetta", quantity: "100g", type: "meat" },
          { name: "Eggs", quantity: "2 large", type: "dairy" },
          { name: "Parmesan Cheese", quantity: "50g", type: "dairy" },
        ],
        estimatedTimeMinutes: 10,
        definitionOfDone: "Pancetta is cubed, cheese is grated, and egg mixture is ready."
      },
      {
        stepNumber: 2,
        title: "Cook Pasta",
        equipmentNeeded: ["Large Pot", "Colander"],
        instructions: "Bring a large pot of salted water to a boil. Cook spaghetti according to package instructions until al dente.",
        ingredientsUsed: [
          { name: "Spaghetti", quantity: "200g", type: "pasta" },
        ],
        estimatedTimeMinutes: 10,
        definitionOfDone: "Pasta is cooked al dente."
      },
      {
        stepNumber: 3,
        title: "Cook Pancetta",
        equipmentNeeded: ["Large Pan"],
        instructions: "While the pasta is cooking, sauté the pancetta in a large pan until crispy.",
        ingredientsUsed: [
          { name: "Pancetta", quantity: "100g", type: "meat" },
        ],
        estimatedTimeMinutes: 5,
        definitionOfDone: "Pancetta is crispy."
      },
      {
        stepNumber: 4,
        title: "Combine and Serve",
        equipmentNeeded: ["Tongs", "Serving Dish"],
        instructions: "Drain pasta and immediately add to the pan with pancetta. Remove from heat and quickly stir in the egg and cheese mixture. The heat from the pasta will cook the eggs. Add black pepper to taste and serve immediately.",
        ingredientsUsed: [
          { name: "Black Pepper", quantity: "to taste", type: "spice" },
        ],
        estimatedTimeMinutes: 5,
        definitionOfDone: "Pasta is coated with creamy sauce and served hot."
      }
    ],
    allEquipmentNeeded: ["Cutting Board", "Knife", "Large Pot", "Colander", "Large Pan", "Tongs", "Serving Dish"]
  },
  {
    id: "2",
    title: "Avocado Toast",
    servings: "1",
    totalTimeMinutes: 15,
    activeTimeMinutes: 15,
    passiveTimeMinutes: null,
    metadata: {
      cuisine: "Modern",
      dishType: "Breakfast",
      difficultyLevel: "Easy"
    },
    ingredients: [
      { name: "Bread", quantity: "1 slice", type: "grain" },
      { name: "Avocado", quantity: "1/2", type: "fruit" },
      { name: "Lemon Juice", quantity: "1 tsp", type: "condiment" },
      { name: "Salt", quantity: "to taste", type: "spice" },
      { name: "Red Pepper Flakes", quantity: "to taste", type: "spice" },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Toast Bread",
        equipmentNeeded: ["Toaster"],
        instructions: "Toast the bread slice to desired crispness.",
        ingredientsUsed: [
          { name: "Bread", quantity: "1 slice", type: "grain" },
        ],
        estimatedTimeMinutes: 5,
        definitionOfDone: "Bread is toasted to golden brown."
      },
      {
        stepNumber: 2,
        title: "Prepare Avocado",
        equipmentNeeded: ["Bowl", "Fork"],
        instructions: "Cut avocado in half, remove the pit, and scoop the flesh into a bowl. Add lemon juice and mash with a fork to desired consistency.",
        ingredientsUsed: [
          { name: "Avocado", quantity: "1/2", type: "fruit" },
          { name: "Lemon Juice", quantity: "1 tsp", type: "condiment" },
        ],
        estimatedTimeMinutes: 5,
        definitionOfDone: "Avocado is mashed with lemon juice."
      },
      {
        stepNumber: 3,
        title: "Assemble and Serve",
        equipmentNeeded: ["Knife", "Plate"],
        instructions: "Spread the mashed avocado on the toast. Sprinkle with salt and red pepper flakes. Serve immediately.",
        ingredientsUsed: [
          { name: "Salt", quantity: "to taste", type: "spice" },
          { name: "Red Pepper Flakes", quantity: "to taste", type: "spice" },
        ],
        estimatedTimeMinutes: 5,
        definitionOfDone: "Toast is topped with avocado spread and seasonings."
      }
    ],
    allEquipmentNeeded: ["Toaster", "Bowl", "Fork", "Knife", "Plate"]
  }
];

// Function to fetch recipes from the API
async function fetchRecipes(): Promise<Recipe[]> {
  // This will be replaced with actual API call once the endpoint is ready
  // For now, return mock data after a short delay to simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRecipes);
    }, 1000);
  });
}

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  
  // Use TanStack Query to fetch recipes
  const { data: recipes, isLoading, isError } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  // Filter recipes based on search term and selected cuisine
  const filteredRecipes = recipes?.filter(recipe => {
    const matchesSearch = searchTerm === "" || recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine = selectedCuisine === null || recipe.metadata.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  // Navigate to Add Recipe page
  const handleAddRecipe = () => {
    // This will be implemented in future stories
    window.location.href = "/recipes/new";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recipe Dashboard</h1>
        <Button onClick={handleAddRecipe} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Recipe
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}
      
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Failed to load recipes</h3>
          <p className="text-muted-foreground mb-6">There was an error fetching the recipe data. Please try again later.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}
      
      {!isLoading && !isError && filteredRecipes?.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground mb-6">No recipes match your search criteria. Try a different search term or add a new recipe.</p>
          <Button onClick={handleAddRecipe}>Add Recipe</Button>
        </div>
      )}
      
      {!isLoading && !isError && filteredRecipes && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={(recipe) => window.location.href = `/recipes/${recipe.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}