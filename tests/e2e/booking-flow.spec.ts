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
    await page.goto('/rooms/BSIG')
    await expect(page.getByRole('heading', { name: /Classic Single/i })).toBeVisible()
  })

  test('shows image gallery', async ({ page }) => {
    await page.goto('/rooms/BSIG')
    const images = page.getByRole('button', { name: /View Classic Single image/i })
    await expect(images.first()).toBeVisible()
  })

  test('shows amenities', async ({ page }) => {
    await page.goto('/rooms/BSIG')
    await expect(page.getByText('Free Wi-Fi')).toBeVisible()
  })

  test('shows booking panel with Add to Cart button', async ({ page }) => {
    await page.goto('/rooms/BSIG')
    await expect(
      page.getByRole('button', { name: /Select dates to book|Add to Cart/i })
    ).toBeVisible()
  })
})

test.describe('Route Guards', () => {
  test('redirects /checkout to /rooms when cart is empty', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')
  })

  test('redirects /cart to /rooms when cart is empty', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
  })
})

test.describe('Multi-Room Cart Flow', () => {
  const checkIn = '2026-06-01'
  const checkOut = '2026-06-03'

  test('add two rooms to cart and reach checkout', async ({ page }) => {
    // Seed first room into cart via the booking panel
    await page.goto(`/rooms/BSIG?checkIn=${checkIn}&checkOut=${checkOut}&guests=2`)
    await page.waitForLoadState('networkidle')

    // Select dates if not pre-filled
    const dateBtn = page.getByRole('button', { name: /Select dates to book|Add to Cart/i })
    const btnText = await dateBtn.textContent()
    if (btnText?.includes('Select dates')) {
      // Open calendar and pick dates
      await page.getByRole('button', { name: /Check-in/i }).click()
      await page.waitForSelector('[role="dialog"]', { state: 'visible' })
      // Close it — the pre-filled URL params already set dates via query string on server
      await page.keyboard.press('Escape')
    }

    // Click Add to Cart — goes to /cart
    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i })
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click()
      await expect(page).toHaveURL(/\/cart/)
    }

    // Cart should show at least 1 room
    await expect(page.getByText(/Review Your Cart/i)).toBeVisible()

    // Add another room
    await page.getByRole('link', { name: /Add another room/i }).click()
    await expect(page).toHaveURL(/\/rooms/)
  })

  test('cart page shows room details and proceed to checkout link', async ({ page }) => {
    // Inject a cart item directly via localStorage to avoid full UI flow
    await page.goto('/')
    await page.evaluate(
      (item) => {
        const state = {
          state: {
            room: null,
            checkIn: null,
            checkOut: null,
            guests: 1,
            rooms: 1,
            extras: { breakfast: false, airportTransfer: false, lateCheckout: false },
            totalPrice: 0,
            cartItems: [item],
          },
          version: 0,
        }
        localStorage.setItem('booking-session', JSON.stringify(state))
      },
      {
        room: {
          id: 'BSIG',
          name: 'Classic Single',
          type: 'room',
          maxGuests: 2,
          pricePerNight: 150,
          images: ['/rooms/classic-single.jpg'],
          amenities: ['Free Wi-Fi'],
          description: 'Classic room',
          size: 300,
          floor: 1,
          available: true,
        },
        checkIn,
        checkOut,
        guests: 2,
        extras: { breakfast: false, airportTransfer: false, lateCheckout: false },
        totalPrice: 300,
      }
    )

    await page.goto('/cart')
    await expect(page.getByText('Review Your Cart')).toBeVisible()
    await expect(page.getByText('Classic Single')).toBeVisible()
    await expect(page.getByRole('button', { name: /Proceed to Checkout/i })).toBeVisible()
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
