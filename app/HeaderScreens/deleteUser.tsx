import { deleteAccount } from "@/api/authApi";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface DeleteModalProps {
    isVisible: boolean;
    onClose: () => void;
    currentUsername: string;
}

export default function DeleteAccountModal({ isVisible, onClose, currentUsername }: DeleteModalProps) {
    const router = useRouter();
    const [confirmUsername, setConfirmUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const performDeletion = async () => {
        if (confirmUsername !== currentUsername) {
            Alert.alert("Σφάλμα", "Το όνομα χρήστη που πληκτρολογήσατε δεν ταιριάζει.");
            return;
        }

        setLoading(true);
        
        // --------- SSSOOOOOOOSSS ---------
        // ΤΟ ID ΠΡΕΠΕΙ ΝΑ ΣΤΕΛΝΕΤΑΙ ΜΕ PROPS ( ΓΙΑ ΑΛΛΑΓΗ )
        const userId = await AsyncStorage.getItem("userId");
        
        try {
            const response = await deleteAccount(userId, currentUsername, confirmUsername);
            console.log(userId, currentUsername, confirmUsername);
            if (response && response.type === 'success') {
                 Alert.alert("Επιτυχία", "Ο λογαριασμός διαγράφηκε επιτυχώς.");
                 await AsyncStorage.clear();
                 router.replace("/loginRegister/loginRegisterScreen");
            } else {
                 throw new Error(response.message || "Unknown error occurred.");
            }

        } catch (error) {
            console.error("Error deleting account:", error);
            Alert.alert("Αποτυχία", "Δεν ήταν δυνατή η διαγραφή. Δοκιμάστε ξανά.");
        } finally {
            setLoading(false);
            onClose(); // Κλείνει το modal
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Οριστική Διαγραφή Λογαριασμού</Text>
                    <Text style={styles.modalText}>
                        Για λόγους ασφαλείας, πληκτρολογήστε το όνομα χρήστη σας ({currentUsername}) για επιβεβαίωση. 
                        Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Όνομα Χρήστη"
                        placeholderTextColor="#A0A5B9"
                        value={confirmUsername}
                        onChangeText={setConfirmUsername}
                        autoCapitalize="none"
                        editable={!loading}
                    />

                    <View style={styles.buttonContainer}>
                        {/* Ακύρωση */}
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Ακύρωση</Text>
                        </TouchableOpacity>

                        {/* Διαγραφή */}
                        <TouchableOpacity
                            style={[styles.modalButton, styles.deleteButton]}
                            onPress={performDeletion}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.deleteText}>Διαγραφή</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: "white",
        borderRadius: 16,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#C0392B",
        marginBottom: 10,
    },
    modalText: {
        marginBottom: 25,
        textAlign: "center",
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    input: {
        width: '100%',
        backgroundColor: "#F5F7F9",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#E0E5EB'
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#E0E5EB',
    },
    deleteButton: {
        backgroundColor: '#C0392B',
    },
    cancelText: {
        color: '#333',
        fontWeight: 'bold',
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
});