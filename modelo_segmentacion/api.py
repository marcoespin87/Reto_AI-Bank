"""
api.py
------
Servidor FastAPI que expone el modelo de segmentación de ganadores
como un endpoint HTTP consumible desde React u cualquier cliente.

Cómo correrlo:
    uvicorn api:app --reload --port 8000

Endpoints:
    GET  /health       → verifica que el servidor está activo
    GET  /categorias   → lista las 9 categorías de premio
    POST /segmentar    → recibe perfil del usuario, retorna categoría + premio
    POST /segmentar/batch → procesa múltiples usuarios a la vez

Documentación automática:
    http://localhost:8000/docs
"""

import joblib
import numpy as np
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from build_input_df import build_input_df
from reglas_premios import seleccionar_premio, CATALOGO_PREMIOS

# ============================================================
# INICIALIZACIÓN
# ============================================================
app = FastAPI(
    title="AI-Bank mAiles — Segmentación API",
    description="Modelo de personalización de premios por temporada",
    version="1.0.0"
)

# CORS — permite que React llame a la API desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelos una sola vez al iniciar el servidor
# (no en cada request — sería muy lento)
try:
    pipeline = joblib.load("modelo_categoria_premio.pkl")
    le       = joblib.load("label_encoder_categoria.pkl")
    print("✅ Modelos cargados correctamente")
except FileNotFoundError as e:
    print(f"❌ Error cargando modelos: {e}")
    print("   Asegúrate de que los .pkl están en la misma carpeta que api.py")
    raise

# Nombres de display para los premios
NOMBRES_PREMIOS = {
    'smartphone_flagship':           '📱 Smartphone Flagship',
    'laptop':                        '💻 Laptop',
    'smartwatch':                    '⌚ Smartwatch',
    'suscripcion_streaming_anual':   '🎬 Suscripción Streaming Anual',
    'tablet':                        '📟 Tablet',
    'hotel_galapagos_3noches':       '🐢 Hotel Galápagos (3 noches)',
    'tour_amazonia_4dias':           '🌿 Tour Amazonía (4 días)',
    'hotel_cuenca_colonial_2noches': '🏛️ Hotel Cuenca Colonial (2 noches)',
    'paquete_ruta_del_sol':          '🏖️ Paquete Ruta del Sol',
    'vuelo_nacional_ida_vuelta':     '✈️ Vuelo Nacional I/V',
    'vuelo_latam_destino':           '🌎 Vuelo LATAM Destino',
    'paquete_cancun_5dias':          '🌴 Paquete Cancún (5 días)',
    'paquete_europa_basico':         '🗼 Paquete Europa Básico',
    'crucero_caribe_7noches':        '🚢 Crucero Caribe (7 noches)',
    'cena_restaurante_premium_quito':     '🍽️ Cena Premium Quito',
    'cena_restaurante_premium_guayaquil': '🦐 Cena Premium Guayaquil',
    'experiencia_cata_vinos':        '🍷 Cata de Vinos',
    'voucher_delivery_3meses':       '🛵 Voucher Delivery (3 meses)',
    'entrada_concierto_nacional':    '🎵 Concierto Nacional VIP',
    'entrada_concierto_internacional':'🎤 Concierto Internacional VIP',
    'partido_liga_pro_vip':          '⚽ Partido Liga Pro VIP',
    'experiencia_rally_quito':       '🏎️ Rally de Quito VIP',
    'cine_plan_familiar_6meses':     '🎬 Plan Cine Familiar (6 meses)',
    'membresia_gimnasio_6meses':     '🏋️ Membresía Gimnasio (6 meses)',
    'plan_spa_parejas':              '💆 Plan Spa Parejas',
    'chequeo_medico_premium':        '🏥 Chequeo Médico Premium',
    'suscripcion_app_bienestar_anual':'🧘 App Bienestar (anual)',
    'curso_idiomas_3meses':          '🗣️ Curso de Idiomas (3 meses)',
    'certificacion_online_coursera': '📜 Certificación Online',
    'beca_parcial_diplomado':        '🎓 Beca Parcial Diplomado',
    'taller_emprendimiento_presencial':'🚀 Taller Emprendimiento',
    'electrodomestico_gama_media':   '🏠 Electrodoméstico',
    'set_decoracion_hogar':          '🛋️ Set Decoración Hogar',
    'voucher_ferreteria_150usd':     '🔧 Voucher Ferretería $150',
    'robot_aspirador':               '🤖 Robot Aspirador',
    'inversion_fondos_mutuos_500usd':'📈 Inversión Fondos Mutuos $500',
    'seguro_vida_premium_anual':     '🛡️ Seguro de Vida Premium',
    'tarjeta_black_upgrade_6meses':  '💳 Tarjeta Black Upgrade',
    'cashback_especial_6meses':      '💰 Cashback Especial (6 meses)',
}


