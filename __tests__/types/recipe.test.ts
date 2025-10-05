import { describe, it, expect } from 'jest';
import { 
  RecipeSchema, 
  validateRecipe, 
  parseRecipeInput, 
  serializeRecipe 
} from '../../types/recipe';
import { z } from 'zod';

describe('Recipe Schema', () => {
  const validRecipe = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Spaghetti Carbonara',
    servings: '4',
    totalTimeMinutes: 30,
    activeTimeMinutes: 25,
    passiveTimeMinutes: 5,
    metadata: {
      cuisine: 'Italian',
      dishType: 'Main Course',
      difficultyLevel: 'Medium',
    },
    ingredients: [
      {
        name: 'Spaghetti',
        quantity: '400g',
        type: 'pasta',
      },
      {
        name: 'Pancetta',
        quantity: '150g',
        type: 'meat',
      },
      {
        name: 'Egg',
        quantity: '3',
        type: 'dairy',
      },
      {
        name: 'Parmesan Cheese',
        quantity: '50g',
        type: 'dairy',
      },
      {
        name: 'Black Pepper',
        quantity: '2 tsp',
        type: 'spice',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Prepare Ingredients',
        equipmentNeeded: ['Cutting Board', 'Knife'],
        instructions: 'Dice the pancetta into small cubes. Grate the parmesan cheese. Beat the eggs in a bowl and add half the cheese.',
        ingredientsUsed: [
          {
            name: 'Pancetta',
            quantity: '150g',
            type: 'meat',
          },
          {
            name: 'Parmesan Cheese',
            quantity: '50g',
            type: 'dairy',
          },
          {
            name: 'Egg',
            quantity: '3',
            type: 'dairy',
          },
        ],
        estimatedTimeMinutes: 10,
        definitionOfDone: 'All ingredients are prepared and ready for cooking.',
      },
      {
        stepNumber: 2,
        title: 'Cook Pasta',
        equipmentNeeded: ['Large Pot', 'Strainer'],
        instructions: 'Bring a large pot of salted water to boil. Cook spaghetti according to package instructions until al dente.',
        ingredientsUsed: [
          {
            name: 'Spaghetti',
            quantity: '400g',
            type: 'pasta',
          },
        ],
        estimatedTimeMinutes: 12,
        definitionOfDone: 'Pasta is cooked al dente and drained.',
      },
      {
        stepNumber: 3,
        title: 'Cook Pancetta',
        equipmentNeeded: ['Large Frying Pan'],
        instructions: 'While pasta is cooking, fry pancetta in a large pan until crispy.',
        ingredientsUsed: [
          {
            name: 'Pancetta',
            quantity: '150g',
            type: 'meat',
          },
        ],
        estimatedTimeMinutes: 8,
        definitionOfDone: 'Pancetta is golden and crispy.',
      },
      {
        stepNumber: 4,
        title: 'Combine Everything',
        equipmentNeeded: ['Tongs', 'Large Bowl'],
        instructions: 'Drain pasta, reserving some cooking water. Add pasta to pancetta, then remove from heat and quickly stir in egg mixture, adding cooking water as needed to create a creamy sauce. Season with black pepper.',
        ingredientsUsed: [
          {
            name: 'Spaghetti',
            quantity: '400g',
            type: 'pasta',
          },
          {
            name: 'Pancetta',
            quantity: '150g',
            type: 'meat',
          },
          {
            name: 'Egg',
            quantity: '3',
            type: 'dairy',
          },
          {
            name: 'Parmesan Cheese',
            quantity: '25g',
            type: 'dairy',
          },
          {
            name: 'Black Pepper',
            quantity: '2 tsp',
            type: 'spice',
          },
        ],
        estimatedTimeMinutes: 5,
        definitionOfDone: 'Sauce is creamy and coats pasta evenly.',
      },
    ],
    allEquipmentNeeded: [
      'Cutting Board',
      'Knife',
      'Large Pot',
      'Strainer',
      'Large Frying Pan',
      'Tongs',
      'Large Bowl',
    ],
  };

  const invalidRecipe = {
    // Missing required fields
    title: 'Spaghetti Carbonara',
    servings: '4',
    // totalTimeMinutes is missing
    ingredients: [],
    // steps is missing
  };

  it('should successfully validate a valid recipe', () => {
    const result = validateRecipe(validRecipe);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should fail validation for an invalid recipe', () => {
    const result = validateRecipe(invalidRecipe);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should throw ZodError when parsing invalid recipe input', () => {
    expect(() => parseRecipeInput(invalidRecipe)).toThrow(z.ZodError);
  });

  it('should successfully parse a valid recipe input', () => {
    const parsed = parseRecipeInput(validRecipe);
    expect(parsed).toEqual(validRecipe);
  });

  it('should correctly serialize a recipe object', () => {
    const serialized = serializeRecipe(validRecipe);
    expect(serialized).toEqual(validRecipe);
  });

  it('should validate all required fields correctly', () => {
    // Test each required field by removing it and checking that validation fails
    const requiredFields = ['id', 'title', 'servings', 'totalTimeMinutes', 'metadata', 'ingredients', 'steps'];
    
    for (const field of requiredFields) {
      const invalidRecipeWithMissingField = { ...validRecipe };
      delete invalidRecipeWithMissingField[field as keyof typeof validRecipe];
      
      expect(() => RecipeSchema.parse(invalidRecipeWithMissingField)).toThrow();
    }
  });

  it('should accept null for optional time fields', () => {
    const recipeWithNullTimes = {
      ...validRecipe,
      activeTimeMinutes: null,
      passiveTimeMinutes: null,
    };
    
    expect(() => RecipeSchema.parse(recipeWithNullTimes)).not.toThrow();
  });
});