'use client';

import React from 'react';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, Users } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(recipe);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div 
      onClick={handleClick}
      className="flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition-all cursor-pointer"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{recipe.title}</h3>
            <p className="text-sm text-muted-foreground">{recipe.metadata.cuisine} · {recipe.metadata.dishType}</p>
          </div>
          <div className="bg-primary/10 text-primary text-xs font-medium rounded-full px-2.5 py-0.5">
            {recipe.metadata.difficultyLevel}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(recipe.totalTimeMinutes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="h-4 w-4" />
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
        </div>
        
        <div className="mt-6 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">View</Button>
          <Button size="sm" className="flex-1">Cook</Button>
        </div>
      </div>
    </div>
  );
}