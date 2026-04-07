class GetGrupoUseCase {
  constructor({ grupoRepository }) {
    this.grupoRepo = grupoRepository;
  }

  async execute(id) {
    const grupo = await this.grupoRepo.findById(id);
    if (!grupo) {
      throw { status: 404, message: `Grupo con id ${id} no encontrado.` };
    }

    const ranking = await this.grupoRepo.getRankingMiembros(id);

    return {
      ...grupo,
      ranking_miembros: ranking
    };
  }
}

module.exports = GetGrupoUseCase;
