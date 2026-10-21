import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Cargando } from '../../components/Cargando';
import { EstadoReporteBadge } from '../../components/EstadoReporteBadge';
import { useReportes } from '../../lib/reports';

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { listo, obtenerReporte, simularResolucion } = useReportes();

  if (!listo) return <Cargando />;

  const r = obtenerReporte(id ?? '');
  if (!r) {
    return (
      <View style={styles.container}>
        <Text>El reporte no existe.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{r.titulo}</Text>
      <Text style={styles.meta}>{r.aula} · {r.categoria}</Text>
      <EstadoReporteBadge estado={r.estado} />
      {r.descripcion ? <Text style={styles.desc}>{r.descripcion}</Text> : null}
      {r.foto ? <Image source={{ uri: r.foto }} style={styles.foto} /> : null}
      {r.ubicacion ? (
        <Text style={styles.meta}>
          Ubicación: {r.ubicacion.aproximada ? 'Ubicación aproximada' : `${r.ubicacion.lat}, ${r.ubicacion.lng}`}
        </Text>
      ) : null}
      {r.sector ? <Text style={styles.meta}>Sector: {r.sector}</Text> : null}
      <Text style={styles.meta}>
        {new Date(r.createdAt).toLocaleString()}
      </Text>
      {r.estado !== 'resuelto' ? (
        <TouchableOpacity style={styles.btn} onPress={() => simularResolucion(r.id)}>
          <Text style={styles.btnText}>Simular resolución</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  titulo: { fontSize: 18, fontWeight: '600' },
  meta: { fontSize: 12, opacity: 0.6 },
  desc: { fontSize: 14, marginTop: 4 },
  foto: { width: '100%', height: 200, borderRadius: 8, marginTop: 8 },
  btn: { marginTop: 12, padding: 12, backgroundColor: '#208AEF', borderRadius: 8, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '600' },
  link: { color: '#208AEF', marginTop: 8 },
});