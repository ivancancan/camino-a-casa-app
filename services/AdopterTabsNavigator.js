import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SwipeScreen from '../screens/SwipeScreen';
import AdopterProfileScreen from '../screens/AdopterProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdopterMatchesScreen from '../screens/AdopterMatchesScreen';
import MessagesListScreen from '../screens/MessagesListScreen';

const Tab = createBottomTabNavigator();

export default function AdopterTabsNavigator() {
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
          height: 80,
          paddingBottom: 30,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="Explorar"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="paw" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={AdopterMatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Preferencias"
        component={AdopterProfileScreen}
        options={{
          tabBarLabel: 'Mi Perfil',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-edit" color={color} size={24} />
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