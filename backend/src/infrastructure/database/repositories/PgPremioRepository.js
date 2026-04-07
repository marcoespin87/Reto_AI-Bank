const pool = require('../connection');
const IPremioRepository = require('../../../domain/ports/repositories/IPremioRepository');

class PgPremioRepository extends IPremioRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async findCatalogo(options = {}) {
    const { id_liga, id_tag } = options;
    const conditions = [];
    const vals = [];
    let idx = 1;

    if (id_liga) { conditions.push(`pr.id_liga=$${idx++}`); vals.push(id_liga); }
    if (id_tag) { conditions.push(`pr.id_tag=$${idx++}`); vals.push(id_tag); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const r = await this.pool.query(
      `SELECT pr.*, COALESCE(pr.millas_costo, 0) AS millas_costo,
         t.descripcion AS tag_descripcion,
         l.nombre AS liga_nombre
       FROM premios pr
       LEFT JOIN tag t ON pr.id_tag = t.id_tag
       LEFT JOIN liga l ON pr.id_liga = l.id_liga
       ${where}
       ORDER BY pr.id_premios ASC`,
      vals
    );
    return r.rows;
  }

  async findById(id) {
    const r = await this.pool.query(
      `SELECT pr.*, COALESCE(pr.millas_costo, 0) AS millas_costo,
         t.descripcion AS tag_descripcion,
         l.nombre AS liga_nombre
       FROM premios pr
       LEFT JOIN tag t ON pr.id_tag = t.id_tag
       LEFT JOIN liga l ON pr.id_liga = l.id_liga
       WHERE pr.id_premios=$1`,
      [id]
    );
    return r.rows[0] || null;
  }

  async create(data, client) {
    const db = client || this.pool;
    const { nombre, id_liga, id_tag, id_perfil, otorgado_en } = data;
    const r = await db.query(
      `INSERT INTO premios (nombre, id_liga, id_tag, id_perfil, otorgado_en)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, id_liga || null, id_tag || null, id_perfil || null, otorgado_en || new Date()]
    );
    return r.rows[0];
  }

  async findByPerfilId(idPerfil) {
    const r = await this.pool.query(
      `SELECT pr.*, COALESCE(pr.millas_costo, 0) AS millas_costo,
         t.descripcion AS tag_descripcion
       FROM premios pr
       LEFT JOIN tag t ON pr.id_tag = t.id_tag
       WHERE pr.id_perfil=$1
       ORDER BY pr.otorgado_en DESC`,
      [idPerfil]
    );
    return r.rows;
  }
}

module.exports = PgPremioRepository;
