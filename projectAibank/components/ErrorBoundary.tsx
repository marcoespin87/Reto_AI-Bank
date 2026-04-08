import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🔴 ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View style={s.errorContainer}>
            <Text style={s.errorIcon}>⚠️</Text>
            <Text style={s.errorTitle}>Algo salió mal</Text>
            <Text style={s.errorMsg}>
              {this.state.error?.message || "Error desconocido"}
            </Text>
            <Text style={s.errorHint}>Intenta recargar la app</Text>
          </View>
        )
      );
    }

    return this.props.children;
  }
}

const s = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  errorMsg: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  errorHint: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});
