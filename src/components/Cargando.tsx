import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <View style={styles.box}>
      <ActivityIndicator />
      <Text style={styles.text}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { opacity: 0.6 },
});