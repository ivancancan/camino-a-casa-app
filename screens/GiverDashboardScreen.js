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
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const updateStatus = async (petId, nuevoEstado) => {
    try {
      const { token } = await getSession();
      const endpoint =
        nuevoEstado === 'adoptado'
          ? `${API_BASE}/api/pets/${petId}/mark-adopted`
          : `${API_BASE}/api/pets/${petId}/mark-available`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al actualizar estado');
      fetchPets();
    } catch (err) {
      console.error('❌ Error al actualizar estado de mascota:', err.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PetDetail', { pet: item })}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.fotos?.[0] }}
          style={[styles.image, item.status === 'adoptado' && styles.imageAdopted]}
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
        {item.status === 'adoptado' && (
          <View style={styles.adoptedBadge}>
            <Text style={styles.adoptedBadgeText}>Adoptado</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.details}>
          Estado: {item.status === 'adoptado' ? 'Adoptado' : 'Disponible'}
        </Text>

        <TouchableOpacity
          style={[
            styles.statusButton,
            item.status === 'adoptado' ? styles.buttonAvailable : styles.buttonAdopted,
          ]}
          onPress={() =>
            updateStatus(item.id, item.status === 'adoptado' ? 'disponible' : 'adoptado')
          }
        >
          <Text style={styles.statusButtonText}>
            {item.status === 'adoptado' ? 'Marcar como disponible' : 'Marcar como adoptado'}
          </Text>
        </TouchableOpacity>
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
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  imageAdopted: {
    opacity: 0.8,
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
  adoptedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  adoptedBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    padding: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonAdopted: {
    backgroundColor: '#4CAF50',
  },
  buttonAvailable: {
    backgroundColor: '#f59e0b',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
