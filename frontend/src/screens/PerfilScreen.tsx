import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useSegmentation } from '../hooks/useSegmentation';
import { useUserSummary } from '../hooks/useUserSummary';

function formatMemberSince(date: string | null) {
  if (!date) return 'Fecha de registro no disponible';
  return `Miembro desde ${new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
  })}`;
}

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { token, signOut, displayName } = useAuth();
  const { data, error, loadSummary } = useUserSummary();
  const { data: segData, loading: segLoading, error: segError, segmentar } = useSegmentation();

  useEffect(() => {
    if (token) {
      loadSummary(token);
    }
  }, [loadSummary, token]);

  const handleSegmentar = () => {
    if (token) {
      segmentar(token);
    }
  };

  const stars = data?.user.stars ?? 0;
  const profileUi = data?.ui.perfil;

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Text style={s.greeting}>Hola, {data?.user.displayName ?? displayName}</Text>
        <View style={s.ligaBadge}>
          <Text style={s.ligaText}>{data?.user.leagueTier ?? 'Sin tier'} · Medalla {data?.user.medalLevel ?? 0}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.profileSection}>
          <View style={s.avatarWrapper}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryContainer, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.avatarRing}
            >
              <View style={s.avatarInner}>
                <MaterialIcons name="person" size={52} color={colors.primary} />
              </View>
            </LinearGradient>
            <View style={s.ligaTagOnAvatar}>
              <Text style={s.ligaTagText}>{data?.user.leagueTier ?? 'Sin tier'}</Text>
            </View>
          </View>
          <Text style={s.profileName}>{data?.user.displayName ?? displayName}</Text>
          <Text style={s.profileSub}>{formatMemberSince(data?.user.memberSince ?? null)}</Text>
        </View>

        {error ? (
          <View style={s.errorCard}>
            <MaterialIcons name="error-outline" size={18} color={colors.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View>
          <View style={s.progressHeader}>
            <Text style={s.progressLabel}>{profileUi?.summary.medalLabel ?? `Medalla ${data?.user.medalLevel ?? 0}`}</Text>
            <Text style={s.progressCount}>{profileUi?.summary.starsLabel ?? `${stars}/5 Estrellas`}</Text>
          </View>
          <View style={s.progressBg}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${Math.max(20, stars * 20)}%` }]}
            />
          </View>
        </View>

        <View style={s.statsGrid}>
          {[
            { label: 'Total mAiles', value: `${data?.user.mailes ?? 0}`, icon: 'star' as const, color: colors.secondary },
            { label: 'Predicciones', value: `${data?.user.predictionsCount ?? 0}`, icon: 'sports-soccer' as const, color: colors.primary },
            { label: 'Grupos', value: `${data?.user.groupCount ?? 0}`, icon: 'calendar-today' as const, color: colors.tertiary },
            { label: 'Racha Maxima', value: `${data?.user.streakMax ?? 0}`, icon: 'local-fire-department' as const, color: colors.error },
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

        <View>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Mis medallas</Text>
            <TouchableOpacity>
              <Text style={s.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <View style={s.medalsCard}>
            {(profileUi?.medals ?? []).map((medal) =>
              medal.isCurrent ? (
                <View key={medal.level} style={s.activeMedalWrapper}>
                  <View style={s.activeMedalGlow} />
                  <LinearGradient
                    colors={[colors.secondary, colors.secondaryContainer]}
                    style={s.activeMedalCircle}
                  >
                    <MaterialIcons name="emoji-events" size={26} color={colors.onSecondary} />
                  </LinearGradient>
                  <Text style={s.activeMedalLabel}>ACTUAL</Text>
                </View>
              ) : (
                <View key={medal.level} style={[s.medalItem, !medal.unlocked && { opacity: 0.4 }]}>
                  <View
                    style={[
                      s.medalCircle,
                      !medal.unlocked && { borderColor: colors.outlineVariant },
                      medal.unlocked && { opacity: 0.6 + Math.min(medal.level, 2) * 0.2 },
                    ]}
                  >
                    <MaterialIcons
                      name={medal.unlocked ? 'emoji-events' : 'lock'}
                      size={medal.unlocked ? 22 : 18}
                      color={medal.unlocked ? colors.secondary : colors.onSurfaceVariant}
                    />
                  </View>
                  <Text style={s.medalLabel}>{medal.label}</Text>
                </View>
              ),
            )}
          </View>
        </View>

        <View>
          <View style={s.benefitsCard}>
            <View style={s.benefitsHeader}>
              <View style={s.benefitsTitle}>
                <MaterialIcons name="verified" size={20} color={colors.secondary} />
                <Text style={s.benefitsTitleText}>{profileUi?.benefits.title ?? 'Beneficios de medalla'}</Text>
              </View>
              <MaterialIcons name="expand-less" size={20} color={colors.onSurfaceVariant} />
            </View>
            <Text style={s.benefitText}>
              {profileUi?.benefits.description ??
                (data?.missingData?.perfil?.includes('beneficios_medalla_modelados_en_bd')
                  ? 'Los beneficios reales de medalla aun no estan modelados en BD.'
                  : 'Beneficios sincronizados.')}
            </Text>
          </View>
        </View>

        <View>
          <Text style={s.sectionTitle}>Tu premio personalizado</Text>
          {!segData && !segLoading && (
            <TouchableOpacity
              style={s.premioBtn}
              onPress={handleSegmentar}
              activeOpacity={0.8}
              disabled={!token}
            >
              <LinearGradient
                colors={[colors.secondary, colors.secondaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.premioBtnFill}
              >
                <MaterialIcons name="card-giftcard" size={20} color={colors.onSecondary} />
                <Text style={s.premioBtnText}>
                  {token ? 'Ver mi premio' : 'Inicia sesion para ver tu premio'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {segLoading && (
            <View style={s.premioLoading}>
              <ActivityIndicator color={colors.secondary} size="large" />
              <Text style={s.premioLoadingText}>Calculando tu premio...</Text>
            </View>
          )}

          {segError && !segLoading && (
            <View style={s.errorCard}>
              <MaterialIcons name="error-outline" size={18} color={colors.error} />
              <Text style={s.errorText}>{segError}</Text>
            </View>
          )}

          {segData && !segLoading && (
            <View style={s.premioCard}>
              <View style={s.premioHeader}>
                <View style={s.premioIconWrap}>
                  <MaterialIcons name="emoji-events" size={28} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.premioCategoria}>{segData.categoria.toUpperCase()}</Text>
                  <Text style={s.premioNombre}>{segData.premio_nombre}</Text>
                </View>
                <TouchableOpacity onPress={handleSegmentar}>
                  <MaterialIcons name="refresh" size={20} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {segData.razones.slice(0, 3).map((reason, index) => (
                <View key={`${reason}-${index}`} style={s.premioRazonRow}>
                  <MaterialIcons name="check-circle" size={14} color={colors.secondary} />
                  <Text style={s.premioRazonText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.settingsList}>
          {(profileUi?.settings ?? []).map((setting, index) => (
            <TouchableOpacity
              key={setting.id}
              style={[s.settingRow, index > 0 && s.settingBorder]}
              activeOpacity={0.7}
              onPress={() => Alert.alert(setting.label, setting.message)}
            >
              <View style={s.settingLeft}>
                <MaterialIcons name={setting.icon as any} size={22} color={colors.primary} />
                <Text style={s.settingLabel}>{setting.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[s.settingRow, s.settingBorder]} activeOpacity={0.7} onPress={signOut}>
            <View style={s.settingLeft}>
              <MaterialIcons name="exit-to-app" size={22} color={colors.error} />
              <Text style={[s.settingLabel, { color: colors.error }]}>Cerrar sesion</Text>
            </View>
          </TouchableOpacity>
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
  greeting: { fontSize: 20, fontWeight: '700', color: colors.primary },
  ligaBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ligaText: { fontSize: 10, fontWeight: '500', color: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, gap: 24 },
  profileSection: { alignItems: 'center', gap: 8 },
  avatarWrapper: { alignItems: 'center', position: 'relative', marginBottom: 8 },
  avatarRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 62,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ligaTagOnAvatar: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  ligaTagText: { fontSize: 10, fontWeight: '700', color: colors.onSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  profileName: { fontSize: 22, fontWeight: '700', color: colors.onSurface, marginTop: 8 },
  profileSub: { fontSize: 14, color: colors.onSurfaceVariant },
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
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: colors.primary },
  progressCount: { fontSize: 12, color: colors.onSurfaceVariant },
  progressBg: {
    height: 12,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 6,
    overflow: 'hidden',
    padding: 1,
  },
  progressFill: { height: '100%', borderRadius: 5 },
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
  statLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.onSurfaceVariant, fontWeight: '500' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statValue: { fontSize: 24, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  seeAll: { fontSize: 12, fontWeight: '500', color: colors.primary },
  medalsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
  },
  medalItem: { alignItems: 'center', gap: 6 },
  medalCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: `${colors.secondary}4D`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalLabel: { fontSize: 10, color: colors.onSurfaceVariant },
  activeMedalWrapper: { alignItems: 'center', gap: 4, position: 'relative' },
  activeMedalGlow: {
    position: 'absolute',
    backgroundColor: `${colors.secondary}1A`,
    borderRadius: 40,
    width: 80,
    height: 80,
    top: -12,
    left: -12,
  },
  activeMedalCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMedalLabel: { fontSize: 8, fontWeight: '700', color: colors.secondary, letterSpacing: 1 },
  benefitsCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    gap: 12,
  },
  benefitsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  benefitsTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitsTitleText: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
  benefitText: { fontSize: 14, color: colors.onSurfaceVariant, flex: 1, lineHeight: 20 },
  settingsList: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  settingBorder: {
    borderTopWidth: 1,
    borderTopColor: `${colors.outlineVariant}1A`,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: colors.onSurface },
  premioBtn: { borderRadius: 14, overflow: 'hidden' },
  premioBtnFill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  premioBtnText: { fontSize: 15, fontWeight: '700', color: colors.onSecondary },
  premioLoading: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  premioLoadingText: { fontSize: 13, color: colors.onSurfaceVariant },
  premioCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: `${colors.outlineVariant}1A`,
    borderLeftColor: colors.secondary,
    gap: 16,
  },
  premioHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  premioIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${colors.secondary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premioCategoria: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  premioNombre: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  premioRazonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  premioRazonText: { fontSize: 13, color: colors.onSurfaceVariant, flex: 1 },
});
