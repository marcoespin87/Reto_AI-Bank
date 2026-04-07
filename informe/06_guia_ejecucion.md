# Guía de Ejecución

## Requisitos previos

| Herramienta | Versión mínima | Para qué |
|---|---|---|
| Node.js | 18+ | Correr la app Expo |
| Python | 3.9+ | Correr el modelo ML |
| pip | — | Instalar dependencias Python |
| Expo Go | Última | Ver la app en dispositivo físico |
| Xcode (Mac) | 14+ | Simulador iOS |

---

## Estructura de terminales necesarias

Para que todo funcione al mismo tiempo necesitas **2 terminales abiertas**:

```
Terminal 1                    Terminal 2
──────────────                ──────────────────
API FastAPI                   App Expo
(debe quedar abierta)         (debe quedar abierta)
```

---

## Paso 1 — Iniciar la API del modelo

Abre la **Terminal 1** y ejecuta:

```bash
cd /Users/mariaemiliarivadeneira/Documents/RETO/Reto_AI-Bank/modelo_segmentacion

# Primera vez: instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor
uvicorn api:app --port 8000
```

**Señal de éxito:**
```
✅ Modelos cargados correctamente
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Verificar que funciona** (en el navegador):
```
http://localhost:8000/health     → debe mostrar {"status":"ok",...}
http://localhost:8000/docs       → documentación interactiva de la API
```

> No cierres esta terminal. Si la cierras, la API se detiene y la pantalla de premios no funcionará.

---

## Paso 2 — Iniciar la app Expo

Abre la **Terminal 2** y ejecuta:

```bash
cd /Users/mariaemiliarivadeneira/Documents/RETO/Reto_AI-Bank/projectAibank

# Primera vez: instalar dependencias
npm install

# Iniciar Expo
npx expo start
```

**Señal de éxito:**
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## Paso 3 — Abrir la app

### Opción A — Simulador iOS (recomendado en Mac)
```
En la Terminal 2, presiona: i
```
Se abre automáticamente el simulador de iPhone.

### Opción B — Dispositivo físico
1. Instala **Expo Go** desde App Store o Play Store
2. Escanea el código QR que muestra la Terminal 2
3. **Importante**: cambia la URL de la API antes de correr Expo:

```bash
# Encuentra tu IP local
ipconfig getifaddr en0
# Resultado ejemplo: 192.168.1.45
```

Edita `projectAibank/lib/api.ts`:
```ts
export const SEGMENTACION_API_URL = 'http://192.168.1.45:8000';
//                                            ↑ tu IP local
```

### Opción C — Simulador Android
```
En la Terminal 2, presiona: a
(Requiere Android Studio instalado)
```

---

## Flujo de uso de la app

```
1. Abre la app
2. Regístrate o inicia sesión
        ↓
3. Pantalla de Inicio
   → Revisa tu saldo y mAiles
        ↓
4. Ve a Banco
   → Realiza una transacción (ej. $50)
   → Recibirás mAiles + cromos (animación de sobre)
        ↓
5. Ve a Álbum
   → Ve los cromos que has coleccionado
        ↓
6. Ve a Mundial
   → Predice el resultado de un partido
        ↓
7. Ve a Grupo
   → Crea un grupo o únete con un código
        ↓
8. Ve a Perfil → "Mi Premio de Temporada"
   → El modelo ML analiza tu perfil
   → Ve tu premio personalizado
```

---

## Solución de problemas comunes

### "No se pudo conectar" en pantalla de Premios
```
Causa:    La API de FastAPI no está corriendo
Solución: Abre Terminal 1 y ejecuta uvicorn api:app --port 8000
```

### "Failed to connect to localhost" en dispositivo físico
```
Causa:    El teléfono no puede alcanzar 'localhost' de tu computadora
Solución: Usa la IP local de tu máquina en lib/api.ts
          ipconfig getifaddr en0  →  copia esa IP
```

### "Module not found" al instalar Python
```
Causa:    Falta alguna dependencia del modelo
Solución: pip install -r requirements.txt
          o: pip install uvicorn fastapi joblib scikit-learn lightgbm xgboost pandas numpy
```

### La app no recarga cambios
```
Solución: Presiona 'r' en la terminal de Expo para recargar
```

### Error de sesión / no redirige al login
```
Solución: Presiona 'r' en la terminal de Expo para reiniciar
          o abre el menú de Expo Go y recarga manualmente
```

---

## Variables de configuración

| Archivo | Variable | Valor por defecto | Cambiar cuando... |
|---|---|---|---|
| `lib/api.ts` | `SEGMENTACION_API_URL` | `http://localhost:8000` | Usas dispositivo físico |
| `lib/supabase.ts` | `supabaseUrl` | URL del proyecto | Cambias de proyecto Supabase |
