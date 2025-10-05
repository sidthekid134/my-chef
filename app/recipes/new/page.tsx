'use client';

import { AddRecipeFlow } from '@/src/features/recipes/AddRecipeFlow';
import { Toast } from '@/components/ui/toast';

export default function NewRecipePage() {
  return (
    <>
      <AddRecipeFlow />
      <Toast />
    </>
  );
}