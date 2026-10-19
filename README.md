# ToDo Refactor Lab

Partir de una ToDo App funcional y transformarla en software más mantenible y comprobable: cambiar la estructura interna sin perder el comportamiento, proteger las reglas con pruebas unitarias y justificar las decisiones de diseño.

## Integrantes
- Víctor Benjamín Bautista Rojas (@Br-Benja)
- Leonardo Manuel Olvera Álvarez (@22031485-byte)

## Comandos
```bash
npm install          # instala Vitest (una sola vez por computadora)
npm test             # ejecuta todas las pruebas
npm run test:watch   # vuelve a ejecutar las pruebas al guardar
```
La interfaz se abre con **Live Server** sobre `index.html`.

## Estructura
| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura de la interfaz (sin reglas de negocio) |
| `styles.css` | Presentación responsive |
| `src/legacy.js` | Versión funcional inicial, punto de comparación |
| `src/taskService.js` | Modelo y reglas sobre tareas (se prueba con Vitest) |
| `src/app.js` | Eventos, DOM y adaptación a la interfaz |
| `tests/taskService.test.js` | Pruebas unitarias |

## Pair Programming
| Misión | Driver | Navigator | Commit / evidencia |
|---|---|---|---|
| 00 | Benjamín | Leonardo | Starter Project con Vitest y `.gitignore` |
| M0 | Leonardo | Benjamín | Análisis del legacy y 5 comportamientos a conservar · `evidencias/m00-legacy-inyeccion.png` |
| M1 | Benjamín | Leonardo | Tareas como objetos `{id, titulo, completada}` + 2 pruebas · `evidencias/m01-pruebas-verde.jpeg` |
| M2 | Leonardo | Benjamín | `crearTarea` con la prueba escrita primero (RED → GREEN) · `evidencias/m02-red.png`, `evidencias/m02-red-error.png`, `evidencias/m02-green.png` |
| M3 | Benjamín | Leonardo | `agregarTarea` devuelve un arreglo nuevo + 3 pruebas · `evidencias/m03-verde.png` |
| M4 | Leonardo | Benjamín | `buscarTarea` con `find()` + 3 pruebas · `evidencias/m04-verde.png` |
| M5 | Benjamín | Leonardo | `obtenerPendientes` / `obtenerTerminadas` con `filter()` + 4 pruebas · `evidencias/m05-verde.jpeg` |
| M6 | Leonardo | Benjamín | `cambiarEstado` con `map()` + spread + 4 pruebas · `evidencias/m06-verde.png`, `evidencias/m06-mutacion-rojo.png` |
| M7 | Benjamín | Leonardo | `eliminarTarea` con `filter()` + 4 pruebas (casos frontera) · `evidencias/m07-verde.jpeg`, `evidencias/m07-splice-rojo.jpeg` |
| M8 | Leonardo | Benjamín | `obtenerResumen` reutilizando las funciones de la M5 + 4 pruebas · `evidencias/m08-verde.png` |
| M9 | Benjamín | Leonardo | `app.js` como adaptador del DOM + 5 pruebas manuales · `evidencias/m09-1-alta-valida.png` … `evidencias/m09-6-inyeccion-corregida.png` |
| M10 | Leonardo | Benjamín | Refactor: reglas de `app.js` al dominio + `actualizar()` + 8 pruebas · `evidencias/m10-verde.png`, `evidencias/m10-app-sin-cambios.png` |
| M11 | Benjamín | Leonardo | Opción D: evitar títulos duplicados con `some()` + 8 pruebas (RED → GREEN) · `evidencias/m11-red.png`, `evidencias/m11-green.png`, `evidencias/m11-app-duplicado.png`, `evidencias/m11-app-reutilizar.jpeg` |

## Misión 0 · Análisis del código legacy
**¿Dónde almacenarías ahora el estado completada de una tarea?**
Con strings no hay dónde. Habría que crear un segundo arreglo paralelo (`completadas = [false, true, ...]`) y mantenerlo sincronizado por índice; al eliminar una tarea habría que borrar en los dos arreglos. Es frágil. La solución es que cada tarea sea un objeto con su propia propiedad `completada`.

