// Entidad de dominio: Perfil
// Tabla BD: perfil (id_perfil, id_persona, username, fecha_inicio, millas, id_liga, puntos, updated_at)
// Regla: millas = activo permanente | puntos = activo temporal (se reinicia por temporada)
class Perfil {
  constructor(data) {
    this.id_perfil   = data.id_perfil;
    this.id_persona  = data.id_persona;
    this.username    = data.username;
    this.fecha_inicio = data.fecha_inicio;
    this.millas      = data.millas      || 0;
    this.id_liga     = data.id_liga;
    this.puntos      = data.puntos      || 0;
    this.updated_at  = data.updated_at;
  }
  // Regla: 1 Milla = $0.01 USD
  get millasEnUsd() { return parseFloat((this.millas * 0.01).toFixed(2)); }
}
module.exports = Perfil;
