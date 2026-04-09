import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated, Dimensions, Image, ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const MONTO_DEMO  = 120;
const MAILES_DEMO = Math.floor(MONTO_DEMO / 100) * 10;
const CROMOS_DEMO = Math.floor(MONTO_DEMO / 20);

interface Props {
  visible: boolean;
  onCompletar: () => void;
  pasoInicial?: number;
  userName?: string;
}

const PASOS = [
  { titulo: '¡Bienvenido a AI-Bank mAiles!', boton: 'Ver cómo funciona →' },
  { titulo: 'Realiza pagos con tu tarjeta',   boton: 'Ver qué gané →'      },
  { titulo: '¡Ganaste mAiles!',               boton: 'Ver mis cromos →'    },
  { titulo: '¡Ganaste cromos!',               boton: 'Ver mi álbum →'      },
  { titulo: 'Tu álbum Mundial 2026',          boton: 'Ver predicciones →'  },
  { titulo: 'Predice los partidos',           boton: 'Ver el chatbot →'    },
  { titulo: 'Tu AI Coach',                    boton: 'Ver grupos →'        },
  { titulo: 'Únete a un equipo',              boton: 'Ver premios →'       },
  { titulo: 'Tu premio de temporada',         boton: '¡Empezar ahora!'  },
];