**¿Qué ocurriría si mañana cada tarea necesita prioridad, fecha o responsable?**
Con strings, cada dato nuevo sería otro arreglo paralelo, y agregar o eliminar tendría que modificar todos a la vez. Con objetos solo se agrega una propiedad.

**¿Qué parte del código representa datos y qué parte representa interfaz?**
- Datos: el arreglo `tareas` y las operaciones `push()` y `splice()`.
- Interfaz: `querySelector()`, `innerHTML`, `textContent`, `addEventListener()` y el mensaje de error.
- Problema: `mostrarTareas()` mezcla las dos cosas (recorre los datos, construye el HTML y calcula el total), y `eliminar(i)` modifica los datos y redibuja. Nada de esto se puede probar sin navegador.

**Otros problemas de diseño detectados**
- La identidad de una tarea es su **posición** en el arreglo: al eliminar, los índices de las demás cambian.
- `innerHTML` con texto del usuario: `<b>hola</b>` se muestra en negritas (el texto se interpreta como HTML).
- `onclick="eliminar(i)"` en el HTML obliga a que `eliminar` sea una función global.

**Comportamientos observables que NO deben cambiar (base de las pruebas de regresión)**
1. Al cargar se muestran las 3 tareas iniciales, en ese orden, y el resumen dice `Total: 3`.
2. Un título válido se agrega **al final** de la lista, sin espacios al inicio ni al final, y el campo se limpia.
3. Un título vacío o con solo espacios **no** se agrega y se muestra "Escribe un título para la tarea.".
4. Eliminar una tarea quita **solo esa** tarea.
5. El total siempre coincide con el número de tareas mostradas.

