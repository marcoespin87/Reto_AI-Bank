class UpdatePersonaUseCase {
  constructor({ personaRepository }) {
    this.personaRepo = personaRepository;
  }

  async execute(id, data) {
    const persona = await this.personaRepo.findById(id);
    if (!persona) {
      throw { status: 404, message: `Persona con id ${id} no encontrada.` };
    }

    const updated = await this.personaRepo.update(id, data);
    return updated;
  }
}

module.exports = UpdatePersonaUseCase;
