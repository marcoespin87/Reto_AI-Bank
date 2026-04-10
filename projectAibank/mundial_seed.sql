-- ============================================================
-- MUNDIAL 2026 — Schema upgrade + seed data
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- IMPORTANTE: en Supabase Dashboard → Settings → API → "Extra schemas"
-- añade "mundial" para que el cliente JS pueda usar .schema('mundial')

-- ============================================================
-- PASO 1: Ampliar tablas existentes
-- ============================================================

ALTER TABLE mundial.equipos_mundial
  ADD COLUMN IF NOT EXISTS codigo_iso   VARCHAR(10),      -- "ec", "es" → flagcdn.com
  ADD COLUMN IF NOT EXISTS ranking_fifa INTEGER DEFAULT 99;

ALTER TABLE mundial.partidos_mundial
  ADD COLUMN IF NOT EXISTS semana              INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS jornada             VARCHAR(50),
  ADD COLUMN IF NOT EXISTS cierre_prediccion   VARCHAR(50) DEFAULT 'Abierto',
  ADD COLUMN IF NOT EXISTS recompensa_exacto   INTEGER DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS recompensa_ganador  INTEGER DEFAULT 300,
  ADD COLUMN IF NOT EXISTS recompensa_racha    INTEGER DEFAULT 200;

-- ============================================================
-- PASO 2: Crear tablas nuevas
-- ============================================================

CREATE TABLE IF NOT EXISTS mundial.stats_partido (
  id                    SERIAL PRIMARY KEY,
  partido_id            INTEGER NOT NULL REFERENCES mundial.partidos_mundial(id) ON DELETE CASCADE,
  equipo_id             INTEGER NOT NULL REFERENCES mundial.equipos_mundial(id),
  goles_anotados        INTEGER  DEFAULT 0,
  goles_recibidos       INTEGER  DEFAULT 0,
  forma                 TEXT[]   DEFAULT '{}',
  racha_texto           VARCHAR(100) DEFAULT '',
  jugador_clave_nombre  VARCHAR(100) DEFAULT '',
  jugador_clave_stats   VARCHAR(200) DEFAULT '',
  UNIQUE(partido_id, equipo_id)
);

CREATE TABLE IF NOT EXISTS mundial.h2h (
  id           SERIAL PRIMARY KEY,
  equipo_a_id  INTEGER NOT NULL REFERENCES mundial.equipos_mundial(id),
  equipo_b_id  INTEGER NOT NULL REFERENCES mundial.equipos_mundial(id),
  ganados_a    INTEGER DEFAULT 0,
  empates      INTEGER DEFAULT 0,
  ganados_b    INTEGER DEFAULT 0
);

-- ============================================================
-- PASO 3: Permisos (anon key necesita leer, authenticated insertar predicciones)
-- ============================================================

GRANT USAGE ON SCHEMA mundial TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA mundial TO anon, authenticated;
GRANT INSERT, UPDATE ON mundial.predicciones_mundial TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA mundial TO authenticated;

-- ============================================================
-- PASO 4: Datos de referencia — Fases
-- ============================================================

INSERT INTO mundial.fases_mundial (nombre, tipo) VALUES
  ('Fase de Grupos',    'grupos'),
  ('Octavos de Final',  'eliminacion'),
  ('Cuartos de Final',  'eliminacion'),
  ('Semifinal',         'eliminacion'),
  ('Final',             'eliminacion')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASO 5: Estadios
-- ============================================================

INSERT INTO mundial.estadios_mundial (nombre, ciudad, pais_anfitrion, capacidad) VALUES
  ('Estadio AT&T',    'Dallas',        'USA', 80000),
  ('SoFi Stadium',    'Los Ángeles',   'USA', 70240),
  ('MetLife Stadium', 'New Jersey',    'USA', 82500),
  ('Rose Bowl',       'Los Ángeles',   'USA', 90888),
  ('Levi''s Stadium', 'San Francisco', 'USA', 68500)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASO 6: Equipos (9 selecciones con ISO y ranking FIFA)
-- ============================================================

