import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { Image } from 'expo-image';

export default function GiverDashboardScreen({ navigation }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPets = async () => {
    setLoading(true);
    try {
      const { token } = await getSession();
      const response = await fetch(`${API_BASE}/api/pets/mine/with-interest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPets(data.pets || []);
      } else {
        Alert.alert('Error', data.error || 'No se pudieron cargar tus mascotas');
      }
    } catch (err) {
      Alert.alert('Error', 'Fallo al cargar mascotas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchMyPets);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (petId) => {
    Alert.alert(
      'Confirmar borrado',
      '¿Seguro que quieres borrar esta mascota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { token } = await getSession();
              const response = await fetch(`${API_BASE}/api/pets/${petId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              if (response.ok) {
                Alert.alert('Éxito', 'Mascota borrada');
                fetchMyPets();
              } else {
                Alert.alert('Error', data.error || 'No se pudo borrar la mascota');
              }
            } catch (err) {
              Alert.alert('Error', 'Fallo al borrar la mascota');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsAdopted = async (petId) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que esta mascota ya fue adoptada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const { token } = await getSession();
              const response = await fetch(`${API_BASE}/api/pets/${petId}/mark-adopted`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              if (response.ok) {
                Alert.alert('Éxito', 'Mascota marcada como adoptada');
                fetchMyPets();
              } else {
                Alert.alert('Error', data.error || 'No se pudo actualizar el estado');
              }
            } catch (err) {
              Alert.alert('Error', 'Fallo al actualizar el estado');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsAvailable = async (petId) => {
    Alert.alert(
      'Confirmar',
      '¿Quieres volver a poner esta mascota como disponible?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              const { token } = await getSession();
              const response = await fetch(`${API_BASE}/api/pets/${petId}/mark-available`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              if (response.ok) {
                Alert.alert('Éxito', 'La mascota está nuevamente disponible');
                fetchMyPets();
              } else {
                Alert.alert('Error', data.error || 'No se pudo actualizar el estado');
              }
            } catch (err) {
              Alert.alert('Error', 'Fallo al actualizar el estado');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Card
      key={item.id}
      style={[
        styles.card,
        item.status === 'adoptado' && styles.cardAdoptedBorder,
      ]}
      onPress={() => navigation.navigate('PetDetail', { pet: item })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={item.fotos?.[0] || 'https://via.placeholder.com/300x300.png?text=Mascota'}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
        {item.status === 'adoptado' && (
          <View style={styles.adoptedBanner}>
            <Text style={styles.adoptedText}>ADOPTADO</Text>
          </View>
        )}
        {item.interesados > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('InterestedUsers', { petId: item.id })}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>{item.interesados}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardSubtitle}>{`${item.edad} años • ${item.talla}`}</Text>
        </View>
        {item.status === 'adoptado' ? (
          <TouchableOpacity onPress={() => handleMarkAsAvailable(item.id)}>
            <Text style={[styles.actionText, { color: '#000' }]}>Marcar como Disponible</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => handleMarkAsAdopted(item.id)}>
            <Text style={[styles.actionText, { color: '#007AFF' }]}>Marcar como Adoptado</Text>
          </TouchableOpacity>
        )}
        <IconButton
          icon="delete"
          iconColor="red"
          onPress={() => handleDelete(item.id)}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {pets.length === 0 && !loading ? (
          <Text style={styles.noPetsText}>No tienes mascotas publicadas.</Text>
        ) : (
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchMyPets} />
            }
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatListContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 4,
    borderRadius: 10,
  },
  cardAdoptedBorder: {
    borderWidth: 2,
    borderColor: 'green',
  },
  noPetsText: {
    marginTop: 40,
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#8e24aa',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  adoptedBanner: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 128, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  adoptedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  textContainer: {
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  actionText: {
    fontWeight: 'bold',
    marginRight: 10,
  },
});
