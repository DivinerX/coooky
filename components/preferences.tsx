import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadUserPreferences, saveUserPreferences } from '@/utils/userPreferencesManager';
import { ChevronLeft, Plus, X } from 'lucide-react-native';
import PlatformIcon from '@/components/PlatformIcon';
import i18n from '@/utils/i18n';

interface PreferencesScreenProps {
  onClose: () => void;
}

interface PreferencesGroup {
  title: string;
  key: 'habits' | 'favorites' | 'allergies' | 'trends';
  placeholder: string;
}


export default function PreferencesScreen({ onClose }: PreferencesScreenProps) {
  const [preferences, setPreferences] = useState<{[key: string]: string[]}>({
    habits: [],
    favorites: [],
    allergies: [],
    trends: [],
  });
  const [newItems, setNewItems] = useState<{[key: string]: string}>({
    habits: '',
    favorites: '',
    allergies: '',
    trends: '',
  });

  const GROUPS: PreferencesGroup[] = [
    {
      title: i18n.t('settings.habits'),
      key: 'habits',
      placeholder: i18n.t('settings.habitsPlaceholder'),
    },
    {
      title: i18n.t('settings.favorites'),
      key: 'favorites',
      placeholder: i18n.t('settings.favoritesPlaceholder'),
    },
    {
      title: i18n.t('settings.allergies'),
      key: 'allergies',
      placeholder: i18n.t('settings.allergiesPlaceholder'),
    },
    {
      title: i18n.t('settings.trends'),
      key: 'trends',
      placeholder: i18n.t('settings.trendsPlaceholder'),
    },
  ];
  
  useEffect(() => {
    loadCurrentPreferences();
  }, []);

  const loadCurrentPreferences = async () => {
    const prefs = await loadUserPreferences();
    if (prefs) {
      setPreferences(prefs);
    }
  };

  const handleAddItem = async (group: string) => {
    const trimmedItem = newItems[group].trim();
    if (trimmedItem) {
      const updatedPreferences = {
        ...preferences,
        [group]: [...preferences[group], trimmedItem]
      };
      setPreferences(updatedPreferences);
      setNewItems(prev => ({
        ...prev,
        [group]: ''
      }));
      await saveUserPreferences(updatedPreferences);
    }
  };

  const handleRemoveItem = async (group: string, item: string) => {
    const updatedPreferences = {
      ...preferences,
      [group]: preferences[group].filter(i => i !== item)
    };
    setPreferences(updatedPreferences);
    await saveUserPreferences(updatedPreferences);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{i18n.t('settings.nutritionalPreferences')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {GROUPS.map(group => (
          <View key={group.key} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newItems[group.key]}
                onChangeText={(text) => setNewItems(prev => ({...prev, [group.key]: text}))}
                placeholder={group.placeholder}
                onSubmitEditing={() => handleAddItem(group.key)}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddItem(group.key)}
              >
                <PlatformIcon icon={Plus} size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.itemsContainer}>
              {preferences[group.key].map((item, index) => (
                <View key={index} style={styles.itemChip}>
                  <Text style={styles.itemText}>{item}</Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveItem(group.key, item)}
                    style={styles.removeButton}
                  >
                    <PlatformIcon icon={X} size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  itemText: {
    fontSize: 14,
    marginRight: 6,
    color: '#333',
  },
  removeButton: {
    padding: 2,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
