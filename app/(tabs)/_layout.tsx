import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { House, ChefHat, Calendar, ShoppingCart, Settings } from 'lucide-react-native';
import PlatformIcon from '@/components/PlatformIcon';
import i18n, { onLanguageChange } from '@/utils/i18n';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const [, setLanguageUpdate] = useState(0);

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = onLanguageChange(() => {
      // Force re-render by updating state
      setLanguageUpdate(prev => prev + 1);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

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
          title: i18n.t('tabs.discover'),
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={House} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cook"
        options={{
          title: i18n.t('tabs.cook'),
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={ChefHat} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: i18n.t('tabs.planner'),
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={Calendar} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: i18n.t('tabs.shopping'),
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={ShoppingCart} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: i18n.t('tabs.settings'),
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={Settings} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
