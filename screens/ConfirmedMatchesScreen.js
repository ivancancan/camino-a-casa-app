import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { useNavigation } from '@react-navigation/native';


export default function ConfirmedMatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Función para resolver imágenes base64 o url o colocar placeholder
  const resolveImage = (foto) => {
    if (!foto || foto.length === 0) return 'https://via.placeholder.com/300x300.png?text=Mascota';
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

  const renderItem = ({ item }) => {
    // Según el backend, adopter_profiles trae el perfil, y dentro está el user relacionado
    const adopterProfile = item.adopter_profiles || {};
    const adopterUser = adopterProfile.users || {};
    const pet = item.pets || {};

    const adopterName = adopterUser.name || 'Adoptante';
    const adopterPhoto = adopterProfile.foto;
    // Ya no usamos adopterPhone porque no existe
    const petPhoto = resolveImage(pet.fotos?.[0]);

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
              {/* Eliminado contacto porque no hay teléfono */}
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

    // Paso 1: crear conversación si no existe
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

    // Paso 2: navegar al ChatScreen
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
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMatches} />}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No tienes matches confirmados aún.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  petImage: { height: 200, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  adopterInfo: { marginLeft: 12 },
  adopterName: { fontSize: 20, fontWeight: 'bold' },
  petInfo: { marginTop: 16 },
  petName: { fontSize: 18, fontWeight: '600', color: '#333' },
  button: { marginLeft: 'auto', marginRight: 12 },
  emptyText: { marginTop: 50, textAlign: 'center', fontSize: 16, color: '#666' },
});
