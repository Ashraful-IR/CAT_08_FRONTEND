import { test, expect } from "@playwright/test";

/**
 * Critical user journeys (roadmap 5.4, docs/TDD → E2E level). Runs against
 * the real dev server on 5002 and the real deployed backend (per repo
 * convention: MSW only in unit/integration tests). Registration uses a
 * unique email so reruns never collide with "Email already registered".
 */

const timestamp = Date.now();
const EMAIL = `e2e-${timestamp}@example.com`;
const PASSWORD = "Secret1";
const NAME = `E2E Runner ${timestamp}`;

test.describe.serial("booking journey", () => {
  let doctorUrl;

  test("register creates an account and forwards to login", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill(NAME);
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Photo URL").fill("https://i.ibb.co/e2e-avatar.jpg");
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();

    // Sign-up does not sign in (API_CONTRACT → Auth): lands on /login.
    await expect(page).toHaveURL(/\/login/);
  });

  test("sign-in reaches the profile picked at registration time", async ({ page }) => {
    // Arrive exactly as the booking gate would: /login?next=<doctor url>.
    doctorUrl = await pickFirstDoctorUrl(page);
    await page.goto(`/login?next=${encodeURIComponent(doctorUrl)}`);

    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(doctorUrl);
    await expect(
      page.getByRole("heading", { level: 1, name: /.+/i }),
    ).toBeVisible();
  });

  test("a signed-out visitor sees the sign-in gate instead of the booking form", async ({
    page,
  }) => {
    await page.goto(doctorUrl);
    // No session cookie in this context.
    await expect(
      page.getByRole("heading", { name: /sign in to book/i }),
    ).toBeVisible();
    // Scoped to main: the navbar and footer also carry plain /login "Sign in"
    // links; the gate's link is the one carrying the ?next= return path.
    const signInLink = page
      .getByRole("main")
      .getByRole("link", { name: /sign in/i })
      .filter({ hasNotText: "Register" })
      .last();
    await expect(signInLink).toHaveAttribute(
      "href",
      new RegExp(`next=${encodeURIComponent(doctorUrl)}`),
    );
  });

  test("booking flow: pick slot, fill form, land on /appointments", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(doctorUrl);

    // Today's grid can already be exhausted when the run happens late in
    // the day, so book on the second date tab (tomorrow) and pick the first
    // slot that is not disabled (booked/past slots are disabled). The radio
    // input is visually hidden (sr-only); clicking its label selects it.
    await page.getByRole("tab").nth(1).click();
    const slot = page
      .locator('label:has(button[role="radio"]:not([disabled]))')
      .first();
    await slot.click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByLabel("Patient name").fill(NAME);
    await page.getByRole("radio", { name: "Male", exact: true }).click();
    await page.getByLabel(/phone/i).fill("01712345678");
    await page.getByRole("button", { name: /confirm booking/i }).click();

    await expect(
      page.getByRole("dialog", { name: /appointment confirmed/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^done$/i }).click();

    await expect(page).toHaveURL(/\/appointments/);
    await expect(
      page.getByRole("heading", { level: 1, name: /my appointments/i }),
    ).toBeVisible();
  });

  test("the booked appointment appears under Upcoming with actions", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/appointments");

    const upcoming = page.getByRole("tabpanel", {
      name: /upcoming appointments/i,
    });
    await expect(upcoming.getByText(NAME)).toBeVisible();
    await expect(
      upcoming.getByRole("button", { name: /reschedule/i }).first(),
    ).toBeVisible();
    await expect(
      upcoming.getByRole("button", { name: /cancel appointment/i }).first(),
    ).toBeVisible();
  });

  test("cancel asks for confirmation before deleting", async ({ page }) => {
    await signIn(page);
    await page.goto("/appointments");

    await page
      .getByRole("button", { name: /cancel appointment/i })
      .first()
      .click();
    const dialog = page.getByRole("dialog", {
      name: /cancel this appointment/i,
    });
    await expect(dialog).toBeVisible();

    // Backing out keeps the booking.
    await dialog.getByRole("button", { name: /keep appointment/i }).click();
    await expect(dialog).not.toBeVisible();

    // Confirming removes it.
    await page
      .getByRole("button", { name: /cancel appointment/i })
      .first()
      .click();
    await page
      .getByRole("dialog", { name: /cancel this appointment/i })
      .getByRole("button", { name: /yes, cancel/i })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

test.describe("doctor discovery", () => {
  test("search filters the doctors list by name", async ({ page }) => {
    await page.goto("/doctors");

    await expect(
      page.getByRole("heading", { level: 1, name: /find a doctor|doctors/i }),
    ).toBeVisible();

    // At least one doctor card renders (backend seed data).
    const cards = page.getByRole("article");
    await expect(cards.first()).toBeVisible();

    // The /doctors SearchBar rewrites the q param on submit.
    const search = page
      .getByRole("main")
      .getByRole("searchbox")
      .first();
    await search.click();
    await search.fill("Fatema");
    await search.press("Enter");

    await expect(page).toHaveURL(/\?q=Fatema|&q=Fatema/);
    await expect(page.getByRole("article").first()).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(1);
  });
});

/** Helper: sign in through the UI so the httpOnly cookie is set for real. */
async function signIn(page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/");
}

/** Helper: read the first doctor profile URL from the doctors list. */
async function pickFirstDoctorUrl(page) {
  await page.goto("/doctors");
  const link = page.getByRole("article").first().getByRole("link").first();
  const href = await link.getAttribute("href");
  return href;
}
