import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import { Cargando } from '../../components/Cargando';
import { Explicacion } from '../../components/Explicacion';
import { usePermiso } from '../../hooks/usePermiso';

export default function Foto() {
  const { estado, pedir, abrirAjustes } = usePermiso('camara');
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const usar = (uri: string) => {
    // mismo patrón de retorno que escanear
    if (typeof (router as any).dismissTo === 'function') {
      (router as any).dismissTo({ pathname: '/reporte/nuevo', params: { foto: uri } });
    } else {
      router.replace({ pathname: '/reporte/nuevo', params: { foto: uri } });
    }
  };

  // flujo "sacar foto" con permiso de cámara
  if (preview === null && estado === 'preguntable') {
    // muestra pantalla previa + opción de sacar foto
    return (
      <Explicacion texto="Usamos la cámara para sacar la foto del desperfecto.">
        <TouchableOpacity style={styles.btn} onPress={pedir}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnGhost}
          onPress={async () => {
            const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never });
            if (!r.canceled && r.assets[0]) setPreview(r.assets[0].uri);
          }}
        >
          <Text style={styles.btnGhostText}>Elegir de la galería (sin permiso)</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }

  if (estado === 'cargando') return <Cargando />;

  if (estado === 'bloqueado') {
    return (
      <Explicacion texto="La cámara está desactivada para esta app.">
        <Text style={styles.path}>Abrí Ajustes para habilitar la cámara.</Text>
        <TouchableOpacity style={styles.btn} onPress={abrirAjustes}>
          <Text style={styles.btnText}>Abrir Ajustes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnGhost}
          onPress={async () => {
            const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never });
            if (!r.canceled && r.assets[0]) setPreview(r.assets[0].uri);
          }}
        >
          <Text style={styles.btnGhostText}>Elegir de la galería (sin permiso)</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }

  // concedido (o galería elegida) → mostrar acciones/preview
  return (
    <View style={styles.container}>
      <Text style={styles.note}>
        {'«Elegir de la galería» no pide permiso: elegís con el selector del sistema.'}
      </Text>
      {busy ? <ActivityIndicator /> : null}
      <TouchableOpacity
        style={styles.btn}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] as never, quality: 0.5 });
          setBusy(false);
          if (!r.canceled && r.assets[0]) setPreview(r.assets[0].uri);
        }}
      >
        <Text style={styles.btnText}>Sacar foto</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btnGhost}
        onPress={async () => {
          const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never });
          if (!r.canceled && r.assets[0]) setPreview(r.assets[0].uri);
        }}
      >
        <Text style={styles.btnGhostText}>Elegir de la galería (sin permiso)</Text>
      </TouchableOpacity>

      {preview ? (
        <>
          <Image source={{ uri: preview }} style={styles.preview} />
          <TouchableOpacity style={styles.saveBtn} onPress={() => usar(preview)}>
            <Text style={styles.saveText}>Usar esta foto</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#208AEF', borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '600' },
  btnGhost: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#208AEF', alignItems: 'center' },
  btnGhostText: { color: '#208AEF' },
  saveBtn: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: '600' },
  preview: { width: '100%', height: 240, borderRadius: 8, marginTop: 8 },
  note: { fontSize: 12, opacity: 0.6, textAlign: 'center' },
  path: { fontSize: 12, opacity: 0.6, marginTop: 4, textAlign: 'center' },
});