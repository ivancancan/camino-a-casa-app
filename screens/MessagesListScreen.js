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
import { useNavigation } from '@react-navigation/native';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONV_CACHE_KEY = 'cached_conversations';

const cleanUrl = (url) => {
  if (!url) return '';
  return url.split('?')[0];
};

export default function MessagesListScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchConversations = async () => {
    const session = await getSession();
    const token = session?.token;

    try {
      const res = await fetch(`${API_BASE}/api/messages/user/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Error del backend (${res.status}):`, errorText);
        return;
      }

      const json = await res.json();
      const fresh = Array.isArray(json.data) ? json.data : [];

      setConversations(fresh);
      await AsyncStorage.setItem(CONV_CACHE_KEY, JSON.stringify(fresh));
    } catch (err) {
      console.error('❌ Error fetching conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ⚡ Carga inicial: primero cache y luego fetch
  useEffect(() => {
    const loadFromCacheThenFetch = async () => {
      try {
        const cached = await AsyncStorage.getItem(CONV_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setConversations(parsed);
            setLoading(false); // Evita mostrar loader si hay cache
          }
        }
      } catch (e) {
        console.warn('⚠️ Error leyendo cache local', e);
      }

      // Luego busca datos frescos
      fetchConversations();
    };

    loadFromCacheThenFetch();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, []);

  const renderItem = ({ item }) => {
    const { pet, otherUser, lastMessage, hasUnreadMessages } = item;

    const avatarUri = cleanUrl(
      otherUser.foto?.startsWith('http')
        ? otherUser.foto
        : 'https://via.placeholder.com/100x100.png?text=Usuario'
    );

    const petPhoto = cleanUrl(
      pet.fotos?.[0]?.startsWith('http')
        ? pet.fotos[0]
        : 'https://via.placeholder.com/100x100.png?text=Mascota'
    );

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
          source={{ uri: avatarUri }}
          style={styles.avatar}
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
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
  {lastMessage?.trim().length > 0 ? lastMessage : 'Sin mensajes aún.'}
</Text>

        </View>
        <Image
          source={{ uri: petPhoto }}
          style={styles.petImage}
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
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
          <Text style={styles.noMessagesText}>
            🐾 No tienes conversaciones activas aún{"\n"}
            Empieza adoptando o publicando una mascota
          </Text>
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
