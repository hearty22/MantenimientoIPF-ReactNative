import {
  RecordingPresets,
  useAudioRecorder,
} from 'expo-audio';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Cargando } from '../../components/Cargando';
import { Explicacion } from '../../components/Explicacion';
import { usePermiso } from '../../hooks/usePermiso';

export default function Voz() {
  const { estado, pedir, abrirAjustes } = usePermiso('microfono');
  const [grabando, setGrabando] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
    undefined,
  );

  const empezar = async () => {
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setGrabando(true);
    } catch {
      // ignore
    }
  };

  const detener = async () => {
    setBusy(true);
    try {
      await recorder.stop();
    } finally {
      setBusy(false);
    }
    const u = recorder.uri;
    if (u) setUri(u);
    setGrabando(false);
  };

  const usar = () => {
    if (!uri) return;
    if (typeof (router as any).dismissTo === 'function') {
      (router as any).dismissTo({ pathname: '/reporte/nuevo', params: { voz: uri } });
    } else {
      router.replace({ pathname: '/reporte/nuevo', params: { voz: uri } });
    }
  };

  if (estado === 'cargando') return <Cargando />;

  if (estado === 'preguntable') {
    return (
      <Explicacion texto="Usamos el micrófono para grabar la descripción de voz del desperfecto.">
        <TouchableOpacity style={styles.btn} onPress={pedir}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }
  if (estado === 'bloqueado') {
    return (
      <Explicacion texto="El micrófono está desactivado para esta app.">
        <TouchableOpacity style={styles.btn} onPress={abrirAjustes}>
          <Text style={styles.btnText}>Abrir Ajustes</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }

  return (
    <View style={styles.container}>
      {grabando ? (
        <Text style={styles.estado}>Grabando…</Text>
      ) : (
        <Text style={styles.estado}>{uri ? 'Grabación lista' : 'Listo para grabar'}</Text>
      )}
      {busy ? <ActivityIndicator /> : null}
      <TouchableOpacity
        style={styles.btn}
        disabled={busy}
        onPress={grabando ? detener : empezar}
      >
        <Text style={styles.btnText}>{grabando ? 'Detener' : 'Grabar descripción'}</Text>
      </TouchableOpacity>
      {uri ? (
        <>
          <Text style={styles.uri} numberOfLines={1}>{uri}</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={usar}>
            <Text style={styles.saveText}>Usar esta grabación</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, alignItems: 'center' },
  estado: { fontSize: 16, marginTop: 24 },
  uri: { fontSize: 11, opacity: 0.5, maxWidth: '100%' },
  btn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#208AEF', borderRadius: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#16a34a', borderRadius: 8 },
  saveText: { color: 'white', fontWeight: '600' },
});