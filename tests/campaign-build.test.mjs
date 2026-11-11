import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = path => readFileSync(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
test('one plan and struck future prices on all entry surfaces', () => {
  for (const path of ['pricing','family','gloss/back']) {
    const html=read(path);
    assert.match(html, /<s[^>]*>£4\.99\/month<\/s>/);
    assert.match(html, /<s[^>]*>£49\/year<\/s>/);
    assert.match(html, /Free during beta/);
    assert.match(html, /Nesta, Gloss and future TinyKite apps/);
    assert.match(html, /No automatic charge/);
    assert.doesNotMatch(html, /Gloss Plus|Family for life|10 a day/);
  }
});
test('all expansion links resolve and have no separate pledge goal', () => {
  const campaign=JSON.parse(readFileSync(new URL('../src/data/gloss/campaigns.json',import.meta.url),'utf8'));
  for (const language of campaign.languages) {
    const html=read(`gloss/back/${language.slug}`);
    assert.match(html, /not a separate fundraiser/);
    assert.match(html, /Year 13/);
    assert.doesNotMatch(html, /5,000|5000/);
    assert.doesNotMatch(html, /buy\.stripe\.com|backers|closing date/);
  }
});
test('campaign preview has rewards, credit contribution, and no checkout', () => {
  const html=read('gloss/back');
  for (const phrase of ['Founding family','Bring another family','Sponsor the pictures','Spare credits?','No automatic renewal','payments are not open']) assert.ok(html.includes(phrase),phrase);
  assert.doesNotMatch(html,/buy\.stripe\.com|5,000|5000/);
  assert.match(html, /Every word in the books young readers read through Year 13/);
  assert.match(html, /not the total cost of complete coverage/);
  assert.ok(existsSync(new URL('../dist/gloss/screenshots/app/03-duck-article.png',import.meta.url)));
});
test('appearance includes system choice and a stored-free default', () => {
  assert.match(read('pricing'), /option value="system"/);
  assert.match(read('pricing'), /prefers-color-scheme: dark/);
});

test('founding rewards show first-year savings against planned prices', () => {
  const html = read('gloss/back');
  assert.match(html, /Save £10 on the first paid year/);
  assert.match(html, /Save £20 on the first paid year/);
  assert.match(html, /£39/);
  assert.match(html, /£78/);
  assert.match(html, /first paid year only/);
  assert.match(html, /not a previous selling price/);
});
