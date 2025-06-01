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

export const UnreadCountContext = createContext({ unreadCount: 0, setUnreadCount: () => {} });

const Tab = createBottomTabNavigator();

export default function AdopterTabsNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const session = await getSession();
        const res = await fetch(`${API_BASE}/api/messages/unread-counts`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        const json = await res.json();
        const total = Object.values(json.counts || {}).reduce((sum, n) => sum + n, 0);
        setUnreadCount(total);
      } catch (err) {
        console.error('❌ Error al obtener mensajes no leídos:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); // refrescar cada 10 seg
    return () => clearInterval(interval);
  }, []);

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
              <View>
                <MaterialCommunityIcons name="chat" color={color} size={24} />
                {unreadCount > 0 && (
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
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
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
