import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useAppContent } from "../hooks/useAppContent";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors } from "../theme/colors";

// ──── SAFE: Memoized Dots Component (Fix #1) ────
const DotsRenderer = memo(
  ({
    slides,
    currentSlide,
    onDotPress,
  }: {
    slides: any[];
    currentSlide: number;
    onDotPress: (index: number) => void;
  }) => (
    <View style={s.dots}>
      {slides.map((slide, i) => (
        <TouchableOpacity
          key={`dot-${slide.key ?? i}`} // Fallback si slide.key es undefined
          onPress={() => onDotPress(i)}
          style={[s.dot, i === currentSlide ? s.dotActive : s.dotInactive]}
          activeOpacity={0.8}
        />
      ))}
    </View>
  ),
);

type Nav = NativeStackNavigationProp<RootStackParamList, "Onboarding">;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const flatRef = useRef<FlatList>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { width, height } = useWindowDimensions();
  const isCompactWidth = width < 390;
  const isCompactHeight = height < 760;
  const { signIn, session } = useAuth();
  const {
    data: appContent,
    loading: contentLoading,
    error: contentError,
    loadContent,
  } = useAppContent();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const slides = appContent?.onboarding.slides ?? [];
  const loginContent = appContent?.onboarding.login;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Datos incompletos", "Ingresa tu email y contraseña.");
      return;
    }
    setAuthLoading(true);
    const { error } = await signIn(email.trim(), password);
    setAuthLoading(false);
    if (error) {
      Alert.alert("Error al ingresar", error);
    } else {
      goToMain();
    }
  };

  const goToMain = () => {
    if (session) {
      navigation.replace("Main");
    } else if (slides.length > 0) {
      goToSlide(slides.length - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      flatRef.current?.scrollToIndex({ index, animated: true });
      setCurrentSlide(index);
    }
  };

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
      return;
    }

    goToMain();
  };

  const renderDots = () => (
    <DotsRenderer
      slides={slides}
      currentSlide={currentSlide}
      onDotPress={goToSlide}
    />
  );

  const renderGalleryImage = (uri: string | undefined, style: object) => (
    <Image source={uri ? { uri } : undefined} style={style as any} />
  );

  const renderSlide = (key: string, index: number) => {
    const slide = slides[index];

    if (!slide) {
      return (
        <View style={[s.slide, s.centered, { width }]}>
          <Text style={s.slideSubtitle}>Sin contenido disponible.</Text>
        </View>
      );
    }

    if (index === 0) {
      return (
        <ImageBackground
          source={slide.imageUrl ? { uri: slide.imageUrl } : undefined}
          style={{ width, height }}
        >
          <LinearGradient
            colors={["transparent", `${colors.surface}AA`, colors.surface]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              s.slideContent,
              {
                justifyContent: "flex-end",
                paddingHorizontal: isCompactWidth ? 24 : 32,
                paddingBottom: insets.bottom + 120,
              },
            ]}
          >
            <Text style={s.heroTitle}>{slide.title}</Text>
            <Text style={s.heroSubtitle}>{slide.subtitle}</Text>
            <TouchableOpacity
              onPress={goToNextSlide}
              style={s.primaryCta}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.primaryCtaFill}
              >
                <Text style={s.primaryCtaText}>
                  {slide.ctaLabel ?? "Continuar"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={[s.bottomArea, { bottom: insets.bottom + 40 }]}>
            {renderDots()}
            <View style={s.badge}>
              <Text style={s.badgeText}>
                {appContent?.onboarding.seasonBadge ??
                  "Sin temporada configurada"}
              </Text>
            </View>
          </View>
        </ImageBackground>
      );
    }

    if (index === 1) {
      return (
        <View style={[s.slide, { width, backgroundColor: colors.surface }]}>
          <View style={s.slide2Glow} />
          <View
            style={[
              s.slideContent,
              {
                paddingHorizontal: isCompactWidth ? 24 : 32,
                paddingTop: isCompactHeight ? 24 : 48,
                paddingBottom: insets.bottom + 110,
              },
            ]}
          >
            <View style={s.cardGrid}>
              <View style={[s.cardItem, { transform: [{ rotate: "-6deg" }] }]}>
                {renderGalleryImage(slide.gallery?.[0], s.cardImage)}
              </View>
              <View
                style={[
                  s.cardItem,
                  { transform: [{ rotate: "6deg" }, { translateY: 28 }] },
                ]}
              >
                {renderGalleryImage(slide.gallery?.[1], s.cardImage)}
              </View>
            </View>

            <Text style={s.slideTitle}>{slide.title}</Text>
            <Text style={s.slideSubtitle}>{slide.subtitle}</Text>

            <TouchableOpacity
              onPress={goToNextSlide}
              style={s.secondaryCta}
              activeOpacity={0.8}
            >
              <Text style={s.secondaryCtaText}>
                {slide.ctaLabel ?? "Siguiente"}
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={[s.bottomArea, { bottom: insets.bottom + 40 }]}>
            {renderDots()}
          </View>
        </View>
      );
    }

    return (
      <View style={[s.slide, { width, backgroundColor: colors.surface }]}>
        <View style={s.slide3Glow} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.keyboardWrapper}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              s.slide3ScrollContent,
              {
                flexGrow: 1,
                paddingTop: insets.top + (isCompactHeight ? 28 : 56),
                paddingBottom: insets.bottom + 120,
                paddingHorizontal: isCompactWidth ? 20 : 32,
              },
            ]}
          >
            <View style={s.slide3Shell}>
              <View
                style={[
                  s.avatarRow,
                  { marginBottom: isCompactHeight ? 20 : 30 },
                ]}
              >
                {renderGalleryImage(slide.gallery?.[0], s.avatarSmall)}
                {renderGalleryImage(slide.gallery?.[1], s.avatarLarge)}
                {renderGalleryImage(slide.gallery?.[2], s.avatarSmall)}
              </View>

              <Text style={s.slideTitle}>{slide.title}</Text>
              <Text style={s.slideSubtitle}>{slide.subtitle}</Text>

              <View style={s.loginCard}>
                <View style={s.logoRow}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryContainer]}
                    style={s.logoIcon}
                  >
                    <MaterialIcons
                      name="account-balance"
                      size={20}
                      color={colors.onPrimary}
                    />
                  </LinearGradient>
                  <Text style={s.logoText}>AI-Bank</Text>
                </View>

                <View style={s.formGroup}>
                  <Text style={s.inputLabel}>Email</Text>
                  <TextInput
                    style={s.input}
                    placeholder="nombre@ejemplo.com"
                    placeholderTextColor={colors.outline}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!authLoading}
                  />
                </View>

                <View style={s.formGroup}>
                  <Text style={s.inputLabel}>Contraseña</Text>
                  <TextInput
                    style={s.input}
                    placeholder="••••••••"
                    secureTextEntry
                    placeholderTextColor={colors.outline}
                    value={password}
                    onChangeText={setPassword}
                    editable={!authLoading}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleLogin}
                  style={[s.loginButton, authLoading && { opacity: 0.7 }]}
                  activeOpacity={0.85}
                  disabled={authLoading}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.primaryCtaFill}
                  >
                    {authLoading ? (
                      <ActivityIndicator color={colors.onPrimary} />
                    ) : (
                      <Text style={s.loginButtonText}>Ingresar</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={s.loginFooter}>
                  <TouchableOpacity
                    style={s.biometricBtn}
                    onPress={() =>
                      Alert.alert(
                        "Biometría",
                        loginContent?.biometricMessage ??
                          "Sin mensaje disponible",
                      )
                    }
                  >
                    <MaterialIcons
                      name="fingerprint"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Crear cuenta",
                        loginContent?.registerMessage ??
                          "Sin mensaje disponible",
                      )
                    }
                  >
                    <Text style={s.createAccount}>Crear cuenta</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={[s.bottomArea, { bottom: insets.bottom + 40 }]}>
          {renderDots()}
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      {/* SAFE: Stable Container for Loading/Error States (Fix #2) */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={contentLoading && !slides.length ? "auto" : "none"}
      >
        {contentLoading && !slides.length && (
          <View
            style={[s.slide, s.centered, { backgroundColor: colors.surface }]}
          >
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      </View>

      {/* SAFE: Stable Container for Error State */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={!contentLoading && !slides.length ? "auto" : "none"}
      >
        {!contentLoading && !slides.length && (
          <View
            style={[s.slide, s.centered, { backgroundColor: colors.surface }]}
          >
            <Text style={s.slideSubtitle}>
              {contentError ?? "No se pudo cargar onboarding."}
            </Text>
          </View>
        )}
      </View>

      {/* SAFE: FlatList always rendered but conditionally visible (Fix #2) */}
      {slides.length > 0 && (
        <FlatList
          ref={flatRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key || `fallback-${Math.random()}`}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) =>
            setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item, index }) => renderSlide(item.key, index)}
          scrollEnabled={!contentLoading}
        />
      )}

      <TouchableOpacity
        style={[s.skipButton, { top: insets.top + 12 }]}
        onPress={goToMain}
      >
        <Text style={s.skipText}>Saltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  slide: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center", padding: 24 },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 24,
  },
  primaryCta: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 28,
  },
  primaryCtaFill: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaText: {
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 15,
  },
  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
  },
  dots: { flexDirection: "row", gap: 8 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 32, backgroundColor: colors.primary },
  dotInactive: { width: 8, backgroundColor: colors.outlineVariant },
  badge: {
    backgroundColor: `${colors.surfaceContainerHigh}99`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  slide2Glow: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${colors.primary}1A`,
  },
  cardGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 40,
    height: 180,
    alignItems: "center",
  },
  cardItem: {
    width: 110,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardImage: { width: "100%", height: "100%" },
  slideTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.onSurface,
    textAlign: "center",
    marginBottom: 10,
  },
  slideSubtitle: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 420,
  },
  secondaryCta: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${colors.surfaceContainerHigh}CC`,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
  },
  secondaryCtaText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  slide3Glow: {
    position: "absolute",
    bottom: -100,
    right: -50,
    width: 300,
    height: 200,
    borderRadius: 150,
    backgroundColor: `${colors.secondary}0D`,
  },
  keyboardWrapper: {
    flex: 1,
  },
  slide3ScrollContent: {
    width: "100%",
  },
  slide3Shell: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    alignItems: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.primary,
    marginHorizontal: -10,
    zIndex: 1,
  },
  loginCard: {
    width: "100%",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 28,
    padding: 25,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
  },
  formGroup: { marginBottom: 15 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.onSurface,
    fontSize: 15,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}66`,
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  loginButtonText: {
    color: colors.onPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  loginFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  biometricBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
    alignItems: "center",
    justifyContent: "center",
  },
  createAccount: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  skipButton: {
    position: "absolute",
    right: 20,
    backgroundColor: "rgba(31,42,61,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  skipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
});
