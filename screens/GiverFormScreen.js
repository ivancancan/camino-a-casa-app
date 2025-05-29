import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Text,
  Checkbox,
  Switch,
  RadioButton,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { getSession } from '../services/sessionService';
import { useRoute, useNavigation } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { API_BASE } from '../services/Api';

export default function GiverFormScreen() {
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

  const route = useRoute();
  const navigation = useNavigation();
  const petToEdit = route.params?.pet;

  const tallaOptions = ['chico', 'mediano', 'grande'];
  const caracterOptions = ['juguetón', 'tranquilo', 'activo', 'protector'];
  const sexoOptions = ['macho', 'hembra'];

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
    base64: true, // 👈 CLAVE
    selectionLimit: 0, // Para permitir múltiples imágenes (iOS 17+)
  });

  if (!result.canceled && result.assets.length > 0) {
    const base64Images = result.assets.map((asset) => {
      if (asset.base64) {
        return `data:image/jpeg;base64,${asset.base64}`;
      }
      return null;
    }).filter(Boolean); // 👈 elimina los null por si acaso

    setForm((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...base64Images],
    }));
  }
};


  const handleRemoveImage = (index) => {
    const newFotos = [...form.fotos];
    newFotos.splice(index, 1);
    setForm((prev) => ({ ...prev, fotos: newFotos }));
  };

  const handleSubmit = async () => {
    if (
      !form.nombre ||
      !form.sexo ||
      !form.edad ||
      !form.talla ||
      !form.telefono ||
      form.fotos.length === 0
    ) {
      Alert.alert(
        'Campos incompletos',
        'Llena todos los campos obligatorios y sube al menos una foto.'
      );
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

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        Alert.alert('Error', 'Respuesta inesperada del servidor.');
        return;
      }

      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        Alert.alert(
          'Éxito',
          petToEdit ? 'Mascota actualizada' : 'Mascota publicada con éxito'
        );
        navigation.navigate('GiverHome', { screen: 'MisMascotas' });
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la mascota.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>
          {petToEdit ? 'Editar Mascota' : 'Publicar Mascota en Adopción'}
        </Title>

        <TextInput
          label="Nombre del peludo"
          value={form.nombre}
          onChangeText={(text) => setForm({ ...form, nombre: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Sexo</Text>
        <RadioButton.Group
          onValueChange={(val) => setForm({ ...form, sexo: val })}
          value={form.sexo}
        >
          {sexoOptions.map((option) => (
            <RadioButton.Item
              key={option}
              label={option.charAt(0).toUpperCase() + option.slice(1)}
              value={option}
            />
          ))}
        </RadioButton.Group>

        <TextInput
          label="Edad"
          value={form.edad}
          onChangeText={(text) => setForm({ ...form, edad: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Talla</Text>
        <RadioButton.Group
          onValueChange={(val) => setForm({ ...form, talla: val })}
          value={form.talla}
        >
          {tallaOptions.map((option) => (
            <RadioButton.Item
              key={option}
              label={option.charAt(0).toUpperCase() + option.slice(1)}
              value={option}
            />
          ))}
        </RadioButton.Group>

        <TextInput
          label="Descripción (máx. 1000 caracteres)"
          value={form.descripcion}
          onChangeText={(text) => setForm({ ...form, descripcion: text })}
          style={styles.input}
          multiline
          maxLength={1000}
        />
        <Text style={{ textAlign: 'right', marginBottom: 10 }}>
          {form.descripcion.length}/1000
        </Text>

        <TextInput
          label="Teléfono de contacto"
          value={form.telefono}
          onChangeText={(text) => setForm({ ...form, telefono: text })}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Carácter</Text>
        {caracterOptions.map((c) => (
          <Checkbox.Item
            key={c}
            label={c.charAt(0).toUpperCase() + c.slice(1)}
            status={form.caracter.includes(c) ? 'checked' : 'unchecked'}
            onPress={() => toggleItem('caracter', c)}
          />
        ))}

        <Text style={styles.label}>Convive con</Text>
        {['niños', 'perros', 'gatos'].map((c) => (
          <Checkbox.Item
            key={c}
            label={c.charAt(0).toUpperCase() + c.slice(1)}
            status={form.conviveCon.includes(c) ? 'checked' : 'unchecked'}
            onPress={() => toggleItem('conviveCon', c)}
          />
        ))}

        <View style={styles.switchRow}>
          <Text>Vacunado</Text>
          <Switch
            value={form.vacunado}
            onValueChange={(v) => setForm({ ...form, vacunado: v })}
          />
        </View>
        <View style={styles.switchRow}>
          <Text>Esterilizado</Text>
          <Switch
            value={form.esterilizado}
            onValueChange={(v) => setForm({ ...form, esterilizado: v })}
          />
        </View>
        <View style={styles.switchRow}>
          <Text>Desparasitado</Text>
          <Switch
            value={form.desparasitado}
            onValueChange={(v) => setForm({ ...form, desparasitado: v })}
          />
        </View>

        <Button
          mode="outlined"
          onPress={handlePickImage}
          style={{ marginVertical: 10 }}
        >
          Subir Foto
        </Button>

        <DraggableFlatList
          data={form.fotos}
          horizontal
          onDragEnd={({ data }) =>
            setForm((prev) => ({ ...prev, fotos: data }))
          }
          keyExtractor={(item, index) => `foto-${index}`}
          renderItem={({ item, index, drag }) => (
            <TouchableOpacity key={index} onLongPress={drag} style={{ marginRight: 10 }}>
              <Image source={{ uri: item }} style={styles.image} />
              <Button mode="text" compact onPress={() => handleRemoveImage(index)}>
                ❌
              </Button>
            </TouchableOpacity>
          )}
        />

        <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 20 }}>
          {petToEdit ? 'Guardar cambios' : 'Publicar'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 10 },
  label: { marginTop: 15, fontWeight: 'bold' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});
