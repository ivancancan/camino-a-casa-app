import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
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

  useEffect(() => {
    const fetchSessionAndMessages = async () => {
      const session = await getSession();
      setUserId(session.user.id);
      setToken(session.token);

      // 🔔 Marcar como leídos todos los mensajes en esta conversación
      await fetch(`${API_BASE}/api/messages/conversations/${conversationId}/mark-read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      fetchMessages(session.token);
    };

    fetchSessionAndMessages();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: `${adopterName} 🐶 ${petName}`,
    });
  }, [navigation, adopterName, petName]);

  const fetchMessages = async (tokenOverride = token) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${tokenOverride}`,
        },
      });
      const data = await res.json();
      setMessages(data);
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
      fetchMessages();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender_id === userId ? styles.sent : styles.received,
      ]}
    >
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
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
    backgroundColor: '#e0bbff',
    alignSelf: 'flex-start',
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