## Casos de prueba
| # | Función | Caso | Tipo | Resultado esperado |
|---|---|---|---|---|
| 1 | `tareasIniciales` | Conserva los 3 títulos del legacy en orden | Normal | `["Revisar requisitos", "Diseñar pruebas", "Refactorizar código"]` |
| 2 | `tareasIniciales` | Ids únicos y todas pendientes | Normal | `Set` del mismo tamaño y `every` → `true` |
| 3 | `crearTarea` | `crearTarea(10, "Diseñar pruebas")` | Normal | `{ id: 10, titulo: "Diseñar pruebas", completada: false }` |
| 4 | `agregarTarea` | Agrega una tarea | Normal | La nueva tarea queda al final |
| 5 | `agregarTarea` | Tamaño del resultado | Normal | `length` del original + 1 |
| 6 | `agregarTarea` | Inmutabilidad | Frontera | El original sigue con 1 elemento y el resultado es otro arreglo |
| 7 | `buscarTarea` | Id existente (2) | Normal | Devuelve `{ id: 2, titulo: "Diseñar pruebas", completada: false }` |
| 8 | `buscarTarea` | Id inexistente (99) | Error | `undefined` |
| 9 | `buscarTarea` | Colección vacía | Frontera | `undefined` |
| 10 | `obtenerPendientes` / `obtenerTerminadas` | Colección mixta (1 terminada, 2 pendientes) | Normal | Pendientes ids `[2, 3]`; terminadas ids `[1]` |
| 11 | `obtenerPendientes` | Ninguna pendiente | Frontera | `[]` |
| 12 | `obtenerPendientes` / `obtenerTerminadas` | Colección vacía | Frontera | `[]` en ambas |
| 13 | `obtenerPendientes` / `obtenerTerminadas` | Inmutabilidad | Frontera | La colección original queda igual a su copia |
| 14 | `cambiarEstado` | Cambiar el id 2 una vez y luego otra | Normal | `completada`: `true` y después `false` |
| 15 | `cambiarEstado` | Las demás tareas | Normal | La tarea 1 queda igual |
| 16 | `cambiarEstado` | Id inexistente (99) | Error | El resultado es igual al original |
| 17 | `cambiarEstado` | Inmutabilidad | Frontera | El objeto original sigue en `false` y el resultado es otro objeto |
| 18 | `eliminarTarea` | Eliminar id 2 de [1, 2, 3] | Normal | Quedan ids `[1, 3]` |
| 19 | `eliminarTarea` | Id inexistente (99) | Error | Quedan ids `[1, 2]` (no borra nada) |
| 20 | `eliminarTarea` | Colección vacía | Frontera | `[]` |
| 21 | `eliminarTarea` | Inmutabilidad | Frontera | El original conserva ids `[1, 2]` |
| 22 | `obtenerResumen` | 5 tareas (2 terminadas) | Normal | `{ total: 5, pendientes: 3, terminadas: 2 }` |
| 23 | `obtenerResumen` | Colección vacía | Frontera | `{ total: 0, pendientes: 0, terminadas: 0 }` |
| 24 | `obtenerResumen` | Compuesto con `cambiarEstado` y `eliminarTarea` | Normal | `{3, 2, 1}` y luego `{2, 2, 0}` |
| 25 | `obtenerResumen` | Invariante | Frontera | `pendientes + terminadas === total` |
| 26 | `normalizarTitulo` | `"   Estudiar Vitest  "` | Normal | `"Estudiar Vitest"` |
| 27 | `esTituloValido` | `"Estudiar Vitest"` | Normal | `true` |
| 28 | `esTituloValido` | `""` y `"    "` | Error | `false` en ambos |
| 29 | `siguienteId` | Ids `[1, 5, 3]` | Normal | `6` |
| 30 | `siguienteId` | Colección vacía | Frontera | `1` (sin `-Infinity`) |
| 31 | `filtrarTareas` | `"pendientes"` | Normal | Ids `[1, 3]` |
| 32 | `filtrarTareas` | `"terminadas"` | Normal | Ids `[2]` |
| 33 | `filtrarTareas` | `"todas"` | Normal | La colección completa |
| 34 | `tituloComparable` | `"  Diseñar   PRUEBAS "` | Normal | `"diseñar pruebas"` |
| 35 | `existeTitulo` | `"Diseñar pruebas"` (exacto) | Normal | `true` |
| 36 | `existeTitulo` | `"diseñar PRUEBAS"` | Normal | `true` |
| 37 | `existeTitulo` | `"   Diseñar    pruebas  "` | Frontera | `true` |
| 38 | `existeTitulo` | `"Estudiar Vitest"` | Normal | `false` |
| 39 | `existeTitulo` | `"Disenar pruebas"` (sin ñ) | Frontera | `false` (los acentos cuentan) |
| 40 | `existeTitulo` | Colección vacía | Frontera | `false` |
| 41 | `existeTitulo` | Después de eliminar la tarea 2 | Normal | `false` (el título se puede reutilizar) |

## Pruebas de integración manual

La interfaz se abre con Live Server (los módulos no cargan con `file://`). Resultado observado en cada escenario:

| # | Escenario | Acción | Resultado esperado | Resultado observado | Evidencia |
|---|---|---|---|---|---|
| 1 | Alta válida | Escribir "  Estudiar Vitest  " y Agregar | Nueva tarea pendiente al final, sin espacios; cambia el resumen | ✅ Como se esperaba | `evidencias/m09-1-alta-valida.png` |
| 2 | Alta inválida | Enviar título con solo espacios | No se agrega; mensaje "Escribe un título para la tarea." | ✅ Como se esperaba | `evidencias/m09-2-alta-invalida.png` |
| 3 | Cambio de estado | Marcar "Diseñar pruebas" | Se tacha; Pendientes −1, Terminadas +1 | ✅ Como se esperaba | `evidencias/m09-3-cambio-estado.png` |
| 4 | Filtro | Elegir "Pendientes" | Solo se muestran pendientes | ✅ Como se esperaba | `evidencias/m09-4-filtro.png` |
| 5 | Eliminar | Eliminar "Revisar requisitos" | Desaparece y se actualiza el resumen | ✅ Como se esperaba | `evidencias/m09-5-eliminar.png` |
| 6 | Regresión de seguridad | Agregar `<b style="color:red">hola</b>` | Se muestra como texto (antes se interpretaba como HTML) | ✅ Como se esperaba | `evidencias/m09-6-inyeccion-corregida.png` |