# ============================================================
# SCHEMA DE INPUT — Pydantic valida automáticamente los tipos
# ============================================================
class PerfilUsuario(BaseModel):
    # Bloque A — Perfil financiero
    liga_tier:                    str   = Field(default="Plata",   description="Bronce | Plata | Oro | Diamante")
    gasto_mensual_usd:            float = Field(default=400.0,     description="Gasto mensual promedio en USD")
    frecuencia_transacciones_mes: int   = Field(default=15,        description="Número de transacciones por mes")
    antiguedad_cliente_meses:     int   = Field(default=12,        description="Meses como cliente del banco")
    num_productos_bancarios:      int   = Field(default=2,         description="Número de productos contratados")
    score_crediticio:             str   = Field(default="A",       description="AAA | AA | A | B | C")
    tiene_credito_activo:         int   = Field(default=0,         description="1 si tiene crédito activo")
    tiene_cuenta_ahorro:          int   = Field(default=1,         description="1 si tiene cuenta de ahorro")
    meses_sin_mora:               int   = Field(default=12,        description="Meses consecutivos sin mora")

    # Bloque B — Porcentajes de gasto (deben sumar ~1.0)
    pct_gasto_tecnologia:         float = Field(default=0.10)
    pct_gasto_viajes:             float = Field(default=0.05)
    pct_gasto_restaurantes:       float = Field(default=0.20)
    pct_gasto_entretenimiento:    float = Field(default=0.10)
    pct_gasto_supermercado:       float = Field(default=0.30)
    pct_gasto_salud:              float = Field(default=0.07)
    pct_gasto_educacion:          float = Field(default=0.08)
    pct_gasto_hogar:              float = Field(default=0.07)
    pct_gasto_otros:              float = Field(default=0.03)

    # Bloque C — Gamificación
    medalla_final:                int   = Field(default=3,    description="Medalla alcanzada (1-6)")
    estrellas_finales:            int   = Field(default=2,    description="Estrellas en medalla actual (0-5)")
    mailes_acumulados:            int   = Field(default=1000, description="Total de mAiles acumulados")
    predicciones_correctas_pct:   float = Field(default=0.4,  description="% de predicciones correctas (0-1)")
    racha_maxima_predicciones:    int   = Field(default=2,    description="Racha máxima de predicciones correctas")
    cromos_coleccionados:         int   = Field(default=60,   description="Cromos obtenidos (0-240)")
    cromos_epicos_obtenidos:      int   = Field(default=3,    description="Cromos épicos obtenidos")
    objetivos_completados:        int   = Field(default=3,    description="Objetivos de liga completados")

    # Bloque D — Comportamiento social
    participo_en_grupo:           int   = Field(default=1,        description="1 si participó en un grupo")
    rol_en_grupo:                 str   = Field(default="miembro", description="creador | miembro | sin_grupo")
    votos_emitidos:               int   = Field(default=1,        description="Votos de admisión emitidos")
    dias_activo_temporada:        int   = Field(default=60,       description="Días activo durante la temporada")

    # Bloque E — Demográfico
    edad:             int = Field(default=30,                description="Edad del usuario (18-70)")
    genero:           str = Field(default="No_especificado", description="M | F | No_especificado")
    ciudad:           str = Field(default="Quito",           description="Ciudad de residencia en Ecuador")
    nivel_educacion:  str = Field(default="universitario",   description="secundaria | tecnico | universitario | posgrado")
    ocupacion:        str = Field(default="empleado_privado",description="empleado_privado | estudiante | comerciante | ...")

    # Bloque F — Digital
    usa_app_movil:            int   = Field(default=1,        description="1 si usa la app móvil")
    sesiones_app_semana:      int   = Field(default=4,        description="Sesiones por semana en la app")
    notificaciones_activadas: int   = Field(default=1,        description="1 si tiene notificaciones activas")
    compras_online_pct:       float = Field(default=0.3,      description="% de compras hechas online (0-1)")
    dispositivo_preferido:    str   = Field(default="Android",description="Android | iOS")


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/health")
def health():
    """Verificar que el servidor y los modelos están activos."""
    return {
        "status":  "ok",
        "modelo":  "AIBank mAiles Segmentación v1.0",
        "clases":  list(le.classes_),
        "n_clases": len(le.classes_)
    }


