import { getAllRidesApi, Ride, RideCreation } from '@/api/ridesApi';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Υπολογισμός απόστασης
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

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('Rider');
  const [image, setImage] = useState('');

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const { t } = useTranslation();

    // 1. GET USER LOCATION
    useEffect(() => {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      })();
    }, []);


  // FETCH RIDES
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

  const getAwayDistance = (item: RideCreation) => {
      if (userLocation && item.startLat && item.startLng) {
          const dist = getDistanceKm(
              userLocation.lat, userLocation.lng, 
              item.startLat, item.startLng
          );
          return dist < 1 
            ? `${(dist * 1000).toFixed(0)} m` 
            : `${dist.toFixed(1)} km`;
      }
      if (item.rideDistance) {
          return `${item.rideDistance} km`;
      }

      return "N/A";
  };

  const getDistance = (item: RideCreation) => {
    if (item.startLat && item.startLng && item.endLat && item.endLng) {
            const oneWay = getDistanceKm(
                item.startLat, item.startLng,
                item.endLat, item.endLng
            );
            const roundTrip = oneWay; //* 2 Πήγαινε - Έλα
            
            return `${roundTrip.toFixed(1)} km`;
        }
        else if (item.rideDistance && item.rideDistance > 0) {
            return `${item.rideDistance} km`;
        } 
        else {
            return "Distance N/A";
        }
  }

  const loadUsername = async () => {
    try {
      const storedName = await AsyncStorage.getItem('username');
      if (storedName) {
        setUsername(storedName);
      }
    } catch (e) {
      console.log("Error loading name:", e);
    }
  };

  const loadImage = async () => {
    try {
      const image = await AsyncStorage.getItem('image');
      if(image) {
        setImage(image);
      }
    } catch (e) {
      console.log("Error load image: ", e);
    }
  }

  useEffect(() => {
    fetchRides();
    loadUsername();
    loadImage();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRides();
    loadUsername();
    loadImage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* STATIC HEADER SECTION */}
      <SafeAreaView style={styles.staticHeaderWrapper} edges={['top']}>
        <View style={styles.headerContent}>
          <View style={styles.logoView}>
            <TouchableOpacity onPress={() => router.push('/modal')} activeOpacity={0.8}>
              <Image source={image ? {uri: image } : require('@/images/logo.webp')} style={styles.profileImage} />
            </TouchableOpacity>
            <View>
                <Text style={styles.greetingText}>{t('home.welcome')},</Text>
                <Text style={styles.appName}>{username}</Text>
            </View>
          </View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/HeaderScreens/notifications')}>
               <View style={styles.notificationDot} />
               <Ionicons name="notifications-outline" size={22} color="#1A2B48" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/HeaderScreens/menu')}>
              <Ionicons name="grid-outline" size={22} color="#1A2B48" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#003366" />
                <TextInput 
                    style={styles.searchInput} 
                    placeholder={t('home.whereToNext')} 
                    placeholderTextColor="#999" 
                />
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="options-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.separator} />
      </SafeAreaView>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366" />}
      >
        
        {/* Featured Rides */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.featuredRides')}</Text>
            <TouchableOpacity><Text style={styles.seeAllText} onPress={() => router.push({ pathname: '/joinRide', params: { tab: 'all' } })}>{t('home.seeAll')}</Text></TouchableOpacity>
        </View>

        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalList}
        >
          {rides.map((ride) => (
            <TouchableOpacity 
                key={ride.id} 
                style={styles.featuredCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/rideDetails/${ride.id}` as any)}
            >
              {/* Image Background */}
              <View style={styles.imageContainer}>
                  <Image
                    source={ride.image ? { uri: ride.image } : require('@/images/logo.webp')}
                    style={styles.rideImage}
                  />
                  <View style={styles.distanceBadge}>
                      <Ionicons name="location-sharp" size={10} color="#fff" />
                      <Text style={styles.distanceText}>{getAwayDistance(ride)} {t('home.away')}</Text>
                  </View>
              </View>

              <View style={styles.cardContent}>
                  {/* TITLE (TOP) */}
                  <Text style={styles.rideTitle} numberOfLines={1}>{ride.title}</Text>
                  
                  {/* MIDDLE/BOTTOM CONTAINER */}
                  <View style={styles.infoContainer}>
                      
                      {/* LEFT COLUMN: Date & Time */}
                      <View style={styles.leftInfoColumn}>
                          <View style={styles.infoRow}>
                              <Ionicons name="calendar-outline" size={14} color="#666" />
                              <Text style={styles.infoText}>{ride.date || 'TBA'}</Text>
                          </View>
                          <View style={styles.infoRow}>
                              <Ionicons name="time-outline" size={14} color="#666" />
                              <Text style={styles.infoText}>{ride.expectedTime + " " + t('home.minutes')|| '2hours'}</Text>
                          </View>
                      </View>

                      {/* RIGHT COLUMN: DetailsButton */}
                      <View style={styles.miniButton}>
                          <Text style={styles.miniButtonText}>{t('home.details')}</Text>
                          <Ionicons name="chevron-forward" size={14} color="#fff" />
                      </View>

                  </View>
              </View>
            </TouchableOpacity>
          )).slice(0,6)}
        </ScrollView>

        {/* Recommended List */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.recommended')}</Text>
        </View>
        
        {rides.slice(0, 3).map((ride, index) => (
            <TouchableOpacity 
                key={index} 
                style={styles.listCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/rideDetails/${ride.id}` as any)}
            >
                <Image
                    source={ride.image ? { uri: ride.image } : require('@/images/logo.webp')}
                    style={styles.listImage}
                />
                <View style={styles.listInfo}>
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>{ride.category || 'Adventure'}</Text>
                    </View>
                    <Text style={styles.listTitle} numberOfLines={1}>{ride.title}</Text>
                    <View style={styles.listMeta}>
                        <Ionicons name="speedometer-outline" size={14} color="#666" />
                        <Text style={styles.listMetaText}>{getDistance(ride)}</Text>
                    </View>
                </View>
                <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
            </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: "#F8F9FA"
  },

  // --- HEADER ---
  staticHeaderWrapper: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 15,
  },
  logoView: { flexDirection: "row", alignItems: "center" },
  profileImage: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 2, borderColor: '#F0F0F0' },
  greetingText: { fontSize: 12, color: "#888", fontWeight: "500" },
  appName: { fontSize: 18, fontWeight: "800", color: "#003366", letterSpacing: 0.5 },
  headerIcons: { flexDirection: "row", gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F4F6F9", justifyContent: 'center', alignItems: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D', borderWidth: 1, borderColor: '#fff', zIndex: 10 },

  // --- SEARCH ---
  searchWrapper: { paddingHorizontal: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#F4F6F9", borderRadius: 16, paddingHorizontal: 15, height: 50 },
  searchInput: { flex: 1, fontSize: 15, color: '#333', marginLeft: 10, fontWeight: "500" },
  filterButton: { backgroundColor: "#003366", width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  separator: { height: 1, backgroundColor: "transparent", marginTop: 15 },

  // --- CONTENT ---
  scrollView: { flex: 1, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1A2B48" },
  seeAllText: { fontSize: 13, color: "#003366", fontWeight: "600" },

  // --- FEATURED CARD ---
  horizontalList: { paddingHorizontal: 20, paddingBottom: 20 },
  featuredCard: {
    width: 220, 
    height: 240, 
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 15,
    shadowColor: "#003366",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  imageContainer: {
    height: 140, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', position: 'relative'
  },
  rideImage: { width: "100%", height: "100%", resizeMode: 'cover' },
  distanceBadge: {
    position: 'absolute', top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.6)", flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, gap: 4
  },
  distanceText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  cardContent: {
    padding: 12,
    flex: 1,
  },
  rideTitle: {
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#1A2B48", 
    marginBottom: 4 
  },
  
  // Ο Container για το κάτω μέρος (Date/Time αριστερά, Button δεξιά)
  infoContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },

  // Αριστερή στήλη (Ημερομηνία πάνω, Ώρα κάτω)
  leftInfoColumn: {
      flexDirection: 'column',
      gap: 6,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6
  },
  infoText: {
      fontSize: 12,
      color: "#666",
      fontWeight: "500"
  },

  // Δεξιά πλευρά (Κουμπί)
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

  // --- LIST CARD ---
  listCard: {
    flexDirection: "row", backgroundColor: "#fff", marginHorizontal: 20, marginBottom: 15, padding: 12, borderRadius: 16, alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  listImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#f0f0f0" },
  listInfo: { flex: 1, marginLeft: 15 },
  tagContainer: {
    backgroundColor: "#F4F6F9", alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, marginBottom: 6
  },
  tagText: { fontSize: 10, color: "#555", fontWeight: "600", textTransform: 'uppercase' },
  listTitle: { fontSize: 15, fontWeight: "700", color: "#1A2B48", marginBottom: 4 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listMetaText: { fontSize: 12, color: "#888" },
  chevronContainer: { padding: 5 }
});