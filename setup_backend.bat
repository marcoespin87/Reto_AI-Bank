@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   AI Bank Gamificacion - Backend Setup
echo   Arquitectura Hexagonal + Express.js
echo ============================================================
echo.

:: ──────────────────────────────────────────────────────────────
:: RAIZ
:: ──────────────────────────────────────────────────────────────
set ROOT=backend

cd /d "%~dp0"

:: ──────────────────────────────────────────────────────────────
:: CREAR DIRECTORIOS
:: ──────────────────────────────────────────────────────────────
echo [1/5] Creando estructura de carpetas...

md %ROOT%\src\domain\entities                               2>nul
md %ROOT%\src\domain\ports\repositories                     2>nul
md %ROOT%\src\domain\ports\services                         2>nul
md %ROOT%\src\domain\value-objects                          2>nul

md %ROOT%\src\application\use-cases\persona                 2>nul
md %ROOT%\src\application\use-cases\perfil                  2>nul
md %ROOT%\src\application\use-cases\consumo                 2>nul
md %ROOT%\src\application\use-cases\liga                    2>nul
md %ROOT%\src\application\use-cases\temporada               2>nul
md %ROOT%\src\application\use-cases\partido                 2>nul
md %ROOT%\src\application\use-cases\pronostico              2>nul
md %ROOT%\src\application\use-cases\cromo                   2>nul
md %ROOT%\src\application\use-cases\premio                  2>nul
md %ROOT%\src\application\use-cases\transferencia           2>nul
md %ROOT%\src\application\use-cases\grupo                   2>nul

md %ROOT%\src\application\dtos\persona                      2>nul
md %ROOT%\src\application\dtos\consumo                      2>nul
md %ROOT%\src\application\dtos\temporada                    2>nul
md %ROOT%\src\application\dtos\partido                      2>nul
md %ROOT%\src\application\dtos\pronostico                   2>nul
md %ROOT%\src\application\dtos\premio                       2>nul
md %ROOT%\src\application\dtos\transferencia                2>nul
md %ROOT%\src\application\dtos\grupo                        2>nul

md %ROOT%\src\infrastructure\database\repositories          2>nul
md %ROOT%\src\infrastructure\external                       2>nul

md %ROOT%\src\interfaces\http\controllers                   2>nul
md %ROOT%\src\interfaces\http\routes                        2>nul
md %ROOT%\src\interfaces\http\middlewares                   2>nul
md %ROOT%\src\interfaces\swagger                            2>nul

echo     OK - Carpetas creadas.

:: ──────────────────────────────────────────────────────────────
:: PACKAGE.JSON
:: ──────────────────────────────────────────────────────────────
echo [2/5] Generando archivos de configuracion...

(
echo {
echo   "name": "ai-bank-backend",
echo   "version": "1.0.0",
echo   "description": "Backend API - Sistema de Gamificacion AI Bank",
echo   "main": "src/interfaces/http/server.js",
echo   "scripts": {
echo     "start": "node src/interfaces/http/server.js",
echo     "dev": "nodemon src/interfaces/http/server.js",
echo     "test": "jest --runInBand --forceExit",
echo     "test:watch": "jest --watch"
echo   },
echo   "dependencies": {
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.4.5",
echo     "express": "^4.19.2",
echo     "express-validator": "^7.1.0",
echo     "pg": "^8.11.5",
echo     "swagger-ui-express": "^5.0.1",
echo     "yamljs": "^0.3.0",
echo     "axios": "^1.7.2",
echo     "morgan": "^1.10.0",
echo     "helmet": "^7.1.0"
echo   },
echo   "devDependencies": {
echo     "jest": "^29.7.0",
echo     "nodemon": "^3.1.0",
echo     "supertest": "^7.0.0"
echo   }
echo }
) > %ROOT%\package.json

:: ──────────────────────────────────────────────────────────────
:: .ENV.EXAMPLE
:: ──────────────────────────────────────────────────────────────
(
echo # Servidor
echo PORT=3000
echo NODE_ENV=development
echo.
echo # Base de Datos PostgreSQL
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=aibank_db
echo DB_USER=postgres
echo DB_PASSWORD=your_password
echo DB_SSL=false
echo.
echo # Microservicio ML
echo ML_SERVICE_URL=http://localhost:8000
echo ML_SERVICE_TIMEOUT=5000
echo.
echo # API version
echo API_PREFIX=/api/v1
) > %ROOT%\.env.example

:: ──────────────────────────────────────────────────────────────
:: .GITIGNORE
:: ──────────────────────────────────────────────────────────────
(
echo node_modules/
echo .env
echo coverage/
echo dist/
echo *.log
echo .DS_Store
) > %ROOT%\.gitignore

echo     OK - Archivos de configuracion listos.

:: ──────────────────────────────────────────────────────────────
:: INFRAESTRUCTURA - DB CONNECTION
:: ──────────────────────────────────────────────────────────────
echo [3/5] Generando capa de Infraestructura...

(
echo const { Pool } = require^('pg'^);
echo require^('dotenv'^).config^(^);
echo.
echo const pool = new Pool^({
echo   host:     process.env.DB_HOST     ^|^| 'localhost',
echo   port:     process.env.DB_PORT     ^|^| 5432,
echo   database: process.env.DB_NAME     ^|^| 'aibank_db',
echo   user:     process.env.DB_USER     ^|^| 'postgres',
echo   password: process.env.DB_PASSWORD ^|^| '',
echo   ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
echo }^);
echo.
echo pool.on^('error', ^(err^) =^> {
echo   console.error^('Error inesperado en el pool de PostgreSQL:', err^);
echo   process.exit^(-1^);
echo }^);
echo.
echo module.exports = pool;
) > %ROOT%\src\infrastructure\database\connection.js

:: ── Repositorios PG (stubs con comentarios de tabla BD) ──────

for %%E in (Persona Perfil Consumo Liga Temporada Partido Pronostico Cromo Premio Transferencia Grupo) do (
  set "entity=%%E"
  set "entity_lower=%%E"
  call :toLower entity_lower
  (
    echo // Adaptador: Repositorio PostgreSQL para la entidad !entity!
    echo // Tabla BD principal: ver BASE.txt
    echo // Implementa: I!entity!Repository ^(domain/ports/repositories^)
    echo const pool = require^('../connection'^);
    echo.
    echo class Pg!entity!Repository {
    echo   constructor^(^) {
    echo     this.pool = pool;
    echo   }
    echo.
    echo   // TODO: implementar metodos del puerto I!entity!Repository
    echo }
    echo.
    echo module.exports = Pg!entity!Repository;
  ) > %ROOT%\src\infrastructure\database\repositories\Pg%%ERepository.js
)

