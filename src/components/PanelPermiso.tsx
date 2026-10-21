import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePermiso, type Recurso } from '../hooks/usePermiso';

export function PanelPermiso({
  recurso,
  etiqueta,
}: {
  recurso: Recurso;
  etiqueta: string;
}) {
  const { estado, parcial, crudo, pedir, abrirAjustes } = usePermiso(recurso);

  const acceso =
    (crudo as unknown as { accessPrivileges?: string } | null)?.accessPrivileges;
  const matiz =
    parcial?.tipo === 'ubicacion-aproximada'
      ? `ubicación ${parcial.valor}`
      : parcial?.tipo === 'fotos-limitadas'
        ? 'fotos limitadas'
        : parcial?.tipo === 'notificacion-provisional'
          ? 'provisional'
          : acceso ?? '';

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{etiqueta}</Text>
        <Text style={styles.estado}>
          {estado} · {Platform.OS}
          {matiz ? ` · ${matiz}` : ''}
        </Text>
      </View>
      {estado === 'preguntable' ? (
        <TouchableOpacity style={styles.btn} onPress={pedir}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
      ) : null}
      {estado === 'bloqueado' ? (
        <TouchableOpacity style={styles.btn} onPress={abrirAjustes}>
          <Text style={styles.btnText}>Abrir Ajustes</Text>
        </TouchableOpacity>
      ) : null}
      {estado === 'concedido' ? (
        <Text style={styles.ok}>concedido</Text>
      ) : null}
      {estado === 'cargando' ? <Text style={styles.ok}>…</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nombre: { fontSize: 16, fontWeight: '500' },
  estado: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#208AEF' },
  btnText: { color: 'white', fontSize: 12 },
  ok: { fontSize: 12, opacity: 0.5 },
});