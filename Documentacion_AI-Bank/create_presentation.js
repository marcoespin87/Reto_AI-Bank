const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "TCS - Tata Consultancy Services";
pres.title = "AI-Bank mAiles: Clientes Unicos, Beneficios Unicos";

// ─── PALETTE ────────────────────────────────────────────────────────────────
const C = {
  bgDark: "071325",
  bgCard: "101c2e",
  bgMid: "1f2a3d",
  blue: "b2c5ff",
  blueBright: "5b8cff",
  gold: "ffd65b",
  goldDark: "f0c110",
  textPrimary: "d7e3fc",
  textMuted: "8c90a1",
  navy: "002b73",
  green: "81C784",
  purple: "CE93D8",
  orange: "FFB74D",
  pink: "F06292",
  red: "ffb4ab",
  white: "FFFFFF",
  black: "000000",
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const makeShadow = () => ({
  type: "outer", blur: 8, offset: 3, angle: 135, color: C.black, opacity: 0.25,
});

const makeCardShadow = () => ({
  type: "outer", blur: 12, offset: 4, angle: 135, color: C.black, opacity: 0.35,
});

// Header bar for content slides
function addHeader(slide, title, subtitle) {
  // Top bar background
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.95,
    fill: { color: C.bgCard },
  });
  // Gold accent line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0.93, w: 10, h: 0.03,
    fill: { color: C.gold },
  });
  // Title
  slide.addText(title, {
    x: 0.6, y: 0.1, w: 7.5, h: 0.5,
    fontSize: 22, fontFace: "Calibri", bold: true, color: C.blue,
    margin: 0,
  });
  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 0.55, w: 7.5, h: 0.3,
      fontSize: 11, fontFace: "Calibri", color: C.textMuted,
      margin: 0,
    });
  }
  // Logo area - right
  slide.addText("AI-Bank mAiles", {
    x: 7.8, y: 0.2, w: 1.8, h: 0.55,
    fontSize: 11, fontFace: "Calibri", bold: true, italic: true,
    color: C.gold, align: "right", margin: 0,
  });
}

// Footer for content slides
function addFooter(slide, pageNum) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.25, w: 10, h: 0.375,
    fill: { color: C.bgCard },
  });
  slide.addText("TCS Confidential | Reto Premium - Recompensa Premium", {
    x: 0.6, y: 5.28, w: 6, h: 0.3,
    fontSize: 8, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });
  slide.addText(`${pageNum} / 10`, {
    x: 8, y: 5.28, w: 1.5, h: 0.3,
    fontSize: 8, fontFace: "Calibri", color: C.textMuted, align: "right", margin: 0,
  });
}

