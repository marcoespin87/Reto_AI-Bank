/**
 * Genera el emoji de bandera a partir del código ISO 3166-1 alpha-2.
 * Funciona convirtiendo cada letra en un Regional Indicator Symbol.
 * Ej: "EC" → "🇪🇨",  "CI" → "🇨🇮",  "AR" → "🇦🇷"
 */
export function getFlagEmoji(isoCode: string): string {
  if (!isoCode || isoCode.length < 2) return "🏳️";
  const code = isoCode.toUpperCase().slice(0, 2);
  return (
    String.fromCodePoint(0x1f1e6 + (code.charCodeAt(0) - 65)) +
    String.fromCodePoint(0x1f1e6 + (code.charCodeAt(1) - 65))
  );
}

/**
 * Mapa de ISO alpha-2 → emoji de bandera para todos los países
 * participantes en el Mundial 2026 (48 equipos) y los de la tabla paises.
 */
export const BANDERAS_PAISES: Record<string, string> = {
  // CONCACAF (Norteamérica / Centroamérica / Caribe)
  US: "🇺🇸", // Estados Unidos (sede)
  CA: "🇨🇦", // Canadá (sede)
  MX: "🇲🇽", // México (sede)
  CR: "🇨🇷", // Costa Rica
  HN: "🇭🇳", // Honduras
  JM: "🇯🇲", // Jamaica
  PA: "🇵🇦", // Panamá
  GT: "🇬🇹", // Guatemala
  SV: "🇸🇻", // El Salvador

  // CONMEBOL (Sudamérica)
  AR: "🇦🇷", // Argentina
  BR: "🇧🇷", // Brasil
  UY: "🇺🇾", // Uruguay
  CO: "🇨🇴", // Colombia
  EC: "🇪🇨", // Ecuador
  VE: "🇻🇪", // Venezuela
  PY: "🇵🇾", // Paraguay
  BO: "🇧🇴", // Bolivia
  PE: "🇵🇪", // Perú
  CL: "🇨🇱", // Chile

  // UEFA (Europa)
  DE: "🇩🇪", // Alemania
  FR: "🇫🇷", // Francia
  ES: "🇪🇸", // España
  PT: "🇵🇹", // Portugal
  NL: "🇳🇱", // Países Bajos
  GB: "🇬🇧", // Reino Unido (general)
  GB_ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", // Inglaterra
  GB_SCT: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", // Escocia
  GB_WLS: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", // Gales
  BE: "🇧🇪", // Bélgica
  IT: "🇮🇹", // Italia
  HR: "🇭🇷", // Croacia
  CH: "🇨🇭", // Suiza
  AT: "🇦🇹", // Austria
  DK: "🇩🇰", // Dinamarca
  SE: "🇸🇪", // Suecia
  NO: "🇳🇴", // Noruega
  PL: "🇵🇱", // Polonia
  CZ: "🇨🇿", // República Checa
  SK: "🇸🇰", // Eslovaquia
  HU: "🇭🇺", // Hungría
  RS: "🇷🇸", // Serbia
  RO: "🇷🇴", // Rumanía
  UA: "🇺🇦", // Ucrania
  GR: "🇬🇷", // Grecia
  TR: "🇹🇷", // Turquía
  SI: "🇸🇮", // Eslovenia
  AL: "🇦🇱", // Albania
  GE: "🇬🇪", // Georgia

  // CAF (África)
  MA: "🇲🇦", // Marruecos
  SN: "🇸🇳", // Senegal
  NG: "🇳🇬", // Nigeria
  EG: "🇪🇬", // Egipto
  CI: "🇨🇮", // Costa de Marfil
  CM: "🇨🇲", // Camerún
  GH: "🇬🇭", // Ghana
  TN: "🇹🇳", // Túnez
  DZ: "🇩🇿", // Argelia
  ZA: "🇿🇦", // Sudáfrica
  ML: "🇲🇱", // Mali
  MZ: "🇲🇿", // Mozambique
  KE: "🇰🇪", // Kenia
  AO: "🇦🇴", // Angola
  BF: "🇧🇫", // Burkina Faso

  // AFC (Asia)
  JP: "🇯🇵", // Japón
  KR: "🇰🇷", // Corea del Sur
  SA: "🇸🇦", // Arabia Saudí
  IR: "🇮🇷", // Irán
  AU: "🇦🇺", // Australia
  QA: "🇶🇦", // Qatar
  IQ: "🇮🇶", // Irak
  CN: "🇨🇳", // China
  UZ: "🇺🇿", // Uzbekistán
  JO: "🇯🇴", // Jordania
  AE: "🇦🇪", // Emiratos Árabes
  IN: "🇮🇳", // India

  // OFC (Oceanía)
  NZ: "🇳🇿", // Nueva Zelanda
  FJ: "🇫🇯", // Fiyi
};

