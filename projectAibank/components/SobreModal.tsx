import { useState, useEffect, useRef } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, Image, Animated, Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const RAREZA_CONFIG = {
  epico:  { color: '#ffd65b', border: '#f0c110', label: 'ÉPICO',  bg: '#1a1400' },
  raro:   { color: '#b2c5ff', border: '#5b8cff', label: 'RARO',   bg: '#00081a' },
  comun:  { color: '#c2c6d8', border: '#424655', label: 'COMÚN',  bg: '#0a0a0a' },
};

interface Props {
  cromos: any[];
  visible: boolean;
  onClose: () => void;
  onAgregarAlbum: () => void;
}

export default function SobreModal({ cromos, visible, onClose, onAgregarAlbum }: Props) {
  const [paso, setPaso] = useState<'sobre' | 'revelando' | 'cromos'>('sobre');
  const [cromoActual, setCromoActual] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setPaso('sobre');
      setCromoActual(0);
      opacityAnim.setValue(0);
      Animated.timing(opacityAnim, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function abrirSobre() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setPaso('cromos');
      scaleAnim.setValue(1);
      animarCromo();
    });
  }

  function animarCromo() {
    flipAnim.setValue(0);
    Animated.spring(flipAnim, {
      toValue: 1, tension: 50, friction: 7, useNativeDriver: true,
    }).start();
  }

  function siguienteCromo() {
    if (cromoActual < cromos.length - 1) {
      flipAnim.setValue(0);
      setCromoActual(prev => prev + 1);
      animarCromo();
    } else {
      onAgregarAlbum();
      onClose();
    }
  }

  const cromo = cromos[cromoActual];
  const rareza = cromo ? (RAREZA_CONFIG[cromo.stickers?.rareza as keyof typeof RAREZA_CONFIG] || RAREZA_CONFIG.comun) : RAREZA_CONFIG.comun;

  const cardScale = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1.05, 1],
  });

  const cardOpacity = flipAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[s.overlay, { opacity: opacityAnim }]}>

        {paso === 'sobre' && (
          <View style={s.sobreContainer}>
            <Text style={s.sobreTitulo}>¡Ganaste {cromos.length} sobre{cromos.length > 1 ? 's' : ''}!</Text>
            <Text style={s.sobreSub}>Toca para abrir</Text>

            <TouchableOpacity onPress={abrirSobre} activeOpacity={0.9}>
              <Animated.View style={[s.sobre, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={s.sobreEmoji}>📦</Text>
                <Text style={s.sobreCount}>{cromos.length}</Text>
                <Text style={s.sobreLabel}>cromo{cromos.length > 1 ? 's' : ''}</Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity style={s.btnSkip} onPress={onClose}>
              <Text style={s.btnSkipText}>Omitir</Text>
            </TouchableOpacity>
          </View>
        )}

        {paso === 'cromos' && cromo && (
          <View style={s.cromoContainer}>
            <Text style={s.cromoCounter}>{cromoActual + 1} / {cromos.length}</Text>

            <Animated.View style={[
              s.cromoCard,
              { borderColor: rareza.border, backgroundColor: rareza.bg },
              { transform: [{ scale: cardScale }], opacity: cardOpacity }
            ]}>
              {cromo.stickers?.imagen_url ? (
                <Image
                  source={{ uri: cromo.stickers.imagen_url }}
                  style={s.cromoImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={s.cromoImagePlaceholder}>
                  <Text style={{ fontSize: 60 }}>⚽</Text>
                </View>
              )}
              <View style={[s.cromoBadge, { backgroundColor: rareza.bg }]}>
                <Text style={[s.cromoBadgeText, { color: rareza.color }]}>{rareza.label}</Text>
              </View>
              <Text style={[s.cromoNombre, { color: rareza.color }]}>
                {cromo.stickers?.nombre || 'Jugador'}
              </Text>
            </Animated.View>

            <TouchableOpacity
              style={[s.btnAlbum, { borderColor: rareza.border }]}
              onPress={siguienteCromo}
            >
              <Text style={[s.btnAlbumText, { color: rareza.color }]}>
                {cromoActual < cromos.length - 1 ? 'Siguiente cromo →' : '✓ Colocar en el álbum'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },

  sobreContainer: { alignItems: 'center', gap: 16 },
  sobreTitulo: { color: '#ffd65b', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  sobreSub: { color: '#8c90a1', fontSize: 14 },
  sobre: {
    width: 180, height: 220, borderRadius: 20,
    backgroundColor: '#1f2a3d', borderWidth: 2, borderColor: '#ffd65b',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  sobreEmoji: { fontSize: 64 },
  sobreCount: { color: '#ffd65b', fontSize: 48, fontWeight: '900' },
  sobreLabel: { color: '#8c90a1', fontSize: 14, fontWeight: '600' },
  btnSkip: { marginTop: 16 },
  btnSkipText: { color: '#424655', fontSize: 13 },

  cromoContainer: { alignItems: 'center', gap: 20, paddingHorizontal: 24 },
  cromoCounter: { color: '#8c90a1', fontSize: 13, fontWeight: '600' },
  cromoCard: {
    width: width * 0.65, aspectRatio: 3/4,
    borderRadius: 20, borderWidth: 2, overflow: 'hidden',
    position: 'relative',
  },
  cromoImage: { width: '100%', height: '100%' },
  cromoImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cromoBadge: {
    position: 'absolute', bottom: 40, left: 8, right: 8,
    paddingVertical: 4, borderRadius: 8, alignItems: 'center',
  },
  cromoBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cromoNombre: {
    position: 'absolute', bottom: 8, left: 8, right: 8,
    fontSize: 14, fontWeight: '800', textAlign: 'center',
  },

  btnAlbum: {
    borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 28, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  btnAlbumText: { fontSize: 15, fontWeight: '800' },
});