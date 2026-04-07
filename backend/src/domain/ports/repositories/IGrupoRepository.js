/**
 * Puerto: Repositorio de Grupo
 */
class IGrupoRepository {
  async create(data) { throw new Error('Not implemented'); }
  async findByNombre(nombre) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async addMiembro(idGrupo, idPerfil, rol) { throw new Error('Not implemented'); }
  async getRankingMiembros(idGrupo) { throw new Error('Not implemented'); }
  async isMiembro(idGrupo, idPerfil) { throw new Error('Not implemented'); }
}

module.exports = IGrupoRepository;
