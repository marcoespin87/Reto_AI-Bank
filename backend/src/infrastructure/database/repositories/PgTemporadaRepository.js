const pool = require('../connection');
const ITemporadaRepository = require('../../../domain/ports/repositories/ITemporadaRepository');

class PgTemporadaRepository extends ITemporadaRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data) {
    const { nombre, fecha_inicio, fecha_fin } = data;
    const r = await this.pool.query(
      `INSERT INTO temporada (nombre, fecha_inicio, fecha_fin)
       VALUES ($1,$2,$3) RETURNING *`,
      [nombre, fecha_inicio, fecha_fin]
    );
    return r.rows[0];
  }

  async findAll() {
    const r = await this.pool.query(
      `SELECT *,
         CASE WHEN fecha_fin >= CURRENT_DATE THEN 'activa' ELSE 'cerrada' END AS estado
       FROM temporada
       ORDER BY fecha_inicio DESC`
    );
    return r.rows;
  }

  async findById(id) {
    const r = await this.pool.query(
      `SELECT *,
         CASE WHEN fecha_fin >= CURRENT_DATE THEN 'activa' ELSE 'cerrada' END AS estado
       FROM temporada
       WHERE id_temporada=$1`,
      [id]
    );
    return r.rows[0] || null;
  }

  async findActiva() {
    const r = await this.pool.query(
      `SELECT *,
         CASE WHEN fecha_fin >= CURRENT_DATE THEN 'activa' ELSE 'cerrada' END AS estado
       FROM temporada
       WHERE fecha_fin >= CURRENT_DATE
       ORDER BY fecha_inicio DESC
       LIMIT 1`
    );
    return r.rows[0] || null;
  }

  async hasActiva() {
    const r = await this.pool.query(
      'SELECT COUNT(*) FROM temporada WHERE fecha_fin >= CURRENT_DATE'
    );
    return parseInt(r.rows[0].count, 10) > 0;
  }

  async cerrar(id, client) {
    const db = client || this.pool;
    const r = await db.query(
      `UPDATE temporada SET fecha_fin = CURRENT_DATE - INTERVAL '1 day'
       WHERE id_temporada=$1 RETURNING *`,
      [id]
    );
    return r.rows[0] || null;
  }
}

module.exports = PgTemporadaRepository;
