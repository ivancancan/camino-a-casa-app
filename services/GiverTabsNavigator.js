import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GiverDashboardScreen from '../screens/GiverDashboardScreen';
import GiverFormScreen from '../screens/GiverFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConfirmedMatchesScreen from '../screens/ConfirmedMatchesScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import { getSession } from '../services/sessionService';
import { API_BASE } from '../services/Api';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const Badge = ({ count }) =>
  count > 0 ? (
    <View
      style={{
        position: 'absolute',
        right: -6,
        top: -4,
        backgroundColor: '#a259ff',
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

const IconWithBadge = ({ name, color, badgeCount }) => (
  <View>
    <MaterialCommunityIcons name={name} color={color} size={24} />
    <Badge count={badgeCount} />
  </View>
);

export default function GiverTabsNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unseenMatches, setUnseenMatches] = useState(0);

  const fetchCounts = async () => {
    try {
      const session = await getSession();
      if (!session?.token) return;

      const headers = { Authorization: `Bearer ${session.token}` };

      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE}/api/messages/unread-counts`, { headers }),
        fetch(`${API_BASE}/api/matches/unseen-count`, { headers }),
      ]);

      const json1 = await res1.json();
      const json2 = await res2.json();

      const totalUnread = Object.values(json1.counts || {}).reduce(
        (sum, n) => sum + n,
        0
      );
      setUnreadCount(totalUnread);
      setUnseenMatches(json2.unseenCount || 0);
    } catch (err) {
      console.error('❌ Error al obtener contadores:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCounts();
    }, [])
  );

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
            <IconWithBadge name="heart" color={color} badgeCount={unseenMatches} />
          ),
        }}
      />
      <Tab.Screen
        name="Mensajes"
        component={MessagesListScreen}
        options={{
          tabBarLabel: 'Mensajes',
          tabBarIcon: ({ color }) => (
            <IconWithBadge name="chat" color={color} badgeCount={unreadCount} />
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
