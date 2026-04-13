import { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatCountdown, puedePredicir } from '../lib/getSemanaActual';
import { PartidoDetalle, PrediccionUsuario } from '../lib/useMundialPartidos';

interface PartidoCardProps {
  partido: PartidoDetalle;
  semanaActual: number;
  onVerDetalle: () => void;
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
  semanaActual,
  onVerDetalle,
  prediccion,
  enviada,
  pulseAnim,
}: PartidoCardProps) {
  const { colors } = useTheme();
  const s = getStyles(colors);

  const [countdown, setCountdown] = useState(formatCountdown(partido.fecha_hora));
  const canPredict = puedePredicir(partido.fecha_hora, partido.semana, semanaActual);

  // Actualizar cronómetro cada segundo cuando el partido está próximo (< 7 días)
  useEffect(() => {
    const diff = new Date(partido.fecha_hora).getTime() - Date.now();
    if (diff <= 0 || diff > 7 * 24 * 60 * 60 * 1000) return; // Solo si faltan < 7 días

    const interval = setInterval(() => {
      setCountdown(formatCountdown(partido.fecha_hora));
    }, 1000);

    return () => clearInterval(interval);
  }, [partido.fecha_hora]);

  const local = partido.equipo_local;
  const visitante = partido.equipo_visitante;
  const fecha = formatFecha(partido.fecha_hora);
  const hora = formatHora(partido.fecha_hora);

  // Badge de bloqueo por semana (partido de otra semana)
  const esSemanaDistinta = partido.semana !== semanaActual;

  return (
    <TouchableOpacity style={s.card} onPress={onVerDetalle} activeOpacity={0.85}>
      {/* Cronómetro — siempre visible si el partido no ha empezado */}
      {new Date(partido.fecha_hora).getTime() > Date.now() && (
        <Animated.View
          style={[
            s.countdownBadge,
            countdown.critico && s.countdownBadgeCritico,
            { opacity: countdown.critico ? pulseAnim : 1 },
          ]}
        >
          <Text
            style={[s.countdownText, countdown.critico && s.countdownTextCritico]}
          >
            ⏱ {countdown.texto}
          </Text>
        </Animated.View>
      )}

      {/* Badge de "solo ver" cuando es otra semana */}
      {esSemanaDistinta && (
        <View style={s.soloVerBadge}>
          <Text style={s.soloVerText}>👁 Solo visualización</Text>
        </View>
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
          <Text style={s.teamAlias}>{local.codigo_fifa}</Text>
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
          <Text style={s.teamAlias}>{visitante.codigo_fifa}</Text>
        </View>
      </View>

      {/* Info del partido */}
      <Text style={s.estadio}>
        {partido.estadio ? `${partido.estadio.nombre}, ${partido.estadio.ciudad}` : ''}
      </Text>
      <Text style={s.fecha}>
        {fecha} · {hora} · {partido.jornada}
      </Text>

      {/* Botón de acción */}
      <View style={s.actionRow}>
        {enviada ? (
          <View style={[s.actionBtn, s.actionBtnDone]}>
            <Text style={s.actionBtnTextDone}>
              ✓ Predicción: {prediccion!.goles_local} - {prediccion!.goles_visitante}
            </Text>
          </View>
        ) : canPredict ? (
          <View style={[s.actionBtn, s.actionBtnPredict]}>
            <Text style={s.actionBtnText}>⚽ Predecir resultado</Text>
          </View>
        ) : esSemanaDistinta ? (
          <View style={[s.actionBtn, s.actionBtnView]}>
            <Text style={s.actionBtnTextView}>👁 Ver detalles del partido</Text>
          </View>
        ) : (
          <View style={[s.actionBtn, s.actionBtnLocked]}>
            <Text style={s.actionBtnTextLocked}>🔒 Predicción cerrada (menos de 24h)</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
      backgroundColor: colors.primaryDim,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 12,
    },
    countdownBadgeCritico: {
      backgroundColor: colors.errorDim,
      borderColor: colors.error,
    },
    countdownText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
    countdownTextCritico: { color: colors.error },

    soloVerBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderMedium,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      marginBottom: 10,
    },
    soloVerText: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },

    teamsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    teamCol: { alignItems: 'center', gap: 4, flex: 1 },
    flagCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderMedium,
    },
    flagImg: { width: 54, height: 54, borderRadius: 27 },
    teamName: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
    },
    teamAlias: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
      textAlign: 'center',
    },

    vsCol: { alignItems: 'center', gap: 3 },
    vsText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
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

    actionRow: { flexDirection: 'row' },
    actionBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 11,
      alignItems: 'center',
    },
    actionBtnPredict: {
      backgroundColor: colors.gold,
      elevation: 4,
    },
    actionBtnDone: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    actionBtnView: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderMedium,
    },
    actionBtnLocked: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.borderMedium,
      opacity: 0.7,
    },
    actionBtnText: {
      color: colors.textOnGold,
      fontWeight: '800',
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    actionBtnTextDone: { color: colors.primary, fontWeight: '700', fontSize: 13 },
    actionBtnTextView: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
    actionBtnTextLocked: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
  });
}
