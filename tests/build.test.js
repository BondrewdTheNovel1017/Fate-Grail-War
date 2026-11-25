'use strict';
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const { buildPage } = require('../tools/build.js');

test('the page builds with CSS and script inlined', () => {
  const html = buildPage();
  assert.ok(!html.includes('{{CSS}}') && !html.includes('{{JS}}'), 'placeholders replaced');
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.ok(html.includes('/*ENGINE_START*/') && html.includes('/*ENGINE_END*/'));
});

test('the page script compiles', () => {
  const html = buildPage();
  const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
  assert.doesNotThrow(() => new vm.Script(js));
});