:: ── ML Service Adapter ────────────────────────────────────────
(
echo // Adaptador para el microservicio externo de ML
echo // Fase 1: clasifica al usuario en una macrocategoria de afinidad
echo // Contrato de entrada: buildMlPayload^(persona, perfil^) - ver documentation/dtos.js
echo const axios = require^('axios'^);
echo require^('dotenv'^).config^(^);
echo.
echo class MLServiceAdapter {
echo   constructor^(^) {
echo     this.baseUrl = process.env.ML_SERVICE_URL ^|^| 'http://localhost:8000';
echo     this.timeout = parseInt^(process.env.ML_SERVICE_TIMEOUT ^|^| '5000'^);
echo   }
echo.
echo   /**
echo    * Envia el perfil ML del usuario y obtiene su macrocategoria de afinidad.
echo    * @param {Object} mlPayload - Payload construido por buildMlPayload^(^)
echo    * @returns {Promise^<{categoria: string}^>}
echo    */
echo   async clasificarUsuario^(mlPayload^) {
echo     try {
echo       const response = await axios.post^(
echo         `${this.baseUrl}/predict`,
echo         mlPayload,
echo         { timeout: this.timeout }
echo       ^);
echo       return response.data;
echo     } catch ^(error^) {
echo       // Fallback graceful: si ML no esta disponible, no bloquear la API
echo       console.warn^('ML Service no disponible, usando fallback generico:', error.message^);
echo       return { categoria: null, fallback: true };
echo     }
echo   }
echo }
echo.
echo module.exports = MLServiceAdapter;
) > %ROOT%\src\infrastructure\external\MLServiceAdapter.js

echo     OK - Infraestructura lista.

:: ──────────────────────────────────────────────────────────────
:: DOMINIO - ENTIDADES
:: ──────────────────────────────────────────────────────────────

:: Entidad Persona
(
echo // Entidad de dominio: Persona
echo // Tabla BD: persona ^(id_persona, nombre, mail, celular, numero_cuenta, ...^)
echo class Persona {
echo   constructor^(data^) {
echo     this.id_persona              = data.id_persona;
echo     this.nombre                  = data.nombre;
echo     this.mail                    = data.mail;
echo     this.celular                 = data.celular;
echo     this.numero_cuenta           = data.numero_cuenta;
echo     this.nacimiento              = data.nacimiento;
echo     this.nacionalidad            = data.nacionalidad;
echo     this.residencia              = data.residencia;
echo     this.ciudad                  = data.ciudad;
echo     this.empresa                 = data.empresa;
echo     this.cargo                   = data.cargo;
echo     this.edad                    = data.edad;
echo     this.genero                  = data.genero;
echo     this.nivel_educacion         = data.nivel_educacion;
echo     this.ocupacion               = data.ocupacion;
echo     this.num_productos_bancarios = data.num_productos_bancarios ^|^| 0;
echo     this.score_crediticio        = data.score_crediticio;
echo     this.tiene_credito_activo    = data.tiene_credito_activo ^|^| false;
echo     this.tiene_cuenta_ahorro     = data.tiene_cuenta_ahorro ^|^| false;
echo     this.meses_sin_mora          = data.meses_sin_mora ^|^| 0;
echo     this.mailes_acumuladas       = data.mailes_acumuladas ^|^| 0;
echo     this.medalla_final           = data.medalla_final;
echo     this.estrellas_finales       = data.estrellas_finales ^|^| 0;
echo     this.predicciones_correctas_pct  = data.predicciones_correctas_pct;
echo     this.racha_maxima_predicciones   = data.racha_maxima_predicciones ^|^| 0;
echo     this.cromos_coleccionados        = data.cromos_coleccionados ^|^| 0;
echo     this.cromos_epicos_obtenidos     = data.cromos_epicos_obtenidos ^|^| 0;
echo     this.objetivos_completados       = data.objetivos_completados ^|^| 0;
echo     this.participo_en_grupo          = data.participo_en_grupo ^|^| false;
echo     this.rol_en_grupo                = data.rol_en_grupo;
echo     this.votos_emitidos              = data.votos_emitidos ^|^| 0;
echo     this.dias_activo_temporada       = data.dias_activo_temporada ^|^| 0;
echo     this.gasto_mensual_usd           = data.gasto_mensual_usd ^|^| 0;
echo     this.frecuencia_transacciones_mes   = data.frecuencia_transacciones_mes ^|^| 0;
echo     this.antiguedad_clientes_meses      = data.antiguedad_clientes_meses ^|^| 0;
echo     this.pct_gasto_tecnologia           = data.pct_gasto_tecnologia ^|^| 0;
echo     this.pct_gasto_viajes               = data.pct_gasto_viajes ^|^| 0;
echo     this.pct_gasto_restaurantes         = data.pct_gasto_restaurantes ^|^| 0;
echo     this.pct_gasto_entretenimiento      = data.pct_gasto_entretenimiento ^|^| 0;
echo     this.pct_gasto_supermercado         = data.pct_gasto_supermercado ^|^| 0;
echo     this.pct_gasto_salud                = data.pct_gasto_salud ^|^| 0;
echo     this.pct_gasto_educacion            = data.pct_gasto_educacion ^|^| 0;
echo     this.pct_gasto_hogar                = data.pct_gasto_hogar ^|^| 0;
echo     this.pct_gasto_otros                = data.pct_gasto_otros ^|^| 0;
echo     this.usa_app_movil                  = data.usa_app_movil ^|^| false;
echo     this.notificaciones_activadas       = data.notificaciones_activadas ^|^| false;
echo     this.sesiones_app_semana            = data.sesiones_app_semana ^|^| 0;
echo     this.compras_online_pct             = data.compras_online_pct;
echo     this.dispositivo_preferido          = data.dispositivo_preferido;
echo     this.fecha_creacion                 = data.fecha_creacion;
echo     this.updated_at                     = data.updated_at;
echo   }
echo }
echo module.exports = Persona;
) > %ROOT%\src\domain\entities\Persona.js

:: Entidad Perfil
(
echo // Entidad de dominio: Perfil
echo // Tabla BD: perfil ^(id_perfil, id_persona, username, fecha_inicio, millas, id_liga, puntos, updated_at^)
echo // Regla: millas = activo permanente ^| puntos = activo temporal ^(se reinicia por temporada^)
echo class Perfil {
echo   constructor^(data^) {
echo     this.id_perfil   = data.id_perfil;
echo     this.id_persona  = data.id_persona;
echo     this.username    = data.username;
echo     this.fecha_inicio = data.fecha_inicio;
echo     this.millas      = data.millas      ^|^| 0;
echo     this.id_liga     = data.id_liga;
echo     this.puntos      = data.puntos      ^|^| 0;
echo     this.updated_at  = data.updated_at;
echo   }
echo   // Regla: 1 Milla = $0.01 USD
echo   get millasEnUsd^(^) { return parseFloat^(^(this.millas * 0.01^).toFixed^(2^)^); }
echo }
echo module.exports = Perfil;
) > %ROOT%\src\domain\entities\Perfil.js

:: Entidades simples (stub)
for %%E in (Consumo Liga Temporada Partido Pronostico Cromo Premio Transferencia Grupo) do (
  (
    echo // Entidad de dominio: %%E
    echo // TODO: mapear campos desde tabla BD correspondiente en BASE.txt
    echo class %%E {
    echo   constructor^(data^) {
    echo     Object.assign^(this, data^);
    echo   }
    echo }
    echo module.exports = %%E;
  ) > %ROOT%\src\domain\entities\%%E.js
)

