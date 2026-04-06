import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useUserSummary } from '../hooks/useUserSummary';
import { formatCurrency } from '../utils/format';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { token, displayName } = useAuth();
  const { data, loading, error, loadSummary } = useUserSummary();

  useEffect(() => {
    if (token) {
      loadSummary(token);
    }
  }, [loadSummary, token]);

  const stars = data?.user.stars ?? 0;
  const stickers = data?.stickers.recent ?? [];
  const league = data?.user.leagueTier ?? 'No disponible';
  const medal = data?.user.medalLevel ?? 0;
  const quickActions = data?.ui.home.quickActions ?? [];
  const seasonBanner = data?.ui.home.seasonBanner;

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerLeft}>
          <View style={s.avatarWrap}>
            <MaterialIcons name="person" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={s.greeting}>Hola, {data?.user.displayName ?? displayName}</Text>
            <View style={s.stars}>
              {[1, 2, 3, 4, 5].map((index) => (
                <MaterialIcons
                  key={index}
                  name={index <= stars ? 'star' : 'star-border'}
                  size={14}
                  color={index <= stars ? colors.secondary : `${colors.onSurfaceVariant}4D`}
                />
              ))}
            </View>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.ligaBadge}>
            <Text style={s.ligaText}>{league}</Text>
          </View>
          <Text style={s.medallaText}>Medalla {medal}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.balanceCard}
        >
          <View style={s.balanceWalletIcon}>
            <MaterialIcons name="account-balance-wallet" size={120} color="rgba(0,43,115,0.1)" />
          </View>
          <Text style={s.balanceLabel}>Balance Total</Text>
          <View style={s.balanceRow}>
            <Text style={s.balanceAmount}>
              {loading ? 'Cargando...' : formatCurrency(data?.user.balance ?? 0)}
            </Text>
            <Text style={s.balanceCurrency}>USD</Text>
          </View>
          <Text style={s.cardNumber}> </Text>
          <View style={s.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={s.quickAction}
                activeOpacity={0.7}
                onPress={() => Alert.alert(action.label, action.message)}
              >
                <MaterialIcons name={action.icon as any} size={20} color={colors.onPrimary} />
                <Text style={s.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {error ? (
          <View style={s.errorCard}>
            <MaterialIcons name="error-outline" size={18} color={colors.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={s.card}>
          <View style={s.mailesHeader}>
            <View style={s.mailesLeft}>
              <View style={s.mailesIcon}>
                <MaterialIcons name="monetization-on" size={22} color={colors.secondary} />
              </View>
              <View>
                <Text style={s.mailesLabel}>Tu Progreso</Text>
                <Text style={s.mailesValue}>{data?.user.mailes ?? 0} mAiles</Text>
              </View>
            </View>
            <Text style={s.medallaTag}>Medalla {medal}</Text>
          </View>
          <View style={s.progressRow}>
            <Text style={s.progressHint}>
              {data?.missingData?.home?.includes('meta_proxima_estrella_configurada_en_bd')
                ? 'La meta para la proxima estrella aun no esta modelada.'
                : 'Progreso sincronizado'}
            </Text>
            <View style={s.starsRow}>
              {[1, 2, 3, 4, 5].map((index) => (
                <MaterialIcons
                  key={index}
                  name={index <= stars ? 'star' : 'star-border'}
                  size={14}
                  color={index <= stars ? colors.secondary : `${colors.onSurfaceVariant}33`}
                />
              ))}
            </View>
          </View>
          <View style={s.progressBg}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${stars * 20}%` }]}
            />
          </View>
        </View>

        <ImageBackground
          source={seasonBanner?.imageUrl ? { uri: seasonBanner.imageUrl } : undefined}
          style={s.seasonBanner}
          imageStyle={{ borderRadius: 12 }}
        >
          <LinearGradient
            colors={['transparent', `${colors.surface}66`, colors.surface]}
            locations={[0, 0.5, 1]}
            style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
          />
          <View style={s.seasonContent}>
            <View>
              <View style={s.seasonTitleRow}>
                <MaterialIcons name="sports-soccer" size={18} color={colors.primary} />
                <Text style={s.seasonTitle}>{seasonBanner?.title ?? 'Sin banner configurado'}</Text>
              </View>
              <Text style={s.seasonSub}>
                {seasonBanner?.subtitle ??
                  (data?.missingData?.home?.includes('banner_temporada_personalizado')
                    ? 'El banner personalizado aun no se genera desde BD.'
                    : 'Datos de temporada sincronizados')}
              </Text>
            </View>
            <View style={s.seasonBadge}>
              <Text style={s.seasonBadgeText}>
                {seasonBanner?.badge ?? league}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Cromos recientes</Text>
            <TouchableOpacity onPress={() => Alert.alert('Album', 'Aun no existe una pantalla de album conectada.')}>
              <Text style={s.seeAll}>Ver album {'->'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.stickersRow}
          >
            {stickers.length ? (
              stickers.map((sticker) => (
                <View
                  key={sticker.id}
                  style={[s.stickerCard, { borderColor: `${colors.primary}33` }]}
                >
                  {sticker.imageUrl ? (
                    <Image source={{ uri: sticker.imageUrl }} style={s.stickerImage} />
                  ) : (
                    <View style={[s.stickerImage, s.stickerFallback]}>
                      <MaterialIcons name="style" size={34} color={colors.secondary} />
                    </View>
                  )}
                  <View style={s.stickerLabel}>
                    <Text style={[s.stickerLabelText, { color: colors.secondary }]}>
                      {sticker.name}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={[s.stickerCard, s.stickerLocked]}>
                <MaterialIcons name="info-outline" size={30} color={`${colors.onSurfaceVariant}66`} />
                <Text style={s.stickerEmptyText}>Sin cromos</Text>
              </View>
            )}
          </ScrollView>
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
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: colors.primary },
  stars: { flexDirection: 'row', marginTop: 2 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  ligaBadge: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ligaText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  medallaText: { fontSize: 10, fontWeight: '500', color: colors.onSurface },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, gap: 20 },
  balanceCard: {
    borderRadius: 12,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceWalletIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.1,
  },
  balanceLabel: { color: 'rgba(0,43,115,0.8)', fontSize: 14, fontWeight: '500' },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: colors.onPrimary },
  balanceCurrency: { fontSize: 12, fontWeight: '600', color: 'rgba(0,43,115,0.7)' },
  cardNumber: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: 'rgba(0,43,115,0.6)',
    marginTop: 16,
  },
  quickActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  quickAction: {
    flex: 1,
    backgroundColor: 'rgba(0,43,115,0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  quickActionLabel: { fontSize: 10, fontWeight: '700', color: colors.onPrimary },
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
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
    gap: 12,
  },
  mailesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mailesLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mailesIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.secondary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailesLabel: { fontSize: 11, fontWeight: '500', color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  mailesValue: { fontSize: 20, fontWeight: '700', color: colors.onSurface },
  medallaTag: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressHint: { fontSize: 11, color: colors.onSurfaceVariant, flex: 1, marginRight: 8 },
  starsRow: { flexDirection: 'row' },
  progressBg: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  seasonBanner: {
    height: 140,
    borderRadius: 12,
    justifyContent: 'flex-end',
    padding: 20,
    overflow: 'hidden',
  },
  seasonContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  seasonTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  seasonTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  seasonSub: { fontSize: 12, color: colors.onSurfaceVariant, maxWidth: 180 },
  seasonBadge: {
    backgroundColor: `${colors.primary}33`,
    borderWidth: 1,
    borderColor: `${colors.primary}4D`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seasonBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  seeAll: { fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  stickersRow: { gap: 16, paddingRight: 24 },
  stickerCard: {
    width: 110,
    height: 147,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    padding: 6,
    position: 'relative',
  },
  stickerImage: { width: '100%', height: '100%', borderRadius: 8 },
  stickerFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHighest,
  },
  stickerLabel: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(31,42,61,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  stickerLabelText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  stickerLocked: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    gap: 8,
  },
  stickerEmptyText: { fontSize: 12, color: colors.onSurfaceVariant },
});
