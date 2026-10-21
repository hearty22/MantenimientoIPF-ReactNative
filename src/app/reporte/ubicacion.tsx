import * as Location from 'expo-location';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Cargando } from '../../components/Cargando';
import { Explicacion } from '../../components/Explicacion';
import { usePermiso } from '../../hooks/usePermiso';

export default function Ubicacion() {
  const { estado, parcial, pedir, abrirAjustes } = usePermiso('ubicacion');
  const aproximada = parcial?.tipo === 'ubicacion-aproximada';

  if (estado === 'cargando') return <Cargando />;

  const volverConCoords = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const params: Record<string, string> = {
        lat: String(coords.latitude),
        lng: String(coords.longitude),
        aproximada: aproximada ? '1' : '0',
      };
      if (typeof (router as any).dismissTo === 'function')
        (router as any).dismissTo({ pathname: '/reporte/nuevo', params });
      else router.replace({ pathname: '/reporte/nuevo', params });
    } catch {
      // ignore
    }
  };

  if (estado === 'preguntable') {
    return (
      <Explicacion texto="Usamos tu ubicación para marcar dónde está el problema que reportás.">
        <TouchableOpacity style={styles.btn} onPress={pedir}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }

  if (estado === 'bloqueado') {
    return (
      <Explicacion texto="La ubicación está desactivada para esta app.">
        <TouchableOpacity
          style={styles.btnSector}
          onPress={() => {
            const params = { sector: 'patio' };
            if (typeof (router as any).dismissTo === 'function')
              (router as any).dismissTo({ pathname: '/reporte/nuevo', params });
            else router.replace({ pathname: '/reporte/nuevo', params });
          }}
        >
          <Text style={styles.btnText}>Elegir sector a mano</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={abrirAjustes}>
          <Text style={styles.btnText}>Abrir Ajustes</Text>
        </TouchableOpacity>
      </Explicacion>
    );
  }

  // concedido
  return (
    <View style={styles.container}>
      {aproximada ? <Text style={styles.note}>Ubicación aproximada</Text> : null}
      <TouchableOpacity style={styles.btn} onPress={volverConCoords}>
        <Text style={styles.btnText}>Usar mi ubicación actual</Text>
      </TouchableOpacity>
      <Text style={styles.label}>O elegir sector a mano:</Text>
      <View style={styles.sectors}>
        {['patio', 'estacionamiento', 'pasillo'].map((s) => (
          <TouchableOpacity
            key={s}
            style={styles.btnSector}
            onPress={() => {
              const params = { sector: s };
              if (typeof (router as any).dismissTo === 'function')
                (router as any).dismissTo({ pathname: '/reporte/nuevo', params });
              else router.replace({ pathname: '/reporte/nuevo', params });
            }}
          >
            <Text style={styles.btnText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  note: { fontSize: 12, opacity: 0.6, textAlign: 'center' },
  label: { marginTop: 8, fontSize: 13, opacity: 0.6 },
  sectors: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  btn: { padding: 12, backgroundColor: '#208AEF', borderRadius: 8, alignItems: 'center' },
  btnSector: { padding: 10, backgroundColor: '#8b5cf6', borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '600' },
});