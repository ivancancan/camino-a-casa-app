import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function InterestedUsersScreen({ route }) {
  const { petId } = route.params;
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterested = async () => {
    setLoading(true);
    try {
      const { token } = await getSession();
      const response = await fetch(`${API_BASE}/api/swipes/interested/${petId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setInterestedUsers(data);
      } else {
        Alert.alert('Error', data.error || 'No se pudieron cargar interesados');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la información');
    } finally {
      setLoading(false);
    }
  };

  const respondToInterest = async (adopterId, accepted) => {
    try {
      const { token } = await getSession();
      const response = await fetch(`${API_BASE}/api/swipes/confirm-match`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adopterId, petId, accepted }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('✅', accepted ? 'Match confirmado' : 'Interesado rechazado');
        fetchInterested(); // refrescar la lista
      } else {
        Alert.alert('Error', data.error || 'No se pudo guardar la respuesta');
      }
    } catch (err) {
      Alert.alert('Error', 'Fallo al procesar la respuesta');
    }
  };

  useEffect(() => {
    fetchInterested();
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.adopter_id.name || 'Adoptante'}
        subtitle={`ID: ${item.adopter_id.id}`}
      />
      <Card.Actions style={styles.actions}>
        <Button mode="contained" onPress={() => respondToInterest(item.adopter_id.id, true)}>
          Aceptar
        </Button>
        <Button mode="outlined" onPress={() => respondToInterest(item.adopter_id.id, false)}>
          Rechazar
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : interestedUsers.length === 0 ? (
        <Text style={styles.empty}>Nadie ha mostrado interés todavía.</Text>
      ) : (
        <FlatList
          data={interestedUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 3,
    borderRadius: 10,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  empty: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
