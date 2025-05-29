import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function ConfirmedMatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderItem = ({ item }) => {
    const adopter = item.adopter_profiles;
    const pet = item.pets;

    return (
      <Card style={styles.card}>
        <Card.Title title={`Match con ${adopter?.nombre || 'Adoptante'}`} />
        <Card.Content>
          <Text style={styles.subtitle}>Mascota: {pet?.nombre}</Text>
          <Image
            source={{ uri: pet?.fotos?.[0] || 'https://via.placeholder.com/300x300.png?text=Mascota' }}
            style={styles.image}
          />
          <Text>Adoptante: {adopter?.nombre}</Text>
          <Text>Contacto: {adopter?.telefono}</Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => console.log('Ver perfil')}>Ver perfil</Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchMatches} />
        }
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No tienes matches confirmados aún.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  image: {
    height: 180,
    width: '100%',
    marginVertical: 10,
    borderRadius: 8,
  },
  subtitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});
