import React, { useState } from 'react';
import {
  View,
  StyleSheet, // ✅ AÑADIDO AQUÍ
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text, Title, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { updateRoles } from '../services/authService';
import { saveSession, getSession } from '../services/sessionService';

export default function SelectRoleScreen({ navigation }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const adopterScale = useSharedValue(1);
  const publisherScale = useSharedValue(1);

  const adopterAnim = useAnimatedStyle(() => ({
    transform: [{ scale: adopterScale.value }],
  }));

  const publisherAnim = useAnimatedStyle(() => ({
    transform: [{ scale: publisherScale.value }],
  }));

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );

    const scale = role === 'adoptante' ? adopterScale : publisherScale;
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1);
    });
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      Alert.alert('Debes seleccionar al menos un rol');
      return;
    }

    const backendRoles = selectedRoles.map((role) =>
      role === 'adoptante' ? 'adopter' : 'giver'
    );

    try {
      setLoading(true);
      const { token, user } = await getSession();
      const response = await updateRoles(user.id, backendRoles, token);
      console.log('📝 Rol después de update:', response);

      if (!response || typeof response !== 'object') {
        Alert.alert('Error', 'Respuesta inesperada del servidor');
        return;
      }

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      if (!response.user) {
        Alert.alert('Error', 'Datos del usuario no recibidos');
        return;
      }

      const fixedUser = {
        ...response.user,
        role: response.user.role || response.user.roles?.[0] || null,
      };

      await saveSession(token, fixedUser);

      if (fixedUser.role === 'adopter') {
        navigation.navigate('AdopterProfile');
      } else if (fixedUser.role === 'giver') {
        navigation.navigate('GiverHome');
      } else {
        navigation.navigate('GiverHome');
      }
    } catch (err) {
      console.error('❌ Error en selección de rol:', err);
      Alert.alert('Error', err.message || 'No se pudieron guardar los roles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>¿Qué deseas hacer primero?</Title>
      <Text style={{ marginBottom: 20 }}>Selecciona una o ambas opciones:</Text>

      <View style={styles.options}>
        <TouchableWithoutFeedback onPress={() => toggleRole('adoptante')}>
          <Animated.View
            style={[
              styles.card,
              adopterAnim,
              selectedRoles.includes('adoptante') && styles.cardSelected,
            ]}
          >
            <MaterialCommunityIcons name="paw" size={40} />
            <Text>Adoptar</Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => toggleRole('publicador')}>
          <Animated.View
            style={[
              styles.card,
              publisherAnim,
              selectedRoles.includes('publicador') && styles.cardSelected,
            ]}
          >
            <MaterialCommunityIcons name="hand-heart" size={40} />
            <Text>Dar en adopción</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      <Button
        mode="contained"
        onPress={handleContinue}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Continuar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { marginBottom: 10, textAlign: 'center' },
  button: { marginTop: 30 },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    padding: 10,
  },
  cardSelected: {
    borderColor: '#6200ee',
    borderWidth: 2,
    backgroundColor: '#e0ddff',
  },
});