@app.get("/categorias")
def listar_categorias():
    """Listar las 9 categorías de premio con sus premios específicos."""
    return {
        "categorias": {
            cat: {
                "premios": premios,
                "n_premios": len(premios)
            }
            for cat, premios in CATALOGO_PREMIOS.items()
        }
    }


@app.post("/segmentar")
def segmentar(usuario: PerfilUsuario):
    """
    Recibe el perfil de un usuario ganador y retorna:
    - La categoría de premio asignada (Modelo 1 — ML)
    - El premio específico dentro de esa categoría (Modelo 2 — Reglas)
    - Las probabilidades de todas las categorías
    - Las razones que justifican el premio asignado
    - Dos premios alternativos dentro de la misma categoría
    """
    try:
        u = usuario.dict()

        # --- Modelo 1: predecir categoría ---
        input_df     = build_input_df(u)
        pred_enc     = pipeline.predict(input_df)[0]
        categoria    = le.inverse_transform([pred_enc])[0]
        proba        = pipeline.predict_proba(input_df)[0]
        probabilidades = {
            le.classes_[i]: round(float(p) * 100, 1)
            for i, p in enumerate(proba)
        }
        confianza = probabilidades[categoria]

        # --- Modelo 2: seleccionar premio específico ---
        mejor, todos_scores = seleccionar_premio(u, categoria)

        # Armar alternativas (2 premios siguientes en el ranking)
        alternativas = [
            {
                "premio":       a["premio"],
                "nombre":       NOMBRES_PREMIOS.get(a["premio"], a["premio"]),
                "afinidad":     a["score"],
            }
            for a in todos_scores[1:3]
        ]

        return {
            # Resultado principal
            "categoria":        categoria,
            "confianza_pct":    confianza,
            "premio_id":        mejor["premio"],
            "premio_nombre":    NOMBRES_PREMIOS.get(mejor["premio"], mejor["premio"]),
            "afinidad_pct":     mejor["score"],
            "razones":          mejor["razones"],

            # Contexto adicional
            "alternativas":     alternativas,
            "probabilidades":   probabilidades,

            # Top 3 categorías para mostrar en UI
            "top3_categorias": sorted(
                probabilidades.items(),
                key=lambda x: x[1],
                reverse=True
            )[:3],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/segmentar/batch")
def segmentar_batch(usuarios: list[PerfilUsuario]):
    """
    Procesa múltiples usuarios a la vez.
    Útil para demos con varios perfiles simultáneos.
    Máximo 50 usuarios por request.
    """
    if len(usuarios) > 50:
        raise HTTPException(
            status_code=400,
            detail="Máximo 50 usuarios por request"
        )
    return [segmentar(u) for u in usuarios]