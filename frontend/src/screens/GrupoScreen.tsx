import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useUserSummary } from '../hooks/useUserSummary';

export default function GrupoScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { data, loading, error, loadSummary } = useUserSummary();

  useEffect(() => {
    if (token) {
      loadSummary(token);
    }
  }, [loadSummary, token]);

  const group = data?.group;
  const groupUi = data?.ui.grupo;

  return (
    <View style={s.root}>
      <LinearGradient
        colors={[colors.surfaceContainerHigh, colors.surface]}
        style={[s.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={s.groupTitleRow}>
          <View style={s.groupIcon}>
            <MaterialIcons name="group" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={s.groupName}>
              {group?.name ?? (loading ? 'Cargando grupo...' : 'Sin grupo activo')}
            </Text>
            <Text style={s.groupSub}>
              {group
                ? `${group.memberCount} miembros · ${group.pendingRequests} solicitudes`
                : 'No hay grupo conectado para este usuario'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={s.shareBtn}
          onPress={() => Alert.alert('Compartir', groupUi?.shareAction.message ?? 'Sin endpoint disponible.')}
        >
          <MaterialIcons name="share" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={s.errorCard}>
            <MaterialIcons name="error-outline" size={18} color={colors.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={s.statsGrid}>
          {[
            { label: 'Miembros', value: `${group?.memberCount ?? 0}`, icon: 'group' as const, color: colors.secondary },
            { label: 'Pendientes', value: `${group?.pendingRequests ?? 0}`, icon: 'pending-actions' as const, color: colors.primary },
            { label: 'mAiles', value: `${group?.contributedMailes ?? 0}`, icon: 'monetization-on' as const, color: colors.tertiary },
            { label: 'Estado', value: group?.status ?? 'Sin grupo', icon: 'emoji-events' as const, color: colors.secondaryContainer },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statLabel}>{stat.label}</Text>
              <View style={s.statValueRow}>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <MaterialIcons name={stat.icon} size={20} color={stat.color} />
              </View>
            </View>
          ))}
        </View>

        <View style={s.objectivesCard}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Objetivos semanales</Text>
            <TouchableOpacity>
              <Text style={s.seeAll}>Ver todos {'->'}</Text>
            </TouchableOpacity>
          </View>
          {(groupUi?.objectives ?? []).map((objective, index) => (
            <View key={objective.id} style={s.objective}>
              <View style={s.objRow}>
                <Text style={s.objLabel}>{objective.label}</Text>
                <Text style={s.objValue}>
                  {objective.currentValue}/{objective.targetValue}
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
          <Text style={s.sectionTitle}>Miembros</Text>
          <View style={s.membersList}>
            <View style={[s.memberRow, { backgroundColor: `${colors.primary}1A`, borderColor: `${colors.primary}33` }]}>
              <View style={s.memberLeft}>
                <Text style={[s.memberRank, { color: colors.primary }]}>
                  {groupUi?.membershipCard.rankLabel ?? '-'}
                </Text>
                <View style={s.memberAvatar}>
                  <MaterialIcons name="person" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[s.memberName, { color: colors.primary }]}>
                    {groupUi?.membershipCard.title ?? 'Sin membresia'}
                  </Text>
                  <Text style={s.memberRole}>{groupUi?.membershipCard.subtitle ?? 'sin_grupo'}</Text>
                </View>
              </View>
              <View style={s.memberRight}>
                <View style={s.milesChip}>
                  <MaterialIcons name="monetization-on" size={12} color={colors.secondary} />
                  <Text style={s.milesText}>{group?.contributedMailes ?? 0}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={s.inviteRow}
              activeOpacity={0.7}
              onPress={() => Alert.alert(groupUi?.inviteAction.label ?? 'Invitar', groupUi?.inviteAction.message ?? 'Sin endpoint disponible.')}
            >
              <View style={s.inviteIcon}>
                <MaterialIcons name="person-add" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={s.inviteText}>{groupUi?.inviteAction.label ?? 'Invitar miembro'}</Text>
                <Text style={s.inviteSub}>{groupUi?.inviteAction.subtitle ?? 'Dato no disponible'}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: { fontSize: 20, fontWeight: '700', color: colors.primary },
  groupSub: { fontSize: 12, color: colors.onSurfaceVariant },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, gap: 20 },
  errorCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: `${colors.error}1A`,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${colors.error}33`,
  },
  errorText: { flex: 1, color: colors.error, fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
  },
  statLabel: { fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 22, fontWeight: '700' },
  objectivesCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
    gap: 16,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
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
  membersList: { gap: 10 },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
  },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberRank: { fontSize: 16, fontWeight: '900', fontStyle: 'italic', width: 16 },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  memberName: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
  memberRole: { fontSize: 11, color: colors.onSurfaceVariant },
  memberRight: { alignItems: 'flex-end', gap: 6 },
  milesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.secondary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  milesText: { fontSize: 11, fontWeight: '700', color: colors.secondary },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${colors.primary}0D`,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${colors.primary}1A`,
    borderStyle: 'dashed',
  },
  inviteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  inviteSub: { fontSize: 11, color: colors.onSurfaceVariant },
});
