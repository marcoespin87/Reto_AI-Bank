class CreatePersonaUseCase {
  constructor({ personaRepository, perfilRepository, ligaRepository }) {
    this.personaRepo = personaRepository;
    this.perfilRepo = perfilRepository;
    this.ligaRepo = ligaRepository;
  }

  async execute(data) {
    // Check mail uniqueness
    const existingMail = await this.personaRepo.findByMail(data.mail);
    if (existingMail) {
      throw { status: 409, message: `El mail '${data.mail}' ya está registrado.` };
    }

    // Check numero_cuenta uniqueness
    const existingCuenta = await this.personaRepo.findByNumeroCuenta(data.numero_cuenta);
    if (existingCuenta) {
      throw { status: 409, message: `El número de cuenta '${data.numero_cuenta}' ya está registrado.` };
    }

    // Check username uniqueness
    if (data.username) {
      const existingUser = await this.perfilRepo.findByUsername(data.username);
      if (existingUser) {
        throw { status: 409, message: `El username '${data.username}' ya está registrado.` };
      }
    }

    // Get Bronce liga (starting liga)
    const ligaBronce = await this.ligaRepo.findByNombre('Bronce');
    if (!ligaBronce) {
      throw { status: 500, message: 'Liga Bronce no encontrada en la base de datos.' };
    }

    // Create persona
    const persona = await this.personaRepo.create(data);

    // Create perfil
    const perfil = await this.perfilRepo.create({
      id_persona: persona.id_persona,
      username: data.username || `user_${persona.id_persona}`,
      millas: 0,
      puntos: 0,
      id_liga: ligaBronce.id_liga
    });

    return { persona, perfil: { ...perfil, liga: ligaBronce } };
  }
}

module.exports = CreatePersonaUseCase;
