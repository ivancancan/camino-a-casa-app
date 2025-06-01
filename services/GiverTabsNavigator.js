 import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GiverDashboardScreen from '../screens/GiverDashboardScreen';
import GiverFormScreen from '../screens/GiverFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConfirmedMatchesScreen from '../screens/ConfirmedMatchesScreen';
import MessagesListScreen from '../screens/MessagesListScreen'; // ✅ nuevo

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
        name="Mis Mascotas"
        component={GiverDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Publicar"
        component={GiverFormScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches Confirmados"
        component={ConfirmedMatchesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Mensajes"
        component={MessagesListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cuenta"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