// Card shape
function addCard(slide, x, y, w, h, fillColor) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fillColor || C.bgCard },
    shadow: makeCardShadow(),
    line: { color: C.bgMid, width: 0.5 },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1: TITLE
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };

  // Large decorative circle top-right
  slide.addShape(pres.shapes.OVAL, {
    x: 7.5, y: -2.5, w: 5, h: 5,
    fill: { color: C.blue, transparency: 92 },
  });
  // Small decorative circle bottom-left
  slide.addShape(pres.shapes.OVAL, {
    x: -1.5, y: 3.5, w: 4, h: 4,
    fill: { color: C.gold, transparency: 94 },
  });

  // Gold accent bar top
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.06,
    fill: { color: C.gold },
  });

  // Branding
  slide.addText("RETO PREMIUM  —  RECOMPENSA PREMIUM", {
    x: 0.8, y: 0.6, w: 8.4, h: 0.35,
    fontSize: 10, fontFace: "Calibri", color: C.textMuted,
    charSpacing: 4, margin: 0,
  });

  // Main title
  slide.addText("AI-Bank mAiles", {
    x: 0.8, y: 1.3, w: 8.4, h: 0.9,
    fontSize: 44, fontFace: "Calibri", bold: true, color: C.blue,
    margin: 0,
  });

  // Subtitle
  slide.addText("Donde la Banca se Convierte en Juego", {
    x: 0.8, y: 2.15, w: 8.4, h: 0.6,
    fontSize: 24, fontFace: "Calibri", color: C.gold,
    italic: true, margin: 0,
  });

  // Tagline
  slide.addText("Engagement Inteligente con Recompensas Personalizadas por IA\npara el Mundial 2026", {
    x: 0.8, y: 3.0, w: 6, h: 0.6,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted,
    margin: 0,
  });

  // Separator line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.85, w: 2.5, h: 0.025,
    fill: { color: C.gold },
  });

  // Info row
  slide.addText([
    { text: "TCS - Tata Consultancy Services", options: { bold: true, color: C.textPrimary, fontSize: 12, breakLine: true } },
    { text: "Abril 2026", options: { color: C.textMuted, fontSize: 11 } },
  ], {
    x: 0.8, y: 4.1, w: 5, h: 0.6, fontFace: "Calibri", margin: 0,
  });

  // Bottom gold bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.565, w: 10, h: 0.06,
    fill: { color: C.gold },
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2: CRISIS DE ENGAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "La Banca Tradicional Tiene un Problema de $3.3 Trillones", "BANCA TRADICIONAL: CRISIS DE ENGAGEMENT");
  addFooter(slide, 2);

  // Takeaway
  slide.addText('"Los bancos estan perdiendo a la generacion mas rentable del futuro porque no hablan su idioma."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.4,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  // LEFT: Stats cards
  const stats = [
    { num: "72%", label: "Millennials prefieren tech\nsobre banca tradicional", src: "Accenture 2024", color: C.blue },
    { num: "68%", label: "Gen Z abandona apps\nbancarias en 90 dias", src: "McKinsey 2024", color: C.red },
    { num: "29%", label: "Clientes se consideran\n'altamente comprometidos'", src: "Gallup 2024", color: C.orange },
    { num: "21%", label: "Churn anual promedio\nen apps bancarias LATAM", src: "Finnovista 2024", color: C.pink },
  ];

  stats.forEach((s, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const cx = 0.6 + col * 2.35;
    const cy = 1.7 + row * 1.55;

    addCard(slide, cx, cy, 2.2, 1.4);
    slide.addText(s.num, {
      x: cx + 0.15, y: cy + 0.1, w: 1.9, h: 0.55,
      fontSize: 30, fontFace: "Calibri", bold: true, color: s.color, margin: 0,
    });
    slide.addText(s.label, {
      x: cx + 0.15, y: cy + 0.65, w: 1.9, h: 0.45,
      fontSize: 9, fontFace: "Calibri", color: C.textPrimary, margin: 0,
    });
    slide.addText(s.src, {
      x: cx + 0.15, y: cy + 1.1, w: 1.9, h: 0.2,
      fontSize: 7, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });

  // RIGHT: Chart - Engagement comparison
  addCard(slide, 5.35, 1.7, 4.25, 3.25);

  slide.addText("ENGAGEMENT POR TIPO DE APP", {
    x: 5.6, y: 1.85, w: 3.8, h: 0.25,
    fontSize: 9, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });

  // Bar chart
  slide.addChart(pres.charts.BAR, [{
    name: "Engagement %",
    labels: ["Banca\nSucursal", "Banca\nDigital", "Apps\nFintech", "Neobancos\nGamificados"],
    values: [12, 29, 58, 74],
  }], {
    x: 5.55, y: 2.15, w: 3.9, h: 2.6,
    barDir: "col",
    chartColors: [C.blue],
    chartArea: { fill: { color: C.bgCard }, roundedCorners: false },
    plotArea: { fill: { color: C.bgCard } },
    catAxisLabelColor: C.textMuted,
    catAxisLabelFontSize: 7,
    valAxisLabelColor: C.textMuted,
    valAxisLabelFontSize: 7,
    valGridLine: { color: C.bgMid, size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: C.gold,
    dataLabelFontSize: 10,
    dataLabelPosition: "outEnd",
    showLegend: false,
    valAxisHidden: true,
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3: PROBLEMATICA
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "Consecuencias del Desinteres: Lo Que Pierde AI-Bank", "PROBLEMATICA REAL: EL DESINTERES");
  addFooter(slide, 3);

  slide.addText('"Cada cliente desconectado no solo es un usuario perdido, es un ecosistema de productos cruzados que nunca se activa."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  const problems = [
    {
      icon: "👻", title: "Fuga silenciosa",
      lines: [
        "35% cuentas dormidas en LATAM",
        "Costo nuevo cliente: 5x-7x vs retener",
      ],
      accent: C.red,
    },
    {
      icon: "📉", title: "Cross-sell fallido",
      lines: [
        "Sin engagement: 1.3 productos/cliente",
        "Con engagement: 4.2 productos (3.5x revenue)",
      ],
      accent: C.orange,
    },
    {
      icon: "🎯", title: "Lealtad irrelevante",
      lines: [
        "Solo 14% tasa de canje en banca LATAM",
        "58% dice que los puntos son irrelevantes",
      ],
      accent: C.purple,
    },
    {
      icon: "🧓", title: "Desconexion generacional",
      lines: [
        "Mediana edad cliente activo: 42 anos",
        "Gen Z + Millennials = 45% fuerza laboral EC",
      ],
      accent: C.blue,
    },
  ];

  problems.forEach((p, i) => {
    const cx = 0.6 + i * 2.3;
    const cy = 1.65;

    addCard(slide, cx, cy, 2.15, 2.5);

    // Accent top stripe
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 2.15, h: 0.04,
      fill: { color: p.accent },
    });

    slide.addText(p.icon, {
      x: cx + 0.15, y: cy + 0.2, w: 0.5, h: 0.5,
      fontSize: 26, margin: 0,
    });

    slide.addText(p.title, {
      x: cx + 0.15, y: cy + 0.7, w: 1.85, h: 0.35,
      fontSize: 13, fontFace: "Calibri", bold: true, color: C.textPrimary, margin: 0,
    });

    const bulletItems = p.lines.map((line, idx) => ({
      text: line,
      options: {
        bullet: true,
        fontSize: 9,
        color: C.textMuted,
        breakLine: idx < p.lines.length - 1,
      },
    }));
    slide.addText(bulletItems, {
      x: cx + 0.15, y: cy + 1.1, w: 1.85, h: 1.2,
      fontFace: "Calibri", margin: 0, paraSpaceAfter: 6,
    });
  });

  // Funnel visual at bottom
  addCard(slide, 0.6, 4.3, 8.8, 0.8);
  const funnel = [
    { label: "100 Clientes\nNuevos", w: 1.6, color: C.blue },
    { label: "→", w: 0.3, color: C.textMuted },
    { label: "68 abandonan\nen 90 dias", w: 1.6, color: C.red },
    { label: "→", w: 0.3, color: C.textMuted },
    { label: "32 quedan", w: 1.2, color: C.orange },
    { label: "→", w: 0.3, color: C.textMuted },
    { label: "23 bajo\nengagement", w: 1.4, color: C.textMuted },
    { label: "→", w: 0.3, color: C.textMuted },
    { label: "Solo 9\nactivos", w: 1.2, color: C.green },
  ];

  let fx = 0.8;
  funnel.forEach((f) => {
    slide.addText(f.label, {
      x: fx, y: 4.4, w: f.w, h: 0.6,
      fontSize: f.w < 0.4 ? 14 : 10, fontFace: "Calibri", bold: f.w >= 0.4,
      color: f.color, align: "center", valign: "middle", margin: 0,
    });
    fx += f.w + 0.05;
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4: LA OPORTUNIDAD
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "El Mundial 2026: El Momento Perfecto", "LA OPORTUNIDAD");
  addFooter(slide, 4);

  slide.addText('"No estamos creando una app de apuestas. Estamos creando un puente emocional entre el cliente y su banco."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  // LEFT: World Cup facts
  addCard(slide, 0.6, 1.6, 4.3, 3.4);
  slide.addText("MUNDIAL 2026 EN DATOS", {
    x: 0.8, y: 1.7, w: 3.9, h: 0.25,
    fontSize: 9, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });

  const facts = [
    { icon: "🌍", stat: "5,000M", desc: "Espectadores proyectados" },
    { icon: "⚽", stat: "104", desc: "Partidos en el torneo" },
    { icon: "📱", stat: "78%", desc: "Consumira contenido via movil" },
    { icon: "🇪🇨", stat: "48", desc: "Selecciones (Ecuador clasificado)" },
    { icon: "📅", stat: "~45", desc: "Dias de engagement continuo" },
  ];

  facts.forEach((f, i) => {
    const fy = 2.1 + i * 0.58;
    slide.addText(f.icon, {
      x: 0.85, y: fy, w: 0.4, h: 0.45, fontSize: 18, margin: 0,
    });
    slide.addText(f.stat, {
      x: 1.35, y: fy, w: 1.1, h: 0.25,
      fontSize: 16, fontFace: "Calibri", bold: true, color: C.blue, margin: 0,
    });
    slide.addText(f.desc, {
      x: 1.35, y: fy + 0.22, w: 3.3, h: 0.2,
      fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });

  // RIGHT: Formula diagram
  addCard(slide, 5.2, 1.6, 4.2, 3.4);
  slide.addText("LA FORMULA AI-BANK mAILES", {
    x: 5.4, y: 1.7, w: 3.8, h: 0.25,
    fontSize: 9, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });

  // 3 pillars
  const pillars = [
    { icon: "⚽", title: "Catalizador", desc: "Mundial 2026\n104 partidos, 5B espectadores", color: C.gold },
    { icon: "🎮", title: "Mecanica", desc: "Gamificacion\nPronosticos + Cromos + Ligas", color: C.blue },
    { icon: "🤖", title: "Inteligencia", desc: "IA Predictiva\n49 features, 9 categorias", color: C.purple },
  ];

  pillars.forEach((p, i) => {
    const py = 2.1 + i * 0.85;
    // Colored circle for icon
    slide.addShape(pres.shapes.OVAL, {
      x: 5.5, y: py + 0.02, w: 0.45, h: 0.45,
      fill: { color: p.color, transparency: 80 },
    });
    slide.addText(p.icon, {
      x: 5.5, y: py, w: 0.45, h: 0.5, fontSize: 18,
      align: "center", valign: "middle", margin: 0,
    });
    slide.addText(p.title, {
      x: 6.1, y: py, w: 3, h: 0.25,
      fontSize: 13, fontFace: "Calibri", bold: true, color: C.textPrimary, margin: 0,
    });
    slide.addText(p.desc, {
      x: 6.1, y: py + 0.25, w: 3, h: 0.45,
      fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });

    // Arrow between items
    if (i < 2) {
      slide.addText("↓", {
        x: 5.6, y: py + 0.55, w: 0.25, h: 0.25,
        fontSize: 12, color: C.textMuted, align: "center", margin: 0,
      });
    }
  });

  // Result box
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.5, y: 4.55, w: 3.6, h: 0.35,
    fill: { color: C.green, transparency: 80 },
    line: { color: C.green, width: 1 },
  });
  slide.addText("= Fidelizacion Exponencial", {
    x: 5.5, y: 4.55, w: 3.6, h: 0.35,
    fontSize: 12, fontFace: "Calibri", bold: true, color: C.green,
    align: "center", valign: "middle", margin: 0,
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5: PROPUESTA DE VALOR
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "AI-Bank mAiles: Donde la Banca se Convierte en Juego", "PROPUESTA DE VALOR");
  addFooter(slide, 5);

  slide.addText('"Una plataforma que convierte cada transaccion en progreso, cada pronostico en emocion, y cada premio en algo personal."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  // 4 quadrants (2x2)
  const quads = [
    {
      icon: "📱", title: "App Movil Completa",
      items: ["8 pantallas funcionales", "React Native + Expo + TypeScript", "Supabase: 14 tablas + Auth"],
      accent: C.blue,
    },
    {
      icon: "🎮", title: "Gamificacion Multi-Capa",
      items: ["mAiles + Cromos coleccionables", "Pronosticos: hasta 1,000 mAiles", "Ligas, Grupos, Medallas 1-6"],
      accent: C.gold,
    },
    {
      icon: "🤖", title: "Chatbot IA Deportivo",
      items: ["3 Agentes: Orquestador + Analista + Censor", "6 tools de busqueda en tiempo real", "Gemini 2.5 Flash + Tavily Search"],
      accent: C.purple,
    },
    {
      icon: "🧠", title: "Modelo de Segmentacion IA",
      items: ["Logistic Regression: 30K clientes", "9 categorias, 38 premios", "F1: 78.72% | Accuracy: 78.67%"],
      accent: C.green,
    },
  ];

  quads.forEach((q, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.6 + col * 4.6;
    const cy = 1.6 + row * 1.75;

    addCard(slide, cx, cy, 4.35, 1.6);

    // Accent left stripe
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 0.06, h: 1.6,
      fill: { color: q.accent },
    });

    slide.addText(q.icon, {
      x: cx + 0.2, y: cy + 0.1, w: 0.5, h: 0.5, fontSize: 24, margin: 0,
    });

    slide.addText(q.title, {
      x: cx + 0.75, y: cy + 0.12, w: 3.3, h: 0.3,
      fontSize: 14, fontFace: "Calibri", bold: true, color: C.textPrimary, margin: 0,
    });

    const bullets = q.items.map((item, idx) => ({
      text: item,
      options: {
        bullet: true,
        fontSize: 10,
        color: C.textMuted,
        breakLine: idx < q.items.length - 1,
      },
    }));
    slide.addText(bullets, {
      x: cx + 0.75, y: cy + 0.5, w: 3.4, h: 1.0,
      fontFace: "Calibri", margin: 0, paraSpaceAfter: 4,
    });
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6: FLUJO DEL USUARIO
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "Gasta, Predice, Compite, Gana", "FLUJO DEL USUARIO: LOOP DE ENGAGEMENT");
  addFooter(slide, 6);

  slide.addText('"Cada accion del usuario alimenta un ciclo virtuoso donde gastar, jugar y ganar se refuerzan mutuamente."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  // 6 steps in a flow
  const steps = [
    { num: "1", icon: "💳", title: "GASTA", desc: "Tarjeta AI-Bank\nnormalmente", color: C.blue },
    { num: "2", icon: "⭐", title: "ACUMULA", desc: "$100 = 10 mAiles\n$20 = 1 cromo", color: C.gold },
    { num: "3", icon: "⚽", title: "PREDICE", desc: "Pronostica con\nchatbot IA", color: C.green },
    { num: "4", icon: "👥", title: "COMPITE", desc: "Grupos + Ligas\nVotacion social", color: C.purple },
    { num: "5", icon: "🏅", title: "SUBE", desc: "Medallas 1-6\nx1.0 a x3.0", color: C.orange },
    { num: "6", icon: "🎁", title: "GANA", desc: "Premio IA\npersonalizado", color: C.pink },
  ];

  steps.forEach((s, i) => {
    const cx = 0.45 + i * 1.55;
    const cy = 1.6;

    addCard(slide, cx, cy, 1.38, 2.05);

    // Number badge
    slide.addShape(pres.shapes.OVAL, {
      x: cx + 0.06, y: cy + 0.1, w: 0.35, h: 0.35,
      fill: { color: s.color },
    });
    slide.addText(s.num, {
      x: cx + 0.06, y: cy + 0.1, w: 0.35, h: 0.35,
      fontSize: 12, fontFace: "Calibri", bold: true,
      color: C.bgDark, align: "center", valign: "middle", margin: 0,
    });

    slide.addText(s.icon, {
      x: cx + 0.15, y: cy + 0.55, w: 1.1, h: 0.5,
      fontSize: 28, align: "center", margin: 0,
    });
    slide.addText(s.title, {
      x: cx + 0.1, y: cy + 1.05, w: 1.18, h: 0.3,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: s.color, align: "center", margin: 0,
    });
    slide.addText(s.desc, {
      x: cx + 0.1, y: cy + 1.35, w: 1.18, h: 0.55,
      fontSize: 8, fontFace: "Calibri",
      color: C.textMuted, align: "center", margin: 0,
    });

    // Arrow between steps
    if (i < 5) {
      slide.addText("→", {
        x: cx + 1.35, y: cy + 0.8, w: 0.25, h: 0.3,
        fontSize: 14, color: C.textMuted, align: "center", valign: "middle", margin: 0,
      });
    }
  });

  // Loop arrow indicator
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 3.85, w: 8.8, h: 0.04,
    fill: { color: C.gold, transparency: 60 },
  });
  slide.addText("↻  El premio motiva a seguir gastando → ciclo virtuoso de engagement", {
    x: 0.6, y: 3.95, w: 8.8, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: C.gold,
    align: "center", italic: true, margin: 0,
  });

  // Rewards table at bottom
  addCard(slide, 0.6, 4.35, 8.8, 0.8);
  slide.addText("RECOMPENSAS POR PREDICCION", {
    x: 0.8, y: 4.4, w: 2.5, h: 0.2,
    fontSize: 8, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });

  const rewards = [
    { label: "Marcador exacto", value: "+1,000 mAiles", color: C.gold },
    { label: "Ganador correcto", value: "+300 mAiles", color: C.blue },
    { label: "Racha activa (bonus)", value: "+200 mAiles", color: C.orange },
  ];

  rewards.forEach((r, i) => {
    const rx = 0.8 + i * 3;
    slide.addText(r.value, {
      x: rx, y: 4.65, w: 2.5, h: 0.2,
      fontSize: 13, fontFace: "Calibri", bold: true, color: r.color, margin: 0,
    });
    slide.addText(r.label, {
      x: rx, y: 4.85, w: 2.5, h: 0.2,
      fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7: MODELO DE SEGMENTACION
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "Los Premios No Son Para Todos - Son Para Ti", "MODELO DE SEGMENTACION IA");
  addFooter(slide, 7);

  slide.addText('"Un sistema dual ML + reglas que analiza 49 variables por cliente para asignar el premio exacto."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  // LEFT: Pipeline flow
  // Input block
  addCard(slide, 0.6, 1.6, 3.0, 1.4);
  slide.addText("INPUT: 49 Features", {
    x: 0.75, y: 1.65, w: 2.7, h: 0.25,
    fontSize: 10, fontFace: "Calibri", bold: true, color: C.blue,
    charSpacing: 1, margin: 0,
  });

  const featureBlocks = [
    "Financiero (9)", "Gasto % (9)", "Gamificacion (8)",
    "Social (4)", "Demografico (5)", "Digital (5)",
  ];
  const fbItems = featureBlocks.map((fb, idx) => ({
    text: fb,
    options: { bullet: true, fontSize: 8, color: C.textMuted, breakLine: idx < featureBlocks.length - 1 },
  }));
  slide.addText(fbItems, {
    x: 0.75, y: 1.95, w: 2.7, h: 0.95, fontFace: "Calibri", margin: 0, paraSpaceAfter: 2,
  });

  // Arrow
  slide.addText("▼", {
    x: 1.6, y: 3.05, w: 0.5, h: 0.25,
    fontSize: 14, color: C.gold, align: "center", margin: 0,
  });

  // Model 1
  addCard(slide, 0.6, 3.35, 3.0, 0.8);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 3.35, w: 0.06, h: 0.8,
    fill: { color: C.purple },
  });
  slide.addText("MODELO 1: ML", {
    x: 0.8, y: 3.4, w: 2.6, h: 0.2,
    fontSize: 10, fontFace: "Calibri", bold: true, color: C.purple, margin: 0,
  });
  slide.addText("Logistic Regression\n30,000 datos entrenamiento\nF1: 78.72% | Acc: 78.67%", {
    x: 0.8, y: 3.6, w: 2.6, h: 0.5,
    fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  // Arrow
  slide.addText("▼", {
    x: 1.6, y: 4.2, w: 0.5, h: 0.25,
    fontSize: 14, color: C.gold, align: "center", margin: 0,
  });

  // Model 2
  addCard(slide, 0.6, 4.45, 3.0, 0.65);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 4.45, w: 0.06, h: 0.65,
    fill: { color: C.orange },
  });
  slide.addText("MODELO 2: Reglas de Negocio", {
    x: 0.8, y: 4.5, w: 2.6, h: 0.2,
    fontSize: 10, fontFace: "Calibri", bold: true, color: C.orange, margin: 0,
  });
  slide.addText("Scoring afinidad 0-100\nPremio + Razones + Alternativas", {
    x: 0.8, y: 4.7, w: 2.6, h: 0.35,
    fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  // RIGHT: 9 Categories grid
  addCard(slide, 3.9, 1.6, 5.5, 3.5);
  slide.addText("9 CATEGORIAS DE PREMIO  |  38 PREMIOS ESPECIFICOS", {
    x: 4.1, y: 1.65, w: 5.1, h: 0.25,
    fontSize: 9, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 1, margin: 0,
  });

  const categories = [
    { icon: "📱", name: "Tecnologia", example: "Smartphone, Laptop, Smartwatch", color: "4FC3F7" },
    { icon: "🏝️", name: "Viajes Nacionales", example: "Galapagos, Amazonia, Ruta Sol", color: C.green },
    { icon: "✈️", name: "Viajes Internacionales", example: "Cancun, Europa, Crucero", color: C.orange },
    { icon: "🍽️", name: "Gastronomia", example: "Cena Premium, Cata Vinos", color: C.pink },
    { icon: "🎭", name: "Entretenimiento", example: "Conciertos VIP, Liga Pro VIP", color: C.purple },
    { icon: "💚", name: "Salud & Bienestar", example: "Gimnasio, Spa, Chequeo Medico", color: "80DEEA" },
    { icon: "📚", name: "Educacion", example: "Coursera, Idiomas, Beca", color: "FFD54F" },
    { icon: "🏠", name: "Hogar & Lifestyle", example: "Robot Aspirador, Decoracion", color: "A5D6A7" },
    { icon: "💎", name: "Premium Financiero", example: "Tarjeta Black, Inversion $500", color: C.gold },
  ];

  categories.forEach((cat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = 4.15 + col * 1.75;
    const cy = 2.0 + row * 1.05;

    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cy, w: 1.6, h: 0.9,
      fill: { color: C.bgDark },
      line: { color: cat.color, width: 0.5 },
    });

    slide.addText(cat.icon, {
      x: cx + 0.05, y: cy + 0.05, w: 0.35, h: 0.35, fontSize: 16, margin: 0,
    });
    slide.addText(cat.name, {
      x: cx + 0.4, y: cy + 0.05, w: 1.15, h: 0.25,
      fontSize: 8, fontFace: "Calibri", bold: true, color: C.textPrimary, margin: 0,
    });
    slide.addText(cat.example, {
      x: cx + 0.08, y: cy + 0.4, w: 1.45, h: 0.45,
      fontSize: 7, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8: ARQUITECTURA
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "Arquitectura: Tres Motores, Una Experiencia", "ARQUITECTURA TECNICA");
  addFooter(slide, 8);

  slide.addText('"Microservicios independientes: app movil, chatbot IA y modelo de segmentacion, unidos por APIs REST."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  // FRONTEND block (top center)
  addCard(slide, 3.2, 1.55, 3.6, 0.75);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 3.2, y: 1.55, w: 3.6, h: 0.06, fill: { color: C.blue },
  });
  slide.addText("📱  FRONTEND", {
    x: 3.35, y: 1.63, w: 2, h: 0.2,
    fontSize: 10, fontFace: "Calibri", bold: true, color: C.blue, margin: 0,
  });
  slide.addText("React Native + Expo + TypeScript  |  8 pantallas", {
    x: 3.35, y: 1.85, w: 3.3, h: 0.2,
    fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  // Arrows down from frontend
  slide.addShape(pres.shapes.LINE, {
    x: 3.5, y: 2.3, w: 0, h: 0.4,
    line: { color: C.textMuted, width: 1, dashType: "dash" },
  });
  slide.addShape(pres.shapes.LINE, {
    x: 5.0, y: 2.3, w: 0, h: 0.4,
    line: { color: C.textMuted, width: 1, dashType: "dash" },
  });
  slide.addShape(pres.shapes.LINE, {
    x: 6.5, y: 2.3, w: 0, h: 0.4,
    line: { color: C.textMuted, width: 1, dashType: "dash" },
  });

  // 3 backend blocks
  // Backend 1: Supabase
  addCard(slide, 0.6, 2.75, 3.0, 1.6);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.75, w: 0.06, h: 1.6, fill: { color: C.green },
  });
  slide.addText("🗄️  SUPABASE", {
    x: 0.8, y: 2.8, w: 2.6, h: 0.25,
    fontSize: 11, fontFace: "Calibri", bold: true, color: C.green, margin: 0,
  });
  const sbItems = [
    "PostgreSQL + Auth + Realtime",
    "14 tablas relacionales",
    "Users, Transactions, Predictions",
    "Stickers, Groups, Rewards",
  ].map((t, i, a) => ({
    text: t,
    options: { bullet: true, fontSize: 9, color: C.textMuted, breakLine: i < a.length - 1 },
  }));
  slide.addText(sbItems, {
    x: 0.8, y: 3.1, w: 2.6, h: 1.1,
    fontFace: "Calibri", margin: 0, paraSpaceAfter: 3,
  });

  // Backend 2: Chatbot
  addCard(slide, 3.75, 2.75, 2.85, 1.6);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 3.75, y: 2.75, w: 0.06, h: 1.6, fill: { color: C.purple },
  });
  slide.addText("🤖  CHATBOT IA", {
    x: 3.95, y: 2.8, w: 2.45, h: 0.25,
    fontSize: 11, fontFace: "Calibri", bold: true, color: C.purple, margin: 0,
  });
  slide.addText("FastAPI :8001", {
    x: 3.95, y: 3.05, w: 2.45, h: 0.2,
    fontSize: 8, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });
  const cbItems = [
    "Orquestador (Gemini 2.5 Flash)",
    "Agente Analista: 6 tools",
    "Agente Censor: Markdown",
    "Tavily Search → FIFA, SofaScore",
  ].map((t, i, a) => ({
    text: t,
    options: { bullet: true, fontSize: 9, color: C.textMuted, breakLine: i < a.length - 1 },
  }));
  slide.addText(cbItems, {
    x: 3.95, y: 3.25, w: 2.45, h: 1.0,
    fontFace: "Calibri", margin: 0, paraSpaceAfter: 3,
  });

  // Backend 3: Segmentacion
  addCard(slide, 6.8, 2.75, 2.7, 1.6);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.8, y: 2.75, w: 0.06, h: 1.6, fill: { color: C.orange },
  });
  slide.addText("🧠  SEGMENTACION", {
    x: 7.0, y: 2.8, w: 2.3, h: 0.25,
    fontSize: 11, fontFace: "Calibri", bold: true, color: C.orange, margin: 0,
  });
  slide.addText("FastAPI :8000", {
    x: 7.0, y: 3.05, w: 2.3, h: 0.2,
    fontSize: 8, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });
  const sgItems = [
    "ML: Logistic Regression",
    "49 features → 9 categorias",
    "Motor de reglas: 38 premios",
    "Scoring afinidad 0-100",
  ].map((t, i, a) => ({
    text: t,
    options: { bullet: true, fontSize: 9, color: C.textMuted, breakLine: i < a.length - 1 },
  }));
  slide.addText(sgItems, {
    x: 7.0, y: 3.25, w: 2.3, h: 1.0,
    fontFace: "Calibri", margin: 0, paraSpaceAfter: 3,
  });

  // Tech stack bar at bottom
  addCard(slide, 0.6, 4.55, 8.8, 0.6);
  slide.addText("STACK TECNOLOGICO", {
    x: 0.8, y: 4.58, w: 2, h: 0.2,
    fontSize: 8, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });
  const techStack = [
    { name: "React Native", color: C.blue },
    { name: "TypeScript", color: "4FC3F7" },
    { name: "FastAPI", color: C.green },
    { name: "Python", color: C.gold },
    { name: "scikit-learn", color: C.orange },
    { name: "LangGraph", color: C.purple },
    { name: "Gemini 2.5", color: C.pink },
    { name: "Supabase", color: C.green },
  ];

  techStack.forEach((t, i) => {
    const tx = 0.8 + i * 1.12;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: tx, y: 4.82, w: 1.0, h: 0.28,
      fill: { color: t.color, transparency: 85 },
      line: { color: t.color, width: 0.5 },
    });
    slide.addText(t.name, {
      x: tx, y: 4.82, w: 1.0, h: 0.28,
      fontSize: 7, fontFace: "Calibri", bold: true,
      color: t.color, align: "center", valign: "middle", margin: 0,
    });
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 9: IMPACTO ESPERADO
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, "Impacto Esperado: Los Numeros que Importan", "ROI Y PROYECCIONES");
  addFooter(slide, 9);

  slide.addText('"AI-Bank mAiles no es un gasto. Es una inversion con ROI medible en engagement, retencion y lifetime value."', {
    x: 0.6, y: 1.1, w: 8.8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", italic: true, color: C.gold, margin: 0,
  });

  // KPI comparison cards (top row)
  const kpis = [
    { label: "Sesiones/semana", before: "1.2", after: "4.8", change: "+300%", color: C.blue },
    { label: "Retencion 90d", before: "32%", after: "68%", change: "+112%", color: C.green },
    { label: "Productos/cliente", before: "1.3", after: "2.8", change: "+115%", color: C.purple },
    { label: "Canje rewards", before: "14%", after: "58%", change: "+314%", color: C.gold },
    { label: "Churn anual", before: "21%", after: "9%", change: "-57%", color: C.orange },
  ];

  kpis.forEach((k, i) => {
    const cx = 0.6 + i * 1.85;
    addCard(slide, cx, 1.6, 1.7, 1.55);

    slide.addText(k.change, {
      x: cx + 0.1, y: 1.65, w: 1.5, h: 0.45,
      fontSize: 22, fontFace: "Calibri", bold: true, color: k.color, margin: 0,
    });
    slide.addText(k.label, {
      x: cx + 0.1, y: 2.1, w: 1.5, h: 0.2,
      fontSize: 9, fontFace: "Calibri", bold: true, color: C.textPrimary, margin: 0,
    });
    slide.addText(`${k.before}  →  ${k.after}`, {
      x: cx + 0.1, y: 2.35, w: 1.5, h: 0.2,
      fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });

    // Mini progress visual
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx + 0.1, y: 2.65, w: 1.5, h: 0.06,
      fill: { color: C.bgMid },
    });
    const fillPct = Math.min(parseFloat(k.change.replace(/[+\-%]/g, "")) / 400, 1);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx + 0.1, y: 2.65, w: 1.5 * fillPct, h: 0.06,
      fill: { color: k.color },
    });
  });

  // Bottom: ROI sources + Benchmarks
  addCard(slide, 0.6, 3.35, 5.0, 1.75);
  slide.addText("FUENTES DE ROI", {
    x: 0.8, y: 3.4, w: 4.6, h: 0.25,
    fontSize: 9, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });

  const roi = [
    { icon: "💳", title: "+18% volumen transaccional", desc: "mAiles incentiva uso de tarjeta (gasto = cromos = mAiles)" },
    { icon: "📊", title: "Cross-sell por engagement", desc: "Medalla 4+ → candidatos a productos premium" },
    { icon: "📈", title: "Data como activo", desc: "49 vars/cliente → credit scoring, prediccion de churn" },
    { icon: "♻️", title: "Escalable post-Mundial", desc: "Copa America, Champions, Eliminatorias" },
  ];

  roi.forEach((r, i) => {
    const ry = 3.72 + i * 0.32;
    slide.addText(`${r.icon}  ${r.title}`, {
      x: 0.8, y: ry, w: 4.6, h: 0.18,
      fontSize: 9, fontFace: "Calibri", bold: true, color: C.textPrimary, margin: 0,
    });
    slide.addText(r.desc, {
      x: 1.2, y: ry + 0.16, w: 4.2, h: 0.15,
      fontSize: 7.5, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });

  // Benchmarks
  addCard(slide, 5.8, 3.35, 3.6, 1.75);
  slide.addText("BENCHMARKS DE REFERENCIA", {
    x: 6.0, y: 3.4, w: 3.2, h: 0.25,
    fontSize: 9, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });

  const benchmarks = [
    { name: "Nubank", stat: "+40% retencion\n2.3x cross-sell", color: C.purple },
    { name: "Revolut", stat: "4.5x sesiones\ndiarias", color: C.blue },
    { name: "Starbucks", stat: "Miembros gastan\n3x mas", color: C.green },
  ];

  benchmarks.forEach((b, i) => {
    const by = 3.75 + i * 0.42;
    slide.addShape(pres.shapes.OVAL, {
      x: 6.0, y: by + 0.02, w: 0.3, h: 0.3,
      fill: { color: b.color, transparency: 75 },
    });
    slide.addText(b.name, {
      x: 6.4, y: by, w: 1.2, h: 0.2,
      fontSize: 10, fontFace: "Calibri", bold: true, color: b.color, margin: 0,
    });
    slide.addText(b.stat, {
      x: 7.5, y: by, w: 1.7, h: 0.35,
      fontSize: 8, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });
})();

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 10: CONCLUSIONES
// ═══════════════════════════════════════════════════════════════════════════
(() => {
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };

  // Decorative circles
  slide.addShape(pres.shapes.OVAL, {
    x: -2, y: -2, w: 6, h: 6,
    fill: { color: C.blue, transparency: 94 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 7, y: 2, w: 5, h: 5,
    fill: { color: C.gold, transparency: 94 },
  });

  // Gold accent top
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.06,
    fill: { color: C.gold },
  });

  slide.addText("El Futuro de la Banca es un Juego.", {
    x: 0.8, y: 0.5, w: 8.4, h: 0.7,
    fontSize: 30, fontFace: "Calibri", bold: true, color: C.blue, margin: 0,
  });
  slide.addText("Y Nosotros Ya Tenemos las Reglas.", {
    x: 0.8, y: 1.1, w: 8.4, h: 0.55,
    fontSize: 24, fontFace: "Calibri", color: C.gold, italic: true, margin: 0,
  });

  // 3 differentiators
  const diffs = [
    {
      num: "01", title: "No es un programa de puntos.\nEs una experiencia.",
      desc: "Cromos, predicciones, grupos, ligas, medallas — mecanicas que generan habito.",
      color: C.blue,
    },
    {
      num: "02", title: "No es un premio generico.\nEs TU premio.",
      desc: "49 variables + F1: 78.72% — cada cliente recibe lo que realmente quiere.",
      color: C.gold,
    },
    {
      num: "03", title: "No es una demo.\nFunciona.",
      desc: "App completa, APIs activas, modelo entrenado. Listo para pilotar.",
      color: C.green,
    },
  ];

  diffs.forEach((d, i) => {
    const cx = 0.8 + i * 3.05;
    addCard(slide, cx, 1.85, 2.85, 1.5);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 1.85, w: 2.85, h: 0.05, fill: { color: d.color },
    });
    slide.addText(d.num, {
      x: cx + 0.15, y: 2.0, w: 0.5, h: 0.3,
      fontSize: 20, fontFace: "Calibri", bold: true, color: d.color, margin: 0,
    });
    slide.addText(d.title, {
      x: cx + 0.15, y: 2.3, w: 2.55, h: 0.45,
      fontSize: 11, fontFace: "Calibri", bold: true, color: C.textPrimary, margin: 0,
    });
    slide.addText(d.desc, {
      x: cx + 0.15, y: 2.8, w: 2.55, h: 0.4,
      fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });

  // Roadmap
  addCard(slide, 0.8, 3.55, 8.4, 0.85);
  slide.addText("ROADMAP DE IMPLEMENTACION", {
    x: 1.0, y: 3.6, w: 3, h: 0.2,
    fontSize: 8, fontFace: "Calibri", bold: true, color: C.textMuted,
    charSpacing: 2, margin: 0,
  });

  const phases = [
    { label: "Piloto 500 clientes", date: "Abril 2026", color: C.blue },
    { label: "Refinamiento ML", date: "Mayo 2026", color: C.purple },
    { label: "Lanzamiento Mundial", date: "Junio 2026", color: C.gold },
    { label: "Escalamiento", date: "Ago-Dic 2026", color: C.green },
  ];

  // Timeline line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.0, y: 4.02, w: 7.8, h: 0.025,
    fill: { color: C.bgMid },
  });

  phases.forEach((p, i) => {
    const px = 1.0 + i * 2.0;
    // Dot on timeline
    slide.addShape(pres.shapes.OVAL, {
      x: px + 0.3, y: 3.92, w: 0.2, h: 0.2,
      fill: { color: p.color },
    });
    slide.addText(p.label, {
      x: px, y: 4.07, w: 1.8, h: 0.15,
      fontSize: 9, fontFace: "Calibri", bold: true, color: C.textPrimary,
      align: "center", margin: 0,
    });
    slide.addText(p.date, {
      x: px, y: 4.2, w: 1.8, h: 0.12,
      fontSize: 7, fontFace: "Calibri", color: C.textMuted,
      align: "center", margin: 0,
    });
  });

  // CTA
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 2.5, y: 4.65, w: 5, h: 0.55,
    fill: { color: C.blue, transparency: 85 },
    line: { color: C.blue, width: 1 },
  });
  slide.addText("La pregunta no es si hacerlo.\nEs cuanto engagement se pierde por cada dia que no se implementa.", {
    x: 2.5, y: 4.65, w: 5, h: 0.55,
    fontSize: 11, fontFace: "Calibri", bold: true, color: C.blue,
    align: "center", valign: "middle", margin: 0,
  });

  // Bottom gold bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.565, w: 10, h: 0.06,
    fill: { color: C.gold },
  });
})();

// ─── SAVE ───────────────────────────────────────────────────────────────────
const outputPath = __dirname + "/AI-Bank_mAiles_Presentacion.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log("Presentation created: " + outputPath);
}).catch(err => {
  console.error("Error:", err);
});
