const pool = require('../../../infrastructure/database/connection');

class CerrarTemporadaUseCase {
  constructor({ temporadaRepository }) {
    this.temporadaRepo = temporadaRepository;
  }

  async execute(id) {
    const temporada = await this.temporadaRepo.findById(id);
    if (!temporada) {
      throw { status: 404, message: `Temporada con id ${id} no encontrada.` };
    }

    // Check if already closed: fecha_fin < today
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaFin = new Date(temporada.fecha_fin);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaFin < hoy) {
      throw { status: 400, message: 'La temporada ya está cerrada (fecha_fin es anterior a hoy).' };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get all perfiles
      const perfilesResult = await client.query('SELECT * FROM perfil');
      const perfiles = perfilesResult.rows;
      let procesados = 0;

      for (const p of perfiles) {
        // Snapshot log of current puntos
        await client.query(
          'INSERT INTO logs_puntos (id_perfil, puntos, concepto) VALUES ($1,$2,$3)',
          [p.id_perfil, p.puntos, 'CIERRE_TEMPORADA']
        );
        // Historical liga snapshot
        await client.query(
          'INSERT INTO perfilesliga (id_perfil, id_liga_nueva, id_liga_previa) VALUES ($1,$2,$2)',
          [p.id_perfil, p.id_liga]
        );
        procesados++;
      }

      // Reset all puntos to 0
      await client.query('UPDATE perfil SET puntos=0, updated_at=now()');

      // Mark temporada as closed
      await client.query(
        `UPDATE temporada SET fecha_fin = CURRENT_DATE - INTERVAL '1 day' WHERE id_temporada=$1`,
        [id]
      );

      await client.query('COMMIT');

      return {
        procesados,
        temporada: { ...temporada, estado: 'cerrada' }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = CerrarTemporadaUseCase;
