import React, { useState, FormEvent } from 'react';
import { z } from 'zod';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Toaster } from './ui/toaster';

// Schema for validation
const linkSchema = z.string().url('Please enter a valid URL');
const nameSchema = z.string().min(3, 'Recipe name must be at least 3 characters');
const textSchema = z.string().min(20, 'Recipe text must be at least 20 characters');

const RecipeInputInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('link');
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Clear errors when changing tabs
    setErrors({});
  };

  const validateAndSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate based on active tab
      switch (activeTab) {
        case 'link':
          linkSchema.parse(link);
          break;
        case 'name':
          nameSchema.parse(name);
          break;
        case 'text':
          textSchema.parse(text);
          break;
      }

      // If validation passes, clear errors
      setErrors({});
      
      // In a real app, you would submit the data to your backend here
      toast({
        title: "Recipe added successfully!",
        description: "Your recipe has been added to your collection.",
      });
      
      // Clear inputs after submission
      if (activeTab === 'link') setLink('');
      if (activeTab === 'name') setName('');
      if (activeTab === 'text') setText('');
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (activeTab === 'link') newErrors.link = err.message;
          if (activeTab === 'name') newErrors.name = err.message;
          if (activeTab === 'text') newErrors.text = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-card rounded-lg shadow-md">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Add a New Recipe</h2>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full flex mb-6">
            <TabsTrigger value="link" className="flex-1 py-3 text-base">
              Recipe URL
            </TabsTrigger>
            <TabsTrigger value="name" className="flex-1 py-3 text-base">
              Recipe Name
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1 py-3 text-base">
              Paste Recipe
            </TabsTrigger>
          </TabsList>

          <form onSubmit={validateAndSubmit}>
            <TabsContent value="link" className="focus:outline-none">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-url" className="text-base">
                    Recipe URL
                  </Label>
                  <Input
                    id="recipe-url"
                    placeholder="https://example.com/recipe"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className={`h-12 text-base ${errors.link ? 'border-destructive' : ''}`}
                  />
                  {errors.link && (
                    <p className="text-destructive text-sm mt-1">{errors.link}</p>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm">
                  Enter the URL of a recipe you'd like to import.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="name" className="focus:outline-none">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-name" className="text-base">
                    Recipe Name
                  </Label>
                  <Input
                    id="recipe-name"
                    placeholder="Grandma's Apple Pie"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`h-12 text-base ${errors.name ? 'border-destructive' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm">
                  Enter a recipe name to search our database.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="text" className="focus:outline-none">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-text" className="text-base">
                    Recipe Text
                  </Label>
                  <Textarea
                    id="recipe-text"
                    placeholder="Paste your recipe here, including ingredients and instructions..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={`min-h-[200px] text-base p-4 ${errors.text ? 'border-destructive' : ''}`}
                  />
                  {errors.text && (
                    <p className="text-destructive text-sm mt-1">{errors.text}</p>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm">
                  Copy and paste a complete recipe from anywhere.
                </p>
              </div>
            </TabsContent>

            <div className="mt-6">
              <Button type="submit" className="w-full h-12 text-base">
                Add Recipe
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
};

export default RecipeInputInterface;