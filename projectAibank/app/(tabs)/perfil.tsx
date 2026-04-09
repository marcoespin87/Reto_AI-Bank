import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';
import { useTutorial } from '../../hooks/useTutorial';

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
  const [cromosObtenidos, setCromosObtenidos] = useState(0);
  const [medallaActual, setMedallaActual] = useState(1);
  const [estrellasActuales, setEstrellasActuales] = useState(0);
  const [medallaNombre, setMedallaNombre] = useState('');
  const [comprasUmbral, setComprasUmbral] = useState(5);
  const [ligaNombre, setLigaNombre] = useState('');
  const [todasLigas, setTodasLigas] = useState<any[]>([]);
  const [posicionEnLiga, setPosicionEnLiga] = useState<number | null>(null);

  // Estado UI
  const [refreshing, setRefreshing] = useState(false);

  // Animación
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // Reiniciar tutorial
  const { resetear, setMostrarMenu } = useTutorial();

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

      const [predResult, stickersResult, memberResult, ligasResult] = await Promise.all([
        supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('user_id', userData.id),
        supabase.from('user_stickers').select('sticker_id').eq('user_id', userData.id),
        supabase
          .from('group_members')
          .select('medalla_actual, estrellas_actuales, group_id, groups(liga_id)')
          .eq('user_id', userData.id)
          .eq('estado', 'activo')
          .maybeSingle(),
        supabase.from('ligas').select('*').order('id', { ascending: true }),
      ]);

      setPredicciones(predResult.count || 0);
      if (ligasResult.data) setTodasLigas(ligasResult.data);

      // Cromos únicos obtenidos
      if (stickersResult.data) {
        const uniqueIds = new Set(stickersResult.data.map((s: any) => s.sticker_id));
        setCromosObtenidos(uniqueIds.size);
      }

      const memberData = memberResult.data;
      if (memberData) {
        const medallaNum = memberData.medalla_actual ?? 1;
        const estrellasNum = memberData.estrellas_actuales ?? 0;
        setMedallaActual(medallaNum);
        setEstrellasActuales(estrellasNum);

        const grupo = memberData.groups as any;
        if (grupo?.liga_id) {
          const [{ data: medalData }, { data: ligaData }, { data: todosGrupos }] = await Promise.all([
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
            supabase
              .from('groups')
              .select('id, group_members!inner(estado, users(mailes_acumulados))')
              .eq('liga_id', grupo.liga_id),
          ]);

          if (medalData) {
            setMedallaNombre(medalData.nombre_medalla ?? '');
            setComprasUmbral(medalData.umbral_compras_por_estrella ?? 5);
          }
          if (ligaData) {
            setLigaNombre((ligaData as any).nombre ?? '');
          }
          if (todosGrupos && todosGrupos.length > 0) {
            const ranking = todosGrupos
              .map((g: any) => {
                const activos = g.group_members?.filter((m: any) => m.estado === 'activo') || [];
                const total = activos.reduce((sum: number, m: any) =>
                  sum + (m.users?.mailes_acumulados || 0), 0);
                return { id: g.id, total };
              })
              .sort((a: any, b: any) => b.total - a.total);
            const pos = ranking.findIndex((g: any) => g.id === memberData.group_id) + 1;
            setPosicionEnLiga(pos > 0 ? pos : null);
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

  async function handleAbrirMenuTutorial() {
    //await resetear();
    setMostrarMenu(true);
    router.replace('/(tabs)');
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
      cromosObtenidos={cromosObtenidos}
      medallaActual={medallaActual}
      estrellasActuales={estrellasActuales}
      medallaNombre={medallaNombre}
      ligaNombre={ligaNombre}
      comprasUmbral={comprasUmbral}
      todasLigas={todasLigas}
      posicionEnLiga={posicionEnLiga}
      refreshing={refreshing}
      rotateAnim={rotateAnim}
      theme={theme}
      onRefresh={onRefresh}
      onAbrirMenuTutorial={handleAbrirMenuTutorial}
      handleLogout={handleLogout}
      handleToggleTheme={handleToggleTheme}
    />
  );
}
