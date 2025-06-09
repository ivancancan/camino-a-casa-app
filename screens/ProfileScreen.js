import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { getSession, clearSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const session = await getSession();
      if (!session?.user) return;

      setUser(session.user);
      setRole(session.user.role);

      const endpoint =
        session.user.role === 'giver' ? '/api/giver/profile' : '/api/adopter/profile';

      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });

        const data = await res.json();

        if (res.ok && data?.profile?.foto) {
          setProfilePhoto(data.profile.foto);
        }
      } catch (err) {
        console.error('❌ Error al cargar foto de perfil:', err);
        Alert.alert('Error', 'No se pudo cargar la foto de perfil.');
      } finally {
        setLoadingPhoto(false);
      }
    };

    loadUserAndProfile();
  }, []);

  const handleLogout = async () => {
    await clearSession();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Activa el acceso a tu cámara o galería');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (result.canceled || !result.assets?.length) return;
    uploadImage(result.assets[0]);
  };

  const uploadImage = async (asset) => {
    setUploading(true);
    const formData = new FormData();
    const uniqueName = uuidv4();

    formData.append('image', {
      uri: asset.uri,
      name: `${uniqueName}.jpg`,
      type: 'image/jpeg',
    });

    try {
      const { token } = await getSession();

      const uploadRes = await fetch(`${API_BASE}/api/${role}/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        setProfilePhoto(uploadData.url);
        setImageError(false);

        const saveRes = await fetch(`${API_BASE}/api/${role}/profile`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ foto: uploadData.url }),
        });

        if (!saveRes.ok) {
          const err = await saveRes.json();
          Alert.alert('Error al guardar foto', err.error || 'Ocurrió un problema');
        }
      } else {
        Alert.alert('Error', uploadData.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error('❌ Error al subir imagen:', err);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Cambiar foto', 'Selecciona una opción', [
      { text: 'Tomar foto', onPress: () => pickImage(true) },
      { text: 'Elegir de galería', onPress: () => pickImage(false) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mi Cuenta</Text>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={showImageOptions} disabled={uploading || loadingPhoto}>
            <Image
              source={
                !profilePhoto || imageError
                  ? require('../assets/default-avatar.png')
                  : { uri: profilePhoto }
              }
              style={styles.profileImage}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
              onError={() => setImageError(true)}
            />
            <IconButton
              icon="pencil"
              size={20}
              style={styles.editIcon}
              onPress={showImageOptions}
              disabled={uploading || loadingPhoto}
            />
          </TouchableOpacity>
        </View>

        {uploading || loadingPhoto ? (
          <ActivityIndicator style={{ marginBottom: 20 }} />
        ) : null}

        {user && (
          <>
            <Text style={styles.text}>Nombre: {user.name}</Text>
            <Text style={styles.text}>Correo: {user.email}</Text>
          </>
        )}

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={{ marginTop: 20 }}
          labelStyle={{ color: '#6200ee' }}
        >
          Cerrar sesión
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  text: { fontSize: 16, marginBottom: 5 },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  editIcon: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
  },
});
