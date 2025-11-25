import { getAllRidesApi, Ride } from '@/api/ridesApi';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------
const BASE_URL = "http://192.168.1.36:3000"; // → ΒΑΛΕ ΤΟ BACKEND IP ΣΟΥ


// ---------------------------------------------------------
// HELPER: υπολογισμός απόστασης
// ---------------------------------------------------------
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (Math.sin(dLon / 2) ** 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


// ---------------------------------------------------------
// MAIN SCREEN
// ---------------------------------------------------------
export default function JoinRideScreen() {
  const router = useRouter();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"nearby" | "all">("nearby");

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  
  // ---------------------------------------------------------
  // GET USER LOCATION
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);


  // ---------------------------------------------------------
  // FETCH RIDES FROM BACKEND
  // ---------------------------------------------------------
  const fetchRides = async () => {
    try {
      const data = await getAllRidesApi();
      setRides(data);
    } catch (error) {
      console.log("Error fetching rides:", error);
      setLoading(false); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);


  // ---------------------------------------------------------
  // JOIN RIDE API CALL
  // ---------------------------------------------------------
  const handleJoinRide = async (rideId: number) => {
    try {
      const userId = 2;  // 👉 ΕΔΩ ΑΡΓΟΤΕΡΑ ΘΑ ΒΑΛΟΥΜΕ TOKEN

      await axios.post(`${BASE_URL}/rides/join/${rideId}`, { userId });

      Alert.alert("Joined!", "Μπήκες στο ride 👍");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Δεν μπόρεσα να σε βάλω στο ride.");
    }
  };


  // ---------------------------------------------------------
  // LOADING SCREEN
  // ---------------------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#003366" />
      </SafeAreaView>
    );
  }


  // ---------------------------------------------------------
  // RENDER EACH RIDE
  // ---------------------------------------------------------
  const renderRide = ({ item }: { item: Ride }) => {

    let distanceText = "Unknown";

    if (userLocation && item.startLat && item.startLng) {
      const distance = getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        item.startLat,
        item.startLng
      );
      distanceText = `${distance.toFixed(1)} km`;
    }

    return (
      <View style={styles.card}>
        
        <Image
          source={require('@/images/logo.webp')}
          style={styles.mapImage}
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.date}>Aug 25, 9:00 PM</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Upcoming Event</Text>
          </View>

          <Text style={styles.distance}>{distanceText}</Text>
        </View>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinRide(item.id)}
        >
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      </View>
    );
  };


  // ---------------------------------------------------------
  // FILTER LOGIC
  // ---------------------------------------------------------

  let filteredRides = rides;

  if (selectedTab === "nearby" && userLocation) {
    filteredRides = [...rides].sort((a, b) => {
      const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.startLat, a.startLng);
      const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.startLat, b.startLng);
      return distA - distB;
    });
  }


  // ---------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Join Ride</Text>

        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="black" 
            onPress={() => router.push('/HeaderScreens/notifications')} />
          <Ionicons name="menu" size={26} color="black" style={{ marginLeft: 16 }}
            onPress={() => router.push('/HeaderScreens/menu')} />
        </View>
      </View>


      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "nearby" && styles.activeTab]}
          onPress={() => setSelectedTab("nearby")}
        >
          <Text style={[styles.tabText, selectedTab === "nearby" && styles.activeTabText]}>
            Nearby Rides
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "all" && styles.activeTab]}
          onPress={() => setSelectedTab("all")}
        >
          <Text style={[styles.tabText, selectedTab === "all" && styles.activeTabText]}>
            All Available Rides
          </Text>
        </TouchableOpacity>
      </View>


      {/* RIDES LIST */}
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRide}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}



// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingTop: 20
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  badge: {
    backgroundColor: "#C8F7C5",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginVertical: 3,
  },
  badgeText: {
    color: "#0A811B",
    fontSize: 11,
    fontWeight: "600",
  },
  distance: {
    fontSize: 12,
    color: "#666",
  },
  joinButton: {
    backgroundColor: "#005CFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  joinText: {
    color: "#fff",
    fontWeight: "700",
  },
});


