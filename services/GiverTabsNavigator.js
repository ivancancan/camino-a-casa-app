import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GiverDashboardScreen from '../screens/GiverDashboardScreen';
import GiverFormScreen from '../screens/GiverFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConfirmedMatchesScreen from '../screens/ConfirmedMatchesScreen';
import MessagesListScreen from '../screens/MessagesListScreen';

const Tab = createBottomTabNavigator();

export default function GiverTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80, // más alto para dar espacio al Home Indicator
          paddingBottom: 30, // espacio visual para evitar que lo tape
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Mis Mascotas"
        component={GiverDashboardScreen}
        options={{
          tabBarLabel: 'Mis Mascotas',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dog" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Publicar"
        component={GiverFormScreen}
        options={{
          tabBarLabel: 'Publicar',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="plus-box" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={ConfirmedMatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Mensajes"
        component={MessagesListScreen}
        options={{
          tabBarLabel: 'Mensajes',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Cuenta"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cuenta',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}