import React from 'react';
import RecipeInputInterface from './components/RecipeInputInterface';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center">My Chef Recipe Input</h1>
        <RecipeInputInterface />
        <Toaster />
      </div>
    </div>
  );
}

export default App;