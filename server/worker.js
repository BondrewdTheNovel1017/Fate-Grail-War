// Cloudflare entry: the game page is served from ./site; /ws/CODE opens a WebSocket to that game's room relay.
import { Hub, LIMITS } from './hub.js';

export class Room {
  constructor(state, env) { this.hub = new Hub(); }
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
    const pair = new WebSocketPair(), client = pair[0], server = pair[1];
    server.accept();
    const id = this.hub.connect((text) => server.send(text));
    server.addEventListener('message', (ev) => { if (typeof ev.data === 'string' && ev.data.length <= LIMITS.frame) this.hub.message(id, ev.data); });
    const bye = () => this.hub.close(id);
    server.addEventListener('close', bye); server.addEventListener('error', bye);
    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/ws\/([a-z0-9]{1,8})$/);
    if (m) return env.ROOMS.get(env.ROOMS.idFromName(m[1])).fetch(request);
    return env.ASSETS.fetch(request);
  },
};
