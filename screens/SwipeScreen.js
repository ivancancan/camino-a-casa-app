import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Alert, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HEIGHT = Dimensions.get('window').height * 0.75;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

export default function SwipeScreen() {
  const [pets, setPets] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchPets = useCallback(async () => {
    const session = await getSession();
    if (!session) {
      Alert.alert('Sesión expirada', 'Inicia sesión de nuevo.');
      return;
    }

    const { token } = session;

    try {
      const res = await fetch(`${API_BASE}/api/swipes/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('❌ Error parseando JSON:', text);
        Alert.alert('Error', 'Respuesta inválida del servidor');
        return;
      }

      if (!Array.isArray(data)) {
        Alert.alert('Error', data?.error || 'No se encontraron mascotas o tu perfil está incompleto.');
        setPets([]);
        return;
      }

      const parsed = data.map((p) => ({
        ...p,
        fotos:
          typeof p.fotos === 'string'
            ? JSON.parse(p.fotos)
            : Array.isArray(p.fotos)
            ? p.fotos
            : [],
      }));

      setPets(parsed);
      setIndex(0);
    } catch (err) {
      console.error('❌ Error al cargar mascotas:', err);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleSwipe = async (action) => {
    const session = await getSession();
    const { token, user } = session;
    const pet = pets[index];
    if (!pet) return;

    try {
      await fetch(`${API_BASE}/api/swipes/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adopterId: user.id, petId: pet.id }),
      });
    } catch (err) {
      console.error(`❌ Error en ${action}:`, err);
    }

    // Pasar al siguiente con pequeña pausa para UX
    setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, 100);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  if (!loading && pets.length === 0) {
    return (
      <View style={styles.noMore}>
        <Text style={styles.noMoreText}>🐾 No hay más mascotas</Text>
      </View>
    );
  }

  const pet = pets[index];
  if (!pet) {
    return (
      <View style={styles.noMore}>
        <Text style={styles.noMoreText}>🐾 Has visto todas las mascotas</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('PetDetail', { pet })}
      >
        <Image
          source={{ uri: pet.fotos?.[0] }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
        <LinearGradient colors={['transparent', '#000']} style={styles.gradient} />
        <View style={styles.textOverlay}>
          <Text style={styles.name}>{pet.nombre}</Text>
          <Text style={styles.info}>
            {pet.edad} años – {pet.talla}
          </Text>
        </View>
      </Pressable>

      <View style={styles.buttonsContainer}>
        <MaterialCommunityIcons
          name="close-circle-outline"
          size={64}
          color="#FF4C4C"
          onPress={() => handleSwipe('dislike')}
        />
        <MaterialCommunityIcons
          name="heart-circle-outline"
          size={64}
          color="#4CAF50"
          onPress={() => handleSwipe('like')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  card: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    height: '35%',
    width: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    fontSize: 18,
    color: '#eee',
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 40,
  },
  noMore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMoreText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
