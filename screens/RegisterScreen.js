import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { register } from '../services/authService';
import { saveSession } from '../services/sessionService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const response = await register(name, email, password);
      if (!response || typeof response !== 'object') {
        alert('Respuesta inesperada del servidor');
        return;
      }
      if (response.error) {
        alert(response.error);
        return;
      }
      if (!response.token || !response.user) {
        alert('Datos incompletos al registrarse');
        return;
      }

      await saveSession(response.token, response.user);
      navigation.navigate('SelectRole');
    } catch (error) {
      console.error('❌ Error inesperado al registrar:', error);
      alert(error.message || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
<ImageBackground
  source={require('../assets/login-bg.jpg')}
  style={[styles.background, { backgroundColor: '#f8f2ff' }]} // 🎯 este color es clave
  resizeMode="cover"
>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Image source={require('../assets/arya.png')} style={styles.logo} />

            <TextInput
              label="Nombre completo"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
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
            <TextInput
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={loading}
              disabled={loading}
              contentStyle={styles.buttonContent}
            >
              Registrarse
            </Button>

            <Button onPress={() => navigation.navigate('Login')} style={styles.link}>
              ¿Ya tienes cuenta? Inicia sesión
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
    width: 180,
    height: 180,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 24,
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
