// GiverFormScreen.js (versión mejorada con diseño profesional y secciones organizadas)

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Title,
  Divider,
  Chip,
  Switch,
  RadioButton,
  Avatar,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function GiverFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const petToEdit = route.params?.pet;

  const [form, setForm] = useState({
    nombre: '',
    sexo: '',
    edad: '',
    talla: '',
    caracter: [],
    conviveCon: [],
    vacunado: false,
    esterilizado: false,
    desparasitado: false,
    telefono: '',
    fotos: [],
    descripcion: '',
  });

  const tallaOptions = ['chico', 'mediano', 'grande'];
  const caracterOptions = ['juguetón', 'tranquilo', 'activo', 'protector'];
  const sexoOptions = ['macho', 'hembra'];
  const edadOptions = [
    '0-3 meses',
    '3-6 meses',
    '6-12 meses',
    '1 año',
    '2 años',
    '3 años',
    '4 años',
    '5 años',
    '6 años',
    '7 años',
    '8 años',
    '9 años',
    '10+ años'
  ];

  useEffect(() => {
    if (petToEdit) {
      setForm({
        nombre: petToEdit.nombre || '',
        sexo: petToEdit.sexo || '',
        edad: petToEdit.edad || '',
        talla: petToEdit.talla || '',
        caracter: petToEdit.caracter || [],
        conviveCon: petToEdit.convive_con || [],
        vacunado: petToEdit.vacunado || false,
        esterilizado: petToEdit.esterilizado || false,
        desparasitado: petToEdit.desparasitado || false,
        telefono: petToEdit.telefono_contacto || '',
        fotos: petToEdit.fotos || [],
        descripcion: petToEdit.descripcion || '',
      });
    }
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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const { token } = await getSession();

      const formData = new FormData();
      const filename = asset.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('file', {
        uri: asset.uri,
        name: filename,
        type,
      });

      try {
        const res = await fetch(`${API_BASE}/api/giver/upload-pet-photo`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          setForm((prev) => ({ ...prev, fotos: [...prev.fotos, data.url] }));
        }
      } catch {
        Alert.alert('Error al subir imagen');
      }
    }
  };

  const handleRemoveImage = (index) => {
    const newFotos = [...form.fotos];
    newFotos.splice(index, 1);
    setForm((prev) => ({ ...prev, fotos: newFotos }));
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.sexo || !form.edad || !form.talla || !form.telefono || form.fotos.length === 0) {
      Alert.alert('Campos incompletos', 'Llena todos los campos obligatorios y sube al menos una foto.');
      return;
    }

    try {
      const { token } = await getSession();
      const method = petToEdit ? 'PUT' : 'POST';
      const url = petToEdit
        ? `${API_BASE}/api/pets/${petToEdit.id}`
        : `${API_BASE}/api/pets`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (data.error) Alert.alert('Error', data.error);
      else {
        Alert.alert('Listo', petToEdit ? 'Mascota actualizada' : 'Mascota publicada');
        navigation.navigate('GiverHome', { screen: 'MisMascotas' });
      }
    } catch {
      Alert.alert('No se pudo guardar');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Title style={styles.title}>Formulario de Adopción</Title>

          {/* Info General */}
          <Divider style={styles.divider} />
          <TextInput label="Nombre" value={form.nombre} onChangeText={(text) => setForm({ ...form, nombre: text })} style={styles.input} />

          <Text style={styles.label}>Sexo</Text>
          <RadioButton.Group
            onValueChange={(value) => setForm({ ...form, sexo: value })}
            value={form.sexo}>
            <View style={styles.row}>{sexoOptions.map((op) => <RadioButton.Item key={op} label={op} value={op} />)}</View>
          </RadioButton.Group>

          <Text style={styles.label}>Edad</Text>
          <RadioButton.Group onValueChange={(value) => setForm({ ...form, edad: value })} value={form.edad}>
            <View style={styles.rowWrap}>{edadOptions.map((op) => <RadioButton.Item key={op} label={op} value={op} />)}</View>
          </RadioButton.Group>

          <Text style={styles.label}>Talla</Text>
          <View style={styles.rowWrap}>{tallaOptions.map((op) => (
            <Chip key={op} selected={form.talla === op} onPress={() => setForm({ ...form, talla: op })} style={styles.chip}>{op}</Chip>
          ))}</View>

          <Text style={styles.label}>Carácter</Text>
          <View style={styles.rowWrap}>{caracterOptions.map((op) => (
            <Chip
              key={op}
              selected={form.caracter.includes(op)}
              onPress={() => toggleItem('caracter', op)}
              style={styles.chip}>
              {op}
            </Chip>
          ))}</View>

          {/* Fotos */}
          <Divider style={styles.divider} />
          <Text style={styles.label}>Fotos</Text>
          <View style={styles.rowWrap}>
            {form.fotos.map((uri, index) => (
              <TouchableOpacity key={index} onLongPress={() => handleRemoveImage(index)}>
                <Avatar.Image source={{ uri }} size={70} style={{ marginRight: 8 }} />
              </TouchableOpacity>
            ))}
            <Button mode="outlined" onPress={handlePickImage}>Subir foto</Button>
          </View>

          {/* Contacto y Salud */}
          <Divider style={styles.divider} />
          <TextInput label="Teléfono de contacto" keyboardType="phone-pad" value={form.telefono} onChangeText={(t) => setForm({ ...form, telefono: t })} style={styles.input} />

          <Text style={styles.label}>Salud</Text>
          {['vacunado', 'esterilizado', 'desparasitado'].map((field) => (
            <View key={field} style={styles.switchRow}>
              <Text>{field}</Text>
              <Switch value={form[field]} onValueChange={(val) => setForm({ ...form, [field]: val })} />
            </View>
          ))}

          {/* Descripción */}
          <Divider style={styles.divider} />
          <TextInput
            label="Descripción"
            multiline
            numberOfLines={4}
            value={form.descripcion}
            onChangeText={(text) => setForm({ ...form, descripcion: text })}
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 24 }}>
            {petToEdit ? 'Guardar cambios' : 'Publicar'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  title: { textAlign: 'center', marginBottom: 16 },
  divider: { marginVertical: 16 },
  input: { marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  chip: { marginRight: 8, marginBottom: 8 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
});
