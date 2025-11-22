import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [featuredRides] = useState([
    { id: 1, title: "Athens Moto/Car Meet", distance: "12km away", image: require('@/images/logo.webp') },
    { id: 2, title: "Mountain Trail", distance: "25km away", image: require('@/images/logo.webp') },
    { id: 3, title: "Thessaloniki City Tour", distance: "5km away", image: require('@/images/logo.webp') },
    { id: 4, title: "Sunset Ride", distance: "15km away", image: require('@/images/logo.webp') },
    { id: 5, title: "Forest Path", distance: "30km away", image: require('@/images/logo.webp') },
    { id: 6, title: "River Route", distance: "20km away", image: require('@/images/logo.webp') },
    { id: 7, title: "Night Drive", distance: "8km away", image: require('@/images/logo.webp') },
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
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
            <Ionicons name="notifications-outline" size={24} color="black" style={{ marginRight: 16 }} />
            <Ionicons name="menu" size={24} color="black" />
          </View>
        </View>

        {/* Search */}
        <TextInput style={styles.search} placeholder="Search" placeholderTextColor="#aaa" />

        {/* Featured */}
        <Text style={styles.sectionTitle}>Featured Rides</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredRides.map((ride) => (
            <View key={ride.id} style={styles.featuredCard}>
              <Image source={ride.image} style={styles.rideImage} />
              <Text style={styles.rideTitle}>{ride.title}</Text>
              <Text style={styles.subText2}>{ride.distance}</Text>
              <TouchableOpacity style={styles.featuredDetails}>
                <Text style={styles.buttonText}>Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Recommended */}
        <Text style={styles.sectionTitle}>Recommended</Text>
        <View style={styles.row}>
          <Image source={require('@/images/logo.webp')} style={styles.smallCard} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.linkText}>Ride to Ioannina</Text>
            <Text style={styles.subText}>4km away</Text>
          </View>
        </View>

        {/* Upcoming */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.row}>
          <Image source={require('@/images/logo.webp')} style={styles.smallCard} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.boldText}>Morning Ride</Text>
            <Text style={styles.subText}>45km away</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>See Details</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'center'
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
    backgroundColor: "#e06c6c",
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
