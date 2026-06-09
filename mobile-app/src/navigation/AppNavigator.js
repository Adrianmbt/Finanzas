import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import TransaccionesScreen from '../screens/TransaccionesScreen';
import NuevaTransaccionScreen from '../screens/NuevaTransaccionScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import { Colors, BorderRadius, Spacing } from '../theme';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Text style={styles.icon}>{emoji}</Text>
  </View>
);

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Transacciones"
        component={TransaccionesScreen}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="NuevaTransaccion"
        component={NuevaTransaccionScreen}
        options={{
          tabBarLabel: 'Agregar',
          tabBarIcon: ({ focused }) => (
            <View style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Categorias"
        component={CategoriasScreen}
        options={{
          tabBarLabel: 'Categorías',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📁" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  icon: {
    fontSize: 20,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.white,
    lineHeight: 30,
  },
});
