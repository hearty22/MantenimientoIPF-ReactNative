Trabajo Practico N°3: Permisos móviles – Android, iOS y Expo


Escalante, Elvio Facundo


## Parte A · ¿Qué es un permiso y por qué existe?

### A1. Conceptos

**a) ¿Qué es un permiso? ¿Qué papel cumplen la app, el sistema operativo y la persona usuaria?**

Un permiso es la autorización que la persona usuaria le da a una app para usar un recurso sensible del dispositivo: cámara, micrófono, ubicación, fotos, contactos o notificaciones.

- **La app:** declara qué recursos podría usar y, en el momento justo, pide acceso. 

- **El sistema operativo:** muestra el diálogo oficial, guarda la decisión y la hace cumplir. 

- **La persona usuaria:** acepta, rechaza o da acceso parcial, y puede cambiar de idea en Ajustes. 

**b) ¿Qué es el sandbox y qué relación tiene con los permisos? ¿Qué puede hacer una app sin ningún permiso?**

Cada app vive en su propia caja de arena (sandbox): un espacio aislado donde solo ve sus propios archivos. Para salir de esa caja y tocar algo sensible necesita una «llave», y esa llave solo la puede dar la persona usuaria: eso es un permiso.

Sin ningún permiso, una app puede mostrar pantallas, guardar sus propios datos y conectarse a internet.

**c) Las cuatro razones por las que existen los permisos:**

| **Razón** | **Ejemplo concreto** |
| :-: | :-: |
| **Privacidad** | Dónde estás, tus fotos o tu voz no salen del dispositivo sin tu acuerdo. |
| **Seguridad** | Si una app maliciosa se cuela, el daño queda limitado a lo que se le permitió (por ejemplo, no puede leer tu agenda si nunca tuvo `READ_CONTACTS`). |
| **Transparencia** | El sistema muestra qué app usa qué: indicadores de cámara, micrófono y ubicación en la barra de estado. |
| **Control** | La decisión no es para siempre: se revisa y se revoca desde Ajustes. |

**d) La analogía del portero del edificio**

- **La visita** es la app, que quiere subir a un departamento (usar la cámara). 

- **El portero** es el sistema operativo, que no deja subir solo a nadie. 

- **El dueño del departamento** es la persona usuaria, que decide si la deja pasar. 

«El portero se acuerda de la respuesta» significa que el sistema operativo guarda la decisión de la persona: la app no puede volver a preguntar como si nada hubiera pasado (en iOS el diálogo aparece una sola vez; en Android, hasta dos). Después, la decisión solo cambia desde Ajustes.


### A2. Declarar y solicitar

|  | **Declarar (al compilar)** | **Solicitar (al ejecutar)** |
| :-: | :-: | :-: |
| **¿Qué se hace?** | Se le avisa al sistema qué recursos podría usar la app. Queda escrito dentro del paquete que se instala. | Cuando la persona usa la función, el código pide acceso y el sistema muestra el diálogo. |
| **¿Dónde / cómo en Android?** | Una línea `<uses-permission>` en el `AndroidManifest.xml`. | Solo para los permisos de tiempo de ejecución (peligrosos). |
| **¿Dónde / cómo en iOS?** | Un texto de propósito (`NS…UsageDescription`) en el `Info.plist`. | Para cada recurso protegido. |
| **¿Dónde / cómo en Expo?** | En `app.json` (o `app.config.ts`): plugins de cada módulo, `android.permissions` e `ios.infoPlist`. Los dos archivos nativos se generan desde ahí. | `request…PermissionsAsync()` o el hook del módulo (por ejemplo, `useCameraPermissions()`). |
| **¿Qué pasa si se omite?** | Si no lo declarás, no lo podés pedir: Android lo deniega en el acto sin diálogo; en iOS el acceso falla (con cámara o fotos la app se cierra) y App Store Connect rechaza la build. | Si no lo pedís, no lo tenés: sin pedido no hay acceso. |


### A3. Verdadero o falso

- **a) FALSO.** El diálogo lo muestra el sistema, no la app. Tu código nunca lo dibuja: solo elige cuándo pedirlo y qué hacer con la respuesta. 

- **b) VERDADERO.** Los archivos nativos se regeneran en cada prebuild, por eso la fuente de verdad es `app.json`. 

- **c) FALSO.** Los cambios en el `Info.plist` no viajan por actualizaciones OTA. Agregar un permiso nuevo exige una build nueva. 

- **d) FALSO.** Si el permiso no está en el manifiesto, Android lo deniega en el acto, sin mostrar ningún diálogo. 

- **e) FALSO.** `expo-permissions` ya no existe: cada módulo maneja sus propios permisos. Si aparece en un tutorial, el tutorial está desactualizado. 

- **f) VERDADERO.** Las notificaciones no llevan texto en el `Info.plist`: se piden directamente. 

