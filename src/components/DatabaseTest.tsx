import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { recipeRepository, RecipeWithDetails } from '../data';

/**
 * Test component to verify database operations
 * This component demonstrates CRUD operations for recipes
 */
export default function DatabaseTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Add a log message to the test results
  const log = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  // Run test cases for recipe operations
  const runTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setTestResults([]);

    try {
      log('Starting database tests...');

      // Create a sample recipe
      const sampleRecipe: RecipeWithDetails = {
        title: 'Test Spaghetti Carbonara',
        description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
        servings: 2,
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
        imageUrl: 'https://example.com/carbonara.jpg',
        sourceUrl: 'https://example.com/recipes/carbonara',
        ingredients: [
          {
            recipeId: 0, // Will be set by DAO
            name: 'Spaghetti',
            quantity: 200,
            unit: 'g',
            notes: 'Use high quality pasta',
            order: 0
          },
          {
            recipeId: 0,
            name: 'Eggs',
            quantity: 2,
            unit: 'whole',
            order: 1
          },
          {
            recipeId: 0,
            name: 'Pecorino Romano',
            quantity: 50,
            unit: 'g',
            notes: 'Freshly grated',
            order: 2
          },
          {
            recipeId: 0,
            name: 'Pancetta',
            quantity: 100,
            unit: 'g',
            notes: 'Diced',
            order: 3
          },
          {
            recipeId: 0,
            name: 'Black Pepper',
            quantity: 2,
            unit: 'tsp',
            order: 4
          }
        ],
        steps: [
          {
            recipeId: 0,
            description: 'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
            order: 0
          },
          {
            recipeId: 0,
            description: 'In a large bowl, whisk eggs and grated cheese together. Set aside.',
            order: 1
          },
          {
            recipeId: 0,
            description: 'Cook pancetta in a large skillet over medium heat until crispy, about 5 minutes.',
            order: 2
          },
          {
            recipeId: 0,
            description: 'Drain pasta, reserving some pasta water, and add to the skillet with pancetta.',
            order: 3
          },
          {
            recipeId: 0,
            description: 'Remove from heat and quickly stir in the egg mixture, adding pasta water as needed to create a creamy sauce.',
            order: 4
          },
          {
            recipeId: 0,
            description: 'Season with freshly ground black pepper and serve immediately.',
            order: 5
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Test creating a recipe
      log('1. Creating a test recipe...');
      const createdRecipe = await recipeRepository.createRecipe(sampleRecipe);
      log(`Recipe created with ID: ${createdRecipe.id}`);
      log(`Recipe has ${createdRecipe.ingredients.length} ingredients and ${createdRecipe.steps.length} steps`);

      // 2. Test fetching recipes
      log('\n2. Fetching all recipes...');
      const recipesResult = await recipeRepository.getRecipes();
      log(`Found ${recipesResult.recipes.length} recipes (total: ${recipesResult.pagination.total})`);

      // 3. Test fetching a single recipe by ID
      log('\n3. Fetching recipe by ID...');
      const fetchedRecipe = await recipeRepository.getRecipeById(createdRecipe.id!);
      log(`Fetched recipe: ${fetchedRecipe.title}`);

      // 4. Test updating a recipe
      log('\n4. Updating recipe...');
      fetchedRecipe.title = 'Updated: Spaghetti Carbonara';
      fetchedRecipe.prepTimeMinutes = 10;
      fetchedRecipe.ingredients[0].quantity = 250;

      const updatedRecipe = await recipeRepository.updateRecipe(fetchedRecipe);
      log(`Updated recipe title: ${updatedRecipe.title}`);
      log(`Updated pasta quantity: ${updatedRecipe.ingredients[0].quantity}g`);

      // 5. Test deleting a recipe
      log('\n5. Deleting recipe...');
      const deleteResult = await recipeRepository.deleteRecipe(updatedRecipe.id!);
      log(`Recipe deleted: ${deleteResult ? 'Success' : 'Failed'}`);

      // 6. Verify deletion
      log('\n6. Verifying recipe count after deletion...');
      const afterDeleteResult = await recipeRepository.getRecipes();
      log(`Recipe count after deletion: ${afterDeleteResult.pagination.total}`);

      log('\nAll tests completed successfully!');
    } catch (error) {
      log(`Error during tests: ${(error as Error).message}`);
      console.error('Test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Database Tests</Text>
      <Button
        title={isRunning ? 'Running...' : 'Run Tests'}
        onPress={runTests}
        disabled={isRunning}
      />
      <ScrollView style={styles.results}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.logItem}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  results: {
    flex: 1,
    marginTop: 16,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  logItem: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});