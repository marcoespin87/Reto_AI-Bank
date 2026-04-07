class CreateTemporadaUseCase {
  constructor({ temporadaRepository }) {
    this.temporadaRepo = temporadaRepository;
  }

  async execute(data) {
    const { nombre, fecha_inicio, fecha_fin } = data;

    if (!nombre || !fecha_inicio || !fecha_fin) {
      throw { status: 400, message: 'nombre, fecha_inicio y fecha_fin son requeridos.' };
    }

    if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
      throw { status: 400, message: 'fecha_fin debe ser posterior a fecha_inicio.' };
    }

    // Only one active temporada at a time
    const hasActiva = await this.temporadaRepo.hasActiva();
    if (hasActiva) {
      throw { status: 409, message: 'Ya existe una temporada activa. Ciérrala antes de crear una nueva.' };
    }

    const temporada = await this.temporadaRepo.create({ nombre, fecha_inicio, fecha_fin });
    return temporada;
  }
}

module.exports = CreateTemporadaUseCase;
