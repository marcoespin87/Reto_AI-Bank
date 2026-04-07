const pool = require('../connection');
const IPartidoRepository = require('../../../domain/ports/repositories/IPartidoRepository');

class PgPartidoRepository extends IPartidoRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data) {
    const { id_temporada, id_pais_local, id_pais_visitante, fecha } = data;
    const r = await this.pool.query(
      `INSERT INTO partido (id_temporada, id_pais_local, id_pais_visitante, fecha)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id_temporada, id_pais_local, id_pais_visitante, fecha]
    );
    const partido = r.rows[0];
    return this.findById(partido.id_partido);
  }

  async findAll(options = {}) {
    const { id_temporada, solo_futuros, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    const conditions = [];
    const vals = [];
    let idx = 1;

    if (id_temporada) { conditions.push(`p.id_temporada=$${idx++}`); vals.push(id_temporada); }
    if (solo_futuros === true || solo_futuros === 'true') {
      conditions.push(`p.fecha > now()`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const countR = await this.pool.query(
      `SELECT COUNT(*) FROM partido p ${where}`, vals
    );
    const total = parseInt(countR.rows[0].count, 10);

    const dataVals = [...vals, limit, offset];
    const r = await this.pool.query(
      `SELECT p.*,
         pl.nombre AS pais_local_nombre, pl.bandera AS pais_local_bandera,
         pv.nombre AS pais_visitante_nombre, pv.bandera AS pais_visitante_bandera
       FROM partido p
       LEFT JOIN paises pl ON p.id_pais_local = pl.id_paises
       LEFT JOIN paises pv ON p.id_pais_visitante = pv.id_paises
       ${where}
       ORDER BY p.fecha ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataVals
    );

    return { rows: r.rows, total };
  }

  async findById(id) {
    const r = await this.pool.query(
      `SELECT p.*,
         pl.nombre AS pais_local_nombre, pl.bandera AS pais_local_bandera,
         pv.nombre AS pais_visitante_nombre, pv.bandera AS pais_visitante_bandera
       FROM partido p
       LEFT JOIN paises pl ON p.id_pais_local = pl.id_paises
       LEFT JOIN paises pv ON p.id_pais_visitante = pv.id_paises
       WHERE p.id_partido = $1`,
      [id]
    );
    return r.rows[0] || null;
  }

  async setResultado(id, resultado, client) {
    const db = client || this.pool;
    const { goles_local, goles_visitante, ganador } = resultado;
    const r = await db.query(
      `UPDATE partido
       SET goles_local=$2, goles_visitante=$3, ganador=$4
       WHERE id_partido=$1 RETURNING *`,
      [id, goles_local, goles_visitante, ganador]
    );
    return r.rows[0] || null;
  }
}

module.exports = PgPartidoRepository;
