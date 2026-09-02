import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const results = [];

async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log('PASS', name);
  } catch (e) {
    results.push({ name, ok: false, error: String(e.message || e) });
    console.log('FAIL', name, e.message || e);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (err) => console.log('PAGEERROR', err.message));

await step('landing', async () => {
  await page.goto(base + '/');
  await page.waitForSelector('text=ApplyPilot');
  const h1 = await page.locator('h1').first().innerText();
  if (!h1.includes('ApplyPilot')) throw new Error('Brand not hero: ' + h1);
});

await step('login', async () => {
  await page.goto(base + '/login');
  await page.fill('input[type=email]', 'demo@applypilot.com');
  await page.fill('input[type=password]', 'demo1234');
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/app');
});

await step('dashboard', async () => {
  await page.waitForSelector('text=Welcome back');
});

await step('resume save', async () => {
  await page.goto(base + '/app/resume');
  await page.waitForSelector('text=Resume Builder');
  await page.waitForTimeout(1000);
  const inputs = page.locator('input');
  await inputs.nth(1).fill('Senior Full-Stack Engineer (E2E)');
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(800);
});

await step('scanner', async () => {
  await page.goto(base + '/app/scanner');
  await page.waitForSelector('text=ATS');
  await page.click('button:has-text("Scan")');
  await page.waitForTimeout(1500);
  const body = await page.innerText('body');
  if (!/\d+/.test(body)) throw new Error('No score visible');
});

await step('jobs + apply', async () => {
  await page.goto(base + '/app/jobs');
  await page.waitForSelector('text=Job');
  await page.waitForTimeout(1000);
  const link = page.locator('a[href^="/app/jobs/"]').first();
  await link.click();
  await page.waitForURL('**/app/jobs/**');
  await page.waitForTimeout(800);
  const applyBtn = page.getByRole('button', { name: /Apply/i }).first();
  if (await applyBtn.count()) {
    await applyBtn.click();
    await page.waitForTimeout(1000);
  }
});

await step('auto-apply', async () => {
  await page.goto(base + '/app/auto-apply');
  await page.waitForSelector('text=Auto-Apply');
  await page.waitForTimeout(800);
  const run = page.getByRole('button', { name: /Run/i }).first();
  if (await run.count()) {
    await run.click();
    await page.waitForTimeout(2000);
  }
});

await step('tracker', async () => {
  await page.goto(base + '/app/tracker');
  await page.waitForSelector('text=Tracker');
  await page.waitForTimeout(1000);
  const select = page.locator('select').first();
  if (await select.count()) {
    await select.selectOption('interview');
    await page.waitForTimeout(500);
  }
});

await step('interview', async () => {
  await page.goto(base + '/app/interview');
  await page.click('button:has-text("Start")');
  await page.waitForTimeout(1000);
  await page.fill('textarea', 'I led a project that cut latency 40%.');
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(1000);
});

await step('buddy', async () => {
  await page.goto(base + '/app/buddy');
  await page.fill('textarea', 'Tell me about a conflict at work');
  await page.click('button:has-text("Suggest")');
  await page.waitForTimeout(1000);
  const body = await page.innerText('body');
  if (!/Suggested|STAR|Situation/i.test(body)) throw new Error('No suggestion');
});

await step('cover letter', async () => {
  await page.goto(base + '/app/cover-letter');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Generate")');
  await page.waitForTimeout(1500);
});

await step('pricing features', async () => {
  await page.goto(base + '/pricing');
  await page.waitForSelector('text=pricing');
  await page.goto(base + '/features');
  await page.waitForSelector('text=Features');
});

await page.setViewportSize({ width: 390, height: 844 });
await step('mobile menu', async () => {
  await page.goto(base + '/app');
  await page.waitForTimeout(800);
  await page.getByLabel('Open menu').click();
  await page.getByRole('link', { name: 'Resume Builder' }).waitFor({ state: 'visible' });
});

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(JSON.stringify({ passed: results.filter(r=>r.ok).length, failed: failed.length, results }, null, 2));
process.exit(failed.length ? 1 : 0);
