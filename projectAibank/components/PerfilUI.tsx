import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Animated,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "./BottomNav";

// ============================================
// INTERFAZ DE PROPS
// ============================================

interface PerfilUIProps {
  userName: string;
  email: string;
  mailes: number;
  fechaRegistro: string;
  predicciones: number;
  rachaMax: number;
  medallaActual: number;
  estrellasActuales: number;
  medallaNombre: string;
  comprasUmbral: number;
  refreshing: boolean;
  beneficiosOpen: boolean;
  setBeneficiosOpen: (open: boolean) => void;
  rotateAnim: Animated.Value;
  theme: string;
  onRefresh: () => void;
  handleLogout: () => void;
  handleToggleTheme: () => void;
}

// ============================================
// CONSTANTES Y UTILIDADES
// ============================================

const medallas = [1, 2, 3, 4, 5, 6];

const beneficios: Record<number, string[]> = {
  1: ["Acceso básico a pronósticos", "Acumulación de mAiles x1.0"],
  2: [
    "Todo de Medalla 1",
    "Multiplicador mAiles x1.1",
    "Acceso a ligas grupales",
  ],
  3: [
    "Todo de Medalla 2",
    "Multiplicador mAiles x1.2",
    "Acceso anticipado a preventas",
    "Personalización de tarjeta digital",
  ],
  4: [
    "Todo de Medalla 3",
    "Multiplicador mAiles x1.5",
    "Sala VIP en aeropuertos",
    "Pronósticos exclusivos de semifinales",
  ],
  5: [
    "Todo de Medalla 4",
    "Multiplicador mAiles x2.0",
    "Upgrades de vuelo",
    "Experiencias exclusivas del Mundial",
  ],
  6: [
    "Todo de Medalla 5",
    "Multiplicador mAiles x3.0",
    "Acceso a palco VIP",
    "Beneficios ilimitados AI-Bank",
  ],
};

function formatFecha(fecha: string) {
  if (!fecha) return "N/A";
  const d = new Date(fecha);
  return d.toLocaleDateString("es", { month: "long", year: "numeric" });
}

// ============================================
// COMPONENTE PRINCIPAL - UI VISUAL
// ============================================

