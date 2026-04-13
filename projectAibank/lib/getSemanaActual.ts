/** Fecha de inicio del Mundial 2026 (11 de junio, hora central USA) */
const MUNDIAL_INICIO = new Date('2026-06-11T00:00:00-05:00');

/** Retorna el número de semana actual del Mundial 2026. */
export function getSemanaActual(): number {
  const ahora = new Date();
  if (ahora < MUNDIAL_INICIO) return 1; // Antes del torneo → semana 1 (predicciones abiertas)
  const diasTranscurridos = Math.floor(
    (ahora.getTime() - MUNDIAL_INICIO.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(1, Math.floor(diasTranscurridos / 7) + 1);
}

/** Retorna true si el usuario puede predecir este partido. */
export function puedePredicir(
  fechaHoraPartido: string,
  semanaPartido: number,
  semanaActual: number,
): boolean {
  if (semanaPartido !== semanaActual) return false;
  const diff = new Date(fechaHoraPartido).getTime() - Date.now();
  return diff > 24 * 60 * 60 * 1000; // más de 24h
}

/** Formatea el tiempo restante hasta el partido como string legible. */
export function formatCountdown(fechaHoraPartido: string): {
  texto: string;
  critico: boolean;
} {
  const diff = new Date(fechaHoraPartido).getTime() - Date.now();

  if (diff <= 0) {
    return { texto: 'En curso / Finalizado', critico: true };
  }

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diff % (1000 * 60)) / 1000);

  const critico = diff < 24 * 60 * 60 * 1000;

  let texto: string;
  if (dias > 0) texto = `${dias}d ${horas}h ${minutos}m`;
  else if (horas > 0) texto = `${horas}h ${minutos}m`;
  else texto = `${minutos}m ${segundos}s`;

  return { texto, critico };
}
