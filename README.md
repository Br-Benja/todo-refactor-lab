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
| M0 | Leonardo | Benjamín | Análisis del legacy y 5 comportamientos a conservar |
| M0 | | | |
| M1 | | | |
| M2 | | | |
| M3 | | | |
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

## Pruebas de integración manual

## Decisiones de refactor

## Extensión elegida (Misión 11)

## Evidencia

## Reflexión de pareja (200–250 palabras)
