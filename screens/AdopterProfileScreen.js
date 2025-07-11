import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import {
  TextInput,
  Title,
  Button,
  RadioButton,
  Text,
  Checkbox,
  ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { v4 as uuidv4 } from 'uuid';
import { Image } from 'expo-image';

export default function AdopterProfileScreen({ navigation }) {
  const [form, setForm] = useState({
    tieneMascotas: '', experiencia: '', hayNinos: '', vivienda: '',
    espacioExterior: '', ritmo: '', cubreGastos: '',
    tallaPreferida: [], caracterPreferido: [], aceptaSeguimiento: '',
    foto: '', motivacion: '',
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const opcionesTalla = ['pequeño', 'mediano', 'grande'];
  const opcionesCaracter = ['tranquilo', 'juguetón', 'protector', 'activo'];

  const toggleItem = (field, value) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { token } = await getSession();
        const res = await fetch(`${API_BASE}/api/adopter/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error('❌ Error parseando perfil:', err);
          Alert.alert('Error', 'Respuesta inesperada del servidor.');
          return;
        }

        if (res.ok && data.profile) {
          const p = data.profile;
          setForm({
            tieneMascotas: p.tienemascotas || '',
            experiencia: p.experiencia || '',
            hayNinos: p.hayninos || '',
            vivienda: p.vivienda || '',
            espacioExterior: p.espacioexterior || '',
            ritmo: p.ritmo || '',
            cubreGastos: p.cubregastos || '',
            tallaPreferida: p.tallapreferida || [],
            caracterPreferido: p.caracterpreferido || [],
            aceptaSeguimiento: p.aceptaseguimiento || '',
            foto: p.foto || '',
            motivacion: p.motivacion || '',
          });

          if (p.foto) setPhotoPreview(p.foto);
        }
      } catch (err) {
        console.log('❌ Error al obtener perfil adoptante:', err);
        Alert.alert('Error', 'No se pudo obtener el perfil.');
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    try {
      const { token, user } = await getSession();
      const response = await fetch(`${API_BASE}/api/adopter/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, userId: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Éxito', 'Perfil guardado correctamente');
        navigation.reset({ index: 0, routes: [{ name: 'AdopterHome' }] });
      } else {
        Alert.alert('Error', data.error || 'No se pudo guardar el perfil.');
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al guardar el perfil.');
    }
  };

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return;

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync()
      : await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setPhotoPreview(asset.uri);
      setSubiendoImagen(true);

      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        name: `adopter-${uuidv4()}.jpg`,
        type: 'image/jpeg',
      });

      try {
        const { token } = await getSession();
        const res = await fetch(`${API_BASE}/api/adopter/upload-photo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (data.url) setForm((prev) => ({ ...prev, foto: data.url }));
      } catch (err) {
        Alert.alert('Error', 'No se pudo subir la imagen');
      } finally {
        setSubiendoImagen(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>
          <Title style={styles.title}>Perfil del Adoptante</Title>

          <Image
            source={photoPreview || require('../assets/default-avatar.png')}
            style={styles.imagePreview}
          />

          {subiendoImagen ? <ActivityIndicator /> : null}

          <View style={styles.photoButtons}>
            <Button icon="camera" onPress={() => pickImage(true)}>
              Selfie
            </Button>
            <Button icon="image" onPress={() => pickImage(false)}>
              Galería
            </Button>
          </View>

          <TextInput
            label="¿Por qué quieres adoptar?"
            value={form.motivacion}
            onChangeText={(text) => setForm({ ...form, motivacion: text })}
            multiline
            style={{ marginBottom: 16 }}
          />

          {[
            { key: 'tieneMascotas', label: '¿Tienes mascotas actualmente?' },
            { key: 'experiencia', label: '¿Tienes experiencia con mascotas?' },
            { key: 'hayNinos', label: '¿Hay niños en tu hogar?' },
            { key: 'vivienda', label: '¿Vives en casa o departamento?', options: ['casa', 'departamento'] },
            { key: 'espacioExterior', label: '¿Tienes patio o espacio exterior?' },
            { key: 'ritmo', label: '¿Cómo describirías tu ritmo de vida?', options: ['tranquilo', 'activo'] },
            { key: 'cubreGastos', label: '¿Puedes cubrir gastos médicos y alimentación?' },
            { key: 'aceptaSeguimiento', label: '¿Aceptarías seguimiento después de adoptar?' },
          ].map((item) => (
            <View key={item.key} style={styles.fieldBlock}>
              <Text>{item.label}</Text>
              <RadioButton.Group
                onValueChange={(value) => setForm({ ...form, [item.key]: value })}
                value={form[item.key]}
              >
                {(item.options || ['sí', 'no']).map((option) => (
                  <RadioButton.Item key={option} label={option} value={option} />
                ))}
              </RadioButton.Group>
            </View>
          ))}

          <Text style={styles.label}>Tamaño preferido:</Text>
          {opcionesTalla.map((talla) => (
            <Checkbox.Item
              key={talla}
              label={talla}
              status={form.tallaPreferida.includes(talla) ? 'checked' : 'unchecked'}
              onPress={() => toggleItem('tallaPreferida', talla)}
            />
          ))}

          <Text style={styles.label}>Carácter preferido:</Text>
          {opcionesCaracter.map((caracter) => (
            <Checkbox.Item
              key={caracter}
              label={caracter}
              status={form.caracterPreferido.includes(caracter) ? 'checked' : 'unchecked'}
              onPress={() => toggleItem('caracterPreferido', caracter)}
            />
          ))}

          <Button mode="contained" style={{ marginTop: 20 }} onPress={handleSubmit}>
            Guardar perfil
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { textAlign: 'center', marginBottom: 20 },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 15,
    backgroundColor: '#ddd',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  fieldBlock: { marginBottom: 16 },
  label: { marginTop: 16, marginBottom: 8 },
});
