import { extractJsonLdRecipe } from '../jsonLdExtractor';

const createJsonLdHtml = (jsonLd: object) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test Recipe</title>
        <script type="application/ld+json">
          ${JSON.stringify(jsonLd)}
        </script>
      </head>
      <body>
        <h1>Test Recipe</h1>
      </body>
    </html>
  `;
};

describe('extractJsonLdRecipe', () => {
  it('should extract a complete recipe from JSON-LD data', () => {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Recipe',
      'name': 'Chocolate Chip Cookies',
      'description': 'Delicious chocolate chip cookies',
      'prepTime': 'PT20M',
      'cookTime': 'PT10M',
      'totalTime': 'PT30M',
      'recipeYield': '24 cookies',
      'recipeIngredient': [
        '1 cup butter',
        '1 cup sugar',
        '1 cup brown sugar',
        '2 eggs',
        '2 teaspoons vanilla extract',
        '3 cups all-purpose flour',
        '1 teaspoon baking soda',
        '2 teaspoons hot water',
        '1/2 teaspoon salt',
        '2 cups chocolate chips'
      ],
      'recipeInstructions': [
        'Preheat oven to 350 degrees F.',
        'Mix together butter and sugars.',
        'Beat in eggs and vanilla.',
        'Dissolve baking soda in hot water and add to mixture.',
        'Add flour and salt.',
        'Stir in chocolate chips.',
        'Bake for 10 minutes.'
      ],
      'image': 'https://example.com/cookies.jpg',
      'author': {
        '@type': 'Person',
        'name': 'John Doe'
      },
      'nutrition': {
        '@type': 'NutritionInformation',
        'calories': '240 calories',
        'fatContent': '12 g',
        'carbohydrateContent': '30 g',
        'proteinContent': '3 g'
      },
      'recipeCategory': 'Dessert',
      'recipeCuisine': 'American',
      'keywords': 'cookies, chocolate, dessert'
    };

    const html = createJsonLdHtml(jsonLd);
    const recipe = extractJsonLdRecipe(html, 'https://example.com/recipe');

    expect(recipe).not.toBeNull();
    if (recipe) {
      expect(recipe.name).toBe('Chocolate Chip Cookies');
      expect(recipe.description).toBe('Delicious chocolate chip cookies');
      expect(recipe.prepTime).toBe(20);
      expect(recipe.cookTime).toBe(10);
      expect(recipe.totalTime).toBe(30);
      expect(recipe.yield).toBe('24 cookies');
      expect(recipe.ingredients).toHaveLength(10);
      expect(recipe.ingredients[0]).toBe('1 cup butter');
      expect(recipe.instructions).toHaveLength(7);
      expect(recipe.instructions[0]).toBe('Preheat oven to 350 degrees F.');
      expect(recipe.imageUrl).toBe('https://example.com/cookies.jpg');
      expect(recipe.author).toBe('John Doe');
      expect(recipe.sourceUrl).toBe('https://example.com/recipe');
      expect(recipe.category).toContain('Dessert');
      expect(recipe.cuisine).toContain('American');
      expect(recipe.keywords?.length).toBe(3);
      expect(recipe.nutrition).toBeDefined();
      expect(recipe.nutrition?.calories).toBe('240 calories');
      expect(recipe.isPartial).toBe(false);
    }
  });

  it('should handle JSON-LD data in the @graph array', () => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          'name': 'Recipe Website'
        },
        {
          '@type': 'Recipe',
          'name': 'Graph Recipe',
          'recipeIngredient': ['Ingredient 1', 'Ingredient 2'],
          'recipeInstructions': ['Step 1', 'Step 2']
        }
      ]
    };

    const html = createJsonLdHtml(jsonLd);
    const recipe = extractJsonLdRecipe(html, 'https://example.com/recipe');

    expect(recipe).not.toBeNull();
    if (recipe) {
      expect(recipe.name).toBe('Graph Recipe');
      expect(recipe.ingredients).toHaveLength(2);
      expect(recipe.instructions).toHaveLength(2);
    }
  });

  it('should handle missing required fields and mark as partial', () => {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Recipe',
      'name': 'Partial Recipe',
      'recipeIngredient': []  // Empty ingredients
    };

    const html = createJsonLdHtml(jsonLd);
    const recipe = extractJsonLdRecipe(html, 'https://example.com/recipe');

    expect(recipe).not.toBeNull();
    if (recipe) {
      expect(recipe.name).toBe('Partial Recipe');
      expect(recipe.ingredients).toHaveLength(0);
      expect(recipe.instructions).toHaveLength(0);
      expect(recipe.isPartial).toBe(true);
    }
  });

  it('should return null if no JSON-LD Recipe schema is found', () => {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'WebSite',
      'name': 'Not a Recipe'
    };

    const html = createJsonLdHtml(jsonLd);
    const recipe = extractJsonLdRecipe(html, 'https://example.com/recipe');

    expect(recipe).toBeNull();
  });

  it('should handle structured HowToStep instructions', () => {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Recipe',
      'name': 'Structured Instructions Recipe',
      'recipeIngredient': ['Ingredient 1', 'Ingredient 2'],
      'recipeInstructions': [
        {
          '@type': 'HowToStep',
          'text': 'Step 1 description'
        },
        {
          '@type': 'HowToStep',
          'text': 'Step 2 description'
        }
      ]
    };

    const html = createJsonLdHtml(jsonLd);
    const recipe = extractJsonLdRecipe(html, 'https://example.com/recipe');

    expect(recipe).not.toBeNull();
    if (recipe) {
      expect(recipe.instructions).toHaveLength(2);
      expect(recipe.instructions[0]).toBe('Step 1 description');
      expect(recipe.instructions[1]).toBe('Step 2 description');
    }
  });
});