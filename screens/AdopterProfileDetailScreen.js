import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import { Image } from 'expo-image';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';

const AdopterProfileDetailScreen = React.memo(({ route }) => {
  const { adopter } = route.params;
  const profile = adopter?.adopter_profile || {};

  const [canReport, setCanReport] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { user } = await getSession();
        if (user?.id && user.id !== adopter.id) {
          setCanReport(true);
        }
      } catch (err) {
        console.error('❌ Error al verificar usuario:', err);
      }
    };
    checkPermission();
  }, [adopter.id]);

  const avatarUri = useMemo(() => {
    return profile.foto?.startsWith('http')
      ? profile.foto
      : resolveAssetSource(require('../assets/default-avatar.png')).uri;
  }, [profile.foto]);

  const motivacionText = profile.motivacion?.trim() || 'No proporcionada';
  const tallaText = Array.isArray(profile.tallapreferida)
    ? profile.tallapreferida.join(', ')
    : 'No especificada';
  const caracterText = Array.isArray(profile.caracterpreferido)
    ? profile.caracterpreferido.join(', ')
    : 'No especificado';
  const tieneMascotasText = profile.tienemascotas === 'sí' ? 'Sí' : 'No';
  const viviendaText = profile.vivienda?.trim() || 'No especificada';

  const handleReport = () => {
    Alert.alert(
      '¿Reportar usuario?',
      '¿Estás seguro de que deseas reportar a este usuario por comportamiento inapropiado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reportar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { token } = await getSession();
              const res = await fetch(`${API_BASE}/api/report`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  type: 'user',
                  reported_id: adopter.id,
                }),
              });
              if (!res.ok) throw new Error('Error al reportar');
              Alert.alert('✅ Reporte enviado', 'Gracias por tu reporte.');
            } catch (err) {
              console.error('❌ Error al reportar usuario:', err);
              Alert.alert('Error', 'No se pudo enviar el reporte.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Image
            source={avatarUri}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
            cachePolicy="disk"
          />
          <Card.Content>
            <Title style={styles.title}>{adopter.name || 'Adoptante'}</Title>

            <View style={styles.section}>
              <Text style={styles.label}>Motivación:</Text>
              <Paragraph style={styles.value}>{motivacionText}</Paragraph>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Preferencias:</Text>
              <Paragraph style={styles.value}>
                Talla preferida: {tallaText}{'\n'}
                Carácter preferido: {caracterText}
              </Paragraph>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Detalles del hogar:</Text>
              <Paragraph style={styles.value}>
                Tiene otras mascotas: {tieneMascotasText}{'\n'}
                Vivienda: {viviendaText}
              </Paragraph>
            </View>

            {canReport && (
              <Button
                mode="contained"
                onPress={handleReport}
                style={{ marginTop: 20, backgroundColor: '#e11d48' }}
              >
                Reportar usuario
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
});

export default AdopterProfileDetailScreen;

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
