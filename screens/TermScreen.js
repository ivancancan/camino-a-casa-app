// TermsScreen.js
import React from 'react';
import { ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Text, Title } from 'react-native-paper';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.title}>Términos de Uso</Title>

        <Text style={styles.paragraph}>
          Arya es una plataforma para conectar personas interesadas en adoptar o dar en adopción mascotas.
          Al usar esta aplicación, aceptas usarla de manera respetuosa y honesta. Los usuarios son responsables
          del contenido que publican, incluyendo imágenes, descripciones y mensajes.
        </Text>

        <Text style={styles.paragraph}>
          Nos reservamos el derecho de eliminar cuentas o contenido que viole nuestros principios de respeto,
          bienestar animal o cualquier norma legal vigente.
        </Text>

        <Text style={styles.paragraph}>
          Si encuentras contenido ofensivo o inapropiado, puedes reportarlo desde la app para que nuestro equipo
          pueda revisarlo. También puedes bloquear a otros usuarios si no deseas recibir más interacción.
        </Text>

        <Text style={styles.paragraph}>
          Arya no se hace responsable por acuerdos fuera de la plataforma entre usuarios.
        </Text>

        <Text style={styles.paragraph}>
          Gracias por usar Arya de forma consciente.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
    color: '#333',
  },
});
