import AsyncStorage from '@react-native-async-storage/async-storage';

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
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return null;
  }
};

export const saveUserPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
};

export const updateUserPreferences = async (newPreferences) => {
  try {
    const current = await loadUserPreferences() || {};
    const updated = { ...current, ...newPreferences };
    await saveUserPreferences(updated);
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
};

export const analyzeUserInput = (input) => {
  // Analyze user input text to extract preferences
  const preferences = {
    habits: [],
    favorites: [],
    allergies: [],
    trends: []
  };

  const lowerInput = input.toLowerCase();

  // Check for dietary habits
  if (lowerInput.includes('vegetar')) preferences.habits.push('vegetarian');
  if (lowerInput.includes('vegan')) preferences.habits.push('vegan');
  
  // Check for cuisine trends
  if (lowerInput.includes('asiat')) preferences.trends.push('asian');
  if (lowerInput.includes('italien')) preferences.trends.push('italian');
  if (lowerInput.includes('mexikan')) preferences.trends.push('mexican');
  
  // Check for allergies
  if (lowerInput.includes('allergi')) {
    if (lowerInput.includes('nuss')) preferences.allergies.push('nuts');
    if (lowerInput.includes('gluten')) preferences.allergies.push('gluten');
    if (lowerInput.includes('laktose')) preferences.allergies.push('lactose');
  }

  return preferences;
};