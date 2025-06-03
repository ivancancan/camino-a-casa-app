import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { Image } from 'expo-image';

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

    const avatarUri = otherUser.foto?.startsWith('http')
      ? otherUser.foto
      : 'https://via.placeholder.com/100x100.png?text=Usuario';

    const petPhoto = pet.fotos?.[0]?.startsWith('http')
      ? pet.fotos[0]
      : 'https://via.placeholder.com/100x100.png?text=Mascota';

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
        <Image
          source={avatarUri}
          style={styles.avatar}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={[styles.name, hasUnreadMessages && styles.unreadText]}>
              {otherUser.nombre}
            </Text>
            {hasUnreadMessages && <View style={styles.unreadDot} />}
          </View>
          <Text
            numberOfLines={1}
            style={[styles.message, hasUnreadMessages && styles.unreadText]}
          >
            {lastMessage || 'Sin mensajes aún.'}
          </Text>
        </View>
        <Image
          source={petPhoto}
          style={styles.petImage}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.noMessagesText}>🐾 No tienes conversaciones activas aún</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
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
    fontSize: 16,
    textAlign: 'center',
  },
  noMessagesText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});
