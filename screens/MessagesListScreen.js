import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function MessagesListScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchConversations = async () => {
    setLoading(true);
    const session = await getSession();
    const token = session?.token;

    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('⚠️ Respuesta inesperada (no JSON):', text);
        throw new Error('Respuesta no es JSON');
      }

      const json = await res.json();
      setConversations(json.data || []);
    } catch (err) {
      console.error('❌ Error fetching conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  const renderItem = ({ item }) => {
    const { pet, otherUser, lastMessage } = item;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            pet,
            user: otherUser,
            conversationId: item.id,
          })
        }
      >
        <Image source={{ uri: otherUser.foto }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{otherUser.nombre}</Text>
          <Text numberOfLines={1} style={styles.message}>
            {lastMessage}
          </Text>
        </View>
        <Image source={{ uri: pet.fotos?.[0] }} style={styles.petImage} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Cargando mensajes...</Text>
      ) : conversations.length === 0 ? (
        <Text style={styles.emptyText}>No tienes conversaciones activas aún.</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: '#555',
    fontSize: 14,
    marginTop: 2,
  },
  petImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginLeft: 10,
  },
  loadingText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
});
