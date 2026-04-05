"""
build_input_df.py
-----------------
Construye el DataFrame de input que espera el pipeline entrenado.
Debe replicar EXACTAMENTE el mismo feature engineering del notebook.

Uso:
    from build_input_df import build_input_df
    df = build_input_df(usuario_dict)
    prediccion = pipeline.predict(df)
"""

import numpy as np
import pandas as pd

# Columnas de porcentaje de gasto — mismo orden que el entrenamiento
PCT_COLS_KEYS = [
    'pct_gasto_tecnologia',
    'pct_gasto_viajes',
    'pct_gasto_restaurantes',
    'pct_gasto_entretenimiento',
    'pct_gasto_supermercado',
    'pct_gasto_salud',
    'pct_gasto_educacion',
    'pct_gasto_hogar',
    'pct_gasto_otros',
]

PCT_COLS_MAP = dict(zip(PCT_COLS_KEYS, [
    'tech', 'viajes', 'restaurantes', 'entretenimiento',
    'supermercado', 'salud', 'educacion', 'hogar', 'otros'
]))

# Mapeo de categoría de gasto dominante → perfil dominante inferido
GASTO_A_PERFIL = {
    'tech':            'tecnologia',
    'viajes':          'viajes_nacionales',
    'restaurantes':    'gastronomia',
    'entretenimiento': 'experiencias_entretenimiento',
    'supermercado':    'hogar_lifestyle',
    'salud':           'salud_bienestar',
    'educacion':       'educacion_desarrollo',
    'hogar':           'hogar_lifestyle',
    'otros':           'premium_financiero',
}


