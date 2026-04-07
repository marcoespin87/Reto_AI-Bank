/**
 * Puerto: Repositorio de Partido
 */
class IPartidoRepository {
  async create(data) { throw new Error('Not implemented'); }
  async findAll(options) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async setResultado(id, resultado, client) { throw new Error('Not implemented'); }
}

module.exports = IPartidoRepository;
