import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useEffect } from 'react';
import { getItem } from '@/utils/storage';

interface Onboarding1Props {}

export function Onboarding1({}: Onboarding1Props) {
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

  function handleNext() {
    router.push('/onboarding/Onboarding2');
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={{ width: width * 0.6, height: width * 0.6, resizeMode: 'contain', marginBottom: 32 }}
        accessible accessibilityLabel="Onboarding illustration"
      />
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors[colorScheme].tint, textAlign: 'center', marginBottom: 16 }}>
        Elevate Your Wellness Journey
      </Text>
      <Text style={{ fontSize: 16, color: Colors[colorScheme].text, textAlign: 'center', marginBottom: 40 }}>
        Discover personalized fitness plans to transform your life
      </Text>
      <Pressable
        onPress={handleNext}
        accessibilityRole="button"
        style={({ pressed }) => ({
          backgroundColor: Colors[colorScheme].tint,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 48,
          opacity: pressed ? 0.7 : 1,
          elevation: 2,
        })}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Next</Text>
      </Pressable>
    </View>
  );
}

export default Onboarding1; 