:: ── Value Objects ─────────────────────────────────────────────
(
echo // Value Object: Liga
echo // Umbrales definidos en Reglas de Negocio
echo const LIGAS = [
echo   { nombre: 'Bronce',   min: 0,     max: 4999   },
echo   { nombre: 'Plata',    min: 5000,  max: 14999  },
echo   { nombre: 'Oro',      min: 15000, max: 29999  },
echo   { nombre: 'Diamante', min: 30000, max: Infinity },
echo ];
echo.
echo function calcularLiga^(puntos^) {
echo   const liga = LIGAS.find^(l =^> puntos ^>= l.min ^&^& puntos ^<= l.max^);
echo   return liga ? liga.nombre : 'Bronce';
echo }
echo.
echo module.exports = { LIGAS, calcularLiga };
) > %ROOT%\src\domain\value-objects\Liga.js

(
echo // Value Object: RarezaCromo
echo // Drop rates: Comun 75%% ^| Raro 20%% ^| Epico 5%%
echo const DROP_RATES = { COMUN: 75, RARO: 20, EPICO: 5 };
echo.
echo function generarRareza^(^) {
echo   const roll = Math.random^(^) * 100;
echo   if ^(roll ^< 75^) return 'comun';
echo   if ^(roll ^< 95^) return 'raro';
echo   return 'epico';
echo }
echo.
echo module.exports = { DROP_RATES, generarRareza };
) > %ROOT%\src\domain\value-objects\RarezaCromo.js

:: ── Puertos (Interfaces) ──────────────────────────────────────
for %%E in (Persona Perfil Consumo Liga Temporada Partido Pronostico Cromo Premio Transferencia Grupo) do (
  (
    echo // Puerto (interfaz): I%%ERepository
    echo // Define el contrato que deben implementar todos los repositorios de %%E
    echo // Los adaptadores concretos viven en infrastructure/database/repositories/
    echo class I%%ERepository {
    echo   // Metodos a implementar en el adaptador concreto:
    echo   // findById^(id^)        async - Buscar por PK
    echo   // findAll^(filters^)    async - Listar con filtros opcionales
    echo   // create^(entity^)      async - Insertar
    echo   // update^(id, data^)    async - Actualizar
    echo   // delete^(id^)          async - Eliminar
    echo   throw new Error^('I%%ERepository es una interfaz. Implementa en Pg%%ERepository.'^);
    echo }
    echo module.exports = I%%ERepository;
  ) > %ROOT%\src\domain\ports\repositories\I%%ERepository.js
)

(
echo // Puerto: IMLService
echo // Contrato para el microservicio externo de clasificacion ML
echo class IMLService {
echo   /**
echo    * @param {Object} mlPayload - JSON construido por buildMlPayload^(persona, perfil^)
echo    * @returns {Promise^<{categoria: string, fallback: boolean}^>}
echo    */
echo   async clasificarUsuario^(mlPayload^) {
echo     throw new Error^('IMLService es una interfaz. Implementa en MLServiceAdapter.'^);
echo   }
echo }
echo module.exports = IMLService;
) > %ROOT%\src\domain\ports\services\IMLService.js

:: ──────────────────────────────────────────────────────────────
:: APLICACION - USE CASES
:: ──────────────────────────────────────────────────────────────

:: ── Persona ───────────────────────────────────────────────────
(
echo // US-01: Registrar persona y crear perfil automaticamente
echo // Regla: mail y numero_cuenta unicos
echo // Regla: perfil creado con millas=0, puntos=0, liga=Bronce
echo class CreatePersonaUseCase {
echo   constructor^(personaRepository, perfilRepository, ligaRepository^) {
echo     this.personaRepo = personaRepository;
echo     this.perfilRepo  = perfilRepository;
echo     this.ligaRepo    = ligaRepository;
echo   }
echo   async execute^(dto^) {
echo     // 1. Validar unicidad de mail y numero_cuenta
echo     // 2. INSERT en persona
echo     // 3. Obtener id_liga de Bronce
echo     // 4. INSERT en perfil con millas=0, puntos=0
echo     throw new Error^('TODO: implementar CreatePersonaUseCase'^);
echo   }
echo }
echo module.exports = CreatePersonaUseCase;
) > %ROOT%\src\application\use-cases\persona\CreatePersonaUseCase.js

(
echo // US-02: Actualizar datos demograficos de una persona
echo // Regla: NO modifica millas, puntos ni id_liga
echo class UpdatePersonaUseCase {
echo   constructor^(personaRepository^) {
echo     this.personaRepo = personaRepository;
echo   }
echo   async execute^(id, dto^) {
echo     // Solo campos demograficos permitidos por UpdatePersonaDto
echo     throw new Error^('TODO: implementar UpdatePersonaUseCase'^);
echo   }
echo }
echo module.exports = UpdatePersonaUseCase;
) > %ROOT%\src\application\use-cases\persona\UpdatePersonaUseCase.js

:: ── Perfil ────────────────────────────────────────────────────
(
echo // US-02: Consultar perfil gamificado completo
echo // Retorna: millas, millas_usd_equivalente, puntos, liga, persona
echo const { calcularLiga } = require^('../../../domain/value-objects/Liga'^);
echo class GetPerfilUseCase {
echo   constructor^(perfilRepository, personaRepository, ligaRepository^) {
echo     this.perfilRepo  = perfilRepository;
echo     this.personaRepo = personaRepository;
echo     this.ligaRepo    = ligaRepository;
echo   }
echo   async execute^(id_perfil^) {
echo     // 1. Buscar perfil
echo     // 2. Calcular liga en tiempo real segun puntos
echo     // 3. Calcular millas_usd_equivalente = millas * 0.01
echo     throw new Error^('TODO: implementar GetPerfilUseCase'^);
echo   }
echo }
echo module.exports = GetPerfilUseCase;
) > %ROOT%\src\application\use-cases\perfil\GetPerfilUseCase.js

:: ── Consumo ───────────────────────────────────────────────────
(
echo // US-03: Registrar consumo y distribuir recompensas atomicamente
echo // Regla: 8 Millas + 10 Puntos por $1 USD ^| 1 Cromo por $10 USD
echo const { calcularLiga } = require^('../../../domain/value-objects/Liga'^);
echo const { generarRareza } = require^('../../../domain/value-objects/RarezaCromo'^);
echo.
echo const MILLAS_POR_USD = 8;
echo const PUNTOS_POR_USD = 10;
echo.
echo class CreateConsumoUseCase {
echo   constructor^(consumoRepository, perfilRepository, ligaRepository, cromoRepository^) {
echo     this.consumoRepo = consumoRepository;
echo     this.perfilRepo  = perfilRepository;
echo     this.ligaRepo    = ligaRepository;
echo     this.cromoRepo   = cromoRepository;
echo   }
echo   async execute^(dto^) {
echo     const monto = dto.monto;
echo     if ^(monto ^<= 0^) throw new Error^('El monto debe ser mayor a 0.'^);
echo.
echo     const millasGeneradas = Math.floor^(monto^) * MILLAS_POR_USD;
echo     const puntosGenerados = Math.floor^(monto^) * PUNTOS_POR_USD;
echo     const cantCromos      = Math.floor^(monto / 10^);
echo     const cromos = Array.from^({ length: cantCromos }, ^(^) =^> ^({ rareza: generarRareza^(^) }^)^);
echo.
echo     // TODO: ejecutar en transaccion atomica:
echo     // 1. INSERT consumo
echo     // 2. UPDATE perfil.millas += millasGeneradas
echo     // 3. UPDATE perfil.puntos += puntosGenerados
echo     // 4. Recalcular y UPDATE perfil.id_liga
echo     // 5. INSERT logs_puntos ^(concepto: 'CONSUMO'^)
echo     // 6. INSERT cromosperfil x cantCromos
echo     // 7. INSERT perfilesliga si cambio de liga
echo     // 8. INSERT tagsconsumo si hay id_tag
echo     throw new Error^('TODO: implementar CreateConsumoUseCase'^);
echo   }
echo }
echo module.exports = CreateConsumoUseCase;
) > %ROOT%\src\application\use-cases\consumo\CreateConsumoUseCase.js

