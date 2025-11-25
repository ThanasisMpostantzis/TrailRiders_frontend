// app/tabs/createRide.tsx
import axios from 'axios';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'http://192.168.1.36:3000';

// -------------------------------
// Reverse Geocoding Function
// -------------------------------
async function getLocationName(lat: number, lng: number) {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (results && results.length > 0) {
      const place = results[0];

      // Προσπαθούμε να βρούμε καθαρό όνομα
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

  const [startCoord, setStartCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endCoord, setEndCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  const [selectMode, setSelectMode] = useState<'start' | 'end'>('start');

  const [region, setRegion] = useState({
    latitude: 37.9838,
    longitude: 23.7275,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  // -----------------------------------------------------------
  // Ζήτα άδεια GPS + κεντράρισμα στο σημείο του χρήστη
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied for GPS');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setRegion((prev) => ({
        ...prev,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }));
    })();
  }, []);

  // -----------------------------------------------------------
  // Όταν πατάς πάνω στον χάρτη
  // -----------------------------------------------------------
  const handleMapPress = async (e: MapPressEvent) => {
    const coord = e.nativeEvent.coordinate;

    // Πάρε όνομα τοποθεσίας
    const name = await getLocationName(coord.latitude, coord.longitude);

    if (selectMode === 'start') {
      setStartCoord(coord);
      setStartLocationName(name); // 🔥 Βάζει αυτόματα το όνομα
    } else {
      setEndCoord(coord);
      setEndLocationName(name); // 🔥 Βάζει αυτόματα το όνομα
    }
  };

  // -----------------------------------------------------------
  // Δημιουργία Ride
  // -----------------------------------------------------------
  const handleCreateRide = async () => {
    if (!title || !startCoord || !endCoord) {
      Alert.alert('Error', 'Βάλε τίτλο και διάλεξε start & end στο χάρτη.');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/rides`, {
        title,
        startLocation: startLocationName || "Unknown Start",
        endLocation: endLocationName || "Unknown End",
        startLat: startCoord.latitude,
        startLng: startCoord.longitude,
        endLat: endCoord.latitude,
        endLng: endCoord.longitude,
        rideDistance: 0,
      });

      Alert.alert('Success', 'Ride created!');

      // Reset form
      setTitle('');
      setStartLocationName('');
      setEndLocationName('');
      setStartCoord(null);
      setEndCoord(null);

    } catch (err) {
      console.log("Create Ride Error:", err);
      Alert.alert('Error', 'Κάτι πήγε στραβά.');
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
            placeholder="Αυτόματη επιλογή"
            value={startLocationName}
            editable={false}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>End Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Αυτόματη επιλογή"
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
            Select START on map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, selectMode === 'end' && styles.modeButtonActive]}
          onPress={() => setSelectMode('end')}
        >
          <Text style={[styles.modeText, selectMode === 'end' && styles.modeTextActive]}>
            Select END on map
          </Text>
        </TouchableOpacity>
      </View>

      <MapView style={styles.map} region={region} onPress={handleMapPress}>
        {startCoord && <Marker coordinate={startCoord} pinColor="green" />}
        {endCoord && <Marker coordinate={endCoord} pinColor="red" />}
      </MapView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateRide}>
        <Text style={styles.createButtonText}>Create Ride</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}


// -----------------------------------------------------------
// STYLES
// -----------------------------------------------------------
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
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
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
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  modeButtonActive: {
    backgroundColor: '#005CFF',
  },
  modeText: {
    textAlign: 'center',
    color: '#333',
  },
  modeTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginVertical: 8,
  },
  createButton: {
    backgroundColor: '#005CFF',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  createButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});
