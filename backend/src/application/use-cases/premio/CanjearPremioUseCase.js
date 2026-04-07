const pool = require('../../../infrastructure/database/connection');

class CanjearPremioUseCase {
  constructor({ premioRepository, perfilRepository }) {
    this.premioRepo = premioRepository;
    this.perfilRepo = perfilRepository;
  }

  async execute(data) {
    const { id_perfil, id_premios } = data;
    const id_premio = id_premios; // normalize: swagger uses id_premios (PK de la tabla premios)

    const perfil = await this.perfilRepo.findById(id_perfil);
    if (!perfil) {
      throw { status: 404, message: `Perfil con id ${id_perfil} no encontrado.` };
    }

    const premio = await this.premioRepo.findById(id_premio);
    if (!premio) {
      throw { status: 404, message: `Premio con id ${id_premio} no encontrado.` };
    }

    const millasDisponibles = parseFloat(perfil.millas || 0);
    const millasCosto = parseFloat(premio.millas_costo || 0);

    // Canje only with millas
    if (millasDisponibles < millasCosto) {
      throw {
        status: 402,
        message: `Millas insuficientes. Necesitas ${millasCosto} millas, tienes ${millasDisponibles}.`
      };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deduct millas
      const nuevasMillas = millasDisponibles - millasCosto;
      await client.query(
        'UPDATE perfil SET millas=$2, updated_at=now() WHERE id_perfil=$1',
        [id_perfil, nuevasMillas]
      );

      // Record the canje — insert into premios (registro del canje, sin millas_costo ya que es el historial)
      const canje = await client.query(
        `INSERT INTO premios (nombre, id_liga, id_tag, id_perfil, otorgado_en)
         VALUES ($1,$2,$3,$4,now()) RETURNING *`,
        [premio.nombre, premio.id_liga || null, premio.id_tag || null, id_perfil]
      );

      await client.query('COMMIT');

      return {
        canje: canje.rows[0],
        premio,
        millas_utilizadas: millasCosto,
        millas_restantes: nuevasMillas
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = CanjearPremioUseCase;
