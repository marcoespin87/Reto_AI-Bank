import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/** Retorna la lista de semanas disponibles en la DB (ej: [1, 2, 3]). */
export function useMundialSemanas() {
  const [semanas, setSemanas] = useState<number[]>([1]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSemanas();
  }, []);

  async function fetchSemanas() {
    try {
      const { data, error } = await (supabase as any)
        .schema('mundial')
        .from('partidos_mundial')
        .select('semana')
        .order('semana');

      if (error) throw error;

      if (data && data.length > 0) {
        // Deduplicar y ordenar
        const unique = [...new Set<number>(data.map((r: any) => r.semana as number))].sort(
          (a, b) => a - b,
        );
        setSemanas(unique);
      }
    } catch {
      // Si falla, dejamos [1] como fallback
      setSemanas([1]);
    } finally {
      setLoading(false);
    }
  }

  return { semanas, loading };
}
