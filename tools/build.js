#!/usr/bin/env node
// Builds the single-page game (dist/fuyuki-war.html) from src/.
// The page is published as a claude.ai artifact, so everything is inlined into one file.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const list = (dir) => fs.readdirSync(path.join(ROOT, dir)).filter((n) => n.endsWith('.js')).sort().map((n) => path.join(dir, n));

/** Engine source only: rules, AI and simulation, no DOM. Used by the tests and the balance tools too. */
function engineSource() { return list('src/engine').map(read).join(''); }
function uiSource() { return list('src/ui').map(read).join(''); }

function buildPage(arena) {
  const js = '(function () {\n' + (arena ? 'var ARENA_ENTRY = true;\n' : '') + '/*ENGINE_START*/\n' + engineSource() + '/*ENGINE_END*/\n' + uiSource() + '})();';
  const css = read('src/page/style.css').replace(/\n$/, '');
  return read('src/page/template.html').replace('{{CSS}}', () => css).replace('{{JS}}', () => js);
}

module.exports = { engineSource, uiSource, buildPage };

if (require.main === module) {
  const out = path.join(ROOT, 'dist', 'fuyuki-war.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = buildPage();
  fs.writeFileSync(out, html);
  console.log('built ' + path.relative(ROOT, out) + ' (' + Math.round(html.length / 1024) + ' KB)');
  // The Arena entry page: the same game and the same sprites, opening on the Arena setup.
  fs.writeFileSync(path.join(ROOT, 'arena', 'servant-duel.html'), buildPage(true));
  console.log('built arena/servant-duel.html');
}