(
echo // US-04: Historial paginado de consumos de una persona
echo class GetConsumoHistorialUseCase {
echo   constructor^(consumoRepository^) {
echo     this.consumoRepo = consumoRepository;
echo   }
echo   async execute^(id_persona, filters^) {
echo     // filters: { page, limit, fecha_inicio, fecha_fin }
echo     throw new Error^('TODO: implementar GetConsumoHistorialUseCase'^);
echo   }
echo }
echo module.exports = GetConsumoHistorialUseCase;
) > %ROOT%\src\application\use-cases\consumo\GetConsumoHistorialUseCase.js

:: ── Liga ──────────────────────────────────────────────────────
(
echo // US-05: Ranking de usuarios en una liga o global
echo class GetRankingUseCase {
echo   constructor^(perfilRepository, ligaRepository^) {
echo     this.perfilRepo = perfilRepository;
echo     this.ligaRepo   = ligaRepository;
echo   }
echo   async execute^(id_liga, filters^) {
echo     // id_liga: null = ranking global
echo     // filters: { page, limit }
echo     throw new Error^('TODO: implementar GetRankingUseCase'^);
echo   }
echo }
echo module.exports = GetRankingUseCase;
) > %ROOT%\src\application\use-cases\liga\GetRankingUseCase.js

:: ── Temporada ─────────────────────────────────────────────────
(
echo // US-06: Crear temporada
echo // Regla: fecha_fin ^> fecha_inicio
echo // Regla: Solo puede existir una temporada activa a la vez
echo class CreateTemporadaUseCase {
echo   constructor^(temporadaRepository^) {
echo     this.temporadaRepo = temporadaRepository;
echo   }
echo   async execute^(dto^) {
echo     if ^(new Date^(dto.fecha_fin^) ^<= new Date^(dto.fecha_inicio^)^)
echo       throw new Error^('La fecha_fin debe ser posterior a fecha_inicio.'^);
echo     // Verificar que no haya temporada activa
echo     throw new Error^('TODO: implementar CreateTemporadaUseCase'^);
echo   }
echo }
echo module.exports = CreateTemporadaUseCase;
) > %ROOT%\src\application\use-cases\temporada\CreateTemporadaUseCase.js

(
echo // US-07: Cerrar temporada - operacion atomica
echo // Regla: guarda snapshot en logs_puntos ^(concepto CIERRE_TEMPORADA^)
echo // Regla: guarda foto en perfilesliga
echo // Regla: puntos = 0 para TODOS los perfiles
echo // Regla: millas permanecen intactas
echo class CerrarTemporadaUseCase {
echo   constructor^(temporadaRepository, perfilRepository, logsPuntosRepository^) {
echo     this.temporadaRepo   = temporadaRepository;
echo     this.perfilRepo      = perfilRepository;
echo     this.logsPuntosRepo  = logsPuntosRepository;
echo   }
echo   async execute^(id_temporada^) {
echo     // 1. Verificar que la temporada existe y esta activa
echo     // 2. Obtener todos los perfiles
echo     // 3. INSERT logs_puntos por cada perfil ^(concepto: 'CIERRE_TEMPORADA'^)
echo     // 4. INSERT perfilesliga por cada perfil
echo     // 5. UPDATE perfil.puntos = 0 para todos ^(MILLAS INTACTAS^)
echo     // 6. Marcar temporada como cerrada
echo     // TODO: implementar en una unica transaccion de BD
echo     throw new Error^('TODO: implementar CerrarTemporadaUseCase'^);
echo   }
echo }
echo module.exports = CerrarTemporadaUseCase;
) > %ROOT%\src\application\use-cases\temporada\CerrarTemporadaUseCase.js

:: ── Partido ───────────────────────────────────────────────────
(
echo // US-08: Crear partido
echo // Regla: id_pais_local != id_pais_visitante
echo class CreatePartidoUseCase {
echo   constructor^(partidoRepository, paisesRepository^) {
echo     this.partidoRepo = partidoRepository;
echo     this.paisesRepo  = paisesRepository;
echo   }
echo   async execute^(dto^) {
echo     if ^(dto.id_pais_local === dto.id_pais_visitante^)
echo       throw new Error^('El equipo local y visitante no pueden ser el mismo pais.'^);
echo     throw new Error^('TODO: implementar CreatePartidoUseCase'^);
echo   }
echo }
echo module.exports = CreatePartidoUseCase;
) > %ROOT%\src\application\use-cases\partido\CreatePartidoUseCase.js

(
echo // US-09: Registrar resultado y evaluar pronosticos automaticamente
echo // Regla: Acierto exacto ^(score + ganador^) = +500 Puntos
echo // Regla: Fallo = 0 Puntos. Sin deducciones.
echo const { calcularLiga } = require^('../../../domain/value-objects/Liga'^);
echo.
echo const PUNTOS_PRONOSTICO_CORRECTO = 500;
echo.
echo class RegistrarResultadoUseCase {
echo   constructor^(partidoRepository, pronosticoRepository, perfilRepository, logsPuntosRepository^) {
echo     this.partidoRepo    = partidoRepository;
echo     this.pronosticoRepo = pronosticoRepository;
echo     this.perfilRepo     = perfilRepository;
echo     this.logsPuntosRepo = logsPuntosRepository;
echo   }
echo   async execute^(id_partido, dto^) {
echo     // 1. Actualizar partido con resultado oficial
echo     // 2. Obtener todos los pronosticos del partido
echo     // 3. Por cada pronostico:
echo     //    a. Comparar score_local, score_visitante, ganador
echo     //    b. Si coincide: es_correcto=true, +500 puntos al perfil
echo     //    c. Si no: es_correcto=false, 0 puntos
echo     //    d. INSERT logs_puntos ^(concepto: 'PRONOSTICO_CORRECTO'^) si acierto
echo     //    e. Recalcular liga del perfil
echo     // 4. Actualizar estadisticas ML en persona
echo     throw new Error^('TODO: implementar RegistrarResultadoUseCase'^);
echo   }
echo }
echo module.exports = RegistrarResultadoUseCase;
) > %ROOT%\src\application\use-cases\partido\RegistrarResultadoUseCase.js

