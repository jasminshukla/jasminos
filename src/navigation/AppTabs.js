import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FollowUpListScreen from '../screens/FollowUpListScreen';
import AddFollowUpScreen from '../screens/AddFollowUpScreen';
import RnDListScreen from '../screens/RnDListScreen';
import AddRnDScreen from '../screens/AddRnDScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const FollowStack = createNativeStackNavigator();
const RndStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '800' },
  contentStyle: { backgroundColor: colors.bg },
};

function FollowUpsTab() {
  return (
    <FollowStack.Navigator screenOptions={stackScreenOptions}>
      <FollowStack.Screen
        name="FollowUpList"
        component={FollowUpListScreen}
        options={{ headerShown: false }}
      />
      <FollowStack.Screen
        name="AddFollowUp"
        component={AddFollowUpScreen}
        options={{ title: 'New follow-up', presentation: 'modal' }}
      />
    </FollowStack.Navigator>
  );
}

function RndTab() {
  return (
    <RndStack.Navigator screenOptions={stackScreenOptions}>
      <RndStack.Screen name="RnDList" component={RnDListScreen} options={{ headerShown: false }} />
      <RndStack.Screen
        name="AddRnD"
        component={AddRnDScreen}
        options={{ title: 'Save to R&D', presentation: 'modal' }}
      />
    </RndStack.Navigator>
  );
}

function tabIcon(emoji) {
  return ({ focused }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Follow-ups"
        component={FollowUpsTab}
        options={{ tabBarIcon: tabIcon('🔔') }}
      />
      <Tab.Screen name="R&D" component={RndTab} options={{ tabBarIcon: tabIcon('🧪') }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('👤') }}
      />
    </Tab.Navigator>
  );
}
