import { extractRecipeFromHtml } from '../htmlParser';

describe('extractRecipeFromHtml', () => {
  it('should extract recipe name from h1 tag', () => {
    const html = `
      <html>
        <head><title>Website | Recipe Title</title></head>
        <body>
          <h1>Chocolate Chip Cookies</h1>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.name).toBe('Chocolate Chip Cookies');
  });

  it('should extract recipe name from title when no h1 is present', () => {
    const html = `
      <html>
        <head><title>Chocolate Chip Cookies | Recipe Website</title></head>
        <body>
          <p>Welcome to our recipe</p>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.name).toBe('Chocolate Chip Cookies');
  });

  it('should extract ingredients from a list', () => {
    const html = `
      <html>
        <head><title>Recipe</title></head>
        <body>
          <h1>Recipe Name</h1>
          <ul class="ingredients">
            <li>1 cup sugar</li>
            <li>2 eggs</li>
            <li>1/2 cup butter</li>
          </ul>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.ingredients).toHaveLength(3);
    expect(recipe.ingredients).toContain('1 cup sugar');
    expect(recipe.ingredients).toContain('2 eggs');
    expect(recipe.ingredients).toContain('1/2 cup butter');
  });

  it('should extract instructions from an ordered list', () => {
    const html = `
      <html>
        <head><title>Recipe</title></head>
        <body>
          <h1>Recipe Name</h1>
          <ol class="instructions">
            <li>Mix the ingredients</li>
            <li>Bake for 30 minutes</li>
            <li>Let cool before serving</li>
          </ol>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.instructions).toHaveLength(3);
    expect(recipe.instructions[0]).toBe('Mix the ingredients');
    expect(recipe.instructions[1]).toBe('Bake for 30 minutes');
    expect(recipe.instructions[2]).toBe('Let cool before serving');
  });

  it('should extract description from meta tags', () => {
    const html = `
      <html>
        <head>
          <title>Recipe</title>
          <meta name="description" content="A delicious homemade cookie recipe">
        </head>
        <body>
          <h1>Recipe Name</h1>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.description).toBe('A delicious homemade cookie recipe');
  });

  it('should extract timing information', () => {
    const html = `
      <html>
        <head><title>Recipe</title></head>
        <body>
          <h1>Recipe Name</h1>
          <div>Prep Time: 20 minutes</div>
          <div>Cook Time: 30 minutes</div>
          <div>Total Time: 50 minutes</div>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.prepTime).toBe(20);
    expect(recipe.cookTime).toBe(30);
  });

  it('should extract image URL', () => {
    const html = `
      <html>
        <head><title>Recipe</title></head>
        <body>
          <h1>Recipe Name</h1>
          <img class="recipe-image" src="https://example.com/recipe.jpg">
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.imageUrl).toBe('https://example.com/recipe.jpg');
  });

  it('should extract author information', () => {
    const html = `
      <html>
        <head>
          <title>Recipe</title>
          <meta name="author" content="John Doe">
        </head>
        <body>
          <h1>Recipe Name</h1>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.author).toBe('John Doe');
  });

  it('should extract yield/servings information', () => {
    const html = `
      <html>
        <head><title>Recipe</title></head>
        <body>
          <h1>Recipe Name</h1>
          <div class="yield">Serves 4</div>
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.yield).toBe('Serves 4');
    expect(recipe.servings).toBe(4);
  });

  it('should mark recipe as partial if required fields are missing', () => {
    const html = `
      <html>
        <head><title>Recipe</title></head>
        <body>
          <h1>Recipe Name</h1>
          <!-- No ingredients or instructions -->
        </body>
      </html>
    `;

    const recipe = extractRecipeFromHtml(html, 'https://example.com/recipe');
    expect(recipe.isPartial).toBe(true);
  });
});