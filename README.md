# Mantenimiento IPF

App móvil para reportar desperfectos del edificio (luz quemada, canilla que pierde, proyector roto) y recibir un aviso cuando se resuelven. TP3 — permisos móviles en Expo SDK 57 (React Native 0.86), TypeScript, Expo Router. Proyecto Expo universal (Android/iOS/Web). Gestión de paquetes con `pnpm`.

## Árbol de carpetas de `src/app`

```
src/app/
  _layout.tsx              Stack raíz + ReportesProvider + handler de notificaciones
  (tabs)/
    _layout.tsx            Tabs: Reportes, Avisos, Permisos
    index.tsx              /                lista de reportes + "Nuevo reporte"
    avisos.tsx             /avisos            bandeja de avisos (alternativa a notificaciones)
    permisos.tsx           /permisos          panel de estado de permisos
  reporte/
    nuevo.tsx              /reporte/nuevo     formulario (params: aula/foto/voz/sector/lat/lng)
    escanear.tsx           /reporte/escanear  cámara para leer QR (4 estados)
    foto.tsx               /reporte/foto      sacar foto o elegir con selector (sin permiso)
    ubicacion.tsx          /reporte/ubicacion ubicación o sector a mano
    voz.tsx                /reporte/voz       nota de voz (expo-audio)
    [id].tsx               /reporte/[id]      detalle + "Simular resolución"
  permisos/
    [recurso].tsx          modal pantalla previa: beneficio + "Continuar" / "Abrir Ajustes"
  ajustes-app.tsx          /ajustes-app      interruptor notificaciones (canal antes de pedir)
```

<|constrain|> URL | Permiso / detalle |
| - | - |
| `/` | Ninguno. Tab "Reportes". |
| `/reporte/nuevo` | Ninguno al abrir: cada permiso se pide al tocar su función. |
| `/reporte/escanear` | Cámara (`useCameraPermissions`), con los 4 estados. |
| `/reporte/foto` | Cámara para sacar; selector del sistema (sin permiso) para elegir. |
| `/reporte/ubicacion` | Ubicación en primer plano. Si se deniega: elegir sector a mano. |
| `/reporte/[id]` | Validar id; mensaje si no existe. |
| `/avisos` | Alternativa a las notificaciones. Tab "Avisos". |
| `/permisos` | Tab "Permisos". Se actualiza al volver de Ajustes. |
| `/permisos/[recurso]` | Pantalla previa. `presentation: "modal"`. |
| `/ajustes-app` | Notificaciones, pedidas al activar el interruptor. |

## `app.json` — bloque plugins (comentado)

```jsonc
"plugins": [
  "expo-router",                       // routing file-based en src/app/
  ["expo-splash-screen", {             // splash
    "backgroundColor": "#208AEF",
    "image": "./assets/images/splash-icon.png",
    "imageWidth": 76
  }],
  ["expo-camera", {
    // Texto en molde "Usamos tu [dato] para [beneficio concreto]"
    "cameraPermission": "Usamos la cámara para leer el QR del aula.",
    // Mínimo privilegio: sin sonido (escanear QR y sacar foto no graban)
    "microphonePermission": false,
    "recordAudioAndroid": false
  }],
  ["expo-location", {
    // Solo primer plano (G2.4: sin background, sin "Siempre")
    "locationWhenInUsePermission": "Usamos tu ubicación para marcar dónde está el problema que reportás.",
    // Claves de ubicación siempre / motion activity omitidas (false) — mínimo privilegio
    "locationAlwaysPermission": false,
    "locationAlwaysAndWhenInUsePermission": false,
    "motionUsagePermission": false
  }],
  ["expo-image-picker", {
    // Sin permiso de galería: usamos el selector del sistema (launchImageLibraryAsync)
    "photosPermission": false
  }],
  // expo-audio: plugin autofijado por `expo install`. Texto para nota de voz (G4).
  ["expo-audio", {
    "microphonePermission": "Usamos el micrófono para grabar la descripción de voz del desperfecto."
  }],
  ["expo-notifications", {
    "color": "#208AEF"
    // Canal "reportes" se crea por código en /ajustes-app (android)
  }]
],
"android": {
  "blockedPermissions": [
    // Permisos que la app no usa: bloqueo defensivo (tools:node=remove)
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.READ_EXTERNAL_STORAGE",   // maxSdkVersion 32, aportado por image-picker
    "android.permission.WRITE_EXTERNAL_STORAGE"   // maxSdkVersion 32, aportado por image-picker
  ]
}
```

