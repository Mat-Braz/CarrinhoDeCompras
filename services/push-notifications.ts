import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerPushToken } from '@/services/shop-api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return;
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  const permission =
    existingPermission.status === 'granted'
      ? existingPermission
      : await Notifications.requestPermissionsAsync();

  if (permission.status !== 'granted') {
    return;
  }

  const token = await Notifications.getDevicePushTokenAsync();

  if (token.data) {
    await registerPushToken({
      plataforma: Platform.OS,
      token: String(token.data),
    });
  }
}
