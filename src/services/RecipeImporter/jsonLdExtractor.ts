import { ParsedRecipe, RecipeNutrition } from '../../types';
import * as cheerio from 'cheerio';

/**
 * Extracts recipe data from JSON-LD structured data on a webpage
 * @param html - HTML content of the webpage
 * @param url - Source URL of the recipe
 * @returns ParsedRecipe object or null if no valid recipe schema is found
 */
export const extractJsonLdRecipe = (html: string, url: string): ParsedRecipe | null => {
  try {
    const $ = cheerio.load(html);

    // Find all script tags with type="application/ld+json"
    const jsonLdScripts = $('script[type="application/ld+json"]');

    // Check each script tag for Recipe schema
    for (let i = 0; i < jsonLdScripts.length; i++) {
      const scriptContent = $(jsonLdScripts[i]).html();
      if (!scriptContent) continue;

      try {
        const jsonData = JSON.parse(scriptContent);
        const recipeData = findRecipeSchema(jsonData);

        if (recipeData) {
          return convertJsonLdToRecipe(recipeData, url);
        }
      } catch (e) {
        // Continue to next script tag if this one fails to parse
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting JSON-LD recipe:', error);
    return null;
  }
};

/**
 * Recursively searches for Recipe schema in JSON-LD data
 * @param data - JSON-LD data to search
 * @returns Recipe schema object or null if not found
 */
const findRecipeSchema = (data: any): any => {
  // Check if this is a Recipe schema
  if (data && (data['@type'] === 'Recipe' || (Array.isArray(data['@type']) && data['@type'].includes('Recipe')))) {
    return data;
  }

  // If data is in @graph array, search each item
  if (data && data['@graph'] && Array.isArray(data['@graph'])) {
    for (const item of data['@graph']) {
      if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
        return item;
      }
    }
  }

  // If data is an array, search each item
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeSchema(item);
      if (found) return found;
    }
  }

  // If data is an object, search each property
  if (data && typeof data === 'object') {
    for (const key in data) {
      if (typeof data[key] === 'object') {
        const found = findRecipeSchema(data[key]);
        if (found) return found;
      }
    }
  }

  return null;
};

/**
 * Converts JSON-LD Recipe schema to ParsedRecipe
 * @param recipe - JSON-LD Recipe schema
 * @param url - Source URL of the recipe
 * @returns ParsedRecipe object
 */
const convertJsonLdToRecipe = (recipe: any, url: string): ParsedRecipe => {
  // Extract ingredients, handling both string arrays and structured HowToStep objects
  const ingredients = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient
    : [];

  // Extract instructions, handling both string arrays and structured HowToStep objects
  let instructions: string[] = [];
  if (recipe.recipeInstructions) {
    if (Array.isArray(recipe.recipeInstructions)) {
      instructions = recipe.recipeInstructions.map((instruction: any) => {
        if (typeof instruction === 'string') {
          return instruction;
        } else if (instruction && typeof instruction === 'object') {
          // Handle HowToStep format
          return instruction.text || instruction.description || '';
        }
        return '';
      }).filter(Boolean);
    } else if (typeof recipe.recipeInstructions === 'string') {
      // Some sites put all instructions in a single string
      instructions = [recipe.recipeInstructions];
    }
  }

  // Parse time durations (ISO 8601 format)
  const prepTime = parseDuration(recipe.prepTime);
  const cookTime = parseDuration(recipe.cookTime);
  const totalTime = parseDuration(recipe.totalTime);

  // Extract nutrition information if available
  let nutrition: RecipeNutrition | undefined;
  if (recipe.nutrition && typeof recipe.nutrition === 'object') {
    nutrition = {
      calories: recipe.nutrition.calories,
      carbohydrateContent: recipe.nutrition.carbohydrateContent,
      proteinContent: recipe.nutrition.proteinContent,
      fatContent: recipe.nutrition.fatContent,
      fiberContent: recipe.nutrition.fiberContent,
      sugarContent: recipe.nutrition.sugarContent,
      sodiumContent: recipe.nutrition.sodiumContent,
    };
  }

  // Handle various image formats
  let imageUrl: string | undefined;
  if (recipe.image) {
    if (typeof recipe.image === 'string') {
      imageUrl = recipe.image;
    } else if (Array.isArray(recipe.image) && recipe.image.length > 0) {
      // Use first image if there are multiple
      const firstImage = recipe.image[0];
      imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
    } else if (typeof recipe.image === 'object') {
      imageUrl = recipe.image.url || recipe.image.contentUrl;
    }
  }

  // Extract keywords, categories, and cuisines
  const keywords = recipe.keywords
    ? (typeof recipe.keywords === 'string'
      ? recipe.keywords.split(',').map((k: string) => k.trim())
      : Array.isArray(recipe.keywords) ? recipe.keywords : [])
    : [];

  const category = recipe.recipeCategory
    ? (Array.isArray(recipe.recipeCategory)
      ? recipe.recipeCategory
      : [recipe.recipeCategory])
    : [];

  const cuisine = recipe.recipeCuisine
    ? (Array.isArray(recipe.recipeCuisine)
      ? recipe.recipeCuisine
      : [recipe.recipeCuisine])
    : [];

  // Check if any required fields are missing
  const isPartial = !recipe.name || ingredients.length === 0 || instructions.length === 0;

  return {
    name: recipe.name || 'Untitled Recipe',
    description: recipe.description,
    prepTime,
    cookTime,
    totalTime,
    servings: recipe.recipeYield ? parseServings(recipe.recipeYield) : undefined,
    yield: recipe.recipeYield ?
      (Array.isArray(recipe.recipeYield) ? recipe.recipeYield[0]?.toString() : recipe.recipeYield.toString())
      : undefined,
    ingredients,
    instructions,
    imageUrl,
    author: extractAuthor(recipe.author),
    sourceUrl: url,
    cuisine,
    category,
    keywords,
    nutrition,
    isPartial,
  };
};

