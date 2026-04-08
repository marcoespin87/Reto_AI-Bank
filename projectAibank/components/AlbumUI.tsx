import { router } from "expo-router";
import React from "react";
import {
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import BottomNav from "./BottomNav";

export default function AlbumUI({
  colors,
  todosStickers,
  misStickers,
  filtro,
  setFiltro,
  stickerSeleccionado,
  setStickerSeleccionado,
  refreshing,
  onRefresh,
  albumCompleto,
  getCantidad,
  DOLARES_POR_CROMO,
  TOTAL_ALBUM,
}: any) {
  const RAREZA_CONFIG = {
    epico: {
      color: colors.rarityEpicText,
      border: colors.rarityEpicBorder,
      label: "ÉPICO",
      bg: colors.rarityEpicBg,
    },
    raro: {
      color: colors.rarityRareText,
      border: colors.rarityRareBorder,
      label: "RARO",
      bg: colors.rarityRareBg,
    },
    comun: {
      color: colors.rarityCommonText,
      border: colors.rarityCommonBorder,
      label: "COMÚN",
      bg: colors.rarityCommonBg,
    },
  };

  const stickersFiltrados =
    filtro === "todos"
      ? todosStickers
      : todosStickers.filter((s: any) => s.rareza === filtro);

  const totalUnicos = new Set(misStickers.map((s: any) => s.sticker_id)).size;
  const progresoPct = (totalUnicos / TOTAL_ALBUM) * 100;

  const s = getStyles(colors);

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
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={s.leagueBadge}>
            <Text style={s.leagueBadgeText}>Liga Plata • Medalla 3</Text>
          </View>
        </View>

        {/* Album completo banner */}
        {albumCompleto && (
          <View style={s.goldenBanner}>
            <Text style={s.goldenIcon}>🎫</Text>
            <View style={s.goldenInfo}>
              <Text style={s.goldenTitle}>¡Álbum completo!</Text>
              <Text style={s.goldenSub}>
                Tienes un boleto dorado al sorteo VIP Mundial 2026 ✈️🏨🍽️
              </Text>
            </View>
          </View>
        )}

        {/* Progreso */}
        <View style={s.progresoSection}>
          <View style={s.progresoHeader}>
            <Text style={s.progresoNum}>{totalUnicos}</Text>
            <Text style={s.progresoTotal}>/ {TOTAL_ALBUM} cromos</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progresoPct}%` }]} />
          </View>
          <Text style={s.progresoSub}>
            {totalUnicos === TOTAL_ALBUM
              ? "🏆 ¡Álbum completo! Eres un crack"
              : `¡Estás a ${TOTAL_ALBUM - totalUnicos} cromos de completar tu colección!`}
          </Text>
          <View style={s.infoBox}>
            <Text style={s.infoText}>
              ⭐ Ganas 1 cromo por cada ${DOLARES_POR_CROMO} gastados
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filtrosRow}
        >
          {(["todos", "epico", "raro", "comun"] as const).map((f) => {
            const isActive = filtro === f;
            const rConfig = f !== "todos" ? RAREZA_CONFIG[f] : null;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  s.filtroBtn,
                  isActive && {
                    backgroundColor: rConfig?.border || colors.primary,
                    borderColor: rConfig?.border || colors.primary,
                  },
                ]}
                onPress={() => setFiltro(f)}
              >
                <Text
                  style={[s.filtroBtnText, isActive && s.filtroBtnTextActive]}
                >
                  {f === "todos"
                    ? "Todos"
                    : f === "epico"
                      ? "✨ Épico"
                      : f === "raro"
                        ? "💎 Raro"
                        : "🃏 Común"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Grid de stickers */}
        <View style={s.grid}>
          {stickersFiltrados.map((sticker: any) => {
            const cantidad = getCantidad(sticker.id);
            const lo_tengo = cantidad > 0;
            const rareza =
              RAREZA_CONFIG[sticker.rareza as keyof typeof RAREZA_CONFIG] ||
              RAREZA_CONFIG.comun;

            return (
              <TouchableOpacity
                key={sticker.id}
                style={[
                  s.stickerCard,
                  {
                    borderColor: lo_tengo ? rareza.border : colors.borderMedium,
                  },
                  !lo_tengo && s.stickerCardLocked,
                ]}
                onPress={() => lo_tengo && setStickerSeleccionado(sticker)}
                activeOpacity={lo_tengo ? 0.8 : 1}
              >
                {lo_tengo ? (
                  <View key={`sticker-content-${sticker.id}`}>
                    <Image
                      source={{ uri: sticker.imagen_url }}
                      style={s.stickerImage}
                      resizeMode="cover"
                    />
                    <View
                      style={[
                        s.rarezaBadge,
                        {
                          backgroundColor: rareza.bg,
                          borderColor: rareza.border,
                          borderWidth: 0.5,
                        },
                      ]}
                    >
                      <Text
                        style={[s.rarezaBadgeText, { color: rareza.color }]}
                      >
                        {rareza.label}
                      </Text>
                    </View>
                    {cantidad > 1 && (
                      <View style={s.cantidadBadge}>
                        <Text style={s.cantidadText}>x{cantidad}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={s.stickerLocked}>
                    <Text style={s.stickerLockedText}>?</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal detalle sticker */}
      <Modal
        visible={stickerSeleccionado !== null}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setStickerSeleccionado(null)}
        >
          {stickerSeleccionado &&
            (() => {
              const rareza =
                RAREZA_CONFIG[
                  stickerSeleccionado.rareza as keyof typeof RAREZA_CONFIG
                ] || RAREZA_CONFIG.comun;
              const cantidad = getCantidad(stickerSeleccionado.id);
              return (
                <View style={[s.modalCard, { borderColor: rareza.border }]}>
                  <Image
                    source={{ uri: stickerSeleccionado.imagen_url }}
                    style={s.modalImage}
                    resizeMode="cover"
                  />
                  <View style={s.modalInfo}>
                    <Text style={[s.modalRareza, { color: rareza.color }]}>
                      {rareza.label}
                    </Text>
                    <Text style={s.modalNombre}>
                      {stickerSeleccionado.nombre}
                    </Text>
                    {cantidad > 1 && (
                      <Text style={s.modalCantidad}>
                        Tienes {cantidad} copias de este cromo
                      </Text>
                    )}
                    <Text style={s.modalTap}>Toca fuera para cerrar</Text>
                  </View>
                </View>
              );
            })()}
        </TouchableOpacity>
      </Modal>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 16 },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
    },
    backBtn: {},
    backText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
    leagueBadge: {
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    leagueBadgeText: { color: colors.primary, fontSize: 10, fontWeight: "700" },

    goldenBanner: {
      backgroundColor: colors.goldDim,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.goldBorder,
    },
    goldenIcon: { fontSize: 36 },
    goldenInfo: { flex: 1 },
    goldenTitle: { color: colors.gold, fontSize: 16, fontWeight: "800" },
    goldenSub: { color: colors.textPrimary, fontSize: 12, marginTop: 2 },

    progresoSection: { marginBottom: 16 },
    progresoHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 6,
      marginBottom: 8,
    },
    progresoNum: {
      color: colors.gold,
      fontSize: 40,
      fontWeight: "800",
      letterSpacing: -1,
      textShadowColor: colors.goldShadow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    progresoTotal: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "500",
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.borderMedium,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progresoSub: { color: colors.textSecondary, fontSize: 12, marginBottom: 8 },
    infoBox: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 10,
      padding: 10,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    infoText: { color: colors.primary, fontSize: 11, fontWeight: "600" },

    filtrosRow: { marginBottom: 16 },
    filtroBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      marginRight: 8,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    filtroBtnText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    filtroBtnTextActive: { color: "#fff", fontWeight: "800" },

    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    stickerCard: {
      width: "30%",
      aspectRatio: 3 / 4,
      borderRadius: 12,
      borderWidth: 1.5,
      overflow: "hidden",
      position: "relative",
      backgroundColor: colors.backgroundSecondary,
    },
    stickerCardLocked: { opacity: 0.35 },
    stickerImage: { width: "100%", height: "100%" },
    rarezaBadge: {
      position: "absolute",
      bottom: 4,
      left: 4,
      right: 4,
      paddingVertical: 3,
      borderRadius: 6,
      alignItems: "center",
    },
    rarezaBadgeText: { fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
    cantidadBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: colors.gold,
      borderRadius: 10,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    cantidadText: { color: colors.textOnGold, fontSize: 9, fontWeight: "800" },
    stickerLocked: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
    },
    stickerLockedText: {
      color: colors.textMuted,
      fontSize: 32,
      fontWeight: "800",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.cardBackgroundAlt,
      borderRadius: 24,
      overflow: "hidden",
      borderWidth: 2,
      width: "80%",
    },
    modalImage: { width: "100%", aspectRatio: 3 / 4 },
    modalInfo: { padding: 16, alignItems: "center" },
    modalRareza: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 2,
      marginBottom: 4,
    },
    modalNombre: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 4,
    },
    modalCantidad: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 4,
    },
    modalTap: { color: colors.textMuted, fontSize: 10, marginTop: 8 },
  });
}
