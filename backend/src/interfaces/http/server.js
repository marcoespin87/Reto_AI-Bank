require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// ─── Repositories ───────────────────────────────────────────────────────────
const PgPersonaRepository = require('../../infrastructure/database/repositories/PgPersonaRepository');
const PgPerfilRepository = require('../../infrastructure/database/repositories/PgPerfilRepository');
const PgConsumoRepository = require('../../infrastructure/database/repositories/PgConsumoRepository');
const PgLigaRepository = require('../../infrastructure/database/repositories/PgLigaRepository');
const PgTemporadaRepository = require('../../infrastructure/database/repositories/PgTemporadaRepository');
const PgPartidoRepository = require('../../infrastructure/database/repositories/PgPartidoRepository');
const PgPronosticoRepository = require('../../infrastructure/database/repositories/PgPronosticoRepository');
const PgCromoRepository = require('../../infrastructure/database/repositories/PgCromoRepository');
const PgPremioRepository = require('../../infrastructure/database/repositories/PgPremioRepository');
const PgTransferenciaRepository = require('../../infrastructure/database/repositories/PgTransferenciaRepository');
const PgGrupoRepository = require('../../infrastructure/database/repositories/PgGrupoRepository');

// ─── Use Cases ───────────────────────────────────────────────────────────────
// Persona
const CreatePersonaUseCase = require('../../application/use-cases/persona/CreatePersonaUseCase');
const GetPersonaUseCase = require('../../application/use-cases/persona/GetPersonaUseCase');
const UpdatePersonaUseCase = require('../../application/use-cases/persona/UpdatePersonaUseCase');
// Perfil
const GetPerfilUseCase = require('../../application/use-cases/perfil/GetPerfilUseCase');
// Consumo
const CreateConsumoUseCase = require('../../application/use-cases/consumo/CreateConsumoUseCase');
const GetHistorialConsumoUseCase = require('../../application/use-cases/consumo/GetHistorialConsumoUseCase');
// Liga
const GetLigasUseCase = require('../../application/use-cases/liga/GetLigasUseCase');
const GetRankingLigaUseCase = require('../../application/use-cases/liga/GetRankingLigaUseCase');
// Temporada
const CreateTemporadaUseCase = require('../../application/use-cases/temporada/CreateTemporadaUseCase');
const GetTemporadasUseCase = require('../../application/use-cases/temporada/GetTemporadasUseCase');
const CerrarTemporadaUseCase = require('../../application/use-cases/temporada/CerrarTemporadaUseCase');
// Partido
const CreatePartidoUseCase = require('../../application/use-cases/partido/CreatePartidoUseCase');
const GetPartidosUseCase = require('../../application/use-cases/partido/GetPartidosUseCase');
const SetResultadoPartidoUseCase = require('../../application/use-cases/partido/SetResultadoPartidoUseCase');
// Pronostico
const CreatePronosticoUseCase = require('../../application/use-cases/pronostico/CreatePronosticoUseCase');
const GetPronosticosUseCase = require('../../application/use-cases/pronostico/GetPronosticosUseCase');
// Cromo
const GetCatalogoCromosUseCase = require('../../application/use-cases/cromo/GetCatalogoCromosUseCase');
const GetColeccionCromosUseCase = require('../../application/use-cases/cromo/GetColeccionCromosUseCase');
// Premio
const GetCatalogoPremiosUseCase = require('../../application/use-cases/premio/GetCatalogoPremiosUseCase');
const CanjearPremioUseCase = require('../../application/use-cases/premio/CanjearPremioUseCase');
// Transferencia
const CreateTransferenciaUseCase = require('../../application/use-cases/transferencia/CreateTransferenciaUseCase');
const GetHistorialTransferenciasUseCase = require('../../application/use-cases/transferencia/GetHistorialTransferenciasUseCase');
// Grupo
const CreateGrupoUseCase = require('../../application/use-cases/grupo/CreateGrupoUseCase');
const GetGrupoUseCase = require('../../application/use-cases/grupo/GetGrupoUseCase');
const JoinGrupoUseCase = require('../../application/use-cases/grupo/JoinGrupoUseCase');

