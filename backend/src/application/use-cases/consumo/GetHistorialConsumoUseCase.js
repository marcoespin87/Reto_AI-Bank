class GetHistorialConsumoUseCase {
  constructor({ personaRepository, consumoRepository }) {
    this.personaRepo = personaRepository;
    this.consumoRepo = consumoRepository;
  }

  async execute(idPersona, options = {}) {
    const persona = await this.personaRepo.findById(idPersona);
    if (!persona) {
      throw { status: 404, message: `Persona con id ${idPersona} no encontrada.` };
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;

    const { rows, total } = await this.consumoRepo.findByPersonaId(idPersona, {
      page,
      limit,
      fecha_inicio: options.fecha_inicio,
      fecha_fin: options.fecha_fin
    });

    // Compute derived fields per consumo
    const consumos = rows.map(c => ({
      ...c,
      millas_generadas: Math.floor(parseFloat(c.monto)) * 8,
      puntos_generados: Math.floor(parseFloat(c.monto)) * 10,
      cromos_generados: Math.floor(parseFloat(c.monto) / 10)
    }));

    return {
      consumos,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = GetHistorialConsumoUseCase;
