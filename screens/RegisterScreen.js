import React from 'react';
import { View, StyleSheet, Alert, SafeAreaView } from 'react-native'; // ✅ SafeAreaView importado
import { Text, Button, TextInput, Title } from 'react-native-paper';
import { register } from '../services/authService';
import { saveSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const response = await register(name, email, password);
      console.log('🔍 Respuesta del backend al registrar:', response);

      if (!response || typeof response !== 'object') {
        Alert.alert('Error', 'Respuesta inesperada del servidor');
        return;
      }

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      if (!response.token || !response.user) {
        Alert.alert('Error', 'Datos incompletos al registrarse');
        return;
      }

      await saveSession(response.token, response.user);
      console.log('✅ Usuario registrado:', response.user);
      navigation.navigate('SelectRole');
    } catch (error) {
      console.error('❌ Error inesperado al registrar:', error);
      Alert.alert('Error', error.message || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}> {/* ✅ ENVUELVE TODA LA PANTALLA */}
      <View style={styles.container}>
        <Title style={styles.title}>Crear Cuenta</Title>

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
        >
          Registrarse
        </Button>

        <Button onPress={() => navigation.navigate('Login')} style={styles.link}>
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' }, // ✅ ESTILO PARA SafeAreaView
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
});
