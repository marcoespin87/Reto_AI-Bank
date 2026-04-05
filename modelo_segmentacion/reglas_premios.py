"""
reglas_premios.py
-----------------
Sistema de reglas (Modelo 2) para seleccionar el premio específico
dentro de la categoría asignada por el Modelo 1.

No requiere entrenamiento — usa lógica de negocio explícita.
Cada premio tiene un conjunto de reglas que calculan un score
de afinidad (0-100) basado en el perfil del usuario.

Uso:
    from reglas_premios import seleccionar_premio

    mejor, todos = seleccionar_premio(usuario_dict, "gastronomia")
    print(mejor["premio"])   # "cena_restaurante_premium_quito"
    print(mejor["score"])    # 100
    print(mejor["razones"])  # ["Ciudad Quito (+40)", ...]
"""

# ============================================================
# CATÁLOGO DE PREMIOS POR CATEGORÍA
# ============================================================
CATALOGO_PREMIOS = {
    'tecnologia': [
        'smartphone_flagship',
        'laptop',
        'smartwatch',
        'suscripcion_streaming_anual',
        'tablet'
    ],
    'viajes_nacionales': [
        'hotel_galapagos_3noches',
        'tour_amazonia_4dias',
        'hotel_cuenca_colonial_2noches',
        'paquete_ruta_del_sol',
        'vuelo_nacional_ida_vuelta'
    ],
    'viajes_internacionales': [
        'vuelo_latam_destino',
        'paquete_cancun_5dias',
        'paquete_europa_basico',
        'crucero_caribe_7noches'
    ],
    'gastronomia': [
        'cena_restaurante_premium_quito',
        'cena_restaurante_premium_guayaquil',
        'experiencia_cata_vinos',
        'voucher_delivery_3meses'
    ],
    'experiencias_entretenimiento': [
        'entrada_concierto_nacional',
        'entrada_concierto_internacional',
        'partido_liga_pro_vip',
        'experiencia_rally_quito',
        'cine_plan_familiar_6meses'
    ],
    'salud_bienestar': [
        'membresia_gimnasio_6meses',
        'plan_spa_parejas',
        'chequeo_medico_premium',
        'suscripcion_app_bienestar_anual'
    ],
    'educacion_desarrollo': [
        'curso_idiomas_3meses',
        'certificacion_online_coursera',
        'beca_parcial_diplomado',
        'taller_emprendimiento_presencial'
    ],
    'hogar_lifestyle': [
        'electrodomestico_gama_media',
        'set_decoracion_hogar',
        'voucher_ferreteria_150usd',
        'robot_aspirador'
    ],
    'premium_financiero': [
        'inversion_fondos_mutuos_500usd',
        'seguro_vida_premium_anual',
        'tarjeta_black_upgrade_6meses',
        'cashback_especial_6meses'
    ]
}


# ============================================================
# SISTEMA DE SCORING POR PREMIO ESPECÍFICO
# ============================================================

