import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import i18nInstance from '../../constants/index';

const LANGUAGES = [
  { code: 'el', label: '🇬🇷 Ελληνικά' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'alb', label: '🇦🇱 Shqip' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'bg', label: '🇧🇬 Български' },
];

interface ChangeLanguageModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguage: string; // π.χ. 'el' ή 'en'
}

export default function ChangeLanguageModal({ visible, onClose }: ChangeLanguageModalProps) {
  const { t } = useTranslation();

  const handleSelect = async (code: string) => {
    try {
      await i18nInstance.changeLanguage(code);
      await AsyncStorage.setItem('user-language', code);
      onClose();
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('select_language')}</Text>
          
          <FlatList
            data={LANGUAGES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isSelected = i18nInstance.language === item.code;
              return (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelect(item.code)}>
                  <Text style={[styles.modalItemText, isSelected && styles.selectedText]}>
                    {item.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color="green" />}
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, textAlign: 'center', color: '#003366' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { fontSize: 16, color: '#333' },
  selectedText: { fontWeight: 'bold', color: '#003366' },
  closeButton: { marginTop: 20, backgroundColor: '#eee', padding: 12, borderRadius: 10, alignItems: 'center' },
  closeButtonText: { fontWeight: '700', color: '#333' },
});