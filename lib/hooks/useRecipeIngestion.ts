'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useNotificationStore } from '../../store/notificationStore';
import { Recipe } from '../../types/recipe';
import { ProviderType } from '../llm/LLMService';

// Response type from the API
interface ApiResponse {
  success: boolean;
  data?: Recipe;
  message?: string;
  errors?: Array<{ message: string }>;
}

// Shared options for the LLM provider
interface ProviderOptions {
  provider?: ProviderType;
  temperature?: number;
}

// URL ingestion inputs
export interface UrlIngestionInput extends ProviderOptions {
  url: string;
}

// Text ingestion inputs
export interface TextIngestionInput extends ProviderOptions {
  text: string;
}

// Generation inputs
export interface GenerationInput extends ProviderOptions {
  dishName: string;
}

// API client functions for recipe ingestion
const recipeIngestionApi = {
  // URL-based ingestion
  async ingestFromUrl(input: UrlIngestionInput): Promise<Recipe> {
    const response = await fetch('/api/v1/recipes/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    const result: ApiResponse = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to ingest recipe from URL');
    }
    
    return result.data as Recipe;
  },
  
  // Text-based ingestion
  async ingestFromText(input: TextIngestionInput): Promise<Recipe> {
    const response = await fetch('/api/v1/recipes/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    const result: ApiResponse = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to ingest recipe from text');
    }
    
    return result.data as Recipe;
  },
  
  // Generation from dish name
  async generateFromDishName(input: GenerationInput): Promise<Recipe> {
    const response = await fetch('/api/v1/recipes/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    const result: ApiResponse = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to generate recipe');
    }
    
    return result.data as Recipe;
  },
};

// Hook for URL-based ingestion
export function useUrlIngestionMutation() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  
  return useMutation({
    mutationFn: recipeIngestionApi.ingestFromUrl,
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        message: `Successfully created recipe: ${data.title}`,
      });
      
      // Redirect to the edit page for the new recipe
      router.push(`/recipes/${data.id}/edit`);
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to create recipe from URL',
      });
    },
  });
}

// Hook for text-based ingestion
export function useTextIngestionMutation() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  
  return useMutation({
    mutationFn: recipeIngestionApi.ingestFromText,
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        message: `Successfully created recipe: ${data.title}`,
      });
      
      // Redirect to the edit page for the new recipe
      router.push(`/recipes/${data.id}/edit`);
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to create recipe from text',
      });
    },
  });
}

// Hook for generation from dish name
export function useGenerationMutation() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  
  return useMutation({
    mutationFn: recipeIngestionApi.generateFromDishName,
    onSuccess: (data) => {
      addNotification({
        type: 'success',
        message: `Successfully generated recipe: ${data.title}`,
      });
      
      // Redirect to the edit page for the new recipe
      router.push(`/recipes/${data.id}/edit`);
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message || 'Failed to generate recipe',
      });
    },
  });
}