INSERT INTO mundial.equipos_mundial (nombre, codigo_fifa, confederacion, codigo_iso, ranking_fifa) VALUES
  ('Ecuador',        'ECU', 'CONMEBOL', 'ec', 41),
  ('Costa de Marfil','CIV', 'CAF',      'ci', 52),
  ('España',         'ESP', 'UEFA',     'es',  8),
  ('Croacia',        'CRO', 'UEFA',     'hr', 14),
  ('Brasil',         'BRA', 'CONMEBOL', 'br',  5),
  ('México',         'MEX', 'CONCACAF', 'mx', 15),
  ('Argentina',      'ARG', 'CONMEBOL', 'ar',  1),
  ('Arabia Saudí',   'KSA', 'AFC',      'sa', 56),
  ('Japón',          'JPN', 'AFC',      'jp', 18)
ON CONFLICT (codigo_fifa) DO UPDATE SET
  codigo_iso   = EXCLUDED.codigo_iso,
  ranking_fifa = EXCLUDED.ranking_fifa;

-- ============================================================
-- PASO 7: Partidos (5 partidos — 4 en semana 1, 1 en semana 2)
-- ============================================================

INSERT INTO mundial.partidos_mundial
  (equipo_local_id, equipo_visitante_id, fase_id, estadio_id,
   fecha_hora, semana, jornada, cierre_prediccion,
   recompensa_exacto, recompensa_ganador, recompensa_racha, estado)
VALUES
  -- Partido 1: Ecuador vs Costa de Marfil (Semana 1)
  (
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'ECU'),
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'CIV'),
    (SELECT id FROM mundial.fases_mundial    WHERE tipo = 'grupos' LIMIT 1),
    (SELECT id FROM mundial.estadios_mundial WHERE ciudad = 'Dallas'),
    '2026-06-15 18:00:00-06', 1, 'Jornada 1', '2h 48m', 1000, 300, 200, 'programado'
  ),
  -- Partido 2: España vs Croacia (Semana 1)
  (
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'ESP'),
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'CRO'),
    (SELECT id FROM mundial.fases_mundial    WHERE tipo = 'grupos' LIMIT 1),
    (SELECT id FROM mundial.estadios_mundial WHERE nombre = 'SoFi Stadium'),
    '2026-06-13 21:00:00-07', 1, 'Jornada 1', 'Abierto', 1000, 300, 200, 'programado'
  ),
  -- Partido 3: Brasil vs México (Semana 1)
  (
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'BRA'),
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'MEX'),
    (SELECT id FROM mundial.fases_mundial    WHERE tipo = 'grupos' LIMIT 1),
    (SELECT id FROM mundial.estadios_mundial WHERE nombre = 'MetLife Stadium'),
    '2026-06-17 19:00:00-04', 1, 'Jornada 1', 'Abierto', 1000, 300, 200, 'programado'
  ),
  -- Partido 4: Argentina vs Arabia Saudí (Semana 1)
  (
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'ARG'),
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'KSA'),
    (SELECT id FROM mundial.fases_mundial    WHERE tipo = 'grupos' LIMIT 1),
    (SELECT id FROM mundial.estadios_mundial WHERE nombre = 'Rose Bowl'),
    '2026-06-14 20:00:00-07', 1, 'Jornada 1', 'Abierto', 1000, 300, 200, 'programado'
  ),
  -- Partido 5: Ecuador vs Japón (Semana 2)
  (
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'ECU'),
    (SELECT id FROM mundial.equipos_mundial  WHERE codigo_fifa = 'JPN'),
    (SELECT id FROM mundial.fases_mundial    WHERE tipo = 'grupos' LIMIT 1),
    (SELECT id FROM mundial.estadios_mundial WHERE nombre = 'Levi''s Stadium'),
    '2026-06-19 17:00:00-07', 2, 'Jornada 2', 'Abierto', 1000, 300, 200, 'programado'
  );

-- ============================================================
-- PASO 8: Stats por equipo por partido
-- ============================================================

