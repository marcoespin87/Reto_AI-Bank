import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useGroups } from '../hooks/useGroups';
import { AvailableGroup } from '../api/types';

export default function JoinGroupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { available, loading, error, loadAvailable, join } = useGroups();

  useEffect(() => {
    loadAvailable();
  }, [loadAvailable]);

  const handleJoin = async (group: AvailableGroup) => {
    const msg = await join(group.id);
    if (msg) {
      Alert.alert('Solicitud enviada', msg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  const renderItem = ({ item }: { item: AvailableGroup }) => (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={s.groupIcon}>
          <MaterialIcons name="group" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.groupName}>{item.nombre}</Text>
          <Text style={s.groupMeta}>
            {item.miembros_count} {item.miembros_count === 1 ? 'miembro' : 'miembros'} ·{' '}
            {item.es_privado ? 'Privado' : 'Público'}
          </Text>
          {item.descripcion ? (
            <Text style={s.groupDesc} numberOfLines={2}>{item.descripcion}</Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={s.joinBtn}
        onPress={() => handleJoin(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.joinBtnFill}
        >
          <Text style={s.joinBtnText}>{item.es_privado ? 'Solicitar' : 'Unirse'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Unirse a un grupo</Text>
        <TouchableOpacity onPress={loadAvailable} style={s.refreshBtn}>
          <MaterialIcons name="refresh" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={s.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={s.loadingText}>Buscando grupos disponibles...</Text>
        </View>
      )}

      {!loading && available.length === 0 && (
        <View style={s.empty}>
          <MaterialIcons name="group-off" size={48} color={colors.outlineVariant} />
          <Text style={s.emptyTitle}>Sin grupos disponibles</Text>
          <Text style={s.emptySub}>No hay grupos públicos en este momento. ¡Crea el tuyo!</Text>
        </View>
      )}

      {!loading && available.length > 0 && (
        <FlatList
          data={available}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  refreshBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: colors.onSurfaceVariant },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  emptySub: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  list: { paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
    gap: 12,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
  groupMeta: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  groupDesc: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 4, lineHeight: 16 },
  joinBtn: { borderRadius: 10, overflow: 'hidden' },
  joinBtnFill: { paddingVertical: 10, alignItems: 'center' },
  joinBtnText: { fontSize: 13, fontWeight: '700', color: colors.onPrimary },
});
