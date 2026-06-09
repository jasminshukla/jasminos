import React from 'react';
import { Bell, FlaskConical, User } from 'lucide-react-native';
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
        options={({ route }) => ({
          title: route.params?.editItem ? 'Edit follow-up' : 'New follow-up',
          presentation: 'modal',
        })}
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
        options={({ route }) => ({
          title: route.params?.editItem ? 'Edit R&D item' : 'Save to R&D',
          presentation: 'modal',
        })}
      />
    </RndStack.Navigator>
  );
}

function tabIcon(Icon) {
  return ({ color, focused }) => (
    <Icon color={color} size={22} strokeWidth={focused ? 2.6 : 2} />
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
        options={{ tabBarIcon: tabIcon(Bell) }}
      />
      <Tab.Screen name="R&D" component={RndTab} options={{ tabBarIcon: tabIcon(FlaskConical) }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon(User) }}
      />
    </Tab.Navigator>
  );
}
