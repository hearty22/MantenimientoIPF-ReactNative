import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Cargando } from '../../components/Cargando';
import { EstadoReporteBadge } from '../../components/EstadoReporteBadge';
import { useReportes } from '../../lib/reports';

export default function TabReportes() {
  const { listo, listarPropios } = useReportes();

  if (!listo) return <Cargando />;

  const reportes = listarPropios();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/reporte/nuevo')}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>+</Text>
        <Text style={styles.fabText}>Nuevo reporte</Text>
      </TouchableOpacity>

      {reportes.length === 0 ? (
        <Text style={styles.empty}>Sin reportes todavía.</Text>
      ) : (
        reportes.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={styles.card}
            onPress={() =>
              router.push({ pathname: '/reporte/[id]', params: { id: r.id } })
            }
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.titulo}>{r.titulo}</Text>
              <Text style={styles.meta}>{r.aula} · {r.categoria}</Text>
              <EstadoReporteBadge estado={r.estado} />
            </View>
            {r.foto ? (
              <Image source={{ uri: r.foto }} style={styles.foto} resizeMode="cover" />
            ) : null}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 10 },
  fab: {
    backgroundColor: '#208AEF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fabText: { color: 'white', fontWeight: '600' },
  empty: { textAlign: 'center', opacity: 0.5, marginTop: 24 },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titulo: { fontWeight: '500', fontSize: 15 },
  meta: { fontSize: 12, opacity: 0.6 },
  foto: { width: 48, height: 48, borderRadius: 6 },
});