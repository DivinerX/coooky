import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Heart, CircleAlert as AlertCircle, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import i18n, { changeLanguage } from '../../utils/i18n';
import PreferencesScreen from '../../components/preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.locale);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' }
  ];

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('@user_language');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setSelectedLanguage(languageCode);
    setLanguageModalVisible(false);
  };

  const openPreferences = () => {
    setPreferencesVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.general')}</Text>
          
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openPreferences}
          >
            <View style={styles.settingInfo}>
              <Heart size={20} color="#666" style={styles.settingIcon} />
              <Text style={styles.settingText}>{i18n.t('settings.nutritionalPreferences')}</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.appSettings')}</Text>
          
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>{i18n.t('settings.language')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.valueContainer}
              onPress={() => setLanguageModalVisible(true)}
            >
              <Text style={styles.valueText}>
                {languages.find(lang => lang.code === selectedLanguage)?.name}
              </Text>
              <ChevronRight size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.helpSupport')}</Text>
         
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>{i18n.t('settings.contact')}</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>{i18n.t('settings.privacy')}</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>{i18n.t('settings.terms')}</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>{i18n.t('settings.version')}</Text>
      </ScrollView>

      <Modal
        visible={preferencesVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPreferencesVisible(false)}
      >
        <PreferencesScreen onClose={() => setPreferencesVisible(false)} />
      </Modal>

      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('settings.selectLanguage')}</Text>
            {languages.map(language => (
              <TouchableOpacity
                key={language.code}
                style={styles.languageOption}
                onPress={() => handleLanguageChange(language.code)}
              >
                <Text style={[
                  styles.languageText,
                  selectedLanguage === language.code && styles.selectedLanguage
                ]}>
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.cancelText}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageText: {
    fontSize: 16,
  },
  selectedLanguage: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FF6B35',
    fontSize: 16,
  },
});
