import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
    const router = useRouter();
    
    // State για τα Switches (π.χ. Notifications)
    const [pushEnabled, setPushEnabled] = useState(true);

    // Συνάρτηση για Διαγραφή Λογαριασμού
    const handleDeleteAccount = () => {
        Alert.alert(
            "Διαγραφή Λογαριασμού",
            "Είστε σίγουρος; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.",
            [
                { text: "Ακύρωση", style: "cancel" },
                { text: "Διαγραφή", style: "destructive", onPress: () => console.log("Account Deleted") }
            ]
        );
    };

    // Ένα βοηθητικό component για κάθε γραμμή ρύθμισης για να μην γράφουμε τον ίδιο κώδικα συνέχεια
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
            {/* --- HEADER (Ίδιο με Notifications) --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ρυθμίσεις</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
                
                {/* --- SECTION 1: ΛΟΓΑΡΙΑΣΜΟΣ --- */}
                <Text style={styles.sectionHeader}>Λογαριασμός</Text>
                <View style={styles.card}>
                    <SettingItem 
                        icon="person-outline" 
                        title="Επεξεργασία Προφίλ" 
                        onPress={() => console.log("Edit Profile")} 
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="lock-closed-outline" 
                        title="Αλλαγή Κωδικού" 
                        onPress={() => console.log("Edw prepei na valw reset password ")} 
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="trash-outline" 
                        title="Διαγραφή Λογαριασμού" 
                        isDestructive={true}
                        onPress={handleDeleteAccount} 
                    />
                </View>

                {/* --- SECTION 2: ΕΦΑΡΜΟΓΗ --- */}
                <Text style={styles.sectionHeader}>Εφαρμογή</Text>
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
                        title="Γλώσσα (Ελληνικά)" 
                        onPress={() => console.log("Change Language")} 
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="speedometer-outline" 
                        title="Μονάδες Μέτρησης (km)" 
                        onPress={() => console.log("Change Units")} 
                    />
                </View>

                {/* --- SECTION 3: ΥΠΟΣΤΗΡΙΞΗ & LOGOUT --- */}
                <Text style={styles.sectionHeader}>Άλλα</Text>
                <View style={styles.card}>
                    <SettingItem 
                        icon="help-circle-outline" 
                        title="Βοήθεια & Υποστήριξη" 
                        onPress={() => console.log("Help")} 
                    />
                    <View style={styles.separator} />
                    <SettingItem 
                        icon="log-out-outline" 
                        title="Αποσύνδεση" 
                        onPress={() => router.replace('/loginRegister/login')} 
                    />
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    
    // Header Styles (Consistency)
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
        backgroundColor: "#f0f4f8", // Light blue bg for icons
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    destructiveIconBg: {
        backgroundColor: "#ffebee", // Light red bg
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
        marginLeft: 64, // Να ξεκινάει μετά το εικονίδιο
    },

    versionText: {
        textAlign: 'center',
        color: '#aaa',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 20
    }
});