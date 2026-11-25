#!/usr/bin/env node
// Browser smoke test: opens the built page in headless Chromium (Playwright), starts wars and saves screenshots to screens/.
// Not part of `npm test` because it needs a browser. Usage: node tools/screens.js
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const out = path.join(__dirname, '..', 'screens'); fs.mkdirSync(out, { recursive: true });
  const url = 'file://' + path.join(__dirname, '..', 'dist', 'fuyuki-war.html');
  const b = await chromium.launch(); const errs = [];
  const sizes = [[1440, 900, 'desktop'], [390, 844, 'phone']];
  for (const [w, h, name] of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', (e) => errs.push(name + ': ' + e.message));
    await p.goto(url); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(out, name + '-setup.png') });
    await p.click('[data-playas=master]'); await p.click('#go'); await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(out, name + '-war.png') });
    // contract scene: our servant dies, an enemy's master dies, their orphan is next to us
    await p.evaluate(() => { const G = window.__duel.G, me = G.f[0]; const o = G.f.find((f) => f.team !== me.team && !f.def.isMaster); me.partner.hp = 1; me.partner.st = 'dead'; o.partner.st = 'dead'; o.orphanT = 18; o.x = me.x + 110; o.y = me.y; });
    await p.waitForTimeout(500); await p.screenshot({ path: path.join(out, name + '-contract-offer.png') });
    await p.keyboard.press('f'); await p.waitForTimeout(700); await p.screenshot({ path: path.join(out, name + '-contract-done.png') });
    const ok = await p.evaluate(() => { const G = window.__duel.G; return !!(G.f[0].partner && G.f[0].partner.st !== 'dead' && G.f[0].partner.team === G.f[0].team); });
    console.log(name, 'contract formed:', ok);
    await p.close();
  }
  console.log(errs.length ? 'page errors:\n' + errs.join('\n') : 'no page errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