- **g) VERDADERO.** Con acceso limitado a fotos, `status` es `'granted'` y el matiz está en `accessPrivileges: 'limited'`. 

- **h) VERDADERO** (según la clase). Desinstalar y reinstalar la app vuelve el permiso a «sin decidir» en las dos plataformas. Como atajo sin reinstalar existen `adb shell pm revoke` (Android) y `xcrun simctl privacy booted reset` (simulador iOS). 


### A4. Los estados de un permiso

**a) Diagrama de estados**

```
ANDROID (11+)

                 ┌── Permitir ───────────────► CONCEDIDO ◄───────────┐

SIN DECIDIR ─────┤                                │  ▲               │

(undetermined)   │                  revoca en     │  │ habilita en   │

                 │                  Ajustes       ▼  │ Ajustes       │

                 └── No permitir ► DENEGADO ── 2.º rechazo ──► BLOQUEADO

                                   (canAskAgain: true)         (canAskAgain: false)


iOS

                 ┌── Permitir ───────────────► CONCEDIDO

SIN DECIDIR ─────┤                                │  ▲

(undetermined)   │                  revoca en     │  │ habilita en

                 │                  Ajustes       ▼  │ Ajustes

                 └── No permitir ─────────────► BLOQUEADO

                      (un solo rechazo)         (canAskAgain: false)
```

**Diferencia central:** Android da **dos oportunidades** (rechazo → denegado → bloqueado) e iOS **una sola** (rechazo → bloqueado). En iOS el estado «denegado pero se puede volver a pedir» no existe. Por eso, en iOS el momento y el texto de propósito pesan todavía más.

**b) Qué devuelve Expo en cada estado**

| **Estado** | `status` | `canAskAgain` | **¿Puede aparecer el diálogo?** |
| :-: | :-: | :-: | :-: |
| Sin decidir | `'undetermined'` | `true` | Sí |
| Concedido | `'granted'` | `true` | No hace falta (ya está concedido) |
| Denegado (se puede volver a pedir) | `'denied'` | `true` | Sí (solo en Android) |
| Bloqueado | `'denied'` | `false` | No: cualquier pedido vuelve denegado al instante |


## Parte B · Android: tipos de permisos y manifiesto

### B1. Clasificá los permisos

| **Permiso** | **Tipo** | **¿Cómo se obtiene?** |
| :-: | :-: | :-: |
| `INTERNET` | De instalación (normal) | Alcanza con declararlo: se concede solo al instalar, sin diálogo. |
| `CAMERA` | De tiempo de ejecución | Diálogo del sistema mientras se usa la app. |
| `VIBRATE` | De instalación (normal) | Se concede al instalar. |
| `SYSTEM_ALERT_WINDOW` | Especial | La persona lo activa en una pantalla de Ajustes («Mostrar sobre otras apps»). No hay diálogo. |
| `POST_NOTIFICATIONS` | De tiempo de ejecución (desde Android 13) | Diálogo del sistema. |
| `ACCESS_NETWORK_STATE` | De instalación (normal) | Se concede al instalar. |
| `READ_CONTACTS` | De tiempo de ejecución | Diálogo del sistema. |
| `SCHEDULE_EXACT_ALARM` | Especial | Se habilita en Ajustes → «Alarmas y recordatorios». Desde Android 14 viene desactivado para la mayoría de las apps nuevas. |
| `RECORD_AUDIO` | De tiempo de ejecución | Diálogo del sistema (con opción «Solo esta vez»). |
| `MANAGE_EXTERNAL_STORAGE` | Especial | Se activa en Ajustes; Google Play lo restringe mucho. |

### B2. Grupos y nombres

**a)** Un **grupo de permisos** reúne permisos relacionados: la persona no ve nombres técnicos sino grupos. Si la app pide `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` juntos, la persona ve **un solo diálogo** («Ubicación»).

**b)** Todos los nombres completos llevan el prefijo `android.permission.`. El de la cámara es `android.permission.CAMERA`.

**c)** Los permisos de **firma (signature)** solo los obtienen apps firmadas con el mismo certificado que el sistema u otra app. No se usan en apps comunes porque una app común no tiene ese certificado.

### B3. Leé el manifiesto