/**
 * Parses ISO 8601 duration to minutes
 * @param timeString - ISO 8601 duration string (e.g., PT1H30M)
 * @returns Number of minutes or undefined if invalid
 */
const parseDuration = (timeString: string | undefined): number | undefined => {
  if (!timeString) return undefined;

  try {
    // Handle simple minute notation (some sites use "30 minutes" instead of PT30M)
    if (/^\d+\s*min(ute)?s?$/i.test(timeString)) {
      return parseInt(timeString.match(/\d+/)?.[0] || '0', 10);
    }

    // Handle hour notation (some sites use "1 hour" or "1.5 hours")
    if (/^\d+(\.\d+)?\s*hour(s)?$/i.test(timeString)) {
      const hours = parseFloat(timeString.match(/\d+(\.\d+)?/)?.[0] || '0');
      return Math.round(hours * 60);
    }

    // Parse standard ISO 8601 format
    const matches = timeString.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
    if (!matches) return undefined;

    const days = parseInt(matches[1] || '0', 10);
    const hours = parseInt(matches[2] || '0', 10);
    const minutes = parseInt(matches[3] || '0', 10);

    return days * 24 * 60 + hours * 60 + minutes;
  } catch (error) {
    console.error('Error parsing duration:', error);
    return undefined;
  }
};

/**
 * Parses servings from recipeYield field
 * @param yield - recipeYield value which can be a string, number or array
 * @returns Number of servings or undefined if can't be parsed
 */
const parseServings = (recipeYield: string | number | any[] | undefined): number | undefined => {
  if (!recipeYield) return undefined;

  // If it's already a number, return it
  if (typeof recipeYield === 'number') return recipeYield;

  // If it's an array, use the first value
  if (Array.isArray(recipeYield)) {
    if (recipeYield.length === 0) return undefined;
    if (typeof recipeYield[0] === 'number') return recipeYield[0];
    recipeYield = recipeYield[0]?.toString() || '';
  }

  // Convert to string if it isn't already
  const yieldStr = recipeYield.toString();

  // Try to extract a number (e.g., "Serves 4" -> 4, "4-6 servings" -> 4)
  const numbers = yieldStr.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    return parseInt(numbers[0], 10);
  }

  return undefined;
};

/**
 * Extracts author information from various formats
 * @param author - Author field which can be a string, object or array
 * @returns Author name as string
 */
const extractAuthor = (author: any): string | undefined => {
  if (!author) return undefined;

  if (typeof author === 'string') return author;

  if (Array.isArray(author)) {
    if (author.length === 0) return undefined;
    const firstAuthor = author[0];
    if (typeof firstAuthor === 'string') return firstAuthor;
    return firstAuthor?.name || firstAuthor?.['@type'] === 'Person' ? firstAuthor?.name : undefined;
  }

  if (typeof author === 'object') {
    return author.name || (author['@type'] === 'Person' ? author.name : undefined);
  }

  return undefined;
};