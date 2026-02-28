import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/privacy", "/terms", "/dev/messages"] as const;

test.describe("Nav and internal links", () => {
  for (const path of ROUTES) {
    test(`${path} returns 200 and does not 404`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response).toBeTruthy();
      expect(response!.status()).not.toBe(404);
      await expect(page).not.toHaveTitle(/404|not found/i);
    });
  }

  test("footer Privacy and Terms links from home are not 404", async ({
    page,
  }) => {
    await page.goto("/");
    const privacyLink = page.getByRole("link", { name: "Privacy Policy" });
    const termsLink = page.getByRole("link", { name: "Terms of Service" });
    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();

    await privacyLink.click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page).not.toHaveTitle(/404|not found/i);

    await page.goto("/");
    await termsLink.click();
    await expect(page).toHaveURL(/\/terms/);
    await expect(page).not.toHaveTitle(/404|not found/i);
  });
});
