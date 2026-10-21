import { StyleSheet, Text, View } from 'react-native';

export function Explicacion({
  titulo,
  texto,
  children,
}: {
  titulo?: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.box}>
      {titulo ? <Text style={styles.titulo}>{titulo}</Text> : null}
      <Text style={styles.texto}>{texto}</Text>
      <View style={styles.actions}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12 },
  titulo: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  texto: { fontSize: 15, textAlign: 'center', opacity: 0.8 },
  actions: { marginTop: 8, gap: 8 },
});