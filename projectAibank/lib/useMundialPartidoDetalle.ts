import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  FormaResult,
  H2HData,
  PartidoDetalle,
  PrediccionUsuario,
} from './useMundialPartidos';

export function useMundialPartidoDetalle(
  partidoId: number | null,
  userId: number | null,
) {
  const [partido, setPartido] = useState<PartidoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (partidoId == null) return;
    fetchPartido();
  }, [partidoId, userId]);

  async function fetchPartido() {
    if (partidoId == null) return;
    setLoading(true);
    try {
      const { data: p, error } = await (supabase as any)
        .schema('mundial')
        .from('partidos_mundial')
        .select(
          `
          id, semana, jornada, fecha_hora, estado, goles_local, goles_visitante,
          recompensa_exacto, recompensa_ganador, recompensa_racha,
          equipo_local:equipos_mundial!equipo_local_id(id, nombre, codigo_iso, codigo_fifa, ranking_fifa),
          equipo_visitante:equipos_mundial!equipo_visitante_id(id, nombre, codigo_iso, codigo_fifa, ranking_fifa),
          fase:fases_mundial(nombre),
          estadio:estadios_mundial(nombre, ciudad),
          stats_partido(equipo_id, goles_anotados, goles_recibidos, forma, racha_texto, jugador_clave_nombre, jugador_clave_stats)
        `,
        )
        .eq('id', partidoId)
        .single();

      if (error) throw error;
      if (!p) {
        setPartido(null);
        return;
      }

      // Predicción del usuario para este partido
      let prediccionUsuario: PrediccionUsuario | null = null;
      if (userId) {
        const { data: pred } = await (supabase as any)
          .schema('mundial')
          .from('predicciones_mundial')
          .select('goles_local_predichos, goles_visitante_predichos')
          .eq('user_id', userId)
          .eq('partido_id', partidoId)
          .maybeSingle();

        if (pred) {
          prediccionUsuario = {
            goles_local: pred.goles_local_predichos,
            goles_visitante: pred.goles_visitante_predichos,
          };
        }
      }

      // H2H
      let h2h: H2HData | null = null;
      const localId = p.equipo_local?.id;
      const visitanteId = p.equipo_visitante?.id;

      if (localId && visitanteId) {
        const { data: h2hAB } = await (supabase as any)
          .schema('mundial')
          .from('h2h')
          .select('ganados_a, empates, ganados_b')
          .eq('equipo_a_id', localId)
          .eq('equipo_b_id', visitanteId)
          .maybeSingle();

        if (h2hAB) {
          h2h = { ganados_a: h2hAB.ganados_a, empates: h2hAB.empates, ganados_b: h2hAB.ganados_b };
        } else {
          const { data: h2hBA } = await (supabase as any)
            .schema('mundial')
            .from('h2h')
            .select('ganados_a, empates, ganados_b')
            .eq('equipo_a_id', visitanteId)
            .eq('equipo_b_id', localId)
            .maybeSingle();

          if (h2hBA) {
            h2h = { ganados_a: h2hBA.ganados_b, empates: h2hBA.empates, ganados_b: h2hBA.ganados_a };
          }
        }
      }

      const statsArr: any[] = p.stats_partido ?? [];
      const sl = statsArr.find((s: any) => s.equipo_id === localId);
      const sv = statsArr.find((s: any) => s.equipo_id === visitanteId);

      setPartido({
        id: p.id,
        semana: p.semana ?? 1,
        jornada: p.jornada ?? 'Jornada 1',
        fecha_hora: p.fecha_hora,
        cierre_prediccion: 'Abierto',
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
        prediccion_usuario: prediccionUsuario,
      });
    } catch {
      setPartido(null);
    } finally {
      setLoading(false);
    }
  }

  return { partido, loading, refetch: fetchPartido };
}
