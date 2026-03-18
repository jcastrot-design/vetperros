import { test, expect } from "@playwright/test";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("maria@email.com");
  await page.getByLabel("Contrasena").fill("123456");
  await page.getByRole("button", { name: /iniciar sesion/i }).click();
  await page.waitForURL("**/dashboard**", { timeout: 10000 });
}

test.describe("Busqueda de Servicios", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("muestra pagina de servicios", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByText(/servicios disponibles/i)).toBeVisible();
  });

  test("muestra pagina de vet a domicilio", async ({ page }) => {
    await page.goto("/vet-home");
    await expect(page.getByText(/veterinario a domicilio/i)).toBeVisible();
  });

  test("muestra marketplace", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page.getByText(/marketplace/i).first()).toBeVisible();
    await expect(page.getByText(/productos para tu mascota/i)).toBeVisible();
  });
});

test.describe("Pagina de Suscripcion", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("muestra planes de suscripcion", async ({ page }) => {
    await page.goto("/dashboard/subscription");
    await expect(page.getByText(/gratis/i).first()).toBeVisible();
    await expect(page.getByText(/premium/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();
  });
});
