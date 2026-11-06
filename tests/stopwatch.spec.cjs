const { chromium } = require('playwright-core');
const assert = require('assert');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

const SCREENSHOT_DIR = '/Users/arun/.gemini/antigravity/brain/8107b94a-edc2-425b-a164-249ee7a2484d';

(async () => {
  console.log('=== STARTING STOPWATCH, TIMER, ALARM & CLOCK E2E TESTS ===');

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 950 },
  });

  const page = await context.newPage();

  // Route root-relative assets to the /stopwatch/ prefix mounted in Pagehub (for page and service worker)
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith('http://localhost:8800/') && !url.startsWith('http://localhost:8800/stopwatch/')) {
      const redirected = url.replace('http://localhost:8800/', 'http://localhost:8800/stopwatch/');
      try {
        const response = await context.request.fetch(redirected);
        return await route.fulfill({ response });
      } catch {
        return route.continue();
      }
    }
    route.continue();
  });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Console error observed:', msg.text());
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('Page error observed:', err.message);
    consoleErrors.push(err.message);
  });

  // --------------------------------------------------------------------------
  // TEST 1: Clean Dedicated Routes & Distraction-Free Header (No #site-header)
  // --------------------------------------------------------------------------
  console.log('\n[1/9] Navigating to http://localhost:8800/stopwatch/stopwatch/ ...');
  await page.goto('http://localhost:8800/stopwatch/stopwatch/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const title = await page.title();
  console.log('   Page Title:', title);
  assert(title.includes('Clock'), `Expected title to contain "Clock", got "${title}"`);
  assert(title.includes('TinyKite'), `Expected title to contain "TinyKite", got "${title}"`);

  // Verify website chrome (#site-header) is completely absent
  const siteHeader = await page.$('#site-header');
  assert.strictEqual(siteHeader, null, 'Expected website chrome #site-header to NOT exist on standalone app page');
  console.log('   ✓ Verified website #site-header does NOT exist on the page!');

  assert.strictEqual(consoleErrors.length, 0, `Expected 0 console errors, got ${consoleErrors.length}: ${consoleErrors.join(', ')}`);

  const headerClock = await page.$('#header-live-clock');
  assert(headerClock, 'Expected #header-live-clock to exist');

  const formatToggle = await page.$('#btn-format-toggle');
  assert(formatToggle, 'Expected #btn-format-toggle to exist');

  const fullscreenToggle = await page.$('#btn-fullscreen-toggle');
  assert(fullscreenToggle, 'Expected #btn-fullscreen-toggle to exist');

  const soundToggle = await page.$('#btn-sound-toggle');
  assert(soundToggle, 'Expected #btn-sound-toggle to exist');

  const themeToggle = await page.$('#btn-chrono-theme-toggle');
  assert(themeToggle, 'Expected #btn-chrono-theme-toggle to exist');

  // Capture clean_stopwatch screenshot
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'clean_stopwatch.png') });
  console.log('   ✓ Saved clean_stopwatch.png');

  // --------------------------------------------------------------------------
  // TEST 2: Tab Switching Updates the URL Cleanly
  // --------------------------------------------------------------------------
  console.log('\n[2/9] Testing Tab Navigation & URL Updates...');

  // Click Timer Tab
  console.log('   Clicking #tab-btn-timer...');
  await page.click('#tab-btn-timer');
  await page.waitForTimeout(200);
  assert(page.url().includes('/timer/'), `Expected URL to include /timer/, got: ${page.url()}`);
  const timerVisible = await page.$eval('#panel-timer', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(timerVisible, true, 'Expected #panel-timer to be visible');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'clean_timer.png') });
  console.log('   ✓ Switched to Timer, URL updated to /timer/, saved clean_timer.png');

  // Click Alarm Tab
  console.log('   Clicking #tab-btn-alarm...');
  await page.click('#tab-btn-alarm');
  await page.waitForTimeout(200);
  assert(page.url().includes('/alarm/'), `Expected URL to include /alarm/, got: ${page.url()}`);
  const alarmVisible = await page.$eval('#panel-alarm', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(alarmVisible, true, 'Expected #panel-alarm to be visible');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'clean_alarm.png') });
  console.log('   ✓ Switched to Alarm, URL updated to /alarm/, saved clean_alarm.png');

  // Click World Clock Tab
  console.log('   Clicking #tab-btn-worldclock...');
  await page.click('#tab-btn-worldclock');
  await page.waitForTimeout(200);
  assert(page.url().includes('/clock/'), `Expected URL to include /clock/, got: ${page.url()}`);
  const clockVisible = await page.$eval('#panel-worldclock', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(clockVisible, true, 'Expected #panel-worldclock to be visible');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'clean_clock.png') });
  console.log('   ✓ Switched to Clock, URL updated to /clock/, saved clean_clock.png');

  // Click Stopwatch Tab
  console.log('   Clicking #tab-btn-stopwatch...');
  await page.click('#tab-btn-stopwatch');
  await page.waitForTimeout(200);
  assert(page.url().includes('/stopwatch/'), `Expected URL to include /stopwatch/, got: ${page.url()}`);
  const swVisible = await page.$eval('#panel-stopwatch', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(swVisible, true, 'Expected #panel-stopwatch to be visible');
  console.log('   ✓ Switched back to Stopwatch, URL updated to /stopwatch/!');

  // --------------------------------------------------------------------------
  // TEST 3: Stopwatch Core Functions (Start, Sweep, Laps, Stats, Save Session)
  // --------------------------------------------------------------------------
  console.log('\n[3/9] Testing Stopwatch Tab Functionality (#panel-stopwatch)...');

  // Verify SVG analog hands and digital readout exist
  const secondHand = await page.$('#analog-second-hand');
  const minuteHand = await page.$('#analog-minute-hand');
  const lapHand = await page.$('#analog-lap-hand');
  const digitalMain = await page.$('#sw-digital-main');
  const digitalFraction = await page.$('#sw-digital-fraction');

  assert(secondHand, 'Expected #analog-second-hand to exist');
  assert(minuteHand, 'Expected #analog-minute-hand to exist');
  assert(lapHand, 'Expected #analog-lap-hand to exist');
  assert(digitalMain, 'Expected #sw-digital-main to exist');
  assert(digitalFraction, 'Expected #sw-digital-fraction to exist');

  const initialHandTransform = await page.$eval('#analog-second-hand', (el) => el.getAttribute('transform'));
  console.log('   Initial second hand transform:', initialHandTransform);

  // Start stopwatch
  console.log('   Starting stopwatch via #btn-sw-start...');
  await page.click('#btn-sw-start');
  await page.waitForTimeout(250);

  const runningBadge = await page.$eval('#sw-status-badge', (el) => el.textContent.trim());
  assert.strictEqual(runningBadge, 'RUNNING', `Expected status badge to be RUNNING, got "${runningBadge}"`);

  const runningHandTransform = await page.$eval('#analog-second-hand', (el) => el.getAttribute('transform'));
  console.log('   Running second hand transform:', runningHandTransform);
  assert.notStrictEqual(
    runningHandTransform,
    'rotate(0 160 160)',
    'Second hand should have rotated away from initial position'
  );

  // Click lap 3 times with delays
  console.log('   Recording 3 laps...');
  await page.waitForTimeout(120);
  await page.click('#btn-sw-lap');

  await page.waitForTimeout(220);
  await page.click('#btn-sw-lap');

  await page.waitForTimeout(160);
  await page.click('#btn-sw-lap');

  // Pause stopwatch
  console.log('   Pausing stopwatch...');
  await page.click('#btn-sw-start');
  await page.waitForTimeout(100);

  const pausedBadge = await page.$eval('#sw-status-badge', (el) => el.textContent.trim());
  assert.strictEqual(pausedBadge, 'PAUSED', `Expected status badge to be PAUSED, got "${pausedBadge}"`);

  // Verify laps table has 3 rows
  const lapRowsCount = await page.$$eval('#sw-laps-tbody tr', (rows) => rows.length);
  console.log('   Recorded lap rows in table:', lapRowsCount);
  assert.strictEqual(lapRowsCount, 3, `Expected exactly 3 lap rows, found ${lapRowsCount}`);

  // Verify Fastest and Slowest badges exist in table
  const tableHtml = await page.$eval('#sw-laps-tbody', (el) => el.innerHTML);
  assert(tableHtml.includes('Fastest'), 'Expected "Fastest" badge in laps table');
  assert(tableHtml.includes('Slowest'), 'Expected "Slowest" badge in laps table');

  // Verify statistics HUD is populated
  const bestLap = await page.$eval('#stat-best-lap', (el) => el.textContent.trim());
  const worstLap = await page.$eval('#stat-worst-lap', (el) => el.textContent.trim());
  const avgLap = await page.$eval('#stat-avg-lap', (el) => el.textContent.trim());
  const consistency = await page.$eval('#stat-consistency', (el) => el.textContent.trim());

  console.log(`   HUD Stats -> Best: ${bestLap}, Worst: ${worstLap}, Avg: ${avgLap}, Consistency: ${consistency}`);
  assert(!bestLap.includes('--'), `Expected valid #stat-best-lap, got "${bestLap}"`);
  assert(!worstLap.includes('--'), `Expected valid #stat-worst-lap, got "${worstLap}"`);
  assert(!avgLap.includes('--'), `Expected valid #stat-avg-lap, got "${avgLap}"`);
  assert(!consistency.includes('--'), `Expected valid #stat-consistency, got "${consistency}"`);

  // Save session: open saved sessions details, fill "Cube Sprint", click save
  console.log('   Saving session as "Cube Sprint"...');
  const detailsSummary = await page.$('#sw-saved-sessions-panel summary');
  if (detailsSummary) await detailsSummary.click();
  await page.waitForTimeout(100);
  await page.fill('#input-session-title', 'Cube Sprint');
  await page.click('#btn-save-session');
  await page.waitForTimeout(150);

  const sessionsText = await page.$eval('#sw-sessions-list', (el) => el.innerText);
  assert(sessionsText.includes('Cube Sprint'), `Expected "Cube Sprint" in sessions list, got: ${sessionsText}`);
  console.log('   ✓ Session saved and rendered in #sw-sessions-list.');

  // --------------------------------------------------------------------------
  // TEST 4: Exact 881x1024 Desktop Viewport Side-by-Side Layout & Install PWA
  // --------------------------------------------------------------------------
  console.log('\n[4/9] Verifying 881x1024 Desktop Viewport Side-by-Side Layout & Install PWA Button...');
  await page.setViewportSize({ width: 881, height: 1024 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // 1. Verify #btn-install-pwa is visible in header
  const pwaInstallBtn = await page.$('#btn-install-pwa');
  assert(pwaInstallBtn, 'Expected #btn-install-pwa to exist');
  const installBtnVisible = await page.$eval('#btn-install-pwa', (el) => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0;
  });
  assert.strictEqual(installBtnVisible, true, 'Expected #btn-install-pwa to be visible in header at 881x1024');
  console.log('   ✓ #btn-install-pwa is visible in header at 881x1024');

  // 2. Verify Analog Chrono and Digital Stopwatch + Start buttons are side-by-side above fold
  const analogBox = await page.$eval('#analog-second-hand', (el) => {
    const rect = el.closest('svg').getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, height: rect.height };
  });
  const digitalBox = await page.$eval('#sw-digital-main', (el) => {
    const rect = el.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, height: rect.height };
  });
  const startBtnBox = await page.$eval('#btn-sw-start', (el) => {
    const rect = el.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
  });

  console.log('   Analog SVG Bounding Box:', analogBox);
  console.log('   Digital Readout Bounding Box:', digitalBox);
  console.log('   Start Button Bounding Box:', startBtnBox);

  // Side-by-side verification: analog dial should be horizontally to the left of digital readout
  assert(analogBox.left < digitalBox.left, `Analog dial (left: ${analogBox.left}) should be horizontally to the left of digital readout (left: ${digitalBox.left})`);
  const verticalOverlap = Math.abs(analogBox.top - digitalBox.top);
  assert(verticalOverlap < 100, `Analog and Digital controls should be aligned side-by-side horizontally (top difference was ${verticalOverlap}px)`);

  // Above the fold verification (viewport height = 1024)
  assert(startBtnBox.bottom < 1024, `Start/Lap/Reset buttons (bottom: ${startBtnBox.bottom}) must be visible above the fold (< 1024px)`);
  assert(analogBox.bottom < 1024, `Analog dial (bottom: ${analogBox.bottom}) must be visible above the fold (< 1024px)`);
  console.log('   ✓ Side-by-side layout and above-the-fold controls verified at 881x1024!');

  // Test opening install guide modal fallback
  console.log('   Testing #btn-install-pwa modal fallback...');
  await page.click('#btn-install-pwa');
  await page.waitForTimeout(200);
  const modalVisible = await page.$eval('#pwa-install-modal', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(modalVisible, true, 'Expected #pwa-install-modal to open on install button click');

  // Verify modal close
  await page.click('#btn-close-install-modal');
  await page.waitForTimeout(200);
  const modalHiddenAfterClose = await page.$eval('#pwa-install-modal', (el) => el.classList.contains('hidden'));
  assert.strictEqual(modalHiddenAfterClose, true, 'Expected #pwa-install-modal to close on close button click');
  console.log('   ✓ PWA Install Guide modal verified cleanly!');

  // Restore desktop widescreen viewport for subsequent tests
  await page.setViewportSize({ width: 1280, height: 950 });
  await page.waitForTimeout(200);

  // Reset stopwatch
  console.log('   Resetting stopwatch...');
  await page.click('#btn-sw-reset');
  await page.waitForTimeout(100);

  const resetBadge = await page.$eval('#sw-status-badge', (el) => el.textContent.trim());
  const resetDigital = await page.$eval('#sw-digital-main', (el) => el.textContent.trim());
  assert.strictEqual(resetBadge, 'READY', `Expected status READY after reset, got "${resetBadge}"`);
  assert.strictEqual(resetDigital, '00:00', `Expected digital readout 00:00 after reset, got "${resetDigital}"`);
  console.log('   ✓ Stopwatch reset successfully to READY.');

  // --------------------------------------------------------------------------
  // TEST 5: Timer Tab (#panel-timer)
  // --------------------------------------------------------------------------
  console.log('\n[5/9] Testing Timer Tab (#panel-timer)...');
  await page.click('#tab-btn-timer');
  await page.waitForTimeout(200);

  // Set custom 1-second timer
  console.log('   Setting custom 1-second hero timer ("Quick Test")...');
  await page.fill('#timer-input-hours', '0');
  await page.fill('#timer-input-minutes', '0');
  await page.fill('#timer-input-seconds', '1');
  await page.fill('#timer-input-label', 'Quick Test');
  await page.click('#btn-set-hero-timer');
  await page.waitForTimeout(100);

  const heroLabel = await page.$eval('#timer-hero-label', (el) => el.textContent.trim());
  console.log('   Hero timer set to:', heroLabel);
  assert.strictEqual(heroLabel, 'Quick Test');

  // Start timer and wait 1400ms for completion
  console.log('   Starting timer and waiting 1400ms for completion chime...');
  await page.click('#btn-timer-start');
  await page.waitForTimeout(1400);

  const bannerVisible = await page.$eval(
    '#timer-completed-banner',
    (el) => !el.classList.contains('hidden')
  );
  assert.strictEqual(bannerVisible, true, 'Expected #timer-completed-banner to be visible after 1s timer ends');
  console.log('   ✓ Completion banner displayed!');

  // Dismiss banner
  await page.click('#btn-timer-dismiss');
  await page.waitForTimeout(100);
  const bannerHidden = await page.$eval(
    '#timer-completed-banner',
    (el) => el.classList.contains('hidden')
  );
  assert.strictEqual(bannerHidden, true, 'Expected banner to be hidden after dismiss');

  // Add multi-timer
  console.log('   Adding parallel multi-timer...');
  await page.click('#btn-add-multi-timer');
  await page.waitForTimeout(150);

  const multiTimersCount = await page.$$eval('#multi-timers-list > *', (els) => els.length);
  console.log('   Parallel multi-timers count:', multiTimersCount);
  assert(multiTimersCount >= 1, 'Expected at least 1 parallel timer card in #multi-timers-list');

  // --------------------------------------------------------------------------
  // TEST 6: Alarm Tab (#panel-alarm)
  // --------------------------------------------------------------------------
  console.log('\n[6/9] Testing Alarm Tab (#panel-alarm)...');
  await page.click('#tab-btn-alarm');
  await page.waitForTimeout(200);

  // Create an alarm: 8:15 "Piano Practice"
  console.log('   Creating alarm: 8:15 "Piano Practice"...');
  await page.fill('#alarm-input-hour', '8');
  await page.fill('#alarm-input-minute', '15');
  await page.fill('#alarm-input-label', 'Piano Practice');
  await page.click('#btn-create-alarm');
  await page.waitForTimeout(200);

  const alarmsListText = await page.$eval('#alarms-list-container', (el) => el.innerText);
  assert(alarmsListText.includes('Piano Practice'), `Expected "Piano Practice" in alarms list, got: ${alarmsListText}`);

  const bannerText = await page.$eval('#alarm-next-banner', (el) => el.innerText);
  console.log('   Next alarm banner text:', bannerText);
  assert(bannerText.includes('in '), `Expected countdown "in " in #alarm-next-banner, got: ${bannerText}`);

  const activeBadgeVisible = await page.$eval(
    '#alarm-active-badge',
    (el) => !el.classList.contains('hidden')
  );
  assert.strictEqual(activeBadgeVisible, true, 'Expected #alarm-active-badge to be visible');
  console.log('   ✓ Alarm created and active banner/badge verified!');

  // --------------------------------------------------------------------------
  // TEST 7: World Clock Tab & City Pinning (#panel-worldclock)
  // --------------------------------------------------------------------------
  console.log('\n[7/9] Testing World Clock Tab (#panel-worldclock)...');
  await page.click('#tab-btn-worldclock');
  await page.waitForTimeout(200);

  // Verify 6 default pinned city cards
  const initialCardsCount = await page.$$eval('#world-clock-grid > *', (els) => els.length);
  console.log('   Initial pinned city cards count:', initialCardsCount);
  assert.strictEqual(initialCardsCount, 6, `Expected 6 default pinned cities, got ${initialCardsCount}`);

  // Pin "paris"
  console.log('   Adding "paris" to pinned cities...');
  await page.selectOption('#select-add-city', 'paris');
  await page.click('#btn-add-city');
  await page.waitForTimeout(200);

  const updatedCardsCount = await page.$$eval('#world-clock-grid > *', (els) => els.length);
  console.log('   Updated pinned city cards count:', updatedCardsCount);
  assert.strictEqual(updatedCardsCount, 7, `Expected 7 pinned cities after adding Paris, got ${updatedCardsCount}`);

  // Keyboard shortcut "1"
  await page.keyboard.press('Digit1');
  await page.waitForTimeout(200);
  const swVisibleAfterKey = await page.$eval('#panel-stopwatch', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(swVisibleAfterKey, true, 'Expected #panel-stopwatch to be active after pressing "1" key');
  console.log('   ✓ Keyboard shortcut "1" switched back to Stopwatch!');

  // --------------------------------------------------------------------------
  // TEST 8: Direct Navigation to All 4 Dedicated Routes (/stopwatch, /timer, /alarm, /clock)
  // --------------------------------------------------------------------------
  console.log('\n[8/9] Testing Direct Navigation to All 4 Dedicated URLs...');

  const routesToTest = [
    { url: 'http://localhost:8800/stopwatch/stopwatch/', expectedPanel: '#panel-stopwatch', name: 'Stopwatch' },
    { url: 'http://localhost:8800/stopwatch/timer/', expectedPanel: '#panel-timer', name: 'Timer' },
    { url: 'http://localhost:8800/stopwatch/alarm/', expectedPanel: '#panel-alarm', name: 'Alarm' },
    { url: 'http://localhost:8800/stopwatch/clock/', expectedPanel: '#panel-worldclock', name: 'Clock' },
  ];

  for (const r of routesToTest) {
    console.log(`   Navigating directly to ${r.url} (${r.name})...`);
    await page.goto(r.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);

    const isPanelVisible = await page.$eval(r.expectedPanel, (el) => !el.classList.contains('hidden'));
    assert.strictEqual(isPanelVisible, true, `Expected ${r.expectedPanel} to be visible when directly loading ${r.url}`);

    const hasNoHeader = (await page.$('#site-header')) === null;
    assert.strictEqual(hasNoHeader, true, `Expected #site-header to NOT exist on ${r.url}`);
    console.log(`   ✓ ${r.name} direct URL verified cleanly without website chrome!`);
  }

  // --------------------------------------------------------------------------
  // TEST 9: True Offline Mode & Desktop PWA Manifest CDP Verification
  // --------------------------------------------------------------------------
  console.log('\n[9/9] Testing True Offline Mode & Desktop PWA Manifest CDP Verification...');
  // Navigate back to primary stopwatch route and await service worker ready
  await page.goto('http://localhost:8800/stopwatch/stopwatch/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }
  });
  await page.waitForTimeout(600);

  // Switch context to offline mode
  console.log('   Switching browser context to offline mode (context.setOffline(true))...');
  await context.setOffline(true);
  await page.waitForTimeout(250);

  // Verify #offline-status-text updates to "Offline Mode"
  const offlineStatusPreReload = await page.$eval('#offline-status-text', (el) => el.textContent.trim());
  console.log('   Offline status text before reload:', offlineStatusPreReload);
  assert.strictEqual(
    offlineStatusPreReload,
    'Offline Mode',
    `Expected #offline-status-text to be "Offline Mode", got "${offlineStatusPreReload}"`
  );

  // Perform a full page reload while offline
  console.log('   Reloading page while 100% offline (SW cached shell)...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  const isStillOffline = await page.evaluate(() => navigator.onLine === false);
  assert.strictEqual(isStillOffline, true, 'Navigator should report navigator.onLine === false');

  const reloadedStatus = await page.$eval('#offline-status-text', (el) => el.textContent.trim());
  console.log('   Offline status text after reload:', reloadedStatus);
  assert.strictEqual(
    reloadedStatus,
    'Offline Mode',
    `Expected #offline-status-text to be "Offline Mode", got "${reloadedStatus}"`
  );

  const digitalMainAfterReload = await page.$eval('#sw-digital-main', (el) => el.textContent.trim());
  console.log('   Digital readout after offline reload:', digitalMainAfterReload);
  assert.strictEqual(
    digitalMainAfterReload,
    '00:00',
    `Expected #sw-digital-main to be "00:00", got "${digitalMainAfterReload}"`
  );

  // Verify starting stopwatch works offline
  await page.click('#btn-sw-start');
  await page.waitForTimeout(250);
  const runningBadgeOffline = await page.$eval('#sw-status-badge', (el) => el.textContent.trim());
  assert.strictEqual(runningBadgeOffline, 'RUNNING');

  // Restore context to online
  await context.setOffline(false);
  await page.waitForTimeout(200);

  // PWA Manifest & Installability CDP Verification via preview server on port 4399
  const isServerRunning = (url) =>
    new Promise((resolve) => {
      const req = http.get(url, (res) => resolve(res.statusCode < 500));
      req.on('error', () => resolve(false));
    });

  let spawnedPreview = null;
  const serverUp = await isServerRunning('http://localhost:4399/stopwatch/');
  if (!serverUp) {
    console.log('   Spawning local preview server on port 4399...');
    spawnedPreview = spawn('npx', ['astro', 'preview', '--port', '4399'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'ignore',
      detached: false,
    });
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 250));
      if (await isServerRunning('http://localhost:4399/stopwatch/')) break;
    }
  }

  const pwaTmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-pwa-e2e-'));
  const pwaContext = await chromium.launchPersistentContext(pwaTmpDir, {
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  try {
    const pwaPage = pwaContext.pages()[0] || (await pwaContext.newPage());
    console.log('   Navigating to http://localhost:4399/stopwatch/ ...');
    await pwaPage.goto('http://localhost:4399/stopwatch/', { waitUntil: 'networkidle' });
    await pwaPage.waitForTimeout(1000);

    const client = await pwaPage.context().newCDPSession(pwaPage);
    const manifestRes = await client.send('Page.getAppManifest');
    const installability = await client.send('Page.getInstallabilityErrors');

    console.log('   Manifest URL:', manifestRes.url);
    console.log('   Manifest errors:', manifestRes.errors);
    console.log('   Installability errors:', installability.installabilityErrors);

    assert.strictEqual(manifestRes.errors.length, 0, 'Manifest must have 0 parse errors');
    assert.strictEqual(installability.installabilityErrors.length, 0, 'Chromium must report 0 PWA installability errors');
    const parsedData = manifestRes.data ? JSON.parse(manifestRes.data) : null;
    if (parsedData) {
      console.log('   Manifest name:', parsedData.name);
      assert.strictEqual(parsedData.name, 'Clock by TinyKite', 'Manifest name must be "Clock by TinyKite"');
      assert.strictEqual(parsedData.scope, '/', 'Manifest scope must be "/" for cross-tab standalone PWA navigation');
    }
    console.log('   ✓ Verified 0 manifest errors and 0 installability errors on /stopwatch/!');

    // Verify /clock/ route
    console.log('   Navigating to http://localhost:4399/clock/ ...');
    await pwaPage.goto('http://localhost:4399/clock/', { waitUntil: 'networkidle' });
    await pwaPage.waitForTimeout(1000);

    const clockManifestRes = await client.send('Page.getAppManifest');
    const clockInstallability = await client.send('Page.getInstallabilityErrors');
    assert.strictEqual(clockManifestRes.errors.length, 0);
    assert.strictEqual(clockInstallability.installabilityErrors.length, 0);
    console.log('   ✓ Verified 0 manifest errors and 0 installability errors on /clock/!');

    // Verify In-App Install Button unhidden on beforeinstallprompt
    const installBtn = await pwaPage.$('#btn-install-pwa');
    assert(installBtn, 'Expected #btn-install-pwa to exist');
    const isHidden = await pwaPage.$eval('#btn-install-pwa', (el) => el.classList.contains('hidden'));
    assert.strictEqual(isHidden, false, 'Expected #btn-install-pwa to be unhidden after beforeinstallprompt');
    console.log('   ✓ Verified #btn-install-pwa is visible and ready for desktop install!');
  } finally {
    await pwaContext.close();
    fs.rmSync(pwaTmpDir, { recursive: true, force: true });
    if (spawnedPreview) {
      spawnedPreview.kill('SIGTERM');
    }
  }

  console.log('\n=== ALL E2E PLAYWRIGHT TESTS PASSED (100%) ===\n');
  await browser.close();
  process.exit(0);
})().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
