import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  }

async function handleGoogleLogin() {
  const redirectUrl = 'projectaibank://';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    Alert.alert('Error', error.message);
    return;
  }

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success') {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        await supabase.auth.refreshSession();
      }
    }
  }
}

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Background glow */}
          <View style={s.glowTop} />
          <View style={s.glowBottom} />

          {/* Logo */}
          <View style={s.logoArea}>
            <View style={s.logoIconWrap}>
              <View style={s.logoIcon}>
                <Text style={s.logoIconText}>⚽</Text>
              </View>
            </View>
            <Text style={s.logoTitle}>AI-Bank</Text>
            <Text style={s.logoSub}>mAiles</Text>
            <Text style={s.logoTagline}>Temporada Mundial 2026</Text>
          </View>

          {/* Card */}
          <View style={s.card}>

            {/* Liga badge */}
            <View style={s.badge}>
              <Text style={s.badgeText}>BIENVENIDO QUERIDO USUARIO</Text>
            </View>

            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              placeholder="nombre@ejemplo.com"
              placeholderTextColor="#424655"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={s.label}>CONTRASEÑA</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor="#424655"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[s.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#002b73" />
                : <Text style={s.btnPrimaryText}>Ingresar ✦</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>o</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Google btn */}
            <TouchableOpacity style={s.btnGoogle} onPress={handleGoogleLogin}>
              <Text style={s.btnGoogleText}>🇬  Continuar con Google</Text>
            </TouchableOpacity>

            <View style={s.row}>
              <Text style={s.mutedText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={s.linkText}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* Footer */}
          <Text style={s.footer}>AI-Bank © 2026 · Todos los derechos reservados</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071325' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },

  // Glows
  glowTop: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#b2c5ff', opacity: 0.06,
  },
  glowBottom: {
    position: 'absolute', bottom: 0, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#5b8cff', opacity: 0.05,
  },

  // Logo
  logoArea: { alignItems: 'center', marginBottom: 36, marginTop: 20 },
  logoIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(178,197,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(178,197,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoIcon: { alignItems: 'center', justifyContent: 'center' },
  logoIconText: { fontSize: 32 },
  logoTitle: {
    color: '#b2c5ff', fontSize: 32, fontWeight: '800',
    letterSpacing: -1,
  },
  logoSub: {
    color: '#ffd65b', fontSize: 13, fontWeight: '700',
    letterSpacing: 6, marginTop: 2,
  },
  logoTagline: {
    color: '#424655', fontSize: 11, fontWeight: '600',
    letterSpacing: 1, marginTop: 10,
    borderWidth: 1, borderColor: '#1f2a3d',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },

  // Card
  card: {
    backgroundColor: '#1f2a3d',
    borderRadius: 28, padding: 24,
    borderWidth: 0.5, borderColor: 'rgba(140,144,161,0.15)',
  },

  badge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(178,197,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(178,197,255,0.15)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    marginBottom: 20,
  },
  badgeText: {
    color: '#b2c5ff', fontSize: 9, fontWeight: '700', letterSpacing: 2,
  },

  label: {
    color: '#b2c5ff', fontSize: 10, fontWeight: '700',
    letterSpacing: 2, marginBottom: 6, marginLeft: 4,
  },
  input: {
    backgroundColor: '#030e20', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 15,
    color: '#d7e3fc', fontSize: 15, marginBottom: 16,
    borderWidth: 0.5, borderColor: 'rgba(66,70,85,0.5)',
  },

  btnPrimary: {
    borderRadius: 14, paddingVertical: 17,
    alignItems: 'center', marginTop: 4,
    backgroundColor: '#b2c5ff',
  },
  btnPrimaryText: { color: '#002b73', fontWeight: '800', fontSize: 16 },

  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 18, gap: 10,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: '#424655' },
  dividerText: { color: '#424655', fontSize: 12 },

  btnGoogle: {
    backgroundColor: '#142032',
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 4,
    borderWidth: 0.5, borderColor: '#424655',
  },
  btnGoogleText: { color: '#d7e3fc', fontWeight: '600', fontSize: 15 },

  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  mutedText: { color: '#8c90a1', fontSize: 13 },
  linkText: { color: '#b2c5ff', fontWeight: '700', fontSize: 13 },

  footer: {
    color: '#424655', fontSize: 10, textAlign: 'center', marginTop: 32,
  },
});