const pool = require('../../../infrastructure/database/connection');

class CreatePartidoUseCase {
  constructor({ partidoRepository, temporadaRepository }) {
    this.partidoRepo = partidoRepository;
    this.temporadaRepo = temporadaRepository;
  }

  async execute(data) {
    const { id_temporada, id_pais_local, id_pais_visitante, fecha } = data;

    if (!id_temporada || !id_pais_local || !id_pais_visitante || !fecha) {
      throw { status: 400, message: 'id_temporada, id_pais_local, id_pais_visitante y fecha son requeridos.' };
    }

    if (Number(id_pais_local) === Number(id_pais_visitante)) {
      throw { status: 400, message: 'El equipo local y visitante no pueden ser el mismo país.' };
    }

    const temporada = await this.temporadaRepo.findById(id_temporada);
    if (!temporada) {
      throw { status: 404, message: `Temporada con id ${id_temporada} no encontrada.` };
    }

    // Validar que los paises existen
    const paisLocal = await pool.query('SELECT id_paises FROM paises WHERE id_paises=$1', [id_pais_local]);
    if (!paisLocal.rows[0]) throw { status: 404, message: `País local con id ${id_pais_local} no encontrado.` };

    const paisVisitante = await pool.query('SELECT id_paises FROM paises WHERE id_paises=$1', [id_pais_visitante]);
    if (!paisVisitante.rows[0]) throw { status: 404, message: `País visitante con id ${id_pais_visitante} no encontrado.` };

    const partido = await this.partidoRepo.create({ id_temporada, id_pais_local, id_pais_visitante, fecha });
    return partido;
  }
}

module.exports = CreatePartidoUseCase;
