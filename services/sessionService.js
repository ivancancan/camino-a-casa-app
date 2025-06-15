import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

export const saveSession = async (token, user) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

    if (__DEV__) {
      console.log('💾 Sesión guardada');
    }
  } catch (error) {
    console.error('❌ Error al guardar sesión:', error);
  }
};

export const getSession = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userData = await AsyncStorage.getItem(USER_KEY);
    const parsedUser = userData ? JSON.parse(userData) : null;

    if (__DEV__) {
      console.log('📦 getSession ejecutado');
    }

    return token && parsedUser ? { token, user: parsedUser } : null;
  } catch (error) {
    console.error('❌ Error al obtener sesión:', error);
    return null;
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);

    if (__DEV__) {
      console.log('🧹 Sesión limpiada');
    }
  } catch (error) {
    console.error('❌ Error al limpiar sesión:', error);
  }
};
