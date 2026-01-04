import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChangeLanguageModal from "./changeLanguage";
import DeleteAccountModal from "./deleteUser";

export default function SettingsScreen() {
    const LANGUAGE_LABELS: { [key: string]: string } = {
        'el': 'Ελληνικά',
        'en': 'English',
        'de': 'Deutsch',
        'it': 'Italiano',
        'fr': 'Français'
    };

    const router = useRouter();
    
    const [modalVisible, setModalVisible] = useState(false);
    const [username, setUsername] = useState('Loading...');
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language?.substring(0, 2) || 'el';
    const [changeLangVisible, setChangeLangVisible] = useState(false);

    const [pushEnabled, setPushEnabled] = useState(true);

    useEffect(() => {
        const loadUsername = async () => {
            const user = await AsyncStorage.getItem("username");
            if (user) {
                setUsername(user);
            } else {
                setUsername('User');
            }
        };
        loadUsername();
    }, []);


    // Modal Handle
    const handleDeleteAccount = () => {
        setModalVisible(true);
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        console.log("Successfull Logout: Storage Cleared")
        router.replace('/loginRegister/login');
    }

    const SettingItem = ({ icon, title, onPress, isDestructive = false, hasSwitch = false, switchValue = false, onSwitchChange = () => {} }: any) => (
        <TouchableOpacity 
            style={styles.settingRow} 
            onPress={hasSwitch ? () => onSwitchChange(!switchValue) : onPress}
            activeOpacity={hasSwitch ? 1 : 0.7}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, isDestructive && styles.destructiveIconBg]}>
                    <Ionicons 
                        name={icon} 
                        size={22} 
                        color={isDestructive ? "red" : "#003366"} 
                    />
                </View>
                <Text style={[styles.settingText, isDestructive && styles.destructiveText]}>
                    {title}
                </Text>
            </View>

            {hasSwitch ? (
                <Switch 
                    value={switchValue} 
                    onValueChange={onSwitchChange}
                    trackColor={{ false: "#767577", true: "#003366" }}
                    thumbColor={switchValue ? "#fff" : "#f4f3f4"}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* --- Modal --- */}
            <DeleteAccountModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                currentUsername={username}
            />

            {/* --- HEADER --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.settings')}</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
                
                {/* --- SECTION 1: ΛΟΓΑΡΙΑΣΜΟΣ --- */}
                <Text style={styles.sectionHeader}>{t('settings.accountCaps')} ({username})</Text>
                <View style={styles.card}>
                    <SettingItem 
                        icon="person-outline" 
                        title={t('settings.editProfile')} 
                        onPress={() => router.push("/modal")}
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="lock-closed-outline" 
                        title={t('settings.changePassword')} 
                        onPress={() => router.push("/HeaderScreens/changePassword")} 
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="trash-outline" 
                        title={t('settings.deleteAccount')} 
                        isDestructive={true}
                        onPress={handleDeleteAccount}
                    />
                </View>

                {/* --- SECTION 2: ΕΦΑΡΜΟΓΗ --- */}
                <Text style={styles.sectionHeader}>{t('settings.appCaps')}</Text>
                <View style={styles.card}>
                    <SettingItem 
                        icon="notifications-outline" 
                        title="Push Notifications" 
                        hasSwitch={true}
                        switchValue={pushEnabled}
                        onSwitchChange={setPushEnabled}
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="globe-outline" 
                        title={t('settings.language') + " (" + LANGUAGE_LABELS[currentLang] + ")"} 
                        onPress={() => setChangeLangVisible(true)} 
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="speedometer-outline" 
                        title={`${t('settings.measureUnits')} (km)`}
                        onPress={() => console.log("Change Units")} 
                    />
                </View>

                {/* --- SECTION 3: ΥΠΟΣΤΗΡΙΞΗ & LOGOUT --- */}
                <Text style={styles.sectionHeader}>{t('settings.other')}</Text>
                <View style={styles.card}>
                    <SettingItem 
                        icon="help-circle-outline" 
                        title={t('settings.helpAndSupport')}
                        onPress={() => console.log("Help")} 
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="log-out-outline" 
                        title={t('settings.logout')}
                        onPress={() => handleLogout()} 
                    />
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>

                <ChangeLanguageModal
                    visible={changeLangVisible}
                    onClose={() => setChangeLangVisible(false)}
                    selectedLanguage={currentLang}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    // Header Styles
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        height: 60,
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#003366" },
    content: { padding: 16 },
    // Section Styles
    sectionHeader: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 8,
        marginTop: 10,
        marginLeft: 4,
        textTransform: 'uppercase'
    },
    // Card Styles (To match notification items)
    card: {
        backgroundColor: "white",
        borderRadius: 12,
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20,
    },
    // Row Styles
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#f0f4f8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    destructiveIconBg: {
        backgroundColor: "#ffebee",
    },
    settingText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    destructiveText: {
        color: "red",
    },
    // Separator
    separator: {
        height: 1,
        backgroundColor: "#f0f0f0",
        marginLeft: 64,
    },
    versionText: {
        textAlign: 'center',
        color: '#aaa',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 20
    }
});