/**
 * Puerto: Repositorio de Persona
 * Define el contrato que deben implementar los adaptadores de infraestructura.
 */
class IPersonaRepository {
  async create(data) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async findByMail(mail) { throw new Error('Not implemented'); }
  async findByNumeroCuenta(numeroCuenta) { throw new Error('Not implemented'); }
  async update(id, data) { throw new Error('Not implemented'); }
}

module.exports = IPersonaRepository;
