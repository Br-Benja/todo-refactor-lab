// ============================================================
// taskService.js · Modelo y reglas sobre tareas (dominio)
// Aquí NO se usa document, querySelector ni innerHTML:
// cada función recibe datos y devuelve datos, para poder probarla con Vitest.
// ============================================================

// Misión 1 · Una tarea ya no es un string: es un objeto con identidad y estado.
export const tareasIniciales = [
  { id: 1, titulo: "Revisar requisitos", completada: false },
  { id: 2, titulo: "Diseñar pruebas", completada: false },
  { id: 3, titulo: "Refactorizar código", completada: false }
];

// Misión 2 · crearTarea(id, titulo)
// Misión 3 · agregarTarea(tareas, nuevaTarea)
// Misión 4 · buscarTarea(tareas, id)             -> find()
// Misión 5 · obtenerPendientes(tareas)            -> filter()
//            obtenerTerminadas(tareas)            -> filter()
// Misión 6 · cambiarEstado(tareas, id)            -> map() + spread
// Misión 7 · eliminarTarea(tareas, id)            -> filter()
// Misión 8 · obtenerResumen(tareas)