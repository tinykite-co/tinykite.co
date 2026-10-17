const { chromium } = require('playwright-core');
const assert = require('assert');

(async () => {
  console.log('=== RUNNING COMPREHENSIVE TYPERACER MULTIPLAYER PLAYWRIGHT TEST ===');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });

  console.log('1. Launching Tab 1 (Host Player)...');
  const page1 = await context.newPage();
  await page1.goto('http://localhost:8800/typeracer/typeracer/', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(600);

  console.log('2. Launching Tab 2 (Peer Player)...');
  const page2 = await context.newPage();
  await page2.goto('http://localhost:8800/typeracer/typeracer/', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1000);

  // 1. Verify Handshake
  console.log('3. Verifying Cross-Tab Peer Handshake...');
  const tab1Badge = await page1.$eval('#racer-1-badge', el => el.textContent.trim());
  const tab1Summary = await page1.$eval('#lobby-racers-summary', el => el.textContent.trim());
  console.log('   Tab 1 Lane 1 Badge:', tab1Badge);
  console.log('   Tab 1 Lobby Summary:', tab1Summary);

  const tab2Badge = await page2.$eval('#racer-1-badge', el => el.textContent.trim());
  const tab2Summary = await page2.$eval('#lobby-racers-summary', el => el.textContent.trim());
  console.log('   Tab 2 Lane 1 Badge:', tab2Badge);
  console.log('   Tab 2 Lobby Summary:', tab2Summary);

  assert(tab1Badge.includes('PEER'), 'Tab 1 should have PEER badge in Lane 1');
  assert(tab2Badge.includes('PEER'), 'Tab 2 should have PEER badge in Lane 1');
  assert(tab1Summary.includes('2 Live Players'), 'Tab 1 lobby summary should report 2 live players');
  assert(tab2Summary.includes('2 Live Players'), 'Tab 2 lobby summary should report 2 live players');
  console.log('   ✓ Handshake test PASSED');

  // 2. Start Race on Tab 1
  console.log('4. Starting Race on Tab 1 (Awaiting Ready... Set... GO! countdown)...');
  await page1.click('#btn-start-race-now');
  await page1.waitForFunction(() => !document.getElementById('typing-input').disabled, { timeout: 6000 });
  await page2.waitForFunction(() => !document.getElementById('typing-input').disabled, { timeout: 6000 });
  await page1.waitForTimeout(200);

  // Tab 1 types first 4 words
  const wordsTab1 = await page1.$$eval('#passage-display .tr-word-current, #passage-display .tr-word-upcoming', els => els.map(e => e.textContent.trim()));
  console.log('5. Tab 1 typing first 4 words:', wordsTab1.slice(0, 4));

  for (let i = 0; i < 4; i++) {
    const word = wordsTab1[i];
    await page1.type('#typing-input', word + ' ', { delay: 45 });
    await page1.waitForTimeout(100);
  }

  await page1.waitForTimeout(600);

  // Check positions
  const tab1PlayerLeft = await page1.$eval('#racer-0', el => el.style.left);
  const tab1PlayerWpm = await page1.$eval('#racer-0-wpm', el => el.textContent.trim());
  const tab2PeerLeft = await page2.$eval('#racer-1', el => el.style.left);
  const tab2PeerWpm = await page2.$eval('#racer-1-wpm', el => el.textContent.trim());

  console.log('   Tab 1 Player position:', tab1PlayerLeft, '| WPM:', tab1PlayerWpm);
  console.log('   Tab 2 sees Peer (Tab 1) at position:', tab2PeerLeft, '| WPM:', tab2PeerWpm);

  const tab1PlayerNum = parseFloat(tab1PlayerLeft);
  const tab2PeerNum = parseFloat(tab2PeerLeft);

  assert(tab1PlayerNum > 0, 'Tab 1 player car should have moved > 0%');
  assert(tab2PeerNum > 0, 'Tab 2 peer car in Lane 1 should have moved > 0%');
  assert(Math.abs(tab1PlayerNum - tab2PeerNum) < 0.5, 'Tab 2 Lane 1 position should mirror Tab 1 player position');
  console.log('   ✓ Live P2P Tab 1 -> Tab 2 progress sync PASSED');

  // Tab 2 types first 3 words
  console.log('6. Tab 2 typing first 3 words to race back...');
  const wordsTab2 = await page2.$$eval('#passage-display .tr-word-current, #passage-display .tr-word-upcoming', els => els.map(e => e.textContent.trim()));
  for (let i = 0; i < 3; i++) {
    const word = wordsTab2[i];
    await page2.type('#typing-input', word + ' ', { delay: 45 });
    await page2.waitForTimeout(100);
  }

  await page2.waitForTimeout(600);

  const tab2PlayerLeft = await page2.$eval('#racer-0', el => el.style.left);
  const tab2PlayerWpm = await page2.$eval('#racer-0-wpm', el => el.textContent.trim());
  const tab1PeerLeft = await page1.$eval('#racer-1', el => el.style.left);
  const tab1PeerWpm = await page1.$eval('#racer-1-wpm', el => el.textContent.trim());

  console.log('   Tab 2 Player position:', tab2PlayerLeft, '| WPM:', tab2PlayerWpm);
  console.log('   Tab 1 sees Peer (Tab 2) at position:', tab1PeerLeft, '| WPM:', tab1PeerWpm);

  const tab2PlayerNum = parseFloat(tab2PlayerLeft);
  const tab1PeerNum = parseFloat(tab1PeerLeft);

  assert(tab2PlayerNum > 0, 'Tab 2 player car should have moved > 0%');
  assert(tab1PeerNum > 0, 'Tab 1 peer car in Lane 1 should have moved > 0%');
  assert(Math.abs(tab2PlayerNum - tab1PeerNum) < 0.5, 'Tab 1 Lane 1 position should mirror Tab 2 player position');
  console.log('   ✓ Live P2P Tab 2 -> Tab 1 progress sync PASSED');

  // 7. Verify bot simulation runs in Lane 2 and Lane 3
  const tab1Bot2Left = parseFloat(await page1.$eval('#racer-2', el => el.style.left));
  const tab1Bot3Left = parseFloat(await page1.$eval('#racer-3', el => el.style.left));
  console.log('7. Bot positions in Tab 1: Bot 2 =', tab1Bot2Left, '%, Bot 3 =', tab1Bot3Left, '%');
  assert(tab1Bot2Left > 0 || tab1Bot3Left > 0, 'Bots should be advancing along with human racers');
  console.log('   ✓ Bot simulation PASSED');

  // 8. Capture side-by-side screenshots
  const artifactDir = '/Users/arun/.gemini/antigravity-cli/brain/3fa0e544-4dc5-4c9b-9334-3b78080f8eb7';
  await page1.screenshot({ path: `${artifactDir}/multiplayer_tab1.png` });
  await page2.screenshot({ path: `${artifactDir}/multiplayer_tab2.png` });
  console.log(`8. Saved screenshots to ${artifactDir}/multiplayer_tab1.png and multiplayer_tab2.png`);

  await browser.close();
  console.log('=== ALL MULTIPLAYER PLAYWRIGHT TESTS PASSED SUCCESSFULLY! ===');
})().catch(err => {
  console.error('Multiplayer test failed with error:', err);
  process.exit(1);
});