**a)** Se concede solo al instalar: `INTERNET` (es normal). Hay que pedir además en tiempo de ejecución: `CAMERA`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` y `POST_NOTIFICATIONS` (este último desde Android 13). `READ_EXTERNAL_STORAGE` también se pide en ejecución, pero solo hasta Android 12L. `RECORD_AUDIO` está quitado, así que no aplica.

**b)** `android:maxSdkVersion="32"` hace que el permiso valga **solo hasta Android 12L (API 32)**. Desde Android 13 lo reemplazan los permisos multimedia por tipo: `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` y `READ_MEDIA_AUDIO`.

**c)** `tools:node="remove"` **quita el permiso del manifiesto final aunque lo agregue una librería**. Se genera con `blockedPermissions`:

json

```
{

  "expo": {

    "android": {

      "blockedPermissions": [

        "android.permission.RECORD_AUDIO"

      ]expo-location

    }

  }

}
```

**d)** Va en la propiedad `android.permissions` de `app.json`:

json

```
{

  "expo": {

    "android": {

      "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]

    }

  }

}
```

**e)** No conviene editarlo a mano porque el `AndroidManifest.xml` se regenera en cada `prebuild` y se pierden los cambios: la fuente de verdad es `app.json`. `blockedPermissions` **no funciona en Expo Go**: solo tiene efecto en una build propia.

### B4. Así pregunta Android

**a)** No: en Android no hay texto propio en el diálogo, el título lo arma el sistema. La explicación hay que darla **antes de pedir**, en una pantalla propia de la app.

**b)** «Mientras la app está en uso» es un acceso que se mantiene, pero solo con la app en primer plano. «Solo esta vez» (Android 11+) vale mientras se usa la app y, poco después de salir, el sistema lo revoca. Esta última opción existe para **ubicación, cámara y micrófono**; el resto de los permisos muestra solo «Permitir» y «No permitir».

**c)** Si la persona toca «No permitir» dos veces, Android deja de mostrar el diálogo (lo toma como «no volver a preguntar»). `canAskAgain` pasa a **`false`**.

**d)** La ubicación aproximada tiene una precisión de unos 3 km². **Anda bien** para «farmacias de tu zona» u ordenar resultados por barrio. **No sirve** para «llegar caminando a la puerta» (navegación paso a paso) o mostrar distancias en metros.

**e)** Android **termina el proceso de la app**: al volver, arranca de cero.

### B5. Android, versión por versión

| **Cambio** | **Versión (API)** | **Qué implica para el código** |
| :-: | :-: | :-: |
| Nacen los permisos en tiempo de ejecución | Android 6.0 (API 23, 2015) | Hay que contemplar que un permiso puede no estar y pedirlo con un diálogo mientras se usa la app. |
| La ubicación en segundo plano pasa a ser un permiso aparte | Android 10 (API 29) | `requestBackgroundPermissionsAsync()`, siempre después del pedido de primer plano. |
| Dos rechazos equivalen a «no volver a preguntar» | Android 11 (API 30) | `canAskAgain` pasa a `false` tras el segundo rechazo: la app debe ofrecer Ajustes. |
| Ubicación precisa o aproximada | Android 12 (API 31) | Leer `permiso.android.accuracy` (`"fine"` o `"coarse"`) y funcionar con las dos. |
| Las notificaciones pasan a ser un permiso (`POST_NOTIFICATIONS`) | Android 13 (API 33) | Crear el canal y pedir el permiso en un momento con sentido. |
| Acceso parcial a fotos y videos («Seleccionar fotos») | Android 14 (API 34) | `accessPrivileges` puede valer `"limited"` también en Android. |
| Permiso de red local (`ACCESS_LOCAL_NETWORK`) | Android 17 (API 37) | Aplica a apps con target API 37; llegará con próximas versiones del SDK. |

**¿Qué es el `targetSdkVersion`?** Es la versión de Android para la que la app declara estar preparada. Muchos cambios de reglas se aplican según este valor. **Expo SDK 57 apunta a API 36**, y **Google Play exige API 36** para apps nuevas y actualizaciones **desde el 31 de agosto de 2026**.


## Parte C · iOS: textos de propósito y acceso parcial

### C1. Claves del Info.plist

| **Recurso** | **Clave en Info.plist** |
| :-: | :-: |
| Cámara | `NSCameraUsageDescription` |
| Micrófono | `NSMicrophoneUsageDescription` |
| Ubicación en uso | `NSLocationWhenInUseUsageDescription` |
| Ubicación siempre | `NSLocationAlwaysAndWhenInUseUsageDescription` |
| Fotos (leer) | `NSPhotoLibraryUsageDescription` |
| Fotos (solo guardar) | `NSPhotoLibraryAddUsageDescription` |
| Contactos | `NSContactsUsageDescription` |
| Face ID | `NSFaceIDUsageDescription` |
| Rastreo entre apps (ATT) | `NSUserTrackingUsageDescription` |
| Notificaciones | **No lleva clave**: se piden directamente. |

### C2. Sin texto, no hay permiso

**a)** Si falta el texto de propósito, el acceso falla; con la cámara (o las fotos) la app directamente **se cierra**. Al subir la build a App Store Connect, **la rechaza** con el error **`ITMS-90683: Missing purpose string in Info.plist`**.

**b)** iOS muestra el diálogo **una sola vez**. Si la persona dice que no, la decisión queda guardada y solo se puede cambiar desde Ajustes: a la app le queda ofrecer una **alternativa** y, si corresponde, un botón que abra Ajustes.

**c)** El **título** lo arma el sistema con el nombre de la app y no se puede cambiar. El **texto de propósito** lo escribís vos: es tu única oportunidad de convencer dentro del diálogo. En Expo se configura en el **plugin de cada módulo** o en **`ios.infoPlist`** dentro de `app.json`.

**d)** Pasa porque la librería referencia una API protegida aunque tu app nunca la llame, y el `Info.plist` no tiene la clave correspondiente (se dispara `ITMS-90683`). Se resuelve declarando el texto de propósito de esa clave (en el plugin del módulo o en `ios.infoPlist`) y volviendo a compilar.

### C3. Probador de textos de propósito

| **Texto propuesto** | **¿Aprobado?** | **Versión mejorada** |
| :-: | :-: | :-: |
| «Necesitamos tu ubicación.» | **No**: no dice para qué se usa el dato. | «Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos.» |
| «Para mejorar tu experiencia.» | **No**: es vago, no describe un beneficio concreto. | «Usamos tu ubicación para ordenar los comercios por distancia.» |
| «Usamos tu ubicación para mostrarte las farmacias de turno más cercanas.» | **Sí**: sigue el molde, nombra el dato y el beneficio. | (Se mantiene.) |
| «La app no funciona sin ubicación.» | **No**: no explica el uso y presiona a la persona (riesgo con 5.1.1(iv)). | «Usamos tu ubicación para mostrarte los reportes de tu zona.» |
| «Ubicación requerida por el sistema.» | **No**: es engañoso (no lo requiere el sistema) y no da beneficio. | «Usamos tu ubicación para marcar dónde está el problema que reportás.» |

### C4. Acceso parcial y gradual

| **Caso** | **iOS** | **En Expo** |
| :-: | :-: | :-: |
| Fotos limitadas («Seleccionar fotos») | iOS 14 | `accessPrivileges: 'limited'` |
| Ubicación aproximada (interruptor «Precisa») | iOS 14 | `ios.accuracy: 'reduced'` |
| «Permitir una vez» (ubicación) | iOS 13 | Expo responde `granted` hasta que termina la sesión; después vuelve a `undetermined`. |
| Ubicación escalonada: de «al usar la app» a «Siempre» | iOS 13 | Primero `requestForegroundPermissionsAsync()` y luego `requestBackgroundPermissionsAsync()`; `ios.scope` indica `'whenInUse'` o `'expo-locationalways'`. |
| Notificaciones provisionales | iOS 12 | `requestPermissionsAsync({ ios: { allowProvisional: true } })`; se detecta con `ios.status === expexpo-locationo-locationIosAuthorizationStatus.PROVISIONAL`. |
| Rastreo entre apps (ATT) | iOS 14.5 | `expo-tracking-transparency` → `useTrackingPermissions()` |

**Versión mínima de Expo SDK 57:** iOS 16.4. En la práctica, todo lo que figura en la tabla anterior (iOS 12 a 14.5) **ya aplica a cualquier usuario de tu app**: no hace falta preguntarse si el sistema lo soporta, hay que diseñar para el caso parcial.

### C5. Android vs iOS, lado a lado

|  | **Android** | **iOS** |
| :-: | :-: | :-: |
| **¿Dónde se declara?** | `<uses-permission>` `expo-location`en el manifiesto | Texto de propósito en el `Info.plist` |
| **Texto en el diálogo** | Lo arma el sistema`expo-location` | Lo escribís vos |
| **Oportunidades para preguntar** | Dos rechazos y se bloquea (11+) | Una sola |
| **«Solo esta vez» / «Permitir una vez»** | Ubicación, cámara y micrófono | Solo ubicación («Permitir una vez») |
| **Notificaciones** | Permiso de tiempo de ejecución desde Android 13 | Siempre se piden (o provisionales) |
| **Ubicación en segundo plano** | Se concede desde Ajustes (11+) | Segundo pedido para pasar a «Siempre» |
| **Si falta la declaración** | Se deniega sin mostrar diálogo | Falla o se cierra la app; la tienda rechaza la build |


## Parte D · Expo: una API, dos plataformas

### D1. Módulos y funciones

| **Necesidad** | **Módulo** | **Hook / función de permiso** |
| :-: | :-: | :-: |
| Escanear un QR con la cámara | `expo-camera` | `useCameraPermissions` |
| Grabar video con sonido | `expo-camera` | `useCameraPermissions` + `useMicrophonePermissions` |
| Mostrar farmacias cercanas | `expo-location` | `useForegroundPermissions` |
| Seguir un envío con la app en segundo plano | `expo-location` | `useForegroundPermissions` y después `useBackgroundPermissions` |
| Mostrar un recordatorio | `expo-notifications` | `getPermissionsAsync` / `requestPermissionsAsync` |
| Grabar una nota de voz | `expo-audio` | `requestRecordingPermissionsAsync` |
| Galería propia dentro de la app | `expo-media-library` | `usePermissions` |
| Publicidad personalizada entre apps (iOS) | `expo-tracking-transparency` | `useTrackingPermissions` |

**`import * as Permissions from 'expo-permissions'`:** dice que el **tutorial está desactualizado**: ese paquete ya no existe y cada módulo maneja sus propios permisos.

### D2. Consultar, pedir y el hook

**a)** `get…PermissionsAsync()` **solo consulta**: no muestra nada, únicamente informa el estado. `request…PermissionsAsync()` **pide**: muestra el diálogo si todavía se puede. **Solo `request…` puede mostrar un diálogo.**

**b)** El hook devuelve `[permiso, pedirPermiso, consultarPermiso]`:

1. `permiso`: la respuesta actual (`PermissionResponse`). 

2. `pedirPermiso`: función que pide el permiso (equivale a `request…`). 

3. `consultarPermiso`: función que vuelve a consultar el estado (equivale a `get…`). 

En el primer render `permiso` vale **`null`**, porque el hook todavía está consultando. La pantalla tiene que mostrar un **indicador de carga**.

**c)** Con `canAskAgain: false`, `request…()` **vuelve al instante sin mostrar nada** (devuelve denegado). Si se lo llama en un bucle (por ejemplo, en cada render), la pantalla queda «pidiendo» para siempre sin que nada cambie. Hay que detectar `canAskAgain` y ofrecer Ajustes.

### D3. Leé la respuesta

| **Respuesta** | **Qué hace la app** |
| :-: | :-: |
| `null` | El hook todavía consulta: mostrar un indicador de carga. |
| `{ status: 'granted', granted: true }` | Usar la función. |
| `{ status: 'undetermined', canAskAgain: true }` | Explicar el beneficio y ofrecer un botón que llame a pedir. |
| `{ status: 'denied', canAskAgain: true }` | Mostrar una alternativa y la opción de volver a intentar. |
| `{ status: 'denied', canAskAgain: false }` | Explicar cómo habilitarlo y abrir Ajustes con `Linking.openSettings()`. |
| `{ status: 'granted', accessPrivileges: 'limited' }` | Trabajar con la selección y ofrecer ampliarla, sin insistir. |
| `{ status: 'granted', android: { accuracy: 'coarse' } }` | Funcionar con ubicación aproximada: mostrar resultados por zona, no distancias exactas. |

**Los dos campos que deciden casi todo:**

- **`granted`** responde: *¿lo puedo usar?* 

- **`canAskAgain`** responde: *¿lo pido o mando a Ajustes?* 

### D4. Simulación del ciclo completo (Android 14, `expo-location`)

| **\#** | **Acción** | `status` | `canAskAgain` | **¿Diálogo?** |
| :-: | :-: | :-: | :-: | :-: |
| 1 | `getForegroundPermissionsAsync()` | `undetermined` | `true` | No |
| 2 | `requestForegroundPermissionsAsync()` → «No permitir» | `denied` | `true` | Sí |
| 3 | `requestForegroundPermissionsAsync()` → «No permitir» | `denied` | `false` | Sí |
| 4 | `requestForegroundPermissionsAsync()` | `denied` | `false` | No: vuelve al instante |
| 5 | `Linking.openSettings()` → habilita «Mientras la app está en uso» → vuelve y la app consulta | `granted` | `true` | No |
| 6 | Igual que el 5, pero la app no vuelve a consultar | Muestra el estado viejo: sigue diciendo **«bloqueado»** aunque el permiso ya esté concedido. |  |  |

**Repetido en iOS:**

| **\#** | **Acción** | `status` | `canAskAgain` | **¿Diálogo?** |
| :-: | :-: | :-: | :-: | :-: |
| 1 | `get…` | `undetermined` | `true` | No |
| 2 | `request…` → «No permitir» | `denied` | **`false`** | Sí |
| 3 | `request…` | `denied` | `false` | No |
| 4 | `request…` | `denied` | `false` | No |

El resultado **cambia en el paso 2**: en iOS un solo rechazo alcanza para bloquear (el diálogo aparece una sola vez), mientras que Android da una segunda oportunidad. Los pasos 5 y 6 funcionan igual.

**«Permitir una vez» + cerrar y reabrir la app (iOS):** el permiso venció y el estado vuelve a **`undetermined`**, así que se puede volver a preguntar.

### D5. Configurar `app.json`

json

```
{

  "expo": {

    "plugins": [

      [

        "expo-camera",

        {

          "cameraPermission": "Usamos la cámara para leer códigos QR.",

          "microphonePermission": false,

          "recordAudioAndroid": false

        }

      ],

      [

        "expo-location",

        {

          "locationWhenInUsePermission": "Usamos tu ubicación para mostrarte los puntos de reciclaje más cercanos."

        }

      ]

    ],

    "android": {

      "blockedPermissions": [

        "android.permission.SYSTEM_ALERT_WINDOW"

      ]

    }

  }

}
```

**¿Por qué `expo-camera` agrega `RECORD_AUDIO` aunque la app no grabe sonido?** Porque por defecto `recordAudioAndroid` vale `true`: el módulo asume que la cámara podría grabar video con sonido. Si la app no lo hace, conviene apagarlo (mínimo privilegio).

### D6. Expo Go no es tu app

**a)** Porque Expo Go es una app ya compilada, con su propio `Info.plist` y su propio manifiesto. Tus textos de propósito y tu lista de permisos no se aplican: los diálogos son los de Expo Go.

**b)**

- **Se puede probar en Expo Go:** la lógica (estados, botones, ir a Ajustes, alternativas) y las notificaciones **locales**. 

- **Necesita development build:** ver tus textos de propósito y solo los permisos declarados; `blockedPermissions`; las **notificaciones push en Android** (desde SDK 53); la **ubicación en segundo plano** (Expo Go no la soporta en iOS ni los servicios en primer plano en Android). 

**c)**

bash

```
# Ver qué quedó declarado en los archivos nativos

