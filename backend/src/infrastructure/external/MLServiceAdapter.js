// Adaptador para el microservicio externo de ML
// Fase 1: clasifica al usuario en una macrocategoria de afinidad
// Contrato de entrada: buildMlPayload(persona, perfil) - ver documentation/dtos.js
const axios = require('axios');
require('dotenv').config();

class MLServiceAdapter {
  constructor() {
    this.baseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = parseInt(process.env.ML_SERVICE_TIMEOUT || '5000');
  }

  /**
   * Envia el perfil ML del usuario y obtiene su macrocategoria de afinidad.
   * @param {Object} mlPayload - Payload construido por buildMlPayload()
   * @returns {Promise<{categoria: string}>}
   */
  async clasificarUsuario(mlPayload) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/predict`,
        mlPayload,
        { timeout: this.timeout }
      );
      return response.data;
    } catch (error) {
      // Fallback graceful: si ML no esta disponible, no bloquear la API
      console.warn('ML Service no disponible, usando fallback generico:', error.message);
      return { categoria: null, fallback: true };
    }
  }
}

module.exports = MLServiceAdapter;
