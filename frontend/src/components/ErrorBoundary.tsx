import { MaterialIcons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../theme/colors";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

// ── Error Boundary Class Component ────────────────────────────────────────────
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Capturar NotFoundError, removeChild errors, u otros React internals
    console.error("❌ ErrorBoundary caught:", error.name, error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log para debugging
    console.error("React ErrorBoundary captured:");
    console.error(error);
    console.error(errorInfo);

    this.setState({ errorInfo });

    // Callback opcional para enviar a analytics
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={s.container}>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Icon */}
            <View style={s.iconBox}>
              <MaterialIcons
                name="error-outline"
                size={80}
                color={colors.error}
              />
            </View>

            {/* Error Title */}
            <Text style={s.title}>Algo salió mal</Text>
            <Text style={s.subtitle}>
              Experimentamos un error en la interfaz. Por favor, intenta
              nuevamente.
            </Text>

            {/* Error Details (Development Only) */}
            {__DEV__ && (
              <View style={s.detailsBox}>
                <Text style={s.detailsTitle}>
                  {this.state.error?.name} - {this.state.error?.message}
                </Text>
                <Text style={s.detailsText} numberOfLines={6}>
                  {this.state.errorInfo?.componentStack}
                </Text>
              </View>
            )}

            {/* Debugging Tips */}
            <View style={s.tipsBox}>
              <View style={s.tip}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={s.tipText}>Intenta refrescar la aplicación</Text>
              </View>
              <View style={s.tip}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={s.tipText}>Verifica tu conexión a internet</Text>
              </View>
              <View style={s.tip}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={s.tipText}>
                  Si persiste, intenta desinstalar y reinstalar la app
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={s.button}
              onPress={this.handleReset}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name="refresh"
                size={20}
                color={colors.onPrimary}
              />
              <Text style={s.buttonText}>Reintentar</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconBox: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: `${colors.error}15`,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  detailsBox: {
    backgroundColor: `${colors.surfaceContainerHighest}99`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    maxWidth: 440,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.error,
    marginBottom: 8,
    fontFamily: "monospace",
  },
  detailsText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
    fontFamily: "monospace",
  },
  tipsBox: {
    backgroundColor: `${colors.secondary}0D`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${colors.secondary}33`,
    maxWidth: 440,
    width: "100%",
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.onSurface,
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    maxWidth: 280,
    justifyContent: "center",
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ErrorBoundary;