## Tabla de permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se deniega |
| - | - | - | - |
| Cámara | `expo-camera` | Al tocar "Escanear QR" o "Sacar foto" | Escribir el aula a mano; selector del sistema |
| Ubicación (primer plano) | `expo-location` | Al tocar "Usar mi ubicación actual" | Elegir sector a mano (patio, estacionamiento, pasillo) |
| Notificaciones | `expo-notifications` | Al activar el interruptor de `/ajustes-app` | Bandeja `/avisos` dentro de la app |
| Micrófono | `expo-audio` | Al tocar "Grabar descripción" en `/reporte/voz` | Escribir la descripción a mano |
| Galería | Ninguno | No se pide: se usa el selector del sistema | — |

Prohibido usar `expo-permissions`. El permiso `POST_NOTIFICATIONS` (Android 13+) y `RECEIVE_BOOT_COMPLETED` vienen del manifest de la librería `expo-notifications` (merge en build), no del `app.json`.

## Auditoría del manifiesto (G4.1)

`pnpm expo prebuild --clean` genera `android/` e `ios/` (gitignorados). Resultado verificado:

### `AndroidManifest.xml` (permisos app-level)

| Permiso | Origen | Usado | Nota |
| - | - | - | - |
| `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` | `expo-location` | Sí | matiz `accuracy` en panel |
| `CAMERA` | `expo-camera` | Sí | `recordAudioAndroid:false` verificado: no agrega `RECORD_AUDIO` por la cámara |
| `FOREGROUND_SERVICE(_MEDIA_PLAYBACK)` | `expo-audio` | Sí | nota de voz |
| `INTERNET` | normal | Sí | - |
| `MODIFY_AUDIO_SETTINGS` | `expo-audio` | Sí | nota de voz |
| `READ_EXTERNAL_STORAGE` (`maxSdkVersion="32"`) | `expo-image-picker` | No | bloqueado (`tools:node="remove"`) |
| `RECORD_AUDIO` | `expo-audio` | Sí | nota de voz |
| `SYSTEM_ALERT_WINDOW` | (default) | No | bloqueado |
| `VIBRATE` | librería `expo-notifications` | Sí | merge en build |
| `WRITE_EXTERNAL_STORAGE` (`maxSdkVersion="32"`) | `expo-image-picker` | No | bloqueado |
| `POST_NOTIFICATIONS` | librería `expo-notifications` (merge) | Sí | no aparece en el `AndroidManifest.xml` de la app |

### `Info.plist` (claves de propósito)

| Clave | Texto | Origen |
| - | - | - |
| `NSCameraUsageDescription` | "Usamos la cámara para leer el QR del aula." | plugin `expo-camera` |
| `NSLocationWhenInUseUsageDescription` | "Usamos tu ubicación para marcar dónde está el problema que reportás." | plugin `expo-location` |
| `NSMicrophoneUsageDescription` | "Usamos el micrófono para grabar la descripción de voz del desperfecto." | plugin `expo-audio` |
| `NSLocationAlways*` / `NSMotionUsageDescription` | omitidas | mínimo privilegio (solo primer plano) |

## Capturas (pendientes del autor)

Agregar capturas o un video corto en esta carpeta/sección:
- Escáner en sus 4 estados (cargando, cámara, "Continuar", bloqueado "Abrir Ajustes").
- Ubicación concedida y denegada.
- Foto tomada con el selector del sistema.
- Notificación recibida.
- Panel de permisos antes y después de volver de Ajustes.
- (G5.4) Captura del diálogo del sistema en una development build, donde se vea el texto de propósito.

## Verificación

```bash
pnpm lint                # expo lint
pnpm exec tsc --noEmit   # typecheck
pnpm expo prebuild --clean  # regenerar nativos solo para auditar; borrar ios/ android/ después
```

Smoke manual en Expo Go:
1. Crear reporte sin permisos (aula a mano, sector a mano).
2. Escáner pide cámara en contexto y muestra 4 estados.
3. Bloquear cámara desde Ajustes → vuelve, panel refleja "bloqueado", pantalla muestra "Abrir Ajustes" con el camino exacto.
4. Activar interruptor de notificaciones → diálogo aparece (Android 13+ con canal).
5. "Simular resolución" → notificación a los 10 s en foreground + aviso en `/avisos`.
6. Tapping sobre la notificación abre el detalle.

Desarrollo y capturas requieren una development build (`pnpm expo run:android` o EAS): los textos de propósito y `blockedPermissions` no se aplican en Expo Go.

## Convención de código

- Rutas Expo Router en `src/app/`; componentes en `src/components/`, hooks en `src/hooks/`, lógica de permisos en `src/lib/`.
- Hook unificado `usePermiso(recurso)` en `src/hooks/usePermiso.ts`: estados `'cargando' | 'concedido' | 'preguntable' | 'bloqueado'`, indicador parcial, `pedir()` y `abrirAjustes()`, refresco con `AppState`.
- Permisos declarados al compilar vía `app.json`/plugins; los nativos se regeneran. Nunca editar `AndroidManifest.xml` ni `Info.plist` a mano. No se usa `expo-permissions` (desactualizado).