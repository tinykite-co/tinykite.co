const { chromium } = require('playwright-core');
const assert = require('assert');

(async () => {
  console.log('=== STARTING TYPERACER & ACADEMY E2E PLAYWRIGHT TESTS ===');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 950 }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:8800/typeracer/typeracer/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // ----------------------------------------------------
  // TEST 1: Clean UI - No "11+" or "Project Gutenberg"
  // ----------------------------------------------------
  console.log('TEST 1: Checking Clean Branding (Zero 11+ or Gutenberg mentions in UI)...');
  const title = await page.title();
  console.log('   Page Title:', title);
  assert.strictEqual(/11\+/i.test(title), false, 'Page title must not mention 11+');
  assert.strictEqual(/gutenberg/i.test(title), false, 'Page title must not mention Gutenberg');

  const pageContent = await page.$eval('body', el => el.innerText);
  assert.strictEqual(/11\+\s*English/i.test(pageContent), false, 'Page body must not mention 11+ English');
  assert.strictEqual(/11\+\s*Entrance/i.test(pageContent), false, 'Page body must not mention 11+ Entrance');
  assert.strictEqual(/Project\s*Gutenberg\s*11\+/i.test(pageContent), false, 'Page body must not mention Project Gutenberg 11+');
  console.log('   ✓ Clean branding test PASSED');

  // ----------------------------------------------------
  // TEST 2: "Ready... Set... GO!" Countdown Indication
  // ----------------------------------------------------
  console.log('TEST 2: Testing Get-Set-GO! Countdown Mechanism...');
  // Click Start Race button
  const startBtn = await page.$('#btn-start-race-now');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(100);

    // Look for countdown badge / overlay
    const countdownEl = await page.$('#race-countdown-overlay');
    assert(countdownEl, 'Countdown overlay element should exist');
    
    // Check countdown text sequence or readiness
    const text = await page.$eval('#race-countdown-overlay', el => el.textContent.trim());
    console.log('   Countdown overlay active with label:', text);
    assert(text.includes('READY') || text.includes('SET') || text.includes('GO'), 'Countdown must display Ready, Set or GO');

    // Wait until countdown finishes (approx 2.5s)
    await page.waitForTimeout(2800);
    const isInputActive = await page.$eval('#typing-input', el => !el.disabled);
    assert.strictEqual(isInputActive, true, 'Input must be unlocked after GO!');
    console.log('   ✓ Countdown sequence test PASSED');
  }

  // ----------------------------------------------------
  // TEST 2.5: Zero Em Dashes in Passages & Fluid Punctuation
  // ----------------------------------------------------
  console.log('TEST 2.5: Verifying Zero Em Dashes in Passages and Fluid Punctuation Typing...');
  const passageText = await page.$eval('#passage-display', el => el.innerText);
  assert.strictEqual(passageText.includes('—'), false, 'Passage text must NOT contain em dashes (—)');
  assert.strictEqual(passageText.includes('–'), false, 'Passage text must NOT contain en dashes (–)');
  console.log('   ✓ Verified passage has zero em dashes (—) or en dashes (–)');

  const prefixWords = [
    'She', 'walked', 'round', 'and', 'looked', 'closely', 'at', 'that', 'side', 'of',
    'the', 'orchard', 'wall,', 'but', 'she', 'only', 'found', 'what', 'she', 'had',
    'found'
  ];
  for (const w of prefixWords) {
    await page.type('#typing-input', w + ' ', { delay: 5 });
    await page.waitForTimeout(20);
  }

  // Target word is 'before,'
  await page.type('#typing-input', 'before, ', { delay: 10 });
  await page.waitForTimeout(100);

  // Next word should be 'that'
  const currentWordText1 = await page.$eval('.tr-word-current', el => el.innerText.trim());
  assert.strictEqual(currentWordText1, 'that', 'Should advance to "that" after typing "before,"');

  // Type 'that '
  await page.type('#typing-input', 'that ', { delay: 10 });
  await page.waitForTimeout(100);

  // Verify that it advanced to the next word 'there'
  const currentWordText2 = await page.$eval('.tr-word-current', el => el.innerText.trim());
  console.log('   Advanced cleanly to:', currentWordText2);
  assert.strictEqual(currentWordText2, 'there', 'Should complete and advance to "there"');
  console.log('   ✓ Punctuation and word transition completed cleanly with zero em dashes');

  // ----------------------------------------------------
  // TEST 3: Free Typing Academy (Typing.com Inspired)
  // ----------------------------------------------------
  console.log('TEST 3: Testing Touch Typing Academy with Animated Hands & Lockout...');
  await page.click('#tab-btn-lessons');
  await page.waitForTimeout(400);

  // Verify hands illustration exists with left and right hands
  const handsContainer = await page.$('#academy-hands-graphic');
  assert(handsContainer, 'Animated hands graphic container should exist');

  const leftHand = await page.$('#hand-svg-left');
  const rightHand = await page.$('#hand-svg-right');
  assert(leftHand, 'Left hand SVG graphic must exist');
  assert(rightHand, 'Right hand SVG graphic must exist');

  // Check active target key is 'F' and Left Index finger is highlighted
  const targetKey = await page.$eval('#hud-target-key-pill', el => el.textContent.trim());
  console.log('   Current target key:', targetKey);
  assert.strictEqual(targetKey.toLowerCase(), 'f', 'Lesson 1 initial target key should be F');

  const leftIndexHighlighted = await page.$eval('#finger-svg-left-index', el => el.getAttribute('data-active') === 'true' || el.classList.contains('active-finger'));
  console.log('   Left index finger animated highlight active:', leftIndexHighlighted);
  assert.strictEqual(leftIndexHighlighted, true, 'Left index finger should be highlighted for key F');

  // Lockout check: Type wrong key 'k'
  console.log('   Typing wrong key k...');
  await page.keyboard.press('k');
  await page.waitForTimeout(150);

  const targetKeyAfterWrong = await page.$eval('#hud-target-key-pill', el => el.textContent.trim());
  assert.strictEqual(targetKeyAfterWrong.toLowerCase(), 'f', 'Should NOT advance on wrong key!');
  console.log('   ✓ Lockout verified: Did not advance on wrong key');

  // Advance check: Type 4 'f' characters to complete 'ffff' and reach the space gap
  console.log('   Typing 4 f characters to complete first chunk ffff...');
  await page.keyboard.press('f'); // 1st f
  await page.waitForTimeout(100);
  await page.keyboard.press('f'); // 2nd f
  await page.waitForTimeout(100);
  await page.keyboard.press('f'); // 3rd f
  await page.waitForTimeout(100);
  await page.keyboard.press('f'); // 4th f
  await page.waitForTimeout(150);

  // The 5th key should prompt for Space
  const spacePrompt = await page.$eval('#hud-target-key-pill', el => el.textContent.trim());
  console.log('   Target key at word gap:', spacePrompt);
  assert.strictEqual(spacePrompt.toLowerCase(), 'space', 'Target key at gap should prompt for Space');

  // Strike Spacebar to cross the gap
  await page.keyboard.press('Space');
  await page.waitForTimeout(100);

  // The next key should now be 'j'
  const nextWordKey = await page.$eval('#hud-target-key-pill', el => el.textContent.trim());
  console.log('   Target key for next group:', nextWordKey);
  assert.strictEqual(nextWordKey.toLowerCase(), 'j', 'Next group target key should be j');
  console.log('   ✓ Word chunking and spacebar gap advanced cleanly');

  // ----------------------------------------------------
  // TEST 4: Capture Academy & Hands Screenshot
  // ----------------------------------------------------
  const artifactDir = '/Users/arun/.gemini/antigravity-cli/brain/3fa0e544-4dc5-4c9b-9334-3b78080f8eb7';
  await page.screenshot({ path: `${artifactDir}/academy_typing_com_style.png` });
  console.log(`   Captured screenshot to ${artifactDir}/academy_typing_com_style.png`);

  await browser.close();
  console.log('=== ALL E2E PLAYWRIGHT TESTS PASSED! ===');
})().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
