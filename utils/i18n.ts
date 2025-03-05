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

// Set the default locale
i18n.defaultLocale = 'de';
i18n.enableFallback = true;

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

// Function to change language
export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('@user_language', language);
    i18n.locale = language;
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
