import { getRideById, Ride } from "@/api/ridesApi"; // Το API σου
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function RideDetailsScreen() {
  const { id } = useLocalSearchParams(); // Πιάνουμε το ID από το url
  const router = useRouter();
  const { t } = useTranslation();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Μόλις έχουμε ID, καλούμε το Backend
    if (id) {
      fetchRideData(id.toString());
    }
  }, [id]);

  const fetchRideData = async (rideId: string) => {
    try {
      const data = await getRideById(rideId);
      setRide(data);
    } catch (error) {
      console.log("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text>Ride not found!</Text>
      </View>
    );
  }

  // 3. Εμφανίζουμε τα δεδομένα του συγκεκριμένου Ride
  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <Image 
        source={ride.image ? { uri: ride.image } : require('@/images/logo.webp')} 
        style={styles.image} 
      />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{ride.title}</Text>
        
        <View style={styles.infoRow}>
            <Ionicons name="person" size={18} color="#555"/>
            <Text style={styles.infoText}>{t('joinRide.organizer')}: {ride.organizer}</Text>
        </View>

        <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color="#555"/>
            <Text style={styles.infoText}>{t('joinRide.date')}: {ride.date}</Text>
        </View>

        <View style={styles.infoRow}>
            <Ionicons name="location" size={18} color="#555"/>
            <Text style={styles.infoText}>{t('joinRide.routeCaps')}: {ride.startLocation} ➝ {ride.finishLocation}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={18} color="#555"/>
          <Text style={styles.infoText}>{t('joinRide.expectedTime')}: {ride.expectedTime} minutes</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="bicycle-outline" size={18} color="#555"/>
          <Text style={styles.infoText}>{t('joinRide.category')}: {ride.category}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="flame-outline" size={18} color="#555"/>
          <Text style={styles.infoText}>{t('joinRide.difficulty')}: {ride.difficulty}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="trail-sign-outline" size={18} color="#555"/>
          <Text style={styles.infoText}>{t('joinRide.type')}: {ride.rideType}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('joinRide.description')}</Text>
        <Text style={styles.description}>{ride.description}</Text>

        {/* Εδώ εμφανίζουμε τα Stops αν υπάρχουν */}
        {ride.stops && ride.stops.length > 0 && (
            <View>
                <Text style={styles.sectionTitle}>{t('joinRide.stops')}</Text>
                {ride.stops.map((stop, index) => (
                    <Text key={index} style={styles.stopText}>• {stop}</Text>
                ))}
            </View>
        )}

        <View style={styles.miniButton}>
          <Text style={styles.miniButtonText}>{t('joinRide.joinRide')}</Text>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
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
  stopText: { fontSize: 15, marginLeft: 10, marginBottom: 2, color: "#444" },
   miniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#003366",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4
  },
  miniButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700"
  },
});