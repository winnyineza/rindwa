import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiRequest } from '../../utils/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleSend() {
    setError(null);
    setSuccess(null);
    if (!email) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      await apiRequest('/auth/forgot-password', 'POST', { email });
      setSuccess('Password reset email sent!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to send a recovery code</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="nezawinnie@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Send</Text>}
      </TouchableOpacity>
      <View style={styles.row}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.secondaryBtnText}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.secondaryBtnText}>Remembered your password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  icon: { fontSize: 48, alignSelf: 'center', marginBottom: 16, color: '#1A1787' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#231942', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 24, textAlign: 'center' },
  error: { color: 'red', marginBottom: 8, textAlign: 'center' },
  success: { color: 'green', marginBottom: 8, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { color: '#888', marginBottom: 4, marginLeft: 8 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 24, padding: 16, fontSize: 16, marginBottom: 0 },
  sendBtn: { backgroundColor: '#1A1787', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  secondaryBtn: { flex: 1, alignItems: 'center' },
  secondaryBtnText: { color: '#231942', fontSize: 16 },
}); 