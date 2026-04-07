/**
 * Puerto: Repositorio de Consumo
 */
class IConsumoRepository {
  async create(data, client) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findByPersonaId(idPersona, options) { throw new Error('Not implemented'); }
}

module.exports = IConsumoRepository;
