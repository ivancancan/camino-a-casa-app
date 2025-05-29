import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { getSession, clearSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(true);

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user);

        try {
          const res = await fetch(`${API_BASE}/api/adopter/profile`, {
            headers: { Authorization: `Bearer ${session.token}` },
          });

          const data = await res.json();

          if (res.ok && data?.profile?.foto) {
            setProfilePhoto(data.profile.foto); // URL pública de Supabase Storage
          }
        } catch (err) {
          console.error('❌ Error al cargar foto de perfil:', err);
          Alert.alert('Error', 'No se pudo cargar la foto de perfil.');
        } finally {
          setLoadingPhoto(false);
        }
      }
    };

    loadUserAndProfile();
  }, []);

  const handleLogout = async () => {
    await clearSession();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Cuenta</Text>

      {loadingPhoto ? (
        <ActivityIndicator size="large" color="#999" style={{ marginBottom: 20 }} />
      ) : (
        <Image
          source={
            !profilePhoto || imageError
              ? require('../assets/default-avatar.png')
              : { uri: profilePhoto }
          }
          style={styles.profileImage}
          onError={() => setImageError(true)}
        />
      )}

      {user && (
        <>
          <Text style={styles.text}>Nombre: {user.name}</Text>
          <Text style={styles.text}>Correo: {user.email}</Text>
        </>
      )}

      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  text: { fontSize: 16, marginBottom: 5 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ccc',
  },
});
