import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = path => readFileSync(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
test('only interest and backer entry pages; retired pricing redirects', () => {
  assert.match(read('pricing'), /url=\/gloss\//);
  for (const path of ['gloss','gloss/back']) {
    assert.match(read(path), /Year 13/);
    assert.doesNotMatch(read(path), /buy\.stripe\.com|5,000|£4\.99\/month|Gloss Plus|Family for life/);
    assert.match(read(path), /option value="system"/);
    assert.match(read(path), /prefers-color-scheme: dark/);
    assert.doesNotMatch(read(path), /api\.fontshare\.com/);
  }
  assert.ok(existsSync(new URL('../dist/fonts/nunito-latin.woff2',import.meta.url)));
});
test('legacy language pages preserve preference in interest redirect', () => {
  const campaign=JSON.parse(readFileSync(new URL('../src/data/gloss/campaigns.json',import.meta.url),'utf8'));
  for (const language of campaign.languages) {
    const html=read(`gloss/back/${language.slug}`);
    assert.ok(html.includes(`/gloss/?language=${encodeURIComponent(language.name)}`));
    assert.doesNotMatch(html, /buy\.stripe\.com/);
  }
});
test('campaign preview has discounts, measured costs and no checkout', () => {
  const html=read('gloss/back');
  for (const phrase of ['Founding family','Bring another family','Sponsor the pictures','Spare credits','No automatic renewal','Payments aren’t open','88,741','30,714','not a confirmed funding goal','USD per language','generation only','Save £10 on the first paid year','Save £20 on the first paid year','first paid year only','not a previous selling price']) assert.ok(html.includes(phrase),phrase);
  assert.match(html, /data-cost-explorer/);
  assert.match(html, /data-reward-id="founding-family"/);
});
test('both pages distinguish current practice from planned games and draft from submission', () => {
  for (const path of ['gloss','gloss/back']) {
    const html=read(path);
    for (const phrase of ['Flashcards','Picture &amp; meaning quiz','Planned · not available yet','Use words I’ve read','data-language-search','data-interest-email']) assert.ok(html.includes(phrase),`${path}: ${phrase}`);
  }
});
test('silent walkthrough is accessible and has manual controls', () => {
  const html=read('gloss');
  for (const phrase of ['Pause walkthrough','Next step','Replay walkthrough','Understand duck','Real beta screens','No audio plays']) assert.ok(html.includes(phrase),phrase);
});
test('family subscription and feature feedback are explicit on both pages', () => {
  for (const path of ['gloss','gloss/back']) {
    const html=read(path);
    for (const phrase of ['Built with family at heart.','One subscription. A growing family of apps.','household-first messenger','adults on both sides in charge of approving','data-feature-request','Nothing is submitted until']) assert.ok(html.includes(phrase),`${path}: ${phrase}`);
    assert.match(html, /data-native-scroll="true"/);
  }
});

test('real campaign screenshots resolve to shipped local assets', () => {
 for (const page of ['gloss','gloss/back']) {
  for (const match of read(page).matchAll(/<img[^>]+src="(\/[^"?#]+)"/g)) {
   assert.ok(existsSync(new URL(`../dist${match[1]}`,import.meta.url)), match[1]);
  }
 }
});
test('interest gates optional backing on a saved signup', () => {
 const html=read('gloss');
 assert.match(html, /data-optional-backing hidden/);
 assert.match(html, /data-preferences hidden/);
 assert.match(html, /type="email"/);
 assert.match(html, /data-register-interest/);
 assert.doesNotMatch(html, /data-confirm-interest|data-email-draft|we can’t verify email delivery/);
 assert.match(read('gloss/interest'), /url=\/gloss\//);
 assert.match(read('gloss/how-to-use'), /Gloss/);
});
test('homepage leads with households and keeps utility tools out of navigation',()=>{
 const html=read('');
 for(const phrase of ['Family','Households','What does your child need?']) {
   if(phrase==='Households') assert.match(html,/households/);else assert.ok(html.includes(phrase),phrase);
 }
 const header=html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
 for(const phrase of ['Nesta','Gloss','Our purpose']) assert.ok(header.includes(phrase));
 assert.doesNotMatch(header,/Workspace|Router Hub|TypeRacer|Stopwatch|>Tools</);
 assert.match(html,/id="feature-request"/);
});

test('homepage keeps the existing kite animation and intro',()=>{
 const html=read('');
 assert.match(html,/id="hero-kite-layer"/);
 assert.match(html,/id="hero-motes"/);
 assert.match(html,/id="hero-washes"/);
});
