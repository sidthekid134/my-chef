import { ParsedRecipe } from '../../types';
import * as cheerio from 'cheerio';

/**
 * Extracts recipe data from HTML when structured data is not available
 * @param html - HTML content of the webpage
 * @param url - Source URL of the recipe
 * @returns ParsedRecipe object
 */
export const extractRecipeFromHtml = (html: string, url: string): ParsedRecipe => {
  const $ = cheerio.load(html);
  const warnings: string[] = [];

  // Extract recipe name (priority: h1, then title tag, then first heading)
  const name = extractRecipeName($);

  // Extract recipe image
  const imageUrl = extractMainImage($);

  // Extract description
  const description = extractDescription($);

  // Extract times
  const { prepTime, cookTime, totalTime } = extractTimes($);

  // Extract yield/servings
  const { yield: recipeYield, servings } = extractYieldAndServings($);

  // Extract author
  const author = extractAuthor($);

  // Extract ingredients
  const ingredients = extractIngredients($);

  // Extract instructions
  const instructions = extractInstructions($);

  // Check if any required fields are missing
  const isPartial = !name || ingredients.length === 0 || instructions.length === 0;

  return {
    name: name || 'Untitled Recipe',
    description,
    prepTime,
    cookTime,
    totalTime,
    servings,
    yield: recipeYield,
    ingredients,
    instructions,
    imageUrl,
    author,
    sourceUrl: url,
    isPartial,
  };
};

/**
 * Extracts recipe name from HTML
 * @param $ - Cheerio instance
 * @returns Recipe name or undefined
 */
const extractRecipeName = ($: cheerio.CheerioAPI): string | undefined => {
  // Try to find the recipe name using common patterns
  let name: string | undefined;

  // First check for h1 tags
  const h1 = $('h1').first().text().trim();
  if (h1 && h1.length > 0 && h1.length < 100) {
    name = h1;
  }

  // If no h1 found, try the page title
  if (!name) {
    const title = $('title').text().trim();
    // Clean up title (e.g., "Recipe Name | Website Name")
    if (title) {
      const parts = title.split(/[|\\-–—]/);
      if (parts.length > 0) {
        name = parts[0].trim();
      } else {
        name = title;
      }
    }
  }

  // If still no name, try first heading of any level
  if (!name) {
    const heading = $('h1, h2, h3, h4, h5, h6').first().text().trim();
    if (heading && heading.length > 0 && heading.length < 100) {
      name = heading;
    }
  }

  return name;
};

/**
 * Extracts the main recipe image from HTML
 * @param $ - Cheerio instance
 * @returns Image URL or undefined
 */
const extractMainImage = ($: cheerio.CheerioAPI): string | undefined => {
  // Check for images with common recipe image classes or containers
  const commonSelectors = [
    '.recipe-image img',
    '.hero-image img',
    '.main-image img',
    '.featured-image img',
    '.post-image img',
    '[itemprop="image"]',
    'meta[property="og:image"]',
    'img.recipe-image',
    'img.hero-image',
    'img.featured-image',
  ];

  for (const selector of commonSelectors) {
    const img = $(selector).first();
    if (img.length > 0) {
      // Get src attribute, or content for meta tags
      const src = img.attr('src') || img.attr('content') || img.attr('data-src');
      if (src) return src;
    }
  }

  // If no image found with specific selectors, look for any large image
  let largestImageSrc: string | undefined;
  let largestArea = 0;

  $('img').each((_, el) => {
    const width = parseInt($(el).attr('width') || '0', 10);
    const height = parseInt($(el).attr('height') || '0', 10);
    const src = $(el).attr('src') || $(el).attr('data-src');

    if (src && width && height) {
      const area = width * height;
      if (area > largestArea && src.match(/\.(jpeg|jpg|png|webp)(\?.*)?$/i)) {
        largestArea = area;
        largestImageSrc = src;
      }
    }
  });

  return largestImageSrc;
};

/**
 * Extracts recipe description from HTML
 * @param $ - Cheerio instance
 * @returns Description or undefined
 */
