import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

interface Message {
  role: "bot" | "user";
  text: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ visible, onClose }: Props) {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "¡Hola! Soy tu **AI Coach** ⚽. Pregúntame sobre el partido Ecuador vs Costa de Marfil y te ayudo con tu predicción.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      setInput("");
    }
  }, [visible]);

  // Scroll to end when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch(
        "https://ai-bank-backend-o83m.onrender.com/agent/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: userMsg, thread_id: threadId }),
        },
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.thread_id && !threadId) setThreadId(data.thread_id);
      setMessages((prev) => [...prev, { role: "bot", text: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ No pude conectarme al AI Coach. Verifica que el servidor esté corriendo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const sheetMaxHeight = screenHeight * 0.85;

  // Theme-derived colors
  const sheetBg = isDark ? "#0d1b2e" : colors.cardBackground;
  const headerTitleColor = colors.textPrimary;
  const headerSubColor = colors.textSecondary;
  const dividerColor = isDark ? "#1f2a3d" : colors.borderMedium;
  const botBubbleBg = isDark ? "#1a2740" : colors.cardBackgroundAlt;
  const closeBtnBg = isDark ? "#1f2a3d" : colors.backgroundSecondary;
  const closeBtnTextColor = colors.textSecondary;
  const inputBg = isDark ? "#0a1525" : colors.inputBackground;
  const inputBorderColor = isDark ? "#1f2a3d" : colors.borderMedium;
  const sendBtnBg = colors.primary;
  const sendBtnTextColor = isDark ? "#002b73" : "#ffffff";
  const userBubbleBg = colors.primary;
  const userTextColor = isDark ? "#002b73" : "#ffffff";
  const betaBadgeBg = isDark ? "rgba(178,197,255,0.1)" : colors.primaryDim;
  const betaBadgeBorder = isDark ? "rgba(178,197,255,0.25)" : colors.primaryBorder;
  const overlayBg = "rgba(0,0,0,0.6)";

  const markdownStyles = StyleSheet.create({
    body: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 22,
    },
    strong: {
      color: colors.primary,
      fontWeight: "700",
    },
    em: {
      color: colors.textPrimary,
      fontStyle: "italic",
    },
    heading1: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 6,
      marginTop: 4,
    },
    heading2: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 4,
      marginTop: 4,
    },
    heading3: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 4,
      marginTop: 4,
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 2,
    },
    bullet_list_icon: {
      color: colors.primary,
      marginRight: 6,
    },
    code_inline: {
      backgroundColor: inputBg,
      color: colors.primary,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 13,
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    fence: {
      backgroundColor: inputBg,
      borderRadius: 8,
      padding: 12,
      marginVertical: 6,
    },
    code_block: {
      color: colors.primary,
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 13,
    },
    blockquote: {
      backgroundColor: colors.primaryDim,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      paddingLeft: 10,
      marginVertical: 6,
    },
    hr: {
      backgroundColor: dividerColor,
      height: 1,
      marginVertical: 8,
    },
    link: {
      color: colors.primary,
      textDecorationLine: "underline",
    },
    paragraph: {
      marginVertical: 0,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <KeyboardAvoidingView
        style={[s.overlay, { backgroundColor: overlayBg }]}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom : 0}
      >
        <View style={[s.sheet, { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom, backgroundColor: sheetBg }]}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.headerIcon}>🤖</Text>
              <View>
                <Text style={[s.headerTitle, { color: headerTitleColor }]}>AI Coach</Text>
                <Text style={[s.headerSub, { color: headerSubColor }]}>Asistente del Mundial</Text>
              </View>
            </View>
            <View style={s.headerRight}>
              <View style={[s.betaBadge, { backgroundColor: betaBadgeBg, borderColor: betaBadgeBorder }]}>
                <Text style={[s.betaText, { color: colors.primary }]}>Beta</Text>
              </View>
              <TouchableOpacity style={[s.closeBtn, { backgroundColor: closeBtnBg }]} onPress={onClose}>
                <Text style={[s.closeBtnText, { color: closeBtnTextColor }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[s.divider, { backgroundColor: dividerColor }]} />

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={s.messages}
            contentContainerStyle={s.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  s.bubbleWrapper,
                  msg.role === "user"
                    ? s.bubbleWrapperUser
                    : s.bubbleWrapperBot,
                ]}
              >
                {msg.role === "bot" ? (
                  <View style={[s.botBubble, { backgroundColor: botBubbleBg }]}>
                    <Markdown style={markdownStyles}>{msg.text}</Markdown>
                  </View>
                ) : (
                  <View style={[s.userBubble, { backgroundColor: userBubbleBg }]}>
                    <Text style={[s.userText, { color: userTextColor }]}>{msg.text}</Text>
                  </View>
                )}
              </View>
            ))}

            {loading && (
              <View style={s.bubbleWrapperBot}>
                <View style={[s.botBubble, s.loadingBubble, { backgroundColor: botBubbleBg }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={[s.inputRow, { borderTopColor: dividerColor }]}>
            <TextInput
              style={[s.input, { backgroundColor: inputBg, color: colors.textPrimary, borderColor: inputBorderColor }]}
              placeholder="Pregunta al AI Coach..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
              multiline
            />
            <TouchableOpacity
              style={[s.sendBtn, { backgroundColor: sendBtnBg }, loading && s.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={sendBtnTextColor} />
              ) : (
                <Text style={[s.sendIcon, { color: sendBtnTextColor }]}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  headerSub: {
    fontSize: 11,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  betaBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  betaText: {
    fontSize: 9,
    fontWeight: "700",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 0.5,
    marginHorizontal: 20,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  bubbleWrapper: {
    flexDirection: "row",
  },
  bubbleWrapperBot: {
    justifyContent: "flex-start",
  },
  bubbleWrapperUser: {
    justifyContent: "flex-end",
  },
  botBubble: {
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  loadingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  userBubble: {
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  userText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 0.5,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: "800",
  },
});