:: ── Pronostico ────────────────────────────────────────────────
(
echo // US-10: Registrar pronostico
echo // Regla: Solo partidos con fecha futura
echo // Regla: Un perfil, un pronostico por partido
echo // Regla: ganador debe ser consistente con scores
echo class CreatePronosticoUseCase {
echo   constructor^(pronosticoRepository, partidoRepository^) {
echo     this.pronosticoRepo = pronosticoRepository;
echo     this.partidoRepo    = partidoRepository;
echo   }
echo   async execute^(dto^) {
echo     const partido = await this.partidoRepo.findById^(dto.id_partido^);
echo     if ^(!partido^) throw new Error^('Partido no encontrado.'^);
echo     if ^(new Date^(partido.fecha^) ^<= new Date^(^)^)
echo       throw new Error^('No se puede pronosticar un partido cuya fecha ya paso.'^);
echo     // Validar ganador consistente con scores
echo     const ganadorEsperado = dto.score_local ^> dto.score_visitante ? 'local'
echo       : dto.score_visitante ^> dto.score_local ? 'visitante' : 'empate';
echo     if ^(dto.ganador !== ganadorEsperado^)
echo       throw new Error^(`El campo 'ganador' debe ser '${ganadorEsperado}'.`^);
echo     throw new Error^('TODO: implementar CreatePronosticoUseCase'^);
echo   }
echo }
echo module.exports = CreatePronosticoUseCase;
) > %ROOT%\src\application\use-cases\pronostico\CreatePronosticoUseCase.js

:: ── Cromo ─────────────────────────────────────────────────────
(
echo // US-11: Coleccion de cromos del usuario con estadisticas
echo class GetCromosPerfilUseCase {
echo   constructor^(cromoRepository^) {
echo     this.cromoRepo = cromoRepository;
echo   }
echo   async execute^(id_perfil, filters^) {
echo     // filters: { frecuencia, page, limit }
echo     throw new Error^('TODO: implementar GetCromosPerfilUseCase'^);
echo   }
echo }
echo module.exports = GetCromosPerfilUseCase;
) > %ROOT%\src\application\use-cases\cromo\GetCromosPerfilUseCase.js

:: ── Premio ────────────────────────────────────────────────────
(
echo // US-13: Catalogo de premios personalizado via ML
echo // Regla: si ML falla, retornar catalogo general con header X-ML-Fallback: true
echo class GetCatalogoPremiosUseCase {
echo   constructor^(premioRepository, perfilRepository, personaRepository, mlService^) {
echo     this.premioRepo  = premioRepository;
echo     this.perfilRepo  = perfilRepository;
echo     this.personaRepo = personaRepository;
echo     this.mlService   = mlService;
echo   }
echo   async execute^(id_perfil^) {
echo     // 1. Obtener perfil y persona
echo     // 2. buildMlPayload^(persona, perfil^)
echo     // 3. Llamar mlService.clasificarUsuario^(payload^)
echo     // 4. Filtrar premios por categoria + liga del usuario
echo     throw new Error^('TODO: implementar GetCatalogoPremiosUseCase'^);
echo   }
echo }
echo module.exports = GetCatalogoPremiosUseCase;
) > %ROOT%\src\application\use-cases\premio\GetCatalogoPremiosUseCase.js

(
echo // US-14: Canjear premio con millas
echo // Regla: millas es la UNICA moneda valida para canje
echo // Regla: perfil.millas >= millas_costo del premio
echo // Regla: operacion atomica ^(descuento + INSERT premios^)
echo class CanjearPremioUseCase {
echo   constructor^(premioRepository, perfilRepository^) {
echo     this.premioRepo = premioRepository;
echo     this.perfilRepo = perfilRepository;
echo   }
echo   async execute^(dto^) {
echo     // 1. Obtener perfil
echo     // 2. Obtener premio por id_premios
echo     // 3. Verificar perfil.millas >= premio.millas_costo
echo     // 4. Atomico: UPDATE perfil.millas -= millas_costo ^| INSERT premios
echo     throw new Error^('TODO: implementar CanjearPremioUseCase'^);
echo   }
echo }
echo module.exports = CanjearPremioUseCase;
) > %ROOT%\src\application\use-cases\premio\CanjearPremioUseCase.js

:: ── Transferencia ─────────────────────────────────────────────
(
echo // US-15: Registrar transferencia bancaria
echo // Regla: monto ^> 0 ^| emisor != receptor
echo // Regla: mailes_generados = floor^(monto^) * 8 al emisor
echo // Regla: estado inicial = 'Pendiente'
echo class CreateTransferenciaUseCase {
echo   constructor^(transferenciaRepository, perfilRepository, personaRepository^) {
echo     this.transferenciaRepo = transferenciaRepository;
echo     this.perfilRepo        = perfilRepository;
echo     this.personaRepo       = personaRepository;
echo   }
echo   async execute^(dto^) {
echo     if ^(dto.monto ^<= 0^) throw new Error^('El monto debe ser mayor a 0.'^);
echo     if ^(dto.id_persona_emisora === dto.id_persona_receptora^)
echo       throw new Error^('El emisor y receptor no pueden ser la misma persona.'^);
echo     const mailsGenerados = Math.floor^(dto.monto^) * 8;
echo     // 1. Verificar existencia de ambas personas
echo     // 2. INSERT transferencias con estado='Pendiente' y mailes_generados
echo     // 3. UPDATE perfil.millas del emisor += mailsGenerados
echo     throw new Error^('TODO: implementar CreateTransferenciaUseCase'^);
echo   }
echo }
echo module.exports = CreateTransferenciaUseCase;
) > %ROOT%\src\application\use-cases\transferencia\CreateTransferenciaUseCase.js

:: ── Grupo ─────────────────────────────────────────────────────
(
echo // US-16: Crear grupo
echo // Regla: nombre de grupo unico
echo // Nota BD: tabla grupo solo tiene id_perfil del creador
echo // Ver GAP DE DISEÑO en USER_STORIES.md ^(tabla grupomiembro sugerida^)
echo class CreateGrupoUseCase {
echo   constructor^(grupoRepository, personaRepository^) {
echo     this.grupoRepo   = grupoRepository;
echo     this.personaRepo = personaRepository;
echo   }
echo   async execute^(dto^) {
echo     // 1. Verificar nombre unico
echo     // 2. INSERT grupo
echo     // 3. UPDATE persona.participo_en_grupo=true, rol_en_grupo='lider'
echo     throw new Error^('TODO: implementar CreateGrupoUseCase'^);
echo   }
echo }
echo module.exports = CreateGrupoUseCase;
) > %ROOT%\src\application\use-cases\grupo\CreateGrupoUseCase.js

:: ──────────────────────────────────────────────────────────────
:: APLICACION - DTOs (validaciones alineadas al swagger)
:: ──────────────────────────────────────────────────────────────

(
echo const { body } = require^('express-validator'^);
echo.
echo const createPersonaRules = [
echo   body^('nombre'^).notEmpty^(^).withMessage^('nombre es requerido'^).trim^(^),
echo   body^('mail'^).isEmail^(^).withMessage^('mail invalido'^),
echo   body^('celular'^).notEmpty^(^).withMessage^('celular es requerido'^),
echo   body^('numero_cuenta'^).notEmpty^(^).withMessage^('numero_cuenta es requerido'^),
echo   body^('username'^).notEmpty^(^).isLength^({ min: 3, max: 50 }^).withMessage^('username: 3-50 chars'^),
echo   body^('edad'^).optional^(^).isInt^({ min: 0, max: 120 }^),
echo   body^('genero'^).optional^(^).isIn^(['M', 'F', 'otro']^),
echo   body^('nivel_educacion'^).optional^(^).isIn^(['primaria','secundaria','universitario','posgrado','ninguno']^),
echo   body^('dispositivo_preferido'^).optional^(^).isIn^(['Android','iOS','Web']^),
echo   body^('score_crediticio'^).optional^(^).isFloat^({ min: 0, max: 1000 }^),
echo ];
echo.
echo module.exports = { createPersonaRules };
) > %ROOT%\src\application\dtos\persona\CreatePersonaDto.js

