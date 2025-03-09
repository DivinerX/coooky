import RNIap, {
  Product,
  PurchaseError,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
// import SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Product IDs should match those in App Store Connect
export const SUBSCRIPTION_SKUS = {
  MONTHLY: 'com.kochassistent.subscription.monthly',
  ANNUAL: 'com.kochassistent.subscription.annual'
} as const;

const FREE_GENERATIONS_KEY = 'free_recipe_generations';
const MAX_FREE_GENERATIONS = 1;

let purchaseUpdateSubscription: any;
let purchaseErrorSubscription: any;

export async function initializePurchases() {
  if (Platform.OS === 'web') return;

  try {
    await RNIap.initConnection();
    
    // Set up listeners
    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          await finishTransaction({ purchase });
          await AsyncStorage.setItem('hasActiveSubscription', 'true');
        } catch (error) {
          console.error('Error finishing transaction:', error);
        }
      }
    });

    purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.error('Purchase error:', error);
    });

  } catch (error) {
    console.error('Error initializing purchases:', error);
  }
}

export function endPurchaseConnection() {
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
  }
  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
  }
  RNIap.endConnection();
}

export async function getSubscriptionProducts(): Promise<Product[]> {
  if (Platform.OS === 'web') return [];

  try {
    const products = await RNIap.getProducts({
      skus: [SUBSCRIPTION_SKUS.MONTHLY, SUBSCRIPTION_SKUS.ANNUAL]
    });
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function purchaseSubscription(sku: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    await RNIap.requestSubscription({
      sku: sku
    });
    return true;
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return false;
  }
}

export async function checkSubscriptionStatus() {
  if (Platform.OS === 'web') return false;
  
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
    await AsyncStorage.setItem(FREE_GENERATIONS_KEY, (usedCount).toString());
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