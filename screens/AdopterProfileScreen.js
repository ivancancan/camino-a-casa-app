// AdopterProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  TextInput,
  Title,
  Button,
  RadioButton,
  Text,
  ActivityIndicator,
  Checkbox,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import 'react-native-get-random-values';
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>Perfil del Adoptante</Title>

        <Image
          source={
            photoPreview
              ? photoPreview
              : require('../assets/default-avatar.png')
          }
          style={styles.imagePreview}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
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
        <TextInput label="¿Por qué quieres adoptar?" value={form.motivacion} onChangeText={(text) => setForm({ ...form, motivacion: text })} multiline style={{ marginBottom: 16 }} />

        <Text>¿Tienes otras mascotas?</Text>
        <RadioButton.Group onValueChange={(val) => setForm({ ...form, tieneMascotas: val })} value={form.tieneMascotas}>
          <RadioButton.Item label="Sí" value="sí" />
          <RadioButton.Item label="No" value="no" />
        </RadioButton.Group>

        <Text>¿Tienes experiencia con mascotas?</Text>
        <RadioButton.Group onValueChange={(val) => setForm({ ...form, experiencia: val })} value={form.experiencia}>
          <RadioButton.Item label="Sí" value="sí" />
          <RadioButton.Item label="No" value="no" />
        </RadioButton.Group>

        <Text>¿Hay niños en casa?</Text>
        <RadioButton.Group onValueChange={(val) => setForm({ ...form, hayNinos: val })} value={form.hayNinos}>
          <RadioButton.Item label="Sí" value="sí" />
          <RadioButton.Item label="No" value="no" />
        </RadioButton.Group>

        <Text>Tipo de vivienda</Text>
        <TextInput value={form.vivienda} onChangeText={(text) => setForm({ ...form, vivienda: text })} style={{ marginBottom: 16 }} />

        <Text>¿Tienes espacio exterior?</Text>
        <RadioButton.Group onValueChange={(val) => setForm({ ...form, espacioExterior: val })} value={form.espacioExterior}>
          <RadioButton.Item label="Sí" value="sí" />
          <RadioButton.Item label="No" value="no" />
        </RadioButton.Group>

        <Text>Ritmo de vida</Text>
        <TextInput value={form.ritmo} onChangeText={(text) => setForm({ ...form, ritmo: text })} style={{ marginBottom: 16 }} />

        <Text>¿Puedes cubrir gastos de alimentación y salud?</Text>
        <RadioButton.Group onValueChange={(val) => setForm({ ...form, cubreGastos: val })} value={form.cubreGastos}>
          <RadioButton.Item label="Sí" value="sí" />
          <RadioButton.Item label="No" value="no" />
        </RadioButton.Group>

        <Text>Talla preferida</Text>
        {opcionesTalla.map((op) => (
          <Checkbox.Item
            key={op}
            label={op}
            status={form.tallaPreferida.includes(op) ? 'checked' : 'unchecked'}
            onPress={() => toggleItem('tallaPreferida', op)}
          />
        ))}

        <Text>Carácter preferido</Text>
        {opcionesCaracter.map((op) => (
          <Checkbox.Item
            key={op}
            label={op}
            status={form.caracterPreferido.includes(op) ? 'checked' : 'unchecked'}
            onPress={() => toggleItem('caracterPreferido', op)}
          />
        ))}

        <Text>¿Aceptas seguimiento?</Text>
        <RadioButton.Group onValueChange={(val) => setForm({ ...form, aceptaSeguimiento: val })} value={form.aceptaSeguimiento}>
          <RadioButton.Item label="Sí" value="sí" />
          <RadioButton.Item label="No" value="no" />
        </RadioButton.Group>

        <Button mode="contained" style={{ marginTop: 20 }} onPress={handleSubmit}>
          Guardar y continuar
        </Button>
      </ScrollView>
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
});
