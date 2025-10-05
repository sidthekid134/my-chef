'use client';

import React from 'react';

export function RecipeCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-6 w-40 bg-muted rounded-md animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded-md mt-2 animate-pulse"></div>
          </div>
          <div className="h-5 w-16 bg-primary/10 rounded-full animate-pulse"></div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse"></div>
            <div className="h-4 w-12 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse"></div>
            <div className="h-4 w-10 bg-muted rounded-md animate-pulse"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-muted animate-pulse"></div>
            <div className="h-4 w-24 bg-muted rounded-md animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-2">
          <div className="h-9 flex-1 bg-muted rounded-md animate-pulse"></div>
          <div className="h-9 flex-1 bg-muted rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}