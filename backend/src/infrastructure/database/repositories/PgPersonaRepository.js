const pool = require('../connection');
const IPersonaRepository = require('../../../domain/ports/repositories/IPersonaRepository');

class PgPersonaRepository extends IPersonaRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data) {
    const {
      nombre, mail, celular, numero_cuenta, nacimiento, nacionalidad, residencia,
      ciudad, empresa, cargo, edad, genero, nivel_educacion, ocupacion,
      num_productos_bancarios, score_crediticio, tiene_credito_activo,
      tiene_cuenta_ahorro, meses_sin_mora, usa_app_movil, notificaciones_activadas,
      sesiones_app_semana, dispositivo_preferido
    } = data;

    const result = await this.pool.query(
      `INSERT INTO persona (
        nombre, mail, celular, numero_cuenta, nacimiento, nacionalidad, residencia,
        ciudad, empresa, cargo, edad, genero, nivel_educacion, ocupacion,
        num_productos_bancarios, score_crediticio, tiene_credito_activo,
        tiene_cuenta_ahorro, meses_sin_mora, usa_app_movil, notificaciones_activadas,
        sesiones_app_semana, dispositivo_preferido
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *`,
      [
        nombre, mail, celular, numero_cuenta, nacimiento || null, nacionalidad || null,
        residencia || null, ciudad || null, empresa || null, cargo || null,
        edad || null, genero || null, nivel_educacion || null, ocupacion || null,
        num_productos_bancarios || 0, score_crediticio || null,
        tiene_credito_activo || false, tiene_cuenta_ahorro || false,
        meses_sin_mora || 0, usa_app_movil || false, notificaciones_activadas || false,
        sesiones_app_semana || 0, dispositivo_preferido || null
      ]
    );
    return result.rows[0];
  }

  async findById(id) {
    const r = await this.pool.query('SELECT * FROM persona WHERE id_persona=$1', [id]);
    return r.rows[0] || null;
  }

  async findByMail(mail) {
    const r = await this.pool.query('SELECT * FROM persona WHERE mail=$1', [mail]);
    return r.rows[0] || null;
  }

  async findByNumeroCuenta(numeroCuenta) {
    const r = await this.pool.query('SELECT * FROM persona WHERE numero_cuenta=$1', [numeroCuenta]);
    return r.rows[0] || null;
  }

  async update(id, data) {
    const allowed = [
      'nombre', 'nacimiento', 'nacionalidad', 'residencia', 'celular', 'empresa',
      'cargo', 'ciudad', 'nivel_educacion', 'ocupacion', 'usa_app_movil',
      'notificaciones_activadas', 'sesiones_app_semana', 'dispositivo_preferido'
    ];
    const fields = Object.keys(data).filter(k => allowed.includes(k));
    if (!fields.length) return this.findById(id);
    const sets = fields.map((f, i) => `${f}=$${i + 1}`).join(', ');
    const vals = fields.map(f => data[f]);
    vals.push(id);
    const r = await this.pool.query(
      `UPDATE persona SET ${sets}, updated_at=now() WHERE id_persona=$${vals.length} RETURNING *`,
      vals
    );
    return r.rows[0] || null;
  }
}

module.exports = PgPersonaRepository;
