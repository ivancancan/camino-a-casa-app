// Este archivo contiene el formulario completo para el perfil del adoptante
// con todos los campos requeridos por la base de datos de Supabase

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Title, Button, RadioButton, Text, ActivityIndicator, Checkbox } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

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
          setForm({
            tieneMascotas: data.profile.tienemascotas || '',
            experiencia: data.profile.experiencia || '',
            hayNinos: data.profile.hayninos || '',
            vivienda: data.profile.vivienda || '',
            espacioExterior: data.profile.espacioexterior || '',
            ritmo: data.profile.ritmo || '',
            cubreGastos: data.profile.cubregastos || '',
            tallaPreferida: data.profile.tallapreferida || [],
            caracterPreferido: data.profile.caracterpreferido || [],
            aceptaSeguimiento: data.profile.aceptaseguimiento || '',
            foto: data.profile.foto || '',
            motivacion: data.profile.motivacion || '',
          });
          if (data.profile.foto) setPhotoPreview(data.profile.foto);
        }
      } catch (err) {
        console.log('❌ Error al obtener perfil adoptante:', err);
        Alert.alert('Error', 'No se pudo obtener el perfil.');
      }
    };

    fetchProfile();
  }, []);

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

  const pickImage = async (fromCamera = false) => {
    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso para continuar.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setPhotoPreview(asset.uri);
      setSubiendoImagen(true);

      const formData = new FormData();
      const uniqueName = uuidv4();

      formData.append('file', {
        uri: asset.uri,
        name: `${uniqueName}.jpg`,
        type: 'image/jpeg',
      });

      try {
        const { token } = await getSession();
        const uploadRes = await fetch(`${API_BASE}/api/adopter/upload-photo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const contentType = uploadRes.headers.get('content-type');
        if (!uploadRes.ok || !contentType?.includes('application/json')) {
          const errorText = await uploadRes.text();
          console.error('❌ Error al subir imagen:', errorText);
          Alert.alert('Error', 'El servidor no devolvió una respuesta válida.');
          return;
        }

        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          setForm((prev) => ({ ...prev, foto: uploadData.url }));
          setPhotoPreview(uploadData.url);
        } else {
          Alert.alert('Error', uploadData.error || 'No se pudo subir la imagen.');
          setPhotoPreview(null);
        }
      } catch (err) {
        console.error('❌ Error al subir imagen:', err);
        Alert.alert('Error', 'Ocurrió un problema al subir la imagen.');
        setPhotoPreview(null);
      } finally {
        setSubiendoImagen(false);
      }
    }
  };

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
        Alert.alert('Perfil guardado', 'Tu perfil se guardó correctamente.', [
          { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'AdopterHome' }] }) },
        ]);
      } else {
        Alert.alert('Error', data.error || 'No se pudo guardar el perfil.');
      }
    } catch (err) {
      console.error('❌ Error de red al guardar perfil:', err);
      Alert.alert('Error', 'Ocurrió un error al guardar el perfil.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Perfil del Adoptante</Title>

      <Image
        source={photoPreview ? { uri: photoPreview } : require('../assets/default-avatar.png')}
        style={styles.imagePreview}
      />
      {subiendoImagen && (
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <ActivityIndicator animating={true} size="small" />
          <Text style={{ marginTop: 5 }}>Subiendo imagen...</Text>
        </View>
      )}

      <View style={styles.photoButtons}>
        <Button icon="camera" mode="outlined" onPress={() => pickImage(true)} disabled={subiendoImagen}>
          Tomar Selfie
        </Button>
        <Button icon="image" mode="outlined" onPress={() => pickImage(false)} disabled={subiendoImagen}>
          Elegir de Galería
        </Button>
      </View>

      {/* Campos del formulario */}
      <RadioButton.Group onValueChange={(val) => setForm({ ...form, tieneMascotas: val })} value={form.tieneMascotas}>
        <Text>¿Tienes mascotas actualmente?</Text>
        <RadioButton.Item label="Sí" value="sí" />
        <RadioButton.Item label="No" value="no" />
      </RadioButton.Group>

      <RadioButton.Group onValueChange={(val) => setForm({ ...form, experiencia: val })} value={form.experiencia}>
        <Text>¿Tienes experiencia previa con mascotas?</Text>
        <RadioButton.Item label="Sí" value="sí" />
        <RadioButton.Item label="No" value="no" />
      </RadioButton.Group>

      <RadioButton.Group onValueChange={(val) => setForm({ ...form, hayNinos: val })} value={form.hayNinos}>
        <Text>¿Hay niños en tu casa?</Text>
        <RadioButton.Item label="Sí" value="sí" />
        <RadioButton.Item label="No" value="no" />
      </RadioButton.Group>

      <RadioButton.Group onValueChange={(val) => setForm({ ...form, vivienda: val })} value={form.vivienda}>
        <Text>Tipo de vivienda</Text>
        <RadioButton.Item label="Casa" value="casa" />
        <RadioButton.Item label="Departamento" value="departamento" />
      </RadioButton.Group>

      <RadioButton.Group onValueChange={(val) => setForm({ ...form, espacioExterior: val })} value={form.espacioExterior}>
        <Text>¿Tienes espacio exterior?</Text>
        <RadioButton.Item label="Sí" value="sí" />
        <RadioButton.Item label="No" value="no" />
      </RadioButton.Group>

      <RadioButton.Group onValueChange={(val) => setForm({ ...form, ritmo: val })} value={form.ritmo}>
        <Text>¿Cómo es tu ritmo de vida?</Text>
        <RadioButton.Item label="Activo" value="activo" />
        <RadioButton.Item label="Tranquilo" value="tranquilo" />
      </RadioButton.Group>

      <RadioButton.Group onValueChange={(val) => setForm({ ...form, cubreGastos: val })} value={form.cubreGastos}>
        <Text>¿Puedes cubrir gastos del animal?</Text>
        <RadioButton.Item label="Sí" value="sí" />
        <RadioButton.Item label="No" value="no" />
      </RadioButton.Group>

      <Text style={{ marginTop: 10 }}>Tamaño preferido</Text>
      {opcionesTalla.map((op) => (
        <Checkbox.Item
          key={op}
          label={op}
          status={form.tallaPreferida.includes(op) ? 'checked' : 'unchecked'}
          onPress={() => toggleItem('tallaPreferida', op)}
        />
      ))}

      <Text style={{ marginTop: 10 }}>Carácter preferido</Text>
      {opcionesCaracter.map((op) => (
        <Checkbox.Item
          key={op}
          label={op}
          status={form.caracterPreferido.includes(op) ? 'checked' : 'unchecked'}
          onPress={() => toggleItem('caracterPreferido', op)}
        />
      ))}

      <RadioButton.Group onValueChange={(val) => setForm({ ...form, aceptaSeguimiento: val })} value={form.aceptaSeguimiento}>
        <Text>¿Aceptarías seguimiento post-adopción?</Text>
        <RadioButton.Item label="Sí" value="sí" />
        <RadioButton.Item label="No" value="no" />
      </RadioButton.Group>

      <TextInput
        label="¿Por qué quieres adoptar?"
        value={form.motivacion}
        onChangeText={(text) => setForm({ ...form, motivacion: text })}
        multiline
        style={{ marginBottom: 15 }}
      />

      <Button mode="contained" style={{ marginTop: 20 }} onPress={handleSubmit}>
        Guardar y continuar
      </Button>
    </ScrollView>
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
});
