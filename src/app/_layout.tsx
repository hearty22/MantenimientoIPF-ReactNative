import { Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { ReportesProvider } from '../lib/reports';

// Mostrar notificaciones en foreground (banner)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  // Tap-to-open
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const id = resp.notification.request.content.data?.reporteId;
      if (id) {
        router.push({
          pathname: '/reporte/[id]',
          params: { id: String(id) },
        });
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <ReportesProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reporte/nuevo" options={{ title: 'Nuevo reporte' }} />
        <Stack.Screen name="reporte/escanear" options={{ title: 'Escanear QR' }} />
        <Stack.Screen name="reporte/foto" options={{ title: 'Adjuntar foto' }} />
        <Stack.Screen name="reporte/ubicacion" options={{ title: 'Ubicación' }} />
        <Stack.Screen name="reporte/[id]" options={{ title: 'Detalle' }} />
        <Stack.Screen name="ajustes-app" options={{ title: 'Ajustes' }} />
        <Stack.Screen
          name="permisos/[recurso]"
          options={{ title: '', presentation: 'modal' }}
        />
      </Stack>
    </ReportesProvider>
  );
}