const pool = require('../connection');
const ITransferenciaRepository = require('../../../domain/ports/repositories/ITransferenciaRepository');

class PgTransferenciaRepository extends ITransferenciaRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data, client) {
    const db = client || this.pool;
    const { id_persona_emisora, id_persona_receptora, monto, mailes_generados } = data;
    const r = await db.query(
      `INSERT INTO transferencias (id_persona_emisora, id_persona_receptora, monto, mailes_generados)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [id_persona_emisora, id_persona_receptora, monto, mailes_generados || 0]
    );
    return r.rows[0];
  }

  async findByPersonaId(idPersona, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const countR = await this.pool.query(
      `SELECT COUNT(*) FROM transferencias
       WHERE id_persona_emisora=$1 OR id_persona_receptora=$1`,
      [idPersona]
    );
    const total = parseInt(countR.rows[0].count, 10);

    const r = await this.pool.query(
      `SELECT t.*,
         pe.nombre AS emisor_nombre, pe.mail AS emisor_mail,
         pr.nombre AS receptor_nombre, pr.mail AS receptor_mail
       FROM transferencias t
       LEFT JOIN persona pe ON t.id_persona_emisora = pe.id_persona
       LEFT JOIN persona pr ON t.id_persona_receptora = pr.id_persona
       WHERE t.id_persona_emisora=$1 OR t.id_persona_receptora=$1
       ORDER BY t.fecha DESC
       LIMIT $2 OFFSET $3`,
      [idPersona, limit, offset]
    );

    return { rows: r.rows, total };
  }
}

module.exports = PgTransferenciaRepository;
