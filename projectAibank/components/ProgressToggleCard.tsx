import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ProgressData {
  // Personal progress
  medalla: number;
  medallaNombre: string;
  estrellas: number;         // 0–5
  comprasParaStar: number;   // remaining to next star
  comprasUmbral: number;     // purchases per star
  comprasActuales: number;   // purchases in current star cycle
  // Weekly spend
  gastoSemanal: number;
  mailesEstaSemana: number;
  comprasEstaSemana: number;
  // Group
  ligaNombre: string;
  posicionEnLiga: number | null;
  grupoNombre: string | null;
  grupoMailesTotal: number;
  grupoMailesMeta: number;
  grupoMiembrosCount: number;
}

interface ProgressToggleCardProps {
  mailes: number;
  colors: any;
  progressData: ProgressData;
}

const AUTO_FLIP_INTERVAL = 8000;
const TOTAL_CARDS = 3;

export default function ProgressToggleCard({
  mailes,
  colors,
  progressData,
}: ProgressToggleCardProps) {
  const {
    medalla,
    medallaNombre,
    estrellas,
    comprasParaStar,
    comprasUmbral,
    comprasActuales,
    gastoSemanal,
    mailesEstaSemana,
    comprasEstaSemana,
    grupoNombre,
    grupoMailesTotal,
    grupoMailesMeta,
    grupoMiembrosCount,
  } = progressData;

  // displayCard is what's currently shown; displayCardRef is the same but synchronous
  const [displayCard, setDisplayCard] = useState(0);
  const displayCardRef = useRef(0);
  const [timerProgress, setTimerProgress] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const countdownAnim = useRef(new Animated.Value(0)).current;
  const isAnimatingRef = useRef(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const isDark = colors.primary === "#b2c5ff";
  const mint = isDark ? "#00C9A7" : "#009E7F";
  const mintDim = isDark ? "rgba(0,201,167,0.12)" : "rgba(0,158,127,0.1)";
  const mintBorder = isDark ? "rgba(0,201,167,0.3)" : "rgba(0,158,127,0.22)";

  useEffect(() => {
    mountedRef.current = true;
    startAutoTimer();
    return () => {
      mountedRef.current = false;
      stopTimer();
    };
  }, []);

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    countdownAnim.stopAnimation();
  }

  function startAutoTimer() {
    stopTimer();
    setTimerProgress(0);
    countdownAnim.setValue(0);
    Animated.timing(countdownAnim, {
      toValue: 1,
      duration: AUTO_FLIP_INTERVAL,
      useNativeDriver: false,
    }).start();

    let elapsed = 0;
    timerIntervalRef.current = setInterval(() => {
      elapsed += 100;
      const progress = Math.min(elapsed / AUTO_FLIP_INTERVAL, 1);
      if (mountedRef.current) setTimerProgress(progress);
      if (elapsed >= AUTO_FLIP_INTERVAL) {
        stopTimer();
        animateTo((displayCardRef.current + 1) % TOTAL_CARDS);
      }
    }, 100);
  }

  function animateTo(next: number) {
    if (!mountedRef.current) return;
    if (isAnimatingRef.current) return;
    if (next === displayCardRef.current) return;

    isAnimatingRef.current = true;

    // Step 1: fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      if (!mountedRef.current) return;
      // Step 2: swap card content while invisible
      displayCardRef.current = next;
      setDisplayCard(next);
      // Step 3: wait two frames so React re-renders with new content, then fade in
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            if (!mountedRef.current) return;
            isAnimatingRef.current = false;
            startAutoTimer();
          });
        })
      );
    });
  }

  const handleToggle = (targetIndex?: number) => {
    const next =
      targetIndex !== undefined
        ? targetIndex
        : (displayCardRef.current + 1) % TOTAL_CARDS;
    animateTo(next);
  };

  const starsText = Array.from({ length: 5 }, (_, i) =>
    i < estrellas ? "★" : "☆"
  ).join("");

  const pctPersonal =
    comprasUmbral > 0
      ? Math.min(Math.round((comprasActuales / comprasUmbral) * 100), 100)
      : 0;
  const pctWeekly =
    comprasUmbral > 0
      ? Math.min(Math.round((comprasEstaSemana / comprasUmbral) * 100), 100)
      : 0;
  const pctGroup =
    grupoMailesMeta > 0
      ? Math.min(Math.round((grupoMailesTotal / grupoMailesMeta) * 100), 100)
      : 0;

  const countdownBarWidth = countdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["100%", "0%"],
  });

  const accentColors = [colors.gold, colors.primary, mint];
  const accentColor = accentColors[displayCard];
  const segundos = Math.max(
    0,
    Math.ceil((1 - timerProgress) * (AUTO_FLIP_INTERVAL / 1000))
  );

  const getCardBgStyle = (card: number) => {
    if (card === 0) return s.cardGold;
    if (card === 1) return s.cardBlue;
    return s.cardMint;
  };

  const s = getStyles(colors, mint, mintDim, mintBorder, isDark);

  return (
    <View style={s.wrapper}>
      {/* Depth shadow card */}
      <View style={s.depthShadow}>
        <View style={s.depthShadowInner} />
      </View>

      <TouchableOpacity
        style={s.container}
        onPress={() => handleToggle()}
        activeOpacity={0.95}
      >
        {/* Single animated card — content swaps while opacity is 0 */}
        <Animated.View
          style={[s.card, getCardBgStyle(displayCard), { opacity: fadeAnim }]}
        >
          <View style={s.shine} />

          {/* ── Card 0: Tu Progreso ── */}
          {displayCard === 0 && (
            <>
              <View style={s.cardRow}>
                <View style={s.rowLeft}>
                  <View style={[s.iconBox, s.iconBoxGold]}>
                    <Text style={s.iconEmoji}>⭐</Text>
                  </View>
                  <View style={s.rowTexts}>
                    <Text style={s.label}>TU PROGRESO</Text>
                    <Text style={s.value}>{mailes.toLocaleString()} mAiles</Text>
                  </View>
                </View>
                <View style={[s.pill, s.pillGold]}>
                  <Text style={s.pillTextGold}>
                    🥇 {medallaNombre || `Medalla ${medalla}`}
                  </Text>
                </View>
              </View>

              <View style={s.subRow}>
                <Text style={[s.starsLabel, { color: colors.gold }]}>
                  {starsText}
                </Text>
                <Text style={s.subText}>
                  {comprasParaStar > 0
                    ? `${comprasParaStar} compras para ★`
                    : "¡Lista para subir!"}
                </Text>
              </View>

              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFill,
                    { width: `${pctPersonal}%`, backgroundColor: colors.gold },
                  ]}
                >
                  <View style={s.barShine} />
                </View>
              </View>
            </>
          )}

          {/* ── Card 1: Gasto Semanal ── */}
          {displayCard === 1 && (
            <>
              <View style={s.cardRow}>
                <View style={s.rowLeft}>
                  <View style={[s.iconBox, s.iconBoxBlue]}>
                    <Text style={s.iconEmoji}>📊</Text>
                  </View>
                  <View style={s.rowTexts}>
                    <Text style={s.label}>GASTO SEMANAL</Text>
                    <Text style={s.value}>
                      $
                      {gastoSemanal.toLocaleString("es", {
                        minimumFractionDigits: 0,
                      })}
                      <Text style={s.valueSub}> USD</Text>
                    </Text>
                  </View>
                </View>
                <View style={[s.pill, s.pillBlue]}>
                  <Text style={s.pillTextBlue}>
                    ⭐ +{mailesEstaSemana.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={s.subRow}>
                <Text style={s.subText}>
                  {comprasEstaSemana}{" "}
                  {comprasEstaSemana === 1 ? "compra" : "compras"} esta semana
                </Text>
                {comprasUmbral > 0 && (
                  <Text style={[s.subText, { color: colors.primary }]}>
                    {comprasEstaSemana}/{comprasUmbral} para ★
                  </Text>
                )}
              </View>

              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFill,
                    {
                      width: `${pctWeekly}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <View style={s.barShine} />
                </View>
              </View>
            </>
          )}

          {/* ── Card 2: Mi Grupo ── */}
          {displayCard === 2 &&
            (grupoNombre ? (
              <>
                <View style={s.cardRow}>
                  <View style={s.rowLeft}>
                    <View style={[s.iconBox, s.iconBoxMint]}>
                      <Text style={s.iconEmoji}>👥</Text>
                    </View>
                    <View style={s.rowTexts}>
                      <Text style={s.label}>MI GRUPO</Text>
                      <Text
                        style={[s.value, { color: mint, fontSize: 14 }]}
                        numberOfLines={1}
                      >
                        {grupoNombre}
                      </Text>
                    </View>
                  </View>
                  <View style={[s.pill, s.pillMint]}>
                    <Text style={s.pillTextMint}>
                      {grupoMiembrosCount} miembros
                    </Text>
                  </View>
                </View>

                <View style={s.subRow}>
                  <Text style={s.subText}>
                    {grupoMailesTotal.toLocaleString()} mAiles grupales
                  </Text>
                  {grupoMailesMeta > 0 && (
                    <Text style={[s.subText, { color: mint }]}>
                      {pctGroup}% del objetivo
                    </Text>
                  )}
                </View>

                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      { width: `${pctGroup}%`, backgroundColor: mint },
                    ]}
                  >
                    <View style={s.barShine} />
                  </View>
                </View>
              </>
            ) : (
              <View style={s.noGroupWrap}>
                <Text style={[s.iconEmoji, { fontSize: 28 }]}>👥</Text>
                <Text style={s.noGroupText}>
                  Únete a un grupo para ver tu progreso grupal
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/(tabs)/grupo")}
                  style={[s.pill, s.pillMint, { marginTop: 10 }]}
                >
                  <Text style={s.pillTextMint}>Ir a Grupos →</Text>
                </TouchableOpacity>
              </View>
            ))}
        </Animated.View>
      </TouchableOpacity>

      {/* ── Indicator ── */}
      <View style={s.indicator}>
        <View style={s.dotsRow}>
          {[0, 1, 2].map((i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleToggle(i)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                style={[
                  s.dot,
                  displayCard === i && {
                    backgroundColor: accentColors[i],
                    width: 18,
                    borderRadius: 3,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.countdownTrack}>
          <Animated.View
            style={[
              s.countdownFill,
              { width: countdownBarWidth, backgroundColor: accentColor },
            ]}
          />
        </View>

        <Text style={s.timerText}>
          Cambia en {segundos}s · Toca para cambiar
        </Text>
      </View>
    </View>
  );
}

function getStyles(
  colors: any,
  mint: string,
  mintDim: string,
  mintBorder: string,
  isDark: boolean
) {
  return StyleSheet.create({
    wrapper: {
      marginBottom: 14,
    },
    depthShadow: {
      position: "absolute",
      top: 8,
      left: 5,
      right: 5,
      height: 165,
      zIndex: 0,
    },
    depthShadowInner: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      height: "100%",
      opacity: 0.5,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 1,
    },
    container: {
      position: "relative",
      height: 165,
      zIndex: 2,
    },
    card: {
      borderRadius: 20,
      padding: 15,
      borderWidth: 0.5,
      overflow: "hidden",
      height: 165,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
      elevation: 5,
    },
    cardGold: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.goldBorder,
      shadowColor: colors.shadowColorGold,
    },
    cardBlue: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.primaryBorderStrong,
      shadowColor: colors.shadowColorBlue,
    },
    cardMint: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: mintBorder,
      shadowColor: mint,
    },
    shine: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(255,255,255,0.95)",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      marginRight: 8,
    },
    rowTexts: { flex: 1 },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 11,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    iconBoxGold: {
      backgroundColor: colors.goldDim,
      borderColor: colors.goldBorder,
    },
    iconBoxBlue: {
      backgroundColor: colors.primaryDim,
      borderColor: colors.primaryBorder,
    },
    iconBoxMint: {
      backgroundColor: mintDim,
      borderColor: mintBorder,
    },
    iconEmoji: { fontSize: 18 },
    label: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    value: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: "800",
      marginTop: 1,
    },
    valueSub: {
      fontSize: 11,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    pill: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    pillGold: {
      backgroundColor: colors.goldDim,
      borderColor: colors.goldBorder,
    },
    pillBlue: {
      backgroundColor: colors.primaryDim,
      borderColor: colors.primaryBorder,
    },
    pillMint: {
      backgroundColor: mintDim,
      borderColor: mintBorder,
    },
    pillTextGold: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.gold,
    },
    pillTextBlue: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.primary,
    },
    pillTextMint: {
      fontSize: 10,
      fontWeight: "700",
      color: mint,
    },
    subRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    starsLabel: {
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 2,
      marginRight: 8,
    },
    subText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    barTrack: {
      height: 7,
      backgroundColor: colors.borderMedium,
      borderRadius: 4,
      overflow: "hidden",
    },
    barFill: {
      height: "100%",
      borderRadius: 4,
      overflow: "hidden",
    },
    barShine: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: "rgba(255,255,255,0.3)",
      borderRadius: 2,
    },
    noGroupWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 4,
    },
    noGroupText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 8,
      lineHeight: 18,
      paddingHorizontal: 12,
    },
    indicator: {
      marginTop: 10,
      alignItems: "center",
      paddingHorizontal: 2,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 6,
      marginBottom: 8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.borderStrong,
    },
    countdownTrack: {
      height: 3,
      backgroundColor: colors.borderMedium,
      borderRadius: 2,
      overflow: "hidden",
      width: "100%",
      marginBottom: 6,
    },
    countdownFill: {
      height: "100%",
      borderRadius: 2,
    },
    timerText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "500",
    },
  });
}
