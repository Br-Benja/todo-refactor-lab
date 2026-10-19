import { describe, it, expect } from "vitest";
import {
  tareasIniciales,
  crearTarea,
  agregarTarea,
  buscarTarea,
  obtenerPendientes,
  obtenerTerminadas,
  cambiarEstado
} from "../src/taskService.js";

// Las pruebas de cada misión se agregan en este archivo.
// Cada prueba sigue la estructura Arrange → Act → Assert.

describe("Misión 1 · modelo de tareas", () => {
  it("conserva los 3 títulos del legacy en el mismo orden", () => {
    // Arrange
    const esperados = ["Revisar requisitos", "Diseñar pruebas", "Refactorizar código"];

    // Act
    const titulos = tareasIniciales.map(t => t.titulo);

    // Assert
    expect(titulos).toEqual(esperados);
  });

  it("cada tarea tiene un id único y empieza pendiente", () => {
    // Arrange
    const tareas = tareasIniciales;

    // Act
    const idsUnicos = new Set(tareas.map(t => t.id));
    const todasPendientes = tareas.every(t => t.completada === false);

    // Assert
    expect(idsUnicos.size).toBe(tareas.length);
    expect(todasPendientes).toBe(true);
  });
});


describe("Misión 2 · crearTarea", () => {
  it("crea una tarea pendiente con id y título", () => {
    // Arrange
    const id = 10;
    const titulo = "Diseñar pruebas";

    // Act
    const tarea = crearTarea(id, titulo);

    // Assert
    expect(tarea).toEqual({
      id: 10,
      titulo: "Diseñar pruebas",
      completada: false
    });
  });
});


describe("Misión 3 · agregarTarea", () => {
  it("agrega la nueva tarea al final", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos")];
    const nueva = crearTarea(2, "Diseñar pruebas");

    // Act
    const resultado = agregarTarea(tareas, nueva);

    // Assert
    expect(resultado.at(-1)).toEqual(nueva);
  });

  it("el resultado tiene exactamente un elemento más", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos"), crearTarea(2, "Diseñar pruebas")];

    // Act
    const resultado = agregarTarea(tareas, crearTarea(3, "Refactorizar código"));

    // Assert
    expect(resultado).toHaveLength(tareas.length + 1);
  });

  it("no modifica el arreglo original", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos")];

    // Act
    const resultado = agregarTarea(tareas, crearTarea(2, "Diseñar pruebas"));

    // Assert
    expect(tareas).toHaveLength(1);
    expect(resultado).not.toBe(tareas);
  });
});

describe("Misión 4 · buscarTarea", () => {
  it("encuentra la tarea con un id existente", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos"), crearTarea(2, "Diseñar pruebas")];

    // Act
    const encontrada = buscarTarea(tareas, 2);

    // Assert
    expect(encontrada).toEqual({ id: 2, titulo: "Diseñar pruebas", completada: false });
  });

  it("devuelve undefined si el id no existe", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos")];

    // Act
    const encontrada = buscarTarea(tareas, 99);

    // Assert
    expect(encontrada).toBeUndefined();
  });

  it("devuelve undefined en una colección vacía", () => {
    // Arrange
    const tareas = [];

    // Act
    const encontrada = buscarTarea(tareas, 1);

    // Assert
    expect(encontrada).toBeUndefined();
  });
});


describe("Misión 5 · obtenerPendientes / obtenerTerminadas", () => {
  // Colección mixta: 2 pendientes y 1 terminada.
  const mixta = [
    { id: 1, titulo: "Revisar requisitos", completada: true },
    { id: 2, titulo: "Diseñar pruebas", completada: false },
    { id: 3, titulo: "Refactorizar código", completada: false }
  ];

  it("en una colección mixta separa pendientes y terminadas", () => {
    // Arrange
    const tareas = mixta;

    // Act
    const pendientes = obtenerPendientes(tareas);
    const terminadas = obtenerTerminadas(tareas);

    // Assert
    expect(pendientes.map(t => t.id)).toEqual([2, 3]);
    expect(terminadas.map(t => t.id)).toEqual([1]);
  });

  it("si ninguna está pendiente devuelve un arreglo vacío", () => {
    // Arrange
    const tareas = [
      { id: 1, titulo: "Revisar requisitos", completada: true },
      { id: 2, titulo: "Diseñar pruebas", completada: true }
    ];

    // Act
    const pendientes = obtenerPendientes(tareas);

    // Assert
    expect(pendientes).toEqual([]);
  });

  it("con una colección vacía ambas devuelven un arreglo vacío", () => {
    // Arrange
    const tareas = [];

    // Act
    const pendientes = obtenerPendientes(tareas);
    const terminadas = obtenerTerminadas(tareas);

    // Assert
    expect(pendientes).toEqual([]);
    expect(terminadas).toEqual([]);
  });

  it("no modifica la colección original", () => {
    // Arrange
    const copia = structuredClone(mixta);

    // Act
    obtenerPendientes(mixta);
    obtenerTerminadas(mixta);

    // Assert
    expect(mixta).toEqual(copia);
  });
});


describe("Misión 6 · cambiarEstado", () => {
  it("cambia el estado de la tarea indicada (pendiente ↔ terminada)", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos"), crearTarea(2, "Diseñar pruebas")];

    // Act
    const unaVez = cambiarEstado(tareas, 2);
    const dosVeces = cambiarEstado(unaVez, 2);

    // Assert
    expect(buscarTarea(unaVez, 2).completada).toBe(true);
    expect(buscarTarea(dosVeces, 2).completada).toBe(false);
  });

  it("no altera las demás tareas", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos"), crearTarea(2, "Diseñar pruebas")];

    // Act
    const resultado = cambiarEstado(tareas, 2);

    // Assert
    expect(resultado[0]).toEqual({ id: 1, titulo: "Revisar requisitos", completada: false });
  });

  it("con un id inexistente conserva el contenido", () => {
    // Arrange
    const tareas = [crearTarea(1, "Revisar requisitos"), crearTarea(2, "Diseñar pruebas")];

    // Act
    const resultado = cambiarEstado(tareas, 99);

    // Assert
    expect(resultado).toEqual(tareas);
  });

  it("no modifica el objeto original (usa spread)", () => {
    // Arrange
    const original = crearTarea(1, "Revisar requisitos");
    const tareas = [original];

    // Act
    const resultado = cambiarEstado(tareas, 1);

    // Assert
    expect(original.completada).toBe(false);
    expect(resultado[0]).not.toBe(original);
  });
});