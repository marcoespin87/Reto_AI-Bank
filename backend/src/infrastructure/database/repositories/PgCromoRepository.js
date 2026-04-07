const pool = require('../connection');
const ICromoRepository = require('../../../domain/ports/repositories/ICromoRepository');

class PgCromoRepository extends ICromoRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async findAll(options = {}) {
    const { frecuencia, id_pais, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    const conditions = [];
    const vals = [];
    let idx = 1;

    if (frecuencia) { conditions.push(`c.frecuencia=$${idx++}`); vals.push(frecuencia); }
    if (id_pais) { conditions.push(`c.id_pais=$${idx++}`); vals.push(id_pais); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const countR = await this.pool.query(
      `SELECT COUNT(*) FROM cromos c ${where}`, vals
    );
    const total = parseInt(countR.rows[0].count, 10);

    const dataVals = [...vals, limit, offset];
    const r = await this.pool.query(
      `SELECT c.*, p.nombre AS pais_nombre
       FROM cromos c
       LEFT JOIN paises p ON c.id_pais = p.id_paises
       ${where}
       ORDER BY c.id_cromos ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataVals
    );

    return { rows: r.rows, total };
  }

  async findById(id) {
    const r = await this.pool.query(
      `SELECT c.*, p.nombre AS pais_nombre
       FROM cromos c
       LEFT JOIN paises p ON c.id_pais = p.id_paises
       WHERE c.id_cromos=$1`,
      [id]
    );
    return r.rows[0] || null;
  }

  async findRandom(frecuencia, client) {
    const db = client || this.pool;
    const r = await db.query(
      'SELECT * FROM cromos WHERE frecuencia=$1 ORDER BY RANDOM() LIMIT 1',
      [frecuencia]
    );
    return r.rows[0] || null;
  }

  async findColeccionByPerfil(idPerfil, options = {}) {
    const { frecuencia, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    const conditions = ['cp.id_perfil=$1'];
    const vals = [idPerfil];
    let idx = 2;

    if (frecuencia) { conditions.push(`c.frecuencia=$${idx++}`); vals.push(frecuencia); }

    const where = conditions.join(' AND ');

    const countR = await this.pool.query(
      `SELECT COUNT(*) FROM cromosperfil cp
       JOIN cromos c ON cp.id_cromo = c.id_cromos
       WHERE ${where}`,
      vals
    );
    const total = parseInt(countR.rows[0].count, 10);

    const dataVals = [...vals, limit, offset];
    const r = await this.pool.query(
      `SELECT cp.*, c.nombre AS cromo_nombre, c.frecuencia, c.imagen,
         p.nombre AS pais_nombre
       FROM cromosperfil cp
       JOIN cromos c ON cp.id_cromo = c.id_cromos
       LEFT JOIN paises p ON c.id_pais = p.id_paises
       WHERE ${where}
       ORDER BY cp.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataVals
    );

    return { rows: r.rows, total };
  }

  async insertCromoPerfil(idPerfil, idCromo, client) {
    const db = client || this.pool;
    const r = await db.query(
      'INSERT INTO cromosperfil (id_perfil, id_cromo) VALUES ($1,$2) RETURNING *',
      [idPerfil, idCromo]
    );
    return r.rows[0];
  }

  async countTotal() {
    const r = await this.pool.query('SELECT COUNT(*) FROM cromos');
    return parseInt(r.rows[0].count, 10);
  }

  async countTotalByPerfil(idPerfil) {
    const r = await this.pool.query(
      'SELECT COUNT(*) FROM cromosperfil WHERE id_perfil=$1',
      [idPerfil]
    );
    return parseInt(r.rows[0].count, 10);
  }
}

module.exports = PgCromoRepository;
