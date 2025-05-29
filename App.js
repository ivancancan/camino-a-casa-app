import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 👈 IMPORTANTE
import Navigation from './services/Navigation';
import { getSession } from './services/sessionService';

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
      <Text style={{ marginTop: 50, textAlign: 'center' }}>⏳ Cargando aplicación...</Text>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <Navigation initialRoute={initialRoute} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