npx expo prebuild --clean


# Compilar e instalar una development build en Android

npx expo run:android
```

**d)**

bash

```
# Android (adb)

adb shell pm revoke <paquete> android.permission.ACCESS_FINE_LOCATION


# Simulador de iOS

xcrun simctl privacy booted reset location <bundle id>
```


## Parte E · Recetas: leer y corregir código

### E1. Encontrá los errores (cámara)

**Problemas del código original:**

1. **`permiso` es `null` en el primer render** (el hook todavía consulta), así que `permiso.status` rompe la app. Falta el estado «cargando». 

2. **No contempla el estado bloqueado.** Si `canAskAgain` es `false`, el botón «Permitir» no hace nada: hay que mandar a Ajustes con `Linking.openSettings()`. 

3. **El botón dice «Permitir»** en vez de «Continuar»: el permiso lo da el sistema, no tu botón. 

4. Menores: compara texto (`status === 'granted'`) cuando alcanza con `permiso.granted`, y `onPress={pedirPermiso}` le pasa el evento como argumento (mejor `() => pedirPermiso()`). 

**Versión corregida (cuatro estados):**

tsx

```
// src/app/escanear.tsx

import { CameraView, useCameraPermissions } from 'expo-camera';

import { Button, Linking } from 'react-native';

