import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface LigaMedalData {
  ligaNombre: string;
  medallaNombre: string;
  medallaActual: number;
}

/**
 * Hook compartido que obtiene la liga y medalla activa del usuario autenticado.
 * Úsalo en pantallas que no cargan membership data por su cuenta.
 */
export function useLigaMedal(): LigaMedalData {
  const [ligaNombre, setLigaNombre] = useState('');
  const [medallaNombre, setMedallaNombre] = useState('');
  const [medallaActual, setMedallaActual] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      if (!userData || cancelled) return;

      const { data: memberData } = await supabase
        .from('group_members')
        .select('medalla_actual, groups(liga_id)')
        .eq('user_id', userData.id)
        .eq('estado', 'activo')
        .maybeSingle();
      if (!memberData || cancelled) return;

      const medallaNum = memberData.medalla_actual ?? 1;
      const grupo = memberData.groups as any;
      if (!grupo?.liga_id) {
        if (!cancelled) setMedallaActual(medallaNum);
        return;
      }

      const [{ data: ligaData }, { data: medalData }] = await Promise.all([
        supabase.from('ligas').select('nombre').eq('id', grupo.liga_id).maybeSingle(),
        supabase.from('liga_medals').select('nombre_medalla').eq('liga_id', grupo.liga_id).eq('numero_medalla', medallaNum).maybeSingle(),
      ]);

      if (cancelled) return;
      setMedallaActual(medallaNum);
      if (ligaData) setLigaNombre((ligaData as any).nombre ?? '');
      if (medalData) setMedallaNombre((medalData as any).nombre_medalla ?? '');
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { ligaNombre, medallaNombre, medallaActual };
}
