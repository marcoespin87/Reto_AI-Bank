/**
 * Puerto: Repositorio de Pronostico
 */
class IPronosticoRepository {
  async create(data, client) { throw new Error('Not implemented'); }
  async findByPerfilAndPartido(idPerfil, idPartido) { throw new Error('Not implemented'); }
  async findByPartidoId(idPartido, client) { throw new Error('Not implemented'); }
  async findByPerfilId(idPerfil, options) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async updateEsCorrecto(id, esCorrecto, client) { throw new Error('Not implemented'); }
}

module.exports = IPronosticoRepository;
