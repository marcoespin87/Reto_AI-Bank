import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type LoginFormProps = {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  loading: boolean;
  onLogin: () => void;
  onGoogleLogin: () => void;
  s: { [key: string]: any };
};

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onLogin,
  onGoogleLogin,
  s,
}: LoginFormProps) {
  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
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
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#002b73" />
          ) : (
            <Text style={s.btnPrimaryText}>Ingresar ✦</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>o</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Google btn */}
        <TouchableOpacity style={s.btnGoogle} onPress={onGoogleLogin}>
          <Text style={s.btnGoogleText}>🇬 Continuar con Google</Text>
        </TouchableOpacity>

        <View style={s.row}>
          <Text style={s.mutedText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={s.linkText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <Text style={s.footer}>
        AI-Bank © 2026 · Todos los derechos reservados
      </Text>
    </ScrollView>
  );
}
