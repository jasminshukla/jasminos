import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Show notifications even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Ask the OS for permission to post notifications. Call once on app start.
export async function registerForNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5B8CFF',
    });
  }

  if (!Device.isDevice) {
    // Notifications only fire on a physical device, but we don't block the app.
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const res = await Notifications.requestPermissionsAsync();
    status = res.status;
  }
  return status === 'granted';
}

// Schedule a one-off local notification at `date`. Returns the notification id
// (store it so the reminder can be cancelled later) or null if the date is past.
export async function scheduleReminder({ title, body, date }) {
  const when = new Date(date);
  if (isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    return null;
  }
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: title || 'Follow-up reminder',
      body: body || 'You have a follow-up due.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: 'reminders',
    },
  });
  return id;
}

export async function cancelReminder(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn('cancelReminder failed', e);
  }
}
