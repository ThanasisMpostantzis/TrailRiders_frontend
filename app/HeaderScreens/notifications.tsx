import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Τύπος δεδομένων για το Notification
interface NotificationItem {
    id: number;
    senderName: string;
    description: string;
    date: string;
    time: string;
    subject: string;
    isRead: boolean;
}

export default function MenuScreen() {
    const router = useRouter();

    // 1. ΠΡΕΠΕΙ ΝΑ ΤΑ ΒΑΛΩ DB ΚΑΙ ΝΑ ΤΡΑΒΑΩ ΑΠΟ ΕΚΕΙ
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        { id: 1, senderName: "Thanasis", description: "Thanasis has joined the ride via link.", date: "25-12-2025", time: "12:23", subject: "New Rider Joined", isRead: false },
        { id: 2, senderName: "System", description: "Your ride is scheduled for tomorrow.", date: "26-12-2025", time: "09:00", subject: "Ride Reminder", isRead: true },
        { id: 3, senderName: "George", description: "Sent you a message about the route.", date: "27-12-2025", time: "14:15", subject: "Message Received", isRead: false },
    ]);

    const [selectedIds, setSelectedIds] = useState<number[]>([]); // Ποια είναι επιλεγμένα
    const [viewingNotification, setViewingNotification] = useState<NotificationItem | null>(null); // Ποιο βλέπουμε αναλυτικά
    const [menuVisible, setMenuVisible] = useState(false); // Για το μενού με τις 3 τελίτσες


    // Επιλογή / Αποεπιλογή Checkbox
    const toggleSelection = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Διαγραφή επιλεγμένων
    const deleteSelected = () => {
        Alert.alert("Διαγραφή", "Είστε σίγουρος;", [
            { text: "Άκυρο", style: "cancel" },
            { 
                text: "Ναι", 
                onPress: () => {
                    setNotifications(notifications.filter(n => !selectedIds.includes(n.id)));
                    setSelectedIds([]);
                }
            }
        ]);
    };

    // Mark as Read / Unread (batch)
    const markAs = (status: boolean) => {
        const updated = notifications.map(n => {
            if (selectedIds.includes(n.id)) return { ...n, isRead: status };
            return n;
        });
        setNotifications(updated);
        setSelectedIds([]);
    };


    // Άνοιγμα Notification
    const openNotification = (item: NotificationItem) => {
        // Αν είμαστε σε selection mode, το click λειτουργεί ως select
        if (selectedIds.length > 0) {
            toggleSelection(item.id);
            return;
        }
        // Σημείωση ως διαβασμένο όταν ανοίγει
        const updated = notifications.map(n => n.id === item.id ? { ...n, isRead: true } : n);
        setNotifications(updated);
        
        setViewingNotification(item);
    };

    // Διαγραφή notification (από το detail view)
    const deleteSingle = () => {
        if (!viewingNotification) return;
        setNotifications(notifications.filter(n => n.id !== viewingNotification.id));
        setViewingNotification(null); // Επιστροφή πίσω
        setMenuVisible(false);
    };

    // 1. HEADER
    const renderHeader = () => {
        // A. Αν βλέπουμε λεπτομέρειες
        if (viewingNotification) {
            return (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { setViewingNotification(null); setMenuVisible(false); }}>
                        <Ionicons name="arrow-back" size={24} color="#003366" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Λεπτομέρειες</Text>
                    
                    <View>
                        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                            <Ionicons name="ellipsis-vertical" size={24} color="#003366" />
                        </TouchableOpacity>
                        
                        {/* Popup Menu για διαγραφή */}
                        {menuVisible && (
                            <View style={styles.popupMenu}>
                                <TouchableOpacity style={styles.menuItem} onPress={deleteSingle}>
                                    <Ionicons name="trash-outline" size={20} color="red" />
                                    <Text style={[styles.menuText, { color: 'red' }]}>Διαγραφή</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        // B. Αν έχουμε επιλέξει αντικείμενα
        if (selectedIds.length > 0) {
            return (
                <View style={[styles.header, { backgroundColor: '#e3f2fd' }]}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity onPress={() => setSelectedIds([])}>
                            <Ionicons name="close" size={24} color="#003366" />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { marginLeft: 10 }]}>{selectedIds.length} Επιλέχθηκαν</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => markAs(true)} style={styles.iconBtn}>
                            <Ionicons name="mail-open-outline" size={22} color="#003366" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => markAs(false)} style={styles.iconBtn}>
                            <Ionicons name="mail-outline" size={22} color="#003366" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={deleteSelected} style={styles.iconBtn}>
                            <Ionicons name="trash-outline" size={22} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // C. Κανονικό Header
        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ειδοποιήσεις</Text>
                <View style={{ width: 24 }} /> 
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            {viewingNotification ? (
                // --- DETAIL VIEW ---
                <ScrollView style={styles.content}>
                    <View style={styles.detailCard}>
                        <View style={styles.detailHeader}>
                            <Text style={styles.detailSubject}>{viewingNotification.subject}</Text>
                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={16} color="#666" />
                                <Text style={styles.detailDate}>{viewingNotification.date} • {viewingNotification.time}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <Text style={styles.senderText}>Από: <Text style={{fontWeight: 'bold'}}>{viewingNotification.senderName}</Text></Text>
                        
                        <Text style={styles.detailDescription}>
                            {viewingNotification.description}
                        </Text>
                    </View>
                </ScrollView>
            ) : (
                // --- LIST VIEW ---
                <ScrollView style={styles.content}>
                    {notifications.length === 0 ? (
                        <Text style={{textAlign: 'center', marginTop: 50, color: '#888'}}>Δεν υπάρχουν ειδοποιήσεις.</Text>
                    ) : (
                        notifications.map((item) => (
                            <TouchableOpacity 
                                key={item.id} 
                                style={[
                                    styles.notificationItem, 
                                    selectedIds.includes(item.id) && styles.selectedItem,
                                    !item.isRead && styles.unreadItem
                                ]}
                                onPress={() => openNotification(item)}
                                onLongPress={() => toggleSelection(item.id)}
                            >
                                {/* Checkbox Area */}
                                <TouchableOpacity onPress={() => toggleSelection(item.id)} style={styles.checkboxContainer}>
                                    <Ionicons 
                                        name={selectedIds.includes(item.id) ? "checkbox" : "square-outline"} 
                                        size={24} 
                                        color={selectedIds.includes(item.id) ? "#003366" : "#aaa"} 
                                    />
                                </TouchableOpacity>

                                {/* Info Area */}
                                <View style={styles.textContainer}>
                                    <View style={styles.rowBetween}>
                                        <Text style={[styles.subject, !item.isRead && styles.boldText]}>
                                            {item.subject}
                                        </Text>
                                        <Text style={styles.dateText}>{item.date}</Text>
                                    </View>
                                    
                                    <Text style={styles.description} numberOfLines={1}>
                                        {item.description}
                                    </Text>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    content: { flex: 1, padding: 16 },
    
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
        zIndex: 10
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#003366" },
    headerIcons: { flexDirection: 'row' },
    iconBtn: { marginLeft: 15 },
    
    // Popup Menu (3 dots)
    popupMenu: {
        position: 'absolute',
        top: 30,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 120,
        zIndex: 20
    },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    menuText: { marginLeft: 10, fontSize: 16 },

    // List Item style
    notificationItem: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    selectedItem: { backgroundColor: "#e3f2fd", borderColor: "#2196f3", borderWidth: 1 },
    unreadItem: { borderLeftWidth: 4, borderLeftColor: "#1DA1FA" },
    
    checkboxContainer: { paddingRight: 12 },
    textContainer: { flex: 1 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    
    subject: { fontSize: 16, color: "#333", flex: 1 },
    boldText: { fontWeight: "bold", color: "#000" },
    dateText: { fontSize: 12, color: "#888" },
    description: { fontSize: 14, color: "#666", marginBottom: 4 },
    timeText: { fontSize: 10, color: "#aaa", textAlign: 'right' },

    // Detail View style
    detailCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    detailHeader: { marginBottom: 15 },
    detailSubject: { fontSize: 22, fontWeight: 'bold', color: '#003366', marginBottom: 5 },
    dateRow: { flexDirection: 'row', alignItems: 'center' },
    detailDate: { marginLeft: 6, color: '#666', fontSize: 14 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    senderText: { fontSize: 16, color: '#444', marginBottom: 10 },
    detailDescription: { fontSize: 16, lineHeight: 24, color: '#333' }
});