(
echo const { body } = require^('express-validator'^);
echo const updatePersonaRules = [
echo   body^('nombre'^).optional^(^).trim^(^),
echo   body^('ciudad'^).optional^(^).trim^(^),
echo   body^('ocupacion'^).optional^(^).trim^(^),
echo   body^('nivel_educacion'^).optional^(^).isIn^(['primaria','secundaria','universitario','posgrado','ninguno']^),
echo   body^('dispositivo_preferido'^).optional^(^).isIn^(['Android','iOS','Web']^),
echo   body^('sesiones_app_semana'^).optional^(^).isInt^({ min: 0 }^),
echo   // BLOQUEADOS: millas, puntos, id_liga NO se aceptan en este DTO
echo ];
echo module.exports = { updatePersonaRules };
) > %ROOT%\src\application\dtos\persona\UpdatePersonaDto.js

(
echo const { body } = require^('express-validator'^);
echo const createConsumoRules = [
echo   body^('id_persona'^).isInt^({ min: 1 }^).withMessage^('id_persona requerido'^),
echo   body^('monto'^).isFloat^({ min: 0.01 }^).withMessage^('monto debe ser mayor a 0'^),
echo   body^('id_producto_persona'^).optional^(^).isInt^({ min: 1 }^),
echo   body^('diferido'^).optional^(^).isBoolean^(^),
echo   body^('id_tag'^).optional^(^).isInt^({ min: 1 }^),
echo ];
echo module.exports = { createConsumoRules };
) > %ROOT%\src\application\dtos\consumo\CreateConsumoDto.js

(
echo const { body } = require^('express-validator'^);
echo const createTemporadaRules = [
echo   body^('nombre'^).notEmpty^(^).withMessage^('nombre es requerido'^),
echo   body^('fecha_inicio'^).isDate^(^).withMessage^('fecha_inicio invalida'^),
echo   body^('fecha_fin'^).isDate^(^).withMessage^('fecha_fin invalida'^)
echo     .custom^(^(val, { req }^) =^> {
echo       if ^(new Date^(val^) ^<= new Date^(req.body.fecha_inicio^)^)
echo         throw new Error^('fecha_fin debe ser posterior a fecha_inicio'^);
echo       return true;
echo     }^),
echo ];
echo module.exports = { createTemporadaRules };
) > %ROOT%\src\application\dtos\temporada\CreateTemporadaDto.js

(
echo const { body } = require^('express-validator'^);
echo const createPartidoRules = [
echo   body^('id_pais_local'^).isInt^({ min: 1 }^),
echo   body^('id_pais_visitante'^).isInt^({ min: 1 }^)
echo     .custom^(^(val, { req }^) =^> {
echo       if ^(val === req.body.id_pais_local^)
echo         throw new Error^('Local y visitante no pueden ser el mismo pais'^);
echo       return true;
echo     }^),
echo   body^('fecha'^).isISO8601^(^).withMessage^('fecha invalida'^),
echo   body^('id_temporada'^).isInt^({ min: 1 }^),
echo ];
echo const resultadoPartidoRules = [
echo   body^('goles_local'^).isInt^({ min: 0 }^),
echo   body^('goles_visitante'^).isInt^({ min: 0 }^),
echo   body^('ganador'^).isIn^(['local','visitante','empate']^)
echo     .custom^(^(val, { req }^) =^> {
echo       const gl = req.body.goles_local, gv = req.body.goles_visitante;
echo       const esperado = gl ^> gv ? 'local' : gv ^> gl ? 'visitante' : 'empate';
echo       if ^(val !== esperado^) throw new Error^(`ganador debe ser '${esperado}'`^);
echo       return true;
echo     }^),
echo ];
echo module.exports = { createPartidoRules, resultadoPartidoRules };
) > %ROOT%\src\application\dtos\partido\CreatePartidoDto.js

(
echo const { body } = require^('express-validator'^);
echo const createPronosticoRules = [
echo   body^('id_perfil'^).isInt^({ min: 1 }^),
echo   body^('id_partido'^).isInt^({ min: 1 }^),
echo   body^('score_local'^).isInt^({ min: 0 }^),
echo   body^('score_visitante'^).isInt^({ min: 0 }^),
echo   body^('ganador'^).isIn^(['local','visitante','empate']^)
echo     .custom^(^(val, { req }^) =^> {
echo       const sl = req.body.score_local, sv = req.body.score_visitante;
echo       const esperado = sl ^> sv ? 'local' : sv ^> sl ? 'visitante' : 'empate';
echo       if ^(val !== esperado^) throw new Error^(`ganador debe ser '${esperado}'`^);
echo       return true;
echo     }^),
echo ];
echo module.exports = { createPronosticoRules };
) > %ROOT%\src\application\dtos\pronostico\CreatePronosticoDto.js

(
echo const { body } = require^('express-validator'^);
echo // Regla: usa id_premios ^(PK real de tabla premios^), no id_premio_catalogo
echo const canjearPremioRules = [
echo   body^('id_perfil'^).isInt^({ min: 1 }^),
echo   body^('id_premios'^).isInt^({ min: 1 }^).withMessage^('id_premios ^(PK tabla premios^) es requerido'^),
echo ];
echo module.exports = { canjearPremioRules };
) > %ROOT%\src\application\dtos\premio\CanjearPremioDto.js

(
echo const { body } = require^('express-validator'^);
echo const createTransferenciaRules = [
echo   body^('id_persona_emisora'^).isInt^({ min: 1 }^),
echo   body^('id_persona_receptora'^).isInt^({ min: 1 }^)
echo     .custom^(^(val, { req }^) =^> {
echo       if ^(val === req.body.id_persona_emisora^)
echo         throw new Error^('Emisor y receptor no pueden ser la misma persona'^);
echo       return true;
echo     }^),
echo   body^('monto'^).isFloat^({ min: 0.01 }^).withMessage^('monto debe ser mayor a 0'^),
echo ];
echo module.exports = { createTransferenciaRules };
) > %ROOT%\src\application\dtos\transferencia\CreateTransferenciaDto.js

(
echo const { body } = require^('express-validator'^);
echo const createGrupoRules = [
echo   body^('nombre'^).notEmpty^(^).trim^(^).withMessage^('nombre es requerido'^),
echo   body^('id_perfil'^).isInt^({ min: 1 }^),
echo ];
echo module.exports = { createGrupoRules };
) > %ROOT%\src\application\dtos\grupo\CreateGrupoDto.js

:: ──────────────────────────────────────────────────────────────
:: INTERFACES - EXPRESS APP
:: ──────────────────────────────────────────────────────────────
echo [4/5] Generando capa de Interfaces HTTP...

