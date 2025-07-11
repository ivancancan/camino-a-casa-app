import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { register } from '../services/authService';
import { saveSession } from '../services/sessionService';
import { Image, ImageBackground } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = form;

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
      navigation.reset({ index: 0, routes: [{ name: 'SelectRole' }] });
    } catch (error) {
      console.error('❌ Error inesperado al registrar:', error);
      alert(error.message || 'No se pudo registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/login-bg.png')}
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
              source={require('../assets/icon.png')}
              style={styles.logo}
              contentFit="contain"
              transition={300}
              cachePolicy="memory-disk"
            />

            <TextInput
              label="Nombre completo"
              value={form.name}
              onChangeText={(text) => handleChange('name', text)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Correo electrónico"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Contraseña"
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Confirmar contraseña"
              value={form.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              secureTextEntry
              mode="outlined"
              style={styles.input}
            />

            {/* ✅ Checkbox visible usando ícono */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                style={styles.iconCheckbox}
              >
                <MaterialCommunityIcons
                  name={acceptedTerms ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color="#6200ee"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Terms')}
                style={styles.termsTextWrapper}
              >
                <Text style={styles.termsText}>
                  Acepto los <Text style={styles.linkText}>Términos de Uso</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={loading}
              disabled={loading || !acceptedTerms}
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
    width: 180,
    height: 180,
    alignSelf: 'center',
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  iconCheckbox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsTextWrapper: {
    flexShrink: 1,
    paddingLeft: 4,
  },
  termsText: {
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});
