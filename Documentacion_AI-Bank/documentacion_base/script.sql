-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.consumo (
  id_consumo integer NOT NULL DEFAULT nextval('consumo_id_consumo_seq'::regclass),
  descripcion text,
  monto numeric NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  diferido boolean NOT NULL DEFAULT false,
  id_producto_persona integer,
  ubicacion character varying,
  id_persona integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT consumo_pkey PRIMARY KEY (id_consumo),
  CONSTRAINT consumo_id_producto_persona_fkey FOREIGN KEY (id_producto_persona) REFERENCES public.productopersona(id_productos_persona),
  CONSTRAINT consumo_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona)
);

CREATE TABLE public.cromos (
  id_cromos integer NOT NULL DEFAULT nextval('cromos_id_cromos_seq'::regclass),
  nombre character varying NOT NULL,
  frecuencia USER-DEFINED NOT NULL DEFAULT 'comun'::frecuencia_cromo_enum,
  url_imagen text NOT NULL,
  id_pais integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cromos_pkey PRIMARY KEY (id_cromos),
  CONSTRAINT cromos_id_pais_fkey FOREIGN KEY (id_pais) REFERENCES public.paises(id_paises)
);

CREATE TABLE public.cromosperfil (
  id_cromos_perfil integer NOT NULL DEFAULT nextval('cromosperfil_id_cromos_perfil_seq'::regclass),
  id_perfil integer NOT NULL,
  id_cromo integer NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cromosperfil_pkey PRIMARY KEY (id_cromos_perfil),
  CONSTRAINT cromosperfil_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfil(id_perfil),
  CONSTRAINT cromosperfil_id_cromo_fkey FOREIGN KEY (id_cromo) REFERENCES public.cromos(id_cromos)
);

CREATE TABLE public.grupo (
  id_grupo integer NOT NULL DEFAULT nextval('grupo_id_grupo_seq'::regclass),
  nombre character varying NOT NULL,
  id_perfil integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT grupo_pkey PRIMARY KEY (id_grupo),
  CONSTRAINT grupo_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfil(id_perfil)
);

