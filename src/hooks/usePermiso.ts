import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import type { PermissionResponse } from 'expo';
import {
  normalizar,
  parcialDe,
  registro,
  type EstadoPermiso,
  type Parcial,
  type Recurso,
} from '../lib/permisos';
import { useRevisarAlVolver } from './useRevisarAlVolver';

export interface PermisoEstado {
  estado: EstadoPermiso;
  parcial: Parcial;
  crudo: PermissionResponse | null;
  pedir: () => Promise<PermissionResponse | null>;
  abrirAjustes: () => void;
}

export function usePermiso(recurso: Recurso): PermisoEstado {
  const [crudo, setCrudo] = useState<PermissionResponse | null>(null);

  const consultar = useCallback(() => {
    registro[recurso]
      .get()
      .then(setCrudo)
      .catch(() => setCrudo(null));
  }, [recurso]);

  useEffect(() => {
    consultar();
  }, [consultar]);

  useRevisarAlVolver(consultar);

  const pedir = useCallback(async () => {
    // bloqueado: request vuelve al instante sin mostrar nada (F5d).
    if (crudo && !crudo.canAskAgain && !crudo.granted) return crudo;
    // ya concedido: no volver a mostrar el diálogo.
    if (crudo?.granted) return crudo;
    try {
      const res = await registro[recurso].request();
      setCrudo(res);
      return res;
    } catch {
      return null;
    }
  }, [crudo, recurso]);

  const abrirAjustes = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    estado: normalizar(crudo),
    parcial: parcialDe(recurso, crudo),
    crudo,
    pedir,
    abrirAjustes,
  };
}

export type { EstadoPermiso, Parcial, Recurso };