const extractDescription = ($: cheerio.CheerioAPI): string | undefined => {
  // Check for common description containers
  const commonSelectors = [
    '[itemprop="description"]',
    '.recipe-description',
    '.description',
    '.summary',
    '.intro',
    'meta[name="description"]',
    'meta[property="og:description"]',
  ];

  for (const selector of commonSelectors) {
    const el = $(selector).first();
    if (el.length > 0) {
      // Get content attribute for meta tags or text for other elements
      const text = el.attr('content') || el.text();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    }
  }

  // If no description found with specific selectors, look for first paragraph after the title
  const firstPara = $('h1').first().nextAll('p').first().text().trim();
  if (firstPara && firstPara.length > 10) {
    return firstPara;
  }

  return undefined;
};

/**
 * Extracts preparation, cooking, and total times from HTML
 * @param $ - Cheerio instance
 * @returns Object with prepTime, cookTime, and totalTime
 */
const extractTimes = ($: cheerio.CheerioAPI): { prepTime?: number; cookTime?: number; totalTime?: number } => {
  const times: { prepTime?: number; cookTime?: number; totalTime?: number } = {};

  // Check for time information in meta tags
  $('meta[itemprop="prepTime"]').each((_, el) => {
    const content = $(el).attr('content');
    if (content) {
      times.prepTime = parseDuration(content);
    }
  });

  $('meta[itemprop="cookTime"]').each((_, el) => {
    const content = $(el).attr('content');
    if (content) {
      times.cookTime = parseDuration(content);
    }
  });

  $('meta[itemprop="totalTime"]').each((_, el) => {
    const content = $(el).attr('content');
    if (content) {
      times.totalTime = parseDuration(content);
    }
  });

  // Look for time information in text
  if (!times.prepTime) {
    times.prepTime = findTimeInText($, /prep\s*time:?\s*([0-9]+\s*[a-z]*)/i);
  }

  if (!times.cookTime) {
    times.cookTime = findTimeInText($, /cook(ing)?\s*time:?\s*([0-9]+\s*[a-z]*)/i);
  }

  if (!times.totalTime) {
    times.totalTime = findTimeInText($, /total\s*time:?\s*([0-9]+\s*[a-z]*)/i);
  }

  return times;
};

/**
 * Finds cooking times mentioned in text with regex patterns
 * @param $ - Cheerio instance
 * @param pattern - Regex pattern to match
 * @returns Time in minutes or undefined
 */
const findTimeInText = ($: cheerio.CheerioAPI, pattern: RegExp): number | undefined => {
  let time: number | undefined;

  $('body').contents().each((_, node) => {
    if (node.type === 'text') {
      const text = $(node).text();
      const match = text.match(pattern);
      if (match && match[1]) {
        const timeText = match[1].trim();
        time = parseTimeText(timeText);
        return false; // Stop iteration once found
      }
    }
  });

  return time;
};

/**
 * Parses time text (e.g., "30 minutes", "1 hour") to minutes
 * @param timeText - Text containing time information
 * @returns Time in minutes or undefined
 */
const parseTimeText = (timeText: string): number | undefined => {
  const hours = timeText.match(/(\d+)\s*hour/i);
  const minutes = timeText.match(/(\d+)\s*min/i);

  let totalMinutes = 0;

  if (hours && hours[1]) {
    totalMinutes += parseInt(hours[1], 10) * 60;
  }

  if (minutes && minutes[1]) {
    totalMinutes += parseInt(minutes[1], 10);
  }

  return totalMinutes > 0 ? totalMinutes : undefined;
};

/**
 * Parses ISO 8601 duration to minutes
 * @param timeString - ISO 8601 duration string (e.g., PT1H30M)
 * @returns Number of minutes or undefined if invalid
 */