CREATE TABLE public.liga (
  id_liga integer NOT NULL DEFAULT nextval('liga_id_liga_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  rango_inicio integer NOT NULL CHECK (rango_inicio >= 0),
  rango_fin integer NOT NULL CHECK (rango_fin > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT liga_pkey PRIMARY KEY (id_liga)
);

CREATE TABLE public.logs_puntos (
  id_logs_puntos integer NOT NULL DEFAULT nextval('logs_puntos_id_logs_puntos_seq'::regclass),
  id_perfil integer NOT NULL,
  puntos integer NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  concepto character varying,
  CONSTRAINT logs_puntos_pkey PRIMARY KEY (id_logs_puntos),
  CONSTRAINT logs_puntos_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfil(id_perfil)
);

CREATE TABLE public.paises (
  id_paises integer NOT NULL DEFAULT nextval('paises_id_paises_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT paises_pkey PRIMARY KEY (id_paises)
);

CREATE TABLE public.partido (
  id_partido integer NOT NULL DEFAULT nextval('partido_id_partido_seq'::regclass),
  id_pais_local integer NOT NULL,
  id_pais_visitante integer NOT NULL,
  fecha timestamp with time zone NOT NULL,
  goles_local integer CHECK (goles_local >= 0),
  goles_visitante integer CHECK (goles_visitante >= 0),
  ganador USER-DEFINED,
  id_temporada integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT partido_pkey PRIMARY KEY (id_partido),
  CONSTRAINT partido_id_pais_local_fkey FOREIGN KEY (id_pais_local) REFERENCES public.paises(id_paises),
  CONSTRAINT partido_id_pais_visitante_fkey FOREIGN KEY (id_pais_visitante) REFERENCES public.paises(id_paises),
  CONSTRAINT partido_id_temporada_fkey FOREIGN KEY (id_temporada) REFERENCES public.temporada(id_temporada)
);

CREATE TABLE public.perfil (
  id_perfil integer NOT NULL DEFAULT nextval('perfil_id_perfil_seq'::regclass),
  id_persona integer NOT NULL UNIQUE,
  username character varying NOT NULL UNIQUE,
  fecha_inicio date NOT NULL DEFAULT CURRENT_DATE,
  millas numeric NOT NULL DEFAULT 0 CHECK (millas >= 0::numeric),
  id_liga integer,
  puntos integer NOT NULL DEFAULT 0 CHECK (puntos >= 0),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT perfil_pkey PRIMARY KEY (id_perfil),
  CONSTRAINT perfil_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona),
  CONSTRAINT perfil_id_liga_fkey FOREIGN KEY (id_liga) REFERENCES public.liga(id_liga)
);

CREATE TABLE public.perfilesliga (
  id_perfiles_liga integer NOT NULL DEFAULT nextval('perfilesliga_id_perfiles_liga_seq'::regclass),
  id_perfil integer NOT NULL,
  id_liga_nueva integer NOT NULL,
  id_liga_previa integer,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT perfilesliga_pkey PRIMARY KEY (id_perfiles_liga),
  CONSTRAINT perfilesliga_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfil(id_perfil),
  CONSTRAINT perfilesliga_id_liga_nueva_fkey FOREIGN KEY (id_liga_nueva) REFERENCES public.liga(id_liga),
  CONSTRAINT perfilesliga_id_liga_previa_fkey FOREIGN KEY (id_liga_previa) REFERENCES public.liga(id_liga)
);

CREATE TABLE public.persona (
  id_persona integer NOT NULL DEFAULT nextval('persona_id_persona_seq'::regclass),
  fecha_creacion date NOT NULL DEFAULT CURRENT_DATE,
  nombre character varying NOT NULL,
  nacimiento date,
  nacionalidad character varying,
  residencia character varying,
  numero_cuenta character varying UNIQUE,
  mail character varying UNIQUE,
  celular character varying,
  empresa character varying,
  cargo character varying,
  num_productos_bancarios integer NOT NULL DEFAULT 0 CHECK (num_productos_bancarios >= 0),
  score_crediticio numeric CHECK (score_crediticio >= 0::numeric AND score_crediticio <= 1000::numeric),
  tiene_credito_activo boolean NOT NULL DEFAULT false,
  tiene_cuenta_ahorro boolean NOT NULL DEFAULT false,
  meses_sin_mora integer NOT NULL DEFAULT 0 CHECK (meses_sin_mora >= 0),
  medalla_final character varying,
  estrellas_finales integer NOT NULL DEFAULT 0 CHECK (estrellas_finales >= 0),
  mailes_acumuladas numeric NOT NULL DEFAULT 0 CHECK (mailes_acumuladas >= 0::numeric),
  predicciones_correctas_pct numeric CHECK (predicciones_correctas_pct >= 0::numeric AND predicciones_correctas_pct <= 100::numeric),
  racha_maxima_predicciones integer NOT NULL DEFAULT 0 CHECK (racha_maxima_predicciones >= 0),
  cromos_coleccionados integer NOT NULL DEFAULT 0 CHECK (cromos_coleccionados >= 0),
  cromos_epicos_obtenidos integer NOT NULL DEFAULT 0 CHECK (cromos_epicos_obtenidos >= 0),
  objetivos_completados integer NOT NULL DEFAULT 0 CHECK (objetivos_completados >= 0),
  participo_en_grupo boolean NOT NULL DEFAULT false,
  rol_en_grupo USER-DEFINED,
  votos_emitidos integer NOT NULL DEFAULT 0 CHECK (votos_emitidos >= 0),
  dias_activo_temporada integer NOT NULL DEFAULT 0 CHECK (dias_activo_temporada >= 0),
  gasto_mensual_usd numeric NOT NULL DEFAULT 0,
  frecuencia_transacciones_mes integer NOT NULL DEFAULT 0 CHECK (frecuencia_transacciones_mes >= 0),
  antiguedad_clientes_meses integer NOT NULL DEFAULT 0 CHECK (antiguedad_clientes_meses >= 0),
  pct_gasto_tecnologia numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_tecnologia >= 0::numeric AND pct_gasto_tecnologia <= 100::numeric),
  pct_gasto_viajes numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_viajes >= 0::numeric AND pct_gasto_viajes <= 100::numeric),
  pct_gasto_restaurantes numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_restaurantes >= 0::numeric AND pct_gasto_restaurantes <= 100::numeric),
  pct_gasto_entretenimiento numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_entretenimiento >= 0::numeric AND pct_gasto_entretenimiento <= 100::numeric),
  pct_gasto_supermercado numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_supermercado >= 0::numeric AND pct_gasto_supermercado <= 100::numeric),
  pct_gasto_salud numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_salud >= 0::numeric AND pct_gasto_salud <= 100::numeric),
  pct_gasto_educacion numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_educacion >= 0::numeric AND pct_gasto_educacion <= 100::numeric),
  pct_gasto_hogar numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_hogar >= 0::numeric AND pct_gasto_hogar <= 100::numeric),
  pct_gasto_otros numeric NOT NULL DEFAULT 0 CHECK (pct_gasto_otros >= 0::numeric AND pct_gasto_otros <= 100::numeric),
  edad integer CHECK (edad >= 0 AND edad <= 120),
  genero USER-DEFINED,
  ciudad character varying,
  nivel_educacion USER-DEFINED,
  ocupacion character varying,
  usa_app_movil boolean NOT NULL DEFAULT false,
  notificaciones_activadas boolean NOT NULL DEFAULT false,
  sesiones_app_semana integer NOT NULL DEFAULT 0 CHECK (sesiones_app_semana >= 0),
  compras_online_pct numeric CHECK (compras_online_pct >= 0::numeric AND compras_online_pct <= 100::numeric),
  dispositivo_preferido USER-DEFINED,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT persona_pkey PRIMARY KEY (id_persona)
);

