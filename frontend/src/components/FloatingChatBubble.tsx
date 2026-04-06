import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ChatMessage } from "../api/types";
import { useChat } from "../hooks/useChat";
import { colors } from "../theme/colors";

interface FloatingChatBubbleProps {
  visible?: boolean;
}

export default function FloatingChatBubble({
  visible: initialVisible,
}: FloatingChatBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, error, send, clearError } = useChat();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    setVisible(initialVisible ?? false);
  }, [initialVisible]);

  useEffect(() => {
    if (messages.length > 0 && isExpanded) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isExpanded]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error en Chat", error, [
        { text: "OK", onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await send(text);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.from === "user";
    return (
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAgent]}>
        {!isUser && (
          <View style={s.agentIcon}>
            <MaterialIcons
              name="sports-soccer"
              size={12}
              color={colors.primary}
            />
          </View>
        )}
        <Text
          style={[s.bubbleText, isUser ? s.bubbleTextUser : s.bubbleTextAgent]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  if (!visible) return null;

  // Expanded modal view
  if (isExpanded) {
    return (
      <Modal
        visible={isExpanded}
        animationType="slide"
        onRequestClose={() => setIsExpanded(false)}
        presentationStyle="overFullScreen"
      >
        <KeyboardAvoidingView
          style={s.expandedRoot}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View style={s.expandedHeader}>
            <View style={s.headerContent}>
              <MaterialIcons
                name="sports-soccer"
                size={20}
                color={colors.primary}
              />
              <View style={s.headerText}>
                <Text style={s.headerTitle}>Agente Deportivo</Text>
                <Text style={s.headerSub}>Análisis en tiempo real</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsExpanded(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          {messages.length === 0 && !loading ? (
            <View style={s.emptyContainer}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={40}
                color={colors.outlineVariant}
              />
              <Text style={s.emptyTitle}>¿Quién gana?</Text>
              <Text style={s.emptySub}>
                Haz tu predicción y pregúntame sobre análisis
              </Text>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={s.messagesList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {loading && (
            <View style={s.typingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={s.typingText}>Analizando...</Text>
            </View>
          )}

          {/* Input */}
          <View style={s.expandedInputRow}>
            <TextInput
              style={s.expandedInput}
              placeholder="¿Quién llega mejor?"
              placeholderTextColor={colors.outline}
              value={input}
              onChangeText={setInput}
              editable={!loading}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[
                s.expandedSendBtn,
                (!input.trim() || loading) && s.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <MaterialIcons name="send" size={18} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // Floating bubble
  return (
    <TouchableOpacity
      style={s.floatingBubble}
      onPress={() => setIsExpanded(true)}
      activeOpacity={0.8}
    >
      <View style={s.bubbleIcon}>
        <MaterialIcons name="forum" size={24} color={colors.onPrimary} />
      </View>
      {messages.length > 0 && (
        <View style={s.badge}>
          <Text style={s.badgeText}>{Math.min(messages.length, 9)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  // ── Floating Bubble ──────────────────────────────────────────────────────────
  floatingBubble: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 999,
  },
  bubbleIcon: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onError,
  },

  // ── Expanded View ────────────────────────────────────────────────────────────
  expandedRoot: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 12,
    backgroundColor: colors.surfaceContainerHigh,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.outlineVariant}33`,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
  },
  headerSub: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // ── Messages ─────────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
  },
  emptySub: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  bubbleAgent: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceContainerHigh,
  },
  agentIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${colors.primary}1A`,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  bubbleTextUser: {
    color: colors.onPrimary,
  },
  bubbleTextAgent: {
    color: colors.onSurface,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },

  // ── Input ────────────────────────────────────────────────────────────────────
  expandedInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: `${colors.outlineVariant}33`,
    backgroundColor: colors.surface,
  },
  expandedInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: colors.onSurface,
    fontSize: 13,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}4D`,
  },
  expandedSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
