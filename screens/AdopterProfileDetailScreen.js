// src/screens/AdopterProfileDetailScreen.js
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';
import { Image } from 'expo-image';

export default function AdopterProfileDetailScreen({ route }) {
  const { adopter } = route.params;
  const profile = adopter?.adopter_profile || {};

  const avatarUri = profile.foto?.startsWith('http')
    ? profile.foto
    : 'https://via.placeholder.com/200x200.png?text=Adoptante';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Image
            source={avatarUri}
            style={styles.avatar}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <Card.Content>
            <Title style={styles.title}>{adopter.name || 'Adoptante'}</Title>

            <View style={styles.section}>
              <Text style={styles.label}>Motivación:</Text>
              <Paragraph style={styles.value}>
                {profile.motivacion?.trim() || 'No proporcionada'}
              </Paragraph>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Preferencias:</Text>
              <Paragraph style={styles.value}>
                Talla preferida: {Array.isArray(profile.tallapreferida) ? profile.tallapreferida.join(', ') : 'No especificada'}{'\n'}
                Carácter preferido: {Array.isArray(profile.caracterpreferido) ? profile.caracterpreferido.join(', ') : 'No especificado'}
              </Paragraph>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Detalles del hogar:</Text>
              <Paragraph style={styles.value}>
                Tiene otras mascotas: {profile.tienemascotas ? 'Sí' : 'No'}{'\n'}
                Vivienda: {profile.vivienda?.trim() || 'No especificada'}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  card: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 12,
  },
  section: {
    marginVertical: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#444',
  },
});
