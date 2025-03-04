import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Heart, CircleAlert as AlertCircle, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import PreferencesScreen from '../../components/preferences';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [preferencesVisible, setPreferencesVisible] = useState(false);

  const openPreferences = () => {
    setPreferencesVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Einstellungen</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <User size={30} color="#FFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Max Mustermann</Text>
            <Text style={styles.profileEmail}>max.mustermann@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Bearbeiten</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allgemein</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#666" style={styles.settingIcon} />
              <Text style={styles.settingText}>Benachrichtigungen</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#DDD', true: '#FF6B35' }}
              thumbColor="#FFF"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openPreferences}
          >
            <View style={styles.settingInfo}>
              <Heart size={20} color="#666" style={styles.settingIcon} />
              <Text style={styles.settingText}>Ernährungspräferenzen</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App-Einstellungen</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Dunkler Modus</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#DDD', true: '#FF6B35' }}
              thumbColor="#FFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Sprachführung</Text>
            </View>
            <Switch
              value={voiceGuide}
              onValueChange={setVoiceGuide}
              trackColor={{ false: '#DDD', true: '#FF6B35' }}
              thumbColor="#FFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Sprache</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>Deutsch</Text>
              <ChevronRight size={20} color="#CCC" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hilfe & Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <HelpCircle size={20} color="#666" style={styles.settingIcon} />
              <Text style={styles.settingText}>Häufig gestellte Fragen</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Kontakt</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Datenschutz</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>Nutzungsbedingungen</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Abmelden</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      <Modal
        visible={preferencesVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPreferencesVisible(false)}
      >
        <PreferencesScreen onClose={() => setPreferencesVisible(false)} />
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 20,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  editButtonText: {
    fontSize: 14,
    color: '#FF6B35',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
});
