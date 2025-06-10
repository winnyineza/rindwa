import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('token');
      setTimeout(() => {
        if (token) router.replace('/(tabs)');
        else router.replace('/onboarding');
        setChecking(false);
      }, 1000);
    })();
  }, []);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  return null;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1787', justifyContent: 'center', alignItems: 'center' },
}); 