(
echo const express    = require^('express'^);
echo const cors       = require^('cors'^);
echo const helmet     = require^('helmet'^);
echo const morgan     = require^('morgan'^);
echo const { setupSwagger } = require^('../swagger/swagger'^);
echo const router     = require^('./routes/index'^);
echo const notFound   = require^('./middlewares/notFound'^);
echo const errorHandler = require^('./middlewares/errorHandler'^);
echo.
echo const app = express^(^);
echo.
echo // Middlewares globales
echo app.use^(helmet^(^)^);
echo app.use^(cors^(^)^);
echo app.use^(morgan^('dev'^)^);
echo app.use^(express.json^(^)^);
echo.
echo // Swagger UI
echo setupSwagger^(app^);
echo.
echo // Rutas API v1
echo app.use^(process.env.API_PREFIX ^|^| '/api/v1', router^);
echo.
echo // Middlewares de error
echo app.use^(notFound^);
echo app.use^(errorHandler^);
echo.
echo module.exports = app;
) > %ROOT%\src\interfaces\http\app.js

(
echo require^('dotenv'^).config^(^);
echo const app  = require^('./app'^);
echo const port = process.env.PORT ^|^| 3000;
echo.
echo app.listen^(port, ^(^) =^> {
echo   console.log^(`AI Bank API corriendo en http://localhost:${port}/api/v1`^);
echo   console.log^(`Swagger UI en            http://localhost:${port}/api-docs`^);
echo }^);
) > %ROOT%\src\interfaces\http\server.js

:: ── Swagger Setup ─────────────────────────────────────────────
(
echo const swaggerUi = require^('swagger-ui-express'^);
echo const YAML      = require^('yamljs'^);
echo const path      = require^('path'^);
echo.
echo function setupSwagger^(app^) {
echo   // Carga el swagger.yaml desde la carpeta documentation/
echo   const swaggerDoc = YAML.load^(path.join^(__dirname, '../../../../documentation/swagger.yaml'^)^);
echo   app.use^('/api-docs', swaggerUi.serve, swaggerUi.setup^(swaggerDoc, {
echo     customSiteTitle: 'AI Bank Gamificacion API',
echo     swaggerOptions: { docExpansion: 'none' },
echo   }^)^);
echo   console.log^('Swagger disponible en /api-docs'^);
echo }
echo.
echo module.exports = { setupSwagger };
) > %ROOT%\src\interfaces\swagger\swagger.js

:: ── Middlewares ───────────────────────────────────────────────
(
echo const { validationResult } = require^('express-validator'^);
echo.
echo function validateDto^(req, res, next^) {
echo   const errors = validationResult^(req^);
echo   if ^(!errors.isEmpty^(^)^) {
echo     return res.status^(400^).json^({
echo       statusCode: 400,
echo       error: 'Bad Request',
echo       message: errors.array^(^)[0].msg,
echo       details: errors.array^(^),
echo     }^);
echo   }
echo   next^(^);
echo }
echo.
echo module.exports = validateDto;
) > %ROOT%\src\interfaces\http\middlewares\validateDto.js

(
echo function notFound^(req, res^) {
echo   res.status^(404^).json^({
echo     statusCode: 404,
echo     error: 'Not Found',
echo     message: `Ruta ${req.method} ${req.originalUrl} no encontrada.`,
echo   }^);
echo }
echo module.exports = notFound;
) > %ROOT%\src\interfaces\http\middlewares\notFound.js

(
echo // eslint-disable-next-line no-unused-vars
echo function errorHandler^(err, req, res, next^) {
echo   console.error^('[ErrorHandler]', err.message^);
echo   const status = err.statusCode ^|^| 500;
echo   res.status^(status^).json^({
echo     statusCode: status,
echo     error: err.name ^|^| 'Internal Server Error',
echo     message: err.message ^|^| 'Error interno del servidor.',
echo   }^);
echo }
echo module.exports = errorHandler;
) > %ROOT%\src\interfaces\http\middlewares\errorHandler.js

