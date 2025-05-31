import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Card, Text, Avatar, Button } from 'react-native-paper';
import { API_BASE } from '../services/Api';
import { getSession } from '../services/sessionService';
import { useNavigation } from '@react-navigation/native';

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

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  if (!matches.length)
    return (
      <Text style={{ margin: 20, textAlign: 'center' }}>
        Aún no tienes matches confirmados 🐾
      </Text>
    );

  const resolveImage = (foto) => {
    if (!foto) return 'https://via.placeholder.com/300x300.png?text=Mascota';
    if (foto.startsWith('http') || foto.startsWith('data:image')) return foto;
    return `data:image/jpeg;base64,${foto}`;
  };

  return (
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

        return (
          <Card key={item.id} style={styles.card} elevation={4}>
            <Card.Cover source={{ uri: petPhoto }} style={styles.petImage} />
            <Card.Title
              title={pet.nombre || 'Sin nombre'}
              subtitle={`Descripción: ${pet.descripcion || 'Sin descripción'}`}
              left={(props) =>
                ownerPhoto ? (
                  <Avatar.Image {...props} source={{ uri: ownerPhoto }} />
                ) : (
                  <Avatar.Text {...props} label={ownerName.charAt(0)} />
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
       console.log('🔘 Botón presionado'); // ✅
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
    console.log('🧪 Resultado de create-conversation:', result); // 👈 DEBUG

   const conversationId = result.conversation?.id || result.id;


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
  },
  ownerName: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  button: {
    marginLeft: 'auto',
    marginRight: 12,
  },
});
