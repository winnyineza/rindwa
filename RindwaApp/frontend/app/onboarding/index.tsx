import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const slides = [
  {
    title: 'Stay Safe, Stay Connected',
    description: 'Get real-time alerts about nearby emergencies and incidents reported by people around you.',
  },
  {
    title: 'Verified by the People',
    description: 'Incidents are upvoted by nearby users to ensure accuracy, urgency, and trust.',
  },
  {
    title: 'Act Fast, Alert Everyone',
    description: 'Notify emergency contacts, report incidents instantly, and connect directly with authorities.',
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <View style={styles.splashBox}>
        <Text style={styles.logo}>RINDWA APP</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>{slides[index].title}</Text>
        <Text style={styles.desc}>{slides[index].description}</Text>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.activeDot]} />
          ))}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => (index < slides.length - 1 ? setIndex(index + 1) : router.replace('/auth/login'))}
        >
          <Text style={styles.buttonText}>{index < slides.length - 1 ? 'Next' : 'Log in'}</Text>
        </TouchableOpacity>
        {index < slides.length - 1 && (
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  splashBox: { flex: 1, backgroundColor: '#1A1787', justifyContent: 'center', alignItems: 'center', borderRadius: 32, margin: 24 },
  logo: { color: '#fff', fontSize: 36, fontWeight: 'bold', letterSpacing: 2 },
  card: { backgroundColor: '#fff', borderRadius: 32, margin: 16, padding: 24, alignItems: 'center', elevation: 4 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 24 },
  dots: { flexDirection: 'row', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc', margin: 4 },
  activeDot: { backgroundColor: '#222' },
  button: { backgroundColor: '#1A1787', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32, marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  skip: { color: '#222', marginTop: 8, fontSize: 16 },
}); 