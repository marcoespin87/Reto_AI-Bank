import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import PerfilUI from '../../components/PerfilUI';

// ============================================
// LÓGICA FUNCIONAL
// ============================================

export default function PerfilScreen() {
  const { theme, toggleTheme } = useTheme();

  // Estado de usuario
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [mailes, setMailes] = useState(0);
  const [fechaRegistro, setFechaRegistro] = useState('');
  const [predicciones, setPredicciones] = useState(0);
  const [rachaMax, setRachaMax] = useState(0);
  const [medallaActual, setMedallaActual] = useState(1);
  const [estrellasActuales, setEstrellasActuales] = useState(0);
  const [medallaNombre, setMedallaNombre] = useState('');
  const [comprasUmbral, setComprasUmbral] = useState(5);
  const [ligaNombre, setLigaNombre] = useState('');

  // Estado UI
  const [refreshing, setRefreshing] = useState(false);
  const [beneficiosOpen, setBeneficiosOpen] = useState(true);

  // Animación
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // ============ Efectos ============
  useFocusEffect(useCallback(() => { loadData(); }, []));

  // ============ Handlers de Datos ============
  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id, nombre, email, mailes_acumulados, fecha_registro')
      .eq('email', user.email)
      .single();

    if (userData) {
      setUserName(userData.nombre || 'Usuario');
      setEmail(userData.email || '');
      setMailes(userData.mailes_acumulados || 0);
      setFechaRegistro(userData.fecha_registro || '');

      const { count: predCount } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id);

      setPredicciones(predCount || 0);

      const { data: memberData } = await supabase
        .from('group_members')
        .select('medalla_actual, estrellas_actuales, group_id, groups(liga_id)')
        .eq('user_id', userData.id)
        .eq('estado', 'activo')
        .maybeSingle();

      if (memberData) {
        const medallaNum = memberData.medalla_actual ?? 1;
        const estrellasNum = memberData.estrellas_actuales ?? 0;
        setMedallaActual(medallaNum);
        setEstrellasActuales(estrellasNum);
        setRachaMax(estrellasNum);

        const grupo = memberData.groups as any;
        if (grupo?.liga_id) {
          const [{ data: medalData }, { data: ligaData }] = await Promise.all([
            supabase
              .from('liga_medals')
              .select('nombre_medalla, umbral_compras_por_estrella')
              .eq('liga_id', grupo.liga_id)
              .eq('numero_medalla', medallaNum)
              .maybeSingle(),
            supabase
              .from('ligas')
              .select('nombre')
              .eq('id', grupo.liga_id)
              .maybeSingle(),
          ]);

          if (medalData) {
            setMedallaNombre(medalData.nombre_medalla ?? '');
            setComprasUmbral(medalData.umbral_compras_por_estrella ?? 5);
          }
          if (ligaData) {
            setLigaNombre((ligaData as any).nombre ?? '');
          }
        }
      }
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  function handleToggleTheme() {
    Animated.sequence([
      Animated.timing(rotateAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
    toggleTheme();
  }

  // ============ Renderizado Visual ============
  return (
    <PerfilUI
      userName={userName}
      email={email}
      mailes={mailes}
      fechaRegistro={fechaRegistro}
      predicciones={predicciones}
      rachaMax={rachaMax}
      medallaActual={medallaActual}
      estrellasActuales={estrellasActuales}
      medallaNombre={medallaNombre}
      ligaNombre={ligaNombre}
      comprasUmbral={comprasUmbral}
      refreshing={refreshing}
      beneficiosOpen={beneficiosOpen}
      setBeneficiosOpen={setBeneficiosOpen}
      rotateAnim={rotateAnim}
      theme={theme}
      onRefresh={onRefresh}
      handleLogout={handleLogout}
      handleToggleTheme={handleToggleTheme}
    />
  );
}
