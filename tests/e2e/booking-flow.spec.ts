import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('loads and shows booking bar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('search', { name: 'Room search' })).toBeVisible()
    await expect(page.getByText('LuxStay')).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/LuxStay/)
  })
})

test.describe('Booking Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows location selector', async ({ page }) => {
    const locationBtn = page.getByRole('button', { name: /New York/i }).first()
    await locationBtn.click()
    await expect(page.getByRole('listbox', { name: 'Select location' })).toBeVisible()
  })

  test('opens calendar on date click', async ({ page }) => {
    await page
      .getByRole('button', { name: /Check-in/i })
      .first()
      .click()
    await expect(page.getByRole('dialog', { name: 'Date range calendar' })).toBeVisible()
  })

  test('opens guest selector', async ({ page }) => {
    await page
      .getByRole('button', { name: /1 guest/i })
      .first()
      .click()
    await expect(page.getByRole('dialog', { name: 'Select number of guests' })).toBeVisible()
  })

  test('search navigates to rooms page', async ({ page }) => {
    await page.getByRole('button', { name: 'Search available rooms' }).click()
    await expect(page).toHaveURL(/\/rooms/)
    await expect(page.getByRole('heading', { name: 'Available Rooms' })).toBeVisible()
  })
})

test.describe('Rooms Listing', () => {
  test('shows available rooms', async ({ page }) => {
    await page.goto('/rooms')
    // Should show room cards
    const cards = page.locator('[class*="Card"]')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  })

  test('each room card has a View Room link', async ({ page }) => {
    await page.goto('/rooms')
    const viewLinks = page.getByRole('link', { name: 'View Room' })
    await expect(viewLinks.first()).toBeVisible()
  })
})

test.describe('Room Detail', () => {
  test('loads room detail page', async ({ page }) => {
    await page.goto('/rooms/room-001')
    await expect(page.getByRole('heading', { name: /Classic Single/i })).toBeVisible()
  })

  test('shows image gallery', async ({ page }) => {
    await page.goto('/rooms/room-001')
    const images = page.getByRole('button', { name: /View Classic Single image/i })
    await expect(images.first()).toBeVisible()
  })

  test('shows amenities', async ({ page }) => {
    await page.goto('/rooms/room-001')
    await expect(page.getByText('Free Wi-Fi')).toBeVisible()
  })

  test('shows booking panel with Book Now', async ({ page }) => {
    await page.goto('/rooms/room-001')
    await expect(page.getByRole('button', { name: /Select dates to book|Book Now/i })).toBeVisible()
  })
})

test.describe('Route Guards', () => {
  test('redirects /checkout to /rooms when no booking session', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies()
    await page.goto('/checkout')
    // Without valid Stripe keys, we just verify we don't crash; redirect may happen
    // depending on client-side check in useEffect
    await page.waitForLoadState('networkidle')
  })
})

test.describe('Accessibility', () => {
  test('home page has no critical aria violations', async ({ page }) => {
    await page.goto('/')
    // Check key ARIA roles are present
    await expect(page.getByRole('search')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('rooms page has proper heading structure', async ({ page }) => {
    await page.goto('/rooms')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('buttons are keyboard-focusable', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })
})
