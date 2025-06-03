import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { login } from '../services/authService';
import { saveSession } from '../services/sessionService';
import { Image, ImageBackground } from 'expo-image';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await login(email, password);

      if (!response || typeof response !== 'object') {
        alert('Respuesta inesperada del servidor');
        return;
      }

      if (response.error) {
        alert(response.error);
        return;
      }

      if (!response.token || !response.user) {
        alert('Datos incompletos al iniciar sesión');
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
      alert(error.message || 'Ocurrió un error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/login-bg.jpg')}
      style={styles.background}
      contentFit="cover"
      transition={300}
      cachePolicy="memory-disk"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <Image
              source={require('../assets/arya.png')}
              style={styles.logo}
              contentFit="contain"
              transition={300}
              cachePolicy="memory-disk"
            />

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
              contentStyle={styles.buttonContent}
            >
              Entrar
            </Button>

            <Button
              onPress={() => navigation.navigate('Register')}
              style={styles.link}
            >
              ¿No tienes cuenta? Regístrate
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f8f2ff',
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  link: {
    marginTop: 20,
  },
});
