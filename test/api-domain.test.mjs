import test from "node:test";
import assert from "node:assert/strict";
import { createApiClient } from "../src/services/createApiClient.js";
import {
  validateAccount,
  validateAssignment,
  validateRelease,
  ownAssignment,
} from "../src/utils/domain.js";
const account = {
  nombre: "Prueba",
  matricula: "QA-1",
  email: " alumno@ejemplo.utr ",
  password: "secreto",
  confirm: "secreto",
};
test("registro exige matrícula y contraseñas coincidentes", () => {
  assert.equal(validateAccount(account, true), "");
  assert.match(
    validateAccount({ ...account, matricula: " " }, true),
    /matrícula/,
  );
  assert.match(
    validateAccount({ ...account, confirm: "otra" }, true),
    /coinciden/,
  );
  assert.match(
    validateAccount({ ...account, password: "123", confirm: "123" }, true),
    /6 caracteres/,
  );
  assert.match(
    validateAccount({ ...account, email: "correo-invalido" }, true),
    /correo/,
  );
});
test("login no exige datos de registro", () =>
  assert.equal(
    validateAccount({ email: "alumno@ejemplo.utr", password: "abc" }),
    "",
  ));
test("asignación respeta límites API y rechaza valores no finitos", () => {
  for (const hours of ["0.5", "2", "12"])
    assert.equal(validateAssignment("React", hours), "");
  for (const hours of ["", "0", "12.1", "NaN", "Infinity"])
    assert.ok(validateAssignment("React", hours));
  assert.ok(validateAssignment("   ", "2"));
});
test("solo una liberación con falla exige descripción", () => {
  assert.equal(validateRelease(false, ""), "");
  assert.ok(validateRelease(true, " ab "));
  assert.equal(validateRelease(true, "Teclado sin respuesta"), "");
});
test("incluso ADMIN solo ve su propia sesión en Mi sesión activa", () => {
  const records = [
    { assignmentId: "a", userId: "otro", estatus: "ASIGNADA" },
    { assignmentId: "b", userId: "yo", estatus: "LIBERADA" },
    { assignmentId: "c", userId: "yo", estatus: "ASIGNADA" },
  ];
  assert.equal(ownAssignment(records, "yo").assignmentId, "c");
  assert.equal(ownAssignment(records, "nadie"), null);
});
const config = {
  apiUrl: "https://campuslab.test/",
  appToken: "test-app-token",
};
async function withFetch(mock, callback) {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    await callback();
  } finally {
    globalThis.fetch = original;
  }
}
test("cliente envía token de equipo y JWT solamente a la API configurada", async () => {
  await withFetch(
    async (url, options) => {
      assert.equal(url, "https://campuslab.test/api/labs/assignments");
      assert.equal(options.headers.get("x-api-token"), "test-app-token");
      assert.equal(options.headers.get("Authorization"), "Bearer test-jwt");
      assert.equal(options.headers.get("Content-Type"), "application/json");
      return Response.json({ assignmentId: "nueva" });
    },
    async () =>
      assert.deepEqual(
        await createApiClient(config)("/api/labs/assignments", {
          method: "POST",
          body: "{}",
          token: "test-jwt",
        }),
        { assignmentId: "nueva" },
      ),
  );
});
test("401 de sesión invalida el acceso guardado; 401 de login no lo hace", async () => {
  let invalidated = 0;
  await withFetch(
    async () =>
      Response.json(
        { message: "Sesión expirada", code: "TOKEN_EXPIRED" },
        { status: 401 },
      ),
    async () => {
      const request = createApiClient(config);
      await assert.rejects(
        request("/api/auth/me", {
          token: "expired",
          onUnauthorized: () => {
            invalidated++;
          },
        }),
        (e) => e.status === 401,
      );
      await assert.rejects(
        request("/api/auth/login", {
          onUnauthorized: () => {
            invalidated++;
          },
        }),
        (e) => e.status === 401,
      );
    },
  );
  assert.equal(invalidated, 1);
});
test("403 muestra acceso restringido; 409 conserva mensaje del conflicto", async () => {
  for (const status of [403, 409])
    await withFetch(
      async () =>
        Response.json({ message: "La estación ya está ocupada" }, { status }),
      async () =>
        assert.rejects(
          createApiClient(config)("/api/labs/assignments"),
          (e) =>
            e.status === status &&
            (status === 403
              ? /permiso/.test(e.message)
              : /ocupada/.test(e.message)),
        ),
    );
});
test("errores de campos muestran el mensaje de la API", async () => {
  await withFetch(
    async () =>
      Response.json(
        { errors: [{ campo: "email", mensaje: "El correo ya existe." }] },
        { status: 400 },
      ),
    async () =>
      assert.rejects(
        createApiClient(config)("/api/auth/register"),
        /correo ya existe/,
      ),
  );
});
test("evita rutas absolutas que filtrarían el token", async () => {
  let calls = 0;
  await withFetch(
    async () => {
      calls++;
      return Response.json({});
    },
    async () => {
      for (const path of ["https://otro.test", "//otro.test"])
        await assert.rejects(createApiClient(config)(path), /inválida/);
    },
  );
  assert.equal(calls, 0);
});
test("204 sin cuerpo y fallos de red se procesan correctamente", async () => {
  await withFetch(
    async () => new Response(null, { status: 204 }),
    async () =>
      assert.equal(await createApiClient(config)("/api/auth/me"), null),
  );
  await withFetch(
    async () => {
      throw new TypeError("Failed to fetch");
    },
    async () =>
      assert.rejects(
        createApiClient(config)("/api/auth/me"),
        /conectar con el servidor/,
      ),
  );
});
