import { changePassword } from "@/api/authApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


interface PasswordInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    placeholder: string;
}

const PasswordInput = ({ 
    label, 
    value, 
    onChangeText, 
    isVisible, 
    setIsVisible, 
    placeholder 
}: PasswordInputProps) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.modernInputWrapper}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#A0A5B9"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!isVisible}
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.eyeIcon}>
                <Ionicons 
                    name={isVisible ? "eye-off" : "eye"} 
                    size={22} 
                    color="#A0A5B9"
                />
            </TouchableOpacity>
        </View>
    </View>
);

export default function ChangePasswordScreen() {
    const router = useRouter();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const handleChangePassword = async () => {
        const id = await AsyncStorage.getItem("userId");
        if (!newPassword || !oldPassword || !confirmPassword) {
            Alert.alert("Συμπλήρωσε όλα τα πεδία.")
        }
        if(newPassword !== confirmPassword) {
            Alert.alert("Επιβέβαιωσε σωστά τον κωδικό.")
        } else {
            const response = await changePassword(id, oldPassword, newPassword, confirmPassword);
            if (response && response.type === 'success') {
                Alert.alert("Password changed Successfully");
                router.replace("/(tabs)/home");
            } else {
                throw new Error(response.message || "Unknown error occurred.");
            }
            console.log("Password changed");
        }
    }

return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                {/* --- HEADER --- */}
                <View style={styles.modernHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    style={styles.content} 
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.pageTitle}>Αλλαγή Κωδικού</Text>
                    <Text style={styles.pageSubtitle}>Δημιουργήστε έναν ισχυρό κωδικό για την ασφάλειά σας.</Text>
                    <View style={styles.formContainer}>
                        <PasswordInput 
                            label="Τρέχων Κωδικός"
                            placeholder="••••••••"
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            isVisible={showOldPass}
                            setIsVisible={setShowOldPass}
                        />

                        <PasswordInput 
                            label="Νέος Κωδικός"
                            placeholder="••••••••"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            isVisible={showNewPass}
                            setIsVisible={setShowNewPass}
                        />

                        <PasswordInput 
                            label="Επιβεβαίωση Νέου Κωδικού"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            isVisible={showConfirmPass}
                            setIsVisible={setShowConfirmPass}
                        />
                    </View> 
                </ScrollView>

                {/* --- BUTTON --- */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.modernButton} onPress={() => handleChangePassword()}>
                        <Text style={styles.modernButtonText}>Αποθήκευση</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    
    // --- HEADER STYLES ---
    modernHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "#ffffff",
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },

    content: { paddingHorizontal: 24 },
    pageTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1A1A1A",
        marginTop: 10,
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 15,
        color: "#8E8E93",
        marginBottom: 32,
        lineHeight: 22,
    },
    formContainer: {
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 8,
        marginLeft: 4,
    },
    modernInputWrapper: {
        backgroundColor: "#F5F7F9",
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 58,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 17,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 8,
    },
    footer: {
        padding: 24,
        backgroundColor: '#ffffff',
    },
    modernButton: {
        backgroundColor: '#1DA1FA',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#1DA1FA",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    modernButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    }
});