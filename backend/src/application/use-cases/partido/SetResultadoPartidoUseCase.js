const pool = require('../../../infrastructure/database/connection');
const { calcularLiga } = require('../../../domain/value-objects/Liga');

class SetResultadoPartidoUseCase {
  constructor({ partidoRepository, pronosticoRepository }) {
    this.partidoRepo = partidoRepository;
    this.pronosticoRepo = pronosticoRepository;
  }

  async execute(idPartido, resultado) {
    const partido = await this.partidoRepo.findById(idPartido);
    if (!partido) {
      throw { status: 404, message: `Partido con id ${idPartido} no encontrado.` };
    }

    if (partido.estado === 'finalizado') {
      throw { status: 409, message: 'El partido ya tiene un resultado registrado.' };
    }

    const { goles_local, goles_visitante, ganador } = resultado;

    if (goles_local < 0 || goles_visitante < 0) {
      throw { status: 400, message: 'Los goles no pueden ser negativos.' };
    }

    // Validate ganador consistency
    let ganadorEsperado;
    if (goles_local > goles_visitante) ganadorEsperado = 'local';
    else if (goles_visitante > goles_local) ganadorEsperado = 'visitante';
    else ganadorEsperado = 'empate';

    if (ganador !== ganadorEsperado) {
      throw { status: 400, message: `El campo ganador debe ser '${ganadorEsperado}' según el marcador.` };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update partido resultado
      const partidoActualizado = await this.partidoRepo.setResultado(idPartido, resultado, client);

      // Get all pronosticos for this partido
      const pronosticos = await this.pronosticoRepo.findByPartidoId(idPartido, client);

      let correctos = 0;
      let puntosDistribuidos = 0;

      for (const p of pronosticos) {
        const esCorrect =
          parseInt(p.score_local, 10) === goles_local &&
          parseInt(p.score_visitante, 10) === goles_visitante &&
          p.ganador === ganador;

        await this.pronosticoRepo.updateEsCorrecto(p.id_pronosticos, esCorrect, client);

        if (esCorrect) {
          correctos++;
          puntosDistribuidos += 500;

          // Get perfil and update puntos
          const perfilResult = await client.query('SELECT * FROM perfil WHERE id_perfil=$1', [p.id_perfil]);
          if (perfilResult.rows[0]) {
            const perfil = perfilResult.rows[0];
            const nuevosPuntos = parseInt(perfil.puntos, 10) + 500;
            const nuevaLigaNombre = calcularLiga(nuevosPuntos);
            const nuevaLigaResult = await client.query('SELECT * FROM liga WHERE nombre=$1', [nuevaLigaNombre]);
            const nuevaLiga = nuevaLigaResult.rows[0];

            await client.query(
              'UPDATE perfil SET puntos=$1, id_liga=$2, updated_at=now() WHERE id_perfil=$3',
              [nuevosPuntos, nuevaLiga ? nuevaLiga.id_liga : perfil.id_liga, p.id_perfil]
            );

            await client.query(
              'INSERT INTO logs_puntos (id_perfil, puntos, concepto) VALUES ($1,500,$2)',
              [p.id_perfil, 'PRONOSTICO_CORRECTO']
            );

            if (nuevaLiga && perfil.id_liga !== nuevaLiga.id_liga) {
              await client.query(
                'INSERT INTO perfilesliga (id_perfil, id_liga_nueva, id_liga_previa) VALUES ($1,$2,$3)',
                [p.id_perfil, nuevaLiga.id_liga, perfil.id_liga]
              );
            }
          }
        }
      }

      await client.query('COMMIT');

      return {
        partido: partidoActualizado,
        evaluacion: {
          total_pronosticos: pronosticos.length,
          pronosticos_correctos: correctos,
          puntos_distribuidos: puntosDistribuidos
        }
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = SetResultadoPartidoUseCase;
