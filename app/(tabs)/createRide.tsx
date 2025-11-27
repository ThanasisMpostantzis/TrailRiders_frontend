// app/tabs/createRide.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'http://192.168.1.2:8000/rides';


// Reverse Geocoding Function

async function getLocationName(lat: number, lng: number) {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (results && results.length > 0) {
      const place = results[0];
      return (
        place.city ||
        place.name ||
        place.district ||
        place.region ||
        place.subregion ||
        "Unknown"
      );
    }
  } catch (err) {
    console.log("Reverse Geocoding Error:", err);
  }
  return "Unknown";
}

export default function CreateRideScreen() {
  const [title, setTitle] = useState('');
  const [startLocationName, setStartLocationName] = useState('');
  const [endLocationName, setEndLocationName] = useState('');
  
  // User Data
  const [organizerName, setOrganizerName] = useState('');
  const [myUserId, setMyUserId] = useState('');

  // Coordinates
  const [startCoord, setStartCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endCoord, setEndCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // UI States
  const [selectMode, setSelectMode] = useState<'start' | 'end'>('start');
  const [region, setRegion] = useState({
    latitude: 37.9838,
    longitude: 23.7275,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  // 1. Φόρτωση GPS & User Data κατά την εκκίνηση
  useEffect(() => {
    const init = async () => {
      // load user
      try {
        const storedUser = await AsyncStorage.getItem('username');
        const storedId = await AsyncStorage.getItem('userId');
        
        if (storedUser) setOrganizerName(storedUser);
        if (storedId) setMyUserId(storedId);
        
        console.log("Loaded User:", storedUser, "ID:", storedId);
      } catch (e) {
        console.log("Error loading storage", e);
      }

      // load loc
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion((prev) => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      }
    };
    
    init();
  }, []);

  // 2. Map Handler ( πρεπει να διορθωθει γιατι μου φαινεται αργει και δεν κανει κλικ καλα )
  const handleMapPress = async (e: MapPressEvent) => {
    const coord = e.nativeEvent.coordinate;
    const name = await getLocationName(coord.latitude, coord.longitude);

    if (selectMode === 'start') {
      setStartCoord(coord);
      setStartLocationName(name);
    } else {
      setEndCoord(coord);
      setEndLocationName(name);
    }
  };

  // Date type (YYYY-MM-DD) current date
  const getFormattedDate = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return `${year}-${month}-${day}`;
  };

  // 4. Create Ride Submit
  const handleCreateRide = async () => {
    if (!title || !startCoord || !endCoord) {
      Alert.alert('Error', 'Please enter a title and select Start/End points on the map.');
      return;
    }

    try {
      const payload = {
        organizer: organizerName || "Unknown Rider",
        title: title,
        // Στέλνουμε το ID του χρήστη σε Array αλλα για καποιο λογο δεν το περναει σε Array να το δουμε
        usersId: myUserId ? [myUserId] : [], 
        
        startLocation: startLocationName || "Map Point",
        finishLocation: endLocationName || "Map Point",
        date: getFormattedDate(),
        
        startLat: startCoord.latitude,
        startLng: startCoord.longitude,
        endLat: endCoord.latitude,
        endLng: endCoord.longitude,

        // Dummy Data (για να μην σκάσει η βάση)
        image: '',
        rideDistance: 0,
        status: 'upcoming',
        category: 'Road Trip',
        description: 'No description provided.',
        stops: [],
        difficulty: 'Medium',
        rideType: 'Road',
        expectedTime: 120
      };

      console.log("Sending Ride Data:", payload);

      await axios.post(`${BASE_URL}/createRide`, payload);

      Alert.alert('Success', 'Ride created successfully!');

      // Reset Fields
      setTitle('');
      setStartLocationName('');
      setEndLocationName('');
      setStartCoord(null);
      setEndCoord(null);

    } catch (err: any) {
      console.log("Create Ride Error:", err);
      Alert.alert('Error', 'Could not create ride. Check console.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.label}>Ride Title</Text>
      <TextInput
        style={styles.input}
        placeholder="π.χ. Βόλτα προς Θεσσαλονίκη"
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Start Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Auto-fill form map"
            value={startLocationName}
            editable={false}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>End Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Auto-fill from map"
            value={endLocationName}
            editable={false}
          />
        </View>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeButton, selectMode === 'start' && styles.modeButtonActive]}
          onPress={() => setSelectMode('start')}
        >
          <Text style={[styles.modeText, selectMode === 'start' && styles.modeTextActive]}>
            Select START
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, selectMode === 'end' && styles.modeButtonActive]}
          onPress={() => setSelectMode('end')}
        >
          <Text style={[styles.modeText, selectMode === 'end' && styles.modeTextActive]}>
            Select END
          </Text>
        </TouchableOpacity>
      </View>

      <MapView style={styles.map} region={region} onPress={handleMapPress}>
        {startCoord && <Marker coordinate={startCoord} pinColor="green" title="Start" />}
        {endCoord && <Marker coordinate={endCoord} pinColor="red" title="End" />}
      </MapView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateRide}>
        <Text style={styles.createButtonText}>Create Ride</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F2F2F2',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  modeButtonActive: {
    backgroundColor: '#003366',
  },
  modeText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  createButton: {
    backgroundColor: '#003366',
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});