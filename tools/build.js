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

/** Engine and UI share one scope in the page: a name declared at the top level of both would silently shadow
 *  the engine's (the render loop's `draw` once replaced the event deck's `draw`, so no events ran in real games). */
function topNames(src) { const names = new Set(); src.replace(/^(?:function\s+([A-Za-z_$][\w$]*)|var\s+([A-Za-z_$][\w$]*))/gm, (m, f, v) => { names.add(f || v); return m; }); return names; }
function nameClashes() { const e = topNames(engineSource()), u = topNames(uiSource()); return [...e].filter((n) => u.has(n)); }

function buildPage(arena, hosted, dev) {
  const clash = nameClashes(); if (clash.length) throw new Error('engine and UI both declare: ' + clash.join(', ') + ' (rename the engine one)');
  const js = '(function () {\n' + (arena ? 'var ARENA_ENTRY = true;\n' : '') + (hosted ? 'var NET_WS = true;\n' : '') + (dev ? 'var DEV_BUILD = true;\n' : '') + '/*ENGINE_START*/\n' + engineSource() + '/*ENGINE_END*/\n' + uiSource() + '})();';
  const css = read('src/page/style.css').replace(/\n$/, '');
  const page = read('src/page/template.html').replace('{{CSS}}', () => css).replace('{{JS}}', () => js);
  // the hosted site is a plain web page, so it carries its own doctype, viewport and base reset (claude.ai adds these to artifacts)
  return hosted ? '<!doctype html>\n<html lang="en">\n' + page.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<style>html{color-scheme:dark}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>') : page;
}

module.exports = { engineSource, uiSource, buildPage, nameClashes };

if (require.main === module) {
  const out = path.join(ROOT, 'dist', 'fuyuki-war.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const html = buildPage();
  fs.writeFileSync(out, html);
  console.log('built ' + path.relative(ROOT, out) + ' (' + Math.round(html.length / 1024) + ' KB)');
  // The Arena entry page: the same game and the same sprites, opening on the Arena setup.
  fs.writeFileSync(path.join(ROOT, 'arena', 'servant-duel.html'), buildPage(true));
  console.log('built arena/servant-duel.html');
  // The preview build: the same game with the dev scenarios menu always on, published as its own artifact for review.
  fs.writeFileSync(path.join(ROOT, 'dist', 'preview.html'), buildPage(false, false, true));
  console.log('built dist/preview.html');
  // The hosted site (Cloudflare): the same game, with online play through the game's own room relay (server/).
  fs.mkdirSync(path.join(ROOT, 'site'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'site', 'index.html'), buildPage(false, true));
  fs.writeFileSync(path.join(ROOT, 'site', 'arena.html'), buildPage(true, true));
  console.log('built site/index.html, site/arena.html');
}
