import { useRef, useState } from "react";
import {
  ActivityIndicator,
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

interface Message {
  role: "bot" | "user";
  text: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ visible, onClose }: Props) {
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
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <KeyboardAvoidingView
          style={s.sheet}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.headerIcon}>🤖</Text>
              <View>
                <Text style={s.headerTitle}>AI Coach</Text>
                <Text style={s.headerSub}>Asistente del Mundial</Text>
              </View>
            </View>
            <View style={s.headerRight}>
              <View style={s.betaBadge}>
                <Text style={s.betaText}>Beta</Text>
              </View>
              <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.divider} />

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={s.messages}
            contentContainerStyle={s.messagesContent}
            showsVerticalScrollIndicator={false}
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
                  <View style={s.botBubble}>
                    <Markdown style={markdownStyles}>{msg.text}</Markdown>
                  </View>
                ) : (
                  <View style={s.userBubble}>
                    <Text style={s.userText}>{msg.text}</Text>
                  </View>
                )}
              </View>
            ))}

            {loading && (
              <View style={s.bubbleWrapperBot}>
                <View style={[s.botBubble, s.loadingBubble]}>
                  <ActivityIndicator size="small" color="#b2c5ff" />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Pregunta al AI Coach..."
              placeholderTextColor="#424655"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[s.sendBtn, loading && s.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0d0f1a" />
              ) : (
                <Text style={s.sendIcon}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0d1b2e",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    borderTopWidth: 0.5,
    borderColor: "#1f2a3d",
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
    color: "#d7e3fc",
    fontSize: 17,
    fontWeight: "800",
  },
  headerSub: {
    color: "#8c90a1",
    fontSize: 11,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  betaBadge: {
    backgroundColor: "rgba(178,197,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(178,197,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  betaText: {
    color: "#b2c5ff",
    fontSize: 9,
    fontWeight: "700",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1f2a3d",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#8c90a1",
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#1f2a3d",
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
    backgroundColor: "#1a2740",
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
    backgroundColor: "#b2c5ff",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  userText: {
    color: "#002b73",
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
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 0.5,
    borderTopColor: "#1f2a3d",
  },
  input: {
    flex: 1,
    backgroundColor: "#0a1525",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#d7e3fc",
    fontSize: 14,
    borderWidth: 0.5,
    borderColor: "#1f2a3d",
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#b2c5ff",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    color: "#002b73",
    fontSize: 18,
    fontWeight: "800",
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: "#d7e3fc",
    fontSize: 14,
    lineHeight: 22,
  },
  strong: {
    color: "#b2c5ff",
    fontWeight: "700",
  },
  em: {
    color: "#d7e3fc",
    fontStyle: "italic",
  },
  heading1: {
    color: "#d7e3fc",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 4,
  },
  heading2: {
    color: "#d7e3fc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 4,
  },
  heading3: {
    color: "#b2c5ff",
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
    color: "#d7e3fc",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 2,
  },
  bullet_list_icon: {
    color: "#b2c5ff",
    marginRight: 6,
  },
  code_inline: {
    backgroundColor: "#0a1525",
    color: "#b2c5ff",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: "#0a1525",
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  code_block: {
    color: "#b2c5ff",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
  },
  blockquote: {
    backgroundColor: "rgba(178,197,255,0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#b2c5ff",
    paddingLeft: 10,
    marginVertical: 6,
  },
  hr: {
    backgroundColor: "#1f2a3d",
    height: 1,
    marginVertical: 8,
  },
  link: {
    color: "#b2c5ff",
    textDecorationLine: "underline",
  },
  paragraph: {
    marginVertical: 0,
  },
});
