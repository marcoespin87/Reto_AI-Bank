const pool = require('../connection');
const IPerfilRepository = require('../../../domain/ports/repositories/IPerfilRepository');

class PgPerfilRepository extends IPerfilRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data) {
    const { id_persona, username, millas, puntos, id_liga } = data;
    const r = await this.pool.query(
      `INSERT INTO perfil (id_persona, username, millas, puntos, id_liga)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_persona, username, millas || 0, puntos || 0, id_liga]
    );
    return r.rows[0];
  }

  async findById(id) {
    const r = await this.pool.query(
      `SELECT p.*, l.nombre AS liga_nombre, l.rango_inicio, l.rango_fin
       FROM perfil p
       LEFT JOIN liga l ON p.id_liga = l.id_liga
       WHERE p.id_perfil = $1`,
      [id]
    );
    return r.rows[0] || null;
  }

  async findByPersonaId(idPersona) {
    const r = await this.pool.query(
      `SELECT p.*, l.nombre AS liga_nombre, l.rango_inicio, l.rango_fin
       FROM perfil p
       LEFT JOIN liga l ON p.id_liga = l.id_liga
       WHERE p.id_persona = $1`,
      [idPersona]
    );
    return r.rows[0] || null;
  }

  async findByUsername(username) {
    const r = await this.pool.query(
      'SELECT * FROM perfil WHERE username=$1',
      [username]
    );
    return r.rows[0] || null;
  }

  async findAll() {
    const r = await this.pool.query(
      `SELECT p.*, l.nombre AS liga_nombre, l.rango_inicio, l.rango_fin
       FROM perfil p
       LEFT JOIN liga l ON p.id_liga = l.id_liga
       ORDER BY p.puntos DESC`
    );
    return r.rows;
  }

  async updateMillas(idPerfil, millas, client) {
    const db = client || this.pool;
    const r = await db.query(
      'UPDATE perfil SET millas=$2, updated_at=now() WHERE id_perfil=$1 RETURNING *',
      [idPerfil, millas]
    );
    return r.rows[0] || null;
  }

  async updatePuntos(idPerfil, puntos, client) {
    const db = client || this.pool;
    const r = await db.query(
      'UPDATE perfil SET puntos=$2, updated_at=now() WHERE id_perfil=$1 RETURNING *',
      [idPerfil, puntos]
    );
    return r.rows[0] || null;
  }

  async updateLiga(idPerfil, idLiga, client) {
    const db = client || this.pool;
    const r = await db.query(
      'UPDATE perfil SET id_liga=$2, updated_at=now() WHERE id_perfil=$1 RETURNING *',
      [idPerfil, idLiga]
    );
    return r.rows[0] || null;
  }

  async updateMillasAndPuntos(idPerfil, millas, puntos, idLiga, client) {
    const db = client || this.pool;
    const r = await db.query(
      'UPDATE perfil SET millas=$2, puntos=$3, id_liga=$4, updated_at=now() WHERE id_perfil=$1 RETURNING *',
      [idPerfil, millas, puntos, idLiga]
    );
    return r.rows[0] || null;
  }

  async resetAllPuntos(client) {
    const db = client || this.pool;
    await db.query('UPDATE perfil SET puntos=0, updated_at=now()');
  }
}

module.exports = PgPerfilRepository;