const parseDuration = (timeString: string | undefined): number | undefined => {
  if (!timeString) return undefined;

  try {
    // Handle simple minute notation
    if (/^\d+\s*min(ute)?s?$/i.test(timeString)) {
      return parseInt(timeString.match(/\d+/)?.[0] || '0', 10);
    }

    // Handle hour notation
    if (/^\d+(\.\d+)?\s*hour(s)?$/i.test(timeString)) {
      const hours = parseFloat(timeString.match(/\d+(\.\d+)?/)?.[0] || '0');
      return Math.round(hours * 60);
    }

    // Parse ISO 8601 format
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
 * Extracts yield and servings information from HTML
 * @param $ - Cheerio instance
 * @returns Object with yield and servings information
 */
const extractYieldAndServings = ($: cheerio.CheerioAPI): { yield?: string; servings?: number } => {
  const result: { yield?: string; servings?: number } = {};

  // Look for yield information
  const yieldSelectors = [
    '[itemprop="recipeYield"]',
    '.recipe-yield',
    '.yield',
    '.servings',
  ];

  for (const selector of yieldSelectors) {
    const el = $(selector).first();
    if (el.length > 0) {
      const text = el.text().trim();
      if (text) {
        result.yield = text;

        // Try to extract servings number
        const servingMatch = text.match(/(\d+)(?:\s*-\s*\d+)?\s+(?:servings|serving|persons|person)/i);
        if (servingMatch && servingMatch[1]) {
          result.servings = parseInt(servingMatch[1], 10);
        }

        break;
      }
    }
  }

  // If we didn't find yield info, look for text mentioning servings
  if (!result.yield) {
    const servingMatch = $('body').text().match(/(?:serves|servings|yield|makes)[:\s]*(\d+)(?:\s*-\s*\d+)?/i);
    if (servingMatch && servingMatch[1]) {
      result.servings = parseInt(servingMatch[1], 10);
      result.yield = servingMatch[0];
    }
  }

  return result;
};

/**
 * Extracts author information from HTML
 * @param $ - Cheerio instance
 * @returns Author name or undefined
 */
const extractAuthor = ($: cheerio.CheerioAPI): string | undefined => {
  // Check common author selectors
  const authorSelectors = [
    '[itemprop="author"]',
    '.author',
    '.byline',
    'meta[name="author"]',
  ];

  for (const selector of authorSelectors) {
    const el = $(selector).first();
    if (el.length > 0) {
      const author = el.attr('content') || el.text().trim();
      if (author) return author;
    }
  }

  return undefined;
};

/**
 * Extracts ingredients list from HTML
 * @param $ - Cheerio instance
 * @returns Array of ingredient strings
 */
const extractIngredients = ($: cheerio.CheerioAPI): string[] => {
  const ingredients: string[] = [];

  // Common selectors for ingredient lists
  const listSelectors = [
    '[itemprop="recipeIngredient"]',
    '.recipe-ingredients li',
    '.ingredients li',
    'ul.ingredients li',
    '.ingredient-list li',
  ];

  // Try each selector
  for (const selector of listSelectors) {
    const items = $(selector);
    if (items.length > 0) {
      items.each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
          ingredients.push(text);
        }
      });

      if (ingredients.length > 0) {
        break;
      }
    }
  }

  // If we didn't find a list with the common selectors, look for any list that might contain ingredients
  if (ingredients.length === 0) {
    // Find all lists and check which ones likely contain ingredients
    $('ul').each((_, ul) => {
      const items: string[] = [];
      $(ul).find('li').each((_, li) => {
        const text = $(li).text().trim();
        items.push(text);
      });

      // Check if this list looks like ingredients (typical length, contains measurements)
      if (isLikelyIngredientList(items)) {
        ingredients.push(...items);
        return false; // Break the each loop
      }
    });
  }

  return ingredients;
};

/**
 * Determines if a list of text items is likely to be an ingredient list
 * @param items - Array of text items
 * @returns True if the list is likely an ingredient list
 */
