import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Λίστα γλωσσών
const LANGUAGES = [
  { code: 'el', label: '🇬🇷 Ελληνικά' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'fr', label: '🇫🇷 Français' },
];

interface ChangeLanguageModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguage: string; // π.χ. 'el' ή 'en'
  onSelectLanguage: (langCode: string) => void;
}

export default function ChangeLanguageModal({ 
  visible, 
  onClose, 
  selectedLanguage, 
  onSelectLanguage 
}: ChangeLanguageModalProps) {

  const handleSelect = (code: string) => {
    onSelectLanguage(code);
    onClose();
  };

  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={visible} 
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Επιλογή Γλώσσας</Text>
          
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isSelected = selectedLanguage === item.code;
              return (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelect(item.code)}>
                  <Text style={[styles.modalItemText, isSelected && { fontWeight: 'bold', color: '#003366' }]}>
                    {item.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color="green" />}
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Κλείσιμο</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Overlay όπως στο CreateRideScreen
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  // Content όπως στο CreateRideScreen
  modalContent: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    maxHeight: '50%' 
  },
  // Title όπως στο CreateRideScreen
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 15, 
    textAlign: 'center', 
    color: '#003366' 
  },
  // Item όπως στο CreateRideScreen
  modalItem: { 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  // Text όπως στο CreateRideScreen
  modalItemText: { 
    fontSize: 16, 
    color: '#333' 
  },
  // Close Button όπως στο CreateRideScreen
  closeButton: { 
    marginTop: 20, 
    backgroundColor: '#eee', 
    padding: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  closeButtonText: { 
    fontWeight: '700', 
    color: '#333' 
  },
});