import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

type Screen = "splash" | "cedula" | "password" | "bienvenida";

const EMAILS_PRUEBA = [
  "usuario1@aibank.test",
  "usuario2@aibank.test",
  "usuario3@aibank.test",
  "demo@aibank.test",
];

export default function LoginScreen() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cedulaNotFound, setCedulaNotFound] = useState(false);

  // Splash de 2 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("cedula");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  async function handleValidateCedula() {
    if (!cedula.trim()) {
      Alert.alert("Error", "Ingresa tu número de cédula");
      return;
    }

    setLoading(true);
    try {
      // Buscar usuario por cédula en Supabase
      const { data, error } = await supabase
        .from("users")
        .select("id, email, nombre")
        .eq("cedula", cedula.trim())
        .single();

      if (error || !data) {
        // Cédula no encontrada
        setCedulaNotFound(true);
        setScreen("bienvenida");
      } else {
        // Cédula encontrada
        setEmail(data.email);
        setScreen("password");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No pudimos validar tu cédula");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) Alert.alert("Error", error.message);
  }

  function handleReset() {
    setCedula("");
    setPassword("");
    setEmail("");
    setCedulaNotFound(false);
    setScreen("cedula");
  }

  // SPLASH
  if (screen === "splash") {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.splashContainer}>
          <View style={s.glowTop} />
          <View style={s.glowBottom} />

          <View style={s.splashContent}>
            <View style={s.logoIconWrap}>
              <Text style={s.logoIconText}>⚽</Text>
            </View>
            <Text style={s.logoTitle}>AI-Bank</Text>
            <Text style={s.logoSub}>mAiles</Text>

            <View style={s.loaderWrap}>
              <ActivityIndicator size="small" color="#b2c5ff" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // CÉDULA
  if (screen === "cedula") {
    return (
      <SafeAreaView style={s.root}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.glowTop} />
            <View style={s.glowBottom} />

            <View style={s.logoArea}>
              <View style={s.logoIconWrap}>
                <Text style={s.logoIconText}>⚽</Text>
              </View>
              <Text style={s.logoTitle}>AI-Bank</Text>
              <Text style={s.logoSub}>mAiles</Text>
            </View>

            <View style={s.card}>
              <View style={s.badge}>
                <Text style={s.badgeText}>VALIDACIÓN DE IDENTIDAD</Text>
              </View>

              <Text style={s.label}>NÚMERO DE CÉDULA</Text>
              <TextInput
                style={s.input}
                placeholder="Ej: 1234567890"
                placeholderTextColor="#424655"
                value={cedula}
                onChangeText={setCedula}
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={[s.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={handleValidateCedula}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#002b73" />
                ) : (
                  <Text style={s.btnPrimaryText}>Continuar ✦</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // CONTRASEÑA
  if (screen === "password") {
    return (
      <SafeAreaView style={s.root}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.glowTop} />
            <View style={s.glowBottom} />

            <View style={s.logoArea}>
              <View style={s.logoIconWrap}>
                <Text style={s.logoIconText}>⚽</Text>
              </View>
              <Text style={s.logoTitle}>AI-Bank</Text>
              <Text style={s.logoSub}>mAiles</Text>
            </View>

            <View style={s.card}>
              <View style={s.badge}>
                <Text style={s.badgeText}>INGRESA TU CONTRASEÑA</Text>
              </View>

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
                {loading ? (
                  <ActivityIndicator color="#002b73" />
                ) : (
                  <Text style={s.btnPrimaryText}>Ingresar ✦</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={s.btnSecondary}
                onPress={handleReset}
                disabled={loading}
              >
                <Text style={s.btnSecondaryText}>← Volver</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // BIENVENIDA / CÉDULA NO ENCONTRADA
  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.glowTop} />
        <View style={s.glowBottom} />

        <View style={s.logoArea}>
          <View style={s.logoIconWrap}>
            <Text style={s.logoIconText}>⚽</Text>
          </View>
          <Text style={s.logoTitle}>Bienvenido</Text>
          <Text style={s.logoSub}>Sistema de Pruebas</Text>
        </View>

        <View style={s.card}>
          {cedulaNotFound ? (
            <>
              <Text style={s.errorMessage}>
                ❌ Lamentablemente, la cédula ingresada no se encuentra
                registrada
              </Text>

              <Text style={s.sectionTitle}>Correos de Prueba Disponibles:</Text>

              {EMAILS_PRUEBA.map((email, idx) => (
                <View key={idx} style={s.emailCard}>
                  <Text style={s.emailText}>{email}</Text>
                </View>
              ))}

              <TouchableOpacity style={s.btnPrimary} onPress={handleReset}>
                <Text style={s.btnPrimaryText}>Intentar de Nuevo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.welcomeMessage}>
                ✓ Bienvenido al Sistema de Pruebas
              </Text>

              <Text style={s.sectionTitle}>
                Correos Disponibles para Pruebas:
              </Text>

              {EMAILS_PRUEBA.map((email, idx) => (
                <View key={idx} style={s.emailCard}>
                  <Text style={s.emailText}>{email}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#071325" },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },

  // Splash
  splashContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  splashContent: { alignItems: "center", gap: 24 },
  loaderWrap: { marginTop: 20 },

  // Glows
  glowTop: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#b2c5ff",
    opacity: 0.06,
  },
  glowBottom: {
    position: "absolute",
    bottom: 0,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#5b8cff",
    opacity: 0.05,
  },

  // Logo
  logoArea: { alignItems: "center", marginBottom: 36, marginTop: 20 },
  logoIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(178,197,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(178,197,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: { alignItems: "center", justifyContent: "center" },
  logoIconText: { fontSize: 32 },
  logoTitle: {
    color: "#b2c5ff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  logoSub: {
    color: "#ffd65b",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 6,
    marginTop: 2,
  },
  logoTagline: {
    color: "#424655",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#1f2a3d",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  // Card
  card: {
    backgroundColor: "#1f2a3d",
    borderRadius: 28,
    padding: 24,
    borderWidth: 0.5,
    borderColor: "rgba(140,144,161,0.15)",
  },

  badge: {
    alignSelf: "center",
    backgroundColor: "rgba(178,197,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(178,197,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 20,
  },
  badgeText: {
    color: "#b2c5ff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
  },

  label: {
    color: "#b2c5ff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#030e20",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: "#d7e3fc",
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "rgba(66,70,85,0.5)",
  },

  btnPrimary: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "#b2c5ff",
  },
  btnPrimaryText: { color: "#002b73", fontWeight: "800", fontSize: 16 },

  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#424655",
  },
  btnSecondaryText: { color: "#b2c5ff", fontWeight: "600", fontSize: 15 },

  // Mensajes
  errorMessage: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  welcomeMessage: {
    color: "#4ecca3",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#b2c5ff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 8,
  },

  emailCard: {
    backgroundColor: "#030e20",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ffd65b",
    borderWidth: 0.5,
    borderColor: "rgba(178,197,255,0.1)",
  },
  emailText: {
    color: "#d7e3fc",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Courier New",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: "#424655" },
  dividerText: { color: "#424655", fontSize: 12 },

  btnGoogle: {
    backgroundColor: "#142032",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: "#424655",
  },
  btnGoogleText: { color: "#d7e3fc", fontWeight: "600", fontSize: 15 },

  row: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  mutedText: { color: "#8c90a1", fontSize: 13 },
  linkText: { color: "#b2c5ff", fontWeight: "700", fontSize: 13 },

  footer: {
    color: "#424655",
    fontSize: 10,
    textAlign: "center",
    marginTop: 32,
  },
});
