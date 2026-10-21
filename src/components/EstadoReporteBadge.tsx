import { StyleSheet, Text, View } from 'react-native';
import type { EstadoReporte } from '../lib/reports';

const color: Record<EstadoReporte, string> = {
  pendiente: '#b45309',
  en_curso: '#1d4ed8',
  resuelto: '#16a34a',
};

export function EstadoReporteBadge({ estado }: { estado: EstadoReporte }) {
  return (
    <View style={[styles.badge, { backgroundColor: color[estado] }]}>
      <Text style={styles.text}>{estado}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  text: { color: 'white', fontSize: 12 },
});