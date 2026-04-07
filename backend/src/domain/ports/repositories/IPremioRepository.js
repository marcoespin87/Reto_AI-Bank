/**
 * Puerto: Repositorio de Premio
 */
class IPremioRepository {
  async findCatalogo(options) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async create(data, client) { throw new Error('Not implemented'); }
  async findByPerfilId(idPerfil) { throw new Error('Not implemented'); }
}

module.exports = IPremioRepository;
