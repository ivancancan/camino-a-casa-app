import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ConfirmedMatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const resolveImage = (foto) => {
    if (!foto || foto.length === 0)
      return 'https://via.placeholder.com/300x300.png?text=Mascota';
    if (foto.startsWith('http') || foto.startsWith('data:image')) return foto;
    return `data:image/jpeg;base64,${foto}`;
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { token } = await getSession();
      const res = await fetch(`${API_BASE}/api/matches/giver/confirmed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(data.matches || []);
      } else {
        console.error('Error:', data.error);
      }
    } catch (err) {
      console.error('Fallo al obtener matches confirmados:', err);
    } finally {
      setLoading(false);
    }
  };

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
          console.error('❌ Error al marcar matches como vistos (giver):', err);
        }
      };
      markMatchesAsSeen();
    }, [])
  );

  const renderItem = ({ item }) => {
    const adopterProfile = item.adopter_profiles || {};
    const adopterUser = adopterProfile.users || {};
    const pet = item.pets || {};

    const adopterName = adopterUser.name || 'Adoptante';
    const adopterPhoto = adopterProfile.foto;
    const petPhoto = resolveImage(pet.fotos?.[0]);
    const isAdopted = pet.status === 'adoptado';

    return (
      <Card style={styles.card} elevation={4}>
        <Card.Cover source={{ uri: petPhoto }} style={styles.petImage} />

        <Card.Content>
          <View style={styles.row}>
            {adopterPhoto ? (
              <Avatar.Image size={60} source={{ uri: adopterPhoto }} />
            ) : (
              <Avatar.Icon size={60} icon="account" />
            )}
            <View style={styles.adopterInfo}>
              <Text style={styles.adopterName}>{adopterName}</Text>
              {isAdopted && (
                <View style={styles.adoptedBadge}>
                  <Text style={styles.adoptedText}>Adoptado</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>Mascota: {pet.nombre || 'Sin nombre'}</Text>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            mode="contained"
            onPress={async () => {
              try {
                const { token } = await getSession();

                const response = await fetch(`${API_BASE}/api/matches/create-conversation/${item.id}`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                const result = await response.json();
                const conversationId = result.conversation?.id || result.id;

                if (!conversationId) {
                  console.error('No se pudo obtener conversationId');
                  return;
                }

                navigation.navigate('ChatScreen', {
                  conversationId,
                  adopterName,
                  petName: pet.nombre || 'Mascota',
                });
              } catch (error) {
                console.error('Error al iniciar chat:', error);
              }
            }}
            style={styles.button}
          >
            Mandar mensaje
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMatches} />}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No tienes matches confirmados aún.</Text>
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  petImage: { height: 200, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  adopterInfo: { marginLeft: 12 },
  adopterName: { fontSize: 20, fontWeight: 'bold' },
  petInfo: { marginTop: 16 },
  petName: { fontSize: 18, fontWeight: '600', color: '#333' },
  button: { marginLeft: 'auto', marginRight: 12 },
  emptyText: { marginTop: 50, textAlign: 'center', fontSize: 16, color: '#666' },
  adoptedBadge: {
    marginTop: 6,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  adoptedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
