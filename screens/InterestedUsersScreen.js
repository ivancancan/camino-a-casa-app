import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

export default function InterestedUsersScreen({ route }) {
  const { petId } = route.params;
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchInterested = async () => {
    setLoading(true);
    try {
      const { token } = await getSession();
      const response = await fetch(`${API_BASE}/api/giver/pet/${petId}/interested`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      console.log('🐶 Interested Users:', data);

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

  const respondToInterest = async (swipeId, accepted) => {
    try {
      const { token } = await getSession();
      const response = await fetch(`${API_BASE}/api/giver/swipe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ swipeId, accepted }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('✅', accepted ? 'Match confirmado' : 'Interesado rechazado');
        fetchInterested();
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

  const renderItem = ({ item }) => {
    const { adopter, adopter_profile } = item;

    const avatarUri =
      adopter_profile?.foto && adopter_profile.foto.includes('http')
        ? adopter_profile.foto
        : 'https://via.placeholder.com/100x100.png?text=Foto';

    return (
      <Card style={styles.card}>
        <Card.Title
          title={adopter?.name || 'Adoptante'}
          subtitle={`ID: ${adopter?.id}`}
          left={() => (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
            />
          )}
        />
        <Card.Content>
          <Text style={styles.label}>Motivación:</Text>
          <Text style={styles.value}>
            {adopter_profile?.motivacion || 'No proporcionada'}
          </Text>
          <Text style={styles.label}>Preferencias:</Text>
          <Text style={styles.value}>
            Talla: {adopter_profile?.tallapreferida?.join(', ') || 'N/A'}{'\n'}
            Carácter: {adopter_profile?.caracterpreferido?.join(', ') || 'N/A'}{'\n'}
            Tiene otras mascotas: {adopter_profile?.tienemascotas || 'N/A'}{'\n'}
            Vivienda: {adopter_profile?.vivienda || 'No especificada'}
          </Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
onPress={() =>
  navigation.navigate('AdopterProfileDetail', {
    adopter: {
      ...adopter,
      adopter_profile: adopter_profile,
    },
  })
}
          >
            Ver perfil
          </Button>
          <Button
            mode="contained"
            onPress={() => respondToInterest(item.id, true)}
          >
            Aceptar
          </Button>
          <Button
            mode="outlined"
            onPress={() => respondToInterest(item.id, false)}
          >
            Rechazar
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : interestedUsers.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.emptyText}>🐾 Nadie ha mostrado interés todavía</Text>
        </View>
      ) : (
        <FlatList
          data={interestedUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
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
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
  },
  label: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  value: {
    marginBottom: 8,
    color: '#444',
  },
});
