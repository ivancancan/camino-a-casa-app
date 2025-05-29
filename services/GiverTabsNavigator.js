import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GiverDashboardScreen from '../screens/GiverDashboardScreen'; // ✅ Asegúrate de importar el correcto
import GiverFormScreen from '../screens/GiverFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConfirmedMatchesScreen from '../screens/ConfirmedMatchesScreen';

const Tab = createBottomTabNavigator();

export default function GiverTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarStyle: { height: 60, paddingBottom: 5 },
      }}
    >
      <Tab.Screen
        name="MisMascotas"
        component={GiverDashboardScreen} // ✅ Aquí estaba el error
        options={{
          tabBarLabel: 'Mis Mascotas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Publicar"
        component={GiverFormScreen}
        options={{
          tabBarLabel: 'Publicar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={ConfirmedMatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
