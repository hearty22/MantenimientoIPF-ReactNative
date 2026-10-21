import { Camera } from 'expo-camera';
import type { PermissionResponse } from 'expo';
import { Platform } from 'react-native';
import * as Audio from 'expo-audio';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export type Recurso = 'camara' | 'ubicacion' | 'notificaciones' | 'microfono';

export type EstadoPermiso =
  | 'cargando'
  | 'concedido'
  | 'preguntable'
  | 'bloqueado';

export type Parcial =
  | { tipo: 'fotos-limitadas' }
  | { tipo: 'ubicacion-aproximada'; valor: 'coarse' | 'reduced' }
  | { tipo: 'notificacion-provisional' }
  | null;

export type Registro = {
  get: () => Promise<PermissionResponse>;
  request: () => Promise<PermissionResponse>;
};

export const registro: Record<Recurso, Registro> = {
  camara: {
    get: () => Camera.getCameraPermissionsAsync(),
    request: () => Camera.requestCameraPermissionsAsync(),
  },
  ubicacion: {
    get: () => Location.getForegroundPermissionsAsync(),
    request: () => Location.requestForegroundPermissionsAsync(),
  },
  notificaciones: {
    get: () => Notifications.getPermissionsAsync(),
    request: () =>
      Platform.OS === 'ios'
        ? Notifications.requestPermissionsAsync({
            ios: { allowProvisional: true },
          })
        : Notifications.requestPermissionsAsync(),
  },
  microfono: {
    get: () => Audio.getRecordingPermissionsAsync(),
    request: () => Audio.requestRecordingPermissionsAsync(),
  },
};

export function normalizar(
  r: PermissionResponse | null,
): EstadoPermiso {
  if (!r) return 'cargando';
  if (r.granted) return 'concedido';
  return r.canAskAgain ? 'preguntable' : 'bloqueado';
}

export function parcialDe(
  recurso: Recurso,
  r: PermissionResponse | null,
): Parcial {
  if (!r || !r.granted) return null;
  const android = (r as unknown as { android?: { accuracy?: string } }).android;
  const ios = (r as unknown as { ios?: { accuracy?: string } }).ios;
  const accessPrivileges = (r as unknown as { accessPrivileges?: string }).accessPrivileges;
  if (recurso === 'camara' && accessPrivileges === 'limited') {
    return { tipo: 'fotos-limitadas' };
  }
  if (recurso === 'ubicacion') {
    if (android?.accuracy === 'coarse') {
      return { tipo: 'ubicacion-aproximada', valor: 'coarse' };
    }
    if (ios?.accuracy === 'reduced') {
      return { tipo: 'ubicacion-aproximada', valor: 'reduced' };
    }
  }
  if (recurso === 'notificaciones') {
    const iosStatus = (
      r as unknown as { ios?: { status?: number } }
    ).ios?.status;
    if (
      iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return { tipo: 'notificacion-provisional' };
    }
  }
  return null;
}