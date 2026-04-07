// Value Object: Liga
// Umbrales definidos en Reglas de Negocio
const LIGAS = [
  { nombre: 'Bronce',   min: 0,     max: 4999   },
  { nombre: 'Plata',    min: 5000,  max: 14999  },
  { nombre: 'Oro',      min: 15000, max: 29999  },
  { nombre: 'Diamante', min: 30000, max: Infinity },
];

function calcularLiga(puntos) {
  const liga = LIGAS.find(l => puntos >= l.min && puntos <= l.max);
  return liga ? liga.nombre : 'Bronce';
}

module.exports = { LIGAS, calcularLiga };
