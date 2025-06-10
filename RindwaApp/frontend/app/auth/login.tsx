import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { apiRequest } from '../../utils/api';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  // Facebook Auth
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleLogin(authentication.accessToken);
    }
  }, [response]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      handleFacebookLogin(authentication.accessToken);
    }
  }, [fbResponse]);

  async function handleLogin() {
    setError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: any }>(
        '/auth/login',
        'POST',
        { email, password }
      );
      await SecureStore.setItemAsync('token', data.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(accessToken: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{ token: string; user: any }>(
        '/auth/google',
        'POST',
        { accessToken }
      );
      await SecureStore.setItemAsync('token', data.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookLogin(accessToken: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{ token: string; user: any }>(
        '/auth/facebook',
        'POST',
        { accessToken }
      );
      await SecureStore.setItemAsync('token', data.token);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.subtitle}>Log in using your account information</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username / Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="nezawinnie@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Log in</Text>}
      </TouchableOpacity>
      <View style={styles.row}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/signup')}>
          <Text style={styles.secondaryBtnText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.secondaryBtnText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.or}>Or log in with</Text>
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn} onPress={() => promptAsync()}>
          <Text style={styles.socialIcon}>G</Text>
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => fbPromptAsync()}>
          <Text style={styles.socialIcon}>f</Text>
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#231942', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 24 },
  error: { color: 'red', marginBottom: 8, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { color: '#888', marginBottom: 4, marginLeft: 8 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 24, padding: 16, fontSize: 16, marginBottom: 0 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eye: { fontSize: 20, marginLeft: 8 },
  loginBtn: { backgroundColor: '#1A1787', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  secondaryBtn: { flex: 1, alignItems: 'center' },
  secondaryBtnText: { color: '#231942', fontSize: 16 },
  or: { textAlign: 'center', color: '#888', marginVertical: 16 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between' },
  socialBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 24, marginHorizontal: 8, flex: 1, justifyContent: 'center' },
  socialIcon: { fontSize: 20, marginRight: 8 },
  socialText: { fontSize: 16 },
}); 