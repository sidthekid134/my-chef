import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Button } from 'react-native';
import { importRecipeFromUrl, getMissingFields } from '../../services/RecipeImporter';
import { ParsedRecipe, ImporterResult } from '../../types';

interface RecipeImportFormProps {
  onComplete: (recipe: ParsedRecipe) => void;
}

/**
 * Component for importing a recipe from a URL and handling any manual completion needed
 */
const RecipeImportForm: React.FC<RecipeImportFormProps> = ({ onComplete }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<ParsedRecipe | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Handle URL import
  const handleImport = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setErrors([]);
      setWarnings([]);
      setRecipe(null);

      const result: ImporterResult = await importRecipeFromUrl(url);

      setRecipe(result.recipe);
      setErrors(result.errors || []);
      setWarnings(result.warnings || []);

      // If we have a complete recipe with no errors, proceed directly
      if (!result.recipe.isPartial && (!result.errors || result.errors.length === 0)) {
        onComplete(result.recipe);
      }
    } catch (error) {
      setErrors([`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  // Handle final submission after manual edits
  const handleSubmit = () => {
    if (recipe) {
      // Set isPartial to false since the user has manually completed it
      const finalRecipe = { ...recipe, isPartial: false };
      onComplete(finalRecipe);
    }
  };

  // Update a field in the recipe
  const updateRecipe = (field: keyof ParsedRecipe, value: any) => {
    if (recipe) {
      setRecipe({ ...recipe, [field]: value });
    }
  };

  // Update a specific ingredient
  const updateIngredient = (index: number, value: string) => {
    if (recipe) {
      const updatedIngredients = [...recipe.ingredients];
      updatedIngredients[index] = value;
      updateRecipe('ingredients', updatedIngredients);
    }
  };

  // Add a new ingredient
  const addIngredient = () => {
    if (recipe) {
      const updatedIngredients = [...recipe.ingredients, ''];
      updateRecipe('ingredients', updatedIngredients);
    }
  };

  // Remove an ingredient
  const removeIngredient = (index: number) => {
    if (recipe) {
      const updatedIngredients = [...recipe.ingredients];
      updatedIngredients.splice(index, 1);
      updateRecipe('ingredients', updatedIngredients);
    }
  };

  // Update a specific instruction
  const updateInstruction = (index: number, value: string) => {
    if (recipe) {
      const updatedInstructions = [...recipe.instructions];
      updatedInstructions[index] = value;
      updateRecipe('instructions', updatedInstructions);
    }
  };

  // Add a new instruction
  const addInstruction = () => {
    if (recipe) {
      const updatedInstructions = [...recipe.instructions, ''];
      updateRecipe('instructions', updatedInstructions);
    }
  };

  // Remove an instruction
  const removeInstruction = (index: number) => {
    if (recipe) {
      const updatedInstructions = [...recipe.instructions];
      updatedInstructions.splice(index, 1);
      updateRecipe('instructions', updatedInstructions);
    }
  };

  // Check if the recipe can be submitted
  const canSubmit = () => {
    if (!recipe) return false;
    return recipe.name && recipe.ingredients.length > 0 && recipe.instructions.length > 0;
  };

  // Render errors and warnings
  const renderMessages = () => {
    return (
      <>
        {errors.length > 0 && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Errors:</Text>
            {errors.map((error, index) => (
              <Text key={`error-${index}`} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {warnings.length > 0 && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Warnings:</Text>
            {warnings.map((warning, index) => (
              <Text key={`warning-${index}`} style={styles.warningText}>
                • {warning}
              </Text>
            ))}
          </View>
        )}
      </>
    );
  };

  // Render the manual completion form
  const renderManualCompletion = () => {
    if (!recipe) return null;

    const { missingRequired, missingOptional } = getMissingFields(recipe);

    return (
      <ScrollView style={styles.formContainer}>
        {renderMessages()}

        {missingRequired.length > 0 && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Missing Required Information:</Text>
            {missingRequired.map((field, index) => (
              <Text key={`missing-${index}`} style={styles.errorText}>
                • {field}
              </Text>
            ))}
          </View>
        )}

        {missingOptional.length > 0 && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>Missing Optional Information:</Text>
            {missingOptional.map((field, index) => (
              <Text key={`optional-${index}`} style={styles.warningText}>
                • {field}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Recipe Name*</Text>
          <TextInput
            style={styles.input}
            value={recipe.name}
            onChangeText={(text) => updateRecipe('name', text)}
            placeholder="Recipe Name"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={recipe.description || ''}
            onChangeText={(text) => updateRecipe('description', text)}
            placeholder="Description"
            multiline
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Prep Time (minutes)</Text>
          <TextInput
            style={styles.input}
            value={recipe.prepTime?.toString() || ''}
            onChangeText={(text) => updateRecipe('prepTime', text ? parseInt(text, 10) : undefined)}
            placeholder="Prep Time"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Cook Time (minutes)</Text>
          <TextInput
            style={styles.input}
            value={recipe.cookTime?.toString() || ''}
            onChangeText={(text) => updateRecipe('cookTime', text ? parseInt(text, 10) : undefined)}
            placeholder="Cook Time"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Servings</Text>
          <TextInput
            style={styles.input}
            value={recipe.servings?.toString() || ''}
            onChangeText={(text) => updateRecipe('servings', text ? parseInt(text, 10) : undefined)}
            placeholder="Servings"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={recipe.imageUrl || ''}
            onChangeText={(text) => updateRecipe('imageUrl', text)}
            placeholder="Image URL"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Ingredients*</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={`ingredient-${index}`} style={styles.listItemContainer}>
              <TextInput
                style={styles.listItemInput}
                value={ingredient}
                onChangeText={(text) => updateIngredient(index, text)}
                placeholder={`Ingredient ${index + 1}`}
              />
              <Button
                title="Remove"
                onPress={() => removeIngredient(index)}
                color="#ff6b6b"
              />
            </View>
          ))}
          <Button
            title="Add Ingredient"
            onPress={addIngredient}
            color="#4dabf7"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Instructions*</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={`instruction-${index}`} style={styles.listItemContainer}>
              <TextInput
                style={[styles.listItemInput, styles.textArea]}
                value={instruction}
                onChangeText={(text) => updateInstruction(index, text)}
                placeholder={`Step ${index + 1}`}
                multiline
              />
              <Button
                title="Remove"
                onPress={() => removeInstruction(index)}
                color="#ff6b6b"
              />
            </View>
          ))}
          <Button
            title="Add Instruction"
            onPress={addInstruction}
            color="#4dabf7"
          />
        </View>

        <View style={styles.submitButtonContainer}>
          <Button
            title="Save Recipe"
            onPress={handleSubmit}
            disabled={!canSubmit()}
            color="#20c997"
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.urlInputContainer}>
        <TextInput
          style={styles.urlInput}
          value={url}
          onChangeText={setUrl}
          placeholder="Enter recipe URL"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Button
          title="Import"
          onPress={handleImport}
          disabled={loading || !url}
          color="#339af0"
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#339af0" />
          <Text>Importing recipe...</Text>
        </View>
      )}

      {recipe && !loading && renderManualCompletion()}

      {!recipe && errors.length > 0 && !loading && renderMessages()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  urlInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  messageTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorText: {
    color: '#e03131',
  },
  warningText: {
    color: '#f59f00',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  submitButtonContainer: {
    marginVertical: 24,
  },
});

export default RecipeImportForm;