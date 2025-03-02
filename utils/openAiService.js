import OpenAI from 'openai';
import 'react-native-url-polyfill/auto';

const DEFAULT_API_KEY = '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';

// Initialize with default API key
let openai = new OpenAI({
  apiKey: DEFAULT_API_KEY,
  dangerouslyAllowBrowser: true
});

// Initialize the OpenAI client
export const initializeOpenAI = async () => {
  try {
    // Always return true since we're using a default API key
    return true;
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    return false;
  }
};

// Generate cooking suggestions
export const generateCookingSuggestions = async (preferences, recipeCount, portionsPerRecipe) => {
  try {
    if (!openai) {
      const initialized = await initializeOpenAI();
      if (!initialized) {
        throw new Error('OpenAI client not initialized. Please set API key first.');
      }
    }

    // Create a prompt that instructs the model exactly what we want
    const prompt = `Generate ${recipeCount} detailed recipes based on these preferences: "${preferences}".

For each recipe, please provide:
1. A descriptive title
2. Cooking time
3. Servings (${portionsPerRecipe} portions)
4. A list of all ingredients with exact quantities for ${portionsPerRecipe} portions
5. Step-by-step cooking instructions

Format the response as a structured JSON object with the following format:
{
  "recipes": [
    {
      "id": "1",
      "title": "Recipe Title",
      "time": "30 min",
      "servings": ${portionsPerRecipe},
      "image": "https://images.unsplash.com/photo-appropriate-image",
      "ingredients": [
        {"id": "1", "name": "Ingredient Name", "amount": "Amount with unit", "category": "Category"}
      ],
      "steps": ["Step 1 instruction", "Step 2 instruction"]
    }
  ]
}

For images, use appropriate food images from Unsplash with realistic URLs. Categorize ingredients in these categories: "Obst & Gemüse", "Milchprodukte", "Fleisch & Fisch", "Getreideprodukte", "Gewürze", "Öle & Essig", "Hülsenfrüchte", "Sonstiges".`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional chef assistant specializing in creating delicious recipes with precise ingredients and instructions. You always respond with properly formatted JSON that matches the requested structure exactly."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating cooking suggestions:', error);
    throw error;
  }
};

// Function to ensure we have the API key and initialize the client
export const ensureOpenAIInitialized = async () => {
  try {
    return await initializeOpenAI();
  } catch (error) {
    console.error('Error ensuring OpenAI is initialized:', error);
    return false;
  }
};
