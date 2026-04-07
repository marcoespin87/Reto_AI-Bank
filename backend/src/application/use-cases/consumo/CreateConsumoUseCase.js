const pool = require('../../../infrastructure/database/connection');
const { calcularLiga } = require('../../../domain/value-objects/Liga');
const { generarRareza } = require('../../../domain/value-objects/RarezaCromo');

class CreateConsumoUseCase {
  constructor({ personaRepository, perfilRepository, consumoRepository, ligaRepository, cromoRepository }) {
    this.personaRepo = personaRepository;
    this.perfilRepo = perfilRepository;
    this.consumoRepo = consumoRepository;
    this.ligaRepo = ligaRepository;
    this.cromoRepo = cromoRepository;
  }

  async execute(data) {
    const { id_persona, monto, descripcion, id_producto_persona, ubicacion, diferido, id_tag } = data;

    if (!monto || monto <= 0) {
      throw { status: 400, message: 'El monto debe ser mayor a 0.' };
    }

    // Verify persona exists
    const persona = await this.personaRepo.findById(id_persona);
    if (!persona) {
      throw { status: 404, message: `Persona con id ${id_persona} no encontrada.` };
    }

    // Get perfil
    const perfil = await this.perfilRepo.findByPersonaId(id_persona);
    if (!perfil) {
      throw { status: 404, message: `Perfil para persona ${id_persona} no encontrado.` };
    }

    // Calculate rewards
    const millasGanadas = Math.floor(monto) * 8;
    const puntosGanados = Math.floor(monto) * 10;
    const numCromos = Math.floor(monto / 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert consumo
      const consumo = await this.consumoRepo.create(
        { id_persona, monto, descripcion, id_producto_persona, ubicacion, diferido: diferido || false },
        client
      );

      // Calculate new totals
      const nuevasMillas = parseFloat(perfil.millas || 0) + millasGanadas;
      const nuevosPuntos = (parseInt(perfil.puntos, 10) || 0) + puntosGanados;

      // Determine liga
      const ligaActualNombre = perfil.liga_nombre || 'Bronce';
      const nuevaLigaNombre = calcularLiga(nuevosPuntos);
      const cambioLiga = ligaActualNombre !== nuevaLigaNombre;

      const nuevaLiga = await this.ligaRepo.findByNombre(nuevaLigaNombre);
      if (!nuevaLiga) throw { status: 500, message: `Liga '${nuevaLigaNombre}' no encontrada.` };

      // Update perfil
      await this.perfilRepo.updateMillasAndPuntos(
        perfil.id_perfil, nuevasMillas, nuevosPuntos, nuevaLiga.id_liga, client
      );

      // Insert log puntos
      await this.ligaRepo.insertLogPuntos(perfil.id_perfil, puntosGanados, 'CONSUMO', client);

      // If liga changed: record history
      if (cambioLiga) {
        await this.ligaRepo.insertPerfilesLiga(
          perfil.id_perfil, nuevaLiga.id_liga, perfil.id_liga, client
        );
      }

      // Generate cromos
      const detalleCromos = [];
      for (let i = 0; i < numCromos; i++) {
        const rareza = generarRareza();
        const cromo = await this.cromoRepo.findRandom(rareza, client);
        if (cromo) {
          await this.cromoRepo.insertCromoPerfil(perfil.id_perfil, cromo.id_cromos, client);
          detalleCromos.push({
            rareza,
            nombre: cromo.nombre,
            id_cromos: cromo.id_cromos
          });
        }
      }

      // If tag provided: insert tagsconsumo
      if (id_tag) {
        await client.query(
          'INSERT INTO tagsconsumo (id_consumo, id_tag, certeza) VALUES ($1,$2,$3)',
          [consumo.id_consumo, id_tag, 100]
        );
      }

      await client.query('COMMIT');

      return {
        consumo: {
          id_consumo: consumo.id_consumo,
          monto,
          descripcion,
          fecha: consumo.fecha
        },
        recompensas: {
          millas_generadas: millasGanadas,
          puntos_generados: puntosGanados,
          cromos_generados: numCromos,
          detalle_cromos: detalleCromos
        },
        perfil_actualizado: {
          millas: nuevasMillas,
          puntos: nuevosPuntos,
          liga_anterior: ligaActualNombre,
          liga_actual: nuevaLigaNombre,
          cambio_liga: cambioLiga
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

module.exports = CreateConsumoUseCase;
