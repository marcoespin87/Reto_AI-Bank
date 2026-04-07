/**
 * Puerto: Repositorio de Temporada
 */
class ITemporadaRepository {
  async create(data) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findActiva() { throw new Error('Not implemented'); }
  async hasActiva() { throw new Error('Not implemented'); }
  async cerrar(id, client) { throw new Error('Not implemented'); }
}

module.exports = ITemporadaRepository;
