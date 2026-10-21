import { StyleSheet, Text, View } from 'react-native';

import { PanelPermiso } from '../../components/PanelPermiso';

export default function TabPermisos() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Estado de permisos</Text>
      <PanelPermiso recurso="camara" etiqueta="Cámara" />
      <PanelPermiso recurso="ubicacion" etiqueta="Ubicación" />
      <PanelPermiso recurso="notificaciones" etiqueta="Notificaciones" />
      <PanelPermiso recurso="microfono" etiqueta="Micrófono" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  titulo: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
});