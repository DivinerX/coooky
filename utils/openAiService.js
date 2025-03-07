import OpenAI from 'openai';
import 'react-native-url-polyfill/auto';
import { loadUserPreferences } from './userPreferencesManager';
import { getLanguage } from './i18n';
const DEFAULT_API_KEY = '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';

let openai = new OpenAI({
  apiKey: DEFAULT_API_KEY,
  dangerouslyAllowBrowser: true
});

// Check if query is cooking-related using AI
export const checkIfCookingRelated = async (text) => {
  try {
    const language = getLanguage();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: `You are a cooking topic validator. Your job is to determine if a query is cooking-related or not. Respond with a JSON object containing a boolean 'isCookingRelated' field and a 'message' field. 

Consider these as cooking-related:
- Direct cooking queries
- Hesitating responses like "I'm not sure", "surprise me", "whatever"
- General food preferences
- Uncertain or open-ended food-related responses

For clearly non-cooking queries (like weather, sports, or technical questions), provide a polite response in ${language.name} explaining that you can only help with cooking-related topics. The tone should be friendly and helpful.`
        },
        {
          role: "user",
          content: `Determine if this query is cooking-related: "${text}"`
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error checking if query is cooking-related:', error);
    throw error;
  }
};

export const generateCookingSuggestions = async (preferences, recipeCount, portionsPerRecipe) => {
  try {
    const userPrefs = await loadUserPreferences();
    const language = getLanguage();
    
    let systemPrompt = `You are a professional chef assistant specializing in creating delicious recipes in language ${language.name}.`;
    
    if (userPrefs) {
      systemPrompt += "\nConsider these user preferences:";
      if (userPrefs.habits?.length) systemPrompt += `\nDietary habits: ${userPrefs.habits.join(', ')}`;
      if (userPrefs.allergies?.length) systemPrompt += `\nAllergies (MUST avoid): ${userPrefs.allergies.join(', ')}`;
      if (userPrefs.favorites?.length) systemPrompt += `\nFavorite foods: ${userPrefs.favorites.join(', ')}`;
      if (userPrefs.trends?.length) systemPrompt += `\nPreferred cuisines: ${userPrefs.trends.join(', ')}`;
    }

    const prompt = `Generate ${recipeCount} detailed recipes based on these preferences: "${preferences}".
${userPrefs?.allergies?.length ? '\nIMPORTANT: Strictly avoid these allergens: ' + userPrefs.allergies.join(', ') : ''}

For each recipe, please provide:
1. A descriptive title
2. Cooking time
3. Servings (${portionsPerRecipe} portions)
4. A list of all ingredients with exact quantities for ${portionsPerRecipe} portions
5. Step-by-step cooking instructions

If the user's query indicates uncertainty (e.g., contains phrases like "not sure", "whatever", "surprise me", or is vague), generate random recipes with these guidelines (in addition to the above):
- Mix different cuisine types (e.g., Italian, Asian, Mediterranean)
- Include a variety of main ingredients (e.g., different proteins, vegetarian options)
- Keep recipes relatively simple and approachable
- Focus on popular, well-liked dishes

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

For images, use appropriate food images from Unsplash with realistic URLs. Categorize ingredients in these categories: "fruitVegetables", "dairyProducts", "meatFish", "grainProducts", "spices", "oilsVinegar", "legumes", "other".`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating cooking suggestions:', error);
    throw error;
  }
};

export const analyzeUserPreferences = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a dietary preferences analyzer. Extract dietary preferences from user input and return them in a structured JSON format with the following schema: { \"habits\": [\"vegetarian\", \"vegan\", etc], \"allergies\": [\"peanuts\", \"gluten\", etc], \"favorites\": [\"pasta\", \"rice\", etc], \"trends\": [\"italian\", \"asian\", etc] }. Each field must be an array of strings, even if empty. Focus on identifying dietary habits, allergies, favorite foods, and preferred cuisines/trends from the input."
        },
        {
          role: "user",
          content: `Analyze these dietary preferences and respond with JSON: "${text}"`
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    return {
      habits: result.habits || [],
      favorites: result.favorites || [],
      allergies: result.allergies || [],
      trends: result.trends || []
    };
  } catch (error) {
    console.error('Error analyzing user preferences:', error);
    throw error;
  }
};