:: ── Router Principal ──────────────────────────────────────────
(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo.
echo router.use^('/personas',      require^('./persona.routes'^)^);
echo router.use^('/perfil',        require^('./perfil.routes'^)^);
echo router.use^('/consumo',       require^('./consumo.routes'^)^);
echo router.use^('/ligas',         require^('./liga.routes'^)^);
echo router.use^('/temporadas',    require^('./temporada.routes'^)^);
echo router.use^('/partidos',      require^('./partido.routes'^)^);
echo router.use^('/pronosticos',   require^('./pronostico.routes'^)^);
echo router.use^('/cromos',        require^('./cromo.routes'^)^);
echo router.use^('/premios',       require^('./premio.routes'^)^);
echo router.use^('/transferencias',require^('./transferencia.routes'^)^);
echo router.use^('/grupos',        require^('./grupo.routes'^)^);
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\index.js

:: ── Routes (una por modulo) ───────────────────────────────────
(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/persona.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { createPersonaRules } = require^('../../../application/dtos/persona/CreatePersonaDto'^);
echo const { updatePersonaRules } = require^('../../../application/dtos/persona/UpdatePersonaDto'^);
echo.
echo router.post^('/',    createPersonaRules, validateDto, ctrl.create^);   // US-01
echo router.get^('/:id', ctrl.findById^);
echo router.patch^('/:id', updatePersonaRules, validateDto, ctrl.update^);  // US-02
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\persona.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/perfil.controller'^);
echo.
echo router.get^('/:id',               ctrl.findById^);            // US-02
echo router.get^('/persona/:id_persona', ctrl.findByPersona^);
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\perfil.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/consumo.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { createConsumoRules } = require^('../../../application/dtos/consumo/CreateConsumoDto'^);
echo.
echo router.post^('/',                    createConsumoRules, validateDto, ctrl.create^);  // US-03
echo router.get^('/persona/:id_persona',  ctrl.findByPersona^);                           // US-04
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\consumo.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/liga.controller'^);
echo.
echo router.get^('/',               ctrl.findAll^);           // Listar ligas
echo router.get^('/ranking/global', ctrl.rankingGlobal^);    // US-05 global
echo router.get^('/:id/ranking',    ctrl.rankingByLiga^);    // US-05 por liga
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\liga.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/temporada.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { createTemporadaRules } = require^('../../../application/dtos/temporada/CreateTemporadaDto'^);
echo.
echo router.get^('/',           ctrl.findAll^);                                       // Listar
echo router.post^('/',          createTemporadaRules, validateDto, ctrl.create^);     // US-06
echo router.get^('/activa',     ctrl.findActiva^);
echo router.post^('/:id/cerrar', ctrl.cerrar^);                                       // US-07
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\temporada.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/partido.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { createPartidoRules, resultadoPartidoRules } = require^('../../../application/dtos/partido/CreatePartidoDto'^);
echo.
echo router.get^('/',         ctrl.findAll^);                                           // Listar
echo router.post^('/',        createPartidoRules, validateDto, ctrl.create^);           // US-08
echo router.get^('/:id',      ctrl.findById^);
echo router.put^('/:id/resultado', resultadoPartidoRules, validateDto, ctrl.resultado^); // US-09
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\partido.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/pronostico.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { createPronosticoRules } = require^('../../../application/dtos/pronostico/CreatePronosticoDto'^);
echo.
echo router.post^('/',                  createPronosticoRules, validateDto, ctrl.create^); // US-10
echo router.get^('/perfil/:id_perfil',  ctrl.findByPerfil^);
echo router.get^('/:id',                ctrl.findById^);
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\pronostico.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/cromo.controller'^);
echo.
echo router.get^('/',              ctrl.findAll^);            // US-12 catalogo global
echo router.get^('/perfil/:id',    ctrl.findByPerfil^);      // US-11 coleccion usuario
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\cromo.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/premio.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { canjearPremioRules } = require^('../../../application/dtos/premio/CanjearPremioDto'^);
echo.
echo router.get^('/',        ctrl.catalogo^);                               // US-13 ML personalizado
echo router.post^('/canjear', canjearPremioRules, validateDto, ctrl.canjear^); // US-14
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\premio.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/transferencia.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { createTransferenciaRules } = require^('../../../application/dtos/transferencia/CreateTransferenciaDto'^);
echo.
echo router.post^('/',                   createTransferenciaRules, validateDto, ctrl.create^); // US-15
echo router.get^('/persona/:id_persona', ctrl.findByPersona^);
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\transferencia.routes.js

(
echo const { Router } = require^('express'^);
echo const router = Router^(^);
echo const ctrl   = require^('../controllers/grupo.controller'^);
echo const validateDto = require^('../middlewares/validateDto'^);
echo const { createGrupoRules } = require^('../../../application/dtos/grupo/CreateGrupoDto'^);
echo.
echo router.post^('/',           createGrupoRules, validateDto, ctrl.create^); // US-16
echo router.get^('/:id',         ctrl.findById^);
echo router.post^('/:id/miembros', ctrl.addMiembro^);
echo.
echo module.exports = router;
) > %ROOT%\src\interfaces\http\routes\grupo.routes.js

:: ── Controllers (stubs con patron use-case) ───────────────────
(
echo // Controller: Persona
echo // Patron: recibe req/res, delega logica al UseCase correspondiente
echo class PersonaController {
echo   create  = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CreatePersonaUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findById = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetPersonaUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo   update  = async ^(req, res, next^) =^> { try { res.json^({ todo: 'UpdatePersonaUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new PersonaController^(^);
) > %ROOT%\src\interfaces\http\controllers\persona.controller.js

(
echo class PerfilController {
echo   findById    = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetPerfilUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo   findByPersona = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetPerfilByPersonaUseCase' }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new PerfilController^(^);
) > %ROOT%\src\interfaces\http\controllers\perfil.controller.js

(
echo class ConsumoController {
echo   create       = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CreateConsumoUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findByPersona = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetConsumoHistorialUseCase' }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new ConsumoController^(^);
) > %ROOT%\src\interfaces\http\controllers\consumo.controller.js

(
echo class LigaController {
echo   findAll      = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetLigasUseCase' }^); } catch^(e^) { next^(e^); } };
echo   rankingByLiga = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetRankingUseCase', id_liga: req.params.id }^); } catch^(e^) { next^(e^); } };
echo   rankingGlobal = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetRankingUseCase', global: true }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new LigaController^(^);
) > %ROOT%\src\interfaces\http\controllers\liga.controller.js

(
echo class TemporadaController {
echo   findAll  = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetTemporadasUseCase' }^); } catch^(e^) { next^(e^); } };
echo   create   = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CreateTemporadaUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findActiva = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetTemporadaActivaUseCase' }^); } catch^(e^) { next^(e^); } };
echo   cerrar   = async ^(req, res, next^) =^> { try { res.json^({ todo: 'CerrarTemporadaUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new TemporadaController^(^);
) > %ROOT%\src\interfaces\http\controllers\temporada.controller.js

(
echo class PartidoController {
echo   findAll  = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetPartidosUseCase' }^); } catch^(e^) { next^(e^); } };
echo   create   = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CreatePartidoUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findById = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetPartidoUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo   resultado = async ^(req, res, next^) =^> { try { res.json^({ todo: 'RegistrarResultadoUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new PartidoController^(^);
) > %ROOT%\src\interfaces\http\controllers\partido.controller.js

(
echo class PronosticoController {
echo   create      = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CreatePronosticoUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findByPerfil = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetPronosticosUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findById    = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetPronosticoUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new PronosticoController^(^);
) > %ROOT%\src\interfaces\http\controllers\pronostico.controller.js

(
echo class CromoController {
echo   findAll    = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetCromosCatalogoUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findByPerfil = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetCromosPerfilUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new CromoController^(^);
) > %ROOT%\src\interfaces\http\controllers\cromo.controller.js

(
echo class PremioController {
echo   catalogo = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetCatalogoPremiosUseCase', id_perfil: req.query.id_perfil }^); } catch^(e^) { next^(e^); } };
echo   canjear  = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CanjearPremioUseCase' }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new PremioController^(^);
) > %ROOT%\src\interfaces\http\controllers\premio.controller.js

(
echo class TransferenciaController {
echo   create       = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CreateTransferenciaUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findByPersona = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetTransferenciasUseCase' }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new TransferenciaController^(^);
) > %ROOT%\src\interfaces\http\controllers\transferencia.controller.js

(
echo class GrupoController {
echo   create    = async ^(req, res, next^) =^> { try { res.status^(201^).json^({ todo: 'CreateGrupoUseCase' }^); } catch^(e^) { next^(e^); } };
echo   findById  = async ^(req, res, next^) =^> { try { res.json^({ todo: 'GetGrupoUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo   addMiembro = async ^(req, res, next^) =^> { try { res.json^({ todo: 'AddMiembroGrupoUseCase', id: req.params.id }^); } catch^(e^) { next^(e^); } };
echo }
echo module.exports = new GrupoController^(^);
) > %ROOT%\src\interfaces\http\controllers\grupo.controller.js

:: ──────────────────────────────────────────────────────────────
:: NPM INSTALL
:: ──────────────────────────────────────────────────────────────
echo [5/5] Instalando dependencias npm...
cd %ROOT%
call npm install
cd ..

echo.
echo ============================================================
echo   SETUP COMPLETADO EXITOSAMENTE
echo ============================================================
echo.
echo   Estructura creada en: %ROOT%\
echo.
echo   Proximos pasos:
echo   1. Copiar .env.example a .env y completar credenciales de BD
echo   2. Ejecutar: cd backend ^&^& npm run dev
echo   3. Swagger UI: http://localhost:3000/api-docs
echo   4. Implementar los TODOs en cada UseCase y Repository
echo.
echo   Arquitectura:
echo   domain^/       = Entidades + Puertos ^(contratos^)
echo   application^/  = Use Cases + DTOs ^(logica de negocio^)
echo   infrastructure^/= Repositorios PG + Adaptador ML
echo   interfaces^/   = Controllers + Routes + Swagger ^(Express^)
echo.
pause
goto :eof

:: ──────────────────────────────────────────────────────────────
:: SUBRUTINA toLower (no usada activamente, referencia)
:: ──────────────────────────────────────────────────────────────
:toLower
for %%a in (a b c d e f g h i j k l m n o p q r s t u v w x y z) do (
  call set "%1=%%%1:%%a=%%a%%"
)
goto :eof