export default function TutorialInteractivo({ visible, onCompletar, pasoInicial = 0, userName = 'Usuario' }: Props) {
  const { colors } = useTheme();
  const [paso, setPaso] = useState(pasoInicial);

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const mailesAnim = useRef(new Animated.Value(0)).current;
  const cromoScale = useRef(new Animated.Value(0.3)).current;
  const cromoOpac  = useRef(new Animated.Value(0)).current;
  const [cromoImgUrl, setCromoImgUrl] = useState('https://picsum.photos/seed/valencia/400/530');

  useEffect(() => {
    if (visible) { setPaso(pasoInicial); animar(); }
  }, [visible, pasoInicial]);

  useEffect(() => {
    async function fetchImagenCromo() {
      const { data, error } = await supabase
        .from('stickers')
        .select('imagen_url')
        .eq('rareza', 'epico')
        .limit(1)
        .single();

      if (data && data.imagen_url) {
        setCromoImgUrl(data.imagen_url);
      }
    }
    
    fetchImagenCromo();
  }, []);

  useEffect(() => {
    animar();
    if (paso === 2) animarMailes();
    if (paso === 3) animarCromo();
  }, [paso]);

  function animar() {
    fadeAnim.setValue(0); slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }

  function animarMailes() {
    mailesAnim.setValue(0);
    Animated.spring(mailesAnim, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }).start();
  }

  function animarCromo() {
    cromoScale.setValue(0.3); cromoOpac.setValue(0);
    Animated.parallel([
      Animated.spring(cromoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(cromoOpac,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }

  const p = PASOS[paso];
  const esUltimo = paso === PASOS.length - 1;

  // Chip de ubicación en la app
  function UbicacionChip({ icono, texto }: { icono: string; texto: string }) {
    return (
      <View style={[s.ubicacionChip, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}>
        <Text style={s.ubicacionChipIcon}>{icono}</Text>
        <Text style={[s.ubicacionChipText, { color: colors.primary }]}>{texto}</Text>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={s.overlay}>

        {/* Pills */}
        <View style={[s.pills, { backgroundColor: colors.cardBackground }]}>
          {PASOS.map((_, i) => (
            <View key={i} style={[
              s.pill,
              { backgroundColor: i <= paso ? colors.primary : colors.borderMedium },
              i === paso && { width: 18 },
            ]} />
          ))}
        </View>

        <Animated.View style={[
          s.card,
          { backgroundColor: colors.cardBackgroundAlt, borderColor: colors.borderStrong },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
          {/* Botón X */}
          <TouchableOpacity
            style={[s.saltarX, { backgroundColor: colors.cardBackground }]}
            onPress={onCompletar}
          >
            <Text style={[s.saltarXText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.pasoHeader}>
            <Text style={[s.pasoTitulo, { color: colors.primary }]}>{p.titulo}</Text>
          </View>
          <ScrollView style={{ flexShrink: 1, marginBottom: 10 }} showsVerticalScrollIndicator={false}>
            {/* ── PASO 0: Bienvenida ── */}
            {paso === 0 && (
              <View style={s.contenido}>
                <View style={[s.welcomeCard, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}>
                  <Text style={[s.welcomeTitulo, { color: colors.primary }]}>
                    Hola, {userName}
                  </Text>
                  <Text style={[s.welcomeDesc, { color: colors.textPrimary }]}>
                    AI-Bank mAiles combina tu cuenta bancaria con la emoción del Mundial 2026. Gana mAiles con tus compras, colecciona cromos y predice partidos para ganar premios exclusivos.
                  </Text>
                </View>

                <View style={[s.resumenGrid, { gap: 8 }]}>
                  {[
                    { icon: '⭐', titulo: 'Gana mAiles',      desc: 'Con cada pago que hagas' },
                    { icon: '🃏', titulo: 'Colecciona cromos', desc: 'Cada $20 = 1 cromo' },
                    { icon: '⚽', titulo: 'Predice partidos',  desc: 'Gana mAiles' },
                    { icon: '👥', titulo: 'Juega en equipo',   desc: 'Forma grupos y compite' },
                  ].map((item, i) => (
                    <View key={i} style={[s.resumenItem, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                      <Text style={s.resumenIcon}>{item.icon}</Text>
                      <Text style={[s.resumenTitulo, { color: colors.textPrimary }]}>{item.titulo}</Text>
                      <Text style={[s.resumenDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                    </View>
                  ))}
                </View>
                <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={[s.infoText, { color: colors.primary }]}>
                    💡 ¿Cómo funciona? Usa tu tarjeta AI-Bank para pagos diarios y el sistema te recompensará automáticamente con mAiles y cromos del Mundial 2026.
                  </Text>
                </View>
              </View>
            )}

            {/* ── PASO 1: Simulación de pago ── */}
            {paso === 1 && (
              <View style={s.contenido}>

                <View style={[s.miniCard, { backgroundColor: colors.primary }]}>
                  <View style={s.miniCardPatternCircle} />
                  <View style={s.miniCardTop}>
                    <Text style={s.miniCardLabel}>AI-Bank Débito</Text>
                    <Text style={s.miniCardBrand}>mAiles</Text>
                  </View>
                  <Text style={s.miniSaldo}>Saldo disponible</Text>
                  <Text style={s.miniBalance}>$1,500.00</Text>
                  <Text style={s.miniCuenta}>1234 5678 9012 3456</Text>
                </View>

                <View style={[s.modalSimulado, { backgroundColor: colors.cardBackground, borderColor: colors.borderStrong }]}>
                  <Text style={[s.modalSimuladoTitle, { color: colors.textPrimary }]}>💡 Pagar servicio</Text>
                  <View style={s.accionesRow}>
                    {[
                      { icon: '↗️', label: 'Transferir' },
                      { icon: '💡', label: 'Pagar' },
                      { icon: '🛒', label: 'Compra' },
                    ].map((a, i) => (
                      <View key={i} style={[s.accionItem, { backgroundColor: colors.backgroundSecondary, borderColor: i === 1 ? colors.primary : colors.borderStrong }]}>
                        <Text style={s.accionIcon}>{a.icon}</Text>
                        <Text style={[s.accionLabel, { color: i === 1 ? colors.primary : colors.textSecondary }]}>{a.label}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[s.inputLabel, { color: colors.primary }]}>MONTO ($)</Text>
                  <View style={[s.inputFake, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderStrong }]}>
                    <Text style={[s.inputFakeVal, { color: colors.primary, fontSize: 20, fontWeight: '800' }]}>${MONTO_DEMO}.00</Text>
                  </View>
                  <View style={[s.previewMailes, { backgroundColor: colors.goldDim }]}>
                    <Text style={[s.previewMailesText, { color: colors.gold }]}>
                      ⭐ Ganarás {MAILES_DEMO} mAiles  y  🃏 {CROMOS_DEMO} cromos
                    </Text>
                  </View>
                  <View style={[s.btnSimulado, { backgroundColor: colors.gold, opacity: 0.8 }]}>
                    <Text style={[s.btnSimuladoText, { color: colors.textOnGold }]}>Confirmar ✦</Text>
                  </View>
                </View>
                <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={[s.infoText, { color: colors.primary }]}>
                    💡 ¿Cómo funciona? Ve a la sección de Banco, toca Pagar o Compra, ingresa el monto y confirma. Cuanto más gastes, más mAiles y cromos acumulas.
                  </Text>
                </View>
              </View>
            )}

            {/* ── PASO 2: mAiles ── */}
            {paso === 2 && (
              <View style={s.contenido}>
                <UbicacionChip icono="🏦" texto="Banco → cada pago genera mAiles." />

                <Animated.View style={[
                  s.mailesContainer,
                  { borderColor: colors.goldBorder, backgroundColor: colors.goldDim },
                  { transform: [{ scale: mailesAnim }], opacity: mailesAnim },
                ]}>
                  <Text style={s.mailesGanIcon}>⭐</Text>
                  <Text style={[s.mailesGanNum, { color: colors.gold }]}>+{MAILES_DEMO}</Text>
                  <Text style={[s.mailesGanLabel, { color: colors.gold }]}>mAiles ganados</Text>
                </Animated.View>

                <View style={[s.detalleBox, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                  {[
                    { key: 'Monto pagado',   val: `$${MONTO_DEMO}.00`,       vc: colors.textPrimary },
                    { key: 'Tasa mAiles',    val: '10 mAiles por cada $100',        vc: colors.primary     },
                    
                  ].map((row, i) => (
                    <View key={i} style={[s.detalleRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.borderMedium }]}>
                      <Text style={[s.detalleKey, { color: colors.textSecondary }]}>{row.key}</Text>
                      <Text style={[s.detalleVal, { color: row.vc }]}>{row.val}</Text>
                    </View>
                  ))}
                </View>
                <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={[s.infoText, { color: colors.primary }]}>
                    💡 ¿Cómo funciona? Cada $100 gastados = 10 mAiles. Acumula mAiles para subir de medalla.
                  </Text>
                </View>
              </View>
            )}

            {/* ── PASO 3: Cromo ── */}
            {paso === 3 && (
              <View style={s.contenido}>
                <UbicacionChip icono="🏦" texto="Banco → por cada $20 que gastes gana 1 cromo" />

                <Animated.View style={[
                  s.cromoCard,
                  { borderColor: colors.rarityEpicBorder, backgroundColor: colors.rarityEpicBg },
                  { transform: [{ scale: cromoScale }], opacity: cromoOpac },
                ]}>
                  <Image
                    source={{ uri: cromoImgUrl }}
                    style={s.cromoImg} resizeMode="cover"
                  />
                </Animated.View>

                <View style={s.rarezaRow}>
                  {[
                    { label: 'Común', color: colors.rarityCommonText, pct: '60%' },
                    { label: 'Raro',  color: colors.rarityRareText,   pct: '30%' },
                    { label: 'Épico', color: colors.rarityEpicText,   pct: '10%' },
                  ].map(r => (
                    <View key={r.label} style={[s.rarezaItem, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                      <Text style={[s.rarezaLabel, { color: r.color }]}>{r.label}</Text>
                      <Text style={[s.rarezaPct, { color: colors.textMuted }]}>{r.pct}</Text>
                    </View>
                  ))}
                </View>
                <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={[s.infoText, { color: colors.primary }]}>
                    💡 ¿Cómo funciona? Cada $20 gastados = 1 cromo aleatorio. Al confirmar el pago aparece un sobre animado, tócalo para revelar qué jugador obtuviste.
                  </Text>
                </View>
              </View>
            )}

            {/* ── PASO 4: Álbum ── */}
            {paso === 4 && (
              <View style={s.contenido}>
                <UbicacionChip icono="🏠" texto="Inicio → Ver álbum" />

                <View style={[s.albumProgress, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                  <View style={s.albumProgressHeader}>
                    <Text style={[s.albumNum, { color: colors.gold }]}>1</Text>
                    <Text style={[s.albumTotal, { color: colors.textSecondary }]}>/ 28 cromos</Text>
                  </View>
                  <View style={[s.progressBar, { backgroundColor: colors.borderMedium }]}>
                    <View style={[s.progressFill, { width: `${(1/28)*100}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[s.albumSub, { color: colors.textSecondary }]}>
                    ¡Estás a 27 cromos de completar tu colección!
                  </Text>
                </View>

                <View style={s.albumGrid}>
                  <View style={[s.albumCromoCard, { borderColor: colors.rarityEpicBorder, backgroundColor: colors.rarityEpicBg }]}>
                    <Image 
                      source={{ uri: cromoImgUrl }} 
                      style={s.albumCromoImg} resizeMode="cover" 
                    />
                    <View style={[s.albumCromoBadge, { backgroundColor: colors.rarityEpicBg }]}>
                      <Text style={[s.albumCromoBadgeText, { color: colors.rarityEpicText }]}>ÉPICO</Text>
                    </View>
                  </View>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={[s.albumCromoCard, s.albumCromoLocked, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                      <Text style={[s.albumLockText, { color: colors.textMuted }]}>?</Text>
                    </View>
                  ))}
                </View>

                <View style={[s.premioBox, { borderColor: colors.goldBorder, backgroundColor: colors.goldDim }]}>
                  <Text style={s.premioIcon}>🎫</Text>
                  <View style={s.premioInfo}>
                    <Text style={[s.premioTitulo, { color: colors.gold }]}>Premio álbum completo (28 cromos)</Text>
                    <Text style={[s.premioDesc, { color: colors.textSecondary }]}>
                      Sorteo VIP: Vuelo + Hotel + Experiencias Mundial 2026 ✈️🏨
                    </Text>
                  </View>
                </View>
                <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={[s.infoText, { color: colors.primary }]}>
                    💡 ¿Cómo funciona? Accede desde Inicio → Ver álbum. Colecciona los 28 cromos para completar el álbum y entrar al sorteo con vuelo, hotel y experiencias VIP del Mundial 2026.
                  </Text>
                </View>
              </View>
            )}

            {/* ── PASO 5: Predicciones ── */}
            {paso === 5 && (
              <View style={s.contenido}>
                <UbicacionChip icono="⚽" texto="Mundial en el menú inferior (botón central)" />

                <View style={[s.partidoCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <View style={[s.countdownChip, { backgroundColor: colors.errorDim, borderColor: colors.error }]}>
                    <Text style={[s.countdownText, { color: colors.error }]}>⏱ Predicción cierra en 1h 10m</Text>
                  </View>
                  <View style={s.teamsRow}>
                    <View style={s.teamCol}>
                      <View style={[s.flagCircle, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                        <Text style={s.flagEmoji}>🇪🇨</Text>
                      </View>
                      <Text style={[s.teamName, { color: colors.textPrimary }]}>Ecuador</Text>
                    </View>
                    <Text style={[s.vsText, { color: colors.textMuted }]}>VS</Text>
                    <View style={s.teamCol}>
                      <View style={[s.flagCircle, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                        <Text style={s.flagEmoji}>🇨🇮</Text>
                      </View>
                      <Text style={[s.teamName, { color: colors.textPrimary }]}>C. de Marfil</Text>
                    </View>
                  </View>
                </View>

                <View style={[s.stepperCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                  <Text style={[s.stepperTitle, { color: colors.textSecondary }]}>TU PREDICCIÓN — usa + y − para ajustar</Text>
                  <View style={s.steppersRow}>
                    <View style={s.stepperCol}>
                      <Text style={s.stepperFlag}>🇪🇨</Text>
                      <View style={[s.stepperBox, { backgroundColor: colors.backgroundSecondary }]}>
                        <Text style={[s.stepperBtn2, { color: colors.primary }]}>−</Text>
                        <Text style={[s.stepperValue, { color: colors.textPrimary }]}>1</Text>
                        <Text style={[s.stepperBtn2, { color: colors.primary }]}>+</Text>
                      </View>
                    </View>
                    <Text style={[s.stepperDash, { color: colors.textMuted }]}>—</Text>
                    <View style={s.stepperCol}>
                      <Text style={s.stepperFlag}>🇨🇮</Text>
                      <View style={[s.stepperBox, { backgroundColor: colors.backgroundSecondary }]}>
                        <Text style={[s.stepperBtn2, { color: colors.primary }]}>−</Text>
                        <Text style={[s.stepperValue, { color: colors.textPrimary }]}>0</Text>
                        <Text style={[s.stepperBtn2, { color: colors.primary }]}>+</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={[s.btnSimulado, { backgroundColor: colors.gold, marginTop: 4 }]}>
                    <Text style={[s.btnSimuladoText, { color: colors.textOnGold }]}>Predecir resultado ✦</Text>
                </View>
                <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={[s.infoText, { color: colors.primary }]}>
                    💡 ¿Cómo funciona? Ajusta el marcador de cada equipo usando los botones de + y −. Si aciertas que equipo ganará el partido, ¡ganarás mAiles!
                  </Text>
                </View>

              </View>
            )}

            {/* ── PASO 6: Chatbot ── */}
            {paso === 6 && (
              <View style={s.contenido}>
                <UbicacionChip icono="⚽" texto="Mundial → botón 🤖 flotante (esquina inferior derecha)" />

                <View style={[s.chatbotDemo, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  {/* Mensaje usuario */}
                  <View style={s.chatMsgUser}>
                    <View style={[s.chatBubbleUser, { backgroundColor: colors.primary }]}>
                      <Text style={[s.chatBubbleText, { color: '#002b73' }]}>
                        ¿Cómo está Ecuador en forma reciente?
                      </Text>
                    </View>
                  </View>
                  {/* Respuesta bot */}
                  <View style={s.chatMsgBot}>
                    <View style={[s.chatBubbleBot, { backgroundColor: colors.cardBackground }]}>
                      <Text style={[s.chatBubbleText, { color: colors.textPrimary }]}>
                        Ecuador viene de 3 victorias consecutivas . Ranking FIFA #41. Enner Valencia con 5 goles mundialistas.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={[s.infoText, { color: colors.primary }]}>
                    💡 ¿Cómo usarlo? Abre el chat. Pregunta por un partido. Recibe estadísticas clave que te servirán para armar tu propia predicción
                  </Text>
                </View>

                {/* FAB simulado */}
                <View style={s.fabRow}>
                  <Text style={[s.fabDesc, { color: colors.textSecondary }]}>Accede tocando el botón:</Text>
                  <View style={[s.fabSimulado, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
                    <Text style={s.fabEmoji}>🤖</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── PASO 7: Grupos ── */}
            {paso === 7 && (
              <View style={s.contenido}>
                <UbicacionChip icono="👥" texto="Selecciona Grupo en el menú inferior" />

                <View style={s.grupoOpciones}>
                  {[
                    { icon: '➕', label: 'Crear grupo',             sub: 'Nombra tu equipo → comparte el código',      bg: colors.primaryDim,  border: colors.primary  },
                    { icon: '🔑', label: 'Unirse con código',       sub: 'Ingresa el código de 6 letras de tu amigo',  bg: colors.cardBackground, border: colors.borderStrong },
                    { icon: '🎯', label: 'Matchmaking automático',  sub: 'Te emparejamos con usuarios con gastos similares', bg: colors.goldDim,     border: colors.goldBorder   },
                  ].map((opt, i) => (
                    <View key={i} style={[s.grupoOpcion, { backgroundColor: opt.bg, borderColor: opt.border }]}>
                      <Text style={s.grupoOpcionIcon}>{opt.icon}</Text>
                      <View style={s.grupoOpcionInfo}>
                        <Text style={[s.grupoOpcionLabel, { color: colors.textPrimary }]}>{opt.label}</Text>
                        <Text style={[s.grupoOpcionSub, { color: colors.textSecondary }]}>{opt.sub}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={[s.votacionCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                  <Text style={[s.votacionTitle, { color: colors.textPrimary }]}>⚖️ Votación para nuevos miembros</Text>
                  <Text style={[s.votacionDesc, { color: colors.textSecondary }]}>
                    Cuando alguien solicita unirse, todos los miembros activos votan. Se necesita aprobación unánime. Un rechazo cancela la solicitud.
                  </Text>
                  <View style={s.votacionBtns}>
                    <View style={[s.votaBtn, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}>
                      <Text style={[s.votaBtnText, { color: colors.primary }]}>✓ Aprobar</Text>
                    </View>
                    <View style={[s.votaBtn, { backgroundColor: colors.errorDim, borderColor: colors.error }]}>
                      <Text style={[s.votaBtnText, { color: colors.error }]}>✗ Rechazar</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ── PASO 8: Premios ── */}
            {paso === 8 && (
              <View style={s.contenido}>
                <UbicacionChip icono="👤" texto="Perfil → Mi Premio de Temporada" />

                <View style={[s.premioFinalCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                  <Text style={s.premioFinalEmoji}>🏆</Text>
                  <Text style={[s.premioFinalTitulo, { color: colors.textPrimary }]}>Premio personalizado</Text>
                  <Text style={[s.premioFinalDesc, { color: colors.textSecondary }]}>
                    Al final de la temporada se te asigna el premio que más se adapta a ti.
                  </Text>
                </View>

                <View style={[s.detalleBox, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                  {[
                    { icon: '📱', cat: 'Tecnología',  desc: 'iPhone, laptop, accesorios tech'     },
                    { icon: '✈️', cat: 'Viajes',      desc: 'Vuelos, hoteles, experiencias'        },
                    { icon: '🍽️', cat: 'Gastronomía', desc: 'Restaurantes gourmet y experiencias' },
                    { icon: '💎', cat: 'Premium',     desc: 'Beneficios financieros exclusivos'    },
                  ].map((item, i) => (
                    <View key={i} style={[s.detalleRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.borderMedium }]}>
                      <Text style={{ fontSize: 18, marginRight: 8 }}>{item.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.detalleKey, { color: colors.textPrimary, fontWeight: '700' }]}>{item.cat}</Text>
                        <Text style={[s.detalleKey, { color: colors.textSecondary }]}>{item.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navegación */}
          <View style={s.navRow}>
            {paso > 0 && (
              <TouchableOpacity
                style={[s.btnAnterior, { backgroundColor: colors.cardBackground, borderColor: colors.borderStrong }]}
                onPress={() => setPaso(p => p - 1)}
              >
                <Text style={[s.btnAnteriorText, { color: colors.textSecondary }]}>← Anterior</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.btnSiguiente, { backgroundColor: colors.gold, flex: paso > 0 ? 2 : 1 }]}
              onPress={() => esUltimo ? onCompletar() : setPaso(p => p + 1)}
            >
              <Text style={[s.btnSiguienteText, { color: colors.textOnGold }]}>{p.boton}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[s.contador, { color: colors.textMuted }]}>
            {paso + 1} de {PASOS.length}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: 14 },
  pills: { flexDirection: 'row', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginBottom: 10 },
  pill: { height: 5, width: 5, borderRadius: 3 },
  card: { borderRadius: 28, padding: 18, width: '100%', borderWidth: 0.5, maxHeight: '88%' },
  saltarX: { position: 'absolute', top: 14, right: 14, zIndex: 10, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saltarXText: { fontSize: 15, fontWeight: '700' },
  pasoHeader: { marginBottom: 12, paddingRight: 36 },
  pasoTitulo: { fontSize: 22, fontWeight: '800' },
  contenido: { gap: 12, marginBottom: 12 },

  // Chip ubicación
  ubicacionChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' , width: '100%'},
  ubicacionChipIcon: { fontSize: 16 },
  ubicacionChipText: { fontSize: 13, fontWeight: '700', flexShrink: 1},

  // Paso 0 - bienvenida
  welcomeCard: { borderRadius: 18, padding: 20, borderWidth: 1, alignItems: 'center', gap: 8 },
  welcomeTitulo: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  welcomeDesc: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  resumenGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  resumenItem: { width: '48%', borderRadius: 12, padding: 14, borderWidth: 0.5, alignItems: 'center', gap: 6 },
  resumenIcon: { fontSize: 28 },
  resumenTitulo: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  resumenDesc: { fontSize: 14, lineHeight: 18, textAlign: 'center' },

  // Paso 1
  miniCard: { borderRadius: 16, padding: 16, overflow: 'hidden', position: 'relative' },
  miniCardPatternCircle: { position: 'absolute', top: -20, right: -20, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.12)' },
  miniCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  miniCardLabel: { color: '#002b73', fontSize: 12, fontWeight: '700' },
  miniCardBrand: { color: '#002b73', fontSize: 15, fontWeight: '900', fontStyle: 'italic' },
  miniSaldo: { color: 'rgba(0,43,115,0.6)', fontSize: 11 },
  miniBalance: { color: '#002b73', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  miniCuenta: { color: 'rgba(0,43,115,0.65)', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 },
  accionesRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  accionItem: { flex: 1, borderRadius: 10, padding: 10, borderWidth: 1, alignItems: 'center', gap: 4 },
  accionIcon: { fontSize: 20 },
  accionLabel: { fontSize: 11, fontWeight: '600' },
  modalSimulado: { borderRadius: 16, padding: 14, gap: 8, borderWidth: 0.5 },
  modalSimuladoTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  inputLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputFake: { borderRadius: 10, padding: 12, borderWidth: 0.5, marginBottom: 4 },
  inputFakeVal: { fontSize: 15 },
  previewMailes: { borderRadius: 8, padding: 9, alignItems: 'center' },
  previewMailesText: { fontSize: 13, fontWeight: '700' },
  btnSimulado: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnSimuladoText: { fontWeight: '800', fontSize: 14 },

  // Paso 2
  mailesContainer: { borderRadius: 16, borderWidth: 1, padding: 18, alignItems: 'center', gap: 4 },
  mailesGanIcon: { fontSize: 40 },
  mailesGanNum: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  mailesGanLabel: { fontSize: 14, fontWeight: '700' },
  detalleBox: { borderRadius: 12, borderWidth: 0.5, overflow: 'hidden' },
  detalleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  detalleKey: { fontSize: 13 },
  detalleVal: { fontSize: 14, fontWeight: '700' },
  infoBox: { borderRadius: 10, padding: 12, borderWidth: 0.5 },
  infoText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },

  // Paso 3
  cromosGanados: { fontSize: 13, textAlign: 'center' },
  cromoCard: { width: 140, aspectRatio: 3/4, borderRadius: 14, borderWidth: 2, overflow: 'hidden', alignSelf: 'center', position: 'relative' },
  cromoImg: { width: '100%', height: '100%' },
  cromoRarezaBadge: { position: 'absolute', bottom: 22, left: 4, right: 4, paddingVertical: 3, borderRadius: 5, alignItems: 'center' },
  cromoRarezaText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  cromoNombre: { position: 'absolute', bottom: 4, left: 4, right: 4, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  rarezaRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  rarezaItem: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', borderWidth: 0.5 },
  rarezaLabel: { fontSize: 12, fontWeight: '700' },
  rarezaPct: { fontSize: 11, marginTop: 1 },

  // Paso 4
  albumProgress: { borderRadius: 12, padding: 14, gap: 8, borderWidth: 0.5 },
  albumProgressHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  albumNum: { fontSize: 30, fontWeight: '800' },
  albumTotal: { fontSize: 14 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  albumSub: { fontSize: 12 },
  albumGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  albumCromoCard: { width: 45, aspectRatio: 3/4, borderRadius: 7, borderWidth: 1.5, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  albumCromoImg: { width: '100%', height: '100%' },
  albumCromoBadge: { position: 'absolute', bottom: 1, left: 1, right: 1, paddingVertical: 1, borderRadius: 3, alignItems: 'center' },
  albumCromoBadgeText: { fontSize: 7, fontWeight: '800' },
  albumCromoLocked: { opacity: 0.3 },
  albumLockText: { fontSize: 14, fontWeight: '800' },
  premioBox: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 14 },
  premioIcon: { fontSize: 28 },
  premioInfo: { flex: 1 },
  premioTitulo: { fontSize: 14, fontWeight: '800' },
  premioDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },

  // Paso 5
  partidoCard: { borderRadius: 14, padding: 14, borderWidth: 0.5, gap: 10 },
  countdownChip: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 0.5 },
  countdownText: { fontSize: 11, fontWeight: '700' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  teamCol: { alignItems: 'center', gap: 6 },
  flagCircle: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  flagEmoji: { fontSize: 34 },
  teamName: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  teamRanking: { fontSize: 11 },
  vsText: { fontSize: 14, fontWeight: '700' },
  stepperCard: { borderRadius: 12, padding: 12, borderWidth: 0.5, gap: 8 },
  stepperTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  steppersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  stepperCol: { alignItems: 'center', gap: 6 },
  stepperFlag: { fontSize: 26 },
  stepperBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 6 },
  stepperBtn2: { fontSize: 22, fontWeight: '700', paddingHorizontal: 8 },
  stepperValue: { fontSize: 24, fontWeight: '800', width: 34, textAlign: 'center' },
  stepperDash: { fontSize: 20, fontWeight: '200' },
  rewardsCard: { borderRadius: 10, borderWidth: 0.5, overflow: 'hidden' },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 11 },
  rewardLabel: { fontSize: 13 },
  rewardVal: { fontSize: 13, fontWeight: '700' },

  // Paso 6 - chatbot
  chatbotDemo: { borderRadius: 14, padding: 14, borderWidth: 0.5, gap: 10 },
  chatMsgBot: { flexDirection: 'row', justifyContent: 'flex-start' },
  chatMsgUser: { flexDirection: 'row', justifyContent: 'flex-end' },
  chatBubbleBot: { borderRadius: 14, borderBottomLeftRadius: 4, padding: 12, maxWidth: '85%' },
  chatBubbleUser: { borderRadius: 14, borderBottomRightRadius: 4, padding: 12, maxWidth: '85%' },
  chatBubbleText: { fontSize: 14, lineHeight: 20 },
  fabRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  fabDesc: { fontSize: 14 },
  fabSimulado: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  fabEmoji: { fontSize: 26 },

  // Paso 7 - grupos
  grupoOpciones: { gap: 8 },
  grupoOpcion: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, borderWidth: 0.5 },
  grupoOpcionIcon: { fontSize: 24 },
  grupoOpcionInfo: { flex: 1 },
  grupoOpcionLabel: { fontSize: 14, fontWeight: '700' },
  grupoOpcionSub: { fontSize: 12, marginTop: 2 },
  votacionCard: { borderRadius: 12, padding: 14, borderWidth: 0.5, gap: 8 },
  votacionTitle: { fontSize: 14, fontWeight: '700' },
  votacionDesc: { fontSize: 12, lineHeight: 18 },
  votacionBtns: { flexDirection: 'row', gap: 10 },
  votaBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  votaBtnText: { fontSize: 13, fontWeight: '700' },

  // Paso 8 - premios
  premioFinalCard: { borderRadius: 16, padding: 20, borderWidth: 0.5, alignItems: 'center', gap: 10 },
  premioFinalEmoji: { fontSize: 56 },
  premioFinalTitulo: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  premioFinalDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Navegación
  navRow: { flexDirection: 'row', gap: 10, marginBottom: 8, marginTop: 8 },
  btnAnterior: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 0.5 },
  btnAnteriorText: { fontSize: 15, fontWeight: '600' },
  btnSiguiente: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnSiguienteText: { fontWeight: '800', fontSize: 16 },
  contador: { fontSize: 12, textAlign: 'center' },
});