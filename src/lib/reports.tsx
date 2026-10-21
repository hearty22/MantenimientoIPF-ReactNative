import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'mant-ipf-v1';

export type Categoria = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';
export type EstadoReporte = 'pendiente' | 'en_curso' | 'resuelto';

export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  estado: EstadoReporte;
  foto?: string;
  voz?: string;
  ubicacion?: { lat: number; lng: number; aproximada: boolean };
  sector?: string;
  createdAt: number;
}

export interface Aviso {
  id: string;
  reporteId: string;
  mensaje: string;
  createdAt: number;
}

interface State {
  reportes: Reporte[];
  avisos: Aviso[];
  listo: boolean;
}

interface Store {
  reportes: Reporte[];
  avisos: Aviso[];
  listo: boolean;
  crearReporte: (
    input: Omit<Reporte, 'id' | 'estado' | 'createdAt'>,
  ) => Reporte;
  listarPropios: () => Reporte[];
  obtenerReporte: (id: string) => Reporte | undefined;
  simularResolucion: (id: string) => Promise<void>;
  cambiarEstado: (id: string, estado: EstadoReporte) => void;
  agregarAviso: (aviso: Omit<Aviso, 'id' | 'createdAt'>) => void;
}

const StoreContext = createContext<Store | null>(null);

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function ReportesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    reportes: [],
    avisos: [],
    listo: false,
  });

  // carga inicial
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as {
              reportes?: Reporte[];
              avisos?: Aviso[];
            };
            setState({
              reportes: parsed.reportes ?? [],
              avisos: parsed.avisos ?? [],
              listo: true,
            });
            return;
          } catch {
            // datos corruptos: ignorar y arrancar vacío
          }
        }
        setState((s) => ({ ...s, listo: true }));
      })
      .catch(() => setState((s) => ({ ...s, listo: true })));
  }, []);

  // persistencia (solo cuando ya cargó)
  useEffect(() => {
    if (!state.listo) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ reportes: state.reportes, avisos: state.avisos }),
    ).catch(() => {});
  }, [state.reportes, state.avisos, state.listo]);

  const agregarAviso = useCallback(
    (aviso: Omit<Aviso, 'id' | 'createdAt'>) => {
      const nuevo: Aviso = {
        id: genId(),
        reporteId: aviso.reporteId,
        mensaje: aviso.mensaje,
        createdAt: Date.now(),
      };
      setState((s) => ({ ...s, avisos: [nuevo, ...s.avisos] }));
    },
    [],
  );

  const crearReporte = useCallback(
    (input: Omit<Reporte, 'id' | 'estado' | 'createdAt'>): Reporte => {
      const nuevo: Reporte = {
        ...input,
        id: genId(),
        estado: 'pendiente',
        createdAt: Date.now(),
      };
      setState((s) => ({ ...s, reportes: [nuevo, ...s.reportes] }));
      return nuevo;
    },
    [],
  );

  const listarPropios = useCallback(() => {
    return [...state.reportes].sort((a, b) => b.createdAt - a.createdAt);
  }, [state.reportes]);

  const obtenerReporte = useCallback(
    (id: string) => state.reportes.find((r) => r.id === id),
    [state.reportes],
  );

  const cambiarEstado = useCallback((id: string, estado: EstadoReporte) => {
    setState((s) => ({
      ...s,
      reportes: s.reportes.map((r) =>
        r.id === id ? { ...r, estado } : r,
      ),
    }));
  }, []);

  const simularResolucion = useCallback(
    async (id: string) => {
      const rep = state.reportes.find((r) => r.id === id);
      if (!rep || rep.estado === 'resuelto') return;
      setState((s) => ({
        ...s,
        reportes: s.reportes.map((r) =>
          r.id === id ? { ...r, estado: 'resuelto' } : r,
        ),
      }));
      agregarAviso({
        reporteId: id,
        mensaje: `Tu reporte "${rep.titulo}" fue resuelto`,
      });

      // notificación local solo si hay permiso (consultar, no pedir aquí)
      const perm = await Notifications.getPermissionsAsync();
      if (!perm.granted) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reportes', {
          name: 'Reportes',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reporte resuelto',
          body: `Tu reporte "${rep.titulo}" fue resuelto`,
          data: { reporteId: id },
          ...(Platform.OS === 'android'
            ? { channelId: 'reportes' }
            : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
        },
      }).catch(() => {});
    },
    [state.reportes, agregarAviso],
  );

  const value = useMemo<Store>(
    () => ({
      reportes: state.reportes,
      avisos: state.avisos,
      listo: state.listo,
      crearReporte,
      listarPropios,
      obtenerReporte,
      simularResolucion,
      cambiarEstado,
      agregarAviso,
    }),
    [
      state.reportes,
      state.avisos,
      state.listo,
      crearReporte,
      listarPropios,
      obtenerReporte,
      simularResolucion,
      cambiarEstado,
      agregarAviso,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useReportes(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useReportes fuera de ReportesProvider');
  }
  return ctx;
}