const { chromium } = require('playwright-core');
const assert = require('assert');
const path = require('path');

const SCREENSHOT_DIR = '/Users/arun/.gemini/antigravity/brain/8107b94a-edc2-425b-a164-249ee7a2484d';

(async () => {
  console.log('=== STARTING STOPWATCH, TIMER, ALARM & WORLD CLOCK E2E TESTS ===');

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
  // TEST 1: Clean Load & Header Controls
  // --------------------------------------------------------------------------
  console.log('\n[1/8] Navigating to http://localhost:8800/stopwatch/stopwatch/ ...');
  await page.goto('http://localhost:8800/stopwatch/stopwatch/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const title = await page.title();
  console.log('   Page Title:', title);
  assert(title.includes('Stopwatch'), `Expected title to contain "Stopwatch", got "${title}"`);
  assert(title.includes('TinyKite'), `Expected title to contain "TinyKite", got "${title}"`);

  assert.strictEqual(consoleErrors.length, 0, `Expected 0 console errors, got ${consoleErrors.length}: ${consoleErrors.join(', ')}`);

  const headerClock = await page.$('#header-live-clock');
  assert(headerClock, 'Expected #header-live-clock to exist');

  const formatToggle = await page.$('#btn-format-toggle');
  assert(formatToggle, 'Expected #btn-format-toggle to exist');

  const fullscreenToggle = await page.$('#btn-fullscreen-toggle');
  assert(fullscreenToggle, 'Expected #btn-fullscreen-toggle to exist');

  const soundToggle = await page.$('#btn-sound-toggle');
  assert(soundToggle, 'Expected #btn-sound-toggle to exist');

  console.log('   ✓ Header and utility controls verified cleanly.');

  // --------------------------------------------------------------------------
  // TEST 2: Stopwatch Tab (#panel-stopwatch)
  // --------------------------------------------------------------------------
  console.log('\n[2/8] Testing Stopwatch Tab (#panel-stopwatch)...');

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

  // Save session: type "Cube Sprint" into #input-session-title and click #btn-save-session
  console.log('   Saving session as "Cube Sprint"...');
  await page.fill('#input-session-title', 'Cube Sprint');
  await page.click('#btn-save-session');
  await page.waitForTimeout(150);

  const sessionsText = await page.$eval('#sw-sessions-list', (el) => el.innerText);
  assert(sessionsText.includes('Cube Sprint'), `Expected "Cube Sprint" in sessions list, got: ${sessionsText}`);
  console.log('   ✓ Session saved and rendered in #sw-sessions-list.');

  // Take screenshot of Stopwatch View
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stopwatch_view.png') });
  console.log('   ✓ Saved stopwatch screenshot to stopwatch_view.png');

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
  // TEST 3: Timer Tab (#panel-timer)
  // --------------------------------------------------------------------------
  console.log('\n[3/8] Testing Timer Tab (#panel-timer)...');
  await page.click('#tab-btn-timer');
  await page.waitForTimeout(200);

  const timerVisible = await page.$eval('#panel-timer', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(timerVisible, true, 'Expected #panel-timer to be visible');

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

  // Take screenshot of Timer View
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'timer_view.png') });
  console.log('   ✓ Saved timer screenshot to timer_view.png');

  // --------------------------------------------------------------------------
  // TEST 4: Alarm Tab (#panel-alarm)
  // --------------------------------------------------------------------------
  console.log('\n[4/8] Testing Alarm Tab (#panel-alarm)...');
  await page.click('#tab-btn-alarm');
  await page.waitForTimeout(200);

  const alarmVisible = await page.$eval('#panel-alarm', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(alarmVisible, true, 'Expected #panel-alarm to be visible');

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

  // Take screenshot of Alarm View
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'alarm_view.png') });
  console.log('   ✓ Saved alarm screenshot to alarm_view.png');

  // --------------------------------------------------------------------------
  // TEST 5: World Clock Tab (#panel-worldclock)
  // --------------------------------------------------------------------------
  console.log('\n[5/8] Testing World Clock Tab (#panel-worldclock)...');
  await page.click('#tab-btn-worldclock');
  await page.waitForTimeout(200);

  const worldClockVisible = await page.$eval('#panel-worldclock', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(worldClockVisible, true, 'Expected #panel-worldclock to be visible');

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

  // Take screenshot of World Clock View
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'worldclock_view.png') });
  console.log('   ✓ Saved world clock screenshot to worldclock_view.png');

  // --------------------------------------------------------------------------
  // TEST 6: Keyboard Shortcuts & /clock/ Alias Route
  // --------------------------------------------------------------------------
  console.log('\n[6/8] Testing Keyboard Shortcut "1" and /clock/ route...');
  await page.keyboard.press('Digit1');
  await page.waitForTimeout(200);

  const swVisibleAfterKey = await page.$eval('#panel-stopwatch', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(swVisibleAfterKey, true, 'Expected #panel-stopwatch to be active after pressing "1" key');
  console.log('   ✓ Pressing key "1" successfully switched back to Stopwatch tab!');

  // Navigate to /clock/ route
  console.log('   Navigating to mirror alias: http://localhost:8800/stopwatch/clock/ ...');
  await page.goto('http://localhost:8800/stopwatch/clock/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const clockTitle = await page.title();
  assert(clockTitle.includes('Stopwatch') && clockTitle.includes('TinyKite'), 'Clock route must have valid title');
  const clockSwPanel = await page.$eval('#panel-stopwatch', (el) => !el.classList.contains('hidden'));
  assert.strictEqual(clockSwPanel, true, 'Expected #panel-stopwatch to be visible on /clock/ route');
  console.log('   ✓ /clock/ route loaded cleanly!');

  // --------------------------------------------------------------------------
  // TEST 7: True Offline Mode (context.setOffline(true)) & Offline Reload
  // --------------------------------------------------------------------------
  console.log('\n[7/8] Testing True Offline Mode & Offline Reload...');
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

  // Verify the reloaded page renders cleanly while offline
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

  // Verify starting / pausing stopwatch works 100% offline
  console.log('   Starting stopwatch while offline via #btn-sw-start...');
  await page.click('#btn-sw-start');
  await page.waitForTimeout(250);

  const runningBadgeOffline = await page.$eval('#sw-status-badge', (el) => el.textContent.trim());
  console.log('   Stopwatch status while offline:', runningBadgeOffline);
  assert.strictEqual(
    runningBadgeOffline,
    'RUNNING',
    `Expected status RUNNING in offline mode, got "${runningBadgeOffline}"`
  );

  console.log('   Pausing stopwatch while offline...');
  await page.click('#btn-sw-start');
  await page.waitForTimeout(100);

  const pausedBadgeOffline = await page.$eval('#sw-status-badge', (el) => el.textContent.trim());
  assert.strictEqual(
    pausedBadgeOffline,
    'PAUSED',
    `Expected status PAUSED in offline mode, got "${pausedBadgeOffline}"`
  );

  // Take screenshot of Offline Mode
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'offline_mode_view.png') });
  console.log('   ✓ Saved offline mode screenshot to offline_mode_view.png');

  // Restore context to online
  await context.setOffline(false);
  await page.waitForTimeout(200);
  console.log('   ✓ Offline mode and offline reload verified 100%!');

  // --------------------------------------------------------------------------
  // TEST 8: PWA Manifest & Installability CDP Verification
  // --------------------------------------------------------------------------
  console.log('\n[8/8] Testing Desktop PWA Manifest & Installability via Chromium CDP...');
  const os = require('os');
  const fs = require('fs');
  const http = require('http');
  const { spawn } = require('child_process');

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
    console.log('   ✓ Verified 0 manifest errors and 0 installability errors on /stopwatch/!');

    // Verify /clock/ route as well
    console.log('   Navigating to http://localhost:4399/clock/ ...');
    await pwaPage.goto('http://localhost:4399/clock/', { waitUntil: 'networkidle' });
    await pwaPage.waitForTimeout(1000);

    const clockManifestRes = await client.send('Page.getAppManifest');
    const clockInstallability = await client.send('Page.getInstallabilityErrors');

    console.log('   Clock Manifest errors:', clockManifestRes.errors);
    console.log('   Clock Installability errors:', clockInstallability.installabilityErrors);

    assert.strictEqual(clockManifestRes.errors.length, 0, 'Clock Manifest must have 0 parse errors');
    assert.strictEqual(clockInstallability.installabilityErrors.length, 0, 'Clock must report 0 PWA installability errors');
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
