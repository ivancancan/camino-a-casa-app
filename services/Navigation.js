import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PetDetailScreen from '../screens/PetDetailScreen';
import SelectRoleScreen from '../screens/SelectRoleScreen';

import SwipeScreen from '../screens/SwipeScreen';
import GiverFormScreen from '../screens/GiverFormScreen';
import AdopterProfileScreen from '../screens/AdopterProfileScreen';

import GiverTabsNavigator from '../services/GiverTabsNavigator';
import AdopterTabsNavigator from '../services/AdopterTabsNavigator';
import InterestedUsersScreen from '../screens/InterestedUsersScreen';
import ConfirmedMatchesScreen from '../screens/ConfirmedMatchesScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function Navigation({ initialRoute = 'Login' }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={({ navigation }) => ({
          headerBackTitleVisible: false,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color="#333"
                style={{ marginLeft: 16 }}
              />
            </TouchableOpacity>
          ),
        })}
      >
        {/* Auth */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
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

        {/* Publicador */}
        <Stack.Screen
          name="GiverForm"
          component={GiverFormScreen}
          options={{ title: 'Publicar Mascota' }}
        />
        <Stack.Screen
          name="GiverHome"
          component={GiverTabsNavigator}
          options={{ headerShown: false, title: '' }}
        />

        {/* Compartido */}
        <Stack.Screen
          name="PetDetail"
          component={PetDetailScreen}
          options={{ title: 'Detalles de la Mascota' }}
        />
        <Stack.Screen
          name="InterestedUsers"
          component={InterestedUsersScreen}
        />
        <Stack.Screen
          name="ConfirmedMatches"
          component={ConfirmedMatchesScreen}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ title: 'Chat' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