// Cargando y Explicacion son componentes propios de la app


export default function Escanear() {

  const [permiso, pedirPermiso] = useCameraPermissions();

  const abrirAjustes = () => Linking.openSettings();


  if (!permiso) return <Cargando />;            // 1. cargando


  if (permiso.granted) {                        // 2. concedido

    return <CameraView style={{ flex: 1 }} facing="back" />;

  }


  if (permiso.canAskAgain) {                    // 3. preguntable

    return (

      <Explicacion texto="Usamos la cámara para leer el QR del aula.">

        <Button title="Continuar" onPress={() => pedirPermiso()} />

      </Explicacion>

    );

  }


  return (                                      // 4. bloqueado

    <Explicacion texto="La cámara está desactivada para esta app.">

      <Button title="Abrir Ajustes" onPress={abrirAjustes} />

    </Explicacion>

  );

}
```

### E2. El orden importa (ubicación)

**a)** La función pide **segundo plano antes que primer plano**. En **iOS**, el sistema primero pregunta «al usar la app», así que no se obtiene «Siempre» de entrada. En **Android 11+**, sin el permiso de primer plano no se obtiene el de segundo plano, y además ese pedido no muestra un diálogo: abre Ajustes sin contexto.

**b)** Versión correcta (primero primer plano, después segundo plano):

ts

```
import * as Location from 'expo-location';


