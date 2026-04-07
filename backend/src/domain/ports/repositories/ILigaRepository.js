/**
 * Puerto: Repositorio de Liga
 */
class ILigaRepository {
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findByNombre(nombre) { throw new Error('Not implemented'); }
  async findByPuntos(puntos) { throw new Error('Not implemented'); }
  async getRanking(idLiga, options) { throw new Error('Not implemented'); }
  async getRankingGlobal(options) { throw new Error('Not implemented'); }
  async insertPerfilesLiga(idPerfil, idLigaNueva, idLigaPrevia, client) { throw new Error('Not implemented'); }
  async insertLogPuntos(idPerfil, puntos, concepto, client) { throw new Error('Not implemented'); }
}

module.exports = ILigaRepository;
