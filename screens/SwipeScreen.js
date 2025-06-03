import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Text as RNText,
  Alert,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Text } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const PetCard = React.memo(({ pet, onPress }) => (
  <Pressable onPress={onPress}>
    <View style={styles.card}>
      <Image
        source={{ uri: pet?.fotos?.[0] || 'https://via.placeholder.com/300' }}
        style={styles.image}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
        placeholder={{ uri: 'https://via.placeholder.com/10/eeeeee/cccccc?text=.' }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.textOverlay}>
        <Text style={styles.name}>{pet.nombre}</Text>
        <Text style={styles.info}>{pet.edad} – {pet.talla}</Text>
      </View>
    </View>
  </Pressable>
));

export default function SwipeScreen() {
  const [pets, setPets] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const swiperRef = useRef(null);

  const fetchSuggestions = async () => {
    const session = await getSession();

    if (!session) {
      Alert.alert('Sesión expirada', 'Por favor inicia sesión de nuevo.');
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
        console.error('❌ Error parseando respuesta Swipe:', err);
        Alert.alert('Error', 'Respuesta inválida del servidor');
        return;
      }

      if (res.ok) {
        if (!Array.isArray(data)) {
          Alert.alert('Error', 'No se encontraron mascotas o tu perfil está incompleto.');
          return;
        }

        const petsParsed = data.map((p) => ({
          ...p,
          fotos:
            typeof p.fotos === 'string'
              ? JSON.parse(p.fotos)
              : Array.isArray(p.fotos)
              ? p.fotos
              : [],
        }));

        setPets(petsParsed);
        setCardIndex(0);
      } else {
        Alert.alert('Error', data.error || 'No se pudieron cargar sugerencias');
      }
    } catch (err) {
      console.error('❌ Error de red al cargar sugerencias:', err);
      Alert.alert('Error', 'Fallo al conectar con el servidor');
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    // Prefetch de imágenes próximas
    pets.slice(cardIndex + 1, cardIndex + 4).forEach((pet) => {
      if (pet?.fotos?.[0]) {
        Image.prefetch(pet.fotos[0]);
      }
    });
  }, [cardIndex, pets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSuggestions();
    setRefreshing(false);
  };

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {cardIndex < pets.length ? (
          <Swiper
            ref={swiperRef}
            cards={pets}
            cardIndex={cardIndex}
            renderCard={(pet) => (
              <PetCard
                pet={pet}
                onPress={() => navigation.navigate('PetDetail', { pet })}
              />
            )}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            onSwiped={(index) => setCardIndex(index + 1)}
            stackSize={3}
            backgroundColor="transparent"
            animateCardOpacity
            disableTopSwipe
            disableBottomSwipe
          />
        ) : (
          <View style={styles.noMoreContainer}>
            <Text style={styles.noMoreText}>🐾 No hay más mascotas en tu filtro por ahora</Text>
          </View>
        )}

        <Animated.View style={[styles.feedback, { opacity: fadeAnim }]}>
          <RNText style={styles.feedbackText}>{feedback}</RNText>
        </Animated.View>

        {cardIndex < pets.length && (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={40}
              color="red"
              onPress={() => {
                handleSwipeLeft(cardIndex);
                swiperRef.current?.swipeLeft();
              }}
            />
            <MaterialCommunityIcons
              name="heart-circle-outline"
              size={40}
              color="purple"
              onPress={() => {
                handleSwipeRight(cardIndex);
                swiperRef.current?.swipeRight();
              }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_HEIGHT = Dimensions.get('window').height * 0.7;
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
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  info: {
    fontSize: 18,
    color: '#eee',
    marginTop: 4,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  noMoreText: {
    fontSize: 18,
    textAlign: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    paddingBottom: 20,
  },
});