CREATE TABLE public.premios (
  id_premios integer NOT NULL DEFAULT nextval('premios_id_premios_seq'::regclass),
  nombre character varying NOT NULL,
  id_liga integer,
  id_tag integer,
  id_perfil integer,
  otorgado_en timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT premios_pkey PRIMARY KEY (id_premios),
  CONSTRAINT premios_id_liga_fkey FOREIGN KEY (id_liga) REFERENCES public.liga(id_liga),
  CONSTRAINT premios_id_tag_fkey FOREIGN KEY (id_tag) REFERENCES public.tag(id_tag),
  CONSTRAINT premios_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfil(id_perfil)
);

CREATE TABLE public.productopersona (
  id_productos_persona integer NOT NULL DEFAULT nextval('productopersona_id_productos_persona_seq'::regclass),
  id_persona integer NOT NULL,
  id_producto integer NOT NULL,
  nombre character varying,
  emision date NOT NULL DEFAULT CURRENT_DATE,
  caducidad date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT productopersona_pkey PRIMARY KEY (id_productos_persona),
  CONSTRAINT productopersona_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona),
  CONSTRAINT productopersona_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.productos(id_productos)
);

CREATE TABLE public.productos (
  id_productos integer NOT NULL DEFAULT nextval('productos_id_productos_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  tipo USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT productos_pkey PRIMARY KEY (id_productos)
);

CREATE TABLE public.pronosticos (
  id_pronosticos integer NOT NULL DEFAULT nextval('pronosticos_id_pronosticos_seq'::regclass),
  id_perfil integer NOT NULL,
  id_partido integer NOT NULL,
  score_local integer NOT NULL CHECK (score_local >= 0),
  score_visitante integer NOT NULL CHECK (score_visitante >= 0),
  ganador USER-DEFINED NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  es_correcto boolean,
  mailes_ganados numeric NOT NULL DEFAULT 0,
  CONSTRAINT pronosticos_pkey PRIMARY KEY (id_pronosticos),
  CONSTRAINT pronosticos_id_perfil_fkey FOREIGN KEY (id_perfil) REFERENCES public.perfil(id_perfil),
  CONSTRAINT pronosticos_id_partido_fkey FOREIGN KEY (id_partido) REFERENCES public.partido(id_partido)
);

CREATE TABLE public.tag (
  id_tag integer NOT NULL DEFAULT nextval('tag_id_tag_seq'::regclass),
  descripcion character varying NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tag_pkey PRIMARY KEY (id_tag)
);

CREATE TABLE public.tagsconsumo (
  id_tags_consumo integer NOT NULL DEFAULT nextval('tagsconsumo_id_tags_consumo_seq'::regclass),
  id_consumo integer NOT NULL,
  id_tag integer NOT NULL,
  certeza numeric NOT NULL DEFAULT 100 CHECK (certeza >= 0::numeric AND certeza <= 100::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tagsconsumo_pkey PRIMARY KEY (id_tags_consumo),
  CONSTRAINT tagsconsumo_id_consumo_fkey FOREIGN KEY (id_consumo) REFERENCES public.consumo(id_consumo),
  CONSTRAINT tagsconsumo_id_tag_fkey FOREIGN KEY (id_tag) REFERENCES public.tag(id_tag)
);

CREATE TABLE public.temporada (
  id_temporada integer NOT NULL DEFAULT nextval('temporada_id_temporada_seq'::regclass),
  nombre character varying NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT temporada_pkey PRIMARY KEY (id_temporada)
);

CREATE TABLE public.transferencias (
  id_transferencias integer NOT NULL DEFAULT nextval('transferencias_id_transferencias_seq'::regclass),
  id_persona_emisora integer NOT NULL,
  id_persona_receptora integer NOT NULL,
  fecha_transferencia timestamp with time zone NOT NULL DEFAULT now(),
  monto numeric NOT NULL CHECK (monto > 0::numeric),
  mailes_generados numeric NOT NULL DEFAULT 0 CHECK (mailes_generados >= 0::numeric),
  estado USER-DEFINED NOT NULL DEFAULT 'Pendiente'::estado_transferencia_enum,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transferencias_pkey PRIMARY KEY (id_transferencias),
  CONSTRAINT transferencias_id_persona_emisora_fkey FOREIGN KEY (id_persona_emisora) REFERENCES public.persona(id_persona),
  CONSTRAINT transferencias_id_persona_receptora_fkey FOREIGN KEY (id_persona_receptora) REFERENCES public.persona(id_persona)
);