// ============================================================
// app.js · Adaptador entre la interfaz (DOM) y el dominio
// Lee eventos, llama a funciones de taskService.js y muestra el resultado.
// Aquí NO hay reglas de negocio: sólo DOM, eventos y estado de la pantalla.
// ============================================================

import {
  tareasIniciales,
  crearTarea,
  agregarTarea,
  cambiarEstado,
  eliminarTarea,
  obtenerResumen,
  normalizarTitulo,
  esTituloValido,
  siguienteId,
  filtrarTareas,
  existeTitulo
} from "./taskService.js";

// 1. Referencias al DOM
const formulario = document.querySelector("#formTarea");
const entrada = document.querySelector("#tituloTarea");
const mensaje = document.querySelector("#mensaje");
const filtro = document.querySelector("#filtro");
const lista = document.querySelector("#listaTareas");
const resumen = document.querySelector("#resumen");

// 2. Estado de la aplicación
let tareas = tareasIniciales;

// Único punto donde cambia el estado: guarda la nueva colección y redibuja.
function actualizar(nuevasTareas) {
  tareas = nuevasTareas;
  render();
}

// 3. render(): dibuja el estado actual; no modifica datos
function crearElementoTarea(tarea) {
  const li = document.createElement("li");
  li.className = tarea.completada ? "tarea completada" : "tarea";

  const casilla = document.createElement("input");
  casilla.type = "checkbox";
  casilla.checked = tarea.completada;
  casilla.setAttribute("aria-label", "Marcar como terminada");
  casilla.addEventListener("change", () => actualizar(cambiarEstado(tareas, tarea.id)));

  const titulo = document.createElement("span");
  titulo.className = "titulo";
  titulo.textContent = tarea.titulo; // textContent: el texto nunca se interpreta como HTML

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "eliminar";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.addEventListener("click", () => actualizar(eliminarTarea(tareas, tarea.id)));

  li.append(casilla, titulo, botonEliminar);
  return li;
}

function render() {
  const visibles = filtrarTareas(tareas, filtro.value);
  lista.replaceChildren(...visibles.map(crearElementoTarea));

  if (visibles.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "vacio";
    vacio.textContent = "No hay tareas para mostrar.";
    lista.append(vacio);
  }

  const { total, pendientes, terminadas } = obtenerResumen(tareas);
  resumen.textContent = `Total: ${total} · Pendientes: ${pendientes} · Terminadas: ${terminadas}`;
}

// 4. Eventos
formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  if (!esTituloValido(entrada.value)) {
        mensaje.textContent = "Escribe un título para la tarea.";
    return;
  }

  if (existeTitulo(tareas, entrada.value)) {
    mensaje.textContent = "Ya existe una tarea con ese título.";
    return;
  }

  const nueva = crearTarea(siguienteId(tareas), normalizarTitulo(entrada.value));
  entrada.value = "";
  mensaje.textContent = "";
  actualizar(agregarTarea(tareas, nueva));
});

filtro.addEventListener("change", render);

render();