import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { RecipeImportForm } from '../../components/RecipeImport';
import { ParsedRecipe } from '../../types';

/**
 * Screen for importing recipes from URLs
 */
const ImportRecipeScreen: React.FC = () => {
  // Handle completion of the import process
  const handleImportComplete = (recipe: ParsedRecipe) => {
    // In a real implementation, you would save the recipe to your database
    // and navigate to the recipe details screen
    Alert.alert(
      'Recipe Imported',
      `Successfully imported "${recipe.name}" with ${recipe.ingredients.length} ingredients and ${recipe.instructions.length} steps.`,
      [
        {
          text: 'OK',
          // In a real implementation you would navigate to the recipe details screen
          // navigation.navigate('RecipeDetail', { recipeId: savedRecipe.id });
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <RecipeImportForm onComplete={handleImportComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ImportRecipeScreen;