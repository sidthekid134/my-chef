'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Recipe } from '@/types/recipe';
import { Clock, ChefHat } from 'lucide-react';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
          <CardDescription>
            {recipe.metadata.cuisine} · {recipe.metadata.dishType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="line-clamp-3 text-sm text-muted-foreground mb-3">
            {recipe.steps.length > 0 && recipe.steps[0].instructions.substring(0, 150)}
            {recipe.steps.length > 0 && recipe.steps[0].instructions.length > 150 && '...'}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>{recipe.metadata.difficultyLevel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(recipe.totalTimeMinutes / 60)}h {recipe.totalTimeMinutes % 60}m</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <div>{recipe.servings}</div>
        </CardFooter>
      </Card>
    </Link>
  );
}