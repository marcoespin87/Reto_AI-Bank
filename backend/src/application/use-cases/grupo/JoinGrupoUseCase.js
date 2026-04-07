class JoinGrupoUseCase {
  constructor({ grupoRepository, perfilRepository }) {
    this.grupoRepo = grupoRepository;
    this.perfilRepo = perfilRepository;
  }

  async execute(idGrupo, data) {
    const { id_perfil } = data;

    if (!id_perfil) {
      throw { status: 400, message: 'id_perfil es requerido.' };
    }

    const grupo = await this.grupoRepo.findById(idGrupo);
    if (!grupo) {
      throw { status: 404, message: `Grupo con id ${idGrupo} no encontrado.` };
    }

    const perfil = await this.perfilRepo.findById(id_perfil);
    if (!perfil) {
      throw { status: 404, message: `Perfil con id ${id_perfil} no encontrado.` };
    }

    // Check if already a member
    const alreadyMember = await this.grupoRepo.isMiembro(idGrupo, id_perfil);
    if (alreadyMember) {
      throw { status: 409, message: 'El perfil ya es miembro de este grupo.' };
    }

    const miembro = await this.grupoRepo.addMiembro(idGrupo, id_perfil, 'miembro');

    return {
      grupo: { id_grupo: grupo.id_grupo, nombre: grupo.nombre },
      miembro: {
        id_perfil: perfil.id_perfil,
        username: perfil.username,
        rol: miembro.rol || 'miembro'
      }
    };
  }
}

module.exports = JoinGrupoUseCase;
