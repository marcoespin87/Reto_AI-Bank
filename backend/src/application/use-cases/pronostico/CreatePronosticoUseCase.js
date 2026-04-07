class CreatePronosticoUseCase {
  constructor({ pronosticoRepository, perfilRepository, partidoRepository }) {
    this.pronosticoRepo = pronosticoRepository;
    this.perfilRepo = perfilRepository;
    this.partidoRepo = partidoRepository;
  }

  async execute(data) {
    const { id_perfil, id_partido, score_local, score_visitante, ganador } = data;

    if (score_local === undefined || score_visitante === undefined || !ganador) {
      throw { status: 400, message: 'score_local, score_visitante y ganador son requeridos.' };
    }

    if (score_local < 0 || score_visitante < 0) {
      throw { status: 400, message: 'Los scores no pueden ser negativos.' };
    }

    // Validate ganador consistency
    let ganadorEsperado;
    if (score_local > score_visitante) ganadorEsperado = 'local';
    else if (score_visitante > score_local) ganadorEsperado = 'visitante';
    else ganadorEsperado = 'empate';

    if (ganador !== ganadorEsperado) {
      throw { status: 400, message: `El campo ganador debe ser '${ganadorEsperado}' según el marcador pronosticado.` };
    }

    // Verify perfil exists
    const perfil = await this.perfilRepo.findById(id_perfil);
    if (!perfil) {
      throw { status: 404, message: `Perfil con id ${id_perfil} no encontrado.` };
    }

    // Verify partido exists and is pending
    const partido = await this.partidoRepo.findById(id_partido);
    if (!partido) {
      throw { status: 404, message: `Partido con id ${id_partido} no encontrado.` };
    }

    if (partido.estado === 'finalizado') {
      throw { status: 409, message: 'No se puede pronosticar un partido ya finalizado.' };
    }

    if (new Date(partido.fecha) <= new Date()) {
      throw { status: 409, message: 'No se puede pronosticar un partido que ya comenzó.' };
    }

    // Check uniqueness: one pronostico per perfil per partido
    const existing = await this.pronosticoRepo.findByPerfilAndPartido(id_perfil, id_partido);
    if (existing) {
      throw { status: 409, message: 'Ya existe un pronóstico de este perfil para este partido.' };
    }

    const pronostico = await this.pronosticoRepo.create({
      id_perfil,
      id_partido,
      score_local,
      score_visitante,
      ganador
    });

    return pronostico;
  }
}

module.exports = CreatePronosticoUseCase;
