// ============================================================
// TODO REFACTOR LAB · VERSIÓN LEGACY
// Funciona, pero las tareas son strings y los datos se mezclan con el DOM.
// No la modifiquen: es el punto de comparación del refactor.
// ============================================================

let tareas = [
  "Revisar requisitos",
  "Diseñar pruebas",
  "Refactorizar código"
];

const formulario = document.querySelector("#formTarea");
const entrada = document.querySelector("#tituloTarea");
const mensaje = document.querySelector("#mensaje");
const lista = document.querySelector("#listaTareas");
const resumen = document.querySelector("#resumen");
const filtro = document.querySelector("#filtro");

// Con strings no hay estado "completada", así que no hay nada que filtrar.
filtro.disabled = true;

function mostrarTareas() {
  lista.innerHTML = "";
  for (let i = 0; i < tareas.length; i++) {
    lista.innerHTML += `<li class="tarea"><span class="titulo">${tareas[i]}</span>` +
      `<button class="eliminar" onclick="eliminar(${i})">Eliminar</button></li>`;
  }
  resumen.textContent = "Total: " + tareas.length;
}

function eliminar(i) {
  tareas.splice(i, 1);
  mostrarTareas();
}

formulario.addEventListener("submit", function (e) {
  e.preventDefault();
  if (entrada.value.trim() === "") {
    mensaje.textContent = "Escribe un título para la tarea.";
    return;
  }
  tareas.push(entrada.value.trim());
  entrada.value = "";
  mensaje.textContent = "";
  mostrarTareas();
});

mostrarTareas();
