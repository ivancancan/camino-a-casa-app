import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PetDetailScreen from '../screens/PetDetailScreen';
import SelectRoleScreen from '../screens/SelectRoleScreen';

import SwipeScreen from '../screens/SwipeScreen'; // Home del adoptante

import GiverFormScreen from '../screens/GiverFormScreen'; // aún accesible directo para edición
import AdopterProfileScreen from '../screens/AdopterProfileScreen';

import GiverTabsNavigator from '../services/GiverTabsNavigator';
import AdopterTabsNavigator from '../services/AdopterTabsNavigator';
import InterestedUsersScreen from '../screens/InterestedUsersScreen'; // ajusta la ruta si está en otra carpeta
import ConfirmedMatchesScreen from '../screens/ConfirmedMatchesScreen';



const Stack = createNativeStackNavigator();

export default function Navigation({ initialRoute = 'Login' }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        {/* Auth */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Iniciar Sesión' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Registrarse' }}
        />
        <Stack.Screen
          name="SelectRole"
          component={SelectRoleScreen}
          options={{ title: 'Tu Rol' }}
        />

        {/* Adoptante */}
        <Stack.Screen
          name="AdopterHome"
          component={AdopterTabsNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdopterProfile"
          component={AdopterProfileScreen}
          options={{ title: 'Perfil del Adoptante' }}
        />
        <Stack.Screen
          name="Swipe"
          component={SwipeScreen}
          options={{ title: 'Explorar Mascotas' }}
        />

        {/* Publicador (Giver) */}
        <Stack.Screen
          name="GiverForm"
          component={GiverFormScreen}
          options={{ title: 'Publicar Mascota' }}
        />
        <Stack.Screen
          name="GiverHome" // Este carga el tab navigator con footer
          component={GiverTabsNavigator}
          options={{ headerShown: false }}
        />

        {/* Compartido */}
        <Stack.Screen
          name="PetDetail"
          component={PetDetailScreen}
          options={{ title: 'Detalles de la Mascota' }}
        />
        <Stack.Screen name="InterestedUsers" component={InterestedUsersScreen} />
        <Stack.Screen name="ConfirmedMatches" component={ConfirmedMatchesScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
