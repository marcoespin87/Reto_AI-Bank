class GetHistorialTransferenciasUseCase {
  constructor({ transferenciaRepository, personaRepository }) {
    this.transferenciaRepo = transferenciaRepository;
    this.personaRepo = personaRepository;
  }

  async execute(idPersona, options = {}) {
    const persona = await this.personaRepo.findById(idPersona);
    if (!persona) {
      throw { status: 404, message: `Persona con id ${idPersona} no encontrada.` };
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;

    const { rows, total } = await this.transferenciaRepo.findByPersonaId(idPersona, { page, limit });

    // Enrich with millas info
    const transferencias = rows.map(t => ({
      ...t,
      millas_generadas: t.id_persona_emisora === parseInt(idPersona, 10)
        ? Math.floor(parseFloat(t.monto)) * 8
        : 0,
      tipo: t.id_persona_emisora === parseInt(idPersona, 10) ? 'enviada' : 'recibida'
    }));

    return {
      transferencias,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = GetHistorialTransferenciasUseCase;
