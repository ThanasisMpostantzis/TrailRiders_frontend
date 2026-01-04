import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';

// DROPDOWN OPTIONS
const CATEGORIES = [
  "🏍️ Street / Naked",
  "🏁 Supersport / Racing",
  "🧭 Adventure / Touring",
  "🌲 Enduro / Cross",
  "🦅 Cruiser / Chopper",
  "🛵 Scooter",
  "🕶️ Classic / Cafe Racer",
  "🦆 Papaki"
];

const DIFFICULTIES = [
  "🟢 Easy (Αρχάριος)", 
  "🟡 Medium (Μέτριος)", 
  "🔴 Hard (Έμπειρος)", 
  "⚫ Extreme (Επαγγελματίας)"
];

const RIDE_TYPES = [
  "🛣️ Άσφαλτος (Tarmac)", 
  "🌲 Χώμα (Off-Road)", 
  "🌗 Μικτό (On/Off)", 
  "🏁 Πίστα (Track Day)"
];

interface MapPoint {
  name: string;
  latitude: number;
  longitude: number;
}

export default function CreateRideScreen() {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  // Tabs
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'general', title: t('createRide.general') },
    { key: 'route', title: t('createRide.rideAndMap') },
  ]);

  // Map States
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 40.6401, longitude: 22.9444, latitudeDelta: 0.05, longitudeDelta: 0.05,
  });

  const [selectionMode, setSelectionMode] = useState<'start' | 'finish' | 'stop'>('start');
  const [startPoint, setStartPoint] = useState<MapPoint | null>(null);
  const [finishPoint, setFinishPoint] = useState<MapPoint | null>(null);
  const [stopsList, setStopsList] = useState<MapPoint[]>([]);
  const [form, setForm] = useState({
    title: '',
    image: '',
    description: '',
    category: '',
    difficulty: '',
    rideType: '',
  });

  // Date Picker States
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formattedDateString, setFormattedDateString] = useState(""); 

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalOptions, setModalOptions] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [currentField, setCurrentField] = useState<string>("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      setMapRegion({ ...mapRegion, latitude: location.coords.latitude, longitude: location.coords.longitude });
    })();
  }, []);

  // Helpers
  const openModal = (field: string, title: string, options: string[]) => {
    setCurrentField(field);
    setModalTitle(title);
    setModalOptions(options);
    setModalVisible(true);
  };

  const handleSelectOption = (item: string) => {
    setForm(prev => ({ ...prev, [currentField]: item }));
    setModalVisible(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      const base64Img = `data:image/jpeg;base64,${selectedAsset.base64}`;
      setForm(prev => ({ ...prev, image: base64Img }));
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setShowTimePicker(true); 
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowTimePicker(false);
    setDate(currentDate);
    const formatted = currentDate.toISOString().slice(0, 10) + ' ' + currentDate.toTimeString().slice(0, 5);
    setFormattedDateString(formatted);
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    let addressName = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`; 
    try {
      const geocode = await Location.reverseGeocodeAsync(coords);
      if (geocode.length > 0) {
        const g = geocode[0];
        const street = g.street || g.name || '';
        const city = g.city || g.region || '';
        if (street || city) addressName = `${street} ${g.streetNumber || ''}, ${city}`.trim();
        if (addressName.startsWith(',')) addressName = addressName.substring(1).trim();
      }
    } catch (error) { console.log("Geocoding error", error); }

    const newPoint: MapPoint = { name: addressName, latitude: coords.latitude, longitude: coords.longitude };

    if (selectionMode === 'start') {
      setStartPoint(newPoint);
      Alert.alert(t('createRide.alert.startPoint'), addressName);
    } else if (selectionMode === 'finish') {
      setFinishPoint(newPoint);
      Alert.alert(t('createRide.alert.finishPoint'), addressName);
    } else if (selectionMode === 'stop') {
      setStopsList(prev => [...prev, newPoint]);
    }
  };

// ΥΠΟΛΟΓΙΣΜΟΣ ΧΩΡΙΣ GOOGLE API KEY
  const calculateRouteStats = async () => {
    if (!startPoint) return { time: "00:00", distance: 0 };

    // Τύπος Haversine
    const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; 
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    let totalDistKm = 0;

    // Λίστα με όλα τα σημεία (Start Stops Finish)
    const allPoints = [
      startPoint,
      ...stopsList,
      finishPoint
    ].filter(p => p !== null) as MapPoint[];

    // Αν έχουμε μόνο 1 σημείο, απόσταση 0
    if (allPoints.length < 2) return { time: "00:00", distance: 0 };

    // Πρόσθεση αποστάσεων
    for (let i = 0; i < allPoints.length - 1; i++) {
      totalDistKm += getDist(
        allPoints[i].latitude, allPoints[i].longitude,
        allPoints[i+1].latitude, allPoints[i+1].longitude
      );
    }

    // Προσθέτουμε +30% γιατί οι δρόμοι δεν είναι ευθεία γραμμή
    const realRoadDistance = totalDistKm * 1.4;

    // Υποθέτουμε μέση ταχύτητα 40 km/h
    const speedKmH = 40; 

    // setara * 1.3 για να ταιριάζει καλύτερα με google maps
    const rawTotalHours = (realRoadDistance / speedKmH) * 1.3;
    
    const totalMinutes = Math.round(rawTotalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    
    
    // Format "HH:mm"
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return { 
      time: timeString, 
      distance: parseFloat(realRoadDistance.toFixed(1)) 
    };
  };

  // Delete stops
  const removeStop = (indexToRemove: number) => {
    setStopsList(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleCreateRide = async () => {
    if (!form.title) return Alert.alert(t('createRide.carefull'), t('createRide.alert.addTitle'));
    if (!startPoint) return Alert.alert(t('createRide.alert.carefull'), t('createRide.alert.addStartPoints'));
    if (!formattedDateString) return Alert.alert(t('createRide.alert.carefull'), t('createRide.alert.addDate'));

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error("No user");

      const parts = formattedDateString.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || "";
      const username = await AsyncStorage.getItem('username');

      // Υπολογισμός διαδρομής
      console.log("Calculating route...");
      const routeStats = await calculateRouteStats();

      const payload = {
        ...form,
        organizer: username || "Άγνωστος",
        creatorId: userId,
        date: datePart,
        expectedTime: routeStats.time,
        rideDistance: routeStats.distance,
        ride_time: timePart,
        startLocation: startPoint.name,
        finishLocation: finishPoint ? finishPoint.name : '',
        stops: stopsList.map(s => s.name),
        startLat: startPoint.latitude,
        startLng: startPoint.longitude,
        endLat: finishPoint ? finishPoint.latitude : null,
        endLng: finishPoint ? finishPoint.longitude : null,
      };

      console.log("Sending Payload:", payload);
      await axios.post(`${process.env.EXPO_PUBLIC_URL}/rides/createRide`, payload);
      
      Alert.alert(t('createRide.alert.success'), t('createRide.alert.rideSuccess'));
      router.back();
    } catch (error) {
      console.log("Create Error:", error);
      Alert.alert(t('createRide.alert.error'), t('createRide.alert.somethingGoneWrong'));
    } finally {
      setLoading(false);
    }
  };

  //render SCENE
  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'general':
        return (
          <ScrollView style={styles.sceneScroll} contentContainerStyle={styles.sceneContent}>
            <Text style={styles.label}>{t('createRide.rideTitle')} *</Text>
            <TextInput 
              style={styles.input} 
              placeholder={t('createRide.placeHolder.titlePlaceholder')} 
              value={form.title} 
              onChangeText={(t) => setForm(prev => ({...prev, title: t}))} 
            />

            <Text style={styles.label}>{t('createRide.dateTime')} *</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dropdownButton}>
              <Text style={formattedDateString ? styles.inputText : styles.placeholderText}>
                {formattedDateString || t('createRide.placeHolder.dateTimePlaceholder') }
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>

            <Text style={styles.label}>{t('createRide.category')}</Text>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => openModal('category', t('createRide.placeHolder.selectCategory') , CATEGORIES)}
            >
              <Text style={form.category ? styles.inputText : styles.placeholderText}>
                {form.category || t('createRide.placeHolder.categoryPlaceholder')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Text style={styles.label}>{t('createRide.rideImage')}</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerBtn}>
              {form.image ? (
                <Image source={{ uri: form.image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="camera-outline" size={40} color="#666" />
                  <Text style={styles.placeholderImageText}>{t('createRide.placeHolder.imageUpload')}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {form.image ? (
              <TouchableOpacity onPress={() => setForm(prev => ({...prev, image: ''}))} style={{alignSelf:'flex-end', marginBottom: 15}}>
                <Text style={{color: 'red', fontSize: 12}}>✖ {t('createRide.deleteImage')} </Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.label}>{t('createRide.description')}</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              multiline 
              placeholder={t('createRide.placeHolder.descriptionPlaceholder')}
              placeholderTextColor={"#666"}
              value={form.description} 
              onChangeText={(t) => setForm(prev => ({...prev, description: t}))} 
            />

            <TouchableOpacity style={styles.nextButton} onPress={() => setIndex(1)}>
              <Text style={styles.nextButtonText}>{t('createRide.next')} &gt;</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      case 'route':
        return (
          <ScrollView style={styles.sceneScroll} contentContainerStyle={styles.sceneContent}>
            <Text style={styles.sectionHeader}>{t('createRide.rideMap')}</Text>
            <View style={styles.mapContainer}>
              <MapView style={styles.map} region={mapRegion} showsUserLocation={true} onPress={handleMapPress}>
                {startPoint && <Marker coordinate={startPoint} pinColor="green" title={t('createRide.start')} />}
                {finishPoint && <Marker coordinate={finishPoint} pinColor="red" title={t('createRide.finish')} />}
                {stopsList.map((stop, i) => (
                  <Marker key={i} coordinate={stop} pinColor="blue" title={`${t('createRide.addStops')} ${i + 1}`} />
                ))}
              </MapView>
            </View>

            <View style={styles.selectorContainer}>
              <TouchableOpacity style={[styles.selectorBtn, selectionMode === 'start' && styles.btnStartActive]} onPress={() => setSelectionMode('start')}>
                <Text style={[styles.selectorText, selectionMode === 'start' && styles.textWhite]}>📍 {t('createRide.start')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectorBtn, selectionMode === 'stop' && styles.btnStopActive]} onPress={() => setSelectionMode('stop')}>
                <Text style={[styles.selectorText, selectionMode === 'stop' && styles.textWhite]}>➕ {t('createRide.addStops')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.selectorBtn, selectionMode === 'finish' && styles.btnFinishActive]} onPress={() => setSelectionMode('finish')}>
                <Text style={[styles.selectorText, selectionMode === 'finish' && styles.textWhite]}>🏁 {t('createRide.finish')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('createRide.startPoint')}</Text>
            <View style={styles.readOnlyInput}><Text>{startPoint?.name || t('createRide.placeHolder.notSelected')}</Text></View>
            
            {stopsList.length > 0 && (
              <View style={{marginBottom: 15}}>
                 <Text style={styles.label}>{t('createRide.stopPoints')} ({stopsList.length})</Text>
                 {stopsList.map((stop, i) => (
                   <View key={i} style={styles.stopItem}>
                     <Text style={styles.stopText}>
                       {i+1}. {stop.name}
                     </Text>
                     <TouchableOpacity onPress={() => removeStop(i)} style={{padding: 5}}>
                       <Ionicons name="trash-outline" size={20} color="#ff4444" />
                     </TouchableOpacity>
                   </View>
                 ))}
              </View>
            )}

            <Text style={styles.label}>{t('createRide.finish')}</Text>
            <View style={styles.readOnlyInput}><Text>{finishPoint?.name || t('createRide.placeHolder.notSelected')}</Text></View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <View style={{ width: '48%' }}>
                <Text style={styles.label}>{t('createRide.difficulty')}</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton} 
                  onPress={() => openModal('difficulty', t('createRide.selectDifficulty'), DIFFICULTIES)}
                >
                   <Text numberOfLines={1} style={form.difficulty ? {color:'#000', fontSize:13} : {color:'#999', fontSize:13}}>
                     {form.difficulty || t('createRide.placeHolder.select')}
                   </Text>
                   <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={{ width: '48%' }}>
                <Text style={styles.label}>{t('createRide.groundType')}</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton} 
                  onPress={() => openModal('rideType', t('createRide.selectGroundType'), RIDE_TYPES)}
                >
                   <Text numberOfLines={1} style={form.rideType ? {color:'#000', fontSize:13} : {color:'#999', fontSize:13}}>
                     {form.rideType || t('createRide.placeHolder.select')}
                   </Text>
                   <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateRide} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>{t('createRide.createRide')}</Text>}
            </TouchableOpacity>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#003366" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('createRide.createNewRide')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.tabs}>
          {routes.map((route, i) => (
            <TouchableOpacity key={route.key} style={[styles.tabButton, index === i && styles.activeTab]} onPress={() => setIndex(i)}>
              <Text style={[styles.tabText, index === i && styles.activeTabText]}>{route.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
          swipeEnabled={true}
        />

        {/* MODALS gia dropdown */}
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <FlatList
                data={modalOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectOption(item)}>
                    <Text style={styles.modalItemText}>{item}</Text>
                    {form[currentField as keyof typeof form] === item && <Ionicons name="checkmark" size={20} color="green" />}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>{t('createRide.close')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* date PICKER */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F2F2" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#003366" },
  tabs: { flexDirection: "row", backgroundColor: "#E5E5E5", borderRadius: 10, marginHorizontal: 20, marginBottom: 10 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 10 },
  activeTab: { backgroundColor: "#fff", elevation: 2 },
  tabText: { textAlign: "center", color: "#666" },
  activeTabText: { color: "#003366", fontWeight: "700" },
  sceneScroll: { flex: 1 },
  sceneContent: { padding: 20, paddingBottom: 60 },
  label: { marginBottom: 6, fontWeight: '600', color: '#333' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', color: '#666' },
  readOnlyInput: { backgroundColor: '#e9ecef', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  
  // Dropdown Style
  dropdownButton: { 
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 15, 
    borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' 
  },
  inputText: { color: '#000', fontSize: 15 },
  placeholderText: { color: '#999', fontSize: 15 },

  // Map & Selectors sTYLE
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#003366', marginBottom: 10 },
  mapContainer: { height: 280, borderRadius: 15, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: '#ccc' },
  map: { width: '100%', height: '100%' },
  selectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  selectorBtn: { flex: 0.32, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center' },
  selectorText: { fontWeight: '600', fontSize: 12, color: '#333' },
  btnStartActive: { backgroundColor: 'green' },
  btnFinishActive: { backgroundColor: 'red' },
  btnStopActive: { backgroundColor: 'blue' },
  textWhite: { color: '#fff' },

  // Buttons Style
  nextButton: { backgroundColor: '#003366', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  nextButtonText: { color: '#fff', fontWeight: '600' },
  createButton: { backgroundColor: '#003366', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  createButtonText: { color: '#fff', fontWeight: '800' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15, textAlign: 'center', color: '#003366' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  modalItemText: { fontSize: 16, color: '#333' },
  closeButton: { marginTop: 20, backgroundColor: '#eee', padding: 12, borderRadius: 10, alignItems: 'center' },
  closeButtonText: { fontWeight: '700', color: '#333' },

  //image styles
  imagePickerBtn: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', height: 150, justifyContent: 'center',
    alignItems: 'center', marginBottom: 5, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover', },
  placeholderContainer: { alignItems: 'center', justifyContent: 'center' },
  placeholderImageText: { color: '#666', marginTop: 5, fontSize: 14 },

  //stops style
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between'
  },
  stopText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    marginRight: 10
  },
});