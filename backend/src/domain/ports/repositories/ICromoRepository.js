/**
 * Puerto: Repositorio de Cromo
 */
class ICromoRepository {
  async findAll(options) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findRandom(frecuencia, client) { throw new Error('Not implemented'); }
  async findColeccionByPerfil(idPerfil, options) { throw new Error('Not implemented'); }
  async insertCromoPerfil(idPerfil, idCromo, client) { throw new Error('Not implemented'); }
  async countTotal() { throw new Error('Not implemented'); }
  async countTotalByPerfil(idPerfil) { throw new Error('Not implemented'); }
}

module.exports = ICromoRepository;
