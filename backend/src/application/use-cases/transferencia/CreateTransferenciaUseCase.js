const pool = require('../../../infrastructure/database/connection');

class CreateTransferenciaUseCase {
  constructor({ transferenciaRepository, perfilRepository, personaRepository, ligaRepository }) {
    this.transferenciaRepo = transferenciaRepository;
    this.perfilRepo = perfilRepository;
    this.personaRepo = personaRepository;
    this.ligaRepo = ligaRepository;
  }

  async execute(data) {
    const { id_persona_emisora, id_persona_receptora, monto, descripcion } = data;

    if (!monto || monto <= 0) {
      throw { status: 400, message: 'El monto debe ser mayor a 0.' };
    }

    if (id_persona_emisora === id_persona_receptora) {
      throw { status: 400, message: 'El emisor y receptor no pueden ser la misma persona.' };
    }

    // Verify emisor exists
    const emisor = await this.personaRepo.findById(id_persona_emisora);
    if (!emisor) {
      throw { status: 404, message: `Persona emisora con id ${id_persona_emisora} no encontrada.` };
    }

    // Verify receptor exists
    const receptor = await this.personaRepo.findById(id_persona_receptora);
    if (!receptor) {
      throw { status: 404, message: `Persona receptora con id ${id_persona_receptora} no encontrada.` };
    }

    // Get perfiles
    const perfilEmisor = await this.perfilRepo.findByPersonaId(id_persona_emisora);
    if (!perfilEmisor) {
      throw { status: 404, message: `Perfil del emisor no encontrado.` };
    }

    const perfilReceptor = await this.perfilRepo.findByPersonaId(id_persona_receptora);
    if (!perfilReceptor) {
      throw { status: 404, message: `Perfil del receptor no encontrado.` };
    }

    // Calculate millas for emitter: floor(monto) * 8
    const millasEmisor = Math.floor(monto) * 8;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert transferencia con mailes_generados del emisor
      const transferencia = await this.transferenciaRepo.create(
        { id_persona_emisora, id_persona_receptora, monto, mailes_generados: millasEmisor },
        client
      );

      // Add millas to emitter
      const nuevasMillasEmisor = parseFloat(perfilEmisor.millas || 0) + millasEmisor;
      await client.query(
        'UPDATE perfil SET millas=$2, updated_at=now() WHERE id_perfil=$1',
        [perfilEmisor.id_perfil, nuevasMillasEmisor]
      );

      await client.query('COMMIT');

      return {
        transferencia,
        millas_generadas_emisor: millasEmisor,
        emisor: { id_persona: emisor.id_persona, nombre: emisor.nombre },
        receptor: { id_persona: receptor.id_persona, nombre: receptor.nombre }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = CreateTransferenciaUseCase;
