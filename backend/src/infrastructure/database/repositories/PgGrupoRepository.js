const pool = require('../connection');
const IGrupoRepository = require('../../../domain/ports/repositories/IGrupoRepository');

class PgGrupoRepository extends IGrupoRepository {
  constructor() {
    super();
    this.pool = pool;
  }

  async create(data) {
    const { nombre, descripcion, id_perfil_creador } = data;
    const r = await this.pool.query(
      `INSERT INTO grupo (nombre, descripcion, id_perfil_creador)
       VALUES ($1,$2,$3) RETURNING *`,
      [nombre, descripcion || null, id_perfil_creador]
    );
    const grupo = r.rows[0];

    // Add creator as admin member
    try {
      await this.pool.query(
        `INSERT INTO grupomiembro (id_grupo, id_perfil, rol)
         VALUES ($1,$2,'admin')`,
        [grupo.id_grupo, id_perfil_creador]
      );
    } catch (e) {
      // grupomiembro table might not exist — degrade gracefully
      console.warn('grupomiembro table not available:', e.message);
    }

    return grupo;
  }

  async findByNombre(nombre) {
    const r = await this.pool.query(
      'SELECT * FROM grupo WHERE nombre=$1',
      [nombre]
    );
    return r.rows[0] || null;
  }

  async findById(id) {
    const r = await this.pool.query(
      `SELECT g.*,
         p.username AS creador_username
       FROM grupo g
       LEFT JOIN perfil p ON g.id_perfil_creador = p.id_perfil
       WHERE g.id_grupo=$1`,
      [id]
    );
    return r.rows[0] || null;
  }

  async addMiembro(idGrupo, idPerfil, rol) {
    try {
      const r = await this.pool.query(
        `INSERT INTO grupomiembro (id_grupo, id_perfil, rol)
         VALUES ($1,$2,$3)
         ON CONFLICT (id_grupo, id_perfil) DO NOTHING
         RETURNING *`,
        [idGrupo, idPerfil, rol || 'miembro']
      );
      return r.rows[0] || { id_grupo: idGrupo, id_perfil: idPerfil, rol: rol || 'miembro' };
    } catch (e) {
      console.warn('grupomiembro table not available:', e.message);
      return { id_grupo: idGrupo, id_perfil: idPerfil, rol: rol || 'miembro' };
    }
  }

  async isMiembro(idGrupo, idPerfil) {
    try {
      const r = await this.pool.query(
        'SELECT COUNT(*) FROM grupomiembro WHERE id_grupo=$1 AND id_perfil=$2',
        [idGrupo, idPerfil]
      );
      return parseInt(r.rows[0].count, 10) > 0;
    } catch (e) {
      return false;
    }
  }

  async getRankingMiembros(idGrupo) {
    try {
      const r = await this.pool.query(
        `SELECT gm.id_perfil, gm.rol, pr.username, pr.puntos, pr.millas,
           pe.nombre AS persona_nombre,
           l.nombre AS liga_nombre
         FROM grupomiembro gm
         JOIN perfil pr ON gm.id_perfil = pr.id_perfil
         JOIN persona pe ON pr.id_persona = pe.id_persona
         LEFT JOIN liga l ON pr.id_liga = l.id_liga
         WHERE gm.id_grupo=$1
         ORDER BY pr.puntos DESC`,
        [idGrupo]
      );
      return r.rows;
    } catch (e) {
      console.warn('grupomiembro table not available:', e.message);
      return [];
    }
  }
}

module.exports = PgGrupoRepository;
