import { useLocalSearchParams, router } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Cargando } from '../../components/Cargando';
import { Explicacion } from '../../components/Explicacion';
import { usePermiso, type Recurso } from '../../hooks/usePermiso';

const BENEFICIO: Record<Recurso, string> = {
  camara: 'Usamos la cámara para leer el QR del aula.',
  ubicacion: 'Usamos tu ubicación para marcar dónde está el problema que reportás.',
  notificaciones: 'Usamos las notificaciones para avisarte cuando tu reporte se resuelva.',
  microfono: 'Usamos el micrófono para grabar la descripción de voz del desperfecto.',
};

const RECURSOS: Recurso[] = ['camara', 'ubicacion', 'notificaciones', 'microfono'];

export default function PantallaPrevia() {
  const { recurso, from } = useLocalSearchParams<{ recurso: string; from?: string }>();
  const r = (recurso ?? '') as Recurso;
  const valido = RECURSOS.includes(r);
  const { estado, pedir, abrirAjustes } = usePermiso(
    valido ? r : 'camara',
  );

  if (!valido) {
    return (
      <View style={styles.container}>
        <Text>Recurso no válido.</Text>
      </View>
    );
  }
  const texto = BENEFICIO[r];

  const irDestino = () => {
    if (from) {
      if (typeof (router as any).dismissTo === 'function')
        (router as any).dismissTo({ pathname: from });
      else router.replace(from as never);
    } else {
      router.back();
    }
  };

  if (estado === 'cargando') return <Cargando />;

  if (estado === 'concedido') {
    return (
      <Explicacion titulo="Ya tenés este permiso" texto={texto}>
        <TouchableOpacity style={styles.btn} onPress={irDestino}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }

  if (estado === 'preguntable') {
    return (
      <Explicacion titulo={texto} texto="La decisión se puede cambiar cuando quieras en Ajustes.">
        <TouchableOpacity
          style={styles.btn}
          onPress={async () => {
            const res = await pedir();
            if (res?.granted && from) irDestino();
          }}
        >
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
    <Explicacion titulo="Permiso bloqueado" texto={`Cómo habilitarlo: ${path}.`}>
      <TouchableOpacity style={styles.btn} onPress={abrirAjustes}>
        <Text style={styles.btnText}>Abrir Ajustes</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>{texto}</Text>
    </Explicacion>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#208AEF', borderRadius: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  hint: { fontSize: 12, opacity: 0.5, marginTop: 8, textAlign: 'center' },
});