/**
 * Obtiene el emoji de bandera dado el código ISO o el nombre del país.
 * Primero busca en el mapa estático; si no lo encuentra, lo genera dinámicamente.
 */
export function getBandera(isoCode: string): string {
  if (!isoCode) return "🏳️";
  const key = isoCode.toUpperCase();
  return BANDERAS_PAISES[key] ?? getFlagEmoji(isoCode);
}

/**
 * Mapa de nombre de país (en español) → código ISO alpha-2.
 * Útil para buscar la bandera cuando solo se tiene el nombre.
 */
export const ISO_POR_NOMBRE: Record<string, string> = {
  "Estados Unidos": "US",
  "Canadá": "CA",
  "México": "MX",
  "Costa Rica": "CR",
  "Honduras": "HN",
  "Jamaica": "JM",
  "Panamá": "PA",
  "Guatemala": "GT",
  "El Salvador": "SV",
  "Argentina": "AR",
  "Brasil": "BR",
  "Uruguay": "UY",
  "Colombia": "CO",
  "Ecuador": "EC",
  "Venezuela": "VE",
  "Paraguay": "PY",
  "Bolivia": "BO",
  "Perú": "PE",
  "Chile": "CL",
  "Alemania": "DE",
  "Francia": "FR",
  "España": "ES",
  "Portugal": "PT",
  "Países Bajos": "NL",
  "Holanda": "NL",
  "Bélgica": "BE",
  "Italia": "IT",
  "Croacia": "HR",
  "Suiza": "CH",
  "Austria": "AT",
  "Dinamarca": "DK",
  "Suecia": "SE",
  "Noruega": "NO",
  "Polonia": "PL",
  "República Checa": "CZ",
  "Eslovaquia": "SK",
  "Hungría": "HU",
  "Serbia": "RS",
  "Rumanía": "RO",
  "Ucrania": "UA",
  "Grecia": "GR",
  "Turquía": "TR",
  "Eslovenia": "SI",
  "Albania": "AL",
  "Georgia": "GE",
  "Inglaterra": "GB_ENG",
  "Escocia": "GB_SCT",
  "Gales": "GB_WLS",
  "Marruecos": "MA",
  "Senegal": "SN",
  "Nigeria": "NG",
  "Egipto": "EG",
  "Costa de Marfil": "CI",
  "Camerún": "CM",
  "Ghana": "GH",
  "Túnez": "TN",
  "Argelia": "DZ",
  "Sudáfrica": "ZA",
  "Japón": "JP",
  "Corea del Sur": "KR",
  "Arabia Saudí": "SA",
  "Irán": "IR",
  "Australia": "AU",
  "Qatar": "QA",
  "Irak": "IQ",
  "China": "CN",
  "Uzbekistán": "UZ",
  "Nueva Zelanda": "NZ",
};

/**
 * Obtiene la bandera a partir del nombre del país en español.
 */
export function getBanderaPorNombre(nombrePais: string): string {
  const iso = ISO_POR_NOMBRE[nombrePais];
  if (iso) return getBandera(iso);
  return "🏳️";
}
