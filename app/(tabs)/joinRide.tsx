import { getAllRidesApi, Ride } from '@/api/ridesApi';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';

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

export default function JoinRideScreen() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"nearby" | "all">(
    params.tab === 'all' ? 'all' : 'nearby'
  );
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [index, setIndex] = useState(selectedTab === 'all' ? 1 : 0);
  const [routes] = useState([
    { key: 'nearby', title: 'Nearby Rides' },
    { key: 'all', title: 'All Available' },
  ]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  const fetchRides = async () => {
    try {
      const data = await getAllRidesApi();
      setRides(data);
    } catch (error) {
      console.log("Error fetching rides:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRides();
  }, []);

  const handleJoinRide = async (rideId: number) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return Alert.alert("Error", "You need to be logged in to join.");
      }
      await axios.post(`${process.env.EXPO_PUBLIC_URL}/rides/joinRide`, {rideId, userId});
      Alert.alert("Joined!", "Μπήκες στο ride 👍");
      fetchRides();
    } catch {
      Alert.alert("Info", "Είσαι ήδη μέλος ή υπήρξε σφάλμα.");
    }
  };

  const renderRide = ({ item }: { item: Ride }) => {
    let infoText = "";
    let iconName: keyof typeof Ionicons.glyphMap = "help-circle-outline";

    if (selectedTab === "nearby") {
      if (userLocation && item.startLat && item.startLng) {
        const dist = getDistanceKm(userLocation.lat, userLocation.lng, item.startLat, item.startLng);
        const distString = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        infoText = `${distString} away`;
        iconName = "navigate-circle-outline";
      } else {
        infoText = "Calculating...";
        iconName = "location-outline";
      }
    } else {
      if (item.startLat && item.startLng && item.endLat && item.endLng) {
        const oneWay = getDistanceKm(item.startLat, item.startLng, item.endLat, item.endLng);
        infoText = `${(oneWay * 2).toFixed(1)} km route`;
        iconName = "map-outline";
      } else if (item.rideDistance && item.rideDistance > 0) {
        infoText = `${item.rideDistance} km route`;
        iconName = "speedometer-outline";
      } else {
        infoText = "Distance N/A";
        iconName = "help-circle-outline";
      }
    }

    return (
      <Pressable style={styles.card} onPress={() => router.push(`/rideDetails/${item.id}` as any)}>
        <Image
          source={item.image ? { uri: item.image } : require('@/images/logo.webp')}
          style={styles.mapImage}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.date}>{item.date || "TBA"}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{item.status || "Upcoming"}</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Ionicons name={iconName} size={16} color="#666" />
            <Text style={[styles.distance, { marginLeft: 4 }]}>{infoText}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.joinButton} onPress={() => handleJoinRide(item.id)}>
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      </Pressable>
    );
  };

  const filteredRides = selectedTab === "nearby" && userLocation
    ? [...rides].sort((a, b) => getDistanceKm(userLocation.lat, userLocation.lng, a.startLat, a.startLng) - getDistanceKm(userLocation.lat, userLocation.lng, b.startLat, b.startLng))
    : rides;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#003366" />
      </SafeAreaView>
    );
  }

  const renderScene = ({ route }: { route: { key: string } }) => {
    const data = route.key === 'nearby' ? filteredRides.slice(0, 5) : filteredRides;
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRide}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#003366"
          colors={["#003366"]}   // Android
        />
        }
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
            {route.key === 'nearby' && !userLocation ? "Locating..." : "No rides found."}
          </Text>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Join Ride</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="black" onPress={() => router.push('/HeaderScreens/notifications')} />
          <Ionicons name="menu" size={26} color="black" style={{ marginLeft: 16 }} onPress={() => router.push('/HeaderScreens/menu')} />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "nearby" && styles.activeTab]}
          onPress={() => { setSelectedTab("nearby"); setIndex(0); }}
        >
          <Text style={[styles.tabText, selectedTab === "nearby" && styles.activeTabText]}>Nearby Rides</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === "all" && styles.activeTab]}
          onPress={() => { setSelectedTab("all"); setIndex(1); }}
        >
          <Text style={[styles.tabText, selectedTab === "all" && styles.activeTabText]}>All Available</Text>
        </TouchableOpacity>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={(i) => {
          setIndex(i);
          setSelectedTab(i === 0 ? 'nearby' : 'all');
        }}
        renderTabBar={() => null}
        initialLayout={{ width: Dimensions.get('window').width }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F2F2", paddingTop: 20 },
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#003366" },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  tabs: { flexDirection: "row", justifyContent: "center", backgroundColor: "#E5E5E5", borderRadius: 10, marginHorizontal: 20, marginBottom: 15 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10 },
  activeTab: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { textAlign: "center", fontSize: 14, color: "#666", fontWeight: "500" },
  activeTabText: { color: "#003366", fontWeight: "700" },
  card: { flexDirection: "row", backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 12, borderRadius: 12, padding: 10, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  mapImage: { width: 90, height: 90, borderRadius: 10, resizeMode: 'cover' },
  title: { fontWeight: "700", fontSize: 15, color: '#333', marginBottom: 2 },
  date: { fontSize: 12, color: "#666" },
  badge: { backgroundColor: "#E6F0F9", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginVertical: 4 },
  badgeText: { color: "#003366", fontSize: 11, fontWeight: "600" },
  distance: { fontSize: 12, color: "#666", fontWeight: "500" },
  joinButton: { backgroundColor: "#003366", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  joinText: { color: "#fff", fontWeight: "700" },
});
