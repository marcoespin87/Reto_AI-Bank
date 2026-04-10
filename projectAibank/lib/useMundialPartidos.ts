import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type FormaResult = 'G' | 'E' | 'P';

export interface EquipoMundial {
  id: number;
  nombre: string;
  codigo_iso: string;
  codigo_fifa: string;
  ranking_fifa: number;
}

export interface StatsPartido {
  goles_anotados: number;
  goles_recibidos: number;
  forma: FormaResult[];
  racha_texto: string;
  jugador_clave_nombre: string;
  jugador_clave_stats: string;
}

export interface H2HData {
  ganados_a: number;
  empates: number;
  ganados_b: number;
}

export interface PrediccionUsuario {
  goles_local: number;
  goles_visitante: number;
}

export interface PartidoDetalle {
  id: number;
  semana: number;
  jornada: string;
  fecha_hora: string;
  cierre_prediccion: string;
  estado: string;
  recompensa_exacto: number;
  recompensa_ganador: number;
  recompensa_racha: number;
  equipo_local: EquipoMundial;
  equipo_visitante: EquipoMundial;
  fase: { nombre: string } | null;
  estadio: { nombre: string; ciudad: string } | null;
  stats_local: StatsPartido | null;
  stats_visitante: StatsPartido | null;
  h2h: H2HData | null;
  prediccion_usuario: PrediccionUsuario | null;
}

export function useMundialPartidos(semana: number, userId: number | null) {
  const [partidos, setPartidos] = useState<PartidoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartidos();
  }, [semana, userId]);

  async function fetchPartidos() {
    setLoading(true);
    setError(null);
    try {
      // Fetch partidos con joins anidados
      const { data: rawPartidos, error: pErr } = await (supabase as any)
        .schema('mundial')
        .from('partidos_mundial')
        .select(`
          id, semana, jornada, fecha_hora, cierre_prediccion, estado,
          recompensa_exacto, recompensa_ganador, recompensa_racha,
          equipo_local:equipos_mundial!equipo_local_id(id, nombre, codigo_iso, codigo_fifa, ranking_fifa),
          equipo_visitante:equipos_mundial!equipo_visitante_id(id, nombre, codigo_iso, codigo_fifa, ranking_fifa),
          fase:fases_mundial(nombre),
          estadio:estadios_mundial(nombre, ciudad),
          stats_partido(equipo_id, goles_anotados, goles_recibidos, forma, racha_texto, jugador_clave_nombre, jugador_clave_stats)
        `)
        .eq('semana', semana)
        .order('fecha_hora');

      if (pErr) throw pErr;
      if (!rawPartidos || rawPartidos.length === 0) {
        setPartidos([]);
        return;
      }

      // Predicciones del usuario para estos partidos
      const prediccionesMap: Record<number, PrediccionUsuario> = {};
      if (userId) {
        const ids = rawPartidos.map((p: any) => p.id);
        const { data: preds } = await (supabase as any)
          .schema('mundial')
          .from('predicciones_mundial')
          .select('partido_id, goles_local_predichos, goles_visitante_predichos')
          .eq('user_id', userId)
          .in('partido_id', ids);

        if (preds) {
          for (const pred of preds) {
            prediccionesMap[pred.partido_id] = {
              goles_local: pred.goles_local_predichos,
              goles_visitante: pred.goles_visitante_predichos,
            };
          }
        }
      }

      // H2H para todos los pares de equipos
      const h2hMap: Record<string, H2HData> = {};
      const aIds = rawPartidos.map((p: any) => p.equipo_local.id);
      const bIds = rawPartidos.map((p: any) => p.equipo_visitante.id);
      const allIds = [...new Set([...aIds, ...bIds])];

      const { data: h2hRows } = await (supabase as any)
        .schema('mundial')
        .from('h2h')
        .select('equipo_a_id, equipo_b_id, ganados_a, empates, ganados_b')
        .in('equipo_a_id', allIds);

      if (h2hRows) {
        for (const h of h2hRows) {
          h2hMap[`${h.equipo_a_id}-${h.equipo_b_id}`] = {
            ganados_a: h.ganados_a,
            empates: h.empates,
            ganados_b: h.ganados_b,
          };
        }
      }

      // Ensamblar resultado final
      const result: PartidoDetalle[] = rawPartidos.map((p: any) => {
        const statsArr: any[] = p.stats_partido ?? [];
        const sl = statsArr.find((s) => s.equipo_id === p.equipo_local.id);
        const sv = statsArr.find((s) => s.equipo_id === p.equipo_visitante.id);

        const keyAB = `${p.equipo_local.id}-${p.equipo_visitante.id}`;
        const keyBA = `${p.equipo_visitante.id}-${p.equipo_local.id}`;
        let h2h: H2HData | null = h2hMap[keyAB] ?? null;
        if (!h2h && h2hMap[keyBA]) {
          const r = h2hMap[keyBA];
          h2h = { ganados_a: r.ganados_b, empates: r.empates, ganados_b: r.ganados_a };
        }

        return {
          id: p.id,
          semana: p.semana ?? semana,
          jornada: p.jornada ?? 'Jornada 1',
          fecha_hora: p.fecha_hora,
          cierre_prediccion: p.cierre_prediccion ?? 'Abierto',
          estado: p.estado ?? 'programado',
          recompensa_exacto: p.recompensa_exacto ?? 1000,
          recompensa_ganador: p.recompensa_ganador ?? 300,
          recompensa_racha: p.recompensa_racha ?? 200,
          equipo_local: p.equipo_local,
          equipo_visitante: p.equipo_visitante,
          fase: p.fase ?? null,
          estadio: p.estadio ?? null,
          stats_local: sl
            ? {
                goles_anotados: sl.goles_anotados,
                goles_recibidos: sl.goles_recibidos,
                forma: (sl.forma ?? []) as FormaResult[],
                racha_texto: sl.racha_texto ?? '',
                jugador_clave_nombre: sl.jugador_clave_nombre ?? '',
                jugador_clave_stats: sl.jugador_clave_stats ?? '',
              }
            : null,
          stats_visitante: sv
            ? {
                goles_anotados: sv.goles_anotados,
                goles_recibidos: sv.goles_recibidos,
                forma: (sv.forma ?? []) as FormaResult[],
                racha_texto: sv.racha_texto ?? '',
                jugador_clave_nombre: sv.jugador_clave_nombre ?? '',
                jugador_clave_stats: sv.jugador_clave_stats ?? '',
              }
            : null,
          h2h,
          prediccion_usuario: prediccionesMap[p.id] ?? null,
        };
      });

      setPartidos(result);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando partidos');
    } finally {
      setLoading(false);
    }
  }

  return { partidos, loading, error, refetch: fetchPartidos };
}
