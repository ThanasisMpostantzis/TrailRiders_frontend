import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ModalScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.modalContainer}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Image
            source={require('@/images/logo.webp')}
            style={styles.bannerImage}
          />

          <TouchableOpacity style={styles.closeButton} onPress={() => router.push('/(tabs)/home')}>
            <Ionicons name="close" size={28} color="#fff"/>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>Ride Details</ThemedText>
          <ThemedText type="subtitle">Athens Moto/Car Meet</ThemedText>
          <ThemedText type="default" style={styles.description}>
            This is a premium ride experience. You will enjoy breathtaking routes, amazing scenery, and an unforgettable ride with fellow riders.
            ---------This is a premium ride experience. You will enjoy breathtaking routes, amazing scenery, and an unforgettable ride with fellow riders.
          </ThemedText>

          <Link href="/(tabs)/home" dismissTo style={styles.link}>
            <ThemedText type="link">Go to Home Screen</ThemedText>
          </Link>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: "10%"
  },
  bannerImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 16,
  },
  content: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    marginTop: "5%",
    marginBottom: "5%",
  },
  closeButton: {
    position: "absolute",
    top: "7%",
    right: "10%",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  link: {
    marginTop: 10,
    alignSelf: "center",
  },
});
