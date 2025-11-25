import { getAllRidesApi, Ride } from '@/api/ridesApi';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // FETCH RIDES FROM DB
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

  // REFRESH HOME PAGE
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRides();
  }, []);

  // HANDLE TO BACK ACTION STO HOME SCREEN ETSI WSTE NA MIN PAEI PISW STO LOGIN
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();   
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  // LOADING HANDLING
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#003366" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#003366"/>
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoView}>
            <TouchableOpacity
              style={styles.logo2}
              onPress={() => router.push('/modal')}
            >
              <Image source={require('@/images/logo.webp')} style={styles.logo2}/>
            </TouchableOpacity>
            <Text style={styles.logo}>Home</Text>
          </View>
          <View style={styles.headerIcons}>
            <Ionicons name="notifications-outline" size={24} color="black" style={{ marginRight: 16 }} onPress={() => router.push('/HeaderScreens/notifications')}/>
            <Ionicons name="menu" size={24} color="black" onPress={() => router.push('/HeaderScreens/menu')}/>
          </View>
        </View>

        {/* Search */}
        <TextInput style={styles.search} placeholder="Search" placeholderTextColor="#aaa" />

        {/* Featured Rides */}
        <Text style={styles.sectionTitle}>Featured Rides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {rides.map((ride) => (
            <View key={ride.id} style={styles.featuredCard}>
              <Image
                /* THELEI ALLAGI NA PAIRNEI IMAGES APO TO DATABASE TO EXW VALEI STATIC */
                source={ride.image ? require('@/images/logo.webp') : require('@/images/logo.webp')} 
                style={styles.rideImage} 
              />
              
              {/* TITLE FROM DB */}
              <Text style={styles.rideTitle} numberOfLines={2}>{ride.title}</Text>
              
              {/* RIDE DISTANCE FROM DB */}
              <Text style={styles.subText2}>{ride.rideDistance} km</Text>
              
              <TouchableOpacity style={styles.featuredDetails} onPress={() => router.push(`/rideDetails/${ride.id}` as any)}>
                {/* edw prepei ena call component για RIDE DETAILS */}
                <Text style={styles.buttonText}>Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Recommended THA DINEI TO PIO KONTINO RIDE ANALOGA TO LOCATION TOU XRHSTH KAI TO STARTLOCATION */}
        <Text style={styles.sectionTitle}>Recommended</Text>
        {rides.length > 0 && (
          <View style={styles.row}>
             <Image 
                /* THELEI ALLAGI NA PAIRNEI IMAGES APO TO DATABASE TO EXW VALEI STATIC */
                source={rides[0].image ? require('@/images/logo.webp') : require('@/images/logo.webp')} 
                style={styles.smallCard} 
             />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.linkText}>{rides[1].title}</Text>
              <Text style={styles.subText}>{rides[1].rideDistance} km away</Text>
            </View>
          </View>
        )}

        {/* Upcoming THA DOUME TI AKRIVWS EVENT THA EMFANIZEI STO TELOS*/}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {rides.length > 1 && (
          <View style={styles.row}>
            <Image 
                 /* THELEI ALLAGI NA PAIRNEI IMAGES APO TO DATABASE TO EXW VALEI STATIC */
                source={rides[1].image ? require('@/images/logo.webp') : require('@/images/logo.webp')} 
                style={styles.smallCard} 
             />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.boldText}>{rides[0].title}</Text>
              <Text style={styles.subText}>{rides[0].rideDistance} km away</Text>
              <TouchableOpacity style={styles.button} onPress={() => router.push(`/rideDetails/${rides[0].id}` as any)}>
                <Text style={styles.buttonText}>See Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#DCDCDC",
    paddingTop: 20
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    fontSize: 18,
    fontWeight: "700",
    paddingLeft: 15
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    backgroundColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  featuredCard: {
    width: 160,
    height: 180,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginRight: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  rideImage: {
    width: "70%",
    height: "50%",
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover', // GIA TIN ANALOGIA ISWS XREIASTEI NA VGEI
  },
  rideTitle: {
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center"
  },
  subText: {
    color: "#555",
    fontSize: 10,
  },
  subText2: {
    color: "#555",
    fontSize: 10,
    marginBottom: "5%"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12
  },
  smallCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#e06c6c", // BACKGROUND COLOR AN LEIPEI I EIKONA ISWS XREIASTEI NA SVISTEI KATHWS THA MPAINEI STATIC IMG AN DEN VALEI O USER
    marginBlock: "3%",
    marginLeft: "3%"
  },
  linkText: {
    color: "#0044cc",
    fontWeight: "600",
  },
  boldText: {
    fontWeight: "700",
  },
  featuredDetails: {
    backgroundColor: "#003366",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "center"
  },
  button: {
    backgroundColor: "#003366",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  logo2:{
    width: 65,
    height: 65,
    borderRadius: 35
  },
  logoView:{
    flexDirection: "row",
    alignItems: "center"
  }
});