**Fallos encontrados** (formato: entrada → observado → esperado → corrección): ninguno.

| 7 | Título duplicado | Escribir "  diseñar   PRUEBAS " y Agregar | No se agrega; mensaje "Ya existe una tarea con ese título." | ✅ Como se esperaba | `evidencias/m11-app-duplicado.png` |
| 8 | Reutilizar título | Eliminar "Diseñar pruebas" y volver a agregarlo | Se agrega al final | ✅ Como se esperaba | `evidencias/m11-app-reutilizar.png` |

## Decisiones de refactor
### 1. De string a objeto (Misión 1)
- **Antes:** `"Diseñar pruebas"`. La identidad era el índice y no había dónde guardar si estaba terminada.
- **Después:** `{ id: 2, titulo: "Diseñar pruebas", completada: false }`.
- **Por qué:** el `id` no cambia al eliminar otras tareas y `completada` vive dentro de la tarea, sin arreglos paralelos. Agregar prioridad o fecha después solo implica agregar una propiedad.
- **Qué pertenece a la tarea y qué a la interfaz:** `id`, `titulo` y `completada` son datos de la tarea. La clase CSS `completada`, el texto del botón, el filtro seleccionado y el mensaje de error son de la interfaz, así que no van en el objeto.
- **Pruebas que lo protegen:** los títulos y el orden del legacy se conservan; los ids son únicos y todas las tareas empiezan pendientes.


### 2. Agregar sin DOM y sin mutar (Misión 3)
- **Antes:** `tareas.push(entrada.value.trim())` dentro del evento submit, seguido de `mostrarTareas()`.
- **Después:** `agregarTarea(tareas, nuevaTarea)` devuelve `[...tareas, nuevaTarea]`.
- **Por qué:** la función solo transforma datos; no lee el input ni dibuja nada, así que se prueba sin navegador.
- **Pregunta del caso:** si `agregarTarea` modificara el arreglo recibido, la prueba "no modifica el arreglo original" lo detecta. Lo comprobamos con una versión que usaba `push`: fallaron 2 pruebas. También falló "un elemento más", porque `tareas.length` ya había crecido.

### 3. Buscar por id con find() (Misión 4)
- **Antes:** en el legacy la única forma de ubicar una tarea era su índice (`eliminar(i)`), y ese índice cambia al borrar otras tareas.
- **Después:** `buscarTarea(tareas, id)` usa `tareas.find(t => t.id === id)`.
- **Por qué find():** comunica "encontrar una". Se detiene en la primera coincidencia y devuelve el elemento o `undefined`; `filter()` devolvería un arreglo aunque solo hubiera una coincidencia.
- **Casos frontera:** id inexistente y colección vacía devuelven `undefined`, sin lanzar error. Quien llame a la función debe contemplar ese caso.

### 4. Vistas con filter() (Misión 5)
- **Antes:** el legacy tenía el filtro `disabled` porque con strings no había estado que filtrar.
- **Después:** `obtenerPendientes` usa `filter(t => !t.completada)` y `obtenerTerminadas` usa `filter(t => t.completada)`.
- **Por qué filter():** selecciona los elementos que cumplen una condición y devuelve un arreglo nuevo, sin transformarlos. `find()` solo devolvería el primero.
- **Pregunta del caso:** cuando no hay coincidencias, `filter()` devuelve `[]`, no `undefined`. Así quien la usa puede recorrer el resultado sin validar.
- **Separación datos/vista:** la función decide qué tareas cumplen la condición; cómo se muestran lo decide `app.js` en la Misión 9.

