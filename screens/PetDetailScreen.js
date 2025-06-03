import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Text, Title, Chip, Button, Divider } from 'react-native-paper';
import { Image } from 'expo-image';
import { getSession } from '../services/sessionService';

export default function PetDetailScreen({ route, navigation }) {
  const { pet } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { user } = await getSession();
        const isGiver = user.role === 'giver';
        const isOwner = user.id === pet.owner_id;
        setCanEdit(isGiver && isOwner);
      } catch (err) {
        console.error('❌ Error al verificar permisos:', err);
      }
    };
    checkPermission();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>{pet.nombre}</Title>

        {pet.status === 'adoptado' && (
          <View style={styles.adoptedContainer}>
            <Chip style={styles.adoptedChip}>Adoptado</Chip>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {pet.fotos.map((uri, idx) => (
            <Pressable key={idx} onPress={() => setSelectedImage(uri)}>
              <Image
                source={{ uri }}
                style={styles.image}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />
            </Pressable>
          ))}
        </ScrollView>

        <Divider style={{ marginVertical: 10 }} />

        <Text style={styles.label}>Edad:</Text>
        <Text>{pet.edad}</Text>

        <Text style={styles.label}>Talla:</Text>
        <Text>{pet.talla}</Text>

        <Text style={styles.label}>Descripción:</Text>
        <Text>{pet.descripcion || 'Sin descripción.'}</Text>

        <Divider style={{ marginVertical: 10 }} />

        <Text style={styles.label}>Carácter:</Text>
        <View style={styles.row}>
          {pet.caracter?.map((c, i) => (
            <Chip key={i} style={styles.chip}>{c}</Chip>
          ))}
        </View>

        <Text style={styles.label}>Convive con:</Text>
        <View style={styles.row}>
          {pet.convive_con?.map((c, i) => (
            <Chip key={i} style={styles.chip}>{c}</Chip>
          ))}
        </View>

        <Text style={styles.label}>Salud:</Text>
        <View style={styles.row}>
          {pet.vacunado && <Chip style={styles.chip}>Vacunado</Chip>}
          {pet.esterilizado && <Chip style={styles.chip}>Esterilizado</Chip>}
          {pet.desparasitado && <Chip style={styles.chip}>Desparasitado</Chip>}
        </View>

        {canEdit && (
          <Button
            mode="contained"
            style={{ marginTop: 30 }}
            onPress={() => navigation.navigate('GiverForm', { pet })}
          >
            Editar Mascota
          </Button>
        )}
      </ScrollView>

      <Modal visible={!!selectedImage} transparent>
        <Pressable style={styles.modalBackground} onPress={() => setSelectedImage(null)}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 10,
  },
  adoptedContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  adoptedChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  image: {
    width: 180,
    height: 180,
    marginRight: 10,
    borderRadius: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 5,
  },
  chip: {
    marginRight: 5,
    marginBottom: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