// ─── Controllers ─────────────────────────────────────────────────────────────
const PersonaController = require('./controllers/PersonaController');
const PerfilController = require('./controllers/PerfilController');
const ConsumoController = require('./controllers/ConsumoController');
const LigaController = require('./controllers/LigaController');
const TemporadaController = require('./controllers/TemporadaController');
const PartidoController = require('./controllers/PartidoController');
const PronosticoController = require('./controllers/PronosticoController');
const CromoController = require('./controllers/CromoController');
const PremioController = require('./controllers/PremioController');
const TransferenciaController = require('./controllers/TransferenciaController');
const GrupoController = require('./controllers/GrupoController');

// ─── Routes ──────────────────────────────────────────────────────────────────
const personasRoutes = require('./routes/personas.routes');
const perfilRoutes = require('./routes/perfil.routes');
const consumoRoutes = require('./routes/consumo.routes');
const ligasRoutes = require('./routes/ligas.routes');
const temporadasRoutes = require('./routes/temporadas.routes');
const partidosRoutes = require('./routes/partidos.routes');
const pronosticosRoutes = require('./routes/pronosticos.routes');
const cromosRoutes = require('./routes/cromos.routes');
const premiosRoutes = require('./routes/premios.routes');
const transferenciasRoutes = require('./routes/transferencias.routes');
const gruposRoutes = require('./routes/grupos.routes');

// ─── Middlewares ─────────────────────────────────────────────────────────────
const errorHandler = require('./middlewares/errorHandler');

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger (optional – only if package is installed) ───────────────────────
try {
  const YAML = require('yamljs');
  const swaggerUi = require('swagger-ui-express');
  const swaggerPath = path.join(__dirname, '../../../../documentation/swagger.yaml');
  const swaggerDoc = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  console.log('Swagger UI disponible en /api-docs');
} catch (e) {
  console.warn('Swagger no disponible:', e.message);
}

// ─── DI Container ────────────────────────────────────────────────────────────

// Repositories
const personaRepository = new PgPersonaRepository();
const perfilRepository = new PgPerfilRepository();
const consumoRepository = new PgConsumoRepository();
const ligaRepository = new PgLigaRepository();
const temporadaRepository = new PgTemporadaRepository();
const partidoRepository = new PgPartidoRepository();
const pronosticoRepository = new PgPronosticoRepository();
const cromoRepository = new PgCromoRepository();
const premioRepository = new PgPremioRepository();
const transferenciaRepository = new PgTransferenciaRepository();
const grupoRepository = new PgGrupoRepository();

// Use Cases
const createPersonaUseCase = new CreatePersonaUseCase({ personaRepository, perfilRepository, ligaRepository });
const getPersonaUseCase = new GetPersonaUseCase({ personaRepository });
const updatePersonaUseCase = new UpdatePersonaUseCase({ personaRepository });

const getPerfilUseCase = new GetPerfilUseCase({ perfilRepository });

const createConsumoUseCase = new CreateConsumoUseCase({
  personaRepository, perfilRepository, consumoRepository, ligaRepository, cromoRepository
});
const getHistorialConsumoUseCase = new GetHistorialConsumoUseCase({ personaRepository, consumoRepository });

const getLigasUseCase = new GetLigasUseCase({ ligaRepository });
const getRankingLigaUseCase = new GetRankingLigaUseCase({ ligaRepository });

const createTemporadaUseCase = new CreateTemporadaUseCase({ temporadaRepository });
const getTemporadasUseCase = new GetTemporadasUseCase({ temporadaRepository });
const cerrarTemporadaUseCase = new CerrarTemporadaUseCase({ temporadaRepository });

