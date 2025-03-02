import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, ChefHat, Calendar, ShoppingCart, Settings } from 'lucide-react-native';
import PlatformIcon from '../../components/PlatformIcon';

export default function TabLayout() {
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
          title: 'Entdecken',
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={Home} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cook"
        options={{
          title: 'Kochen',
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={ChefHat} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Wochenplan',
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={Calendar} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Einkaufsliste',
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={ShoppingCart} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Einstellungen',
          tabBarIcon: ({ color, size }) => <PlatformIcon icon={Settings} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}