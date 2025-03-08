import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { House, ChefHat, Calendar, ShoppingCart, Settings } from 'lucide-react-native';
import PlatformIcon from '@/components/PlatformIcon';
import i18n, { onLanguageChange, initializeLanguage } from '@/utils/i18n';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const [, setLanguageUpdate] = useState(0);
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);

  useEffect(() => {
    // Initialize language when component mounts
    const init = async () => {
      await initializeLanguage();
      setIsLanguageInitialized(true);
    };
    init();

    // Subscribe to language changes
    const unsubscribe = onLanguageChange(() => {
      setLanguageUpdate(prev => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  // Don't render tabs until language is initialized
  if (!isLanguageInitialized) {
    return null;
  }

  // Move tab titles into the render function so they update when component re-renders
  const tabTitles = {
    discover: i18n.t('tabs.discover'),
    cook: i18n.t('tabs.cook'),
    planner: i18n.t('tabs.planner'),
    shopping: i18n.t('tabs.shopping'),
    settings: i18n.t('tabs.settings'),
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: tabTitles.discover,
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={House} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cook"
        options={{
          title: tabTitles.cook,
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={ChefHat} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: tabTitles.planner,
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={Calendar} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: tabTitles.shopping,
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={ShoppingCart} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: tabTitles.settings,
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={Settings} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
