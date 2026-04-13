import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FormaResult, PartidoDetalle, PrediccionUsuario } from '../lib/useMundialPartidos';

interface PartidoCardProps {
  partido: PartidoDetalle;
  expanded: boolean;
  onToggleExpand: () => void;
  onPredecir: () => void;
  prediccion: PrediccionUsuario | null;
  enviada: boolean;
  pulseAnim: Animated.Value;
}

function formatFecha(fechaHora: string): string {
  try {
    const d = new Date(fechaHora);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  } catch {
    return fechaHora;
  }
}

function formatHora(fechaHora: string): string {
  try {
    const d = new Date(fechaHora);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function PartidoCard({
  partido,
  expanded,
  onToggleExpand,
  onPredecir,
  prediccion,
  enviada,
  pulseAnim,
}: PartidoCardProps) {
  const { colors } = useTheme();
  const s = getStyles(colors);

  const FORMA_COLOR: Record<FormaResult, string> = {
    G: colors.formaWin,
    E: colors.formaDraw,
    P: colors.formaLoss,
  };

  const local = partido.equipo_local;
  const visitante = partido.equipo_visitante;
  const sl = partido.stats_local;
  const sv = partido.stats_visitante;
  const esCierre = partido.cierre_prediccion !== 'Abierto';
  const fecha = formatFecha(partido.fecha_hora);
  const hora = formatHora(partido.fecha_hora);

  return (
    <View style={s.card}>
      {/* Badge de cierre — solo si hay countdown activo */}
      {esCierre && (
        <Animated.View style={[s.countdownBadge, { opacity: pulseAnim }]}>
          <Text style={s.countdownText}>
            ⏱ Predicción cierra en {partido.cierre_prediccion}
          </Text>
        </Animated.View>
      )}

      {/* Fila de equipos */}
      <View style={s.teamsRow}>
        <View style={s.teamCol}>
          <View style={s.flagCircle}>
            <Image
              source={{ uri: `https://flagcdn.com/w80/${local.codigo_iso}.png` }}
              style={s.flagImg}
              resizeMode="cover"
            />
          </View>
          <Text style={s.teamName}>{local.nombre}</Text>
        </View>

        <View style={s.vsCol}>
          <Text style={s.vsText}>VS</Text>
          <View style={s.vsDivider} />
          <Text style={s.phaseText}>{partido.fase?.nombre ?? 'Grupos'}</Text>
        </View>

        <View style={s.teamCol}>
          <View style={s.flagCircle}>
            <Image
              source={{ uri: `https://flagcdn.com/w80/${visitante.codigo_iso}.png` }}
              style={s.flagImg}
              resizeMode="cover"
            />
          </View>
          <Text style={s.teamName}>{visitante.nombre}</Text>
        </View>
      </View>

      {/* Info del partido */}
      <Text style={s.estadio}>
        {partido.estadio ? `${partido.estadio.nombre}, ${partido.estadio.ciudad}` : ''}
      </Text>
      <Text style={s.fecha}>
        {fecha} · {hora} · {partido.jornada}
      </Text>

      {/* Fila de acciones */}
      <View style={s.actionRow}>
        <TouchableOpacity
          style={[s.predecirBtn, enviada && s.predecirBtnDone]}
          onPress={onPredecir}
          activeOpacity={0.8}
        >
          <Text style={[s.predecirBtnText, enviada && s.predecirBtnTextDone]}>
            {enviada
              ? `✓ ${prediccion!.goles_local}-${prediccion!.goles_visitante}`
              : '⚽ Predecir'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.expandBtn} onPress={onToggleExpand} activeOpacity={0.7}>
          <Text style={s.expandIcon}>{expanded ? '▲' : '▼'}</Text>
          <Text style={s.expandText}>{expanded ? 'Ocultar' : 'Análisis'}</Text>
        </TouchableOpacity>
      </View>

      {/* Sección expandible */}
      {expanded && (
        <View style={s.expandedSection}>
          {/* Forma reciente */}
          {sl && sv && (
            <View style={s.bento}>
              <Text style={s.bentoLabel}>FORMA RECIENTE</Text>
              <View style={s.formaRow}>
                <View style={s.formaDots}>
                  {sl.forma.map((r, i) => (
                    <View key={i} style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]} />
                  ))}
                </View>
                <View style={s.formaDots}>
                  {sv.forma.map((r, i) => (
                    <View key={i} style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]} />
                  ))}
                </View>
              </View>
              <View style={s.rachaRow}>
                <View style={s.rachaBadge}>
                  <Text style={s.rachaBadgeText}>{sl.racha_texto}</Text>
                </View>
                <View style={[s.rachaBadge, s.rachaBadgeMuted]}>
                  <Text style={s.rachaBadgeTextMuted}>{sv.racha_texto}</Text>
                </View>
              </View>
            </View>
          )}

          {/* FIFA Ranking + Goles */}
          <View style={s.bentoRow}>
            <View style={[s.bento, s.bentoHalf]}>
              <Text style={s.bentoLabel}>FIFA RANKING</Text>
              <View style={s.rankRow}>
                <Text style={s.rankBig}>#{local.ranking_fifa}</Text>
                <Text style={s.rankVs}> vs </Text>
                <Text style={s.rankSmall}>#{visitante.ranking_fifa}</Text>
              </View>
            </View>
            {sl && sv && (
              <View style={[s.bento, s.bentoHalf]}>
                <Text style={s.bentoLabel}>GOLES (A:R)</Text>
                <View style={s.rankRow}>
                  <Text style={s.rankBig}>{sl.goles_anotados}:{sl.goles_recibidos}</Text>
                  <Text style={s.rankVs}> vs </Text>
                  <Text style={s.rankSmall}>{sv.goles_anotados}:{sv.goles_recibidos}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Jugadores clave */}
          {sl && sv && sl.jugador_clave_nombre && sv.jugador_clave_nombre && (
            <View style={s.bento}>
              <Text style={s.bentoLabel}>JUGADORES CLAVE 🏆</Text>
              <View style={s.jugadoresRow}>
                <View style={s.jugadorLeft}>
                  <View style={s.jugadorAvatar}>
                    <Image
                      source={{ uri: `https://flagcdn.com/w80/${local.codigo_iso}.png` }}
                      style={s.jugadorFlagImg}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={s.jugadorTexts}>
                    <Text style={s.jugadorNombre}>{sl.jugador_clave_nombre}</Text>
                    <Text style={s.jugadorStats}>{sl.jugador_clave_stats}</Text>
                  </View>
                </View>
                <View style={s.jugadorRight}>
                  <View style={s.jugadorTextsRight}>
                    <Text style={[s.jugadorNombre, { textAlign: 'right', opacity: 0.7 }]}>
                      {sv.jugador_clave_nombre}
                    </Text>
                    <Text style={[s.jugadorStats, { textAlign: 'right' }]}>
                      {sv.jugador_clave_stats}
                    </Text>
                  </View>
                  <View style={[s.jugadorAvatar, { borderColor: colors.borderStrong }]}>
                    <Image
                      source={{ uri: `https://flagcdn.com/w80/${visitante.codigo_iso}.png` }}
                      style={s.jugadorFlagImg}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* H2H */}
          {partido.h2h && (
            <View style={s.bento}>
              <Text style={s.bentoLabel}>CARA A CARA (H2H)</Text>
              <View style={s.h2hBar}>
                <View
                  style={[s.h2hSegment, { flex: partido.h2h.ganados_a, backgroundColor: colors.primary }]}
                />
                <View
                  style={[s.h2hSegment, { flex: partido.h2h.empates, backgroundColor: colors.textMuted }]}
                />
                <View
                  style={[s.h2hSegment, { flex: partido.h2h.ganados_b, backgroundColor: colors.borderMedium }]}
                />
              </View>
              <View style={s.h2hLabels}>
                <Text style={s.h2hLabel}>{partido.h2h.ganados_a} Ganados</Text>
                <Text style={[s.h2hLabel, { color: colors.textSecondary }]}>
                  {partido.h2h.empates} Empates
                </Text>
                <Text style={[s.h2hLabel, { color: colors.textMuted }]}>
                  {partido.h2h.ganados_b} Perdidos
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function getStyles(colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
      elevation: 4,
    },

    countdownBadge: {
      alignSelf: 'flex-end',
      backgroundColor: colors.errorDim,
      borderWidth: 1,
      borderColor: colors.error,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 12,
    },
    countdownText: { color: colors.error, fontSize: 10, fontWeight: '700' },

    teamsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    teamCol: { alignItems: 'center', gap: 6, flex: 1 },
    flagCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderMedium,
    },
    flagImg: { width: 50, height: 50, borderRadius: 25 },
    teamName: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
    },
    vsCol: { alignItems: 'center', gap: 3 },
    vsText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
    vsDivider: { width: 20, height: 1, backgroundColor: colors.borderStrong },
    phaseText: { color: colors.textMuted, fontSize: 8, fontWeight: '600', textAlign: 'center' },

    estadio: {
      color: colors.textPrimary,
      fontSize: 10,
      fontWeight: '600',
      fontStyle: 'italic',
      textAlign: 'center',
    },
    fecha: {
      color: colors.textSecondary,
      fontSize: 10,
      textAlign: 'center',
      marginTop: 2,
      marginBottom: 12,
    },

    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    predecirBtn: {
      flex: 1,
      backgroundColor: colors.gold,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      elevation: 4,
    },
    predecirBtnDone: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.primary,
      elevation: 0,
    },
    predecirBtnText: {
      color: colors.textOnGold,
      fontWeight: '800',
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    predecirBtnTextDone: { color: colors.primary },
    expandBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    expandIcon: { color: colors.primary, fontSize: 10, fontWeight: '700' },
    expandText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },

    expandedSection: { marginTop: 14, gap: 0 },

    // Bento cards
    bento: {
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    bentoRow: { flexDirection: 'row', gap: 8 },
    bentoHalf: { flex: 1, marginBottom: 8 },
    bentoLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 8,
    },

    // Forma
    formaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    formaDots: { flexDirection: 'row', gap: 5 },
    dot: { width: 11, height: 11, borderRadius: 5.5 },
    rachaRow: { flexDirection: 'row', justifyContent: 'space-between' },
    rachaBadge: {
      backgroundColor: colors.primaryDim,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    rachaBadgeMuted: { backgroundColor: colors.backgroundSecondary },
    rachaBadgeText: { color: colors.primary, fontSize: 9, fontWeight: '700' },
    rachaBadgeTextMuted: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },

    // Ranking
    rankRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
    rankBig: { color: colors.gold, fontSize: 22, fontWeight: '800' },
    rankVs: { color: colors.primary, fontSize: 11, fontWeight: '800' },
    rankSmall: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },

    // Jugadores
    jugadoresRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    jugadorLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    jugadorRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      justifyContent: 'flex-end',
    },
    jugadorTexts: { flex: 1 },
    jugadorTextsRight: { flex: 1 },
    jugadorAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: colors.primaryBorder,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    jugadorFlagImg: { width: 32, height: 32, borderRadius: 16 },
    jugadorNombre: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
    jugadorStats: { color: colors.textMuted, fontSize: 10, marginTop: 1 },

    // H2H
    h2hBar: {
      flexDirection: 'row',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    h2hSegment: { height: '100%' },
    h2hLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    h2hLabel: { color: colors.textPrimary, fontSize: 10, fontWeight: '800' },
  });
}
