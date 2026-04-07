class GetLigasUseCase {
  constructor({ ligaRepository }) {
    this.ligaRepo = ligaRepository;
  }

  async execute() {
    const ligas = await this.ligaRepo.findAll();
    return ligas;
  }
}

module.exports = GetLigasUseCase;