-- Partido 1: Ecuador vs Costa de Marfil
INSERT INTO mundial.stats_partido
  (partido_id, equipo_id, goles_anotados, goles_recibidos, forma, racha_texto, jugador_clave_nombre, jugador_clave_stats)
VALUES
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CIV')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU'),
    4, 3, ARRAY['G','G','E','G','P'], 'En racha', 'Enner Valencia', '5 goles mundialistas'
  ),
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CIV')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CIV'),
    3, 2, ARRAY['G','E','G','G','P'], 'Irregular', 'Sébastien Haller', '2 goles · 1 asistencia'
  );

-- Partido 2: España vs Croacia
INSERT INTO mundial.stats_partido
  (partido_id, equipo_id, goles_anotados, goles_recibidos, forma, racha_texto, jugador_clave_nombre, jugador_clave_stats)
VALUES
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ESP')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CRO')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ESP'),
    12, 3, ARRAY['G','G','G','E','G'], 'Dominante', 'Pedri', '8 goles en temporada 2025'
  ),
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ESP')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CRO')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CRO'),
    7, 5, ARRAY['G','P','G','G','E'], 'Sólida', 'Luka Modric', '40 años, aún manda'
  );

-- Partido 3: Brasil vs México
INSERT INTO mundial.stats_partido
  (partido_id, equipo_id, goles_anotados, goles_recibidos, forma, racha_texto, jugador_clave_nombre, jugador_clave_stats)
VALUES
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'BRA')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'MEX')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'BRA'),
    15, 6, ARRAY['G','G','G','G','E'], 'Imparable', 'Vinicius Jr.', '12 goles en temporada 2025'
  ),
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'BRA')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'MEX')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'MEX'),
    8, 7, ARRAY['G','E','P','G','G'], 'Irregular', 'Hirving Lozano', '3 goles · 4 asistencias'
  );

-- Partido 4: Argentina vs Arabia Saudí
INSERT INTO mundial.stats_partido
  (partido_id, equipo_id, goles_anotados, goles_recibidos, forma, racha_texto, jugador_clave_nombre, jugador_clave_stats)
VALUES
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ARG')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'KSA')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ARG'),
    18, 4, ARRAY['G','G','G','G','G'], 'Invicta', 'Lionel Messi', '5 goles en eliminatorias'
  ),
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ARG')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'KSA')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'KSA'),
    5, 8, ARRAY['P','G','E','P','G'], 'Irregular', 'Salem Al-Dawsari', 'Héroe en Qatar 2022'
  );

-- Partido 5: Ecuador vs Japón
INSERT INTO mundial.stats_partido
  (partido_id, equipo_id, goles_anotados, goles_recibidos, forma, racha_texto, jugador_clave_nombre, jugador_clave_stats)
VALUES
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'JPN')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU'),
    4, 3, ARRAY['G','G','E','G','P'], 'En racha', 'Moisés Caicedo', '3 goles · 5 asistencias'
  ),
  (
    (SELECT id FROM mundial.partidos_mundial
     WHERE equipo_local_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU')
       AND equipo_visitante_id = (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'JPN')),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'JPN'),
    9, 4, ARRAY['G','G','G','E','G'], 'Agresiva', 'Kaoru Mitoma', '7 goles en Premier 2025'
  );

-- ============================================================
-- PASO 9: Historial H2H (perspectiva del equipo local)
-- ============================================================

INSERT INTO mundial.h2h (equipo_a_id, equipo_b_id, ganados_a, empates, ganados_b) VALUES
  -- Ecuador vs CIV: ECU ganó 3, 2 empates, CIV ganó 4
  (
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU'),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CIV'),
    3, 2, 4
  ),
  -- España vs Croacia
  (
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ESP'),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'CRO'),
    5, 3, 2
  ),
  -- Brasil vs México
  (
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'BRA'),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'MEX'),
    8, 4, 3
  ),
  -- Argentina vs Arabia Saudí
  (
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ARG'),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'KSA'),
    6, 1, 1
  ),
  -- Ecuador vs Japón
  (
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'ECU'),
    (SELECT id FROM mundial.equipos_mundial WHERE codigo_fifa = 'JPN'),
    2, 1, 3
  );
