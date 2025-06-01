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
import { useFocusEffect } from '@react-navigation/native';

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

      const json = await res.json();
      setConversations(json.data || []);
    } catch (err) {
      console.error('❌ Error fetching conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  const renderItem = ({ item }) => {
    const { pet, otherUser, lastMessage, hasUnreadMessages } = item;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            conversationId: item.id,
            adopterName: otherUser.nombre,
            petName: pet.nombre,
          })
        }
      >
        <Image source={{ uri: otherUser.foto }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text
              style={[
                styles.name,
                hasUnreadMessages && styles.unreadText,
              ]}
            >
              {otherUser.nombre}
            </Text>
            {hasUnreadMessages && <View style={styles.unreadDot} />}
          </View>
          <Text
            numberOfLines={1}
            style={[
              styles.message,
              hasUnreadMessages && styles.unreadText,
            ]}
          >
            {lastMessage || 'Sin mensajes aún.'}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
    marginLeft: 8,
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
