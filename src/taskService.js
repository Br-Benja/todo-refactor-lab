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

// Misión 2 · Toda tarea nueva nace pendiente.
export function crearTarea(id, titulo) {
  return { id, titulo, completada: false };
}

// Misión 3 · Devuelve una colección nueva; no modifica la recibida.
export function agregarTarea(tareas, nuevaTarea) {
  return [...tareas, nuevaTarea];
}

// Misión 4 · find() expresa "encontrar una": devuelve la tarea o undefined.
export function buscarTarea(tareas, id) {
  return tareas.find(t => t.id === id);
}

// Misión 5 · filter() selecciona un subconjunto sin alterar la colección.
export function obtenerPendientes(tareas) {
  return tareas.filter(t => !t.completada);
}

export function obtenerTerminadas(tareas) {
  return tareas.filter(t => t.completada);
}

// Misión 6 · map() produce una colección nueva; spread crea una tarea nueva
// sólo para la que cambia, sin modificar el objeto original.
export function cambiarEstado(tareas, id) {
  return tareas.map(tarea =>
    tarea.id === id
      ? { ...tarea, completada: !tarea.completada }
      : tarea
  );
}

// Misión 7 · Eliminar = "conservar todas excepto la del id" -> filter().
export function eliminarTarea(tareas, id) {
  return tareas.filter(t => t.id !== id);
}

// Pendientes:
// Misión 8 · obtenerResumen(tareas)