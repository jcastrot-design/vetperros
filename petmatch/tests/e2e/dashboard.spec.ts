import { test, expect } from "@playwright/test";

// Helper to login before tests
async function login(page: import("@playwright/test").Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("maria@email.com");
  await page.getByLabel("Contrasena").fill("123456");
  await page.getByRole("button", { name: /iniciar sesion/i }).click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}

test.describe("Dashboard del Owner", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("muestra saludo y stats", async ({ page }) => {
    await expect(page.getByText(/hola/i)).toBeVisible();
    await expect(page.getByText(/mis mascotas/i).first()).toBeVisible();
    await expect(page.getByText(/reservas/i).first()).toBeVisible();
  });

  test("navega a mascotas", async ({ page }) => {
    await page.getByRole("link", { name: /mis mascotas|mascotas/i }).first().click();
    await page.waitForURL("**/dashboard/pets**");
    await expect(page.getByText(/administra los perfiles/i)).toBeVisible();
  });

  test("navega a buscar servicios", async ({ page }) => {
    await page.getByRole("link", { name: /buscar servicios|servicios/i }).first().click();
    await page.waitForURL("**/services**");
    await expect(page.getByText(/servicios disponibles/i)).toBeVisible();
  });

  test("sidebar muestra grupos de navegacion en desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByText("Servicios").first()).toBeVisible();
    await expect(page.getByText("Social").first()).toBeVisible();
    await expect(page.getByText("Mi cuenta").first()).toBeVisible();
  });
});
