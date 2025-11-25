import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function menuScreen() {
  const router = useRouter();
  
  return (
    <ScrollView style={styles.container}>
        <View>
            <Text style={styles.title}>Ρυθμίσεις</Text>
        </View>
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>Λογαριασμός</Text>
            </View>
            <View>
                <Text style={styles.title}>Επεξεργασία Προφίλ</Text>
                <Text style={styles.title}>Αλλαγή Κωδικού</Text>
                <Text style={styles.title}>Διαγραφή Λογαριασμού</Text>
            </View>
            <View>
                <Text style={styles.title}>Push Notifications</Text>
            </View>
            <View>
                <Text style={styles.title}>Γλώσσα</Text>
                <Text style={styles.title}>Μονάδες Μέτρησης</Text>
            </View>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 250, resizeMode: "cover" },
  backButton: {
    position: "absolute", top: 40, left: 20, 
    backgroundColor: "rgba(0,0,0,0.5)", padding: 8, borderRadius: 20 
  },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#003366", marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: 16, color: "#444" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 5 },
  description: { fontSize: 15, lineHeight: 22, color: "#666" },
  stopText: { fontSize: 15, marginLeft: 10, marginBottom: 2, color: "#444" }
});