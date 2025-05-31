import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Dimensions,
  SafeAreaView, // ✅ Importado
} from 'react-native';
import { Text, Title, Chip, Button, Divider } from 'react-native-paper';

export default function PetDetailScreen({ route, navigation }) {
  const { pet } = route.params;
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>{pet.nombre}</Title>

        {/* Galería de fotos */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {pet.fotos.map((uri, idx) => (
            <Pressable key={idx} onPress={() => setSelectedImage(uri)}>
              <Image source={{ uri }} style={styles.image} />
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

        <Button
          mode="contained"
          style={{ marginTop: 30 }}
          onPress={() => navigation.navigate('GiverForm', { pet })}
        >
          Editar Mascota
        </Button>
      </ScrollView>

      {/* Modal para mostrar imagen ampliada */}
      <Modal visible={!!selectedImage} transparent>
        <Pressable style={styles.modalBackground} onPress={() => setSelectedImage(null)}>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
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
