import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("redirects signed-out users to the login page", async ({ page }) => {
  await page.goto("/products");
  await expect(page).toHaveURL(/\/login$/);
});

test("shows an error for wrong credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});

test("admin can create, find and delete a product", async ({ page }) => {
  const name = `E2E Lasagna ${Date.now()}`;

  await login(page, "admin@example.com", "Admin123!");

  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Products" })
    .click();
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

  await page.getByRole("link", { name: "New product" }).click();

  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page.getByText("Name is required")).toBeVisible();

  await page.getByLabel("Name").fill(name);
  await page
    .getByLabel("Description")
    .fill("Layers of pasta, beef ragù and béchamel");
  await page.getByLabel("Price (USD)").fill("16.40");
  await page.getByLabel("Stock").fill("12");
  await page.getByLabel("Category").selectOption({ label: "Food" });
  await page.getByRole("button", { name: "Create product" }).click();

  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText("$16.40")).toBeVisible();

  await page.goto("/products");
  await page.getByLabel("Search").fill(name);
  await page.getByLabel("Search").press("Enter");
  await expect(page).toHaveURL(/search=E2E/);
  await expect(
    page.getByRole("table").getByRole("link", { name, exact: true }),
  ).toBeVisible();

  await page
    .getByRole("table")
    .getByRole("link", { name, exact: true })
    .click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
});

test("manager does not see the delete action", async ({ page }) => {
  await login(page, "manager@example.com", "Manager123!");
  await page.goto("/products");
  await expect(
    page.getByRole("link", { name: /^Edit / }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);
});
