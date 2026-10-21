import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Cargando } from '../../components/Cargando';
import { useReportes } from '../../lib/reports';

export default function TabAvisos() {
  const { listo, avisos, obtenerReporte } = useReportes();
  if (!listo) return <Cargando />;

  if (avisos.length === 0) {
    return <Text style={styles.empty}>Sin avisos.</Text>;
  }

  return (
    <View style={styles.container}>
      {avisos.map((a) => (
        <TouchableOpacity
          key={a.id}
          style={styles.card}
          onPress={() => {
            const r = obtenerReporte(a.reporteId);
            if (r) router.push({ pathname: '/reporte/[id]', params: { id: r.id } });
          }}
        >
          <Text style={styles.mensaje}>{a.mensaje}</Text>
          <Text style={styles.fecha}>
            {new Date(a.createdAt).toLocaleString()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  empty: { textAlign: 'center', opacity: 0.5, marginTop: 24 },
  card: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, gap: 4 },
  mensaje: { fontSize: 14 },
  fecha: { fontSize: 11, opacity: 0.5 },
});