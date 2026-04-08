import { Platform } from "react-native";

// ─── Al-Bank mAiles — Paleta Oficial ───────────────────────────────────────

export const DARK_COLORS = {
  // Fondos
  background: "#071325",
  backgroundSecondary: "#101c2e",
  cardBackground: "#1f2a3d",
  cardBackgroundAlt: "#142032",
  inputBackground: "#030e20",
  overlay: "rgba(0,0,0,0.7)",

  // Texto
  textPrimary: "#d7e3fc",
  textSecondary: "#8c90a1",
  textMuted: "#424655",
  textOnGold: "#071325",

  // Marca
  primary: "#b2c5ff",
  primaryDim: "rgba(178,197,255,0.1)",
  primaryBorder: "rgba(178,197,255,0.2)",
  primaryBorderStrong: "rgba(178,197,255,0.3)",

  // Acento dorado (premios, mAiles, CTAs)
  gold: "#ffd65b",
  goldDim: "rgba(255,214,91,0.2)",
  goldBorder: "rgba(255,214,91,0.3)",
  goldShadow: "rgba(255,214,91,0.3)",

  // Estados
  error: "#ffb4ab",
  errorDim: "rgba(255,180,171,0.15)",
  success: "#4CAF50",
  successDim: "rgba(76,175,80,0.15)",
  warning: "#ffb59d",

  // Bordes y divisores
  borderSubtle: "rgba(178,197,255,0.2)",
  borderMedium: "#1f2a3d",
  borderStrong: "#424655",
  divider: "rgba(178,197,255,0.1)",

  // Sombras
  shadowColor: "#000",
  shadowColorGold: "rgba(255,214,91,0.3)",
  shadowColorBlue: "rgba(178,197,255,0.15)",

  // Rareza de cromos
  rarityEpicText: "#ffd65b",
  rarityEpicBorder: "#f0c110",
  rarityEpicBg: "rgba(255,214,91,0.15)",
  rarityRareText: "#b2c5ff",
  rarityRareBorder: "#5b8cff",
  rarityRareBg: "rgba(178,197,255,0.1)",
  rarityCommonText: "#c2c6d8",
  rarityCommonBorder: "#424655",
  rarityCommonBg: "rgba(66,70,85,0.2)",

  // Forma (resultados partido)
  formaWin: "#b2c5ff",
  formaDraw: "#424655",
  formaLoss: "#ffb4ab",

  // Rankings
  rankGold: "#ffd65b",
  rankSilver: "#c0c0c0",
  rankBronze: "#cd7f32",
};

export const LIGHT_COLORS: typeof DARK_COLORS = {
  // Fondos
  background: "#f5f7fa",
  backgroundSecondary: "#eef1f7",
  cardBackground: "#ffffff",
  cardBackgroundAlt: "#f0f4ff",
  inputBackground: "#f8faff",
  overlay: "rgba(0,0,0,0.5)",

  // Texto
  textPrimary: "#0d1b2e",
  textSecondary: "#7d8a96",
  textMuted: "#9ca3af",
  textOnGold: "#0d1b2e",

  // Marca
  primary: "#0052cc",
  primaryDim: "rgba(0,82,204,0.08)",
  primaryBorder: "rgba(0,82,204,0.15)",
  primaryBorderStrong: "rgba(0,82,204,0.25)",

  // Acento dorado
  gold: "#f09e1c",
  goldDim: "rgba(240,158,28,0.15)",
  goldBorder: "rgba(240,158,28,0.3)",
  goldShadow: "rgba(240,158,28,0.25)",

  // Estados
  error: "#ee5a52",
  errorDim: "rgba(238,90,82,0.1)",
  success: "#1fb742",
  successDim: "rgba(31,183,66,0.1)",
  warning: "#e07a40",

  // Bordes y divisores
  borderSubtle: "rgba(0,82,204,0.1)",
  borderMedium: "#e2e8f0",
  borderStrong: "#9ca3af",
  divider: "rgba(0,82,204,0.07)",

  // Sombras
  shadowColor: "#000",
  shadowColorGold: "rgba(240,158,28,0.2)",
  shadowColorBlue: "rgba(0,82,204,0.12)",

  // Rareza de cromos
  rarityEpicText: "#c07d00",
  rarityEpicBorder: "#f09e1c",
  rarityEpicBg: "rgba(240,158,28,0.12)",
  rarityRareText: "#0052cc",
  rarityRareBorder: "#4080ff",
  rarityRareBg: "rgba(0,82,204,0.08)",
  rarityCommonText: "#5a6478",
  rarityCommonBorder: "#9ca3af",
  rarityCommonBg: "rgba(156,163,175,0.15)",

  // Forma
  formaWin: "#0052cc",
  formaDraw: "#9ca3af",
  formaLoss: "#ee5a52",

  // Rankings
  rankGold: "#f09e1c",
  rankSilver: "#9ca3af",
  rankBronze: "#cd7f32",
};

// ─── Tipografía ────────────────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ─── Espaciado y Radios ────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// ─── Compatibilidad legacy ─────────────────────────────────────────────────
export const Colors = {
  light: {
    text: LIGHT_COLORS.textPrimary,
    background: LIGHT_COLORS.background,
    tint: LIGHT_COLORS.primary,
    icon: LIGHT_COLORS.textSecondary,
    tabIconDefault: LIGHT_COLORS.textSecondary,
    tabIconSelected: LIGHT_COLORS.primary,
  },
  dark: {
    text: DARK_COLORS.textPrimary,
    background: DARK_COLORS.background,
    tint: DARK_COLORS.primary,
    icon: DARK_COLORS.textSecondary,
    tabIconDefault: DARK_COLORS.textSecondary,
    tabIconSelected: DARK_COLORS.primary,
  },
};
