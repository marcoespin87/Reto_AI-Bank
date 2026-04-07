const pool = require('../connection');
const ILigaRepository = require('../../../domain/ports/repositories/ILigaRepository');

class PgLigaRepository extends ILigaRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async findAll() {
    const r = await this.pool.query('SELECT * FROM liga ORDER BY rango_inicio');
    return r.rows;
  }

  async findById(id) {
    const r = await this.pool.query('SELECT * FROM liga WHERE id_liga=$1', [id]);
    return r.rows[0] || null;
  }

  async findByNombre(nombre) {
    const r = await this.pool.query('SELECT * FROM liga WHERE nombre=$1', [nombre]);
    return r.rows[0] || null;
  }

  async findByPuntos(puntos) {
    const r = await this.pool.query(
      'SELECT * FROM liga WHERE rango_inicio <= $1 AND rango_fin >= $1 LIMIT 1',
      [puntos]
    );
    return r.rows[0] || null;
  }

  async getRanking(idLiga, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const countR = await this.pool.query(
      'SELECT COUNT(*) FROM perfil WHERE id_liga=$1', [idLiga]
    );
    const total = parseInt(countR.rows[0].count, 10);

    const r = await this.pool.query(
      `SELECT pr.*, pe.nombre AS persona_nombre
       FROM perfil pr
       JOIN persona pe ON pr.id_persona = pe.id_persona
       WHERE pr.id_liga = $1
       ORDER BY pr.puntos DESC
       LIMIT $2 OFFSET $3`,
      [idLiga, limit, offset]
    );

    return { rows: r.rows, total };
  }

  async getRankingGlobal(options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const countR = await this.pool.query('SELECT COUNT(*) FROM perfil');
    const total = parseInt(countR.rows[0].count, 10);

    const r = await this.pool.query(
      `SELECT pr.*, pe.nombre AS persona_nombre, l.nombre AS liga_nombre
       FROM perfil pr
       JOIN persona pe ON pr.id_persona = pe.id_persona
       LEFT JOIN liga l ON pr.id_liga = l.id_liga
       ORDER BY pr.puntos DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { rows: r.rows, total };
  }

  async insertPerfilesLiga(idPerfil, idLigaNueva, idLigaPrevia, client) {
    const db = client || this.pool;
    const r = await db.query(
      `INSERT INTO perfilesliga (id_perfil, id_liga_nueva, id_liga_previa)
       VALUES ($1,$2,$3) RETURNING *`,
      [idPerfil, idLigaNueva, idLigaPrevia || null]
    );
    return r.rows[0];
  }

  async insertLogPuntos(idPerfil, puntos, concepto, client) {
    const db = client || this.pool;
    const r = await db.query(
      `INSERT INTO logs_puntos (id_perfil, puntos, concepto)
       VALUES ($1,$2,$3) RETURNING *`,
      [idPerfil, puntos, concepto]
    );
    return r.rows[0];
  }
}

module.exports = PgLigaRepository;
