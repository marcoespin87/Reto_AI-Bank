const pool = require('../connection');
const IConsumoRepository = require('../../../domain/ports/repositories/IConsumoRepository');

class PgConsumoRepository extends IConsumoRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data, client) {
    const db = client || this.pool;
    const { id_persona, monto, descripcion, id_producto_persona, ubicacion, diferido } = data;
    const r = await db.query(
      `INSERT INTO consumo (id_persona, monto, descripcion, id_producto_persona, ubicacion, diferido)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id_persona, monto, descripcion || null, id_producto_persona || null, ubicacion || null, diferido || false]
    );
    return r.rows[0];
  }

  async findById(id) {
    const r = await this.pool.query('SELECT * FROM consumo WHERE id_consumo=$1', [id]);
    return r.rows[0] || null;
  }

  async findByPersonaId(idPersona, options = {}) {
    const { page = 1, limit = 10, fecha_inicio, fecha_fin } = options;
    const offset = (page - 1) * limit;
    const conditions = ['c.id_persona=$1'];
    const vals = [idPersona];
    let idx = 2;

    if (fecha_inicio) { conditions.push(`c.fecha >= $${idx++}`); vals.push(fecha_inicio); }
    if (fecha_fin) { conditions.push(`c.fecha <= $${idx++}`); vals.push(fecha_fin); }

    const where = conditions.join(' AND ');

    const countR = await this.pool.query(
      `SELECT COUNT(*) FROM consumo c WHERE ${where}`, vals
    );
    const total = parseInt(countR.rows[0].count, 10);

    const dataVals = [...vals, limit, offset];
    const r = await this.pool.query(
      `SELECT c.* FROM consumo c
       WHERE ${where}
       ORDER BY c.fecha DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataVals
    );

    return { rows: r.rows, total };
  }
}

module.exports = PgConsumoRepository;
