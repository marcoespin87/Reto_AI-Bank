/**
 * Puerto: Repositorio de Transferencia
 */
class ITransferenciaRepository {
  async create(data, client) { throw new Error('Not implemented'); }
  async findByPersonaId(idPersona, options) { throw new Error('Not implemented'); }
}

module.exports = ITransferenciaRepository;
