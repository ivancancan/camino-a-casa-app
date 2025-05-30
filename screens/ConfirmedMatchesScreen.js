import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
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
      <Card style={styles.card} elevation={4}>
        {pet?.fotos?.[0] ? (
          <Card.Cover source={{ uri: pet.fotos[0] }} style={styles.petImage} />
        ) : (
          <View style={[styles.petImage, styles.petImagePlaceholder]}>
            <Text>No hay foto de mascota</Text>
          </View>
        )}

        <Card.Content>
          <View style={styles.row}>
            {adopter?.foto ? (
              <Avatar.Image size={60} source={{ uri: adopter.foto }} />
            ) : (
              <Avatar.Icon size={60} icon="account" />
            )}
            <View style={styles.adopterInfo}>
              <Text style={styles.adopterName}>{adopter?.nombre || 'Adoptante'}</Text>
              <Text style={styles.adopterContact}>Contacto: {adopter?.telefono || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>Mascota: {pet?.nombre}</Text>
          </View>
        </Card.Content>

        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => console.log('Ver perfil de adoptante', adopter)}
            style={styles.button}
          >
            Ver perfil
          </Button>
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
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  petImage: {
    height: 200,
    width: '100%',
  },
  petImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  adopterInfo: {
    marginLeft: 12,
  },
  adopterName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  adopterContact: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  petInfo: {
    marginTop: 16,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    marginLeft: 'auto',
    marginRight: 12,
  },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});
