import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Card, Text, Avatar, Button } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { API_BASE } from '../services/Api';
import { getSession } from '../services/sessionService';

export default function AdopterMatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      const res = await fetch(`${API_BASE}/api/matches/adopter/confirmed`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const data = await res.json();
      setMatches(data || []);
    } catch (err) {
      console.error('❌ Error en fetchMatches:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchMatches();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const markMatchesAsSeen = async () => {
        try {
          const session = await getSession();
          await fetch(`${API_BASE}/api/matches/mark-seen`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          });
        } catch (err) {
          console.error('❌ Error al marcar matches como vistos:', err);
        }
      };

      markMatchesAsSeen();
    }, [])
  );

  const resolveImage = (foto) => {
    if (!foto) return 'https://via.placeholder.com/300x300.png?text=Mascota';
    if (foto.startsWith('http') || foto.startsWith('data:image')) return foto;
    return `data:image/jpeg;base64,${foto}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (!matches.length) {
    return (
      <SafeAreaView style={styles.noMatchesContainer}>
        <Text style={styles.noMoreText}>🐾 Aún no tienes matches confirmados</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const pet = item.pets || {};
          let owner = pet.users;

          if (Array.isArray(owner)) owner = owner[0];
          owner = owner || {};

          const petPhoto = resolveImage(pet.fotos?.[0]);
          const ownerPhoto = owner?.giver_profiles?.foto;
          const ownerName =
            owner.nombre?.trim() || owner.name?.trim() || 'Sin nombre';
          const isAdopted = pet.status?.toLowerCase?.() === 'adoptado';

          return (
            <Card key={item.id} style={styles.card} elevation={4}>
              <Image
                source={petPhoto}
                style={styles.petImage}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />
              <Card.Title
                title={pet.nombre || 'Sin nombre'}
                subtitle={`Descripción: ${pet.descripcion || 'Sin descripción'}`}
                left={(props) =>
                  ownerPhoto ? (
                    <Image
                      source={ownerPhoto}
                      style={styles.avatar}
                      contentFit="cover"
                      transition={300}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <Avatar.Text {...props} label={ownerName.charAt(0)} />
                  )
                }
                right={() =>
                  isAdopted && (
                    <View style={styles.adoptedBadge}>
                      <Text style={styles.adoptedText}>Adoptado</Text>
                    </View>
                  )
                }
              />
              <Card.Content>
                <Text style={styles.ownerName}>Dueño: {ownerName}</Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  mode="contained"
                  onPress={async () => {
                    try {
                      const session = await getSession();
                      const res = await fetch(
                        `${API_BASE}/api/matches/create-conversation/${item.id}`,
                        {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${session.token}`,
                          },
                        }
                      );
                      const result = await res.json();
                      const conversationId =
                        result.conversation?.id || result.id;

                      if (!conversationId) {
                        console.warn('❌ No se obtuvo conversationId');
                        return;
                      }

                      navigation.navigate('ChatScreen', {
                        conversationId,
                        adopterName: session.user.name,
                        petName: pet.nombre || 'Mascota',
                      });
                    } catch (err) {
                      console.error('❌ Error al iniciar chat:', err.message);
                    }
                  }}
                  style={styles.button}
                >
                  Mandar mensaje
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    elevation: 4,
    borderRadius: 10,
  },
  petImage: {
    height: 200,
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 15,
  },
  ownerName: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  button: {
    marginLeft: 'auto',
    marginRight: 12,
  },
  adoptedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  adoptedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noMoreText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
