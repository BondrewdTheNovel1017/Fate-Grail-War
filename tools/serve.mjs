#!/usr/bin/env node
// Local test of the hosted site: serves site/ and runs the same room relay (server/hub.js) at /ws/CODE.
// Usage: node tools/build.js && node tools/serve.mjs [port] [lagMs]   (needs the `ws` package: npm i -D ws)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Hub } from '../server/hub.js';
const require = createRequire(import.meta.url);
let WSS; try { WSS = require('ws').WebSocketServer; } catch (e) { WSS = require(process.env.WS_PATH || '/opt/npm-tools/node_modules/ws').WebSocketServer; }
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'site');
const PORT = +process.argv[2] || 8787, LAG = +process.argv[3] || 0;
const hubs = new Map(), stats = { in: 0, out: 0 };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); let p = u.pathname === '/' ? '/index.html' : u.pathname;
  const f = path.join(ROOT, path.normalize(p));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
const wss = new WSS({ noServer: true });
server.on('upgrade', (req, sock, head) => {
  const m = new URL(req.url, 'http://x').pathname.match(/^\/ws\/([a-z0-9]{1,8})$/); if (!m) return sock.destroy();
  wss.handleUpgrade(req, sock, head, (ws) => {
    let hub = hubs.get(m[1]); if (!hub) { hub = new Hub(); hubs.set(m[1], hub); }
    const later = (fn) => LAG ? setTimeout(fn, LAG / 2 + Math.random() * LAG / 2) : fn();
    const id = hub.connect((t) => later(() => { stats.out++; if (ws.readyState === 1) ws.send(t); }));
    ws.on('message', (d) => later(() => { stats.in++; hub.message(id, d.toString()); }));
    ws.on('close', () => { hub.close(id); if (!hub.size) hubs.delete(m[1]); });
  });
});
server.listen(PORT, () => console.log('http://localhost:' + PORT + '/  (lag ' + LAG + ' ms)'));
setInterval(() => { if (stats.in) console.log('frames in/s ' + (stats.in / 10).toFixed(1) + ', out/s ' + (stats.out / 10).toFixed(1)); stats.in = stats.out = 0; }, 10000);
