/**
 * Puerto: Repositorio de Perfil
 */
class IPerfilRepository {
  async create(data) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findByPersonaId(idPersona) { throw new Error('Not implemented'); }
  async findByUsername(username) { throw new Error('Not implemented'); }
  async findAll() { throw new Error('Not implemented'); }
  async updateMillas(idPerfil, millas, client) { throw new Error('Not implemented'); }
  async updatePuntos(idPerfil, puntos, client) { throw new Error('Not implemented'); }
  async updateLiga(idPerfil, idLiga, client) { throw new Error('Not implemented'); }
  async updateMillasAndPuntos(idPerfil, millas, puntos, idLiga, client) { throw new Error('Not implemented'); }
  async resetAllPuntos(client) { throw new Error('Not implemented'); }
}

module.exports = IPerfilRepository;
