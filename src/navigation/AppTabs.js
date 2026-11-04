import React from 'react';
import { Bell, FlaskConical, ListChecks, User, Wallet } from 'lucide-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FollowUpListScreen from '../screens/FollowUpListScreen';
import AddFollowUpScreen from '../screens/AddFollowUpScreen';
import RnDListScreen from '../screens/RnDListScreen';
import AddRnDScreen from '../screens/AddRnDScreen';
import WalletScreen from '../screens/WalletScreen';
import HistoryScreen from '../screens/HistoryScreen';
import InsightsScreen from '../screens/InsightsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AddAccountScreen from '../screens/AddAccountScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const FollowStack = createNativeStackNavigator();
const RndStack = createNativeStackNavigator();
const MoneyStack = createNativeStackNavigator();
const TasksStack = createNativeStackNavigator();

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

function MoneyTab() {
  return (
    <MoneyStack.Navigator screenOptions={stackScreenOptions}>
      <MoneyStack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
      <MoneyStack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Transaction history' }}
      />
      <MoneyStack.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: 'Insights' }}
      />
      <MoneyStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={({ route }) => ({
          title: route.params?.editItem
            ? 'Edit transaction'
            : route.params?.kind === 'income'
              ? 'Add income'
              : 'Add expense',
          presentation: 'modal',
        })}
      />
      <MoneyStack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={({ route }) => ({
          title: route.params?.editItem ? 'Edit account' : 'Add account',
          presentation: 'modal',
        })}
      />
    </MoneyStack.Navigator>
  );
}

function TasksTab() {
  return (
    <TasksStack.Navigator screenOptions={stackScreenOptions}>
      <TasksStack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ headerShown: false }}
      />
      <TasksStack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={({ route }) => ({
          title: route.params?.editItem ? 'Edit task' : 'New task',
          presentation: 'modal',
        })}
      />
    </TasksStack.Navigator>
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
      <Tab.Screen name="Money" component={MoneyTab} options={{ tabBarIcon: tabIcon(Wallet) }} />
      <Tab.Screen name="Tasks" component={TasksTab} options={{ tabBarIcon: tabIcon(ListChecks) }} />
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
