import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../../components/BottomNav";
import { useTheme } from "../../context/ThemeContext";
import { usePremios } from "../../hooks/usePremios";

// ─── Mapas de display ────────────────────────────────────────────────────────

const CATEGORIA_ICON: Record<string, string> = {
  tecnologia: "📱",
  viajes_nacionales: "🏝️",
  viajes_internacionales: "✈️",
  gastronomia: "🍽️",
  experiencias_entretenimiento: "🎭",
  salud_bienestar: "💚",
  educacion_desarrollo: "📚",
  hogar_lifestyle: "🏠",
  premium_financiero: "💎",
};

const CATEGORIA_COLOR: Record<string, string> = {
  tecnologia: "#4FC3F7",
  viajes_nacionales: "#81C784",
  viajes_internacionales: "#FFB74D",
  gastronomia: "#F06292",
  experiencias_entretenimiento: "#CE93D8",
  salud_bienestar: "#80DEEA",
  educacion_desarrollo: "#FFD54F",
  hogar_lifestyle: "#A5D6A7",
  premium_financiero: "#FFD700",
};

const CATEGORIA_LABEL: Record<string, string> = {
  tecnologia: "Tecnología",
  viajes_nacionales: "Viajes Nacionales",
  viajes_internacionales: "Viajes Internacionales",
  gastronomia: "Gastronomía",
  experiencias_entretenimiento: "Entretenimiento",
  salud_bienestar: "Salud & Bienestar",
  educacion_desarrollo: "Educación",
  hogar_lifestyle: "Hogar & Lifestyle",
  premium_financiero: "Premium Financiero",
};

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function PremiosScreen() {
  const {
    loading,
    refreshing,
    error,
    result,
    userName,
    ligaTier,
    sinDatos,
    fetchAndSegmentar,
    onRefresh,
  } = usePremios();

  const { colors } = useTheme();
  const s = getStyles(colors);

  useEffect(() => {
    fetchAndSegmentar();
  }, []);

  const categoriaColor = result
    ? (CATEGORIA_COLOR[result.categoria] ?? colors.primary)
    : colors.primary;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View>
              <Text style={s.greeting}>Mis Premios</Text>
              <Text style={s.subGreeting}>Temporada FIFA 2026</Text>
            </View>
          </View>
          {ligaTier && (
            <View
              style={[
                s.tierBadge,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.borderStrong,
                },
              ]}
            >
              <Ionicons
                name="trophy"
                size={12}
                color={colors.gold}
                style={{ marginRight: 4 }}
              />
              <Text style={[s.tierBadgeText, { color: colors.gold }]}>
                {ligaTier}
              </Text>
            </View>
          )}
        </View>

        {/* ── Estado: cargando ── */}
        {loading && (
          <View style={s.stateContainer}>
            <ActivityIndicator
              size="large"
              color="#b2c5ff"
              style={{ marginBottom: 16 }}
            />
            <Text style={s.stateTitle}>Analizando tu perfil…</Text>
            <Text style={s.stateSub}>
              El modelo está personalizando tu premio
            </Text>
          </View>
        )}

        {/* ── Estado: error ── */}
        {!loading && error && (
          <View style={s.stateContainer}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
            <Text style={s.stateTitle}>No se pudo conectar</Text>
            <Text style={s.stateSub}>{error}</Text>
            <Text style={[s.stateSub, { marginTop: 12, color: "#8c90a1" }]}>
              Asegúrate de que la API de segmentación esté corriendo:{"\n"}
              <Text style={{ color: "#b2c5ff" }}>
                uvicorn api:app --reload --port 8000
              </Text>
            </Text>
            <TouchableOpacity style={s.retryBtn} onPress={fetchAndSegmentar}>
              <Text style={s.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Estado: sin datos suficientes ── */}
        {!loading && !error && sinDatos && (
          <View style={s.sinDatosContainer}>
            <Text style={s.sinDatosEmoji}>🏦</Text>
            <Text style={s.sinDatosTitle}>
              Aún no tienes premios disponibles
            </Text>
            <Text style={s.sinDatosSub}>
              Interactúa más con AI-Bank para que el modelo pueda personalizar
              tu premio de temporada.
            </Text>

            {/* Cómo ganar puntos */}
            <Text style={s.howTitle}>¿Cómo ganar mAiles y premios?</Text>

            <View style={s.howCard}>
              <Text style={s.howEmoji}>⭐</Text>
              <View style={s.howInfo}>
                <Text style={s.howHeading}>Gana mAiles con cada compra</Text>
                <Text style={s.howDesc}>
                  Por cada $100 que gastes con tu tarjeta AI-Bank obtienes{" "}
                  <Text style={s.howHighlight}>10 mAiles</Text>.
                </Text>
              </View>
            </View>

            <View style={s.howCard}>
              <Text style={s.howEmoji}>🃏</Text>
              <View style={s.howInfo}>
                <Text style={s.howHeading}>Cromos del álbum FIFA 2026</Text>
                <Text style={s.howDesc}>
                  Por cada <Text style={s.howHighlight}>$20 gastados</Text>{" "}
                  obtienes un cromo aleatorio. ¡Colecciónalos todos!
                </Text>
              </View>
            </View>

            <View style={s.howCard}>
              <Text style={s.howEmoji}>✈️</Text>
              <View style={s.howInfo}>
                <Text style={s.howHeading}>
                  Premio mayor: ¡Viaje al Mundial!
                </Text>
                <Text style={s.howDesc}>
                  Si completas el álbum FIFA 2026 ganas un{" "}
                  <Text style={s.howHighlight}>
                    viaje todo incluido al Mundial
                  </Text>
                  . Vuelo, hospedaje y entradas.
                </Text>
              </View>
            </View>

            {/* Medallas y descuentos */}
            <Text style={s.howTitle}>
              Sube de medalla y desbloquea descuentos
            </Text>
            <Text style={s.sinDatosSub}>
              Tus mAiles te hacen subir de medalla. A mayor medalla, mayor
              descuento en empresas aliadas de AI-Bank:
            </Text>

            <View style={s.medallaTable}>
              {[
                {
                  medalla: "🥉 Bronce",
                  desc: "5%",
                  ejemplos: "Supermaxi, Fybeca",
                },
                {
                  medalla: "🥈 Plata",
                  desc: "10%",
                  ejemplos: "KFC Ecuador, Marathon Sports",
                },
                {
                  medalla: "🥇 Oro",
                  desc: "15%",
                  ejemplos: "De Prati, Cinemark Ecuador",
                },
              ].map((row) => (
                <View key={row.medalla} style={s.medallaRow}>
                  <View style={s.medallaLeft}>
                    <Text style={s.medallaIcon}>{row.medalla}</Text>
                  </View>
                  <View style={s.medallaRight}>
                    <Text style={s.medallaDesc}>{row.desc} descuento</Text>
                    <Text style={s.medallaEjemplos}>{row.ejemplos}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => router.replace("/(tabs)/banco")}
            >
              <Text style={s.retryBtnText}>
                Ir a hacer mi primera transacción
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Estado: resultado ── */}
        {!loading && !error && !sinDatos && result && (
          <>
            {/* Tarjeta principal del premio */}
            <View style={[s.prizeCard, { borderColor: categoriaColor }]}>
              <View
                style={[
                  s.prizeCardGlow,
                  { backgroundColor: categoriaColor + "18" },
                ]}
              />

              {/* Badge de categoría */}
              <View
                style={[
                  s.categoryBadge,
                  {
                    backgroundColor: categoriaColor + "22",
                    borderColor: categoriaColor + "55",
                  },
                ]}
              >
                <Text style={s.categoryBadgeIcon}>
                  {CATEGORIA_ICON[result.categoria] ?? "🎁"}
                </Text>
                <Text style={[s.categoryBadgeText, { color: categoriaColor }]}>
                  {CATEGORIA_LABEL[result.categoria] ?? result.categoria}
                </Text>
              </View>

              {/* Premio principal */}
              <Text style={s.prizeEmoji}>
                {CATEGORIA_ICON[result.categoria] ?? "🎁"}
              </Text>
              <Text style={s.prizeName}>{result.premio_nombre}</Text>

              {/* Métricas */}
              <View style={s.metricsRow}>
                <View style={s.metricItem}>
                  <Text style={[s.metricValue, { color: categoriaColor }]}>
                    {result.afinidad_pct}%
                  </Text>
                  <Text style={s.metricLabel}>Afinidad</Text>
                </View>
                <View style={s.metricDivider} />
                <View style={s.metricItem}>
                  <Text style={[s.metricValue, { color: categoriaColor }]}>
                    {result.confianza_pct}%
                  </Text>
                  <Text style={s.metricLabel}>Confianza</Text>
                </View>
              </View>
            </View>

            {/* Por qué este premio */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionIcon}>🤖</Text>
                <Text style={s.sectionTitle}>Por qué este premio</Text>
              </View>
              <View style={s.reasonsList}>
                {result.razones.map((r, i) => (
                  <View key={i} style={s.reasonItem}>
                    <View
                      style={[s.reasonDot, { backgroundColor: categoriaColor }]}
                    />
                    <Text style={s.reasonText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top 3 categorías */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionIcon}>📊</Text>
                <Text style={s.sectionTitle}>Tus categorías principales</Text>
              </View>
              {result.top3_categorias.map(([cat, pct]) => {
                const col = CATEGORIA_COLOR[cat] ?? "#b2c5ff";
                return (
                  <View key={cat} style={s.catRow}>
                    <Text style={s.catIcon}>{CATEGORIA_ICON[cat] ?? "🎁"}</Text>
                    <View style={s.catBarContainer}>
                      <Text style={s.catLabel}>
                        {CATEGORIA_LABEL[cat] ?? cat}
                      </Text>
                      <View style={s.catBarTrack}>
                        <View
                          style={[
                            s.catBarFill,
                            { width: `${pct}%`, backgroundColor: col },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[s.catPct, { color: col }]}>{pct}%</Text>
                  </View>
                );
              })}
            </View>

            {/* Premios alternativos */}
            {result.alternativas.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionIcon}>🎁</Text>
                  <Text style={s.sectionTitle}>También podrías ganar</Text>
                </View>
                {result.alternativas.map((alt) => (
                  <View key={alt.premio} style={s.altItem}>
                    <Text style={s.altEmoji}>
                      {CATEGORIA_ICON[result.categoria] ?? "🎁"}
                    </Text>
                    <View style={s.altInfo}>
                      <Text style={s.altName}>{alt.nombre}</Text>
                      <Text style={s.altAfinidad}>
                        {alt.afinidad}% de afinidad
                      </Text>
                    </View>
                    <View
                      style={[
                        s.altBadge,
                        { borderColor: categoriaColor + "55" },
                      ]}
                    >
                      <Text style={[s.altBadgeText, { color: categoriaColor }]}>
                        Alt.
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 12 }} />
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav active="premios" />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

function getStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  const isDark = colors.background === "#071325";

  // Mejora de contraste en modo oscuro
  const textSecondaryContrast = isDark ? "#a8b0c4" : colors.textSecondary;
  const textMutedContrast = isDark ? "#7a8499" : colors.textMuted;

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20 },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    greeting: {
      color: isDark ? "#f0f5ff" : colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
    },
    subGreeting: {
      color: textSecondaryContrast,
      fontSize: 11,
      fontWeight: "600",
      marginTop: 2,
    },
    tierBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 0.5,
      flexDirection: "row",
      alignItems: "center",
    },
    tierBadgeText: { fontSize: 10, fontWeight: "700" },

    // Estados
    stateContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    stateTitle: {
      color: isDark ? "#f0f5ff" : colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    stateSub: {
      color: textSecondaryContrast,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    retryBtn: {
      marginTop: 24,
      backgroundColor: colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 20,
    },
    retryBtnText: { color: colors.background, fontSize: 14, fontWeight: "800" },

    // Tarjeta principal
    prizeCard: {
      borderRadius: 24,
      borderWidth: 1.5,
      padding: 24,
      marginTop: 8,
      marginBottom: 16,
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: isDark ? "#0d1621" : colors.cardBackground,
      borderColor: isDark ? "#2a3548" : colors.borderStrong,
    },
    prizeCardGlow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 24,
    },
    categoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 20,
      backgroundColor: isDark ? "#1a2a3f" : "transparent",
      borderColor: isDark ? "#3a4f6f" : colors.borderMedium,
    },
    categoryBadgeIcon: { fontSize: 14 },
    categoryBadgeText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#a8b0c4" : colors.textSecondary,
    },
    prizeEmoji: { fontSize: 64, marginBottom: 12 },
    prizeName: {
      color: isDark ? "#f0f5ff" : colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 28,
    },
    metricsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
      backgroundColor: isDark ? "#0c1420" : colors.backgroundSecondary,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 24,
      width: "100%",
      justifyContent: "center",
      borderWidth: 0.5,
      borderColor: isDark ? "#2a3548" : colors.borderMedium,
    },
    metricItem: { alignItems: "center", flex: 1 },
    metricValue: {
      fontSize: 26,
      fontWeight: "900",
      color: isDark ? "#f0f5ff" : colors.textPrimary,
    },
    metricLabel: {
      color: textSecondaryContrast,
      fontSize: 10,
      fontWeight: "600",
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    metricDivider: {
      width: 1,
      height: 36,
      backgroundColor: isDark ? "#2a3548" : colors.borderMedium,
      marginHorizontal: 12,
    },

    // Secciones
    section: {
      backgroundColor: isDark ? "#0d1621" : colors.cardBackground,
      borderRadius: 20,
      padding: 18,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: isDark ? "#2a3548" : colors.borderMedium,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    sectionIcon: { fontSize: 16 },
    sectionTitle: {
      color: isDark ? "#f0f5ff" : colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
    },

    // Razones
    reasonsList: { gap: 10 },
    reasonItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    reasonDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
    reasonText: {
      color: textSecondaryContrast,
      fontSize: 13,
      flex: 1,
      lineHeight: 20,
    },

    // Barras de categoría
    catRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    catIcon: { fontSize: 18, width: 24, textAlign: "center" },
    catBarContainer: { flex: 1 },
    catLabel: {
      color: textSecondaryContrast,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 4,
    },
    catBarTrack: {
      height: 6,
      backgroundColor: isDark ? "#2a3548" : colors.borderMedium,
      borderRadius: 3,
      overflow: "hidden",
    },
    catBarFill: { height: "100%", borderRadius: 3 },
    catPct: { fontSize: 13, fontWeight: "700", width: 38, textAlign: "right" },

    // Alternativas
    altItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? "#2a3548" : colors.borderMedium,
    },
    altEmoji: { fontSize: 28 },
    altInfo: { flex: 1 },
    altName: {
      color: isDark ? "#f0f5ff" : colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    altAfinidad: { color: textSecondaryContrast, fontSize: 11, marginTop: 2 },
    altBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    altBadgeText: { fontSize: 10, fontWeight: "700" },

    // Sin datos
    sinDatosContainer: {
      paddingTop: 16,
      paddingBottom: 24,
    },
    sinDatosEmoji: { fontSize: 56, textAlign: "center", marginBottom: 12 },
    sinDatosTitle: {
      color: isDark ? "#f0f5ff" : colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 8,
    },
    sinDatosSub: {
      color: textSecondaryContrast,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    howTitle: {
      color: isDark ? "#e8f0ff" : colors.primary,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 12,
      marginTop: 16,
    },
    howCard: {
      backgroundColor: isDark ? "#121d2f" : colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 10,
      borderWidth: 0.5,
      borderColor: isDark ? "#2a3548" : colors.borderMedium,
    },
    howEmoji: { fontSize: 28, marginTop: 2 },
    howInfo: { flex: 1 },
    howHeading: {
      color: isDark ? "#f0f5ff" : colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 4,
    },
    howDesc: { color: textSecondaryContrast, fontSize: 13, lineHeight: 19 },
    howHighlight: {
      color: isDark ? "#ffc857" : colors.gold,
      fontWeight: "700",
    },
    medallaTable: {
      backgroundColor: isDark ? "#0c1420" : colors.backgroundSecondary,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      borderWidth: 0.5,
      borderColor: isDark ? "#2a3548" : colors.borderMedium,
    },
    medallaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? "#2a3548" : colors.borderMedium,
    },
    medallaLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
    medallaIcon: { fontSize: 20 },
    medallaRight: { alignItems: "flex-end" },
    medallaDesc: {
      color: isDark ? "#ffc857" : colors.gold,
      fontSize: 14,
      fontWeight: "800",
    },
    medallaEjemplos: { color: textMutedContrast, fontSize: 10, marginTop: 2 },
  });
}