def build_input_df(u: dict) -> pd.DataFrame:
    """
    Recibe el diccionario del usuario y retorna un DataFrame de 1 fila
    con todas las columnas y features derivadas que espera el pipeline.

    Parámetros
    ----------
    u : dict
        Diccionario con los campos del usuario. Todos tienen valores
        por defecto para que la función no falle si falta alguno.

    Retorna
    -------
    pd.DataFrame con 1 fila lista para pipeline.predict()
    """

    # ------------------------------------------------------------------
    # FEATURES DERIVADAS — misma lógica que la Sección 4 del notebook
    # ------------------------------------------------------------------

    # 1. engagement_score (0–100)
    engagement_score = float(np.clip(
        u.get('predicciones_correctas_pct', 0.4) * 30 +
        (u.get('cromos_coleccionados', 60) / 240) * 25 +
        (u.get('dias_activo_temporada', 60) / 180) * 25 +
        (u.get('objetivos_completados', 3) / 20) * 20,
        0, 100
    ))

    # 2. Categorías de gasto dominante y secundaria
    pct_vals = {k: u.get(k, 0.0) for k in PCT_COLS_KEYS}
    sorted_pct = sorted(pct_vals, key=pct_vals.get, reverse=True)
    cat_dominante_key  = sorted_pct[0]
    cat_secundaria_key = sorted_pct[1]
    categoria_gasto_dominante  = PCT_COLS_MAP[cat_dominante_key]
    categoria_gasto_secundaria = PCT_COLS_MAP[cat_secundaria_key]

    # 3. valor_cliente_score
    valor_cliente_score = float(
        np.log1p(u.get('gasto_mensual_usd', 200)) *
        np.log1p(u.get('antiguedad_cliente_meses', 12)) *
        u.get('num_productos_bancarios', 2)
    )

    # 4. mailes_por_mes
    mailes_por_mes = float(
        u.get('mailes_acumulados', 1000) /
        max(u.get('antiguedad_cliente_meses', 12), 1)
    )

    # 5. perfil_digital
    perfil_digital = float(
        u.get('usa_app_movil', 1) * 3 +
        u.get('notificaciones_activadas', 1) * 2 +
        u.get('compras_online_pct', 0.3) * 5 +
        min(u.get('sesiones_app_semana', 4) / 15, 1) * 5
    )

    # 6. ratio_gasto_dominante
    ratio_gasto_dominante = float(max(pct_vals.values()))

    # 7. es_perfil_premium (binaria)
    es_perfil_premium = int(
        u.get('liga_tier', 'Bronce') in ['Oro', 'Diamante'] and
        u.get('score_crediticio', 'B') in ['AAA', 'AA'] and
        u.get('gasto_mensual_usd', 0) > 800
    )

    # 8. perfil_dominante inferido
    #    En producción real vendría del cluster asignado al usuario
    #    al inicio de la temporada. Aquí lo inferimos del gasto.
    if u.get('liga_tier') == 'Diamante' and u.get('gasto_mensual_usd', 0) > 2000:
        perfil_dominante = 'premium_financiero'
    elif u.get('pct_gasto_viajes', 0) > 0.15 and u.get('liga_tier') in ['Oro', 'Diamante']:
        perfil_dominante = 'viajes_internacionales'
    else:
        perfil_dominante = GASTO_A_PERFIL.get(categoria_gasto_dominante, 'gastronomia')

    # ------------------------------------------------------------------
    # CONSTRUIR FILA COMPLETA
    # ------------------------------------------------------------------
    row = {
        # Bloque A — Perfil financiero
        'liga_tier':                    u.get('liga_tier', 'Plata'),
        'gasto_mensual_usd':            u.get('gasto_mensual_usd', 400.0),
        'frecuencia_transacciones_mes': u.get('frecuencia_transacciones_mes', 15),
        'antiguedad_cliente_meses':     u.get('antiguedad_cliente_meses', 12),
        'num_productos_bancarios':      u.get('num_productos_bancarios', 2),
        'score_crediticio':             u.get('score_crediticio', 'A'),
        'tiene_credito_activo':         u.get('tiene_credito_activo', 0),
        'tiene_cuenta_ahorro':          u.get('tiene_cuenta_ahorro', 1),
        'meses_sin_mora':               u.get('meses_sin_mora', 12),

        # Bloque B — Porcentajes de gasto
        'pct_gasto_tecnologia':         u.get('pct_gasto_tecnologia', 0.10),
        'pct_gasto_viajes':             u.get('pct_gasto_viajes', 0.05),
        'pct_gasto_restaurantes':       u.get('pct_gasto_restaurantes', 0.20),
        'pct_gasto_entretenimiento':    u.get('pct_gasto_entretenimiento', 0.10),
        'pct_gasto_supermercado':       u.get('pct_gasto_supermercado', 0.30),
        'pct_gasto_salud':              u.get('pct_gasto_salud', 0.07),
        'pct_gasto_educacion':          u.get('pct_gasto_educacion', 0.08),
        'pct_gasto_hogar':              u.get('pct_gasto_hogar', 0.07),
        'pct_gasto_otros':              u.get('pct_gasto_otros', 0.03),

        # Bloque C — Gamificación
        'medalla_final':                u.get('medalla_final', 3),
        'estrellas_finales':            u.get('estrellas_finales', 2),
        'mailes_acumulados':            u.get('mailes_acumulados', 1000),
        'predicciones_correctas_pct':   u.get('predicciones_correctas_pct', 0.4),
        'racha_maxima_predicciones':    u.get('racha_maxima_predicciones', 2),
        'cromos_coleccionados':         u.get('cromos_coleccionados', 60),
        'cromos_epicos_obtenidos':      u.get('cromos_epicos_obtenidos', 3),
        'objetivos_completados':        u.get('objetivos_completados', 3),

        # Bloque D — Comportamiento social
        'participo_en_grupo':           u.get('participo_en_grupo', 1),
        'rol_en_grupo':                 u.get('rol_en_grupo', 'miembro'),
        'votos_emitidos':               u.get('votos_emitidos', 1),
        'dias_activo_temporada':        u.get('dias_activo_temporada', 60),

        # Bloque E — Demográfico
        'edad':                         u.get('edad', 30),
        'genero':                       u.get('genero', 'No_especificado'),
        'ciudad':                       u.get('ciudad', 'Quito'),
        'nivel_educacion':              u.get('nivel_educacion', 'universitario'),
        'ocupacion':                    u.get('ocupacion', 'empleado_privado'),

        # Bloque F — Digital
        'usa_app_movil':                u.get('usa_app_movil', 1),
        'sesiones_app_semana':          u.get('sesiones_app_semana', 4),
        'notificaciones_activadas':     u.get('notificaciones_activadas', 1),
        'compras_online_pct':           u.get('compras_online_pct', 0.3),
        'dispositivo_preferido':        u.get('dispositivo_preferido', 'Android'),

        # Features derivadas
        'perfil_dominante':             perfil_dominante,
        'engagement_score':             engagement_score,
        'categoria_gasto_dominante':    categoria_gasto_dominante,
        'valor_cliente_score':          valor_cliente_score,
        'mailes_por_mes':               mailes_por_mes,
        'perfil_digital':               perfil_digital,
        'ratio_gasto_dominante':        ratio_gasto_dominante,
        'es_perfil_premium':            es_perfil_premium,
        'categoria_gasto_secundaria':   categoria_gasto_secundaria,
    }

    return pd.DataFrame([row])