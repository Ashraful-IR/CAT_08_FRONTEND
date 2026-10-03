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
  // Every step here hits the deployed serverless backend; cold starts can
  // eat 20s+ per request, so the 30s default test timeout is too tight.
  test.setTimeout(90_000);

  let doctorUrl;

  test("register creates an account and signs the user in", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill(NAME);
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Photo URL (optional)").fill(
      "https://randomuser.me/api/portraits/women/44.jpg",
    );
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password").fill(PASSWORD);
    await page.getByRole("button", { name: /create account/i }).click();

    // Better Auth sign-up signs the user in (API_CONTRACT → Auth): the
    // session cookie is set by the sign-up response, so we land on "/" with
    // the navbar showing the signed-in account menu (serverless cold start:
    // allow the session fetch some room).
    await expect(page).toHaveURL("/", { timeout: 20000 });
    await expect(
      page.getByRole("button", { name: new RegExp(`account menu for ${NAME}`, "i") }),
    ).toBeVisible({ timeout: 20000 });
  });

  test("sign-in reaches the profile picked at registration time", async ({ page }) => {
    // Arrive exactly as the booking gate would: /login?next=<doctor url>.
    // (Register already signed this account in, but a signed-out journey —
    // expired session or fresh context — must still work through /login.)
    doctorUrl = await pickFirstDoctorUrl(page);
    await page.goto(`/login?next=${encodeURIComponent(doctorUrl)}`);

    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Redirect waits on the sign-in POST against the deployed backend —
    // allow for a serverless cold start (free-tier DB can be slow on first hit).
    await expect(page).toHaveURL(doctorUrl, { timeout: 20000 });
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

    // Book on a forward date tab (today's grid can be exhausted late in the
    // day) and pick a RANDOM selectable slot — failed runs leave bookings
    // behind, so "first slot" collides with leftovers across runs. A slot
    // can still be taken between render and submit, so a 409 ("Doctor is
    // already booked at this slot", API_CONTRACT → Status codes) retries on
    // the NEXT date tab. The radio input is visually hidden (sr-only);
    // clicking its label selects it.
    const dialog = page.getByRole("dialog", { name: /appointment confirmed/i });
    const conflict = page
      .getByRole("alert")
      .filter({ hasText: /already booked at this slot/i });

    let booked = false;
    for (let attempt = 0; attempt < 3 && !booked; attempt += 1) {
      // Reload per attempt: a 409 leaves the conflict alert mounted (the
      // form's error state survives until unmount) and a success dialog
      // blocks clicks on the page behind it — both would poison the
      // dialog.or(conflict) check and the next attempt's interactions.
      await page.goto(doctorUrl);

      await page.getByRole("tab").nth(1 + attempt).click();
      const options = page.locator(
        'label:has(button[role="radio"]:not([disabled]))',
      );
      await options
        .nth(Math.floor(Math.random() * (await options.count())))
        .click();
      await page.getByRole("button", { name: /continue/i }).click();

      await page.getByLabel("Patient name").fill(NAME);
      await page.getByRole("radio", { name: "Male", exact: true }).click();
      await page.getByLabel(/phone/i).fill("01712345678");
      await page.getByRole("button", { name: /confirm booking/i }).click();

      // Fresh page ⇒ whatever becomes visible belongs to THIS attempt. The
      // dialog only mounts after createAppointment settles (BookingForm sets
      // confirmOpen post-mutation), so a visible dialog means the POST is
      // done and "Done" is safe to click afterwards.
      await expect(dialog.or(conflict)).toBeVisible({ timeout: 20000 });
      booked = await dialog.isVisible();
    }
    expect(booked).toBe(true);
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
    // The list is a client fetch against the deployed backend — allow for a
    // serverless cold start before the panel (and its data) appears.
    await expect(upcoming).toBeVisible({ timeout: 15000 });
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