### 5. Cambiar estado con map() + spread (Misión 6)
- **Antes:** con strings no existía el estado; la opción "directa" sería buscar la tarea y hacer `tarea.completada = true`, lo que modifica el objeto compartido.
- **Después:** `cambiarEstado` usa `map()` y, solo para la tarea con ese id, crea una copia con `{ ...tarea, completada: !tarea.completada }`. Las demás tareas pasan igual.
- **Por qué map():** la operación transforma la colección y devuelve otra del mismo tamaño. `forEach()` no devuelve nada y `filter()` quitaría elementos.
- **Por qué spread:** copia las propiedades y sustituye solo `completada`, así el objeto original no cambia.
- **Evidencia:** con una versión que mutaba (`find` + asignación) fallaron 2 pruebas: la de alternar el estado (los dos resultados compartían el mismo objeto) y la de no modificar el original.

### 6. Eliminar por id con filter() (Misión 7)
- **Antes:** `eliminar(i)` hacía `tareas.splice(i, 1)` usando la posición, era una función global por el `onclick` y además redibujaba.
- **Después:** `eliminarTarea(tareas, id)` devuelve `tareas.filter(t => t.id !== id)`.
- **Por qué filter():** eliminar es "conservar todas excepto una". `map()` no puede quitar elementos y `find()` solo localiza uno.
- **Caso frontera descubierto:** con `findIndex` + `splice`, un id inexistente da `-1` y `splice(-1, 1)` borra la **última** tarea. La prueba "id inexistente" compara contra valores fijos (`[1, 2]`), porque comparar contra el arreglo original no sirve si ese original también fue modificado.
- **Evidencia:** la variante con `splice` falla 2 pruebas (`evidencias/m07-splice-rojo.jpeg`).

### 7. Resumen por composición (Misión 8)
- **Antes:** `mostrarTareas()` calculaba `"Total: " + tareas.length` mientras dibujaba la lista; solo existía el total.
- **Después:** `obtenerResumen(tareas)` devuelve `{ total, pendientes, terminadas }` reutilizando `obtenerPendientes` y `obtenerTerminadas`.
- **Comparación:** calcular directo (un solo recorrido con `reduce`) hace menos trabajo, pero repite la condición `completada`. Reutilizar comunica mejor la intención, no duplica reglas y, si la regla cambia, se modifica en un solo lugar. Con pocas tareas, recorrer el arreglo 2 veces no se nota.
- **Pruebas:** además del ejemplo del caso, una prueba de composición (`cambiarEstado` → `eliminarTarea` → resumen) y una invariante (`pendientes + terminadas === total`).

### 8. app.js como adaptador (Misión 9)
- **Antes:** `legacy.js` mezclaba datos, reglas y DOM; usaba `innerHTML` con texto del usuario y `onclick="eliminar(i)"` global.
- **Después:** `app.js` tiene 4 zonas: referencias al DOM, estado, `render()` y eventos. Cada evento llama a una función de `taskService.js`, guarda el nuevo estado (`tareas = ...`) y llama a `render()`.
- **Seguridad:** `render()` usa `createElement` + `textContent`, así que el título nunca se interpreta como HTML (se corrigió el problema detectado en la Misión 0).
- **Sin globales:** cada botón recibe su evento con `addEventListener` y conoce el `id` de su tarea, no un índice.
- **Lo que no se prueba con Vitest:** el DOM se verificó con las pruebas manuales; las reglas ya estaban cubiertas por las 25 pruebas unitarias.
- **Pendiente para la Misión 10:** en `app.js` quedaron dos reglas: validar o recortar el título y calcular el siguiente id.

### 9. Refactor final protegido por pruebas (Misión 10)
Con las 25 pruebas en verde revisamos `app.js` y refactorizamos solo lo que podíamos justificar:

