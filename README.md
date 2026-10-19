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
| M8 | | | |
| M9 | | | |
| M10 | | | |
| M11 | | | |

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

## Pruebas de integración manual

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
- **Evidencia:** la variante con `splice` falla 2 pruebas (`evidencias/m07-splice-rojo.png`).

## Extensión elegida (Misión 11)

## Evidencia
### Registro de una prueba que inicialmente falló (Misión 2)
- **Prueba:** `crea una tarea pendiente con id y título`.
- **ROJO:** se escribió antes de que existiera la función. Resultado: `TypeError: (0 , crearTarea) is not a function` (1 failed | 2 passed). Evidencia: `evidencias/m02-red.png` (resumen) y `evidencias/m02-red-error.png` (detalle del error, reproducido quitando temporalmente el `export`).
- **Por qué falló:** `taskService.js` todavía no exportaba `crearTarea`.
- **GREEN:** se implementó el mínimo código (`return { id, titulo, completada: false }`). Resultado: 3 passed. Evidencia: `evidencias/m02-green.png`.
- **REFACTOR:** no hizo falta; la función ya es una sola línea clara.

## Reflexión de pareja (200–250 palabras)
