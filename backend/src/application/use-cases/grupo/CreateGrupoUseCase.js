class CreateGrupoUseCase {
  constructor({ grupoRepository, perfilRepository }) {
    this.grupoRepo = grupoRepository;
    this.perfilRepo = perfilRepository;
  }

  async execute(data) {
    // swagger: id_perfil = perfil del creador (mapea a grupo.id_perfil en BD)
    const { nombre, descripcion, id_perfil } = data;
    const id_perfil_creador = id_perfil;

    if (!nombre || !id_perfil_creador) {
      throw { status: 400, message: 'nombre e id_perfil son requeridos.' };
    }

    // Verify perfil exists
    const perfil = await this.perfilRepo.findById(id_perfil_creador);
    if (!perfil) {
      throw { status: 404, message: `Perfil con id ${id_perfil_creador} no encontrado.` };
    }

    // Check name uniqueness
    const existingGrupo = await this.grupoRepo.findByNombre(nombre);
    if (existingGrupo) {
      throw { status: 409, message: `Ya existe un grupo con el nombre '${nombre}'.` };
    }

    const grupo = await this.grupoRepo.create({ nombre, descripcion, id_perfil_creador });
    return grupo;
  }
}

module.exports = CreateGrupoUseCase;
