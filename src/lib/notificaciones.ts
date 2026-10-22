import { Platform } from 'react-native';

type Notifs = typeof import('expo-notifications');

let cached: Notifs | null | undefined;

export function getNotificaciones(): Notifs | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as Notifs;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export function setNotificationHandler() {
  const N = getNotificaciones();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function suscribirTapToOpen(
  onOpen: (reporteId: string) => void,
): (() => void) | null {
  const N = getNotificaciones();
  if (!N) return null;
  const sub = N.addNotificationResponseReceivedListener((resp) => {
    const id = resp.notification.request.content.data?.reporteId;
    if (id) onOpen(String(id));
  });
  return () => sub.remove();
}

export async function crearCanalAndroid() {
  if (Platform.OS !== 'android') return;
  const N = getNotificaciones();
  if (!N) return;
  await N.setNotificationChannelAsync('reportes', {
    name: 'Reportes',
    importance: N.AndroidImportance.DEFAULT,
  });
}

export async function pedirNotificaciones() {
  const N = getNotificaciones();
  if (!N) return null;
  return Platform.OS === 'ios'
    ? N.requestPermissionsAsync({ ios: { allowProvisional: true } })
    : N.requestPermissionsAsync();
}

export async function programarNotificacionResolucion(
  reporteId: string,
  titulo: string,
) {
  const N = getNotificaciones();
  if (!N) return;
  const perm = await N.getPermissionsAsync().catch(() => null);
  if (!perm?.granted) return;

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('reportes', {
      name: 'Reportes',
      importance: N.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }

  await N.scheduleNotificationAsync({
    content: {
      title: 'Reporte resuelto',
      body: `Tu reporte "${titulo}" fue resuelto`,
      data: { reporteId },
      ...(Platform.OS === 'android' ? { channelId: 'reportes' } : {}),
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  }).catch(() => {});
}