export async function activarSeguimiento() {

  const enUso = await Location.requestForegroundPermissionsAsync();

  if (!enUso.granted) return false;


  const siempre = await Location.requestBackgroundPermissionsAsync();

  return siempre.granted;

}
```

**c)**

ts

```
import * as Location from 'expo-location';


export async function obtenerUbicacion() {

  const permiso = await Location.requestForegroundPermissionsAsync();

  if (!permiso.granted) return null; // la app sigue: búsqueda manual


  const aproximada =

    permiso.android?.accuracy === 'coarse' ||

    permiso.ios?.accuracy === 'reduced';


  const { coords } = await Location.getCurrentPositionAsync({

    accuracy: Location.Accuracy.Balanced,

  });

  return { ...coords, aproximada };

}
```

**d)** **No**: para «farmacias cercanas» alcanza con primer plano. El segundo plano se justifica en funciones como seguir un envío o registrar una carrera. Si se pide, **Google Play exige una declaración especial** (con aviso visible dentro de la app y un video).

### E3. Notificaciones mudas

**a)** La causa más probable es que **no hay ningún canal de notificaciones creado**: Expo indica que en Android 13+ el diálogo no aparece hasta que exista al menos un canal. Antes de pedir el permiso hay que crearlo con `Notifications.setNotificationChannelAsync(...)`.

**b)** En Android 12 o anterior las notificaciones vienen habilitadas y el pedido responde **sin mostrar diálogo**.

**c)** Las **notificaciones provisionales** (`allowProvisional: true`): llegan en silencio al Centro de notificaciones, sin diálogo previo. Se detectan así:

ts

```
const ajustes = await Notifications.getPermissionsAsync();

