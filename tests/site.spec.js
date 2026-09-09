import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

test('all target widths retain readable content, valid assets, and usable primary action', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 375, 390, 412, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const box = await page.locator('header h1').boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width <= 640) await expect(page.locator('.mobile-consult')).toBeInViewport();
    const badImages = await page.locator('img').evaluateAll(images => images.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src));
    expect(badImages).toEqual([]);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Email (required)')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('keyboard mobile menu closes on Escape, navigates, and does not leave hidden links focusable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('#ham')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mob-menu a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#ham')).toBeFocused();
  await expect(page.locator('#mob-menu')).toHaveAttribute('inert', '');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.locator('#mob-menu').getByRole('link', { name: 'FAQ', exact: true }).click();
  await expect(page).toHaveURL(/#faq$/);
  await expect(page.locator('#ham')).toHaveAttribute('aria-expanded', 'false');
  await page.getByText('How much does it cost?', { exact: true }).click();
  await expect(page.locator('.faq-item').first()).toHaveAttribute('open', '');
  await expect(page.locator('.faq-item').first().locator('.faq-a')).toBeVisible();
});

test('project requests preserve typed details and identify the requested project', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your name').fill('Existing visitor');
  await page.getByRole('link', { name: 'Ask about SandPro OMP' }).click();
  await expect(page.locator('#f-project')).toHaveValue('SandPro OMP');
  await expect(page.getByLabel('Your name')).toHaveValue('Existing visitor');
  await expect(page.locator('#project-context')).toContainText('SandPro OMP');
  await expect(page.locator('#f-int')).toHaveValue('Project demo');
  await page.goto('/?project=Thrawn#contact');
  await expect(page.locator('#f-project')).toHaveValue('Thrawn');
  await page.goto('/?project=%3Cscript%3E#contact');
  await expect(page.locator('#project-context')).toBeHidden();
});

test('submission success requires provider acceptance; errors retain fields and allow retry', async ({ page }) => {
  let requests = 0;
  await page.route('https://formsubmit.co/ajax/**', async route => { requests++; await route.fulfill({ status: 503, contentType: 'application/json', body: '{"success":false}' }); });
  await page.goto('/?sent=1#contact');
  await expect(page.locator('#form-status')).toBeEmpty();
  await page.getByLabel('Your name').fill('Website test');
  await page.getByLabel('Email (required)').fill('test@example.com');
  await page.getByRole('button', { name: 'Send request' }).click();
  await expect(page.locator('#form-status')).toHaveAttribute('data-state', 'error');
  await expect(page.getByLabel('Your name')).toHaveValue('Website test');
  await expect(page.getByRole('button', { name: 'Send request' })).toBeEnabled();
  await page.unroute('https://formsubmit.co/ajax/**');
  await page.route('https://formsubmit.co/ajax/**', async route => { requests++; await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"false"}' }); });
  await page.getByRole('button', { name: 'Send request' }).click();
  await expect(page.locator('#form-status')).toHaveAttribute('data-state', 'error');
  await page.unroute('https://formsubmit.co/ajax/**');
  await page.route('https://formsubmit.co/ajax/**', async route => { requests++; await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' }); });
  await page.getByRole('button', { name: 'Send request' }).click();
  await expect(page.locator('#form-status')).toHaveAttribute('data-state', 'success');
  await expect(page.getByLabel('Your name')).toHaveValue('');
  expect(requests).toBe(3);
});

test('pending requests cannot duplicate; aborted requests recover', async ({ page }) => {
  let requests = 0;
  await page.route('https://formsubmit.co/ajax/**', async route => { requests++; await new Promise(r => setTimeout(r, 500)); await route.abort('failed'); });
  await page.goto('/#contact');
  await page.getByLabel('Your name').fill('Website test');
  await page.getByLabel('Email (required)').fill('test@example.com');
  await page.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByRole('button', { name: 'Sending…', exact: true })).toBeDisabled();
  await expect(page.locator('#form-status')).toHaveAttribute('data-state', 'error');
  expect(requests).toBe(1);
});

test('reduced motion leaves every portfolio card reachable; no duplicate cards', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await expect(page.locator('.mq-card')).toHaveCount(5);
  await expect(page.locator('#mq-play')).toBeHidden();
  await page.locator('#mq').scrollIntoViewIfNeeded();
  await page.locator('#mq').focus();
  for (let n = 0; n < 5; n++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.mq-card').last()).toBeInViewport();
});

test('no-JavaScript content, FAQ, native form, and privacy remain available', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:8934');
  await expect(page.locator('#services')).toBeVisible();
  await page.getByText('How much does it cost?', { exact: true }).click();
  await expect(page.locator('.faq-item').first().locator('.faq-a')).toBeVisible();
  await expect(page.locator('form')).toHaveAttribute('action', 'https://formsubmit.co/andrew@ndai.pro');
  await page.locator('footer').getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  await context.close();
});

test('homepage and privacy pass accessibility scan in desktop and mobile states', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.getByText('How much does it cost?', { exact: true }).click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','best-practice']).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
  for (const path of ['/privacy','/consulting']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','best-practice']).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
});

test('renders review artifacts and checks real routes', async ({ page, request }) => {
  await mkdir('artifacts', { recursive: true });
  for (const [name, width, height] of [['desktop',1440,1000], ['mobile',390,844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/'); await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `artifacts/${name}-hero.png` });
    await page.screenshot({ path: `artifacts/${name}-full.png`, fullPage: true });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/${name}-contact.png` });
  }
  expect((await request.get('/privacy')).status()).toBe(200);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect((await request.get('/a-page-that-does-not-exist')).status()).toBe(404);
});
