import { describe, it, expect } from "vitest";
import { tareasIniciales, crearTarea, agregarTarea, buscarTarea } from "../src/taskService.js";;

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