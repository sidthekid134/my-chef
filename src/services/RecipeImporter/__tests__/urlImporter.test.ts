import { validateParsedRecipe, getMissingFields } from '../urlImporter';
import { ParsedRecipe } from '../../../types';

describe('validateParsedRecipe', () => {
  it('should return no errors for a valid recipe', () => {
    const recipe: ParsedRecipe = {
      name: 'Test Recipe',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: ['Step 1', 'Step 2'],
      sourceUrl: 'https://example.com',
      isPartial: false
    };

    const errors = validateParsedRecipe(recipe);
    expect(errors).toHaveLength(0);
  });

  it('should return errors for a recipe with missing required fields', () => {
    const recipe: ParsedRecipe = {
      name: 'Untitled Recipe',
      ingredients: [],
      instructions: [],
      sourceUrl: 'https://example.com',
      isPartial: true
    };

    const errors = validateParsedRecipe(recipe);
    expect(errors).toHaveLength(3);
    expect(errors).toContain('Recipe name is missing.');
    expect(errors).toContain('Recipe ingredients are missing.');
    expect(errors).toContain('Recipe instructions are missing.');
  });

  it('should identify only specific missing fields', () => {
    const recipe: ParsedRecipe = {
      name: 'Test Recipe',
      ingredients: ['Ingredient 1'],
      instructions: [],
      sourceUrl: 'https://example.com',
      isPartial: true
    };

    const errors = validateParsedRecipe(recipe);
    expect(errors).toHaveLength(1);
    expect(errors).toContain('Recipe instructions are missing.');
  });
});

describe('getMissingFields', () => {
  it('should identify all missing fields', () => {
    const recipe: ParsedRecipe = {
      name: 'Untitled Recipe',
      ingredients: [],
      instructions: [],
      sourceUrl: 'https://example.com',
      isPartial: true
    };

    const { missingRequired, missingOptional } = getMissingFields(recipe);

    expect(missingRequired).toContain('name');
    expect(missingRequired).toContain('ingredients');
    expect(missingRequired).toContain('instructions');

    expect(missingOptional).toContain('description');
    expect(missingOptional).toContain('preparation time');
    expect(missingOptional).toContain('cooking time');
    expect(missingOptional).toContain('servings/yield');
    expect(missingOptional).toContain('image');
  });

  it('should return empty arrays for a complete recipe', () => {
    const recipe: ParsedRecipe = {
      name: 'Test Recipe',
      description: 'Test description',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: ['Step 1', 'Step 2'],
      imageUrl: 'https://example.com/image.jpg',
      sourceUrl: 'https://example.com',
      isPartial: false
    };

    const { missingRequired, missingOptional } = getMissingFields(recipe);
    expect(missingRequired).toHaveLength(0);
    expect(missingOptional).toHaveLength(0);
  });

  it('should handle yield instead of servings', () => {
    const recipe: ParsedRecipe = {
      name: 'Test Recipe',
      description: 'Test description',
      prepTime: 10,
      cookTime: 20,
      yield: '4 servings',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: ['Step 1', 'Step 2'],
      imageUrl: 'https://example.com/image.jpg',
      sourceUrl: 'https://example.com',
      isPartial: false
    };

    const { missingRequired, missingOptional } = getMissingFields(recipe);
    expect(missingRequired).toHaveLength(0);
    expect(missingOptional).toHaveLength(0);
    // Should not include servings/yield in missing fields since we have yield
    expect(missingOptional).not.toContain('servings/yield');
  });
});