const { PROVISIONAL } = Notifications.IosAuthorizationStatus;

const puedeAvisar = ajustes.granted || ajustes.ios?.status === PROVISIONAL;
```

**d)** Conviene pedirlo **después de una acción con sentido**. Buen momento: al tocar «Avisame cuando mi pedido esté listo». Mal momento: al abrir la app por primera vez.

### E4. Fotos sin pedir permiso

| **Necesidad** | **Herramienta** | **Permiso** |
| :-: | :-: | :-: |
| Elegir una foto de perfil | `ImagePicker.launchImageLibraryAsync` | Ninguno |
| Sacar una foto en el momento | `ImagePicker.launchCameraAsync` o `expo-camera` | Cámara |
| Editor que muestra toda la galería | `expo-media-library` | Fotos (completo o limitado) |
| Adjuntar la foto de un comprobante | `ImagePicker.launchImageLibraryAsync` | Ninguno |

**¿Por qué Google Play restringe `READ_MEDIA_IMAGES` y `READ_MEDIA_VIDEO`?** Solo los permite a apps cuya **función principal** necesite acceso amplio (galerías, editores); el resto debe usar el selector del sistema. La restricción rige **desde el 28 de mayo de 2025**.

**«El mejor permiso»** es **el que no tenés que pedir**: con el selector del sistema la persona elige y tu app recibe solo esa imagen.

### E5. Volver de Ajustes

ts

```
// src/hooks/useRevisarAlVolver.ts

import { useEffect, useRef } from 'react';

import { AppState } from 'react-native';


export function useRevisarAlVolver(revisar: () => void) {

  const anterior = useRef(AppState.currentState);


  useEffect(() => {

    const sub = AppState.addEventListener('change', (nuevo) => {

      const estabaAfuera = anterior.current !== 'active';

      if (estabaAfuera && nuevo === 'active') revisar();

      anterior.current = nuevo;

    });

    return () => sub.remove();

  }, [revisar]);

}
```

**a)** Porque no hay ningún evento que avise el cambio: al mandar a la persona a Ajustes, la app queda en segundo plano y, al volver, el permiso pudo cambiar, pero el hook sigue con la respuesta vieja. Hay que **volver a consultar** al volver al primer plano.

**b)** La tercera función del hook: **`consultarPermiso`**.

ts

```
const [permiso, pedirPermiso, consultarPermiso] = useCameraPermissions();

