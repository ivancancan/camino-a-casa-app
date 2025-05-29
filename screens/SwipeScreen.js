import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Text as RNText,
  Alert,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Text } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function SwipeScreen() {
  console.clear();
  console.log('🧭 Renderizando SwipeScreen...');

  const [pets, setPets] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('👀 useEffect se ejecutó');
    console.log(`🛰️ Endpoint de sugerencias: ${API_BASE}/api/swipes/suggestions`);

    const fetchSuggestions = async () => {
      const session = await getSession();

      if (!session) {
        Alert.alert('Sesión expirada', 'Por favor inicia sesión de nuevo.');
        return;
      }

      console.log(`📦 Session: user=${session?.user?.name}, role=${session?.user?.role}, token=${session?.token?.slice(0, 10)}...`);

      const { token, user } = session;

      try {
        const res = await fetch(`${API_BASE}/api/swipes/suggestions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        console.log('🔍 Respuesta cruda Swipe:', text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error('❌ Error parseando respuesta Swipe:', err);
          Alert.alert('Error', 'Respuesta inválida del servidor');
          return;
        }

        if (res.ok) {
          if (!Array.isArray(data)) {
            Alert.alert('Error', 'No se encontraron mascotas o tu perfil está incompleto.');
            return;
          }

          setPets(data);
        } else {
          Alert.alert('Error', data.error || 'No se pudieron cargar sugerencias');
        }
      } catch (err) {
        console.error('❌ Error de red al cargar sugerencias:', err);
        Alert.alert('Error', 'Fallo al conectar con el servidor');
      }
    };

    fetchSuggestions();
  }, []);

  const showFeedback = (message) => {
    setFeedback(message);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const registerSwipe = async (petId, interested) => {
    const session = await getSession();
    if (!session) return;

    const { token, user } = session;

    try {
      const response = await fetch(`${API_BASE}/api/swipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adopterId: user.id,
          petId,
          interested,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al registrar swipe:', errorData);
      } else {
        const respData = await response.json();
        console.log('Swipe registrado:', respData);
      }
    } catch (err) {
      console.error('❌ Error al registrar swipe:', err);
    }
  };

  const handleSwipeRight = (index) => {
    if (!pets[index]) return;
    showFeedback('💚 Me interesa');
    registerSwipe(pets[index].id, true);
  };

  const handleSwipeLeft = (index) => {
    if (!pets[index]) return;
    showFeedback('❌ No me interesa');
    registerSwipe(pets[index].id, false);
  };

  return (
    <View style={styles.container}>
      {cardIndex < pets.length ? (
        <Swiper
          cards={pets}
          cardIndex={cardIndex}
          renderCard={(pet) => (
            <View style={styles.card}>
              <Image
                source={{
  uri: pet.fotos?.[0]?.startsWith('data:image')
    ? pet.fotos[0]
    : `data:image/jpeg;base64,${pet.fotos?.[0]}`,
}}
                style={styles.image}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{pet.nombre}</Text>
                <Text style={styles.age}>{pet.edad}</Text>
              </View>
            </View>
          )}
          onSwipedRight={handleSwipeRight}
          onSwipedLeft={handleSwipeLeft}
          onSwiped={(index) => setCardIndex(index + 1)}
          stackSize={3}
          backgroundColor="transparent"
          animateCardOpacity
        />
      ) : (
        <View style={styles.noMoreContainer}>
          <Text style={styles.noMoreText}>
            🐾 No hay más mascotas en tu filtro por ahora
          </Text>
        </View>
      )}

      <Animated.View style={[styles.feedback, { opacity: fadeAnim }]}>
        <RNText style={styles.feedbackText}>{feedback}</RNText>
      </Animated.View>
    </View>
  );
}

const CARD_HEIGHT = Dimensions.get('window').height * 0.6;
const CARD_WIDTH = Dimensions.get('window').width * 0.9;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    alignSelf: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  age: {
    fontSize: 18,
    color: '#777',
    marginTop: 5,
  },
  feedback: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#000000aa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  feedbackText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  noMoreContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noMoreText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
