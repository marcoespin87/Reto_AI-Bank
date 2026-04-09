"use strict";
const pptxgen = require("pptxgenjs");

// ─── PALETA ─────────────────────────────────────────────────────────────────
const C = {
  blue:    "003399",   // Azul AI-Bank principal
  purple:  "6600FF",   // Morado fondos de transición
  red:     "E6192E",   // Rojo Mundial
  lime:    "D1FF00",   // Verde lima acento
  white:   "FFFFFF",
  dark:    "1A1A1A",
  midBlue: "1A47B8",
  cardBg:  "EEF2FF",
  gray:    "555555",
  lgray:   "888888",
  border:  "CCCCCC",
  limeBg:  "F0FFB8",
  purpleLt:"F0EAFF",
};

// Shadow factories — NEVER reusar el mismo objeto (pptxgenjs muta in-place)
const sh  = () => ({ type:"outer", blur:8,  offset:2, angle:135, color:"000000", opacity:0.12 });
const shM = () => ({ type:"outer", blur:14, offset:3, angle:135, color:"000000", opacity:0.18 });

const prs = new pptxgen();
prs.layout = "LAYOUT_16x9";  // 10" × 5.625"
prs.title  = "AI-Bank — Informe Ejecutivo";
prs.author = "TCS AI-Bank Team";

// ─── HELPERS ────────────────────────────────────────────────────────────────