useRevisarAlVolver(consultarPermiso);
```

**c)** Porque la persona puede cambiar o revocar el permiso desde Ajustes en cualquier momento (y Android incluso termina el proceso de la app al revocar). Un estado guardado «para siempre» quedaría desactualizado: conviene **consultarlo** cada vez.


## Parte F · Buenas prácticas y tiendas

### F1. Pedir en contexto

| **App y permiso** | **¿Cuándo pedirlo?** | **Alternativa si lo deniegan** |
| :-: | :-: | :-: |
| Delivery · ubicación | Al tocar «Usar mi ubicación» para calcular la entrega. | Buscar o escribir la dirección, barrio o código postal. |
| Billetera virtual · cámara | Al tocar «Escanear código QR» para pagar. | Ingresar el código o alias a mano, o elegir una imagen con el selector. |
| Red social · contactos | Al tocar «Encontrar amigos». | Compartir un enlace de invitación con el menú del sistema. |
| Mensajería · micrófono | Al tocar el botón de grabar una nota de voz. | Escribir el mensaje en lugar de dictarlo. |
| Turnos médicos · notificaciones | Después de reservar un turno («Avisame antes de mi turno»). | Una bandeja de avisos dentro de la app. |
| Editor de fotos · galería completa | Al abrir «Mi galería» dentro del editor. | Selector del sistema, o trabajar con la selección limitada. |

**¿Por qué pedir cuatro permisos apenas se abre la app «entrena el No permitir automático»?** Porque ninguno está conectado con algo que la persona acaba de querer hacer: no entiende para qué es cada uno y aprende a tocar «No permitir» de memoria. Un pedido en contexto, en cambio, conecta el permiso con una acción que la persona quiso hacer.

### F2. La pantalla previa

**a)** Una buena pantalla previa tiene: (1) el **beneficio en una frase** (lo mismo que dice el texto de propósito), (2) **un solo botón «Continuar»** que lleva al diálogo del sistema, y (3) **transparencia**: recordar que la decisión se puede cambiar cuando quiera en Ajustes.

**b)** Porque el permiso lo da el sistema, no tu botón: «Continuar» lleva al diálogo, donde la persona decide.

**c)** La guía de interfaz de Apple pide un único botón que abra el diálogo y **ninguna forma de salir antes** («Ahora no», «Cerrar»). Apple rechaza apps así por la pauta 5.1.1(iv), que pide respetar la configuración de permisos y no manipular, engañar ni forzar a dar acceso a datos innecesarios (y ofrecer alternativas, como cargar una dirección a mano).

**d)** Si el permiso ya está bloqueado, la pantalla **explica cómo habilitarlo** y el botón pasa a ser **«Abrir Ajustes»**.

### F3. Mínimo privilegio

**a)** **Aproximada.** Para «puntos de reciclaje de tu barrio» alcanza con una zona; no hace falta una ubicación precisa.

**b)** **«Siempre» (segundo plano).** Con el celular en el bolsillo la app no está en primer plano, así que «en uso» no alcanza. Es una de las funciones que justifican segundo plano (y requiere declaración especial en Google Play).

**c)** **Selector del sistema.** La persona elige la foto y la app recibe solo esa imagen, sin permiso de galería.

**d)** **Sin micrófono.** Escanear un QR solo usa la cámara: `microphonePermission: false` y `recordAudioAndroid: false`.

### F4. Tiendas

**a)**

- **Google Play:** (1) declaración de permisos sensibles, como ubicación en segundo plano (con aviso visible en la app y un video), SMS, registro de llamadas o todos los archivos; (2) `READ_MEDIA_*` solo si es la función principal; también la sección «Seguridad de los datos» y el target API 36 obligatorio desde el 31/08/2026. 

- **App Store:** (1) textos de propósito claros y completos (pauta 5.1.1); (2) no forzar ni manipular para conseguir el permiso (5.1.1(iv)); también las etiquetas de privacidad en App Store Connect y el manifiesto de privacidad. 

**b)** El **manifiesto de privacidad (`PrivacyInfo.xcprivacy`)** es el archivo de privacidad que la app incluye para iOS, requerido por Apple en la revisión. En Expo se configura en **`ios.privacyManifests`** dentro de `app.json`.

**c)** Android 17 suma el permiso de **red local (`ACCESS_LOCAL_NETWORK`)** y un **selector de contactos del sistema**. Google Play va a exigir ese selector a muchas apps que hoy piden `READ_CONTACTS`, de forma **obligatoria desde el 27/01/2027** para apps con target API 37.

### F5. Errores comunes

**a) «This app has crashed because it attempted to access privacy-sensitive data without a usage description».** *Causa:* falta el texto de propósito (`NS…UsageDescription`) en el `Info.plist`. *Solución:* configurar el plugin del módulo o `ios.infoPlist` en `app.json` y volver a compilar.

**b) «En Expo Go anda, en la build no»: la cámara se deniega sin mostrar diálogo.** *Causa:* Expo Go trae sus propios permisos; en tu build solo existe lo que declaraste en `app.json`. Si falta declarar el permiso, Android lo deniega en el acto, sin diálogo. *Solución:* agregar el plugin/permiso en `app.json` y generar una build nueva.

**c) Después de habilitar la ubicación en Ajustes, la app sigue diciendo «bloqueado».** *Causa:* no se vuelve a consultar el permiso al volver de Ajustes. *Solución:* usar `useRevisarAlVolver(consultarPermiso)` con `AppState`.

**d) La pantalla queda en «Pidiendo permiso…» para siempre.** *Causa:* se llama a `request…()` en cada render; con `canAskAgain: false` vuelve al instante sin mostrar nada. *Solución:* pedir solo desde un `onPress` (o un efecto controlado), detectar `canAskAgain` y ofrecer Ajustes.

**e) Una app de turnos no deja entrar a ninguna pantalla si se deniegan las notificaciones.** *Causa:* un permiso no esencial bloquea toda la app. *Solución:* la app debe seguir funcionando y ofrecer una alternativa, como una bandeja de avisos dentro de la app, y volver a ofrecer el permiso desde la función, sin insistir en cada pantalla.

