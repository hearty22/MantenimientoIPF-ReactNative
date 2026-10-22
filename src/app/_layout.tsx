import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

import { ReportesProvider } from '../lib/reports';
import {
  setNotificationHandler,
  suscribirTapToOpen,
} from '../lib/notificaciones';

export default function RootLayout() {
  useEffect(() => {
    setNotificationHandler();
    const unsubscribe = suscribirTapToOpen((id) => {
      router.push({
        pathname: '/reporte/[id]',
        params: { id },
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
