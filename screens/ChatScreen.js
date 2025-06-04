import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { API_BASE } from '../services/Api';
import { getSession } from '../services/sessionService';

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId, adopterName, petName } = route.params;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const flatListRef = useRef(null); // Ref para scroll automático

  useEffect(() => {
    const initSession = async () => {
      const session = await getSession();
      setUserId(session.user.id);
      setToken(session.token);
    };
    initSession();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const markAndFetch = async () => {
        try {
          const session = await getSession();

          await fetch(`${API_BASE}/api/messages/${conversationId}/mark-read`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          });

          fetchMessages(session.token);
        } catch (err) {
          console.error('❌ Error al marcar mensajes como leídos:', err.message);
        }
      };

      markAndFetch();
    }, [conversationId])
  );

  useEffect(() => {
    navigation.setOptions({
      title: `${adopterName} 🐶 ${petName}`,
    });
  }, [navigation, adopterName, petName]);

  const fetchMessages = async (tokenOverride = token) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${tokenOverride}`,
        },
      });
      const data = await res.json();
      setMessages(data);

      // Esperar render y luego hacer scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: newMessage,
        }),
      });

      setNewMessage('');
      fetchMessages(); // Scroll automático ya incluido
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  const renderItem = ({ item }) => {
    if (item.sender_id === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemText}>{item.message}</Text>
        </View>
      );
    }

    const isMyMessage = item.sender_id === userId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.sent : styles.received,
        ]}
      >
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <Button title="Enviar" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  messageBubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 16,
    maxWidth: '80%',
  },
  sent: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: '#e6d3f5',
    alignSelf: 'flex-start',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  systemText: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 13,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});
