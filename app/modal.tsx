import { getProfileApi, updateProfileApi } from "@/api/authApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView, StatusBar, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const RIDING_STYLES_OPTIONS = [
  "🏍️ Street / Naked",
  "🏁 Supersport / Racing",
  "🧭 Adventure / Touring",
  "🌲 Enduro / Cross",
  "🦅 Cruiser / Chopper",
  "🛵 Scooter",
  "🕶️ Classic / Cafe Racer",
  "🦆 Papaki",
  "🏎️ Track Day Enthusiast",
  "🌍 Long Distance Traveler"
];

type UserProfile = {
  id?: number;
  username?: string;
  fullName?: string;
  bike?: string;
  location?: string;
  bio?: string;
  tags?: string[];
  image?: string;
  cover?: string;
  rides?: number;
  km?: number;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [storedUsername, setStoredUsername] = useState<string>("");
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const localUser = await AsyncStorage.getItem("username");
    if (localUser) setStoredUsername(localUser);

    try {
      let idStr = await AsyncStorage.getItem('id');
      if (!idStr) idStr = await AsyncStorage.getItem('userId');

      console.log("🔍 Loading Profile for ID:", idStr);

      if (!idStr || idStr === "0" || idStr === "undefined") {
          console.log("No valid ID found.");
          setLoading(false);
          return;
      }

      const res: any = await getProfileApi(idStr); 
      let rawData = null;

      if (res && res.user) {
          rawData = res.user;
      } else {
          rawData = res;
      }

      if (Array.isArray(rawData)) {
          rawData = rawData.length > 0 ? rawData[0] : null;
      }

      if (rawData && rawData.id) {
          console.log("Data Found:", rawData.username || rawData.fullName);
          let safeTags = ["Touring"];
          try {
            const t = rawData.tags;
            if (Array.isArray(t)) safeTags = t;
            else if (typeof t === 'string' && t.trim().length > 0) safeTags = JSON.parse(t);
          } catch (e) {}

          // Mapping
          const cleanProfile: UserProfile = {
            id: rawData.id,
            fullName: rawData.fullName || rawData.fullname || rawData.full_name || "",
            username: rawData.username || localUser || "",
            bike: rawData.bike || "",
            location: rawData.location || "",
            bio: rawData.bio || "",
            image: rawData.image || "",
            cover: rawData.cover || "",
            km: rawData.km || 0,
            rides: rawData.rides || 0,
            tags: safeTags
          };

          setProfile(cleanProfile);
          await AsyncStorage.setItem("profile", JSON.stringify(cleanProfile));
          if (cleanProfile.image) await AsyncStorage.setItem("image", cleanProfile.image);
          if (cleanProfile.username) await AsyncStorage.setItem("username", cleanProfile.username);
      } else {
          console.log("⚠️ API response structure unknown:", JSON.stringify(res));
      }

    } catch (e) {
      console.log("🔥 Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    setModalOpen(false);
    setLoading(true);
    await loadProfile(); // Reload μετά το save
    setLoading(false);
  };

  if (loading && !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  // Fallback αν αποτύχουν όλα
  if (!profile) {
      return (
          <View style={styles.center}>
              <Text>No profile data found.</Text>
              <TouchableOpacity onPress={async () => { await AsyncStorage.clear(); }} style={{padding: 20, marginTop: 20}}>
                  <Text style={{color:'red'}}>Clear Cache</Text>
              </TouchableOpacity>
          </View>
      )
  }

  const displayName = profile.fullName || profile.username || storedUsername || "Rider";

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#003366" style={{paddingLeft: 10, padding: 10}}/></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* COVER & AVATAR */}
        <View style={styles.headerCard}>
          <Image
            source={profile.cover ? { uri: profile.cover } : require("@/images/logo.webp")}
            style={styles.coverImage}
          />
          <View style={styles.avatarRow}>
            <Image
              source={profile.image ? { uri: profile.image } : require("@/images/logo.webp")}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.nameText}>{displayName}</Text>
              <Text style={styles.subText}>
                {(profile.bike ? profile.bike + " • " : "No bike set • ")}
                {profile.location || "Location N/A"}
              </Text>
            </View>
            <TouchableOpacity style={styles.editFloating} onPress={() => setModalOpen(true)}>
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statValue}>{profile.km ?? 0}</Text><Text style={styles.statLabel}>km</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{profile.rides ?? 0}</Text><Text style={styles.statLabel}>Rides</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>⭐</Text><Text style={styles.statLabel}>Achievements</Text></View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{profile.bio || "Add a bio..."}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Riding Style</Text>
          <View style={styles.tagWrap}>
            {(() => {
              const tagsData = profile.tags || [];
              if (tagsData.length > 0) {
                return tagsData.map((t: string, i: number) => (
                  <View key={i} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                ));
              } 
              return <Text style={{color: '#999', fontStyle: 'italic'}}>No riding style selected</Text>;
            })()}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Recent Rides</Text>
          <View style={styles.recentCard}>
            <Text style={styles.recentTitle}>Thessaloniki → Ptolemaida</Text>
            <Text style={styles.recentMeta}>50 km • 2025-11-22</Text>
          </View>
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <EditProfileModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onSaved={onSave}
      />
    </View>
  );
}

