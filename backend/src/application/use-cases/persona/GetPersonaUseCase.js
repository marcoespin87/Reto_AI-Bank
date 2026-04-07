class GetPersonaUseCase {
  constructor({ personaRepository }) {
    this.personaRepo = personaRepository;
  }

  async execute(id) {
    const persona = await this.personaRepo.findById(id);
    if (!persona) {
      throw { status: 404, message: `Persona con id ${id} no encontrada.` };
    }
    return persona;
  }
}

module.exports = GetPersonaUseCase;