export default function PerfilUI(props: PerfilUIProps) {
  const { colors } = useTheme();
  const s = getStyles(colors);
  const rotate = props.rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const umbral = props.comprasUmbral > 0 ? props.comprasUmbral : 5;
  const estrellasFill = props.estrellasActuales % 5;
  const progresoPct = (estrellasFill / 5) * 100;
  const medallaLabel = props.medallaNombre || `Medalla ${props.medallaActual}`;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={props.refreshing}
            onRefresh={props.onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header con toggle tema */}
        <View style={s.header}>
          <Text style={s.headerTitle}>
            Hola, {props.userName.split(" ")[0]}
          </Text>
          <View style={s.headerRight}>
            {/* Toggle Tema */}
            <Animated.View style={{ transform: [{ rotate }] }}>
              <TouchableOpacity
                onPress={props.handleToggleTheme}
                style={s.themeToggleBtn}
              >
                <Ionicons
                  name={props.theme === "dark" ? "moon" : "sunny"}
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </Animated.View>
            <View style={s.leagueBadge}>
              <Text style={s.leagueBadgeText}>{medallaLabel}</Text>
            </View>
          </View>
        </View>

        {/* Avatar Section */}
        <View style={s.avatarSection}>
          <View style={s.avatarRing}>
            <View style={s.avatarInner}>
              <Text style={s.avatarText}>
                {props.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={s.medalBadge}>
              <Text style={s.medalBadgeText}>Liga Plata</Text>
            </View>
          </View>
          <Text style={s.profileName}>{props.userName}</Text>
          <Text style={s.profileEmail}>{props.email}</Text>
          <Text style={s.profileSince}>
            Miembro desde {formatFecha(props.fechaRegistro)}
          </Text>
        </View>

        {/* Star Progress */}
        <View style={s.section}>
          <View style={s.progressHeader}>
            <Text style={s.progressTitle}>
              {medallaLabel} · {estrellasFill}/{umbral} compras para ★
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={s.progressCount}>{estrellasFill}/5 ★</Text>
              <Ionicons name="star" size={16} color={colors.gold} />
            </View>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progresoPct}%` }]} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {[
            {
              value: props.mailes.toLocaleString(),
              icon: "star" as const,
              label: "Total mAiles",
            },
            {
              value: props.predicciones.toString(),
              icon: "football" as const,
              label: "Predicciones",
            },
            { value: "1", icon: "calendar" as const, label: "Temporadas" },
            {
              value: props.rachaMax.toString(),
              icon: "flame" as const,
              label: "Racha Máx",
            },
          ].map((stat, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Ionicons name={stat.icon} size={24} color={colors.gold} />
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Medal History */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Mis medallas</Text>
            <Text style={s.seeAll}>Ver todas</Text>
          </View>
          <View style={s.medalsRow}>
            {medallas.map((m) => (
              <View
                key={m}
                style={[
                  s.medalItem,
                  m === props.medallaActual && s.medalItemActive,
                ]}
              >
                {m === props.medallaActual ? (
                  <View style={s.medalCircleActive}>
                    <Ionicons
                      name="medal"
                      size={24}
                      color={colors.textOnGold}
                    />
                  </View>
                ) : m < props.medallaActual ? (
                  <View style={s.medalCircleDone}>
                    <Ionicons name="medal" size={24} color={colors.gold} />
                  </View>
                ) : (
                  <View style={s.medalCircleLocked}>
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={colors.textMuted}
                    />
                  </View>
                )}
                {m === props.medallaActual ? (
                  <Text style={s.medalCurrentLabel}>ACTUAL</Text>
                ) : (
                  <Text style={s.medalLabel}>M{m}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={s.sectionCard}>
          <TouchableOpacity
            style={s.sectionHeader}
            onPress={() => props.setBeneficiosOpen(!props.beneficiosOpen)}
          >
            <View style={s.benefitsTitleRow}>
              <Ionicons name="checkmark-circle" size={20} color={colors.gold} />
              <Text style={s.sectionTitle}>
                Beneficios Medalla {props.medallaActual}
              </Text>
            </View>
            <Text style={s.chevron}>{props.beneficiosOpen ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {props.beneficiosOpen && (
            <View style={s.benefitsList}>
              {(beneficios[props.medallaActual] || []).map((b, i) => (
                <View key={i} style={s.benefitItem}>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.gold}
                    style={{ marginTop: 2 }}
                  />
                  <Text style={s.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Next Medal Benefits */}
        {props.medallaActual < 6 && (
          <View style={[s.sectionCard, { opacity: 0.5 }]}>
            <View style={s.sectionHeader}>
              <View style={s.benefitsTitleRow}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={colors.textMuted}
                />
                <Text style={s.sectionTitle}>
                  Beneficios Medalla {props.medallaActual + 1}
                </Text>
              </View>
              <Text style={s.chevron}>▼</Text>
            </View>
          </View>
        )}

        {/* Premio personalizado */}
        <TouchableOpacity
          style={s.sectionCard}
          onPress={() => router.push("/(tabs)/premios")}
        >
          <View style={s.prizeRow}>
            <View style={s.prizeRowLeft}>
              <View style={{ marginRight: 12 }}>
                <Ionicons name="trophy" size={28} color={colors.gold} />
              </View>
              <View>
                <Text style={s.prizeRowTitle}>Mi Premio de Temporada</Text>
                <Text style={s.prizeRowSub}>
                  Descubre tu recompensa personalizada
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Settings */}
        <View style={s.sectionCard}>
          {[
            {
              ionicon: "notifications-outline" as const,
              label: "Notificaciones",
            },
            { ionicon: "lock-closed-outline" as const, label: "Seguridad" },
            {
              ionicon: "globe-outline" as const,
              label: "Idioma",
              sub: "Español",
            },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={s.settingItem}>
              <View style={s.settingLeft}>
                <View style={s.settingIconWrap}>
                  <Ionicons
                    name={item.ionicon}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={s.settingLabel}>{item.label}</Text>
                  {item.sub && <Text style={s.settingSub}>{item.sub}</Text>}
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.settingItem} onPress={props.handleLogout}>
            <View style={s.settingLeft}>
              <View
                style={[
                  s.settingIconWrap,
                  { backgroundColor: colors.errorDim },
                ]}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.error}
                />
              </View>
              <Text style={[s.settingLabel, { color: colors.error }]}>
                Cerrar sesión
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomNav active="perfil" />
    </SafeAreaView>
  );
}

// ============================================
// ESTILOS
// ============================================

function getStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20 },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
    },
    headerTitle: { color: colors.primary, fontSize: 20, fontWeight: "800" },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    themeToggleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryDim,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    themeToggleIcon: { fontSize: 18 }, // Removido - ahora usa Ionicons
    leagueBadge: {
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    leagueBadgeText: { color: colors.primary, fontSize: 10, fontWeight: "700" },

    avatarSection: { alignItems: "center", marginBottom: 24, marginTop: 8 },
    avatarRing: {
      width: 120,
      height: 120,
      borderRadius: 60,
      padding: 3,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      position: "relative",
      shadowColor: colors.goldShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
    },
    avatarInner: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: colors.background,
    },
    avatarText: { color: colors.primary, fontSize: 42, fontWeight: "800" },
    medalBadge: {
      position: "absolute",
      bottom: -8,
      backgroundColor: colors.gold,
      paddingHorizontal: 12,
      paddingVertical: 3,
      borderRadius: 20,
    },
    medalBadgeText: {
      color: colors.textOnGold,
      fontSize: 9,
      fontWeight: "800",
    },
    profileName: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 4,
    },
    profileEmail: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 4,
    },
    profileSince: { color: colors.textMuted, fontSize: 12 },

    section: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    progressTitle: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "600",
      flex: 1,
    },
    progressCount: { color: colors.gold, fontSize: 12, fontWeight: "700" },
    progressBar: {
      height: 8,
      backgroundColor: colors.borderMedium,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.gold,
      borderRadius: 4,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 12,
    },
    statCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      alignItems: "flex-start",
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    statValue: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 2,
    },
    statIcon: { fontSize: 16, marginBottom: 8 }, // Removido - ahora usa Ionicons
    statLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
    },

    sectionCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
    seeAll: { color: colors.primary, fontSize: 12, fontWeight: "600" },
    chevron: { color: colors.textSecondary, fontSize: 16 },

    medalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    medalItem: { alignItems: "center", gap: 4 },
    medalItemActive: { transform: [{ scale: 1.2 }] },
    medalCircleActive: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    medalCircleDone: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.gold,
    },
    medalCircleLocked: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
      opacity: 0.4,
    },
    medalCircleText: { fontSize: 20 },
    medalCurrentLabel: { color: colors.gold, fontSize: 8, fontWeight: "800" },
    medalLabel: { color: colors.textSecondary, fontSize: 9 },

    benefitsTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    benefitsIcon: { fontSize: 16 }, // Removido - ahora usa Ionicons
    benefitsList: { gap: 10 },
    benefitItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    benefitCheck: {
      color: colors.gold,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 1,
    },
    benefitText: { color: colors.textPrimary, fontSize: 13, flex: 1 },

    prizeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    prizeRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      flex: 1,
    },
    prizeRowTitle: { color: colors.gold, fontSize: 15, fontWeight: "700" },
    prizeRowSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
    settingIcon: { fontSize: 20 },
    settingIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primaryDim,
      alignItems: "center",
      justifyContent: "center",
    },
    settingLabel: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    settingSub: { color: colors.textSecondary, fontSize: 11, marginTop: 1 },
  });
}
