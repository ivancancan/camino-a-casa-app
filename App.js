import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants'; // ✅ importar config de Expo
import Navigation from './services/Navigation';
import { getSession } from './services/sessionService';


const { API_URL, SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig.extra;
console.log("🌐 API_URL actual:", API_URL);

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      console.log('🧠 Sesión encontrada:', session);

      if (!session) {
        setInitialRoute('Login');
        return;
      }

      const { user } = session;

      if (user.role === 'adopter') {
        console.log('➡️ Redirigiendo a AdopterHome');
        setInitialRoute('AdopterHome');
      } else if (user.role === 'giver') {
        console.log('➡️ Redirigiendo a GiverHome');
        setInitialRoute('GiverHome');
      } else {
        setInitialRoute('Login');
      }
    };

    checkSession();
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('./assets/arya.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider>
          <Navigation initialRoute={initialRoute} />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f2ff',
  },
  logo: {
    width: 160,
    height: 160,
  },
});
