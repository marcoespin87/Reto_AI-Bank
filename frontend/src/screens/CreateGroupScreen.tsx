import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useGroups } from '../hooks/useGroups';

export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { create, loading, error } = useGroups();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esPrivado, setEsPrivado] = useState(false);

  const handleCreate = async () => {
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'El nombre del grupo no puede estar vacío.');
      return;
    }
    const groupId = await create(nombre.trim(), descripcion.trim(), esPrivado);
    if (groupId) {
      Alert.alert('¡Grupo creado!', `"${nombre.trim()}" fue creado exitosamente.`, [
        { text: 'Ir al grupo', onPress: () => navigation.goBack() },
      ]);
    } else if (error) {
      Alert.alert('Error', error);
    }
  };

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Crear grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.field}>
          <Text style={s.label}>Nombre del grupo *</Text>
          <TextInput
            style={s.input}
            placeholder="Ej: Los Cracks FC"
            placeholderTextColor={colors.outline}
            value={nombre}
            onChangeText={setNombre}
            maxLength={60}
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Descripción (opcional)</Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            placeholder="¿De qué trata tu grupo?"
            placeholderTextColor={colors.outline}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            maxLength={200}
          />
        </View>

        <View style={s.switchRow}>
          <View>
            <Text style={s.label}>Grupo privado</Text>
            <Text style={s.switchSub}>Los miembros deben ser aprobados por el líder</Text>
          </View>
          <Switch
            value={esPrivado}
            onValueChange={setEsPrivado}
            trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
            thumbColor={esPrivado ? colors.primary : colors.surface}
          />
        </View>

        <TouchableOpacity onPress={handleCreate} disabled={loading || !nombre.trim()} style={s.createBtn} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.createBtnFill}
          >
            {loading
              ? <ActivityIndicator color={colors.onPrimary} />
              : (
                <>
                  <MaterialIcons name="group-add" size={20} color={colors.onPrimary} />
                  <Text style={s.createBtnText}>Crear grupo</Text>
                </>
              )}
          </LinearGradient>
        </TouchableOpacity>
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
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  content: { paddingHorizontal: 24, paddingTop: 24, gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1.5 },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.onSurface,
    fontSize: 15,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}66`,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}33`,
  },
  switchSub: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2, maxWidth: 220 },
  createBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  createBtnFill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  createBtnText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },
});
