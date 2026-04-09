import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Animated,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  cromosObtenidos: number;
  medallaActual: number;
  estrellasActuales: number;
  medallaNombre: string;
  ligaNombre: string;
  comprasUmbral: number;
  todasLigas: any[];
  posicionEnLiga: number | null;
  refreshing: boolean;
  rotateAnim: Animated.Value;
  theme: string;
  onRefresh: () => void;
  onAbrirMenuTutorial: () => void;
  handleLogout: () => void;
  handleToggleTheme: () => void;
}

// ============================================
// CONSTANTES Y UTILIDADES
// ============================================

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
  const TOTAL_CROMOS = 28;

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
            {props.ligaNombre ? (
              <View style={s.leagueBadge}>
                <Ionicons name="trophy-outline" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={s.leagueBadgeText}>
                  {props.ligaNombre}{props.posicionEnLiga ? ` • #${props.posicionEnLiga} en liga` : ""}
                </Text>
              </View>
            ) : null}
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
            {props.ligaNombre ? (
              <View style={s.medalBadge}>
                <Text style={s.medalBadgeText}>{props.ligaNombre}</Text>
              </View>
            ) : null}
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
              value: `${props.cromosObtenidos}/${TOTAL_CROMOS}`,
              icon: "images" as const,
              label: "Cromos",
            },
          ].map((stat, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Ionicons name={stat.icon} size={24} color={colors.gold} />
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Mis Ligas */}
        <View style={s.sectionCard}>
          <View style={[s.sectionHeader, { marginBottom: 12 }]}>
            <View style={s.benefitsTitleRow}>
              <Ionicons name="trophy-outline" size={20} color={colors.gold} />
              <Text style={s.sectionTitle}>Mis Ligas</Text>
            </View>
          </View>
          {props.todasLigas.map((liga) => {
            const esCurrent = liga.nombre === props.ligaNombre;
            return (
              <View key={liga.id} style={[s.ligaItem, esCurrent && s.ligaItemActive]}>
                <View style={s.ligaLeft}>
                  <Ionicons
                    name={esCurrent ? "trophy" : "trophy-outline"}
                    size={20}
                    color={esCurrent ? colors.gold : colors.textMuted}
                  />
                  <Text style={[s.ligaNombreText, esCurrent && { color: colors.gold, fontWeight: "800" }]}>
                    {liga.nombre}
                  </Text>
                </View>
                {esCurrent && (
                  <View style={s.ligaCurrentBadge}>
                    <Text style={s.ligaCurrentText}>ACTUAL</Text>
                  </View>
                )}
              </View>
            );
          })}
          <View style={s.ligaInstructions}>
            <Text style={s.ligaInstructionsTitle}>¿Cómo subir de liga?</Text>
            <Text style={s.ligaInstructionsText}>
              🥈 Acumula 5,000 mAiles grupales al final de la temporada para ascender a Plata.
            </Text>
            <Text style={s.ligaInstructionsText}>
              🥇 Acumula 15,000 mAiles grupales al final de la temporada para ascender a Oro.
            </Text>
            <Text style={[s.ligaInstructionsText, { color: colors.textMuted, marginTop: 6 }]}>
              ⚠️ No puedes cambiar de liga hasta que termine la temporada.
            </Text>
          </View>
        </View>

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
          {/* Idioma - sin flecha */}
          <View style={s.settingItem}>
            <View style={s.settingLeft}>
              <View style={s.settingIconWrap}>
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={s.settingLabel}>Idioma</Text>
                <Text style={s.settingSub}>Español</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={s.settingItem} onPress={props.onAbrirMenuTutorial}>
            <View style={s.settingLeft}>
              <View style={s.settingIconWrap}>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={s.settingLabel}>¿Qué hay de nuevo?</Text>
                <Text style={s.settingSub}>Ver tutoriales y guías</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={s.settingItem} onPress={props.handleLogout}>
            <View style={s.settingLeft}>
              <View style={[s.settingIconWrap, { backgroundColor: colors.errorDim }]}>
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
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
      flexDirection: "row",
      alignItems: "center",
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

    ligaItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      marginBottom: 6,
    },
    ligaItemActive: {
      backgroundColor: colors.goldDim,
      borderWidth: 1,
      borderColor: colors.goldBorder,
    },
    ligaLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    ligaNombreText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
    ligaCurrentBadge: {
      backgroundColor: colors.gold,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
    },
    ligaCurrentText: { color: colors.textOnGold, fontSize: 9, fontWeight: "800" },
    ligaInstructions: {
      marginTop: 12,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
      gap: 6,
    },
    ligaInstructionsTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 4,
    },
    ligaInstructionsText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },

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
