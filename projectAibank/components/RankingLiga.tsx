import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

interface RankingGrupo {
  id: number;
  nombre: string;
  total_mailes: number;
  num_miembros: number;
  posicion: number;
  es_mi_grupo: boolean;
}

interface Props {
  grupoActualId: number | null;
  ligaId: number;
}

export default function RankingLiga({ grupoActualId, ligaId }: Props) {
  const { colors } = useTheme();
  const [ranking, setRanking] = useState<RankingGrupo[]>([]);
  const [miPosicion, setMiPosicion] = useState<RankingGrupo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRanking(); }, [grupoActualId, ligaId]);

  async function loadRanking() {
    setLoading(true);
    try {
      const { data: grupos } = await supabase
        .from('groups')
        .select(`
          id, nombre,
          group_members!inner(
            estado,
            users(mailes_acumulados)
          )
        `)
        .eq('liga_id', ligaId);

      if (!grupos) { setLoading(false); return; }

      const procesados = grupos
        .map((g: any) => {
          const activos = g.group_members?.filter((m: any) => m.estado === 'activo') || [];
          const total = activos.reduce((sum: number, m: any) =>
            sum + (m.users?.mailes_acumulados || 0), 0);
          return {
            id: g.id,
            nombre: g.nombre,
            total_mailes: total,
            num_miembros: activos.length,
            posicion: 0,
            es_mi_grupo: g.id === grupoActualId,
          };
        })
        .sort((a: any, b: any) => b.total_mailes - a.total_mailes)
        .map((g: any, i: number) => ({ ...g, posicion: i + 1 }));

      setRanking(procesados.slice(0, 10));

      const miGrupo = procesados.find((g: any) => g.es_mi_grupo);
      setMiPosicion(miGrupo && miGrupo.posicion > 10 ? miGrupo : null);
    } catch (e) {
      console.error('RankingLiga error:', e);
    }
    setLoading(false);
  }

  const s = getStyles(colors);
  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  const PODIO_CONFIG = [
    { index: 1, color: colors.rankSilver, emoji: '🥈', alturaBase: 36 },
    { index: 0, color: colors.rankGold,   emoji: '🥇', alturaBase: 52 },
    { index: 2, color: colors.rankBronze, emoji: '🥉', alturaBase: 24 },
  ];

  if (loading) {
    return (
      <View style={s.container}>
        <View style={s.headerRow}>
          <Text style={s.titulo}>🏆 Ranking de Liga</Text>
        </View>
        <ActivityIndicator color={colors.primary} style={{ paddingVertical: 24 }} />
      </View>
    );
  }

  if (ranking.length === 0) {
    return (
      <View style={s.container}>
        <View style={s.headerRow}>
          <Text style={s.titulo}>🏆 Ranking de Liga</Text>
          <TouchableOpacity onPress={loadRanking} style={s.refreshBtn}>
            <Text style={s.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
        <View style={s.emptyBox}>
          <Text style={s.emptyIconText}>📊</Text>
          <Text style={s.emptyTitle}>Sin grupos en la liga aún</Text>
          <Text style={s.emptySubtitle}>¡Sé el primero en aparecer aquí!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <Text style={s.titulo}>🏆 Ranking de Liga</Text>
        <TouchableOpacity onPress={loadRanking} style={s.refreshBtn}>
          <Text style={s.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Podio Top 3 */}
      <View style={s.podioWrapper}>
        {PODIO_CONFIG.map(({ index, color, emoji, alturaBase }) => {
          const grupo = top3[index];
          if (!grupo) return <View key={index} style={s.podioColVacio} />;
          const esCentro = index === 0;

          return (
            <View key={grupo.id} style={s.podioCol}>
              {esCentro && <Text style={s.corona}>👑</Text>}

              <View style={[
                s.podioAvatar,
                { borderColor: color },
                esCentro && s.podioAvatarGrande,
                grupo.es_mi_grupo && { borderWidth: 3, borderColor: colors.primary },
              ]}>
                <Text style={[s.podioAvatarLetra, esCentro && { fontSize: 22 }]}>
                  {grupo.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text style={[s.podioNombre, grupo.es_mi_grupo && { color: colors.primary }]} numberOfLines={1}>
                {grupo.nombre}{grupo.es_mi_grupo ? ' 👈' : ''}
              </Text>

              <Text style={[s.podioMailes, esCentro && { color: colors.rankGold }]}>
                {grupo.total_mailes.toLocaleString()} mA
              </Text>

              <View style={[s.podioBase, { backgroundColor: color, height: alturaBase }]}>
                <Text style={s.podioBaseEmoji}>{emoji}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Lista posiciones 4-10 */}
      {resto.length > 0 && (
        <View style={s.listaWrapper}>
          {resto.map((g) => (
            <View
              key={g.id}
              style={[
                s.listaItem,
                g.es_mi_grupo && { backgroundColor: colors.primaryDim, borderRadius: 12, borderWidth: 1, borderColor: colors.primaryBorder },
              ]}
            >
              <Text style={[s.listaPosicion, { color: colors.textSecondary }]}>
                #{g.posicion}
              </Text>
              <View style={[s.listaAvatar, { backgroundColor: colors.cardBackground }]}>
                <Text style={[s.listaAvatarLetra, { color: colors.primary }]}>
                  {g.nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={s.listaInfo}>
                <Text style={[s.listaNombre, { color: g.es_mi_grupo ? colors.primary : colors.textPrimary }]}>
                  {g.nombre}{g.es_mi_grupo ? ' (Tu grupo)' : ''}
                </Text>
                <Text style={[s.listaSubtitle, { color: colors.textSecondary }]}>
                  👥 {g.num_miembros} miembro{g.num_miembros !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={[s.listaMailes, { color: colors.gold }]}>
                {g.total_mailes.toLocaleString()} mA
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Mi posición si está fuera del top 10 */}
      {miPosicion && (
        <View style={s.miPosicionWrapper}>
          <View style={s.separador}>
            <View style={[s.separadorLinea, { backgroundColor: colors.borderMedium }]} />
            <Text style={[s.separadorTexto, { color: colors.textMuted }]}>Tu grupo</Text>
            <View style={[s.separadorLinea, { backgroundColor: colors.borderMedium }]} />
          </View>
          <View style={[s.listaItem, {
            backgroundColor: colors.primaryDim,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.primaryBorder,
          }]}>
            <Text style={[s.listaPosicion, { color: colors.primary, fontSize: 13 }]}>
              #{miPosicion.posicion}
            </Text>
            <View style={[s.listaAvatar, { backgroundColor: colors.cardBackground, borderColor: colors.primary, borderWidth: 1.5 }]}>
              <Text style={[s.listaAvatarLetra, { color: colors.primary }]}>
                {miPosicion.nombre.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={s.listaInfo}>
              <Text style={[s.listaNombre, { color: colors.primary }]}>
                {miPosicion.nombre} (Tu grupo)
              </Text>
              <Text style={[s.listaSubtitle, { color: colors.textSecondary }]}>
                👥 {miPosicion.num_miembros} miembro{miPosicion.num_miembros !== 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={[s.listaMailes, { color: colors.gold }]}>
              {miPosicion.total_mailes.toLocaleString()} mA
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    titulo: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    refreshBtn: {
      padding: 4,
    },
    refreshIcon: { fontSize: 16 },

    // Empty
    emptyBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyIconText: { fontSize: 36 },
    emptyTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
    emptySubtitle: { color: colors.textSecondary, fontSize: 12 },

    // Podio
    podioWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    podioCol: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    podioColVacio: { flex: 1 },
    corona: { fontSize: 18, marginBottom: -2 },
    podioAvatar: {
      width: 46, height: 46, borderRadius: 23,
      backgroundColor: colors.cardBackground,
      borderWidth: 2,
      alignItems: 'center', justifyContent: 'center',
    },
    podioAvatarGrande: { width: 58, height: 58, borderRadius: 29 },
    podioAvatarLetra: {
      color: colors.primary,
      fontSize: 17,
      fontWeight: '800',
    },
    podioNombre: {
      color: colors.textPrimary,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
      maxWidth: 80,
    },
    podioMailes: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: '600',
      textAlign: 'center',
    },
    podioBase: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 4,
      borderRadius: 8,
      marginTop: 4,
    },
    podioBaseEmoji: { fontSize: 16 },

    // Lista 4-10
    listaWrapper: {
      borderTopWidth: 0.5,
      borderTopColor: colors.borderMedium,
      paddingTop: 10,
      gap: 2,
    },
    listaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 6,
      gap: 10,
    },
    listaPosicion: {
      width: 30,
      fontSize: 12,
      fontWeight: '800',
      textAlign: 'center',
    },
    listaAvatar: {
      width: 30, height: 30, borderRadius: 15,
      alignItems: 'center', justifyContent: 'center',
    },
    listaAvatarLetra: { fontSize: 12, fontWeight: '700' },
    listaInfo: { flex: 1 },
    listaNombre: { fontSize: 13, fontWeight: '700' },
    listaSubtitle: { fontSize: 10, marginTop: 1 },
    listaMailes: { fontSize: 12, fontWeight: '700' },

    // Mi posición fuera del top 10
    miPosicionWrapper: { marginTop: 10 },
    separador: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    separadorLinea: { flex: 1, height: 0.5 },
    separadorTexto: { fontSize: 10, fontWeight: '600' },
  });
}