'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToastStore, useRecipeStore } from '@/lib/store';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Loader2 } from 'lucide-react';

// URL Schema
const urlSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL' }),
});
type UrlFormValues = z.infer<typeof urlSchema>;

// Text Schema
const textSchema = z.object({
  text: z.string().min(10, { message: 'Recipe text must be at least 10 characters' }),
});
type TextFormValues = z.infer<typeof textSchema>;

// Name Schema
const nameSchema = z.object({
  name: z.string().min(3, { message: 'Recipe name must be at least 3 characters' }),
  cuisine: z.string().min(1, { message: 'Cuisine is required' }),
  dishType: z.string().min(1, { message: 'Dish type is required' }),
});
type NameFormValues = z.infer<typeof nameSchema>;

// API interfaces
async function ingestRecipeByUrl(data: { url: string }): Promise<{ id: string }> {
  const response = await fetch('/api/v1/recipes/url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to ingest recipe from URL');
  }

  return response.json();
}

async function ingestRecipeByText(data: { text: string }): Promise<{ id: string }> {
  const response = await fetch('/api/v1/recipes/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to ingest recipe from text');
  }

  return response.json();
}

async function generateRecipeByName(data: { name: string; cuisine: string; dishType: string }): Promise<{ id: string }> {
  const response = await fetch('/api/v1/recipes/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate recipe');
  }

  return response.json();
}

export function AddRecipeFlow() {
  const [activeTab, setActiveTab] = useState('url');
  const router = useRouter();
  const { showToast } = useToastStore();
  const { setNewRecipeId } = useRecipeStore();

  // URL Form
  const urlForm = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: '',
    },
  });

  // Text Form
  const textForm = useForm<TextFormValues>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      text: '',
    },
  });

  // Name Form
  const nameForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: '',
      cuisine: '',
      dishType: '',
    },
  });

  // URL mutation
  const urlMutation = useMutation({
    mutationFn: ingestRecipeByUrl,
    onSuccess: (data) => {
      showToast('Recipe successfully ingested from URL', 'success');
      setNewRecipeId(data.id);
      router.push(`/recipes/${data.id}`);
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  // Text mutation
  const textMutation = useMutation({
    mutationFn: ingestRecipeByText,
    onSuccess: (data) => {
      showToast('Recipe successfully ingested from text', 'success');
      setNewRecipeId(data.id);
      router.push(`/recipes/${data.id}`);
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  // Name mutation
  const nameMutation = useMutation({
    mutationFn: generateRecipeByName,
    onSuccess: (data) => {
      showToast('Recipe successfully generated', 'success');
      setNewRecipeId(data.id);
      router.push(`/recipes/${data.id}`);
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  // Form submit handlers
  const onUrlSubmit = (data: UrlFormValues) => {
    urlMutation.mutate(data);
  };

  const onTextSubmit = (data: TextFormValues) => {
    textMutation.mutate(data);
  };

  const onNameSubmit = (data: NameFormValues) => {
    nameMutation.mutate(data);
  };

  const handleBackToDashboard = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="flex items-center mb-8 gap-4">
        <Button variant="outline" size="icon" onClick={handleBackToDashboard}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Add Recipe</h1>
      </div>
      
      <div className="bg-card border rounded-lg shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-t-lg grid grid-cols-3">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="name">Name</TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            <TabsContent value="url">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Add Recipe from URL</h3>
                <p className="text-muted-foreground text-sm">Paste a URL to a recipe from the web</p>
              </div>
              
              <Form {...urlForm}>
                <form onSubmit={urlForm.handleSubmit(onUrlSubmit)} className="space-y-4">
                  <FormField
                    control={urlForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/my-favorite-recipe" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={urlMutation.isPending}
                  >
                    {urlMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Import Recipe
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="text">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Add Recipe from Text</h3>
                <p className="text-muted-foreground text-sm">Paste in recipe text and we'll parse it</p>
              </div>
              
              <Form {...textForm}>
                <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-4">
                  <FormField
                    control={textForm.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste your recipe here..." 
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={textMutation.isPending}
                  >
                    {textMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Parse Recipe
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="name">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Generate Recipe by Name</h3>
                <p className="text-muted-foreground text-sm">Describe the recipe you want and we'll generate it</p>
              </div>
              
              <Form {...nameForm}>
                <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
                  <FormField
                    control={nameForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Spicy Thai Basil Chicken" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={nameForm.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuisine Type</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Thai, Italian, Mexican, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={nameForm.control}
                    name="dishType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dish Type</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Main Course, Dessert, Appetizer, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={nameMutation.isPending}
                  >
                    {nameMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate Recipe
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}