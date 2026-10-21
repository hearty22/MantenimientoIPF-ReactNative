import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import { Cargando } from '../../components/Cargando';
import { Explicacion } from '../../components/Explicacion';
import { usePermiso } from '../../hooks/usePermiso';

export default function Escanear() {
  const { estado, pedir, abrirAjustes } = usePermiso('camara');
  const [escaneado, setEscaneado] = useState(false);

  if (estado === 'cargando') return <Cargando />;

  if (estado === 'concedido') {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={(ev) => {
            if (escaneado) return;
            setEscaneado(true);
            try {
              if (typeof (router as any).dismissTo === 'function') {
                (router as any).dismissTo({
                  pathname: '/reporte/nuevo',
                  params: { aula: ev.data },
                });
              } else {
                router.replace({ pathname: '/reporte/nuevo', params: { aula: ev.data } });
              }
            } catch {
              router.replace({ pathname: '/reporte/nuevo', params: { aula: ev.data } });
            }
          }}
        />
        {escaneado ? <Text style={styles.scanned}>Escaneado</Text> : null}
      </View>
    );
  }

  if (estado === 'preguntable') {
    return (
      <Explicacion texto="Usamos la cámara para leer el QR pegado en la puerta del aula.">
        <TouchableOpacity style={styles.btn} onPress={pedir}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }

  // bloqueado
  const path =
    Platform.OS === 'android'
      ? 'Ajustes > Apps > Mantenimiento IPF > Permisos'
      : 'Ajustes > Mantenimiento IPF';
  return (
    <Explicacion texto="La cámara está desactivada para esta app.">
      <Text style={styles.path}>{path}</Text>
      <TouchableOpacity style={styles.btn} onPress={abrirAjustes}>
        <Text style={styles.btnText}>Abrir Ajustes</Text>
      </TouchableOpacity>
    </Explicacion>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#208AEF', borderRadius: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  path: { fontSize: 12, opacity: 0.6, marginTop: 4, textAlign: 'center' },
  scanned: { position: 'absolute', bottom: 40, alignSelf: 'center', color: 'white', backgroundColor: 'rgba(0,0,0,.6)', padding: 8, borderRadius: 8 },
});