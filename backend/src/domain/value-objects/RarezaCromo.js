// Value Object: RarezaCromo
// Drop rates: Comun 75% | Raro 20% | Epico 5%
const DROP_RATES = { COMUN: 75, RARO: 20, EPICO: 5 };

function generarRareza() {
  const roll = Math.random() * 100;
  if (roll < 75) return 'comun';
  if (roll < 95) return 'raro';
  return 'epico';
}

module.exports = { DROP_RATES, generarRareza };
