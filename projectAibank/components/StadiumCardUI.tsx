import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StadiumCardUIProps {
  userRanking: number;
  liga: string;
  colors: any;
  onPress?: () => void;
}

export default function StadiumCardUI({
  userRanking,
  liga,
  colors,
  onPress,
}: StadiumCardUIProps) {
  const s = getStyles(colors);

  return (
    <TouchableOpacity
      style={s.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOBhwxMsnTXtZTqXYoR_D2ujpez4idxpYUWuhnq7ZWFT6f1cLU5Ere55nKPN7RxXgYAZi0B9DmANlzfIQUQy328FSJT-WOyPYXEXOVQL1fZP1GdDn1yHSpng6VI_qe4c1IngO3bAmz-xs1VulTj_z71nYr1ZlxysFlntnPdz2tyTTBCPHRggOcU3VpU3oi_OoIjI7XMR0i3hbTKybX6X4_rtY8mtTc6WQBqioDkPfJzgl709sLCXscl2em76MoEqthJIIk-l1t8lNy",
        }}
        style={s.stadium}
        imageStyle={s.stadiumImage}
      >
        {/* Overlay oscuro semitransparente (reemplazo del gradient CSS) */}
        <View style={s.overlayBottom} />
        <View style={s.overlayTop} />

        {/* Contenido */}
        <View style={s.contentWrapper}>
          <View style={s.contentBackground} />
          <View style={s.content}>
            <View style={s.titleRow}>
              <View style={s.titleLeft}>
                <View style={s.iconBadge}>
                  <Ionicons name="football" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={s.titleMain}>Temporada Mundial 2026</Text>
                  <Text style={s.titleSub}>
                    ¡Sigue sumando para subir de nivel!
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Badge de ranking */}
        {userRanking > 0 && (
          <View style={s.rankingBadge}>
            <Text style={s.rankingText}>
              #{userRanking} en {liga}
            </Text>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 6,
      shadowColor: colors.goldShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
    },
    stadium: {
      aspectRatio: 16 / 7,
      justifyContent: "flex-end",
      padding: 16,
    },
    stadiumImage: {
      resizeMode: "cover",
      opacity: 0.85,
    },
    // Dos capas para simular gradiente de abajo hacia arriba
    overlayBottom: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      opacity: 0.35,
    },
    overlayTop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent",
      // Capa superior más transparente para efecto degradado visual
      top: "60%",
      opacity: 0,
    },
    content: {
      zIndex: 10,
      position: "relative",
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    contentWrapper: {
      zIndex: 10,
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 110,
    },
    contentBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      opacity: 0.5,
      borderRadius: 12,
      zIndex: -1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    titleLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primaryDim,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      justifyContent: "center",
      alignItems: "center",
    },
    titleMain: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 4,
      textShadowColor: "rgba(0, 0, 0, 0.4)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    titleSub: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    rankingBadge: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 20,
      backgroundColor: colors.background,
      opacity: 0.65,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    rankingText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
    },
  });
}
