import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SwipeScreen from '../screens/SwipeScreen';
import AdopterProfileScreen from '../screens/AdopterProfileScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Reutilizamos el mismo
import AdopterMatchesScreen from '../screens/AdopterMatchesScreen'; // ✅ Nuevo import
import MessagesListScreen from '../screens/MessagesListScreen'; // 📩 Nuevo import


const Tab = createBottomTabNavigator();

export default function AdopterTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarStyle: { height: 60, paddingBottom: 5 },
      }}
    >
      <Tab.Screen
        name="Explorar"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="paw" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={AdopterMatchesScreen} // ✅ Nueva pantalla
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Preferencias"
        component={AdopterProfileScreen}
        options={{
          tabBarLabel: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-edit" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cuenta"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cuenta',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
  name="Mensajes"
  component={MessagesListScreen}
  options={{
    tabBarLabel: 'Mensajes',
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons name="chat" color={color} size={size} />
    ),
  }}
/>

    </Tab.Navigator>
  );
}