/** Slide divisor de sección (fondo morado) */
function divider(title, subtitle, num) {
  const s = prs.addSlide();
  s.background = { color: C.purple };
  s.addShape(prs.shapes.OVAL,
    { x:6.5, y:-2, w:7, h:7, fill:{color:C.blue,transparency:60}, line:{color:C.blue,transparency:60} });
  s.addShape(prs.shapes.OVAL,
    { x:-2, y:3.0, w:5.5, h:5.5, fill:{color:C.red,transparency:72}, line:{color:C.red,transparency:72} });
  s.addShape(prs.shapes.RECTANGLE,
    { x:0, y:5.2, w:10, h:0.425, fill:{color:C.blue}, line:{color:C.blue} });
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.5, y:1.55, w:0.13, h:2.65, fill:{color:C.lime}, line:{color:C.lime} });
  if (num) s.addText(num, { x:0.8, y:1.45, w:4, h:0.38,
    fontSize:11, bold:true, color:C.lime, fontFace:"Calibri", align:"left", margin:0 });
  s.addText(title, { x:0.8, y:1.85, w:8.5, h:1.65,
    fontSize:40, bold:true, color:C.white, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
  if (subtitle) s.addText(subtitle, { x:0.8, y:3.6, w:8, h:0.52,
    fontSize:15, color:C.lime, fontFace:"Calibri", align:"left", margin:0 });
  return s;
}

/** Slide de contenido (fondo blanco con barra lateral roja) */
function content(title) {
  const s = prs.addSlide();
  s.background = { color: C.white };
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:0.2, w:0.09, h:0.74, fill:{color:C.red}, line:{color:C.red} });
  s.addText(title, { x:0.6, y:0.2, w:9, h:0.74,
    fontSize:22, bold:true, color:C.blue, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
  s.addShape(prs.shapes.LINE,
    { x:0.38, y:5.36, w:9.24, h:0, line:{color:C.blue, width:1.5, transparency:75} });
  return s;
}

/** Tarjeta simple */
function card(s, x, y, w, h, topColor, title, body, titleSz=13, bodySz=10.5) {
  s.addShape(prs.shapes.RECTANGLE,
    { x, y, w, h, fill:{color:C.white}, line:{color:C.border,width:0.75}, shadow:sh() });
  if (topColor) s.addShape(prs.shapes.RECTANGLE,
    { x, y, w, h:0.07, fill:{color:topColor}, line:{color:topColor} });
  const ty = y + (topColor ? 0.18 : 0.12);
  if (title) s.addText(title, { x:x+0.14, y:ty, w:w-0.28, h:0.38,
    fontSize:titleSz, bold:true, color:C.dark, fontFace:"Calibri", align:"left", margin:0 });
  if (body) s.addText(body, { x:x+0.14, y:ty+0.38, w:w-0.28, h:h-(ty-y)-0.5,
    fontSize:bodySz, color:C.gray, fontFace:"Calibri", align:"left", valign:"top", margin:0 });
}

/** Caja de diagrama con etiqueta de tipo */
function diagBox(s, x, y, w, h, fillColor, label, sublabel, textColor=C.white, borderColor=null) {
  s.addShape(prs.shapes.RECTANGLE,
    { x, y, w, h, fill:{color:fillColor}, line:{color: borderColor||fillColor, width:1.5}, shadow:sh() });
  s.addText(label, { x:x+0.08, y, w:w-0.16, h: sublabel ? h*0.55 : h,
    fontSize:11, bold:true, color:textColor, fontFace:"Calibri",
    align:"center", valign:sublabel ? "bottom" : "middle", margin:0 });
  if (sublabel) s.addText(sublabel, { x:x+0.08, y:y+h*0.55, w:w-0.16, h:h*0.42,
    fontSize:9, color:textColor, fontFace:"Calibri",
    align:"center", valign:"top", margin:0 });
}

/** Flecha (línea con punta) */
function arrow(s, x1, y1, x2, y2, col=C.blue) {
  s.addShape(prs.shapes.LINE, { x:x1, y:y1, w:x2-x1, h:y2-y1,
    line:{color:col, width:1.5, endArrowType:"arrow"} });
}

/** Etiqueta sobre flecha */
function arrowLabel(s, x, y, txt, col=C.gray) {
  s.addText(txt, { x:x-0.4, y:y-0.22, w:0.8, h:0.22,
    fontSize:7.5, color:col, fontFace:"Calibri", align:"center", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 01 — PORTADA
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.background = { color: C.blue };
  // blobs decorativos
  s.addShape(prs.shapes.OVAL,
    { x:6.5, y:-2.2, w:7.5, h:7.5, fill:{color:C.purple,transparency:62}, line:{color:C.purple,transparency:62} });
  s.addShape(prs.shapes.OVAL,
    { x:-1.8, y:2.8, w:5.5, h:5.5, fill:{color:C.red,transparency:74}, line:{color:C.red,transparency:74} });
  // barra acento lima izquierda
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.52, y:1.05, w:0.14, h:3.5, fill:{color:C.lime}, line:{color:C.lime} });
  // título
  s.addText("AI-Bank", { x:0.85, y:0.95, w:9, h:1.9,
    fontSize:74, bold:true, color:C.white, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
  // subtítulo
  s.addText("Informe Ejecutivo · Arquitectura del Sistema", { x:0.85, y:2.95, w:8.5, h:0.6,
    fontSize:18, color:C.lime, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
  // línea separadora
  s.addShape(prs.shapes.LINE,
    { x:0.85, y:3.65, w:5.8, h:0, line:{color:C.white, width:1, transparency:55} });
  s.addText("Reto Tata Consultancy Services · Abril 2026", { x:0.85, y:3.8, w:8, h:0.42,
    fontSize:13, color:C.white, fontFace:"Calibri", align:"left", margin:0 });
  // badges
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.85, y:4.38, w:1.5, h:0.42, fill:{color:C.red}, line:{color:C.red} });
  s.addText("AI FIRST", { x:0.85, y:4.38, w:1.5, h:0.42,
    fontSize:11, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addShape(prs.shapes.RECTANGLE,
    { x:2.5, y:4.38, w:2.4, h:0.42, fill:{color:C.lime}, line:{color:C.lime} });
  s.addText("MUNDIAL FIFA 2026", { x:2.5, y:4.38, w:2.4, h:0.42,
    fontSize:11, bold:true, color:C.dark, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 02 — SECCIÓN: SITUACIÓN ACTUAL
// ═══════════════════════════════════════════════════════════════════════════════
divider("Situación Actual",
  "La problemática que AI-Bank viene a resolver", "01 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 03 — EL PROBLEMA BANCARIO
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("El Problema Bancario");
  const cols = [
    { color:C.red,    emoji:"⚡", title:"Desenganche Digital",
      body:"Las apps bancarias tienen alta tasa de abandono y bajo uso frecuente. Los clientes jóvenes perciben la banca como transaccional y sin diferencial de valor." },
    { color:C.purple, emoji:"🎯", title:"Lealtad sin Personalización",
      body:"Los programas de puntos asignan premios por volumen de gasto, sin considerar intereses reales. El resultado: premios irrelevantes que desincentivan la participación." },
    { color:C.blue,   emoji:"🤖", title:"IA Ausente en la Experiencia",
      body:"La IA bancaria se usa en fraude y scoring interno, pero rara vez para mejorar la experiencia del cliente en tiempo real: personalización, recomendaciones, conversaciones." },
  ];
  const W=2.9, H=3.95, gx=0.19, startX=0.42, startY=1.05;
  cols.forEach((col,i) => {
    const x = startX + i*(W+gx);
    s.addShape(prs.shapes.RECTANGLE,
      { x, y:startY, w:W, h:H, fill:{color:C.cardBg}, line:{color:col.color,width:1.5}, shadow:sh() });
    s.addShape(prs.shapes.RECTANGLE,
      { x, y:startY, w:W, h:0.08, fill:{color:col.color}, line:{color:col.color} });
    // emoji circle
    s.addShape(prs.shapes.OVAL,
      { x:x+0.18, y:startY+0.22, w:0.65, h:0.65, fill:{color:col.color,transparency:82}, line:{color:col.color,transparency:82} });
    s.addText(col.emoji, { x:x+0.18, y:startY+0.22, w:0.65, h:0.65,
      fontSize:20, align:"center", valign:"middle", margin:0 });
    s.addText(col.title, { x:x+0.15, y:startY+1.05, w:W-0.3, h:0.52,
      fontSize:13.5, bold:true, color:C.dark, fontFace:"Calibri", align:"left", margin:0 });
    s.addText(col.body, { x:x+0.15, y:startY+1.65, w:W-0.3, h:2.15,
      fontSize:11, color:C.gray, fontFace:"Calibri", align:"left", valign:"top", margin:0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 04 — SECCIÓN: OPORTUNIDAD
// ═══════════════════════════════════════════════════════════════════════════════
divider("Oportunidad",
  "El Mundial 2026 como catalizador de una nueva relación bancaria", "02 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 05 — LOS TRES EJES DE OPORTUNIDAD
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Los Tres Ejes de Oportunidad");
  const ejes = [
    { num:"01", color:C.red, title:"Gamificación", subtitle:"Motor de engagement sostenido",
      body:"Vincular las interacciones financieras (consumos, productos, antigüedad) con mecánicas de juego: pronósticos, cromos coleccionables, ligas y grupos competitivos." },
    { num:"02", color:C.purple, title:"IA Personalizada", subtitle:"Del catálogo genérico al premio ideal",
      body:"Segmentar al cliente de forma granular combinando su perfil financiero, comportamiento digital y patrones de consumo para ofrecer beneficios genuinamente relevantes." },
    { num:"03", color:C.blue, title:"Chatbot Deportivo", subtitle:"La puerta de entrada diaria",
      body:"Un agente conversacional que analiza partidos del Mundial con estadísticas en tiempo real le da al cliente un motivo concreto para abrir la app del banco todos los días." },
  ];
  const W=2.85, H=3.85, gx=0.2, startX=0.45, startY=1.1;
  ejes.forEach((e,i) => {
    const x = startX + i*(W+gx);
    s.addShape(prs.shapes.RECTANGLE,
      { x, y:startY, w:W, h:H, fill:{color:C.white}, line:{color:e.color,width:2}, shadow:sh() });
    // número grande de fondo
    s.addText(e.num, { x:x+0.08, y:startY+0.1, w:W-0.16, h:0.95,
      fontSize:52, bold:true, color:e.color, fontFace:"Calibri",
      align:"left", valign:"middle", margin:0, transparency:20 });
    // título
    s.addText(e.title, { x:x+0.15, y:startY+1.1, w:W-0.3, h:0.5,
      fontSize:16, bold:true, color:e.color, fontFace:"Calibri", align:"left", margin:0 });
    // subtítulo
    s.addText(e.subtitle, { x:x+0.15, y:startY+1.62, w:W-0.3, h:0.38,
      fontSize:10.5, bold:true, color:C.lgray, fontFace:"Calibri", align:"left", margin:0 });
    // línea separadora
    s.addShape(prs.shapes.LINE,
      { x:x+0.15, y:startY+2.05, w:W-0.3, h:0, line:{color:e.color,width:1,transparency:60} });
    // body
    s.addText(e.body, { x:x+0.15, y:startY+2.15, w:W-0.3, h:1.55,
      fontSize:10.5, color:C.gray, fontFace:"Calibri", align:"left", valign:"top", margin:0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 06 — VISIÓN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = prs.addSlide();
  s.background = { color: C.blue };
  s.addShape(prs.shapes.OVAL,
    { x:7, y:-1.5, w:6, h:6, fill:{color:C.purple,transparency:65}, line:{color:C.purple,transparency:65} });
  s.addShape(prs.shapes.OVAL,
    { x:-1.5, y:3.5, w:5, h:5, fill:{color:C.red,transparency:75}, line:{color:C.red,transparency:75} });
  s.addShape(prs.shapes.RECTANGLE,
    { x:0, y:5.2, w:10, h:0.425, fill:{color:C.purple}, line:{color:C.purple} });
  // Etiqueta
  s.addText("03 — VISIÓN", { x:0.6, y:0.4, w:4, h:0.38,
    fontSize:11, bold:true, color:C.lime, fontFace:"Calibri", align:"left", margin:0 });
  // Comilla decorativa
  s.addText("\u201C", { x:0.4, y:0.7, w:1.5, h:1.2,
    fontSize:90, bold:true, color:C.lime, fontFace:"Calibri", align:"left", valign:"middle",
    transparency:20, margin:0 });
  // Texto principal
  s.addText(
    "Construir la primera plataforma bancaria AI-First que utilice el Mundial de Fútbol " +
    "como catalizador de engagement, transformando la relación financiera en una experiencia " +
    "inteligente, personalizada y emocionalmente significativa.",
    { x:0.6, y:1.05, w:8.8, h:3.0, fontSize:22, bold:true, color:C.white, fontFace:"Calibri",
      align:"left", valign:"middle", margin:0 });
  // Bottom line
  s.addText("Ir más allá de la transacción — acompañar al cliente en los momentos que le importan.", {
    x:0.6, y:4.25, w:8.8, h:0.6, fontSize:14, color:C.lime, fontFace:"Calibri",
    align:"left", valign:"middle", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 07 — EXPECTATIVAS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Expectativas respecto a la Solución");
  const items = [
    { color:C.blue,   title:"Engagement",          body:"Mayor frecuencia de apertura de la app impulsada por el chatbot y los pronósticos diarios del Mundial." },
    { color:C.purple, title:"Fidelización",         body:"Participación sostenida en ligas Bronce → Plata → Oro → Diamante, incentivada por gamificación de consumos." },
    { color:C.red,    title:"Relevancia de Premios",body:"Mejora percibida en la pertinencia de los premios gracias a la segmentación por IA frente a catálogos genéricos." },
    { color:C.blue,   title:"Adopción de Productos",body:"Aumento en uso de crédito, ahorro y tarjeta vinculado al sistema de puntos y ligas de fidelidad." },
    { color:C.purple, title:"Datos del Cliente",    body:"Enriquecimiento del perfil con patrones de predicción, intereses deportivos y actividad social dentro de la plataforma." },
    { color:C.red,    title:"Diferenciación",       body:"Posicionamiento del banco como referente en IA para la experiencia del cliente en la región LATAM." },
  ];
  const W=2.95, H=1.72, gx=0.15, gy=0.18, startX=0.42, startY=1.08;
  items.forEach((it,i) => {
    const col = i%3, row = Math.floor(i/3);
    const x = startX + col*(W+gx), y = startY + row*(H+gy);
    s.addShape(prs.shapes.RECTANGLE,
      { x, y, w:W, h:H, fill:{color:C.cardBg}, line:{color:it.color,width:1.2}, shadow:sh() });
    s.addShape(prs.shapes.RECTANGLE,
      { x, y, w:0.06, h:H, fill:{color:it.color}, line:{color:it.color} });
    s.addText(it.title, { x:x+0.18, y:y+0.12, w:W-0.3, h:0.36,
      fontSize:13, bold:true, color:it.color, fontFace:"Calibri", align:"left", margin:0 });
    s.addText(it.body, { x:x+0.18, y:y+0.52, w:W-0.3, h:1.1,
      fontSize:10.5, color:C.gray, fontFace:"Calibri", align:"left", valign:"top", margin:0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 08 — SECCIÓN: FUNCIONALIDADES IA FIRST
// ═══════════════════════════════════════════════════════════════════════════════
divider("Funcionalidades con\nIA First",
  "Cómo la IA está en cada flujo principal de la aplicación", "04 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 09 — CHATBOT DEPORTIVO MULTI-AGENTE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Chatbot Deportivo — Sistema Multi-Agente");
  // Descripción intro
  s.addText("Pipeline de 3 agentes IA en cascada. El usuario recibe análisis estadístico balanceado sin predicción de ganador, preservando la mecánica de apuestas con mAiles.",
    { x:0.42, y:1.0, w:9.2, h:0.48, fontSize:11, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // --- Cajas de agentes ---
  // Input usuario
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:1.65, w:1.55, h:0.85, fill:{color:C.limeBg}, line:{color:C.lime,width:2}, shadow:sh() });
  s.addText("Usuario\n\"Argentina\nvs Francia\"",
    { x:0.38, y:1.65, w:1.55, h:0.85, fontSize:9.5, bold:true, color:C.dark,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });

  // Flecha 1
  arrow(s, 1.95, 2.07, 2.35, 2.07, C.blue);
  arrowLabel(s, 2.15, 2.07, "query", C.lgray);

  // Agente Orquestador
  s.addShape(prs.shapes.RECTANGLE,
    { x:2.35, y:1.52, w:2.05, h:1.12, fill:{color:C.blue}, line:{color:C.blue}, shadow:sh() });
  s.addText("🤖 Orquestador", { x:2.35, y:1.52, w:2.05, h:0.42,
    fontSize:10.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("Valida consulta\nFiltro de dominio\nCoordina pipeline",
    { x:2.35, y:1.94, w:2.05, h:0.68, fontSize:9, color:"AACCFF",
      fontFace:"Calibri", align:"center", valign:"top", margin:0 });

  // Flecha 2
  arrow(s, 4.42, 2.07, 4.82, 2.07, C.blue);
  arrowLabel(s, 4.62, 2.07, "delega", C.lgray);

  // Agente Analista
  s.addShape(prs.shapes.RECTANGLE,
    { x:4.82, y:1.52, w:2.05, h:1.12, fill:{color:C.midBlue}, line:{color:C.midBlue}, shadow:sh() });
  s.addText("🔍 Analista", { x:4.82, y:1.52, w:2.05, h:0.42,
    fontSize:10.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("6 búsquedas Tavily\nen paralelo\nJSON con stats",
    { x:4.82, y:1.94, w:2.05, h:0.68, fontSize:9, color:"AACCFF",
      fontFace:"Calibri", align:"center", valign:"top", margin:0 });

  // Flecha 3
  arrow(s, 6.89, 2.07, 7.29, 2.07, C.blue);
  arrowLabel(s, 7.09, 2.07, "JSON", C.lgray);

  // Agente Censor
  s.addShape(prs.shapes.RECTANGLE,
    { x:7.29, y:1.52, w:2.05, h:1.12, fill:{color:C.red}, line:{color:C.red}, shadow:sh() });
  s.addText("🛡️ Censor", { x:7.29, y:1.52, w:2.05, h:0.42,
    fontSize:10.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("Filtra ganador\nFormato Markdown\nTono neutro",
    { x:7.29, y:1.94, w:2.05, h:0.68, fontSize:9, color:"FFCCCC",
      fontFace:"Calibri", align:"center", valign:"top", margin:0 });

  // Flecha a Tavily (del Analista hacia abajo)
  arrow(s, 5.84, 2.65, 5.84, 3.1, C.lgray);
  s.addShape(prs.shapes.RECTANGLE,
    { x:4.72, y:3.1, w:2.25, h:0.62, fill:{color:C.purpleLt}, line:{color:C.purple,width:1}, shadow:sh() });
  s.addText("Tavily Search API\n(dominios deportivos)", { x:4.72, y:3.1, w:2.25, h:0.62,
    fontSize:9, color:C.purple, fontFace:"Calibri", align:"center", valign:"middle", margin:0, bold:true });

  // Gemini badge (bajo los 3 agentes)
  s.addShape(prs.shapes.RECTANGLE,
    { x:2.35, y:3.1, w:2.05, h:0.62, fill:{color:C.limeBg}, line:{color:C.lime,width:1.5}, shadow:sh() });
  s.addText("⚡ Gemini 2.5 Flash\nMotor LLM de los 3 agentes",
    { x:2.35, y:3.1, w:2.05, h:0.62, fontSize:9, bold:true, color:C.dark,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });

  // Output final
  s.addShape(prs.shapes.RECTANGLE,
    { x:7.29, y:3.1, w:2.05, h:0.62, fill:{color:C.lime}, line:{color:C.lime}, shadow:sh() });
  s.addText("## Análisis Markdown\n(sin predicción de ganador)",
    { x:7.29, y:3.1, w:2.05, h:0.62, fontSize:9, bold:true, color:C.dark,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });

  // Nota de control
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:3.9, w:9.22, h:0.95, fill:{color:C.cardBg}, line:{color:C.border,width:0.5} });
  const controles = [
    { icon:"1", text:"Orquestador rechaza consultas fuera del dominio FIFA" },
    { icon:"2", text:"Tavily restringido a dominios deportivos verificados (SofaScore, FIFA.com, Transfermarkt...)" },
    { icon:"3", text:"Censor elimina ganador_proyectado del JSON antes de responder al usuario" },
  ];
  s.addText("Capas de control:", { x:0.55, y:3.96, w:1.6, h:0.3,
    fontSize:9.5, bold:true, color:C.blue, fontFace:"Calibri", align:"left", margin:0 });
  controles.forEach((c,i) => {
    s.addText(`${c.icon}.  ${c.text}`, { x:0.55, y:4.28+i*0.18, w:9, h:0.2,
      fontSize:9, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10 — SEGMENTACIÓN INTELIGENTE DE PREMIOS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Segmentación Inteligente de Premios");
  // Columna izquierda: info del modelo
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:1.05, w:3.6, h:4.2, fill:{color:C.cardBg}, line:{color:C.blue,width:1}, shadow:sh() });
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:1.05, w:3.6, h:0.07, fill:{color:C.blue}, line:{color:C.blue} });

  s.addText("Modelo ML", { x:0.52, y:1.14, w:3.3, h:0.38,
    fontSize:14, bold:true, color:C.blue, fontFace:"Calibri", align:"left", margin:0 });
  s.addText("Logistic Regression\nF1-macro: 0.79 · Accuracy: 0.79\nEntrenado con 30.000 perfiles sintéticos\ngenerados con IA",
    { x:0.52, y:1.55, w:3.3, h:1.0, fontSize:10.5, color:C.gray,
      fontFace:"Calibri", align:"left", valign:"top", margin:0 });

  s.addShape(prs.shapes.LINE,
    { x:0.52, y:2.62, w:3.3, h:0, line:{color:C.border,width:0.5} });

  s.addText("49 features de entrada", { x:0.52, y:2.7, w:3.3, h:0.32,
    fontSize:11.5, bold:true, color:C.dark, fontFace:"Calibri", align:"left", margin:0 });
  const feats = ["Perfil financiero (gasto, score, productos)", "Porcentaje de gasto por categoría",
    "Métricas de gamificación (mAiles, cromos)", "Comportamiento social (grupos, votos)",
    "Datos demográficos (edad, ciudad)", "Hábitos digitales (app, sesiones)"];
  feats.forEach((f,i) => {
    s.addText("→  " + f, { x:0.52, y:3.05+i*0.32, w:3.3, h:0.3,
      fontSize:10, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });
  });

  // Columna derecha: 9 categorías en grid
  s.addText("9 Categorías de Premio", { x:4.2, y:1.05, w:5.5, h:0.38,
    fontSize:13, bold:true, color:C.dark, fontFace:"Calibri", align:"left", margin:0 });
  const cats = [
    { label:"Tecnología",        col:C.blue   },
    { label:"Viajes Nacionales", col:C.purple },
    { label:"Viajes Internac.",  col:C.red    },
    { label:"Gastronomía",       col:C.blue   },
    { label:"Entretenimiento",   col:C.purple },
    { label:"Salud & Bienestar", col:C.red    },
    { label:"Educación",         col:C.blue   },
    { label:"Hogar & Lifestyle", col:C.purple },
    { label:"Premium Financiero",col:C.red    },
  ];
  const bW=1.62, bH=0.78, bgx=0.1, bgy=0.12, bx0=4.2, by0=1.5;
  cats.forEach((c,i) => {
    const col=i%3, row=Math.floor(i/3);
    const bx = bx0 + col*(bW+bgx);
    const by = by0 + row*(bH+bgy);
    s.addShape(prs.shapes.RECTANGLE,
      { x:bx, y:by, w:bW, h:bH, fill:{color:c.col}, line:{color:c.col}, shadow:sh() });
    s.addText(c.label, { x:bx+0.06, y:by, w:bW-0.12, h:bH,
      fontSize:10.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  });

  // Footer: motor de reglas
  s.addShape(prs.shapes.RECTANGLE,
    { x:4.2, y:4.9, w:5.42, h:0.34, fill:{color:C.limeBg}, line:{color:C.lime,width:1.2} });
  s.addText("Motor de reglas: 40 premios puntuados 0–100 con justificación explicable al usuario",
    { x:4.2, y:4.9, w:5.42, h:0.34, fontSize:9.5, color:C.dark, fontFace:"Calibri",
      align:"center", valign:"middle", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11 — mAILES, ÁLBUM Y GRUPOS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("mAiles, Álbum de Cromos y Grupos");
  const feats = [
    { color:C.red,    emoji:"🏆", title:"Sistema de mAiles",
      sub:"Moneda interna de la plataforma",
      body:"El usuario apuesta mAiles en pronósticos. Aciertos correctos generan más mAiles, avanzan de liga y contribuyen a las métricas que alimentan el modelo de segmentación de premios." },
    { color:C.purple, emoji:"🎴", title:"Álbum de Cromos",
      sub:"Coleccionismo vinculado al engagement",
      body:"Los cromos (común, raro, épico) se distribuyen según actividad, pronósticos acertados y objetivos completados. La rareza refleja la intensidad del engagement del usuario con la plataforma." },
    { color:C.blue,   emoji:"👥", title:"Grupos de Predicción",
      sub:"Competencia y socialización",
      body:"Los usuarios forman grupos para competir colectivamente. El rol (creador/miembro), votos y actividad grupal enriquecen el perfil del usuario y mejoran su segmentación de premios futura." },
  ];
  const W=2.88, H=3.85, gx=0.19, sx=0.42, sy=1.1;
  feats.forEach((f,i) => {
    const x = sx + i*(W+gx);
    s.addShape(prs.shapes.RECTANGLE,
      { x, y:sy, w:W, h:H, fill:{color:C.white}, line:{color:f.color,width:1.8}, shadow:sh() });
    s.addShape(prs.shapes.RECTANGLE,
      { x, y:sy, w:W, h:0.08, fill:{color:f.color}, line:{color:f.color} });
    s.addShape(prs.shapes.OVAL,
      { x:x+0.18, y:sy+0.2, w:0.68, h:0.68, fill:{color:f.color,transparency:80}, line:{color:f.color,transparency:80} });
    s.addText(f.emoji, { x:x+0.18, y:sy+0.2, w:0.68, h:0.68,
      fontSize:22, align:"center", valign:"middle", margin:0 });
    s.addText(f.title, { x:x+0.15, y:sy+1.05, w:W-0.3, h:0.48,
      fontSize:14, bold:true, color:f.color, fontFace:"Calibri", align:"left", margin:0 });
    s.addText(f.sub, { x:x+0.15, y:sy+1.55, w:W-0.3, h:0.32,
      fontSize:9.5, color:C.lgray, fontFace:"Calibri", align:"left", margin:0, bold:true });
    s.addShape(prs.shapes.LINE,
      { x:x+0.15, y:sy+1.9, w:W-0.3, h:0, line:{color:f.color,width:0.75,transparency:55} });
    s.addText(f.body, { x:x+0.15, y:sy+2.0, w:W-0.3, h:1.7,
      fontSize:10.5, color:C.gray, fontFace:"Calibri", align:"left", valign:"top", margin:0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12 — SECCIÓN: CONEXIÓN CON LA PROBLEMÁTICA
// ═══════════════════════════════════════════════════════════════════════════════
divider("Conexión con la\nProblemática",
  "De cada funcionalidad a un problema concreto resuelto", "05 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 13 — FUNCIONALIDAD → IMPACTO
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Funcionalidad → Problema Resuelto → Indicador");
  const rows = [
    { func:"Chatbot deportivo", prob:"Falta de motivos para abrir la app a diario", kpi:"Frecuencia de apertura diaria" },
    { func:"Segmentación con IA", prob:"Programas de lealtad genéricos e irrelevantes", kpi:"Tasa de canje del premio; satisfacción" },
    { func:"mAiles y pronósticos", prob:"Baja participación activa en productos bancarios", kpi:"Volumen de transacciones vinculadas" },
    { func:"Ligas de fidelidad", prob:"Sin sentido de progresión en la relación con el banco", kpi:"Tasa de subida de liga; permanencia" },
    { func:"Álbum de cromos", prob:"Alto abandono de la app tras el onboarding", kpi:"Retención semanal durante la temporada" },
    { func:"Grupos de predicción", prob:"Experiencia bancaria percibida como individual", kpi:"Usuarios activos en grupos; referidos" },
  ];
  // Header
  const hdrs = ["Funcionalidad", "Problema que Resuelve", "Indicador de Impacto"];
  const colXs = [0.38, 3.3, 7.0];
  const colWs = [2.7, 3.45, 2.7];
  hdrs.forEach((h,i) => {
    s.addShape(prs.shapes.RECTANGLE,
      { x:colXs[i], y:1.05, w:colWs[i], h:0.42, fill:{color:C.blue}, line:{color:C.blue} });
    s.addText(h, { x:colXs[i]+0.1, y:1.05, w:colWs[i]-0.2, h:0.42,
      fontSize:11, bold:true, color:C.white, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
  });
  rows.forEach((r,i) => {
    const y = 1.52 + i*0.62;
    const bg = i%2===0 ? C.cardBg : C.white;
    colXs.forEach((x,j) => {
      s.addShape(prs.shapes.RECTANGLE,
        { x, y, w:colWs[j], h:0.58, fill:{color:bg}, line:{color:C.border,width:0.5} });
    });
    const vals = [r.func, r.prob, r.kpi];
    const colors = [C.blue, C.dark, C.purple];
    vals.forEach((v,j) => {
      s.addText(v, { x:colXs[j]+0.1, y:y+0.04, w:colWs[j]-0.2, h:0.5,
        fontSize:10, color:colors[j], fontFace:"Calibri", align:"left", valign:"middle",
        bold:j===0, margin:0 });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14 — SECCIÓN: DISEÑO TÉCNICO
// ═══════════════════════════════════════════════════════════════════════════════
divider("Diseño Técnico",
  "Arquitectura de 3 capas · Contexto · Contenedores", "06 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 15 — ARQUITECTURA DE 3 CAPAS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Diseño Técnico — Arquitectura de 3 Capas");
  const layers = [
    { color:C.blue,   label:"CAPA DE PRESENTACIÓN",
      sub:"React Native · Expo · TypeScript",
      desc:"App cross-platform (iOS, Android, Web). Gestiona autenticación, pronósticos, álbum, banca y premios. Consume los dos microservicios de IA y Supabase.",
      items:["Expo Router (file-based)", "NativeWind (Tailwind RN)", "Supabase Auth + SecureStore"] },
    { color:C.purple, label:"CAPA DE SERVICIOS",
      sub:"Dos microservicios FastAPI independientes",
      desc:"Encapsulan la lógica de IA y ML. Pueden escalar, actualizarse o reemplazarse sin afectar la app ni la base de datos.",
      items:["Agente Deportivo: LangGraph + Gemini  (Puerto 8001)", "Segmentación: Scikit-learn + Reglas (Puerto 8000)"] },
    { color:C.red,    label:"CAPA DE DATOS",
      sub:"PostgreSQL · Supabase",
      desc:"Fuente de verdad del sistema. Auth JWT + Row Level Security. WebSockets para actualizaciones en tiempo real de mAiles, cromos y pronósticos.",
      items:["10+ tablas relacionales", "Realtime Supabase (WebSockets)", "Storage para activos (cromos)"] },
  ];
  const H=1.35, gy=0.18, startY=1.08;
  layers.forEach((l,i) => {
    const y = startY + i*(H+gy);
    s.addShape(prs.shapes.RECTANGLE,
      { x:0.38, y, w:9.22, h:H, fill:{color:C.cardBg}, line:{color:l.color,width:2}, shadow:sh() });
    s.addShape(prs.shapes.RECTANGLE,
      { x:0.38, y, w:0.1, h:H, fill:{color:l.color}, line:{color:l.color} });
    // Label
    s.addText(l.label, { x:0.65, y:y+0.1, w:3.2, h:0.35,
      fontSize:12, bold:true, color:l.color, fontFace:"Calibri", align:"left", margin:0 });
    s.addText(l.sub, { x:0.65, y:y+0.47, w:3.2, h:0.26,
      fontSize:9.5, color:C.lgray, fontFace:"Calibri", align:"left", margin:0, bold:true });
    s.addShape(prs.shapes.LINE,
      { x:3.9, y:y+0.18, w:0, h:H-0.35, line:{color:l.color,width:0.5,transparency:50} });
    s.addText(l.desc, { x:4.05, y:y+0.1, w:3.55, h:1.18,
      fontSize:10, color:C.gray, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
    s.addShape(prs.shapes.LINE,
      { x:7.65, y:y+0.18, w:0, h:H-0.35, line:{color:l.color,width:0.5,transparency:50} });
    l.items.forEach((it,j) => {
      s.addText("• " + it, { x:7.78, y:y+0.12+j*0.34, w:1.72, h:0.32,
        fontSize:9, color:l.color, fontFace:"Calibri", align:"left", margin:0, bold:true });
    });
  });
  // Principios
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:4.9, w:9.22, h:0.34, fill:{color:C.limeBg}, line:{color:C.lime,width:1.2} });
  s.addText("Principios: Desacoplamiento · API-first · IA como servicio · Datos centralizados",
    { x:0.38, y:4.9, w:9.22, h:0.34, fontSize:10, bold:true, color:C.dark,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16 — DIAGRAMA DE CONTEXTO (C4-L1)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Diagrama de Contexto — C4 Nivel 1");
  s.addText("Vista lógica de alto nivel. AI-Bank como sistema único y sus dependencias externas.",
    { x:0.42, y:1.0, w:9.2, h:0.38, fontSize:11, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // Cliente (izquierda)
  s.addShape(prs.shapes.OVAL,
    { x:0.38, y:1.58, w:1.5, h:1.05, fill:{color:C.blue,transparency:15}, line:{color:C.blue,width:2}, shadow:sh() });
  s.addText("👤 Cliente\nBancario", { x:0.38, y:1.58, w:1.5, h:1.05,
    fontSize:10.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("[Person]", { x:0.38, y:2.65, w:1.5, h:0.28,
    fontSize:8.5, color:C.lgray, fontFace:"Calibri", align:"center", margin:0 });

  // Flecha → plataforma
  arrow(s, 1.9, 2.1, 2.85, 2.1, C.blue);
  s.addText("Usa la app", { x:1.95, y:1.85, w:0.9, h:0.22,
    fontSize:8, color:C.lgray, fontFace:"Calibri", align:"center", margin:0 });

  // AI-Bank Platform (centro)
  s.addShape(prs.shapes.RECTANGLE,
    { x:2.85, y:1.35, w:3.4, h:1.62, fill:{color:C.blue}, line:{color:C.blue}, shadow:shM() });
  s.addText("AI-Bank", { x:2.85, y:1.35, w:3.4, h:0.65,
    fontSize:20, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"bottom", margin:0 });
  s.addText("[Software System]", { x:2.85, y:2.0, w:3.4, h:0.3,
    fontSize:8.5, color:"AACCFF", fontFace:"Calibri", align:"center", margin:0 });
  s.addText("App móvil + Agente IA + Segmentación ML",
    { x:2.85, y:2.3, w:3.4, h:0.55, fontSize:9.5, color:C.white,
      fontFace:"Calibri", align:"center", valign:"top", margin:0 });

  // Flechas → externos
  arrow(s, 6.27, 1.7, 7.05, 1.7, C.lgray);
  arrow(s, 6.27, 2.15, 7.05, 2.5, C.lgray);
  arrow(s, 6.27, 2.6, 7.05, 3.3, C.lgray);

  // Externos
  const exts = [
    { x:7.05, y:1.35, label:"Google Gemini\n2.5 Flash", sub:"[External System]\nMotor LLM", col:C.purple },
    { x:7.05, y:2.35, label:"Tavily\nSearch API",       sub:"[External System]\nBúsqueda deportiva", col:C.red },
    { x:7.05, y:3.35, label:"Supabase",                 sub:"[External System]\nDB + Auth + Storage", col:"1A7A4A" },
  ];
  exts.forEach(e => {
    s.addShape(prs.shapes.RECTANGLE,
      { x:e.x, y:e.y, w:2.5, h:0.88, fill:{color:e.col,transparency:15}, line:{color:e.col,width:1.5}, shadow:sh() });
    s.addText(e.label, { x:e.x+0.1, y:e.y, w:2.3, h:0.55,
      fontSize:10.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(e.sub, { x:e.x+0.1, y:e.y+0.55, w:2.3, h:0.3,
      fontSize:8, color:"DDDDDD", fontFace:"Calibri", align:"center", margin:0 });
  });

  // Leyenda
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:4.58, w:9.22, h:0.65, fill:{color:C.cardBg}, line:{color:C.border,width:0.5} });
  [
    { col:C.blue,    lbl:"Sistema AI-Bank (in scope)" },
    { col:C.purple,  lbl:"Sistema externo (IA)" },
    { col:C.red,     lbl:"Sistema externo (Búsqueda)" },
    { col:"1A7A4A",  lbl:"Sistema externo (Datos)" },
  ].forEach((l,i) => {
    const lx = 0.6 + i*2.35;
    s.addShape(prs.shapes.RECTANGLE,
      { x:lx, y:4.74, w:0.22, h:0.22, fill:{color:l.col}, line:{color:l.col} });
    s.addText(l.lbl, { x:lx+0.28, y:4.72, w:2.0, h:0.26,
      fontSize:9, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 17 — DIAGRAMA DE CONTENEDORES (C4-L2)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Diagrama de Contenedores — C4 Nivel 2");
  s.addText("Descomposición interna de AI-Bank en sus cuatro contenedores desplegables independientemente.",
    { x:0.42, y:1.0, w:9.2, h:0.38, fontSize:11, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // Boundary de la plataforma (dashed border)
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:1.5, w:6.9, h:3.65, fill:{color:C.cardBg}, line:{color:C.blue,width:1.5,dashType:"dash"} });
  s.addText("Plataforma AI-Bank", { x:0.45, y:1.52, w:2.5, h:0.28,
    fontSize:8.5, bold:true, color:C.blue, fontFace:"Calibri", align:"left", margin:0 });

  // App móvil
  diagBox(s, 0.55, 1.85, 1.82, 2.98, C.blue,
    "📱 AI-Bank App",
    "React Native · Expo\nTypeScript\n\nAuth · Pronósticos\nÁlbum · Banco\nPremios");

  // Agente Deportivo
  diagBox(s, 2.6, 1.85, 2.28, 1.3, C.midBlue,
    "🤖 Agente Deportivo",
    "Python · FastAPI\nLangGraph · Gemini");

  // Segmentación
  diagBox(s, 2.6, 3.35, 2.28, 1.48, C.purple,
    "📊 Segmentación",
    "Python · FastAPI\nScikit-learn · Reglas");

  // Base de datos
  diagBox(s, 5.1, 1.85, 1.95, 2.98, "1A7A4A",
    "🗄️ Base de Datos",
    "PostgreSQL\nSupabase\n\nAuth JWT\nRealtime WS\nStorage");

  // Flechas internas
  arrow(s, 2.38, 2.4, 2.6, 2.4, C.white);
  arrow(s, 2.38, 3.1, 2.6, 3.7, C.white);
  arrow(s, 2.38, 2.75, 5.1, 2.75, C.white);

  // Externos (fuera del boundary)
  diagBox(s, 7.5, 1.85, 2.12, 1.0, C.purple,
    "⚡ Gemini 2.5 Flash",
    "[External]\nMotor LLM", C.white);
  diagBox(s, 7.5, 3.05, 2.12, 1.0, C.red,
    "🔍 Tavily Search",
    "[External]\nBúsqueda web", C.white);

  // Flechas hacia externos
  arrow(s, 4.88, 2.22, 7.5, 2.22, C.lgray);
  arrow(s, 4.88, 2.9, 7.5, 3.5, C.lgray);

  s.addText("REST / JSON", { x:5.9, y:2.0, w:1.5, h:0.2, fontSize:8, color:C.lgray, fontFace:"Calibri", align:"center", margin:0 });
  s.addText("REST / JSON", { x:5.8, y:3.55, w:1.5, h:0.2, fontSize:8, color:C.lgray, fontFace:"Calibri", align:"center", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 18 — DIAGRAMA DE DESPLIEGUE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Diagrama de Despliegue — Infraestructura Cloud");
  s.addText("Tres microservicios FastAPI/Python en Render · App móvil APK (Android) · BaaS Supabase · LLM Google Gemini",
    { x:0.42, y:1.0, w:9.2, h:0.3, fontSize:10, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // ── APK (left column) ──
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.22, y:1.42, w:1.62, h:3.32, fill:{color:C.blue}, line:{color:C.blue}, shadow:shM() });
  s.addText("📱", { x:0.22, y:1.55, w:1.62, h:0.52, fontSize:22, align:"center", valign:"middle", margin:0 });
  s.addText("AI-Bank\nApp", { x:0.22, y:2.1, w:1.62, h:0.52, fontSize:12, bold:true, color:C.white,
    fontFace:"Calibri", align:"center", margin:0 });
  s.addText("React Native · Expo\nDistribuida como APK\n(Android)", { x:0.22, y:2.65, w:1.62, h:0.66,
    fontSize:8.5, color:"AACCFF", fontFace:"Calibri", align:"center", margin:0 });

  // ── Render boundary (center) ──
  s.addShape(prs.shapes.RECTANGLE,
    { x:2.05, y:1.1, w:4.52, h:3.72, fill:{color:"F0F4FF"}, line:{color:C.midBlue,width:1.5,dashType:"dash"} });
  s.addText("☁️  Render — Cloud Platform", { x:2.1, y:1.12, w:4.35, h:0.26,
    fontSize:8.5, bold:true, color:C.midBlue, fontFace:"Calibri", align:"left", margin:0 });

  const svcs18 = [
    { label:"🤖 Agente Deportivo", sub:"Python · FastAPI · LangGraph", ep:"POST /chat  ·  GET /health", col:C.midBlue, sy:1.48 },
    { label:"📊 Segmentación", sub:"Python · FastAPI · Scikit-learn", ep:"POST /segmentar  ·  GET /health", col:C.purple, sy:2.58 },
    { label:"⚡ Matchmaking", sub:"Python · FastAPI", ep:"POST /matchmaking/asignar  ·  GET /health", col:C.red, sy:3.68 },
  ];
  const svcH18 = 0.88;
  svcs18.forEach(svc => {
    const my = svc.sy + svcH18 / 2;
    s.addShape(prs.shapes.RECTANGLE,
      { x:2.2, y:svc.sy, w:4.22, h:svcH18, fill:{color:svc.col}, line:{color:svc.col}, shadow:sh() });
    s.addText(svc.label, { x:2.3, y:svc.sy+0.06, w:3.98, h:0.3, fontSize:10.5, bold:true,
      color:C.white, fontFace:"Calibri", align:"left", margin:0 });
    s.addText(svc.sub, { x:2.3, y:svc.sy+0.36, w:2.8, h:0.22, fontSize:8.5,
      color:"CCDDFF", fontFace:"Calibri", align:"left", margin:0 });
    s.addText(svc.ep, { x:2.3, y:svc.sy+0.62, w:3.98, h:0.2, fontSize:8, bold:true,
      color:C.lime, fontFace:"Calibri", align:"left", margin:0 });
    arrow(s, 1.85, my, 2.2, my, C.white);
  });

  // ── External services (right column) ──
  const exts18 = [
    { label:"🗄️ Supabase", sub:"PostgreSQL · Auth JWT\nRealtime WS · Storage", col:"1A7A4A", ey:1.42, eh:1.05 },
    { label:"⚡ Google Gemini\n2.5 Flash", sub:"Motor LLM · REST API", col:C.purple, ey:2.62, eh:0.9 },
    { label:"🔍 Tavily\nSearch API", sub:"Búsqueda web · 6 calls/consulta", col:C.red, ey:3.66, eh:0.9 },
  ];
  exts18.forEach(ext => {
    s.addShape(prs.shapes.RECTANGLE,
      { x:6.77, y:ext.ey, w:2.83, h:ext.eh, fill:{color:ext.col}, line:{color:ext.col}, shadow:sh() });
    s.addText(ext.label, { x:6.87, y:ext.ey+0.06, w:2.6, h:0.42, fontSize:10, bold:true,
      color:C.white, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
    s.addText(ext.sub, { x:6.87, y:ext.ey+0.5, w:2.6, h:0.48, fontSize:8.5,
      color:"DDEEBB", fontFace:"Calibri", align:"left", margin:0 });
  });

  // App ↔ Supabase
  arrow(s, 1.85, 3.07, 6.77, 1.95, "1A7A4A");
  s.addText("SDK / REST / WS", { x:3.6, y:2.2, w:2.0, h:0.22, fontSize:8, color:"1A7A4A",
    fontFace:"Calibri", align:"center", margin:0 });
  // Agente → Gemini + Tavily
  arrow(s, 6.42, 1.92, 6.77, 3.07, C.purple);
  arrow(s, 6.42, 1.92, 6.77, 4.11, C.red);
  s.addText("google_genai", { x:5.2, y:2.55, w:1.3, h:0.22, fontSize:7.5, color:C.purple,
    fontFace:"Calibri", align:"center", margin:0 });
  s.addText("langchain-tavily", { x:5.0, y:3.2, w:1.4, h:0.22, fontSize:7.5, color:C.red,
    fontFace:"Calibri", align:"center", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 19 — SECCIÓN: COMPONENTES C4 NIVEL 3
// ═══════════════════════════════════════════════════════════════════════════════
divider("Componentes\n[C4 Nivel 3]",
  "Desglose interno de los tres microservicios de IA", "06B —");

// ═══════════════════════════════════════════════════════════════════════════════
// 20 — C4 L3: AGENTE DEPORTIVO
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Agente Deportivo — Componentes [C4 Nivel 3]");
  s.addText("Pipeline multi-agente: Orquestador → Analista (6 tools Tavily en paralelo) → Censor. Memoria conversacional por thread_id.",
    { x:0.42, y:1.0, w:9.2, h:0.3, fontSize:9.5, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // External App (left)
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.22, y:2.22, w:1.45, h:0.78, fill:{color:C.blue}, line:{color:C.blue}, shadow:sh() });
  s.addText("📱 AI-Bank App", { x:0.22, y:2.22, w:1.45, h:0.4, fontSize:9, bold:true,
    color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("[External]", { x:0.22, y:2.6, w:1.45, h:0.3, fontSize:7.5,
    color:"AACCFF", fontFace:"Calibri", align:"center", margin:0 });

  // Service boundary
  s.addShape(prs.shapes.RECTANGLE,
    { x:1.78, y:1.35, w:5.82, h:3.78, fill:{color:"F0F4FF"}, line:{color:C.midBlue,width:1.5,dashType:"dash"} });
  s.addText("Agente Deportivo — FastAPI / LangGraph", { x:1.83, y:1.38, w:5.6, h:0.26,
    fontSize:8.5, bold:true, color:C.midBlue, fontFace:"Calibri", align:"left", margin:0 });

  // 4 pipeline components
  const ac20 = [
    { label:"API Router", sub:"FastAPI · Pydantic\nPOST /chat\nGET /health", col:C.midBlue },
    { label:"Orquestador", sub:"LangGraph\nGemini 2.5 Flash\nValida dominio", col:C.blue },
    { label:"Analista", sub:"LangGraph\nGemini 2.5 Flash\n6 tools Tavily ∥", col:C.purple },
    { label:"Censor", sub:"LangGraph\nGemini 2.5 Flash\nFiltro Markdown\nneutro", col:C.red },
  ];
  const acW=1.24, acH=1.52, acGap=0.08, acx0=1.92, acy=1.68;
  ac20.forEach((c,i) => {
    const cx = acx0 + i*(acW+acGap);
    s.addShape(prs.shapes.RECTANGLE,
      { x:cx, y:acy, w:acW, h:acH, fill:{color:c.col}, line:{color:c.col}, shadow:sh() });
    s.addText(c.label, { x:cx+0.05, y:acy+0.08, w:acW-0.1, h:0.36, fontSize:10, bold:true,
      color:C.white, fontFace:"Calibri", align:"center", margin:0 });
    s.addShape(prs.shapes.LINE,
      { x:cx+0.07, y:acy+0.48, w:acW-0.14, h:0, line:{color:C.white,width:0.5,transparency:55} });
    s.addText(c.sub, { x:cx+0.05, y:acy+0.54, w:acW-0.1, h:acH-0.64, fontSize:8.5,
      color:"DDEEFF", fontFace:"Calibri", align:"center", valign:"top", margin:0 });
    if (i > 0) arrow(s, acx0+(i-1)*(acW+acGap)+acW, acy+acH*0.38, cx, acy+acH*0.38, C.white);
  });

  // App → API Router
  arrow(s, 1.68, 2.61, 1.92, 2.44, C.white);
  s.addText("POST /chat\n{query, thread_id}", { x:0.12, y:1.62, w:1.5, h:0.52, fontSize:7.5,
    color:C.lgray, fontFace:"Calibri", align:"center", margin:0 });

  // Memory Store
  s.addShape(prs.shapes.RECTANGLE,
    { x:3.18, y:3.3, w:3.73, h:0.55, fill:{color:"1E2040"}, line:{color:"8888BB",width:1}, shadow:sh() });
  s.addText("💾  Memory Store — LangGraph MemorySaver · Persiste historial por thread_id", {
    x:3.24, y:3.3, w:3.6, h:0.55, fontSize:8.5, bold:true, color:C.white,
    fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  [1,2,3].forEach(i => {
    const mx = acx0 + i*(acW+acGap) + acW*0.5;
    arrow(s, mx, acy+acH, mx, 3.3, "8888BB");
  });

  // 6 Tools box
  const analCx20 = acx0 + 2*(acW+acGap);
  s.addShape(prs.shapes.RECTANGLE,
    { x:analCx20-0.1, y:3.96, w:acW+0.2, h:0.95, fill:{color:"2D0D55"}, line:{color:C.lime,width:1.5} });
  s.addText("🔧 6 Herramientas Tavily (paralelo)", { x:analCx20-0.04, y:3.98, w:acW+0.08, h:0.3,
    fontSize:8.5, bold:true, color:C.lime, fontFace:"Calibri", align:"center", margin:0 });
  s.addText("h2h · FIFA · forma · mundialista · goles · plantilla", { x:analCx20-0.04, y:4.28, w:acW+0.08, h:0.58,
    fontSize:8, color:"BBBBFF", fontFace:"Calibri", align:"center", margin:0 });
  arrow(s, analCx20+acW*0.5, acy+acH, analCx20+acW*0.5, 3.96, C.lime);

  // Gemini (top-right)
  s.addShape(prs.shapes.RECTANGLE,
    { x:7.73, y:1.68, w:1.87, h:0.82, fill:{color:C.purple}, line:{color:C.purple}, shadow:sh() });
  s.addText("⚡ Google\nGemini 2.5 Flash", { x:7.73, y:1.68, w:1.87, h:0.82,
    fontSize:9.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  arrow(s, acx0+acW, acy+acH*0.2, 7.73, 2.09, C.purple);

  // Tavily (bottom-right)
  s.addShape(prs.shapes.RECTANGLE,
    { x:7.73, y:3.96, w:1.87, h:0.95, fill:{color:C.red}, line:{color:C.red}, shadow:sh() });
  s.addText("🔍 Tavily\nSearch API", { x:7.73, y:3.96, w:1.87, h:0.95,
    fontSize:9.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  arrow(s, analCx20+acW+0.1, 4.44, 7.73, 4.44, C.red);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 21 — C4 L3: SERVICIO DE SEGMENTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Segmentación — Componentes [C4 Nivel 3]");
  s.addText("Pipeline ML: 49 features → Logistic Regression (.pkl) → Label Encoder → Motor de Reglas → premio óptimo con score 0–100 y razones.",
    { x:0.42, y:1.0, w:9.2, h:0.3, fontSize:9.5, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // External App (left)
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.22, y:2.25, w:1.45, h:0.78, fill:{color:C.blue}, line:{color:C.blue}, shadow:sh() });
  s.addText("📱 AI-Bank App", { x:0.22, y:2.25, w:1.45, h:0.4, fontSize:9, bold:true,
    color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("[External]", { x:0.22, y:2.63, w:1.45, h:0.3, fontSize:7.5,
    color:"AACCFF", fontFace:"Calibri", align:"center", margin:0 });

  // External DB (top-right)
  s.addShape(prs.shapes.RECTANGLE,
    { x:7.75, y:1.42, w:1.85, h:0.88, fill:{color:"1A7A4A"}, line:{color:"1A7A4A"}, shadow:sh() });
  s.addText("🗄️ Base de Datos", { x:7.75, y:1.42, w:1.85, h:0.42, fontSize:9, bold:true,
    color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("PostgreSQL · Supabase\ntabla: persona", { x:7.75, y:1.84, w:1.85, h:0.4, fontSize:7.5,
    color:"AADDBB", fontFace:"Calibri", align:"center", margin:0 });

  // Service boundary
  s.addShape(prs.shapes.RECTANGLE,
    { x:1.78, y:1.35, w:5.82, h:3.78, fill:{color:"F8F0FF"}, line:{color:C.purple,width:1.5,dashType:"dash"} });
  s.addText("Servicio de Segmentación — FastAPI / Scikit-learn", { x:1.83, y:1.38, w:5.6, h:0.26,
    fontSize:8.5, bold:true, color:C.purple, fontFace:"Calibri", align:"left", margin:0 });

  // 5 components
  const sc21 = [
    { label:"API\nRouter", sub:"FastAPI · Pydantic\nPOST /segmentar\n/segmentar/batch\n/categorias", col:C.purple },
    { label:"Constructor\nde Features", sub:"Python · pandas\nbuild_input_df.py\n49 features\n8 derivadas", col:C.midBlue },
    { label:"Clasificador\nML", sub:"Scikit-learn\nLogistic Regression\n.pkl · 9 categorías\nF1-macro: 0.79", col:C.blue },
    { label:"Label\nEncoder", sub:"Scikit-learn\nLabelEncoder.pkl\nDecodifica índice\na categoría", col:"885500" },
    { label:"Motor de\nReglas", sub:"Python\nreglas_premios.py\n40 premios\nscore 0–100", col:C.red },
  ];
  const scW=1.02, scH=1.88, scGap=0.06, scx0=1.92, scy=1.66;
  sc21.forEach((c,i) => {
    const cx = scx0 + i*(scW+scGap);
    s.addShape(prs.shapes.RECTANGLE,
      { x:cx, y:scy, w:scW, h:scH, fill:{color:c.col}, line:{color:c.col}, shadow:sh() });
    s.addText(c.label, { x:cx+0.04, y:scy+0.06, w:scW-0.08, h:0.52, fontSize:9.5, bold:true,
      color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addShape(prs.shapes.LINE,
      { x:cx+0.06, y:scy+0.6, w:scW-0.12, h:0, line:{color:C.white,width:0.5,transparency:50} });
    s.addText(c.sub, { x:cx+0.04, y:scy+0.66, w:scW-0.08, h:scH-0.76, fontSize:8,
      color:"EEEEFF", fontFace:"Calibri", align:"center", valign:"top", margin:0 });
    if (i > 0) arrow(s, scx0+(i-1)*(scW+scGap)+scW, scy+scH*0.32, cx, scy+scH*0.32, C.white);
  });

  // App → API Router
  arrow(s, 1.68, 2.64, 1.92, 2.6, C.white);
  // DB → API Router (reads profile)
  arrow(s, 7.75, 1.86, scx0+scW, 1.66, "1A7A4A");
  s.addText("Lee perfil\nid_persona", { x:6.85, y:1.62, w:1.12, h:0.4, fontSize:7.5,
    color:"1A7A4A", fontFace:"Calibri", align:"center", margin:0 });

  // Response bar
  const lastScX = scx0 + 4*(scW+scGap) + scW;
  s.addShape(prs.shapes.RECTANGLE,
    { x:1.92, y:3.66, w:lastScX-1.92, h:0.56, fill:{color:C.limeBg}, line:{color:C.lime,width:1} });
  s.addText("JSON 200: { categoria, confianza_pct, premio, afinidad_pct, razones[ ], alternativas[ ] }",
    { x:2.0, y:3.66, w:lastScX-2.08, h:0.56, fontSize:9, color:C.dark,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  arrow(s, 1.92, 3.94, 1.68, 3.94, C.lime);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 22 — C4 L3: MOTOR DE MATCHMAKING
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Motor de Matchmaking — Componentes [C4 Nivel 3]");
  s.addText("Compatibilidad financiera: 70% historial de egresos (categorías + frecuencia) + 30% liquidez (saldo proyectado) → asignación óptima de grupos.",
    { x:0.42, y:1.0, w:9.2, h:0.3, fontSize:9.5, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // External App (left)
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.22, y:2.25, w:1.45, h:0.78, fill:{color:C.blue}, line:{color:C.blue}, shadow:sh() });
  s.addText("📱 AI-Bank App", { x:0.22, y:2.25, w:1.45, h:0.4, fontSize:9, bold:true,
    color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("[External]", { x:0.22, y:2.63, w:1.45, h:0.3, fontSize:7.5,
    color:"AACCFF", fontFace:"Calibri", align:"center", margin:0 });

  // External DB (top-right)
  s.addShape(prs.shapes.RECTANGLE,
    { x:7.75, y:1.35, w:1.85, h:1.08, fill:{color:"1A7A4A"}, line:{color:"1A7A4A"}, shadow:sh() });
  s.addText("🗄️ Base de Datos", { x:7.75, y:1.35, w:1.85, h:0.42, fontSize:9, bold:true,
    color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  s.addText("PostgreSQL · Supabase\ntablas: consumo · perfil · grupo", { x:7.75, y:1.77, w:1.85, h:0.58,
    fontSize:7.5, color:"AADDBB", fontFace:"Calibri", align:"center", margin:0 });

  // Service boundary
  s.addShape(prs.shapes.RECTANGLE,
    { x:1.78, y:1.35, w:5.82, h:3.78, fill:{color:"FFF4F4"}, line:{color:C.red,width:1.5,dashType:"dash"} });
  s.addText("Motor de Matchmaking — FastAPI / Python", { x:1.83, y:1.38, w:5.6, h:0.26,
    fontSize:8.5, bold:true, color:C.red, fontFace:"Calibri", align:"left", margin:0 });

  // 5 components
  const mc22 = [
    { label:"API\nRouter", sub:"FastAPI · Pydantic\nPOST /matchmaking\n/asignar\nGET /health", col:C.red },
    { label:"Extractor de\nFeatures", sub:"Python · pandas\nEgresos (consumo)\nSaldo proyectado\nNormaliza features", col:C.midBlue },
    { label:"Calculador de\nCompatibilidad", sub:"Python\n70% egresos\n30% liquidez\nMatriz n×n pares", col:C.purple },
    { label:"Asignador de\nGrupos", sub:"Python\nMaximiza índice\ncompatibilidad\npromedio", col:C.blue },
    { label:"Escritor de\nResultados", sub:"Python\nSupabase Client\nEscribe en tabla\ngrupo", col:"1A7A4A" },
  ];
  const mcW=1.02, mcH=1.88, mcGap=0.06, mcx0=1.92, mcy=1.66;
  mc22.forEach((c,i) => {
    const cx = mcx0 + i*(mcW+mcGap);
    s.addShape(prs.shapes.RECTANGLE,
      { x:cx, y:mcy, w:mcW, h:mcH, fill:{color:c.col}, line:{color:c.col}, shadow:sh() });
    s.addText(c.label, { x:cx+0.04, y:mcy+0.06, w:mcW-0.08, h:0.52, fontSize:9, bold:true,
      color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addShape(prs.shapes.LINE,
      { x:cx+0.06, y:mcy+0.6, w:mcW-0.12, h:0, line:{color:C.white,width:0.5,transparency:50} });
    s.addText(c.sub, { x:cx+0.04, y:mcy+0.66, w:mcW-0.08, h:mcH-0.76, fontSize:8,
      color:"FFEEFF", fontFace:"Calibri", align:"center", valign:"top", margin:0 });
    if (i > 0) arrow(s, mcx0+(i-1)*(mcW+mcGap)+mcW, mcy+mcH*0.32, cx, mcy+mcH*0.32, C.white);
  });

  // App → API Router
  arrow(s, 1.68, 2.64, 1.92, 2.6, C.white);
  s.addText("POST\n/matchmaking\n/asignar", { x:0.1, y:1.62, w:1.55, h:0.58, fontSize:7.5,
    color:C.lgray, fontFace:"Calibri", align:"center", margin:0 });

  // Feature Extractor ← DB (reads)
  const extCx22 = mcx0 + (mcW+mcGap) + mcW/2;
  arrow(s, 7.75, 1.89, extCx22+0.1, mcy, "1A7A4A");
  s.addText("Lee egresos\n+ saldo proy.", { x:6.88, y:1.62, w:1.14, h:0.4, fontSize:7.5,
    color:"1A7A4A", fontFace:"Calibri", align:"center", margin:0 });

  // Result Writer → DB (writes)
  const wrCx22 = mcx0 + 4*(mcW+mcGap) + mcW/2;
  arrow(s, wrCx22, mcy, 7.75, 1.89, "1A7A4A");
  s.addText("Escribe grupos\nasignados", { x:7.15, y:2.18, w:0.95, h:0.42, fontSize:7.5,
    color:"1A7A4A", fontFace:"Calibri", align:"center", margin:0 });

  // Formula bar
  s.addShape(prs.shapes.RECTANGLE,
    { x:1.92, y:3.66, w:mcW*5+mcGap*4, h:0.56, fill:{color:C.limeBg}, line:{color:C.lime,width:1.2} });
  s.addText("Índice = 0.70 × egresos_norm + 0.30 × liquidez_norm  ·  Respuesta: { grupos: [{ id_grupo, miembros[ ], compatibilidad_promedio }] }",
    { x:2.0, y:3.66, w:mcW*5+mcGap*4-0.16, h:0.56, fontSize:8.5, bold:true, color:C.dark,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  arrow(s, 1.92, 3.94, 1.68, 3.94, C.lime);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 23 — SECCIÓN: MODELAMIENTO DE DATOS
// ═══════════════════════════════════════════════════════════════════════════════
divider("Modelamiento\nde Datos",
  "Esquema relacional PostgreSQL — fuente de verdad del sistema", "07 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 19 — CORE TABLES
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Modelo de Datos — Tablas Principales");
  const tables = [
    { name:"persona",      desc:"Perfil maestro del cliente. 40+ campos: financiero, gamificación, demográfico y digital. Fuente de las 49 features del modelo ML.", col:C.blue },
    { name:"perfil",       desc:"Cuenta de gamificación (millas, puntos, liga activa). Vinculada 1:1 con persona.", col:C.blue },
    { name:"partido",      desc:"Registro de partidos del Mundial con países, temporada y resultado oficial.", col:C.purple },
    { name:"pronosticos",  desc:"Predicciones del usuario sobre partidos. Registra acierto (es_correcto) y mAiles ganados.", col:C.purple },
    { name:"cromos",       desc:"Catálogo de cromos coleccionables. Rareza: común · raro · épico. Asociados a países.", col:C.red },
    { name:"consumo",      desc:"Transacciones bancarias del usuario. Base para calcular porcentajes de gasto por categoría.", col:C.red },
    { name:"liga",         desc:"Cuatro niveles de fidelidad: Bronce · Plata · Oro · Diamante. Define rangos de puntos.", col:"1A7A4A" },
    { name:"premios",      desc:"Premios otorgados a cada usuario con referencia a la liga activa al momento de la entrega.", col:"1A7A4A" },
    { name:"grupo",        desc:"Grupos de predicción colaborativa. Registra creador y miembros del grupo.", col:"885500" },
    { name:"temporada",    desc:"Período activo del torneo (fecha_inicio, fecha_fin). Partidos y pronósticos vinculados.", col:"885500" },
  ];
  const W1=2.0, W2=6.8, H=0.44, gy=0.06, startY=1.08;
  tables.forEach((t,i) => {
    const row = i%5, col = Math.floor(i/5);
    const x = col===0 ? 0.38 : 0.38 + W1 + W2 + 0.16;
    const y = startY + row*(H+gy);
    const xOff = col===0 ? 0 : (W1+W2+0.16);
    // Table name box
    s.addShape(prs.shapes.RECTANGLE,
      { x:0.38+xOff, y, w:W1, h:H, fill:{color:t.col}, line:{color:t.col} });
    s.addText(t.name, { x:0.38+xOff+0.06, y, w:W1-0.12, h:H,
      fontSize:10, bold:true, color:C.white, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
    // Description box
    s.addShape(prs.shapes.RECTANGLE,
      { x:0.38+xOff+W1, y, w:W2, h:H, fill:{color:i%2===0?C.cardBg:C.white}, line:{color:C.border,width:0.5} });
    s.addText(t.desc, { x:0.38+xOff+W1+0.1, y:y+0.04, w:W2-0.2, h:H-0.08,
      fontSize:9.5, color:C.dark, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
  });

  // Relaciones clave
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:4.88, w:9.22, h:0.38, fill:{color:C.limeBg}, line:{color:C.lime,width:1.2} });
  s.addText("persona → perfil (1:1) · perfil → pronosticos → partido · perfil → cromosperfil → cromos · perfil → perfilesliga → liga",
    { x:0.38, y:4.88, w:9.22, h:0.38, fontSize:9.5, color:C.dark, fontFace:"Calibri",
      align:"center", valign:"middle", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20 — SECCIÓN: GENERACIÓN Y PROCESAMIENTO DE DATOS
// ═══════════════════════════════════════════════════════════════════════════════
divider("Generación y\nProcesamiento de Datos",
  "Dataset sintético · Pipeline de entrenamiento · Inferencia en tiempo real", "08 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 21 — PIPELINE ML — DOS FASES
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Pipeline ML — Fase Offline y Fase Online");

  // ── FASE OFFLINE (banda superior) ──
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:1.05, w:9.22, h:0.3, fill:{color:C.dark}, line:{color:C.dark} });
  s.addText("FASE OFFLINE — Entrenamiento del Modelo (una sola vez)",
    { x:0.52, y:1.05, w:9, h:0.3, fontSize:10.5, bold:true, color:C.lime,
      fontFace:"Calibri", align:"left", valign:"middle", margin:0 });

  const offline = [
    { label:"🧪 Dataset Sintético\n30.000 perfiles\ngenerados con IA" },
    { label:"🏋️ Entrenamiento\nLogistic Regression\nValidación cruzada" },
    { label:"📦 Modelos .pkl\nmodelo_categoria.pkl\nlabel_encoder.pkl" },
  ];
  const OW=2.6, OH=1.1, ogx=0.3, ox0=0.6, oy=1.42;
  offline.forEach((o,i) => {
    const ox = ox0 + i*(OW+ogx);
    s.addShape(prs.shapes.RECTANGLE,
      { x:ox, y:oy, w:OW, h:OH, fill:{color:C.dark}, line:{color:C.lime,width:1.5}, shadow:sh() });
    s.addText(o.label, { x:ox+0.1, y:oy, w:OW-0.2, h:OH,
      fontSize:10, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    if (i<2) arrow(s, ox+OW, oy+OH*0.5, ox+OW+ogx, oy+OH*0.5, C.lime);
  });

  s.addText("F1-macro: 0.79 · Accuracy: 0.79", { x:8.0, y:oy+0.35, w:1.9, h:0.42,
    fontSize:9.5, bold:true, color:C.lime, fontFace:"Calibri", align:"center", margin:0 });

  // ── FASE ONLINE (banda inferior) ──
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:2.75, w:9.22, h:0.3, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText("FASE ONLINE — Inferencia en Tiempo Real (por cada usuario, < 500 ms)",
    { x:0.52, y:2.75, w:9, h:0.3, fontSize:10.5, bold:true, color:C.white,
      fontFace:"Calibri", align:"left", valign:"middle", margin:0 });

  const online = [
    { label:"📱 App\nSolicita premios\ndel usuario" },
    { label:"🗄️ Base de Datos\nLee 49 features\ndel perfil" },
    { label:"📐 build_input_df\nNormaliza y\ncalcula derivadas" },
    { label:"🧠 Modelo ML\nClasifica en\n9 categorías" },
    { label:"📋 Motor Reglas\nPuntúa 40 premios\ncon razones" },
  ];
  const NW=1.55, NH=1.1, ngx=0.18, nx0=0.45, ny=3.12;
  online.forEach((o,i) => {
    const nx = nx0 + i*(NW+ngx);
    s.addShape(prs.shapes.RECTANGLE,
      { x:nx, y:ny, w:NW, h:NH, fill:{color:C.cardBg}, line:{color:C.blue,width:1.5}, shadow:sh() });
    s.addText(o.label, { x:nx+0.07, y:ny, w:NW-0.14, h:NH,
      fontSize:9.5, color:C.dark, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    if (i<4) arrow(s, nx+NW, ny+NH*0.5, nx+NW+ngx, ny+NH*0.5, C.blue);
  });

  // Output final online
  s.addShape(prs.shapes.RECTANGLE,
    { x:8.9, y:ny, w:0.7, h:NH, fill:{color:C.lime}, line:{color:C.lime}, shadow:sh() });
  s.addText("JSON\nResp.", { x:8.9, y:ny, w:0.7, h:NH,
    fontSize:9, bold:true, color:C.dark, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  arrow(s, 8.73, ny+NH*0.5, 8.9, ny+NH*0.5, C.blue);

  // Nota datos sintéticos
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:4.38, w:9.22, h:0.86, fill:{color:C.purpleLt}, line:{color:C.purple,width:1} });
  s.addText("ℹ️  Datos Sintéticos Generados con IA:", { x:0.55, y:4.44, w:3, h:0.28,
    fontSize:10, bold:true, color:C.purple, fontFace:"Calibri", align:"left", margin:0 });
  s.addText("Ante la ausencia de datos históricos de clientes reales, el dataset de entrenamiento fue generado con IA para simular la distribución " +
    "esperada de 30.000 perfiles bancarios (perfil financiero, consumo, gamificación, demográfico y digital), preservando la privacidad de los clientes.",
    { x:0.55, y:4.72, w:8.9, h:0.45, fontSize:9.5, color:C.gray, fontFace:"Calibri",
      align:"left", valign:"top", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 22 — SECCIÓN: USO DE IA
// ═══════════════════════════════════════════════════════════════════════════════
divider("Uso de IA en\nla Plataforma",
  "Cuatro dimensiones de aplicación de inteligencia artificial", "09 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 23 — LAS 4 DIMENSIONES DE IA
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Las 4 Dimensiones de IA en AI-Bank");
  const dims = [
    { color:C.blue, emoji:"🧩", title:"Segmentación de Usuarios",
      body:"Modelo ML multiclase (Logistic Regression) agrupa usuarios en 9 perfiles de interés a partir de 49 variables. La segmentación evoluciona con el comportamiento del usuario en la plataforma." },
    { color:C.purple, emoji:"🎁", title:"Personalización de Premios",
      body:"El motor de reglas combina la salida del modelo ML con criterios de negocio (ciudad, gasto, liga) para seleccionar el premio más afín de un catálogo de 40 opciones con afinidad 0–100% y razones explicables." },
    { color:C.red, emoji:"🤖", title:"Chatbot Multi-Agente",
      body:"Pipeline Orquestador → Analista (6 herramientas Tavily en paralelo) → Censor. Memoria conversacional por sesión. Respuestas informativas y balanceadas sin predicciones de ganador." },
    { color:C.red, emoji:"⚡", title:"Motor de Matchmaking",
      body:"Algoritmo de compatibilidad financiera: 70% historial de egresos (categorías de comercio + frecuencia) + 30% liquidez (saldo proyectado). Genera la matriz de índices entre candidatos y asigna grupos optimizando la compatibilidad promedio." },
  ];
  const W=4.45, H=1.9, gx=0.1, gy=0.12, sx=0.38, sy=1.08;
  dims.forEach((d,i) => {
    const col=i%2, row=Math.floor(i/2);
    const x=sx+col*(W+gx), y=sy+row*(H+gy);
    s.addShape(prs.shapes.RECTANGLE,
      { x, y, w:W, h:H, fill:{color:C.white}, line:{color:d.color,width:2}, shadow:sh() });
    s.addShape(prs.shapes.RECTANGLE,
      { x, y, w:W, h:0.08, fill:{color:d.color}, line:{color:d.color} });
    // Emoji circle
    s.addShape(prs.shapes.OVAL,
      { x:x+0.15, y:y+0.18, w:0.65, h:0.65, fill:{color:d.color,transparency:85}, line:{color:d.color,transparency:85} });
    s.addText(d.emoji, { x:x+0.15, y:y+0.18, w:0.65, h:0.65,
      fontSize:22, align:"center", valign:"middle", margin:0 });
    s.addText(d.title, { x:x+0.95, y:y+0.18, w:W-1.1, h:0.65,
      fontSize:13, bold:true, color:d.color, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
    s.addShape(prs.shapes.LINE,
      { x:x+0.15, y:y+0.9, w:W-0.3, h:0, line:{color:d.color,width:0.5,transparency:60} });
    s.addText(d.body, { x:x+0.15, y:y+0.98, w:W-0.3, h:0.85,
      fontSize:10.5, color:C.gray, fontFace:"Calibri", align:"left", valign:"top", margin:0 });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 24 — SECCIÓN: CONSIDERACIONES FUTURAS
// ═══════════════════════════════════════════════════════════════════════════════
divider("Consideraciones Futuras\n— Arquitectura Azure",
  "Microservicios en Azure Container Apps · GraphRAG · SWA", "10 —");

// ═══════════════════════════════════════════════════════════════════════════════
// 25 — ARQUITECTURA AZURE — MICROSERVICIOS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("Arquitectura Futura — Microservicios en Azure");

  // Grupos de servicios
  const groups = [
    { x:0.38, y:1.05, w:1.62, h:4.22, col:C.blue, label:"Front\n& Edge",
      items:["Azure\nStatic\nWeb Apps", "Azure\nFront Door\n+ WAF", "Azure\nAPI Mgmt\n(APIM)"] },
    { x:2.18, y:1.05, w:2.12, h:4.22, col:C.purple, label:"Microservicios\nde Negocio (ACA)",
      items:["Auth Service", "User Service", "Prediction Svc", "Banking Service", "Album Service"] },
    { x:4.48, y:1.05, w:1.92, h:4.22, col:C.midBlue, label:"Microservicios\nde IA (ACA)",
      items:["🤖 Agent\nService", "📊 Segmentation\nService"] },
    { x:6.58, y:1.05, w:1.72, h:4.22, col:"1A7A4A", label:"Capa de\nDatos",
      items:["PostgreSQL\nFlexible\n(HA Zone)", "Cosmos DB\n(Gremlin)\nGraphRAG", "Redis\nCache"] },
    { x:8.48, y:1.05, w:1.1, h:4.22, col:"885500", label:"CI/CD\n& Ops",
      items:["ACR", "GitHub\nActions", "Monitor\n+ AppInsights"] },
  ];

  groups.forEach(g => {
    s.addShape(prs.shapes.RECTANGLE,
      { x:g.x, y:g.y, w:g.w, h:g.h, fill:{color:g.col,transparency:88}, line:{color:g.col,width:1.5}, shadow:sh() });
    s.addText(g.label, { x:g.x+0.05, y:g.y+0.05, w:g.w-0.1, h:0.52,
      fontSize:9, bold:true, color:g.col, fontFace:"Calibri", align:"center", margin:0 });
    const itemH = (g.h - 0.65) / g.items.length - 0.1;
    g.items.forEach((item,j) => {
      const iy = g.y + 0.62 + j*(itemH+0.1);
      s.addShape(prs.shapes.RECTANGLE,
        { x:g.x+0.1, y:iy, w:g.w-0.2, h:itemH, fill:{color:g.col}, line:{color:g.col}, shadow:sh() });
      s.addText(item, { x:g.x+0.1, y:iy, w:g.w-0.2, h:itemH,
        fontSize:8.5, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    });
  });

  // Flechas flujo
  arrow(s, 2.0, 3.16, 2.18, 3.16, C.blue);
  arrow(s, 4.3, 3.16, 4.48, 3.16, C.purple);
  arrow(s, 6.4, 3.16, 6.58, 3.16, C.midBlue);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 26 — GRAPHRAG — EL SALTO HACIA EL FUTURO
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = content("GraphRAG + Base de Datos de Grafos — Evolución del Agente IA");
  s.addText("El Agente Analista actualmente ejecuta 6 llamadas Tavily por consulta (8–15 s). GraphRAG sobre Cosmos DB (Gremlin) transforma esta arquitectura:",
    { x:0.42, y:1.0, w:9.2, h:0.42, fontSize:11, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });

  // Tabla comparativa
  const hdrs = ["Dimensión", "Tavily Search (Actual)", "GraphRAG + Grafos (Futuro)"];
  const colXs = [0.38, 2.9, 6.52];
  const colWs = [2.42, 3.5, 3.1];
  const hColors = [C.dark, C.red, "1A7A4A"];

  hdrs.forEach((h,i) => {
    s.addShape(prs.shapes.RECTANGLE,
      { x:colXs[i], y:1.52, w:colWs[i], h:0.38, fill:{color:hColors[i]}, line:{color:hColors[i]} });
    s.addText(h, { x:colXs[i]+0.08, y:1.52, w:colWs[i]-0.16, h:0.38,
      fontSize:10.5, bold:true, color:C.white, fontFace:"Calibri", align:"left", valign:"middle", margin:0 });
  });

  const rows2 = [
    { dim:"Relaciones multi-hop", actual:"Requiere múltiples búsquedas y síntesis manual por el LLM", future:"El grafo las traviesa directamente (ej: equipos que X enfrentó que también jugaron contra Y)" },
    { dim:"Latencia",              actual:"8–15 s (6 llamadas a APIs externas por consulta)",           future:"< 1 s (consulta local sobre grafo indexado)" },
    { dim:"Contexto histórico",    actual:"Efímero — búsqueda nueva en cada consulta",                  future:"Persistente — el grafo almacena todos los torneos anteriores" },
    { dim:"Costo operativo",       actual:"Crece linealmente con el volumen de consultas",               future:"Fijo — el grafo se actualiza periódicamente, no en inferencia" },
    { dim:"Coherencia semántica",  actual:"Dependiente de la calidad de los sitios indexados",           future:"Controlada — nodos y aristas validados al ingestar los datos" },
  ];
  rows2.forEach((r,i) => {
    const y = 1.95 + i*0.52;
    const bg = i%2===0 ? C.cardBg : C.white;
    colXs.forEach((x,j) => {
      s.addShape(prs.shapes.RECTANGLE,
        { x, y, w:colWs[j], h:0.48, fill:{color:bg}, line:{color:C.border,width:0.5} });
    });
    const vals = [r.dim, r.actual, r.future];
    const tColors = [C.dark, C.red, "1A7A4A"];
    vals.forEach((v,j) => {
      s.addText(v, { x:colXs[j]+0.08, y:y+0.03, w:colWs[j]-0.16, h:0.42,
        fontSize:9.5, color:tColors[j], fontFace:"Calibri", align:"left", valign:"middle",
        bold:j===0, margin:0 });
    });
  });

  // Stack propuesto
  s.addShape(prs.shapes.RECTANGLE,
    { x:0.38, y:4.65, w:9.22, h:0.6, fill:{color:C.limeBg}, line:{color:C.lime,width:1.5} });
  s.addText("Stack propuesto: ", { x:0.55, y:4.68, w:1.6, h:0.28,
    fontSize:10, bold:true, color:C.dark, fontFace:"Calibri", align:"left", margin:0 });
  s.addText("Azure Cosmos DB para Apache Gremlin (base de datos de grafos gestionada) · Microsoft GraphRAG (pipeline de indexación semántica) · Azure Container App Job (ingesta periódica por jornada del Mundial)",
    { x:0.55, y:4.96, w:9.0, h:0.25, fontSize:9, color:C.gray, fontFace:"Calibri", align:"left", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESCRIBIR ARCHIVO
// ═══════════════════════════════════════════════════════════════════════════════
const outPath = "C:\\Users\\MARCO\\Documents\\PROYECTOS_TATA\\documentation\\AI-Bank_Arquitectura.pptx";
prs.writeFile({ fileName: outPath })
  .then(() => console.log(`✅  Presentación generada: ${outPath}`))
  .catch(err => console.error("❌  Error:", err));
