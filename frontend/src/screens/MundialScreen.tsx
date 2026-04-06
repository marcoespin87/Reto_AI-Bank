import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MundialStackParamList } from '../navigation/MainNavigator';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useNextMatch } from '../hooks/useNextMatch';
import { useUserSummary } from '../hooks/useUserSummary';

type Nav = NativeStackNavigationProp<MundialStackParamList, 'MundialHub'>;

function formatDate(value: string | null) {
  if (!value) return 'Fecha no disponible';
  return new Date(value).toLocaleString('es-CO');
}

export default function MundialScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { token, displayName } = useAuth();
  const nextMatch = useNextMatch();
  const summary = useUserSummary();

  useEffect(() => {
    if (token) {
      nextMatch.loadMatch(token);
      summary.loadSummary(token);
    }
  }, [nextMatch.loadMatch, summary.loadSummary, token]);

  const match = nextMatch.data;
  const userName = summary.data?.user.displayName ?? displayName;
  const mundialUi = summary.data?.ui.mundial;

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerLeft}>
          <View style={s.avatar}>
            <MaterialIcons name="person" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={s.greeting}>Hola, {userName}</Text>
            <Text style={s.subGreeting}>MUNDIAL 2026 HUB</Text>
          </View>
        </View>
        <View style={s.ligaBadge}>
          <Text style={s.ligaText}>{summary.data?.user.leagueTier ?? 'Sin tier'} · Medalla {summary.data?.user.medalLevel ?? 0}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroSection}>
          <View>
            <Text style={s.heroTitle}>Mundial 2026</Text>
            <Text style={s.heroPhase}>
              {match ? 'Partido disponible' : 'Sin partido disponible'}
            </Text>
          </View>
          <View style={s.streakBadge}>
            <MaterialIcons name="local-fire-department" size={20} color={colors.tertiary} />
            <Text style={s.streakText}>Racha: {summary.data?.user.streakMax ?? 0}</Text>
          </View>
        </View>

        <View style={s.matchCard}>
          <View style={s.closingBadge}>
            <Text style={s.closingText}>
              {summary.data?.missingData?.mundial?.includes('countdown_de_cierre_oficial')
                ? 'No disponible'
                : 'Disponible'}
            </Text>
          </View>
          <View style={s.teamsRow}>
            <View style={s.teamCol}>
              <View style={s.flagCircle}>
                <MaterialIcons name="flag" size={28} color={colors.primary} />
              </View>
              <Text style={s.teamName}>{match?.homeTeam ?? 'Equipo local'}</Text>
            </View>
            <View style={s.vsCol}>
              <Text style={s.vsText}>VS</Text>
              <Text style={s.matchDate}>{formatDate(match?.matchDate ?? null)}</Text>
            </View>
            <View style={s.teamCol}>
              <View style={s.flagCircle}>
                <MaterialIcons name="outlined-flag" size={28} color={colors.primary} />
              </View>
              <Text style={s.teamName}>{match?.awayTeam ?? 'Equipo visitante'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Prediccion')} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.predictBtn}
            >
              <Text style={s.predictBtnText}>
                {match?.currentPrediction ? 'Editar prediccion' : 'Predecir'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View>
          <Text style={s.sectionTitle}>Mis predicciones</Text>
          <View style={s.predictionItem}>
            <View style={s.predictionLeft}>
              <View style={s.flagsStack}>
                <MaterialIcons name="sports-soccer" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={s.predictionScore}>
                  {match?.currentPrediction
                    ? `${match.homeTeam} ${match.currentPrediction.homeScore} - ${match.currentPrediction.awayScore} ${match.awayTeam}`
                    : 'Aun no registras una prediccion'}
                </Text>
                <Text style={s.predictionTime}>
                  {match?.currentPrediction ? 'Prediccion guardada en BD' : 'Disponible para registrar'}
                </Text>
              </View>
            </View>
            <View style={s.pendingBadge}>
              <Text style={s.pendingText}>{match?.currentPrediction ? 'Guardada' : 'Pendiente'}</Text>
            </View>
          </View>
        </View>

        <View style={s.objectivesCard}>
          <View style={s.objectivesHeader}>
            <Text style={s.objectivesTitle}>Objetivos de liga esta semana</Text>
            <TouchableOpacity>
              <Text style={s.seeAll}>Ver todos {'->'}</Text>
            </TouchableOpacity>
          </View>
          {(mundialUi?.objectives ?? []).map((objective, index) => (
            <View key={objective.id} style={s.objective}>
              <View style={s.objRow}>
                <Text style={s.objLabel}>{objective.label}</Text>
                <Text style={s.objValue}>
                  {objective.format === 'percent'
                    ? `${objective.currentValue}%`
                    : `${objective.currentValue}/${objective.targetValue}`}
                </Text>
              </View>
              <View style={s.progressBg}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${objective.progressPercent}%`,
                      backgroundColor: index === 0 ? colors.primaryContainer : colors.secondary,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View>
          <Text style={s.sectionTitle}>Tu grupo · {summary.data?.user.leagueTier ?? 'Sin tier'}</Text>
          <View style={s.leaderboardList}>
            {(mundialUi?.leaderboard ?? []).map((entry) => (
              <View key={entry.id} style={[s.leaderboardItem, { backgroundColor: `${colors.primary}1A`, borderWidth: 1, borderColor: `${colors.primary}33` }]}>
                <View style={s.leaderLeft}>
                  <Text style={[s.rank, { color: colors.primary }]}>{entry.rank}</Text>
                  <View style={[s.leaderAvatar, { borderColor: colors.primary, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialIcons name="person" size={18} color={colors.primary} />
                  </View>
                  <Text style={[s.leaderName, { color: colors.primary }]}>
                    {entry.label}
                  </Text>
                </View>
                <View style={s.leaderRight}>
                  <Text style={[s.leaderMiles, { color: colors.primary }]}>
                    {entry.value}
                  </Text>
                  <MaterialIcons name="groups" size={16} color={colors.secondary} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}4D`,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.primary },
  subGreeting: { fontSize: 10, fontWeight: '500', color: `${colors.onSurfaceVariant}`, textTransform: 'uppercase', letterSpacing: 2 },
  ligaBadge: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
  },
  ligaText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, gap: 24 },
  heroSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroTitle: { fontSize: 30, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5 },
  heroPhase: { fontSize: 14, fontWeight: '500', color: colors.primary },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.tertiary}1A`,
    borderWidth: 1,
    borderColor: `${colors.tertiary}33`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  streakText: { fontSize: 14, fontWeight: '700', color: colors.tertiary },
  matchCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}0D`,
    position: 'relative',
  },
  closingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: `${colors.secondary}33`,
    borderWidth: 1,
    borderColor: `${colors.secondary}4D`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  closingText: { fontSize: 10, fontWeight: '700', color: colors.secondary },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24 },
  teamCol: { alignItems: 'center', gap: 12, width: '33%' },
  flagCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  teamName: { fontSize: 14, fontWeight: '700', color: colors.onSurface, textAlign: 'center' },
  vsCol: { alignItems: 'center', gap: 4 },
  vsText: { fontSize: 20, fontWeight: '700', color: colors.onSurfaceVariant, fontStyle: 'italic' },
  matchDate: { fontSize: 10, color: colors.outline, textTransform: 'uppercase', fontWeight: '500', textAlign: 'center' },
  predictBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  predictBtnText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(31,42,61,0.4)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.outline}26`,
  },
  predictionLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  flagsStack: { flexDirection: 'row' },
  predictionScore: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
  predictionTime: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  pendingBadge: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}33`,
  },
  pendingText: { fontSize: 10, fontWeight: '700', color: colors.outline, textTransform: 'uppercase', letterSpacing: 1 },
  objectivesCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
    gap: 16,
  },
  objectivesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  objectivesTitle: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
  seeAll: { fontSize: 10, fontWeight: '700', color: colors.primary },
  objective: { gap: 8 },
  objRow: { flexDirection: 'row', justifyContent: 'space-between' },
  objLabel: { fontSize: 11, color: colors.onSurfaceVariant },
  objValue: { fontSize: 11, fontWeight: '700', color: colors.onSurface },
  progressBg: {
    height: 6,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  leaderboardList: { gap: 10 },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  leaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', width: 20 },
  leaderAvatar: { width: 40, height: 40, borderRadius: 20 },
  leaderName: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
  leaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leaderMiles: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
});
