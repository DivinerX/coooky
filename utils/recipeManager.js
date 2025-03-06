import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOPPING_LIST_KEY = 'shopping_lists';
const CURRENT_RECIPE_KEY = 'current_recipe';
let recipes = [];
let currentRecipe = null;

// Extract all unique recipes from shopping list weeks
const loadRecipesFromStorage = async () => {
  try {
    const shoppingListData = await AsyncStorage.getItem(SHOPPING_LIST_KEY);
    if (!shoppingListData) return [];

    const weeks = JSON.parse(shoppingListData);
    if (!Array.isArray(weeks)) return [];

    const uniqueRecipes = new Map();

    weeks.forEach(week => {
      // Check if week and week.days exist
      if (week && week.days && typeof week.days === 'object') {
        Object.values(week.days).forEach(dayRecipes => {
          // Check if dayRecipes is an array
          if (Array.isArray(dayRecipes)) {
            dayRecipes.forEach(recipe => {
              // Check if recipe is valid and has an id
              if (recipe && recipe.id) {
                if (!uniqueRecipes.has(recipe.id)) {
                  uniqueRecipes.set(recipe.id, recipe);
                }
              }
            });
          }
        });
      }
    });

    return Array.from(uniqueRecipes.values());
  } catch (error) {
    console.error('Error loading recipes from storage:', error);
    return [];
  }
};

// Load recipes
const loadRecipes = async () => {
  recipes = await loadRecipesFromStorage();
};

// Get all recipes
export const getAllRecipes = async () => {
  await loadRecipes();
  return recipes;
};

// Get recipe by ID
export const getRecipeById = async (id) => {
  await loadRecipes();
  return recipes.find(recipe => recipe.id === id) || null;
};

// Set current recipe
export const setCurrentRecipe = async (recipe) => {
  try {
    currentRecipe = recipe;
    await AsyncStorage.setItem(CURRENT_RECIPE_KEY, JSON.stringify(recipe));
  } catch (error) {
    console.error('Error setting current recipe:', error);
  }
};

export const getSyncCurrentRecipe = () => {
  return currentRecipe;
}

// Get current recipe
export const getCurrentRecipe = async () => {
  try {
    if (!currentRecipe) {
      const storedRecipe = await AsyncStorage.getItem(CURRENT_RECIPE_KEY);
      if (storedRecipe) {
        currentRecipe = JSON.parse(storedRecipe);
      }
    }
    return currentRecipe;
  } catch (error) {
    console.error('Error getting current recipe:', error);
    return null;
  }
};

// Search recipes by query
export const searchRecipes = async (query) => {
  try {
    await loadRecipes();
    
    if (!query || query.trim() === '') {
      return recipes;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return recipes.filter(recipe => {
      // Search in title
      if (recipe.title.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      
      // Search in tags
      if (recipe.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
        return true;
      }
      
      // Search in ingredients
      if (recipe.ingredients?.some(ingredient => 
        ingredient.name.toLowerCase().includes(normalizedQuery)
      )) {
        return true;
      }
      
      return false;
    });
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
};

// Filter recipes by tags
export const filterRecipesByTags = async (tags) => {
  try {
    await loadRecipes();
    
    if (!tags || tags.length === 0) {
      return recipes;
    }
    
    return recipes.filter(recipe => {
      return tags.some(tag => recipe.tags?.includes(tag));
    });
  } catch (error) {
    console.error('Error filtering recipes by tags:', error);
    return [];
  }
};
