import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../translations/en';
import de from '../translations/de';
import es from '../translations/es';

const i18n = new I18n({
  en,
  de,
  es,
});

// Add event listener type and storage
type LanguageChangeListener = () => void;
const languageChangeListeners: LanguageChangeListener[] = [];

// Add subscriber function
export const onLanguageChange = (listener: LanguageChangeListener) => {
  languageChangeListeners.push(listener);
  return () => {
    const index = languageChangeListeners.indexOf(listener);
    if (index > -1) {
      languageChangeListeners.splice(index, 1);
    }
  };
};

// Load the saved language or use device language
export const initializeLanguage = async () => {
  try {
    // Get device language first
    const deviceLanguage = getLocales()[0].languageCode;
    
    // Check for saved language preference
    const savedLanguage = await AsyncStorage.getItem('@user_language');
    
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    } else if (deviceLanguage && ['en', 'de', 'es'].includes(deviceLanguage)) {
      // If no saved preference but device language is supported, use it
      i18n.locale = deviceLanguage;
      // Save the device language as user preference
      await AsyncStorage.setItem('@user_language', deviceLanguage);
    } else {
      i18n.locale = 'de'; // Default to German
      // Save the default language as user preference
      await AsyncStorage.setItem('@user_language', 'de');
    }
  } catch (error) {
    console.error('Error loading language:', error);
    i18n.locale = 'de'; // Default to German on error
  }
};

// Update changeLanguage function
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('@user_language', language);
    i18n.locale = language;
    // Notify all listeners of the language change
    languageChangeListeners.forEach(listener => listener());
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export const getLanguage = () => {
  const languages = [{
    id: 'en',
    name: 'English',
    icon: '🇺🇸',
  }, {
    id: 'de',
    name: 'German',
    icon: '🇩🇪',
  }, {
    id: 'es',
    name: 'Spanish',
    icon: '🇪🇸',
  }]
  return languages.find(language => language.id === i18n.locale);
};

export default i18n;