def score_premio(usuario: dict, premio: str) -> float:
    """
    Calcula el score de afinidad (0–100) entre un usuario y un premio específico.
    Retorna el score y las razones que lo componen.
    """
    score = 0
    razones = []

    t = usuario.get('liga_tier', 'Bronce')
    edad = usuario.get('edad', 30)
    ciudad = usuario.get('ciudad', 'Otras')
    gasto = usuario.get('gasto_mensual_usd', 200)
    pct_viajes = usuario.get('pct_gasto_viajes', 0)
    pct_tech = usuario.get('pct_gasto_tecnologia', 0)
    pct_rest = usuario.get('pct_gasto_restaurantes', 0)
    pct_salud = usuario.get('pct_gasto_salud', 0)
    pct_educ = usuario.get('pct_gasto_educacion', 0)
    pct_hogar = usuario.get('pct_gasto_hogar', 0)
    score_cred = usuario.get('score_crediticio', 'A')
    ocupacion = usuario.get('ocupacion', 'empleado_privado')
    educacion = usuario.get('nivel_educacion', 'universitario')
    medalla = usuario.get('medalla_final', 3)
    cromos = usuario.get('cromos_coleccionados', 60)
    pred_pct = usuario.get('predicciones_correctas_pct', 0.4)
    racha = usuario.get('racha_maxima_predicciones', 2)
    compras_online = usuario.get('compras_online_pct', 0.3)
    genero = usuario.get('genero', 'No_especificado')
    tiene_credito = usuario.get('tiene_credito_activo', 0)
    num_productos = usuario.get('num_productos_bancarios', 2)
    antiguedad = usuario.get('antiguedad_cliente_meses', 12)

    # ──────────── TECNOLOGÍA ────────────
    if premio == 'smartphone_flagship':
        if pct_tech > 0.20: score += 35; razones.append('Alto gasto en tech (+35)')
        if edad < 35: score += 25; razones.append('Perfil joven (+25)')
        if compras_online > 0.40: score += 20; razones.append('Comprador digital (+20)')
        if t in ['Oro','Diamante']: score += 20; razones.append('Tier alto (+20)')

    elif premio == 'laptop':
        if pct_tech > 0.15: score += 30; razones.append('Gasto tech (+30)')
        if ocupacion in ['estudiante','profesional_liberal','empleado_privado']: score += 30; razones.append('Ocupación compatible (+30)')
        if educacion in ['universitario','posgrado']: score += 25; razones.append('Perfil educado (+25)')
        if edad < 45: score += 15; razones.append('Edad activa (+15)')

    elif premio == 'smartwatch':
        if pct_tech > 0.10: score += 25; razones.append('Gasto tech (+25)')
        if pct_salud > 0.08: score += 25; razones.append('Interés en salud (+25)')
        if 25 <= edad <= 50: score += 25; razones.append('Rango etario ideal (+25)')
        if t in ['Plata','Oro','Diamante']: score += 25; razones.append('Tier adecuado (+25)')

    elif premio == 'suscripcion_streaming_anual':
        if compras_online > 0.35: score += 40; razones.append('Digital-first (+40)')
        if edad < 40: score += 30; razones.append('Perfil joven (+30)')
        if t == 'Bronce': score += 30; razones.append('Premio accesible para tier (+30)')

    elif premio == 'tablet':
        if pct_tech > 0.12: score += 30; razones.append('Gasto tech (+30)')
        if ocupacion in ['ama_de_casa','jubilado','estudiante']: score += 35; razones.append('Uso casual (+35)')
        if edad > 40 or edad < 25: score += 35; razones.append('Perfil de uso (+35)')

    # ──────────── VIAJES NACIONALES ────────────
    elif premio == 'hotel_galapagos_3noches':
        if gasto > 1000: score += 30; razones.append('Capacidad de gasto alta (+30)')
        if t in ['Oro','Diamante']: score += 25; razones.append('Tier premium (+25)')
        if score_cred in ['AAA','AA']: score += 25; razones.append('Excelente historial (+25)')
        if pct_viajes > 0.12: score += 20; razones.append('Viajero frecuente (+20)')

    elif premio == 'tour_amazonia_4dias':
        if 18 <= edad <= 40: score += 35; razones.append('Perfil aventurero (+35)')
        if pct_viajes > 0.08: score += 30; razones.append('Interés en viajes (+30)')
        if ciudad in ['Quito','Cuenca','Ibarra','Riobamba']: score += 20; razones.append('Ciudad sierra (+20)')
        if medalla >= 4: score += 15; razones.append('Usuario activo (+15)')

    elif premio == 'hotel_cuenca_colonial_2noches':
        if pct_viajes > 0.06: score += 30; razones.append('Interés en viajes (+30)')
        if ciudad in ['Guayaquil','Manta','Quito']: score += 30; razones.append('Fuera de Cuenca (+30)')
        if t in ['Bronce','Plata']: score += 25; razones.append('Premio accesible (+25)')
        if edad > 30: score += 15; razones.append('Edad para turismo cultural (+15)')

    elif premio == 'paquete_ruta_del_sol':
        if ciudad in ['Quito','Cuenca','Ambato','Riobamba']: score += 35; razones.append('Ciudad sierra → costa (+35)')
        if pct_viajes > 0.07: score += 30; razones.append('Interés en viajes (+30)')
        if 22 <= edad <= 55: score += 20; razones.append('Rango etario (+20)')
        if t in ['Plata','Bronce']: score += 15; razones.append('Precio accesible (+15)')

    elif premio == 'vuelo_nacional_ida_vuelta':
        if pct_viajes > 0.05: score += 35; razones.append('Perfil viajero (+35)')
        if antiguedad > 12: score += 25; razones.append('Cliente fiel (+25)')
        if ciudad in ['Quito','Guayaquil']: score += 25; razones.append('Aeropuerto principal (+25)')
        if t == 'Plata': score += 15; razones.append('Tier Plata (+15)')

    # ──────────── VIAJES INTERNACIONALES ────────────
    elif premio == 'vuelo_latam_destino':
        if pct_viajes > 0.15: score += 30; razones.append('Viajero frecuente (+30)')
        if t in ['Oro','Diamante']: score += 30; razones.append('Tier alto (+30)')
        if score_cred in ['AAA','AA']: score += 25; razones.append('Historial excelente (+25)')
        if tiene_credito: score += 15; razones.append('Crédito activo (+15)')

    elif premio == 'paquete_cancun_5dias':
        if pct_viajes > 0.12: score += 30; razones.append('Viajero (+30)')
        if 22 <= edad <= 45: score += 25; razones.append('Perfil vacacional (+25)')
        if t in ['Plata','Oro']: score += 25; razones.append('Tier accesible (+25)')
        if score_cred in ['AAA','AA','A']: score += 20; razones.append('Buen historial (+20)')

    elif premio == 'paquete_europa_basico':
        if t == 'Diamante': score += 35; razones.append('Tier Diamante (+35)')
        if gasto > 2000: score += 30; razones.append('Alto gasto mensual (+30)')
        if educacion == 'posgrado': score += 20; razones.append('Perfil internacional (+20)')
        if score_cred == 'AAA': score += 15; razones.append('Historial AAA (+15)')

    elif premio == 'crucero_caribe_7noches':
        if t == 'Diamante': score += 40; razones.append('Tier Diamante (+40)')
        if gasto > 3000: score += 30; razones.append('Gasto muy alto (+30)')
        if edad > 35: score += 20; razones.append('Perfil adulto (+20)')
        if score_cred == 'AAA': score += 10; razones.append('Historial AAA (+10)')

    # ──────────── GASTRONOMÍA ────────────
    elif premio == 'cena_restaurante_premium_quito':
        if ciudad in ['Quito','Ibarra','Ambato']: score += 40; razones.append('Ciudad sierra norte (+40)')
        if pct_rest > 0.15: score += 30; razones.append('Gasto en restaurantes (+30)')
        if 25 <= edad <= 50: score += 20; razones.append('Perfil gastronómico (+20)')
        if t in ['Plata','Oro']: score += 10; razones.append('Tier compatible (+10)')

    elif premio == 'cena_restaurante_premium_guayaquil':
        if ciudad in ['Guayaquil','Manta','Santo Domingo']: score += 40; razones.append('Ciudad costa (+40)')
        if pct_rest > 0.15: score += 30; razones.append('Gasto en restaurantes (+30)')
        if 25 <= edad <= 50: score += 20; razones.append('Perfil gastronómico (+20)')
        if t in ['Plata','Oro']: score += 10; razones.append('Tier compatible (+10)')

    elif premio == 'experiencia_cata_vinos':
        if edad > 30: score += 30; razones.append('Perfil adulto (+30)')
        if pct_rest > 0.12: score += 30; razones.append('Gasto gastronómico (+30)')
        if t in ['Oro','Diamante']: score += 25; razones.append('Tier premium (+25)')
        if ocupacion in ['profesional_liberal','empresario_pyme']: score += 15; razones.append('Perfil ejecutivo (+15)')

    elif premio == 'voucher_delivery_3meses':
        if compras_online > 0.30: score += 35; razones.append('Comprador digital (+35)')
        if edad < 35: score += 30; razones.append('Perfil joven (+30)')
        if t in ['Bronce','Plata']: score += 35; razones.append('Premio accesible (+35)')

    # ──────────── EXPERIENCIAS & ENTRETENIMIENTO ────────────
    elif premio == 'entrada_concierto_nacional':
        if cromos > 100: score += 30; razones.append('Fan activo de gamificación (+30)')
        if pred_pct > 0.50: score += 25; razones.append('Predictor activo (+25)')
        if edad < 40: score += 25; razones.append('Perfil joven (+25)')
        if ciudad in ['Quito','Guayaquil']: score += 20; razones.append('Ciudad con eventos (+20)')

    elif premio == 'entrada_concierto_internacional':
        if cromos > 150: score += 30; razones.append('Coleccionista activo (+30)')
        if pred_pct > 0.60: score += 25; razones.append('Predictor experto (+25)')
        if t in ['Oro','Diamante']: score += 25; razones.append('Tier alto (+25)')
        if ciudad in ['Quito','Guayaquil']: score += 20; razones.append('Ciudad principal (+20)')

    elif premio == 'partido_liga_pro_vip':
        if racha >= 5: score += 35; razones.append('Racha de predicciones alta (+35)')
        if pred_pct > 0.55: score += 30; razones.append('Predictor habilidoso (+30)')
        if genero == 'M': score += 20; razones.append('Perfil estadístico (+20)')
        if ciudad in ['Quito','Guayaquil']: score += 15; razones.append('Ciudad con estadio (+15)')

    elif premio == 'experiencia_rally_quito':
        if ciudad in ['Quito','Ibarra','Ambato']: score += 40; razones.append('Ciudad del rally (+40)')
        if racha >= 3: score += 30; razones.append('Usuario competitivo (+30)')
        if 20 <= edad <= 45: score += 30; razones.append('Rango etario (+30)')

    elif premio == 'cine_plan_familiar_6meses':
        if ocupacion == 'ama_de_casa': score += 35; razones.append('Perfil familiar (+35)')
        if t == 'Bronce': score += 30; razones.append('Premio accesible (+30)')
        if edad > 28: score += 20; razones.append('Perfil familiar (+20)')
        if ciudad in ['Quito','Guayaquil','Cuenca']: score += 15; razones.append('Ciudad con cines (+15)')

    # ──────────── SALUD & BIENESTAR ────────────
    elif premio == 'membresia_gimnasio_6meses':
        if pct_salud > 0.08: score += 35; razones.append('Gasto en salud (+35)')
        if 20 <= edad <= 50: score += 30; razones.append('Perfil activo (+30)')
        if t in ['Plata','Oro']: score += 20; razones.append('Tier compatible (+20)')
        if ciudad in ['Quito','Guayaquil','Cuenca']: score += 15; razones.append('Ciudad con gyms (+15)')

    elif premio == 'plan_spa_parejas':
        if pct_salud > 0.10: score += 30; razones.append('Gasto en bienestar (+30)')
        if genero == 'F': score += 25; razones.append('Perfil estadístico (+25)')
        if edad > 28: score += 25; razones.append('Perfil adulto (+25)')
        if t in ['Plata','Oro']: score += 20; razones.append('Tier accesible (+20)')

    elif premio == 'chequeo_medico_premium':
        if edad > 40: score += 40; razones.append('Edad preventiva (+40)')
        if pct_salud > 0.08: score += 30; razones.append('Consciencia de salud (+30)')
        if t in ['Oro','Diamante']: score += 30; razones.append('Tier premium (+30)')

    elif premio == 'suscripcion_app_bienestar_anual':
        if compras_online > 0.35: score += 35; razones.append('Digital (+35)')
        if pct_salud > 0.06: score += 35; razones.append('Interés en salud (+35)')
        if t in ['Bronce','Plata']: score += 30; razones.append('Precio accesible (+30)')

    # ──────────── EDUCACIÓN & DESARROLLO ────────────
    elif premio == 'curso_idiomas_3meses':
        if pct_educ > 0.06: score += 35; razones.append('Gasto en educación (+35)')
        if ocupacion in ['estudiante','empleado_privado']: score += 30; razones.append('Perfil activo (+30)')
        if edad < 35: score += 20; razones.append('Perfil joven (+20)')
        if t in ['Bronce','Plata']: score += 15; razones.append('Precio accesible (+15)')

    elif premio == 'certificacion_online_coursera':
        if compras_online > 0.30: score += 30; razones.append('Digital-first (+30)')
        if ocupacion in ['profesional_liberal','empleado_privado','estudiante']: score += 30; razones.append('Perfil profesional (+30)')
        if pct_educ > 0.08: score += 25; razones.append('Inversión en educación (+25)')
        if educacion in ['universitario','posgrado']: score += 15; razones.append('Ya tiene base académica (+15)')

    elif premio == 'beca_parcial_diplomado':
        if educacion == 'universitario': score += 35; razones.append('Perfil para diplomado (+35)')
        if t in ['Oro','Diamante']: score += 30; razones.append('Capacidad de inversión (+30)')
        if ocupacion in ['profesional_liberal','empresario_pyme']: score += 25; razones.append('Perfil ejecutivo (+25)')
        if 28 <= edad <= 50: score += 10; razones.append('Etapa profesional (+10)')

    elif premio == 'taller_emprendimiento_presencial':
        if ocupacion in ['independiente_informal','comerciante','empresario_pyme']: score += 40; razones.append('Perfil emprendedor (+40)')
        if pct_educ > 0.05: score += 30; razones.append('Interés en aprendizaje (+30)')
        if ciudad in ['Quito','Guayaquil','Cuenca']: score += 30; razones.append('Ciudad con eventos (+30)')

    # ──────────── HOGAR & LIFESTYLE ────────────
    elif premio == 'electrodomestico_gama_media':
        if pct_hogar > 0.10: score += 40; razones.append('Gasto en hogar (+40)')
        if ocupacion in ['ama_de_casa','comerciante']: score += 30; razones.append('Perfil del hogar (+30)')
        if t in ['Bronce','Plata']: score += 30; razones.append('Premio accesible (+30)')

    elif premio == 'set_decoracion_hogar':
        if pct_hogar > 0.08: score += 35; razones.append('Gasto en hogar (+35)')
        if genero == 'F': score += 30; razones.append('Perfil estadístico (+30)')
        if edad > 25: score += 20; razones.append('Perfil hogareño (+20)')
        if t in ['Plata','Oro']: score += 15; razones.append('Tier compatible (+15)')

    elif premio == 'voucher_ferreteria_150usd':
        if pct_hogar > 0.12: score += 40; razones.append('Gasto en hogar (+40)')
        if genero == 'M': score += 30; razones.append('Perfil estadístico (+30)')
        if ocupacion in ['comerciante','independiente_informal']: score += 30; razones.append('Perfil práctico (+30)')

    elif premio == 'robot_aspirador':
        if pct_tech > 0.08: score += 30; razones.append('Afinidad tech (+30)')
        if pct_hogar > 0.10: score += 30; razones.append('Gasto en hogar (+30)')
        if t in ['Plata','Oro']: score += 25; razones.append('Capacidad de gasto (+25)')
        if edad > 30: score += 15; razones.append('Perfil adulto (+15)')

    # ──────────── PREMIUM FINANCIERO ────────────
    elif premio == 'inversion_fondos_mutuos_500usd':
        if t == 'Diamante': score += 35; razones.append('Tier Diamante (+35)')
        if score_cred in ['AAA','AA']: score += 30; razones.append('Historial excelente (+30)')
        if num_productos >= 4: score += 20; razones.append('Multi-producto (+20)')
        if ocupacion in ['empresario_pyme','profesional_liberal']: score += 15; razones.append('Perfil inversor (+15)')

    elif premio == 'seguro_vida_premium_anual':
        if edad > 35: score += 35; razones.append('Edad de protección (+35)')
        if t in ['Oro','Diamante']: score += 30; razones.append('Capacidad de inversión (+30)')
        if tiene_credito: score += 20; razones.append('Responsabilidades financieras (+20)')
        if score_cred in ['AAA','AA']: score += 15; razones.append('Buen historial (+15)')

    elif premio == 'tarjeta_black_upgrade_6meses':
        if t == 'Diamante': score += 40; razones.append('Tier Diamante (+40)')
        if gasto > 2500: score += 30; razones.append('Gasto alto (+30)')
        if score_cred == 'AAA': score += 20; razones.append('Historial AAA (+20)')
        if num_productos >= 5: score += 10; razones.append('Cliente integral (+10)')

    elif premio == 'cashback_especial_6meses':
        if frecuencia := usuario.get('frecuencia_transacciones_mes', 10):
            if frecuencia > 20: score += 35; razones.append('Alta frecuencia de transacciones (+35)')
        if t in ['Plata','Oro']: score += 30; razones.append('Tier activo (+30)')
        if antiguedad > 24: score += 25; razones.append('Cliente leal (+25)')
        if tiene_credito: score += 10; razones.append('Con tarjeta de crédito (+10)')

    return min(score, 100), razones


def seleccionar_premio(usuario: dict, categoria: str) -> dict:
    """Selecciona el premio específico dentro de una categoría usando scoring."""
    premios = CATALOGO_PREMIOS.get(categoria, [])
    if not premios:
        return {'premio': None, 'score': 0, 'razones': []}

    scores_detalle = []
    for premio in premios:
        s, r = score_premio(usuario, premio)
        scores_detalle.append({'premio': premio, 'score': s, 'razones': r})

    scores_detalle.sort(key=lambda x: x['score'], reverse=True)
    return scores_detalle[0], scores_detalle