import { 
  RecipeSchema, 
  validateRecipe,
  safeValidateRecipe,
  parseRecipeInput,
  safeParseRecipeInput
} from '../recipe';
import type { Recipe } from '../../types/recipe';

describe('Recipe Schema Validation', () => {
  // Valid recipe fixture data matching all schema requirements
  const validRecipe: Recipe = {
    id: 'recipe-001',
    title: 'Spaghetti Carbonara',
    servings: '4',
    totalTimeMinutes: 30,
    activeTimeMinutes: 25,
    passiveTimeMinutes: 5,
    metadata: {
      cuisine: 'Italian',
      dishType: 'Main Course',
      difficultyLevel: 'Intermediate'
    },
    ingredients: [
      {
        name: 'Spaghetti',
        quantity: '400g',
        type: 'Pasta'
      },
      {
        name: 'Pancetta',
        quantity: '150g',
        type: 'Meat'
      },
      {
        name: 'Eggs',
        quantity: '3',
        type: 'Dairy'
      },
      {
        name: 'Parmesan Cheese',
        quantity: '50g',
        type: 'Dairy'
      },
      {
        name: 'Black Pepper',
        quantity: '1 tbsp',
        type: 'Spice'
      }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Prepare Ingredients',
        equipmentNeeded: ['Cutting board', 'Knife'],
        instructions: 'Dice the pancetta into small cubes. Grate the parmesan cheese. Beat the eggs in a bowl and mix with half the cheese.',
        ingredientsUsed: [
          {
            name: 'Pancetta',
            quantity: '150g',
            type: 'Meat'
          },
          {
            name: 'Parmesan Cheese',
            quantity: '50g',
            type: 'Dairy'
          },
          {
            name: 'Eggs',
            quantity: '3',
            type: 'Dairy'
          }
        ],
        estimatedTimeMinutes: 10,
        definitionOfDone: 'Ingredients are prepped and egg mixture is ready'
      },
      {
        stepNumber: 2,
        title: 'Cook Pasta',
        equipmentNeeded: ['Large pot', 'Colander'],
        instructions: 'Bring salted water to boil. Add spaghetti and cook until al dente according to package instructions.',
        ingredientsUsed: [
          {
            name: 'Spaghetti',
            quantity: '400g',
            type: 'Pasta'
          }
        ],
        estimatedTimeMinutes: 12,
        definitionOfDone: 'Pasta is cooked al dente'
      },
      {
        stepNumber: 3,
        title: 'Prepare Sauce',
        equipmentNeeded: ['Large frying pan', 'Wooden spoon'],
        instructions: 'While pasta is cooking, fry pancetta in a large pan until crispy. Turn off heat.',
        ingredientsUsed: [
          {
            name: 'Pancetta',
            quantity: '150g',
            type: 'Meat'
          }
        ],
        estimatedTimeMinutes: 5,
        definitionOfDone: 'Pancetta is crispy'
      },
      {
        stepNumber: 4,
        title: 'Combine and Serve',
        equipmentNeeded: ['Tongs', 'Serving bowl'],
        instructions: 'Drain pasta and immediately add to the pan with pancetta. Add the egg and cheese mixture, stirring quickly. The residual heat will cook the eggs into a creamy sauce. Add black pepper and remaining cheese.',
        ingredientsUsed: [
          {
            name: 'Spaghetti',
            quantity: '400g',
            type: 'Pasta'
          },
          {
            name: 'Eggs',
            quantity: '3',
            type: 'Dairy'
          },
          {
            name: 'Parmesan Cheese',
            quantity: '50g',
            type: 'Dairy'
          },
          {
            name: 'Black Pepper',
            quantity: '1 tbsp',
            type: 'Spice'
          }
        ],
        estimatedTimeMinutes: 3,
        definitionOfDone: 'Sauce is creamy and coats pasta evenly'
      }
    ],
    allEquipmentNeeded: [
      'Cutting board',
      'Knife',
      'Large pot',
      'Colander',
      'Large frying pan',
      'Wooden spoon',
      'Tongs',
      'Serving bowl'
    ]
  };

  // Invalid recipe missing required fields
  const invalidRecipe = {
    title: 'Incomplete Recipe',
    // Missing required fields like servings, totalTimeMinutes, ingredients, steps, etc.
    metadata: {
      cuisine: 'Test',
      // Missing required dishType and difficultyLevel
    }
  };

  test('validateRecipe should validate a valid recipe', () => {
    expect(() => validateRecipe(validRecipe)).not.toThrow();
    const result = validateRecipe(validRecipe);
    expect(result).toEqual(validRecipe);
  });

  test('validateRecipe should throw for an invalid recipe', () => {
    expect(() => validateRecipe(invalidRecipe)).toThrow();
  });

  test('safeValidateRecipe should return success for valid data', () => {
    const result = safeValidateRecipe(validRecipe);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validRecipe);
    expect(result.error).toBeUndefined();
  });

  test('safeValidateRecipe should return error details for invalid data', () => {
    const result = safeValidateRecipe(invalidRecipe);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  test('parseRecipeInput should parse valid input without id', () => {
    const { id, ...validInput } = validRecipe;
    expect(() => parseRecipeInput(validInput)).not.toThrow();
    const result = parseRecipeInput(validInput);
    expect(result).toEqual(validInput);
  });

  test('safeParseRecipeInput should handle both valid and invalid inputs', () => {
    const { id, ...validInput } = validRecipe;
    
    // Test with valid input
    const validResult = safeParseRecipeInput(validInput);
    expect(validResult.success).toBe(true);
    expect(validResult.data).toEqual(validInput);
    
    // Test with invalid input
    const invalidResult = safeParseRecipeInput(invalidRecipe);
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error).toBeDefined();
  });

  test('Recipe schema should enforce strict typing on nested structures', () => {
    // Test with incorrect types
    const recipeWithWrongTypes = {
      ...validRecipe,
      totalTimeMinutes: '30', // Should be number, not string
      steps: [
        {
          ...validRecipe.steps[0],
          stepNumber: '1', // Should be number, not string
        }
      ]
    };
    
    expect(() => validateRecipe(recipeWithWrongTypes)).toThrow();
  });
});