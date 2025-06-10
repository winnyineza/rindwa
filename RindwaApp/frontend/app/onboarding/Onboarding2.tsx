import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getItem, setItem } from '@/utils/storage';
import { useRouter } from 'expo-router';
import { Image, Pressable, Text, useEffect, useWindowDimensions, View } from 'react-native';

interface Onboarding2Props {}

export function Onboarding2({}: Onboarding2Props) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  useEffect(() => {
    getItem('hasSeenOnboarding').then(seen => {
      if (seen === 'true') {
        router.replace('/auth/login');
      }
    });
  }, []);

  async function handleLogin() {
    await setItem('hasSeenOnboarding', 'true');
    router.push('/auth/login');
  }
  async function handleRegister() {
    await setItem('hasSeenOnboarding', 'true');
    router.push('/auth/signup');
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: width * 0.6, height: width * 0.6, resizeMode: 'contain', marginBottom: 32 }}
        accessible accessibilityLabel="Onboarding illustration"
      />
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors[colorScheme].tint, textAlign: 'center', marginBottom: 16 }}>
        Join the Rindwa Community
      </Text>
      <Text style={{ fontSize: 16, color: Colors[colorScheme].text, textAlign: 'center', marginBottom: 40 }}>
        Stay safe, report incidents, and help your neighbors in real time
      </Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Pressable
          onPress={handleLogin}
          accessibilityRole="button"
          style={({ pressed }) => ({
            backgroundColor: Colors[colorScheme].tint,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 32,
            opacity: pressed ? 0.7 : 1,
            elevation: 2,
            marginRight: 8,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Login</Text>
        </Pressable>
        <Pressable
          onPress={handleRegister}
          accessibilityRole="button"
          style={({ pressed }) => ({
            backgroundColor: Colors[colorScheme].background,
            borderColor: Colors[colorScheme].tint,
            borderWidth: 2,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 32,
            opacity: pressed ? 0.7 : 1,
            marginLeft: 8,
          })}
        >
          <Text style={{ color: Colors[colorScheme].tint, fontWeight: 'bold', fontSize: 18 }}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default Onboarding2; 