| Problema | Criterio del caso | Cambio |
|---|---|---|
| `entrada.value.trim() === ""` en el evento | Dependencia entre DOM y reglas | `esTituloValido()` / `normalizarTitulo()` en `taskService.js` |
| `let siguienteId` + `siguienteId++` | Regla y estado mezclados con la interfaz | `siguienteId(tareas)` calcula el id desde los datos |
| `tareasVisibles()` decidía con `if` sobre `filtro.value` | Más de una responsabilidad | `filtrarTareas(tareas, filtro)` en el dominio |
| `tareas = ...; render();` repetido 3 veces | Código duplicado | `actualizar(nuevasTareas)`: único punto donde cambia el estado |

- **Proceso:** primero agregamos las funciones con 8 pruebas (33 en verde) sin tocar `app.js`; después cambiamos `app.js` y volvimos a correr las pruebas y los 6 escenarios manuales. El comportamiento es el mismo.
- **Caso frontera:** `Math.max()` de un arreglo vacío da `-Infinity`; por eso `siguienteId` usa `Math.max(0, ...ids)` y devuelve 1.
- **Efecto conocido:** si se elimina la tarea con el id mayor, la siguiente alta reutiliza ese id. Sigue siendo único dentro de la colección, que es lo que necesitan `buscarTarea`, `cambiarEstado` y `eliminarTarea`.
- **Resultado:** `app.js` ya no contiene ninguna condición de negocio; solo DOM, eventos y `actualizar()`.

## Extensión elegida (Misión 11)

**Opción D · Evitar títulos duplicados.**

**¿Qué significa "duplicado"?** Decidimos que es *normalizado*, no exacto:
- Se ignoran espacios al inicio, al final y repetidos entre palabras.
- No se distinguen mayúsculas de minúsculas.
- Los acentos **sí** cuentan ("Disenar" ≠ "Diseñar"): son palabras distintas en español.

**Diseño**
- `tituloComparable(texto)` construye la "clave" de comparación reutilizando `normalizarTitulo()` de la Misión 10.
- `existeTitulo(tareas, titulo)` usa `some()`, porque la pregunta es "¿existe alguna?" y la respuesta es `true`/`false`. `find()` devolvería la tarea y `filter()` un arreglo.
- La regla vive en `taskService.js`; `app.js` solo decide qué mensaje mostrar.

**Pruebas primero:** se escribieron 8 pruebas antes de implementar. ROJO: `8 failed | 33 passed`, con `(0 , existeTitulo) is not a function` (`evidencias/m11-red.png`). VERDE: `41 passed` (`evidencias/m11-green.png`).

**¿El refactor facilitó el cambio?** Sí. En `app.js` solo se agregaron un import y un `if` de 4 líneas; no se tocaron `render()`, los eventos de la lista ni las demás funciones. Gracias a la Misión 10, la validación ya estaba en el dominio y la nueva regla se puso junto a `esTituloValido()`. Todas las pruebas anteriores siguieron en verde, así que no se rompió nada existente.

**Alternativa descartada:** que `agregarTarea` rechazara duplicados por sí misma. La descartamos porque tendría que lanzar un error o devolver el arreglo sin cambios, y la interfaz no sabría qué mensaje mostrar. Una función que pregunta (`existeTitulo`) mantiene `agregarTarea` simple y sigue el mismo patrón que `esTituloValido`.

## Evidencia
### Registro de una prueba que inicialmente falló (Misión 2)
- **Prueba:** `crea una tarea pendiente con id y título`.
- **ROJO:** se escribió antes de que existiera la función. Resultado: `TypeError: (0 , crearTarea) is not a function` (1 failed | 2 passed). Evidencia: `evidencias/m02-red.png` (resumen) y `evidencias/m02-red-error.png` (detalle del error, reproducido quitando temporalmente el `export`).
- **Por qué falló:** `taskService.js` todavía no exportaba `crearTarea`.
- **GREEN:** se implementó el mínimo código (`return { id, titulo, completada: false }`). Resultado: 3 passed. Evidencia: `evidencias/m02-green.png`.
- **REFACTOR:** no hizo falta; la función ya es una sola línea clara.

## Reflexión de pareja (200–250 palabras)
