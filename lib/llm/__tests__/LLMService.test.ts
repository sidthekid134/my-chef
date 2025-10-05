import { jest } from '@jest/globals';
import { LLMService, ProviderType } from '../LLMService';
import { OpenAIProvider } from '../providers/openai';
import { CompletionResponse, IProvider } from '../interfaces';

// Mock the OpenAIProvider
jest.mock('../providers/openai');

describe('LLMService', () => {
  // Mock provider responses
  const validRecipeResponse: CompletionResponse = {
    content: JSON.stringify({
      id: 'recipe-123',
      title: 'Chocolate Chip Cookies',
      servings: '24 cookies',
      totalTimeMinutes: 45,
      activeTimeMinutes: 20,
      passiveTimeMinutes: 25,
      metadata: {
        cuisine: 'American',
        dishType: 'Dessert',
        difficultyLevel: 'Easy'
      },
      ingredients: [
        {
          name: 'All-purpose flour',
          quantity: '2 1/4 cups',
          type: 'dry'
        },
        {
          name: 'Baking soda',
          quantity: '1 tsp',
          type: 'dry'
        },
        {
          name: 'Salt',
          quantity: '1 tsp',
          type: 'dry'
        }
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Prepare the dough',
          equipmentNeeded: ['Large bowl', 'Electric mixer'],
          instructions: 'Cream together butter and sugars until light and fluffy.',
          ingredientsUsed: [
            {
              name: 'Butter',
              quantity: '1 cup',
              type: 'fat'
            },
            {
              name: 'Granulated sugar',
              quantity: '3/4 cup',
              type: 'dry'
            },
            {
              name: 'Brown sugar',
              quantity: '3/4 cup',
              type: 'dry'
            }
          ],
          estimatedTimeMinutes: 10,
          definitionOfDone: 'Mixture is light and fluffy with no visible sugar granules'
        }
      ],
      allEquipmentNeeded: ['Large bowl', 'Electric mixer', 'Baking sheet']
    }),
    model: 'gpt-4-turbo',
    usage: {
      promptTokens: 500,
      completionTokens: 800,
      totalTokens: 1300
    }
  };

  const invalidJsonResponse: CompletionResponse = {
    content: 'This is not JSON',
    model: 'gpt-4-turbo',
    usage: {
      promptTokens: 100,
      completionTokens: 10,
      totalTokens: 110
    }
  };

  const invalidRecipeResponse: CompletionResponse = {
    content: JSON.stringify({
      id: 'recipe-123',
      title: 'Chocolate Chip Cookies',
      // Missing required fields
      servings: '',
      totalTimeMinutes: 0,
      metadata: {
        cuisine: '',
        dishType: '',
        difficultyLevel: ''
      },
      ingredients: [],
      steps: [],
      allEquipmentNeeded: []
    }),
    model: 'gpt-4-turbo',
    usage: {
      promptTokens: 300,
      completionTokens: 500,
      totalTokens: 800
    }
  };

  const validAfterRepairResponse: CompletionResponse = {
    content: JSON.stringify({
      id: 'recipe-123',
      title: 'Chocolate Chip Cookies',
      servings: '24 cookies',
      totalTimeMinutes: 45,
      activeTimeMinutes: 20,
      passiveTimeMinutes: 25,
      metadata: {
        cuisine: 'American',
        dishType: 'Dessert',
        difficultyLevel: 'Easy'
      },
      ingredients: [
        {
          name: 'All-purpose flour',
          quantity: '2 1/4 cups',
          type: 'dry'
        }
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Prepare the dough',
          equipmentNeeded: ['Large bowl'],
          instructions: 'Mix all ingredients',
          ingredientsUsed: [
            {
              name: 'All-purpose flour',
              quantity: '2 1/4 cups',
              type: 'dry'
            }
          ],
          estimatedTimeMinutes: 10,
          definitionOfDone: 'Dough is well mixed'
        }
      ],
      allEquipmentNeeded: ['Large bowl']
    }),
    model: 'gpt-4-turbo',
    usage: {
      promptTokens: 700,
      completionTokens: 600,
      totalTokens: 1300
    }
  };

  // Mock OpenAI provider implementation
  let mockOpenAIProvider: IProvider;
  let llmService: LLMService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup the mock OpenAI provider
    mockOpenAIProvider = {
      config: { apiKey: 'test-key', modelName: 'test-model' },
      init: jest.fn().mockResolvedValue(undefined),
      generateCompletion: jest.fn()
    };
    
    // Make the mock class return our mock instance
    (OpenAIProvider as jest.MockedClass<typeof OpenAIProvider>).mockImplementation(() => mockOpenAIProvider);
    
    // Create LLM service with our configuration
    llmService = new LLMService({
      providers: {
        [ProviderType.OpenAI]: {
          apiKey: 'test-key',
          modelName: 'gpt-4-turbo'
        }
      },
      defaultProvider: ProviderType.OpenAI
    });
  });

  it('should initialize with configured providers', async () => {
    await llmService.init();
    
    expect(mockOpenAIProvider.init).toHaveBeenCalledWith({
      apiKey: 'test-key',
      modelName: 'gpt-4-turbo'
    });
  });

  it('should generate a recipe from text with valid JSON response', async () => {
    // Configure mock to return valid response
    mockOpenAIProvider.generateCompletion.mockResolvedValueOnce(validRecipeResponse);
    
    await llmService.init();
    const recipe = await llmService.generateRecipeFromText('Make chocolate chip cookies');
    
    expect(recipe).toBeDefined();
    expect(recipe.title).toBe('Chocolate Chip Cookies');
    expect(recipe.ingredients.length).toBeGreaterThan(0);
    expect(recipe.steps.length).toBeGreaterThan(0);
  });

  it('should handle invalid JSON and retry with stricter prompt', async () => {
    // First call returns invalid JSON, second call returns valid JSON
    mockOpenAIProvider.generateCompletion
      .mockResolvedValueOnce(invalidJsonResponse)
      .mockResolvedValueOnce(validRecipeResponse);
    
    await llmService.init();
    const recipe = await llmService.generateRecipeFromText('Make chocolate chip cookies');
    
    // Should have called generateCompletion twice
    expect(mockOpenAIProvider.generateCompletion).toHaveBeenCalledTimes(2);
    
    // Second call should have stricter system prompt
    expect(mockOpenAIProvider.generateCompletion.mock.calls[1][0].systemPrompt).toContain('valid JSON');
    expect(mockOpenAIProvider.generateCompletion.mock.calls[1][0].userPrompt).toContain('could not be parsed as valid JSON');
    
    // Should return the valid recipe from the second call
    expect(recipe).toBeDefined();
    expect(recipe.title).toBe('Chocolate Chip Cookies');
  });

  it('should handle invalid recipe data and retry with validation errors', async () => {
    // First call returns invalid recipe, second call returns valid recipe
    mockOpenAIProvider.generateCompletion
      .mockResolvedValueOnce(invalidRecipeResponse)
      .mockResolvedValueOnce(validAfterRepairResponse);
    
    await llmService.init();
    const recipe = await llmService.generateRecipeFromText('Make chocolate chip cookies');
    
    // Should have called generateCompletion twice
    expect(mockOpenAIProvider.generateCompletion).toHaveBeenCalledTimes(2);
    
    // Second call should include validation errors
    expect(mockOpenAIProvider.generateCompletion.mock.calls[1][0].userPrompt).toContain('validation errors');
    
    // Should return the valid recipe from the second call
    expect(recipe).toBeDefined();
    expect(recipe.title).toBe('Chocolate Chip Cookies');
    expect(recipe.servings).toBe('24 cookies');
  });
  
  it('should throw error when auto-repair fails', async () => {
    // Both calls return invalid data
    mockOpenAIProvider.generateCompletion
      .mockResolvedValueOnce(invalidRecipeResponse)
      .mockResolvedValueOnce(invalidRecipeResponse);
    
    await llmService.init();
    
    await expect(
      llmService.generateRecipeFromText('Make chocolate chip cookies')
    ).rejects.toThrow(/Failed to auto-repair recipe validation issues/);
  });

  it('should generate a recipe from URL', async () => {
    // Configure mock to return valid response
    mockOpenAIProvider.generateCompletion.mockResolvedValueOnce(validRecipeResponse);
    
    await llmService.init();
    const recipe = await llmService.generateRecipeFromUrl('https://example.com/recipe');
    
    expect(recipe).toBeDefined();
    expect(recipe.title).toBe('Chocolate Chip Cookies');
    
    // Should have called with URL prompt
    expect(mockOpenAIProvider.generateCompletion.mock.calls[0][0].userPrompt).toContain('URL');
    expect(mockOpenAIProvider.generateCompletion.mock.calls[0][0].userPrompt).toContain('https://example.com/recipe');
  });

  it('should generate a recipe name', async () => {
    // Configure mock to return name
    mockOpenAIProvider.generateCompletion.mockResolvedValueOnce({
      content: 'Crispy Golden Chocolate Chip Cookies',
      model: 'gpt-4-turbo',
      usage: {
        promptTokens: 100,
        completionTokens: 10,
        totalTokens: 110
      }
    });
    
    await llmService.init();
    const name = await llmService.generateRecipeName('Cookies with chocolate chips and walnuts');
    
    expect(name).toBe('Crispy Golden Chocolate Chip Cookies');
    
    // Should have called with naming prompt
    expect(mockOpenAIProvider.generateCompletion.mock.calls[0][0].systemPrompt).toContain('naming assistant');
  });
});