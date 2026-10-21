import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';

import { usePermiso } from '../hooks/usePermiso';

export default function AjustesApp() {
  const { estado, pedir, abrirAjustes } = usePermiso('notificaciones');
  const [avisar, setAvisar] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async (value: boolean) => {
    if (!value) {
      setAvisar(false);
      return;
    }
    setBusy(true);
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reportes', {
          name: 'Reportes',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      const res = await pedir();
      setAvisar(!!res?.granted);
    } finally {
      setBusy(false);
    }
  };

  if (estado === 'cargando') return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Avisarme cuando se resuelva mi reporte</Text>
        <Switch value={avisar} onValueChange={toggle} disabled={busy} />
      </View>
      {estado === 'bloqueado' ? (
        <TouchableOpacity onPress={abrirAjustes}>
          <Text style={styles.link}>Abrir Ajustes para habilitar notificaciones</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={styles.linkBtn}
        onPress={() => router.push('/avisos')}
      >
        <Text style={styles.link}>Ver bandeja de avisos dentro de la app</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 15, flex: 1, marginRight: 12 },
  link: { color: '#208AEF', marginTop: 4 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
});