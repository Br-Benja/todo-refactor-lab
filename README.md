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
| M1 | Benjamín | Leonardo | Tareas como objetos `{id, titulo, completada}` + 2 pruebas · `evidencias/m01-pruebas-verde.png` |
| M2 | Leonardo | Benjamín | `crearTarea` con la prueba escrita primero (RED → GREEN) · `evidencias/m02-red.png`, `evidencias/m02-green.jpeg` |
| M3 | Benjamín | Leonardo | `agregarTarea` devuelve un arreglo nuevo + 3 pruebas · `evidencias/m03-verde.png` |
| M4 | | | |
| M5 | | | |
| M6 | | | |
| M7 | | | |
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

## Extensión elegida (Misión 11)

## Evidencia
### Registro de una prueba que inicialmente falló (Misión 2)
- **Prueba:** `crea una tarea pendiente con id y título`.
- **ROJO:** se escribió antes de que existiera la función. Resultado: `TypeError: (0 , crearTarea) is not a function` (1 failed | 2 passed). Evidencia: `evidencias/m02-red.png` (resumen) y `evidencias/m02-red-error.png` (detalle del error, reproducido quitando temporalmente el `export`).
- **Por qué falló:** `taskService.js` todavía no exportaba `crearTarea`.
- **GREEN:** se implementó el mínimo código (`return { id, titulo, completada: false }`). Resultado: 3 passed. Evidencia: `evidencias/m02-green.png`.
- **REFACTOR:** no hizo falta; la función ya es una sola línea clara.

## Reflexión de pareja (200–250 palabras)
