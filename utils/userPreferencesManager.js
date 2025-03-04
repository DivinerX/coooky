import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeUserPreferences } from './openAiService';

const USER_PREFERENCES_KEY = 'user_food_preferences';

export const UserPreferenceTypes = {
  HABITS: 'habits',         // e.g., vegetarian, vegan, etc.
  FAVORITES: 'favorites',   // favorite cuisines or dishes
  ALLERGIES: 'allergies',   // food allergies
  TRENDS: 'trends'         // preferred cuisine styles
};

export const loadUserPreferences = async () => {
  try {
    const stored = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    if (!stored) return null;
    
    const prefs = JSON.parse(stored);
    // Check if preferences are actually empty
    if (!prefs.habits.length && 
        !prefs.favorites.length && 
        !prefs.allergies.length && 
        !prefs.trends.length) {
      return null;
    }
    return prefs;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
};

export const saveUserPreferences = async (preferences) => {
  try {
    // Ensure we have valid preference object structure
    const validPreferences = {
      habits: preferences.habits || [],
      favorites: preferences.favorites || [],
      allergies: preferences.allergies || [],
      trends: preferences.trends || []
    };
    
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(validPreferences));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
};

export const updateUserPreferences = async (newPreferences) => {
  try {
    const current = await loadUserPreferences();
    const updated = { ...current, ...newPreferences };
    await saveUserPreferences(updated);
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
};

export const analyzeUserInput = async (input) => {
  try {
    const preferences = await analyzeUserPreferences(input);
    return preferences;
  } catch (error) {
    console.error('Error analyzing user input:', error);
    // Return empty preferences as fallback
    return {
      habits: [],
      favorites: [],
      allergies: [],
      trends: []
    };
  }
};
