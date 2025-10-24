import axios from 'axios';
import { ImporterResult, ParsedRecipe } from '../../types';
import { extractJsonLdRecipe } from './jsonLdExtractor';
import { extractRecipeFromHtml } from './htmlParser';

/**
 * Imports and parses a recipe from a URL
 * @param url - The URL of the recipe to import
 * @returns Promise resolving to ImporterResult with parsed recipe and any errors/warnings
 */
export const importRecipeFromUrl = async (url: string): Promise<ImporterResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate URL format
    if (!isValidUrl(url)) {
      errors.push('Invalid URL format');
      return {
        recipe: createEmptyRecipe(url),
        errors,
        warnings,
      };
    }

    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        // Set a realistic user agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (compatible; SousChef/1.0; +https://souschef.app/bot)',
        'Accept': 'text/html',
      },
      timeout: 10000, // 10 second timeout
    });

    const html = response.data;

    // Try to extract recipe using JSON-LD structured data (preferred method)
    const jsonLdRecipe = extractJsonLdRecipe(html, url);

    // If JSON-LD data is available, use it
    if (jsonLdRecipe) {
      if (jsonLdRecipe.isPartial) {
        warnings.push('JSON-LD recipe data is incomplete. Some fields may be missing.');
      }

      return {
        recipe: jsonLdRecipe,
        warnings,
      };
    } else {
      // Fallback to HTML parsing if no structured data is found
      warnings.push('No structured recipe data (JSON-LD) found. Using fallback HTML parsing.');
      const htmlRecipe = extractRecipeFromHtml(html, url);

      if (htmlRecipe.isPartial) {
        warnings.push('HTML parsing incomplete. Some fields may be missing or inaccurate.');
      }

      return {
        recipe: htmlRecipe,
        warnings,
      };
    }
  } catch (error) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errors.push('Connection timed out. The server took too long to respond.');
      } else if (error.response) {
        // Server responded with a status code outside the 2xx range
        errors.push(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response was received
        errors.push('No response from server. Check the URL and try again.');
      } else {
        errors.push(`Network error: ${error.message}`);
      }
    } else {
      // Generic error handling
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      errors.push(`Error importing recipe: ${errorMessage}`);
    }

    // Return an empty recipe with errors
    return {
      recipe: createEmptyRecipe(url),
      errors,
      warnings,
    };
  }
};

/**
 * Validates if a string is a properly formatted URL
 * @param url - URL string to validate
 * @returns Boolean indicating if the URL is valid
 */
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
};

/**
 * Creates an empty recipe object when parsing fails
 * @param url - The source URL
 * @returns Empty ParsedRecipe object
 */
const createEmptyRecipe = (url: string): ParsedRecipe => {
  return {
    name: 'Untitled Recipe',
    ingredients: [],
    instructions: [],
    sourceUrl: url,
    isPartial: true,
  };
};

/**
 * Validates a parsed recipe to ensure it has the required fields
 * @param recipe - The ParsedRecipe object to validate
 * @returns Array of validation error messages
 */
export const validateParsedRecipe = (recipe: ParsedRecipe): string[] => {
  const errors: string[] = [];

  if (!recipe.name || recipe.name === 'Untitled Recipe') {
    errors.push('Recipe name is missing.');
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('Recipe ingredients are missing.');
  }

  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.push('Recipe instructions are missing.');
  }

  return errors;
};

/**
 * Determines which fields in a parsed recipe are missing
 * @param recipe - The ParsedRecipe object to check
 * @returns Object with missing field information
 */
export const getMissingFields = (recipe: ParsedRecipe): {
  missingRequired: string[],
  missingOptional: string[]
} => {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  // Required fields
  if (!recipe.name || recipe.name === 'Untitled Recipe') {
    missingRequired.push('name');
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    missingRequired.push('ingredients');
  }

  if (!recipe.instructions || recipe.instructions.length === 0) {
    missingRequired.push('instructions');
  }

  // Optional fields
  if (!recipe.description) {
    missingOptional.push('description');
  }

  if (recipe.prepTime === undefined) {
    missingOptional.push('preparation time');
  }

  if (recipe.cookTime === undefined) {
    missingOptional.push('cooking time');
  }

  if (recipe.servings === undefined && !recipe.yield) {
    missingOptional.push('servings/yield');
  }

  if (!recipe.imageUrl) {
    missingOptional.push('image');
  }

  return {
    missingRequired,
    missingOptional
  };
};