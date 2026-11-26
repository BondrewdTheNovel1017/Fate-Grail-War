// The game's room relay: the same idea as the claude.ai room the artifact uses.
// Each page joins named rooms (the lobby "fgw-CODE" and the war's channels "fgw-CODE-f" and so on),
// sets its own presence (a small JSON object), and hears everyone else's. Nothing is stored.
// One Hub runs per game code (one Durable Object on Cloudflare, or one object in the local test server).
//
// Wire format, both ways: one JSON text frame { b: [ op, ... ] }.
//   page -> hub: ['j', room]          join, answered by ['s', room, [[peer, presence], ...]]
//                ['p', room, patch]   merge into my presence (a top-level null removes a field)
//                ['l', room]          leave
//   hub -> page: ['you', peer]        your id, sent once on connect
//                ['u', room, peer, patch]   someone's presence changed (patch as sent)
//                ['g', room, peer]    someone left
//                ['e', code]          a refused operation
export const LIMITS = { rooms: 16, peers: 8, presence: 8192, frame: 65536 };
const ROOM_RE = /^fgw-[a-z0-9]{1,8}(-[a-z0-9]{1,3})?$/;

export class Hub {
  constructor() { this.clients = new Map(); this.rooms = new Map(); this.n = 0; }
  connect(send) {
    const id = Math.random().toString(36).slice(2, 10) + (++this.n).toString(36);
    this.clients.set(id, { send, rooms: new Set(), out: [] });
    this.push(id, ['you', id]); this.flush(id);
    return id;
  }
  close(id) {
    const c = this.clients.get(id); if (!c) return;
    for (const r of c.rooms) this.leave(id, r);
    this.clients.delete(id); this.flushAll();
  }
  message(id, text) {
    const c = this.clients.get(id); if (!c || typeof text !== 'string' || text.length > LIMITS.frame) return;
    let m; try { m = JSON.parse(text); } catch (e) { return; }
    if (!m || !Array.isArray(m.b)) return;
    for (const op of m.b) {
      if (!Array.isArray(op)) continue;
      const [k, room] = op;
      if (k === 'j') this.join(id, room);
      else if (k === 'p') this.presence(id, room, op[2]);
      else if (k === 'l') this.leave(id, room);
    }
    this.flushAll();
  }
  join(id, room) {
    const c = this.clients.get(id);
    if (typeof room !== 'string' || !ROOM_RE.test(room)) return this.push(id, ['e', 'bad_room', room]);
    let R = this.rooms.get(room);
    if (!R) { R = new Map(); this.rooms.set(room, R); }
    if (!R.has(id)) {
      if (R.size >= LIMITS.peers) return this.push(id, ['e', 'room_full', room]);
      if (c.rooms.size >= LIMITS.rooms) return this.push(id, ['e', 'too_many_rooms', room]);
      R.set(id, {}); c.rooms.add(room);
    }
    const list = []; for (const [p, pres] of R) if (p !== id) list.push([p, pres]);
    this.push(id, ['s', room, list]);
  }
  presence(id, room, patch) {
    const R = this.rooms.get(room); if (!R || !R.has(id) || !patch || typeof patch !== 'object' || Array.isArray(patch)) return;
    const next = Object.assign({}, R.get(id));
    for (const k of Object.keys(patch)) { if (patch[k] === null) delete next[k]; else next[k] = patch[k]; }
    if (JSON.stringify(next).length > LIMITS.presence) return this.push(id, ['e', 'presence_too_large', room]);
    R.set(id, next);
    for (const p of R.keys()) if (p !== id) this.push(p, ['u', room, id, patch]);
  }
  leave(id, room) {
    const R = this.rooms.get(room), c = this.clients.get(id);
    if (c) c.rooms.delete(room);
    if (!R || !R.has(id)) return;
    R.delete(id);
    if (!R.size) this.rooms.delete(room);
    else for (const p of R.keys()) this.push(p, ['g', room, id]);
  }
  push(id, ev) { const c = this.clients.get(id); if (c) c.out.push(ev); }
  flush(id) { const c = this.clients.get(id); if (!c || !c.out.length) return; const b = c.out; c.out = []; try { c.send(JSON.stringify({ b })); } catch (e) { /* the socket is closing */ } }
  flushAll() { for (const id of this.clients.keys()) this.flush(id); }
  get size() { return this.clients.size; }
}