const isLikelyIngredientList = (items: string[]): boolean => {
  if (items.length === 0) return false;
  if (items.length > 3 && items.length < 50) {
    // Check if at least 40% of items contain common measurement terms or numbers
    const measurementPattern = /\d+\s*(cup|tbsp|tsp|tablespoon|teaspoon|oz|ounce|pound|lb|g|gram|kg|ml|liter|l)\b|cup|cups|tablespoon|teaspoon|tsp|tbsp/i;

    const measurementCount = items.filter(item =>
      measurementPattern.test(item) || /\d+/.test(item)
    ).length;

    return (measurementCount / items.length) >= 0.4;
  }

  return false;
};

/**
 * Extracts instructions from HTML
 * @param $ - Cheerio instance
 * @returns Array of instruction strings
 */
const extractInstructions = ($: cheerio.CheerioAPI): string[] => {
  const instructions: string[] = [];

  // Common selectors for instruction lists
  const listSelectors = [
    '[itemprop="recipeInstructions"]',
    '.recipe-instructions li',
    '.instructions li',
    'ol.instructions li',
    '.steps li',
    'ol.steps li',
    '.directions li',
    'ol.directions li',
    '.method li',
    'ol.method li',
  ];

  // Try each selector
  for (const selector of listSelectors) {
    const items = $(selector);
    if (items.length > 0) {
      items.each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
          instructions.push(text);
        }
      });

      if (instructions.length > 0) {
        break;
      }
    }
  }

  // If we didn't find instructions with common selectors, look for paragraphs that might contain instructions
  if (instructions.length === 0) {
    const instructionContainers = [
      '.instructions',
      '.directions',
      '.steps',
      '.method',
      '.preparation',
    ];

    for (const selector of instructionContainers) {
      const container = $(selector).first();
      if (container.length > 0) {
        const paragraphs = container.find('p');
        if (paragraphs.length > 1) {
          paragraphs.each((_, p) => {
            const text = $(p).text().trim();
            if (text) {
              instructions.push(text);
            }
          });
        } else {
          // If no paragraphs, use the text content and try to split by numbers or line breaks
          const text = container.text().trim();
          const steps = splitIntoSteps(text);
          if (steps.length > 0) {
            instructions.push(...steps);
          }
        }

        if (instructions.length > 0) {
          break;
        }
      }
    }
  }

  // Last resort: look for any ordered list that might contain instructions
  if (instructions.length === 0) {
    $('ol').each((_, ol) => {
      const items: string[] = [];
      $(ol).find('li').each((_, li) => {
        const text = $(li).text().trim();
        items.push(text);
      });

      // Check if this list looks like instructions (each item relatively long)
      if (isLikelyInstructionList(items)) {
        instructions.push(...items);
        return false; // Break the each loop
      }
    });
  }

  return instructions;
};

/**
 * Splits a text block into instruction steps
 * @param text - Text to split
 * @returns Array of instruction steps
 */
const splitIntoSteps = (text: string): string[] => {
  // Try to split by numeric step indicators (1., 2., etc.)
  const stepsSplit = text.split(/\s*\d+\.\s+/);

  // If splitting worked well (created multiple items), clean them up and return
  if (stepsSplit.length > 1) {
    return stepsSplit
      .slice(1) // First item is often empty if text starts with "1."
      .map(step => step.trim())
      .filter(Boolean);
  }

  // Otherwise try to split by line breaks
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
};

/**
 * Determines if a list of text items is likely to be an instruction list
 * @param items - Array of text items
 * @returns True if the list is likely an instruction list
 */
const isLikelyInstructionList = (items: string[]): boolean => {
  if (items.length === 0) return false;
  if (items.length >= 2 && items.length < 30) {
    // Check average length of items (instructions tend to be longer than other list items)
    const avgLength = items.reduce((sum, item) => sum + item.length, 0) / items.length;
    // Look for verb-starting items
    const verbStartCount = items.filter(item =>
      /^(Add|Mix|Stir|Pour|Place|Heat|Cook|Bake|Combine|Preheat|Prepare)/i.test(item.trim())
    ).length;

    return avgLength > 30 || (verbStartCount / items.length) > 0.3;
  }

  return false;
};