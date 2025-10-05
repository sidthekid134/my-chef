'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Tabs, TabsList, TabTrigger, TabsContent } from '../../components/ui/tabs';
import { useUrlIngestionMutation, useTextIngestionMutation, useGenerationMutation } from '../../lib/hooks/useRecipeIngestion';

export function AddRecipeFlow() {
  // State for form inputs
  const [url, setUrl] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [dishName, setDishName] = useState('');
  
  // Loading states
  const urlIngestion = useUrlIngestionMutation();
  const textIngestion = useTextIngestionMutation();
  const generateIngestion = useGenerationMutation();
  
  // Common loading state for UI
  const isLoading = urlIngestion.isPending || textIngestion.isPending || generateIngestion.isPending;
  
  // Submit handlers
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      urlIngestion.mutate({ url });
    }
  };
  
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipeText.trim()) {
      textIngestion.mutate({ text: recipeText });
    }
  };
  
  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishName.trim()) {
      generateIngestion.mutate({ dishName });
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Add New Recipe</h2>
        
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="mb-4">
            <TabTrigger value="url">From URL</TabTrigger>
            <TabTrigger value="text">From Text</TabTrigger>
            <TabTrigger value="generate">By Name</TabTrigger>
          </TabsList>
          
          {/* URL Tab */}
          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe URL
                </label>
                <input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/recipe"
                  required
                  disabled={isLoading}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Paste the URL of a recipe you want to import
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Import Recipe from URL'}
              </Button>
            </form>
          </TabsContent>
          
          {/* Text Tab */}
          <TabsContent value="text">
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div>
                <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe Text
                </label>
                <textarea
                  id="text-input"
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  placeholder="Paste your recipe text here..."
                  required
                  disabled={isLoading}
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Paste the complete text of a recipe you want to import
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || recipeText.length < 50}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Create Recipe from Text'}
              </Button>
            </form>
          </TabsContent>
          
          {/* Generate Tab */}
          <TabsContent value="generate">
            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Dish Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g., Chocolate Chip Cookies"
                  required
                  disabled={isLoading}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the name of a dish you want to generate a recipe for
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !dishName.trim() || dishName.length < 3}
                className="w-full"
              >
                {isLoading ? 'Generating...' : 'Generate Recipe'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}