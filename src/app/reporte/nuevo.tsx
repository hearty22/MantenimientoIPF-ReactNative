import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Cargando } from '../../components/Cargando';
import { useReportes, type Categoria } from '../../lib/reports';

const CATS: Categoria[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];

export default function NuevoReporte() {
  const { listo, crearReporte } = useReportes();
  const p = useLocalSearchParams();
  const aulaParam = Array.isArray(p.aula) ? p.aula[0] : p.aula;
  const fotoParam = Array.isArray(p.foto) ? p.foto[0] : p.foto;
  const sectorParam = Array.isArray(p.sector) ? p.sector[0] : p.sector;

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [aula, setAula] = useState(aulaParam ?? '');
  const [categoria, setCategoria] = useState<Categoria>('electricidad');
  const [foto, setFoto] = useState(fotoParam);
  const [sector, setSector] = useState(sectorParam);

  // sincronizar params si cambian (al regresar de otras pantallas)
  // useEffect con deps de params es suficiente; eslint-disable-next-line por setState condicional
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (aulaParam && aulaParam !== aula) setAula(aulaParam);
    if (fotoParam && fotoParam !== foto) setFoto(fotoParam);
    if (sectorParam && sectorParam !== sector) setSector(sectorParam);
  }, [aulaParam, fotoParam, sectorParam]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!listo) return <Cargando />;

  const guardar = () => {
    if (!titulo.trim() || !aula.trim()) return;
    const r = crearReporte({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      aula: aula.trim(),
      categoria,
      foto,
      sector,
    });
    router.replace({ pathname: '/reporte/[id]', params: { id: r.id } });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', default: undefined })}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Aula (o escaneá el QR)"
          value={aula}
          onChangeText={setAula}
        />
        <View style={styles.catRow}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.cat,
                categoria === c && styles.catSel,
              ]}
              onPress={() => setCategoria(c)}
            >
              <Text style={categoria === c ? styles.catTextSel : styles.catText}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {foto ? <Text style={styles.pill}>Foto adjunta ✓</Text> : null}
        {sector ? <Text style={styles.pill}>Sector: {sector}</Text> : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/reporte/escanear')}
          >
            <Text style={styles.btnText}>Escanear QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/reporte/foto')}
          >
            <Text style={styles.btnText}>Adjuntar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push('/reporte/ubicacion')}
          >
            <Text style={styles.btnText}>Marcar ubicación</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.saveBtn]}
          onPress={guardar}
        >
          <Text style={styles.saveText}>Guardar reporte</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cat: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  catSel: { backgroundColor: '#208AEF', borderColor: '#208AEF' },
  catText: { color: '#333' },
  catTextSel: { color: 'white' },
  buttonRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#eee', borderRadius: 8 },
  btnText: { color: '#222', fontSize: 13 },
  saveBtn: { backgroundColor: '#208AEF', marginTop: 8 },
  saveText: { color: 'white', fontWeight: '600' },
  pill: { fontSize: 12, color: '#16a34a' },
});