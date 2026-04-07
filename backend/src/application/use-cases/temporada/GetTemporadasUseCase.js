class GetTemporadasUseCase {
  constructor({ temporadaRepository }) {
    this.temporadaRepo = temporadaRepository;
  }

  async executeAll() {
    return await this.temporadaRepo.findAll();
  }

  async executeActiva() {
    const temporada = await this.temporadaRepo.findActiva();
    if (!temporada) {
      throw { status: 404, message: 'No hay ninguna temporada activa.' };
    }
    return temporada;
  }
}

module.exports = GetTemporadasUseCase;
