import * as InAppPurchases from 'expo-in-app-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Product IDs should match those in App Store Connect
export const SUBSCRIPTION_SKUS = {
  MONTHLY: 'com.kochassistent.subscription.monthly',
  ANNUAL: 'com.kochassistent.subscription.annual'
};

const FREE_GENERATIONS_KEY = 'free_recipe_generations';
const MAX_FREE_GENERATIONS = 3;

export async function initializePurchases() {
  try {
    await InAppPurchases.connectAsync();
  } catch (error) {
    console.error('Error initializing purchases:', error);
  }
}

export async function getSubscriptionProducts() {
  try {
    const { responseCode, results } = await InAppPurchases.getProductsAsync([
      SUBSCRIPTION_SKUS.MONTHLY,
      SUBSCRIPTION_SKUS.ANNUAL
    ]);

    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      return results;
    }
    return [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function purchaseSubscription(sku: string) {
  try {
    await InAppPurchases.purchaseItemAsync(sku);
    await AsyncStorage.setItem('hasActiveSubscription', 'true');
    return true;
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return false;
  }
}

export async function checkSubscriptionStatus() {
  if (Platform.OS === 'web') return true;
  
  try {
    const hasSubscription = await AsyncStorage.getItem('hasActiveSubscription');
    return hasSubscription === 'true';
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

export async function getFreeGenerationsRemaining() {
  try {
    const used = await AsyncStorage.getItem(FREE_GENERATIONS_KEY);
    const usedCount = used ? parseInt(used) : 0;
    return Math.max(0, MAX_FREE_GENERATIONS - usedCount);
  } catch (error) {
    console.error('Error getting free generations:', error);
    return 0;
  }
}

export async function incrementGenerationCount() {
  try {
    const used = await AsyncStorage.getItem(FREE_GENERATIONS_KEY);
    const usedCount = used ? parseInt(used) : 0;
    await AsyncStorage.setItem(FREE_GENERATIONS_KEY, (usedCount + 1).toString());
  } catch (error) {
    console.error('Error incrementing generation count:', error);
  }
}