import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTutorial } from '../hooks/useTutorial';

// Opciones compactadas: mAiles + cromos en una sola entrada
const SECCIONES = [
  {
    paso: 0,
    icon: '👋',
    titulo: 'Bienvenida a AI-Bank mAiles',
    sub: 'Qué es y cómo funciona la app',
  },
  {
    paso: 1,
    icon: '🏦',
    titulo: 'Pagos, mAiles y cromos',
    sub: 'Banco → realiza pagos y gana recompensas',
  },
  {
    paso: 4,
    icon: '📖',
    titulo: 'Álbum de cromos',
    sub: 'Inicio → Ver álbum → colecciona los 28',
  },
  {
    paso: 5,
    icon: '⚽',
    titulo: 'Predicciones de partidos',
    sub: 'Tab Mundial → predice y gana mAiles',
  },
  {
    paso: 6,
    icon: '🤖',
    titulo: 'AI Coach (chatbot)',
    sub: 'Mundial → botón 🤖 esquina inferior derecha',
  },
  {
    paso: 7,
    icon: '👥',
    titulo: 'Grupos y matchmaking',
    sub: 'Tab Grupo → crea o únete a un equipo',
  },
  {
    paso: 8,
    icon: '🏆',
    titulo: 'Tu premio de temporada',
    sub: 'Perfil → Mi Premio → recompensa por IA',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TutorialMenu({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { iniciarDesde } = useTutorial();
  const s = getStyles(colors);

  function handleSeccion(paso: number) {
    onClose();
    // Pequeño delay para que el modal cierre antes de abrir el tutorial
    setTimeout(() => iniciarDesde(paso), 300);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />

          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.titulo}>¿Qué hay de nuevo?</Text>
              <Text style={s.sub}>Selecciona una sección para revisar</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Ver tutorial completo */}
          <TouchableOpacity
            style={s.btnVerTodo}
            onPress={() => handleSeccion(0)}
          >
            <Text style={s.btnVerTodoIcon}>▶</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.btnVerTodoText}>Ver tutorial completo</Text>
              <Text style={s.btnVerTodoSub}>Recorre todas las secciones desde el inicio</Text>
            </View>
          </TouchableOpacity>

          <Text style={s.dividerLabel}>IR A UNA SECCIÓN ESPECÍFICA</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {SECCIONES.map((sec, i) => (
              <TouchableOpacity
                key={i}
                style={s.seccionItem}
                onPress={() => handleSeccion(sec.paso)}
                activeOpacity={0.7}
              >
                <View style={s.seccionIconWrap}>
                  <Text style={s.seccionIcon}>{sec.icon}</Text>
                </View>
                <View style={s.seccionInfo}>
                  <Text style={s.seccionTitulo}>{sec.titulo}</Text>
                  <Text style={s.seccionSub}>{sec.sub}</Text>
                </View>
                <Text style={s.seccionArrow}>›</Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.cardBackgroundAlt,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 20,
      maxHeight: '88%',
      borderTopWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    handle: {
      width: 36, height: 4, borderRadius: 2,
      backgroundColor: colors.borderStrong,
      alignSelf: 'center', marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    titulo: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
    sub: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
    closeBtn: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: colors.cardBackground,
      alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
    btnVerTodo: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: colors.goldDim, borderWidth: 1,
      borderColor: colors.goldBorder, borderRadius: 16,
      padding: 16, marginBottom: 16,
    },
    btnVerTodoIcon: { color: colors.gold, fontSize: 20, fontWeight: '800' },
    btnVerTodoText: { color: colors.gold, fontSize: 15, fontWeight: '800' },
    btnVerTodoSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
    dividerLabel: {
      color: colors.textMuted, fontSize: 9, fontWeight: '700',
      letterSpacing: 1.5, marginBottom: 10, textAlign: 'center',
    },
    seccionItem: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingVertical: 13,
      borderBottomWidth: 0.5, borderBottomColor: colors.borderMedium,
    },
    seccionIconWrap: {
      width: 42, height: 42, borderRadius: 12,
      backgroundColor: colors.primaryDim,
      alignItems: 'center', justifyContent: 'center',
    },
    seccionIcon: { fontSize: 20 },
    seccionInfo: { flex: 1 },
    seccionTitulo: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
    seccionSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
    seccionArrow: { color: colors.textSecondary, fontSize: 22 },
  });
}