/* --------------- EditProfileModal ----------- */

function EditProfileModal({ visible, onClose, profile, onSaved } : {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaved: () => void;
}) {
  const [local, setLocal] = useState<UserProfile>({ ...(profile || {}) });
  const [saving, setSaving] = useState(false);
  const [tagsModalVisible, setTagsModalVisible] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let safeTags: string[] = [];
    if (Array.isArray(profile.tags)) safeTags = [...profile.tags];
    
    setLocal({ 
        ...profile, 
        id: profile.id, 
        fullName: profile.fullName,
        tags: safeTags
    });
  }, [profile, visible]);

  const pickImage = async (which: "avatar" | "cover") => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert("Permission required", "We need permission.");
      
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsEditing: true,
        aspect: which === "avatar" ? [1,1] : [16,9],
        base64: true,
      });
      if (res.canceled) return;

      let dataUri = res.assets[0].base64 
        ? `data:image/jpeg;base64,${res.assets[0].base64}`
        : `data:image/jpeg;base64,${await FileSystem.readAsStringAsync(res.assets[0].uri, { encoding: "base64" })}`;

      setLocal(prev => ({ ...prev, [which === "avatar" ? "image" : "cover"]: dataUri }));
    } catch (e) { console.log("pick error", e); }
  };

  const toggleTag = (tag: string) => {
    let currentTags = local.tags || [];
    if (currentTags.includes(tag)) {
        currentTags = currentTags.filter(t => t !== tag);
    } else {
        currentTags = [...currentTags, tag];
    }
    setLocal(prev => ({ ...prev, tags: currentTags }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storedId = await AsyncStorage.getItem('id') || await AsyncStorage.getItem('userId');
      const finalId = local.id || (storedId ? parseInt(storedId) : undefined);
      
      if (!finalId) {
          Alert.alert("Error", "No ID found. Please Log in again.");
          setSaving(false);
          return;
      }

      const payload = {
        ...local,
        id: finalId,
        fullName: local.fullName,
        tags: JSON.stringify(local.tags)
      };

      const res = await updateProfileApi(payload);
      
      if (res.type === "success") {
        Alert.alert("Success", "Profile updated!");
        onSaved(); 
      } else {
        Alert.alert("Error", res.message || "Save failed.");
      }
    } catch (e) {
      console.log("save error", e);
      Alert.alert("Error", "Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.modal}>
        <View style={styles.modalHandle} />
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.modalTitle}>Edit profile</Text>

          <View style={styles.imagesEditContainer}>
            <TouchableOpacity style={styles.avatarEditWrapper} onPress={() => pickImage("avatar")}>
              <Image source={local.image ? { uri: local.image } : require("@/images/logo.webp")} style={styles.modalAvatar} />
              <View style={styles.smallBadge}><Ionicons name="camera" size={14} color="#fff" /></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.coverEditWrapper} onPress={() => pickImage("cover")}>
                <Image source={local.cover ? { uri: local.cover } : require("@/images/logo.webp")} style={styles.modalCoverThumb} />
                <View style={styles.smallBadge}><Ionicons name="image" size={14} color="#fff" /></View>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput style={styles.input} value={local.fullName} onChangeText={(v) => setLocal({...local, fullName: v})} placeholder="Your Full Name" />

          <Text style={styles.fieldLabel}>Bike model</Text>
          <TextInput style={styles.input} value={local.bike} onChangeText={(v) => setLocal({...local, bike: v})} placeholder="eg. BMW M1000-XR" />

          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput style={styles.input} value={local.location} onChangeText={(v) => setLocal({...local, location: v})} placeholder="City, Country" />

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput style={[styles.input, { height: 80 }]} multiline value={local.bio} onChangeText={(v) => setLocal({...local, bio: v})} placeholder="Write a short bio" />

          <Text style={styles.fieldLabel}>Riding Style</Text>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setTagsModalVisible(true)}>
             <Text style={{color: '#333', flex: 1}}>
                {(local.tags && local.tags.length > 0) ? local.tags.join(", ") : "Select Riding Styles"}
             </Text>
             <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <Modal visible={tagsModalVisible} animationType="fade" transparent onRequestClose={() => setTagsModalVisible(false)}>
         <Pressable style={styles.overlay} onPress={() => setTagsModalVisible(false)}>
            <View style={styles.tagsModalContent}>
               <Text style={styles.modalTitle}>Select Riding Styles</Text>
               <FlatList 
                 data={RIDING_STYLES_OPTIONS}
                 keyExtractor={item => item}
                 renderItem={({item}) => {
                    const isSelected = local.tags?.includes(item);
                    return (
                        <TouchableOpacity style={[styles.tagOption, isSelected && styles.tagOptionSelected]} onPress={() => toggleTag(item)}>
                            <Text style={[styles.tagOptionText, isSelected && {color: '#003366', fontWeight:'bold'}]}>{item}</Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={22} color="#003366" />}
                        </TouchableOpacity>
                    )
                 }}
               />
               <TouchableOpacity style={styles.closeTagsBtn} onPress={() => setTagsModalVisible(false)}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Done</Text>
               </TouchableOpacity>
            </View>
         </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7FB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6F7FB" },
  headerCard: { margin: 16, borderRadius: 16, overflow: "hidden", backgroundColor: "#fff", paddingBottom: 12, elevation: 4 },
  coverImage: { width: "100%", height: 160, resizeMode: "cover" },
  avatarRow: { flexDirection: "row", alignItems: "center", padding: 14, position: "relative" },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: "#fff", backgroundColor: "#eee" },
  nameText: { fontSize: 18, fontWeight: "800", color: "#1A2B48" },
  subText: { color: "#777", fontSize: 13, marginTop: 4 },
  editFloating: { position: "absolute", right: 14, top: 12, backgroundColor: "#003366", padding: 10, borderRadius: 10 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 6, paddingBottom: 8 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#1A2B48" },
  statLabel: { fontSize: 11, color: "#888" },
  content: { marginHorizontal: 16, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A2B48" },
  bioText: { color: "#555", marginTop: 8, lineHeight: 20 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  tag: { backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  tagText: { color: "#003366", fontWeight: "700", fontSize: 12 },
  recentCard: { backgroundColor: "#fff", padding: 12, borderRadius: 12, marginTop: 10, elevation: 2 },
  recentTitle: { fontSize: 14, fontWeight: "700" },
  recentMeta: { fontSize: 12, color: "#888", marginTop: 6 },
  
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: 'center', alignItems: 'center' },
  modal: { position: "absolute", bottom: 0, left: 0, right: 0, height: "85%", backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 18, paddingTop: 12 },
  modalHandle: { width: 60, height: 5, backgroundColor: "#EEE", alignSelf: "center", borderRadius: 3, marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1A2B48", marginBottom: 12, textAlign: 'center' },
  
  imagesEditContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'center' },
  avatarEditWrapper: { position: 'relative', width: 80, height: 80, marginRight: 20 },
  modalAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#eee' },
  coverEditWrapper: { position: 'relative', width: 140, height: 80 },
  modalCoverThumb: { width: 140, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  smallBadge: { position: "absolute", right: 0, bottom: 0, backgroundColor: "#003366", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: '#fff' },

  fieldLabel: { marginTop: 14, color: "#555", fontWeight: "700", marginBottom: 5 },
  input: { backgroundColor: "#F4F6F9", borderRadius: 10, padding: 12, fontSize: 15 },
  
  dropdownButton: { 
    backgroundColor: '#F4F6F9', borderRadius: 10, padding: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' 
  },

  cancelBtn: { backgroundColor: "#fff", borderColor: "#DDD", borderWidth: 1, paddingVertical: 12, paddingHorizontal: 26, borderRadius: 12 },
  cancelText: { color: "#333", fontWeight: "700" },
  saveBtn: { backgroundColor: "#003366", paddingVertical: 12, paddingHorizontal: 26, borderRadius: 12 },
  saveText: { color: "#fff", fontWeight: "800" },

  tagsModalContent: { width: '85%', height: '60%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
  tagOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
  tagOptionText: { fontSize: 16, color: '#333' },
  tagOptionSelected: { backgroundColor: '#f0f8ff' },
  closeTagsBtn: { marginTop: 15, backgroundColor: '#003366', padding: 12, borderRadius: 10, alignItems: 'center' },

  header: { flexDirection: "row", justifyContent: "space-between", paddingTop: 40, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#003366" },
});