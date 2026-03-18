import { test, expect } from "@playwright/test";

test.describe("Autenticacion", () => {
  test("muestra pagina de login", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: /iniciar sesion/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contrasena")).toBeVisible();
  });

  test("muestra pagina de registro", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByLabel("Nombre completo")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("redirige a signin si no autenticado", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/signin**");
    await expect(page).toHaveURL(/signin/);
  });

  test("login con credenciales validas", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Email").fill("maria@email.com");
    await page.getByLabel("Contrasena").fill("123456");
    await page.getByRole("button", { name: /iniciar sesion/i }).click();
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("login con credenciales invalidas muestra error", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Email").fill("invalido@email.com");
    await page.getByLabel("Contrasena").fill("wrongpassword");
    await page.getByRole("button", { name: /iniciar sesion/i }).click();
    await expect(page.getByText(/credenciales|incorrectas|error/i)).toBeVisible({ timeout: 5000 });
  });
});
