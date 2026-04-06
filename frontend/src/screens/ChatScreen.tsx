import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../api/types';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { messages, loading, error, send, clearError } = useChat();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!token) {
      Alert.alert('Sin sesión', 'Inicia sesión para usar el chat.');
      return;
    }
    setInput('');
    await send(text);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.from === 'user';
    return (
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAgent]}>
        {!isUser && (
          <View style={s.agentIcon}>
            <MaterialIcons name="sports-soccer" size={14} color={colors.primary} />
          </View>
        )}
        <Text style={[s.bubbleText, isUser ? s.bubbleTextUser : s.bubbleTextAgent]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom + 8}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerIcon}>
          <MaterialIcons name="sports-soccer" size={22} color={colors.primary} />
        </View>
        <View>
          <Text style={s.headerTitle}>Agente Deportivo</Text>
          <Text style={s.headerSub}>Mundial 2026 · Análisis en tiempo real</Text>
        </View>
      </View>

      {/* Messages */}
      {messages.length === 0 && !loading ? (
        <View style={s.empty}>
          <MaterialIcons name="chat-bubble-outline" size={48} color={colors.outlineVariant} />
          <Text style={s.emptyTitle}>¿Quién gana hoy?</Text>
          <Text style={s.emptySub}>
            Pregúntame sobre partidos, estadísticas, rachas y más del Mundial 2026.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Typing indicator */}
      {loading && (
        <View style={s.typing}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={s.typingText}>Analizando...</Text>
        </View>
      )}

      {/* Input */}
      <View style={[s.inputRow, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={s.input}
          placeholder="¿Quién llega mejor al partido?"
          placeholderTextColor={colors.outline}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!loading}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <MaterialIcons name="send" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.surfaceContainerHigh,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.outlineVariant}33`,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  headerSub: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  emptySub: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  listContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerHigh,
    borderBottomLeftRadius: 4,
  },
  agentIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubbleText: { fontSize: 14, lineHeight: 20, flex: 1 },
  bubbleTextUser: { color: colors.onPrimary },
  bubbleTextAgent: { color: colors.onSurface },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  typingText: { fontSize: 12, color: colors.onSurfaceVariant },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.outlineVariant}33`,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.onSurface,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}4D`,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
