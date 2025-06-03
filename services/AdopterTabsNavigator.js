import React, { useEffect, useState, createContext } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SwipeScreen from '../screens/SwipeScreen';
import AdopterProfileScreen from '../screens/AdopterProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdopterMatchesScreen from '../screens/AdopterMatchesScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { useFocusEffect } from '@react-navigation/native';

export const UnreadCountContext = createContext({ unreadCount: 0, setUnreadCount: () => {} });

const Tab = createBottomTabNavigator();

const Badge = ({ count }) =>
  count > 0 ? (
    <View
      style={{
        position: 'absolute',
        right: -6,
        top: -4,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  ) : null;

export default function AdopterTabsNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenMatches, setUnseenMatches] = useState(0);

  const fetchCounts = async () => {
    try {
      const session = await getSession();
      if (!session?.token) return;

      const headers = { Authorization: `Bearer ${session.token}` };

      // Mensajes no leídos
      const res1 = await fetch(`${API_BASE}/api/messages/unread-counts`, { headers });
      const json1 = await res1.json();
      const totalUnread = Object.values(json1.counts || {}).reduce((sum, n) => sum + n, 0);
      setUnreadCount(totalUnread);

      // Matches no vistos
      const res2 = await fetch(`${API_BASE}/api/matches/unseen-count`, { headers });
      const json2 = await res2.json();
      setUnseenMatches(json2.unseenCount || 0);
    } catch (err) {
      console.error('❌ Error al obtener contadores:', err);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCounts();
    }, [])
  );

  return (
    <UnreadCountContext.Provider value={{ unreadCount, setUnreadCount }}>
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
            height: 75,
            paddingBottom: 20,
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
              <View>
                <MaterialCommunityIcons name="heart" color={color} size={24} />
                <Badge count={unseenMatches} />
              </View>
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
              <View>
                <MaterialCommunityIcons name="chat" color={color} size={24} />
                <Badge count={unreadCount} />
              </View>
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
    </UnreadCountContext.Provider>
  );
}
