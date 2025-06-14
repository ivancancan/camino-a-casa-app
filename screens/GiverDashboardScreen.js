import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function GiverDashboardScreen() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchPets = useCallback(async () => {
    try {
      const { token } = await getSession();
      const res = await fetch(`${API_BASE}/api/giver/pets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setPets(data);
      } else {
        console.warn('⚠️ No se recibió un array:', data);
        setPets([]);
      }
    } catch (err) {
      console.error('❌ Error al cargar mascotas del giver:', err);
      setPets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPets();
  }, [fetchPets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPets();
  }, [fetchPets]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PetDetail', { pet: item })}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.fotos?.[0] }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
        {(item.nuevosInteresados ?? 0) > 0 && (
          <TouchableOpacity
            style={styles.badge}
            onPress={() => navigation.navigate('InterestedUsers', { petId: item.id })}
          >
            <Text style={styles.badgeText}>
              {item.nuevosInteresados > 9 ? '9+' : item.nuevosInteresados}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.status}>
          Estado: {item.estado || 'Disponible'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#a259ff']}
            tintColor="#a259ff"
            title="Actualizando..."
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No tienes mascotas registradas.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
    paddingTop: 8, // Para dar un poco más de aire abajo del status bar
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#a259ff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardContent: {
    padding: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#777',
    fontSize: 16,
  },
});
