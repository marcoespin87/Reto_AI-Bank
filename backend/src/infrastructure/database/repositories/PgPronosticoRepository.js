const pool = require('../connection');
const IPronosticoRepository = require('../../../domain/ports/repositories/IPronosticoRepository');

class PgPronosticoRepository extends IPronosticoRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data, client) {
    const db = client || this.pool;
    const { id_perfil, id_partido, score_local, score_visitante, ganador } = data;
    const r = await db.query(
      `INSERT INTO pronosticos (id_perfil, id_partido, score_local, score_visitante, ganador)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_perfil, id_partido, score_local, score_visitante, ganador]
    );
    return r.rows[0];
  }

  async findByPerfilAndPartido(idPerfil, idPartido) {
    const r = await this.pool.query(
      'SELECT * FROM pronosticos WHERE id_perfil=$1 AND id_partido=$2',
      [idPerfil, idPartido]
    );
    return r.rows[0] || null;
  }

  async findByPartidoId(idPartido, client) {
    const db = client || this.pool;
    const r = await db.query(
      'SELECT * FROM pronosticos WHERE id_partido=$1',
      [idPartido]
    );
    return r.rows;
  }

  async findByPerfilId(idPerfil, options = {}) {
    const { page = 1, limit = 10, id_temporada } = options;
    const offset = (page - 1) * limit;
    const conditions = ['pr.id_perfil=$1'];
    const vals = [idPerfil];
    let idx = 2;

    if (id_temporada) {
      conditions.push(`pa.id_temporada=$${idx++}`);
      vals.push(id_temporada);
    }

    const where = conditions.join(' AND ');

    const countR = await this.pool.query(
      `SELECT COUNT(*) FROM pronosticos pr
       LEFT JOIN partido pa ON pr.id_partido = pa.id_partido
       WHERE ${where}`,
      vals
    );
    const total = parseInt(countR.rows[0].count, 10);

    const dataVals = [...vals, limit, offset];
    const r = await this.pool.query(
      `SELECT pr.*, pa.fecha AS partido_fecha, pa.estado AS partido_estado,
         pl.nombre AS pais_local, pv.nombre AS pais_visitante
       FROM pronosticos pr
       LEFT JOIN partido pa ON pr.id_partido = pa.id_partido
       LEFT JOIN paises pl ON pa.id_pais_local = pl.id_paises
       LEFT JOIN paises pv ON pa.id_pais_visitante = pv.id_paises
       WHERE ${where}
       ORDER BY pr.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataVals
    );

    return { rows: r.rows, total };
  }

  async findById(id) {
    const r = await this.pool.query(
      `SELECT pr.*, pa.fecha AS partido_fecha, pa.estado AS partido_estado
       FROM pronosticos pr
       LEFT JOIN partido pa ON pr.id_partido = pa.id_partido
       WHERE pr.id_pronosticos=$1`,
      [id]
    );
    return r.rows[0] || null;
  }

  async updateEsCorrecto(id, esCorrecto, client) {
    const db = client || this.pool;
    const r = await db.query(
      'UPDATE pronosticos SET es_correcto=$2, updated_at=now() WHERE id_pronosticos=$1 RETURNING *',
      [id, esCorrecto]
    );
    return r.rows[0] || null;
  }
}

module.exports = PgPronosticoRepository;
