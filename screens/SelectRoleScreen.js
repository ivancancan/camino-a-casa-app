import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  SafeAreaView,
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

const RoleCard = ({ icon, label, selected, onPress, scale }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          selected && styles.cardSelected,
        ]}
      >
        <MaterialCommunityIcons name={icon} size={40} color="#333" />
        <Text style={styles.cardText}>{label}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default function SelectRoleScreen({ navigation }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const adopterScale = useSharedValue(1);
  const giverScale = useSharedValue(1);

  const toggleRole = (role, scaleRef) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

    scaleRef.value = withSpring(1.1, {}, () => {
      scaleRef.value = withSpring(1);
    });
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      Alert.alert('Debes seleccionar al menos un rol');
      return;
    }

    const backendRoles = selectedRoles.map((r) =>
      r === 'adoptante' ? 'adopter' : 'giver'
    );

    try {
      setLoading(true);
      const { token, user } = await getSession();
      const response = await updateRoles(user.id, backendRoles, token);

      if (!response || typeof response !== 'object') {
        Alert.alert('Error', 'Respuesta inesperada del servidor');
        return;
      }

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      const updatedUser = {
        ...response.user,
        role: response.user.role || response.user.roles?.[0] || null,
      };

      await saveSession(token, updatedUser);

      const route = updatedUser.role === 'adopter' ? 'AdopterProfile' : 'GiverHome';
      navigation.navigate(route);
    } catch (err) {
      console.error('❌ Error en selección de rol:', err);
      Alert.alert('Error', err.message || 'No se pudieron guardar los roles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Title style={styles.title}>¿Qué deseas hacer primero?</Title>
        <Text style={styles.subtitle}>Selecciona una o ambas opciones:</Text>

        <View style={styles.options}>
          <RoleCard
            icon="paw"
            label="Adoptar"
            selected={selectedRoles.includes('adoptante')}
            onPress={() => toggleRole('adoptante', adopterScale)}
            scale={adopterScale}
          />
          <RoleCard
            icon="hand-heart"
            label="Dar en adopción"
            selected={selectedRoles.includes('publicador')}
            onPress={() => toggleRole('publicador', giverScale)}
            scale={giverScale}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleContinue}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Continuar
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 15,
    color: '#555',
  },
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
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    marginTop: 30,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
