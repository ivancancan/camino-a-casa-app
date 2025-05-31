import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native'; // ✅ Usamos SafeAreaView
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { login } from '../services/authService';
import { saveSession } from '../services/sessionService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await login(email, password);

      console.log('🔐 Login tradicional → respuesta:', response);

      if (!response || typeof response !== 'object') {
        Alert.alert('Error', 'Respuesta inesperada del servidor');
        return;
      }

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      if (!response.token || !response.user) {
        Alert.alert('Error', 'Datos incompletos al iniciar sesión');
        return;
      }

      await saveSession(response.token, response.user);

      if (response.user.role === 'adopter') {
        navigation.reset({ index: 0, routes: [{ name: 'AdopterHome' }] });
      } else if (response.user.role === 'giver') {
        navigation.reset({ index: 0, routes: [{ name: 'GiverHome' }] });
      } else {
        navigation.navigate('SelectRole');
      }
    } catch (error) {
      console.error('❌ Error inesperado en login tradicional:', error);
      Alert.alert('Error', error.message || 'Ocurrió un error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>Iniciar Sesión</Title>

      <TextInput
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Entrar
      </Button>

      <Button onPress={() => navigation.navigate('Register')} style={styles.link}>
        ¿No tienes cuenta? Regístrate
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  link: {
    marginTop: 20,
  },
});
