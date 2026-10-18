import { describe, it, expect } from "vitest";
import { tareasIniciales } from "../src/taskService.js";

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