const createPartidoUseCase = new CreatePartidoUseCase({ partidoRepository, temporadaRepository });
const getPartidosUseCase = new GetPartidosUseCase({ partidoRepository });
const setResultadoPartidoUseCase = new SetResultadoPartidoUseCase({ partidoRepository, pronosticoRepository });

const createPronosticoUseCase = new CreatePronosticoUseCase({ pronosticoRepository, perfilRepository, partidoRepository });
const getPronosticosUseCase = new GetPronosticosUseCase({ pronosticoRepository, perfilRepository });

const getCatalogoCromosUseCase = new GetCatalogoCromosUseCase({ cromoRepository });
const getColeccionCromosUseCase = new GetColeccionCromosUseCase({ cromoRepository, perfilRepository });

const getCatalogoPremiosUseCase = new GetCatalogoPremiosUseCase({ premioRepository, perfilRepository, personaRepository });
const canjearPremioUseCase = new CanjearPremioUseCase({ premioRepository, perfilRepository });

const createTransferenciaUseCase = new CreateTransferenciaUseCase({
  transferenciaRepository, perfilRepository, personaRepository, ligaRepository
});
const getHistorialTransferenciasUseCase = new GetHistorialTransferenciasUseCase({ transferenciaRepository, personaRepository });

const createGrupoUseCase = new CreateGrupoUseCase({ grupoRepository, perfilRepository });
const getGrupoUseCase = new GetGrupoUseCase({ grupoRepository });
const joinGrupoUseCase = new JoinGrupoUseCase({ grupoRepository, perfilRepository });

// Controllers
const personaController = new PersonaController({ createPersonaUseCase, getPersonaUseCase, updatePersonaUseCase });
const perfilController = new PerfilController({ getPerfilUseCase });
const consumoController = new ConsumoController({ createConsumoUseCase, getHistorialConsumoUseCase });
const ligaController = new LigaController({ getLigasUseCase, getRankingLigaUseCase });
const temporadaController = new TemporadaController({ createTemporadaUseCase, getTemporadasUseCase, cerrarTemporadaUseCase });
const partidoController = new PartidoController({ createPartidoUseCase, getPartidosUseCase, setResultadoPartidoUseCase });
const pronosticoController = new PronosticoController({ createPronosticoUseCase, getPronosticosUseCase });
const cromoController = new CromoController({ getCatalogoCromosUseCase, getColeccionCromosUseCase });
const premioController = new PremioController({ getCatalogoPremiosUseCase, canjearPremioUseCase });
const transferenciaController = new TransferenciaController({ createTransferenciaUseCase, getHistorialTransferenciasUseCase });
const grupoController = new GrupoController({ createGrupoUseCase, getGrupoUseCase, joinGrupoUseCase });

// DI Container object
const container = {
  personaController,
  perfilController,
  consumoController,
  ligaController,
  temporadaController,
  partidoController,
  pronosticoController,
  cromoController,
  premioController,
  transferenciaController,
  grupoController
};

// ─── Routes Registration ─────────────────────────────────────────────────────
const PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(`${PREFIX}/personas`, personasRoutes(container));
app.use(`${PREFIX}/perfil`, perfilRoutes(container));
app.use(`${PREFIX}/consumo`, consumoRoutes(container));
app.use(`${PREFIX}/ligas`, ligasRoutes(container));
app.use(`${PREFIX}/temporadas`, temporadasRoutes(container));
app.use(`${PREFIX}/partidos`, partidosRoutes(container));
app.use(`${PREFIX}/pronosticos`, pronosticosRoutes(container));
app.use(`${PREFIX}/cromos`, cromosRoutes(container));
app.use(`${PREFIX}/premios`, premiosRoutes(container));
app.use(`${PREFIX}/transferencias`, transferenciasRoutes(container));
app.use(`${PREFIX}/grupos`, gruposRoutes(container));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    timestamp: new Date().toISOString()
  });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AI Bank API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`API prefix: ${PREFIX}`);
  });
}

module.exports = app;
