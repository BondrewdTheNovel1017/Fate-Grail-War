var SPR_EXTRA = {};
var SPR = (function () {
var OUT = 'stroke="#0b121a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
function svg(vb, inner, extra) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" ' + (extra || '') + '>' + inner + '</svg>'; }
function grad(id, a, b) { return '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>'; }
var SH = 'fill="#000" opacity=".22" stroke="none"';

/* =================== EL CID =================== */
var cid = {
  id: 'cid', name: 'El Cid', cls: 'Saber', col: '#6fb4f0',
  basis: 'Castilian knight of the eleventh century: conical helm with nasal bar, mail hauberk and coif, a plain surcoat, and a straight arming sword.',
  pal: [['Surcoat', '#244a7c'], ['Mail', '#8a98a6'], ['Cloak', '#8e2f2f'], ['Steel', '#cfd8de'], ['Brass', '#c9a24a']],
  notes: ['Mail and steel read cool; the red cloak is the single warm shape.', 'Cloak trails behind him in the arena, so you can read which way he faces.', 'Straight, plain sword: a working blade, no ornament.'],
  body: function () {
    return '<defs>' + grad('cst', '#e6eef2', '#8c9eab') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M-6 -24 Q-36 -20 -42 0 Q-36 20 -6 24Z" fill="#8e2f2f"/><path d="M-6 -24 Q-24 -20 -34 -6 L-8 -4Z" ' + SH + '/>' +
      '<path d="M4 -17 L26 -11 L26 -5 L2 -9Z" fill="#8a98a6"/><path d="M4 17 L26 11 L26 5 L2 9Z" fill="#8a98a6"/>' +
      '<ellipse cx="0" cy="0" rx="13" ry="23" fill="#244a7c"/><rect x="-13" y="-3" width="26" height="6" fill="#e9e4d3" stroke="none"/><ellipse cx="0" cy="0" rx="13" ry="23" fill="none"/>' +
      '<ellipse cx="0" cy="-20" rx="8" ry="6" fill="#8a98a6"/><ellipse cx="0" cy="20" rx="8" ry="6" fill="#8a98a6"/>' +
      '<circle cx="2" cy="0" r="10" fill="url(#cst)"/><path d="M-8 0 L10 0" stroke="#6b7885" stroke-width="2" fill="none"/><path d="M9 -2.5 L17 0 L9 2.5Z" fill="#9aa7b3"/></g>';
  },
  weapon: function () {
    return '<defs>' + grad('cw', '#e6eef2', '#8c9eab') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<rect x="-7" y="-2.8" width="16" height="5.6" rx="2" fill="#5a3a22"/><circle cx="-9" cy="0" r="4.5" fill="#c9a24a"/>' +
      '<path d="M12 -3.5 L72 -2.5 L80 0 L72 2.5 L12 3.5Z" fill="url(#cw)"/><path d="M14 0 L74 0" stroke="#6b7885" stroke-width="1.4" fill="none"/>' +
      '<rect x="8" y="-11" width="5.5" height="22" rx="2.5" fill="#c9a24a"/></g>';
  },
  wvb: '-16 -16 104 32', tdvb: '-50 -50 100 100'
};

/* =================== LEONIDAS =================== */
function pteruges() { var s = ''; for (var i = 0; i < 7; i++) { var x = 98 + i * 14.6; s += '<path d="M' + x + ' 330 L' + x + ' 372 Q' + (x + 7.3) + ' 380 ' + (x + 14.6) + ' 372 L' + (x + 14.6) + ' 330Z" fill="' + (i % 2 ? '#8d6038' : '#7a5230') + '"/>'; } return s; }
var leonidas = {
  id: 'leonidas', name: 'Leonidas', cls: 'Lancer', col: '#e0b25a',
  basis: 'Spartan king and hoplite: Corinthian helm with a crest, bronze cuirass over leather strips, crimson cloak, a round shield and a leaf-bladed spear.',
  pal: [['Bronze', '#c7954a'], ['Crimson', '#9b2226'], ['Leather', '#7a5230'], ['Spear steel', '#cfd8de'], ['Skin', '#c58d62']],
  notes: ['Bronze and crimson give him the warmest palette of the five.', 'The round shield and the crest are visible from above, so his silhouette cannot be mistaken.', 'Spear is the longest weapon in the roster, matching his reach.'],
  body: function () {
    return '<defs>' + grad('lbr', '#e8c27a', '#8a6226') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M-6 -26 Q-38 -22 -44 0 Q-38 22 -6 26Z" fill="#9b2226"/><path d="M-6 -26 Q-26 -22 -36 -6 L-8 -4Z" ' + SH + '/>' +
      '<ellipse cx="0" cy="0" rx="13" ry="24" fill="url(#lbr)"/><ellipse cx="0" cy="-22" rx="7" ry="6" fill="#c58d62"/><ellipse cx="0" cy="22" rx="7" ry="6" fill="#c58d62"/>' +
      '<path d="M4 20 L28 12 L28 6 L2 10Z" fill="#c58d62"/>' +
      '<circle cx="14" cy="-24" r="17" fill="url(#lbr)"/><circle cx="14" cy="-24" r="12" fill="none" stroke="#7a5a22" stroke-width="3"/><path d="M14 -31 L9 -18 M14 -31 L19 -18 M11 -22 L17 -22" stroke="#3a2a12" stroke-width="2" fill="none"/>' +
      '<circle cx="2" cy="0" r="10.5" fill="url(#lbr)"/><rect x="-12" y="-2.5" width="22" height="5" rx="2" fill="#9b2226"/><path d="M8 -4 L14 -3 L14 3 L8 4Z" fill="#0b121a" stroke="none"/></g>';
  },
  weapon: function () {
    return '<defs>' + grad('lsp', '#e6eef2', '#8c9eab') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<rect x="-26" y="-2.6" width="126" height="5.2" rx="2" fill="#6b4a2c"/><path d="M-26 -2.6 L-35 0 L-26 2.6Z" fill="#c7954a"/>' +
      '<rect x="95" y="-4.5" width="6" height="9" rx="2" fill="#c7954a"/>' +
      '<path d="M100 -3 Q106 -12 130 0 Q106 12 100 3Z" fill="url(#lsp)"/><path d="M102 0 L126 0" stroke="#6b7885" stroke-width="1.3" fill="none"/>' +
      '<rect x="-3" y="-3.5" width="9" height="7" rx="2" fill="#7a5230"/></g>';
  },
  wvb: '-40 -16 176 32', tdvb: '-50 -50 100 100'
};

/* =================== ATALANTA =================== */
function braid() { var s = ''; for (var i = 0; i < 8; i++) { s += '<ellipse cx="' + (192 + i * 1.8) + '" cy="' + (200 + i * 14) + '" rx="9" ry="9" fill="#8a3b1e" transform="rotate(' + (i % 2 ? 18 : -18) + ' ' + (192 + i * 1.8) + ' ' + (200 + i * 14) + ')"/>'; } return s; }
var atalanta = {
  id: 'atalanta', name: 'Atalanta', cls: 'Archer', col: '#7ad39a',
  basis: 'Huntress of Greek myth: a short chiton and leather harness, a green mantle, a long braid, a quiver on her back, and a recurve bow.',
  pal: [['Tunic', '#c8964a'], ['Mantle', '#4d7a4e'], ['Hair', '#8a3b1e'], ['Leather', '#6b4a2c'], ['Bow wood', '#7a4a22']],
  notes: ['Slimmest silhouette: speed is the point, so nothing bulky.', 'The braid and quiver both trail behind her in the arena.', 'Green mantle picks up the Archer accent color.'],
  body: function () {
    return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M-6 0 Q-20 8 -28 -2 Q-34 -9 -42 0" fill="none" stroke="#0b121a" stroke-width="8"/><path d="M-6 0 Q-20 8 -28 -2 Q-34 -9 -42 0" fill="none" stroke="#8a3b1e" stroke-width="5"/>' +
      '<g transform="rotate(-24 -10 8)"><rect x="-14" y="-6" width="8" height="28" rx="3" fill="#5a3a22"/><path d="M-12 -6 L-12 -12 M-9 -6 L-9 -13" stroke-width="1.6" fill="none"/><path d="M-13 -10 L-12 -14 L-11 -10Z M-10 -11 L-9 -15 L-8 -11Z" fill="#e9e4d3" stroke-width="1"/></g>' +
      '<path d="M4 -13 L26 -8 L26 -3 L2 -7Z" fill="#d39d76"/><path d="M4 13 L24 8 L24 4 L2 7Z" fill="#d39d76"/>' +
      '<ellipse cx="0" cy="0" rx="10" ry="18" fill="#c8964a"/><ellipse cx="-2" cy="-14" rx="9" ry="6" fill="#4d7a4e"/><path d="M-9 -14 L9 14" stroke="#6b4a2c" stroke-width="3" fill="none"/>' +
      '<circle cx="1" cy="0" r="9" fill="#8a3b1e"/><path d="M-4 -8 Q9 0 -4 8" fill="none" stroke="#6b4a2c" stroke-width="3"/><path d="M6 -4 Q13 0 6 4Z" fill="#d39d76"/></g>';
  },
  weapon: function () {
    return '<g stroke-linecap="round" fill="none">' +
      '<path d="M6 -34 Q-16 -18 -12 0 Q-16 18 6 34" stroke="#0b121a" stroke-width="8.5"/><path d="M6 -34 Q-16 -18 -12 0 Q-16 18 6 34" stroke="#7a4a22" stroke-width="5"/>' +
      '<path d="M6 -34 L13 -39 M6 34 L13 39" stroke="#0b121a" stroke-width="7"/><path d="M6 -34 L13 -39 M6 34 L13 39" stroke="#7a4a22" stroke-width="3.5"/>' +
      '<path d="M13 -39 L7 0 L13 39" stroke="#e9e4d3" stroke-width="1.2"/>' +
      '<rect x="-17" y="-6" width="11" height="12" rx="3" fill="#6b4a2c" stroke="#0b121a" stroke-width="2"/></g>';
  },
  wvb: '-24 -44 48 88', tdvb: '-50 -50 100 100'
};

/* =================== HERACLES =================== */
var heracles = {
  id: 'heracles', name: 'Heracles', cls: 'Berserker', col: '#e2515c',
  basis: 'Hero of Greek myth: the Nemean lion pelt worn as a hood and cloak, here dark as a black cuirass, an enormous body, black hair and beard, and a huge axe-sword hewn from temple stone, crude and heavy, with a leather-bound grip.',
  pal: [['Skin', '#b57c54'], ['Dark pelt', '#4a4552'], ['Pelt shadow', '#1f1c25'], ['Stone', '#7a7672'], ['Hair and beard', '#1c1511']],
  notes: ['Widest shoulders in the roster: the first thing you read from above.', 'The lion hood gives him a distinctive top-down head shape with ears.', 'His stone axe-sword is a rough slab with a bound grip: crude, huge and heavy; the weight is the point.'],
  body: function () {
    return '<defs>' + grad('hpl', '#4a4552', '#1f1c25') + grad('hsk', '#c58d62', '#9a6643') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M-2 -30 Q-28 -22 -32 0 Q-28 22 -2 30 L4 14 Q-6 0 4 -14Z" fill="url(#hpl)"/><path d="M-30 -10 L-36 -4 L-30 0 L-36 6 L-30 10" fill="none"/>' +
      '<ellipse cx="0" cy="0" rx="16" ry="30" fill="url(#hsk)"/>' +
      '<path d="M-6 -24 Q10 -18 14 -6 L6 -4Z M-6 24 Q10 18 14 6 L6 4Z" fill="url(#hpl)"/>' +
      '<circle cx="26" cy="-16" r="9" fill="url(#hsk)"/><circle cx="26" cy="16" r="9" fill="url(#hsk)"/><rect x="18" y="-20" width="6" height="8" fill="#5a3a22" stroke="none"/><rect x="18" y="12" width="6" height="8" fill="#5a3a22" stroke="none"/>' +
      '<circle cx="-1" cy="-13" r="6" fill="#1d1a22"/><circle cx="-1" cy="13" r="6" fill="#1d1a22"/>' +
      '<circle cx="2" cy="0" r="14" fill="#1d1a22"/><circle cx="2" cy="0" r="10" fill="url(#hpl)"/><path d="M8 -4 L18 0 L8 4Z" fill="#3a2418"/></g>';
  },
  weapon: function () {
    return '<defs>' + grad('hst', '#8d8a86', '#4a4744') + '</defs><g stroke="#0b121a" stroke-width="2.4" stroke-linejoin="round">' +
      '<rect x="-14" y="-3.6" width="24" height="7.2" rx="2" fill="#4b3320"/><path d="M-10 -3.6 L-6 3.6 M-4 -3.6 L0 3.6 M2 -3.6 L6 3.6" stroke="#2a1c12" stroke-width="1.3" fill="none"/>' +
      '<path d="M8 -9 L14 -11 L14 11 L8 9Z" fill="#3e3b38"/>' +
      '<path d="M14 -8 L30 -11 L38 -9 L50 -13 L62 -11 L70 -14 L80 -8 L84 -2 L82 4 L74 9 L62 10 L52 13 L40 10 L28 11 L14 8Z" fill="url(#hst)"/>' +
      '<path d="M18 -2 L44 -4 L58 -1 L76 -3 M22 4 L40 3 L56 6" fill="none" stroke="#2d2b29" stroke-width="1.3" opacity=".7"/>' +
      '<path d="M30 -11 L33 -6 M50 -13 L48 -8 M62 10 L60 5 M70 -14 L69 -9" fill="none" stroke="#2d2b29" stroke-width="1.2"/>' +
      '<path d="M16 -7 L36 -9 L48 -11 L66 -11" fill="none" stroke="#b9b5ae" stroke-width="1" opacity=".75"/></g>';
  },
  wvb: '-16 -18 104 36', tdvb: '-50 -50 100 100'
};

/* =================== ASSASSIN (Hassan) =================== */
var hassan = {
  id: 'hassan', name: 'Hassan', cls: 'Assassin', col: '#9aa7b3',
  basis: 'A hashashin of the medieval Near East: layered dark robes, a peaked hood and face wrap, a red sash, wrapped forearms, and a single curved knife.',
  pal: [['Robe', '#2d3640'], ['Mantle', '#1b222a'], ['Sash', '#9b2226'], ['Wrap', '#8a7f6a'], ['Steel', '#cfd8de']],
  notes: ['Darkest figure in the roster, with one red line, so the sash is how you read his facing.', 'Pointed hood tail shows behind him from above.', 'One curved knife, held low: his combo chain is still the longest.'],
  body: function () {
    return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M-8 -7 Q-18 -4 -30 0 Q-18 4 -8 7Z" fill="#2d3640"/>' +
      '<path d="M4 -11 L24 -8 L24 -3 L2 -6Z" fill="#8a7f6a"/><path d="M4 11 L24 8 L24 3 L2 6Z" fill="#8a7f6a"/>' +
      '<ellipse cx="0" cy="0" rx="10" ry="18" fill="#2d3640"/><ellipse cx="-1" cy="0" rx="8" ry="16" fill="#1b222a" stroke="none"/>' +
      '<path d="M-7 -14 L7 14" stroke="#9b2226" stroke-width="5" fill="none"/><path d="M-7 -14 L7 14" stroke="#0b121a" stroke-width="1" fill="none" opacity=".4"/>' +
      '<circle cx="1" cy="0" r="9" fill="#2d3640"/><path d="M-6 0 L8 0" stroke="#11171d" stroke-width="2" fill="none"/><path d="M8 -3 L13 0 L8 3Z" fill="#11171d" stroke="none"/></g>';
  },
  weapon: function () {
    return '<defs>' + grad('dw', '#e6eef2', '#8c9eab') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<rect x="-6" y="-2.6" width="12" height="5.2" rx="2" fill="#9b2226"/><rect x="5" y="-6.5" width="3.5" height="13" rx="1.6" fill="#8a7f6a"/>' +
      '<path d="M9 -2.6 Q34 -3 46 -20 Q43 2 9 3Z" fill="url(#dw)"/><path d="M12 0 Q34 0 43 -14" fill="none" stroke="#6b7885" stroke-width="1.2"/></g>';
  },
  wvb: '-10 -26 62 34', tdvb: '-50 -50 100 100'
};


/* =================== CAERWYN (original) =================== */
var caerwyn = {
  id: 'caerwyn', name: 'King Arthur', cls: 'Saber', col: '#dfeaf4',
  basis: 'The king of Arthurian legend, imagined as a woman and drawn our own way: a deep blue dress and cloak under bright silver plate, a gold-trimmed breastplate and a long honey-blonde braid. Her blade is bright silver with a gold line down its middle, set in a gold hilt.',
  pal: [['Dress', '#2f56a8'], ['Silver plate', '#e9eff4'], ['Trim', '#d9ad3c'], ['Hair', '#e3c06a'], ['Steel', '#dfe7ea']],
  notes: ['Blue cloth under silver plate: the blue reads first from above, the silver marks her as a knight.', 'The long blonde braid trails behind her next to the cloak, so facing is easy to read.', 'Gold trim on the breastplate matches the hilt of her sword.'],
  body: function () {
    return '<defs>' + grad('qsv', '#ffffff', '#a9b8c6') + grad('qbl', '#4a74c8', '#1f3a7a') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M-6 -24 Q-36 -20 -42 0 Q-36 20 -6 24Z" fill="url(#qbl)"/><path d="M-6 -24 Q-24 -20 -34 -6 L-8 -4Z" ' + SH + '/>' +
      '<path d="M-8 -3 Q-24 -8 -38 -2 Q-26 0 -38 6 Q-22 6 -8 4Z" fill="#e3c06a"/><path d="M-14 0 L-34 1" stroke="#a77f2c" stroke-width="1.2" fill="none"/>' +
      '<path d="M4 -17 L26 -11 L26 -5 L2 -9Z" fill="url(#qsv)"/><path d="M4 17 L26 11 L26 5 L2 9Z" fill="url(#qsv)"/><circle cx="27" cy="-8" r="3.2" fill="#d9a98a"/><circle cx="27" cy="8" r="3.2" fill="#d9a98a"/>' +
      '<ellipse cx="0" cy="0" rx="13" ry="22" fill="#2f56a8"/><ellipse cx="1" cy="0" rx="9" ry="17" fill="url(#qsv)"/><path d="M-4 -12 L-4 12 M4 -10 L4 10" stroke="#d9ad3c" stroke-width="1.4" fill="none"/>' +
      '<ellipse cx="0" cy="-20" rx="8" ry="6.5" fill="url(#qsv)"/><ellipse cx="0" cy="20" rx="8" ry="6.5" fill="url(#qsv)"/><circle cx="-1" cy="-20" r="1.6" fill="#d9ad3c" stroke="none"/><circle cx="-1" cy="20" r="1.6" fill="#d9ad3c" stroke="none"/>' +
      '<ellipse cx="8.4" cy="0" rx="5.2" ry="6.4" fill="#d9a98a"/><path d="M12.4 -2.4 L15.4 0 L12.4 2.4Z" fill="#d9a98a" stroke-width="1.3"/>' +
      '<circle cx="-0.6" cy="0" r="9.8" fill="#e3c06a"/><path d="M3.6 -9 Q9.6 -7 9.8 -3.6 L8.4 -1.6 L9.8 0.6 L8.4 2.4 Q9.6 7 3.6 9Z" fill="#e3c06a" stroke="none"/>' +
      '<circle cx="-7.4" cy="0" r="4.6" fill="#d9b456" stroke-width="1.6"/><path d="M-4.4 -4 Q-2.6 0 -4.4 4" stroke="#2f56a8" stroke-width="2.4" fill="none"/>' +
      '<path d="M-5 -6 Q1 -9 5 -6" stroke="rgba(255,250,220,.6)" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M2 -1 Q6 -6 4 -9" stroke="#e3c06a" stroke-width="1.8" fill="none"/></g>';
  },
  weapon: function () {
    return '<defs>' + grad('qw', '#fbfdfe', '#a9b6bf') + grad('qh', '#f4d77a', '#a8781e') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' +
      '<rect x="-7" y="-2.8" width="16" height="5.6" rx="2" fill="url(#qh)"/><path d="M-7 -2.8 L9 2.8 M-7 2.8 L9 -2.8" stroke="#7a5414" stroke-width="1" fill="none"/><circle cx="-9" cy="0" r="4.6" fill="url(#qh)"/><circle cx="-9" cy="0" r="1.9" fill="#3a6ab8" stroke-width="1"/>' +
      '<path d="M12 -3.8 L58 -5 Q74 -3 84 0 Q74 3 58 5 L12 3.8Z" fill="url(#qw)"/><path d="M14 0 L72 0" stroke="#d9ad3c" stroke-width="2.2" fill="none"/><path d="M14 -1.2 L70 -1.4" stroke="#fff4c4" stroke-width="0.7" fill="none"/>' +
      '<path d="M9 -2 Q6 -9 10 -13 Q15 -9 14 -2Z M9 2 Q6 9 10 13 Q15 9 14 2Z" fill="url(#qh)"/><rect x="8.5" y="-4.5" width="5" height="9" rx="1.5" fill="url(#qh)"/><circle cx="11" cy="0" r="1.6" fill="#3a6ab8" stroke-width="1"/></g>';
  },
  wvb: '-16 -18 106 36', tdvb: '-50 -50 100 100'
};


/* =================== NEW ROSTER (myth and history based) =================== */
var SK = '#d9a98a';
function HB(id, o) {
  var cl = o.cloak ? '<path d="M-6 -' + (o.cw || 24) + ' Q-' + ((o.cl || 38)) + ' -20 -' + ((o.cl || 38) + 6) + ' 0 Q-' + ((o.cl || 38)) + ' 20 -6 ' + (o.cw || 24) + 'Z" fill="' + o.cloak + '"/><path d="M-6 -24 Q-24 -20 -34 -6 L-8 -4Z" ' + SH + '/>' : '';
  var hands = o.noHands ? '' : '<circle cx="27" cy="-8" r="3.2" fill="' + (o.skin || SK) + '"/><circle cx="27" cy="8" r="3.2" fill="' + (o.skin || SK) + '"/>';
  return '<defs>' + grad('g' + id, o.t1, o.t2) + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round">' + cl + (o.back || '') +
    '<path d="M4 -17 L26 -11 L26 -5 L2 -9Z" fill="' + o.arm + '"/><path d="M4 17 L26 11 L26 5 L2 9Z" fill="' + o.arm + '"/>' + hands +
    '<ellipse cx="0" cy="0" rx="13" ry="22" fill="' + o.t1 + '"/><ellipse cx="1" cy="0" rx="9" ry="17" fill="' + o.t2 + '"/>' + (o.torso || '') +
    '<ellipse cx="0" cy="-20" rx="' + (o.shw || 8) + '" ry="6.5" fill="' + o.sh + '"/><ellipse cx="0" cy="20" rx="' + (o.shw || 8) + '" ry="6.5" fill="' + o.sh + '"/>' +
    (o.over || '') + (o.mh ? mhead(o) : '<circle cx="2" cy="0" r="10" fill="' + o.hair + '"/>' + (o.noFace ? '' : '<ellipse cx="6" cy="0" rx="5" ry="7" fill="' + (o.skin || SK) + '" stroke="none"/><path d="M10 -3 L14 0 L10 3Z" fill="' + (o.skin || SK) + '" stroke-width="1.4"/>')) + (o.head || '') + '</g>';
}
// a master's head seen from above: mostly the crown of hair, the face only a crescent at the front, a fringe over the brow
function mhead(o) {
  var sk = o.skin || SK, hl = o.hl || 'rgba(255,255,255,.28)';
  var fr = o.fringe === 'none' ? '' : o.fringe || 'M4 -8.8 Q9.4 -6.6 9.6 -3.4 Q8.4 -1.6 9.8 0.4 Q8.6 2.6 9.4 4.6 Q8.6 7.4 4 8.8Z';
  return '<ellipse cx="8.4" cy="0" rx="5.2" ry="6.4" fill="' + sk + '"/><path d="M12.4 -2.4 L15.4 0 L12.4 2.4Z" fill="' + sk + '" stroke-width="1.3"/>' +
    '<circle cx="-0.6" cy="0" r="9.8" fill="' + o.hair + '"/>' + (fr ? '<path d="' + fr + '" fill="' + o.hair + '" stroke="none"/>' : '') +
    '<path d="M-6 -5.6 Q0 -9 5 -5.8" stroke="' + hl + '" stroke-width="2" fill="none" stroke-linecap="round"/>' + (o.strands || '');
}

function mkS(id, name, cls, col, basis, pal, notes, body, weapon, wvb) { return { id: id, name: name, cls: cls, col: col, basis: basis, pal: pal, notes: notes, body: body, weapon: weapon, wvb: wvb, tdvb: '-50 -50 100 100' }; }

var diarmuid = mkS('diarmuid', 'Diarmuid Ua Duibhne', 'Lancer', '#4fa860',
  'A warrior of the Fianna from Irish legend: a green armored tunic with a leather harness, a bronze torc, dark hair, and two spears, one with a red shaft and one with a yellow shaft.',
  [['Green armor', '#3f7a4a'], ['Leather', '#6b4a2c'], ['Hair', '#17120f'], ['Red spear', '#8a2a22'], ['Yellow spear', '#d9b23a']],
  ['Two shafts, red and yellow, are the whole identity: you can read which spear is which from above.', 'The bronze torc ring around his head is the one bright detail.', 'The second spear is shorter and held low, so the main spear sets his reach.'],
  function () { return HB('diarmuid', { cloak: '#24472b', cw: 22, cl: 28, t1: '#3f7a4a', t2: '#2f6038', torso: '<path d="M-8 -16 L9 16" stroke="#5a3a22" stroke-width="4" fill="none"/>', sh: '#2f6a3a', arm: '#3a7a46', hair: '#17120f', mh: true, fringe: 'M3.6 -9 Q9.4 -7.4 9.8 -4 Q8 -1 9.4 2 L11.6 4.6 L8.4 5.2 Q8.6 7.6 3.6 9Z', head: '<path d="M-3 -9.4 Q-12 0 -3 9.4" fill="none" stroke="#c9a24a" stroke-width="2.4"/>' }); },
  function () { return '<defs>' + grad('dsr', '#e6eef2', '#8c9eab') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-18" y="-2.4" width="118" height="4.8" rx="2" fill="#8a2a22"/><path d="M100 -6 L126 0 L100 6Z" fill="url(#dsr)"/><rect x="95" y="-3" width="5" height="6" fill="#c9a24a"/></g>'; },
  '-22 -8 150 16');
SPR_EXTRA.diarmuid_yellow = { wvb: '-18 -8 104 16', weapon: function () { return '<defs>' + grad('dsy', '#e6eef2', '#8c9eab') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-14" y="-2.2" width="76" height="4.4" rx="2" fill="#d9b23a"/><path d="M62 -3.8 L84 0 L62 3.8Z" fill="url(#dsy)"/><rect x="58" y="-2.8" width="4.6" height="5.6" fill="#c9a24a"/></g>'; } };

var cu = mkS('cu', 'Cú Chulainn', 'Lancer', '#3f86d9',
  'The hound of Ulster from Irish myth: a long braid of bright blue hair, red war paint on the face, a blue steel cuirass with pauldrons and vambraces, and the barbed spear Gáe Bulg.',
  [['Skin', '#c58d62'], ['Blue steel', '#2f6fb8'], ['Hair', '#3f8cf0'], ['War paint', '#9b2226'], ['Spear shaft', '#5a2020']],
  ['Blue steel armor makes him the only blue-armored fighter in the roster; the red war paint and red spear are the warm accents.', 'The long blue braid trails behind him, so facing reads cleanly.', 'The barbed head on Gáe Bulg is jagged, unlike any other spear here.'],
  function () { return HB('cu', { over: '<path d="M-6 -3.4 Q-22 -8 -38 -2.6 Q-27 0 -38 5.6 Q-22 6.4 -6 3.6Z" fill="#3f8cf0"/><path d="M-12 -1 Q-24 -2 -32 0" stroke="#2a64b8" stroke-width="1.2" fill="none"/>', mh: true, hl: 'rgba(220,240,255,.4)', fringe: 'M3.6 -9 L10.2 -6.6 L8.2 -4 L10.6 -1.4 L8.4 1.2 L10.6 3.8 L8.2 5.8 L9.8 8.2 L3.6 9Z', t1: '#2a5fa6', t2: '#4a8ad0', torso: '<path d="M-6 -12 L6 -4 M-6 -4 L6 4 M-6 4 L6 12" stroke="#cfe6ff" stroke-width="2.2" fill="none"/><path d="M-9 0 L9 0" stroke="#1c3f6e" stroke-width="1.4" fill="none"/>', sh: '#2f6fb8', shw: 9, arm: '#2f6fb8', hair: '#3f8cf0', skin: '#c58d62', head: '<path d="M10 -4.4 L13.4 -3.4 M10 4.4 L13.4 3.4" stroke="#9b2226" stroke-width="1.6" fill="none"/>' }); },
  function () { return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-18" y="-2.4" width="128" height="4.8" rx="2" fill="#5a2020"/><path d="M108 -4 L120 -10 L119 -3 L136 0 L119 3 L120 10 L108 4Z" fill="#a33a30"/><path d="M110 -2 L132 0 L110 2Z" fill="#cfd8de" stroke="none"/><rect x="100" y="-3.4" width="7" height="6.8" fill="#8a6a3a"/></g>'; },
  '-22 -14 162 28');

var gilgamesh = mkS('gilgamesh', 'Gilgamesh of Uruk', 'Archer', '#e8bf4a',
  'The king of Uruk from Mesopotamian myth: golden armor over a crimson cloak, golden hair under a crown of divine horns, and no weapon at all. He fights through golden gates that open in the air and fire blades.',
  [['Gold armor', '#d9a73a'], ['Gold plate', '#f2cc60'], ['Hair', '#f0c64a'], ['Crimson cloak', '#b3202a'], ['Gate light', '#ffd36b']],
  ['Gold armor and gold hair over a red cloak: the brightest silhouette in the roster.', 'The two horns on the crown are visible from straight above.', 'No weapon in his hands. Round golden gates open beside and behind him instead, and the blades come out of them.'],
  function () { return HB('gilgamesh', { cloak: '#b3202a', cw: 26, cl: 38, t1: '#d9a73a', t2: '#f2cf6a', torso: '<ellipse cx="0" cy="0" rx="12" ry="19" fill="none" stroke="#a8761f" stroke-width="3"/><path d="M-4 -9 L-4 9 M4 -9 L4 9" stroke="#a8761f" stroke-width="1.2" fill="none"/>', sh: '#f2cc60', shw: 9, arm: '#e0b04a', hair: '#f0c64a', mh: true, fringe: 'none', hl: 'rgba(255,250,220,.6)', strands: '<path d="M6 -7 L-6 -12 L-1 -6Z M7 0 L-9 -2 L-9 2Z M6 7 L-6 12 L-1 6Z" fill="#f0c64a" stroke-width="1.2"/>', head: '' }); },
  function () { return '<defs>' + grad('gsw', '#fff6d0', '#e0a830') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><ellipse cx="8" cy="0" rx="9" ry="22" fill="rgba(255,211,107,.35)" stroke="#f2c14e" stroke-width="3.5"/><ellipse cx="8" cy="0" rx="4.5" ry="13" fill="none" stroke="#ffe9a0" stroke-width="1.6"/><path d="M10 -3 L44 -3 L54 0 L44 3 L10 3Z" fill="url(#gsw)"/><path d="M12 0 L50 0" stroke="#b88a2a" stroke-width="1.2" fill="none"/></g>'; },
  '-6 -26 66 52');

var iskandar = mkS('iskandar', 'Iskandar of Macedon', 'Rider', '#c43d3d',
  'Alexander the Great of Macedon: a crimson cloak, a gold cuirass with gold pauldrons, curly red hair under a white diadem, and a leaf-bladed xiphos.',
  [['Crimson cloak', '#8a2230'], ['Gold armor', '#d9a73a'], ['Gold plate', '#f2cc60'], ['Hair', '#c2352c'], ['Diadem', '#e9e4d3']],
  ['The wide crimson cloak is the largest single shape in the roster, so he reads as the biggest from above, with the gold armor and red hair on top.', 'White diadem ring around the head marks him as king.', 'Short leaf-bladed xiphos: his weapon is modest, his army is not.'],
  function () { return HB('iskandar', { cloak: '#8a2230', cw: 28, cl: 42, t1: '#d9a73a', t2: '#f0c75a', torso: '<ellipse cx="1" cy="0" rx="7" ry="13" fill="#b8812a"/><path d="M-5 -9 L-5 9 M5 -9 L5 9" stroke="#8a5f1a" stroke-width="1.2" fill="none"/>', sh: '#f2cc60', shw: 9, arm: '#e0b04a', hair: '#c2352c', mh: true, fringe: 'M3.6 -9 Q8 -9 9.4 -6 Q8 -4 9.8 -2 Q8.4 0 9.8 2 Q8 4 9.4 6 Q8 9 3.6 9Z', head: '' }); },
  function () { return '<defs>' + grad('isw', '#f0d9a0', '#a8793a') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-7" y="-2.8" width="16" height="5.6" rx="2" fill="#5a3a22"/><circle cx="-9" cy="0" r="4.4" fill="#c7954a"/><path d="M12 -3 L36 -9 Q60 -7 74 0 Q60 7 36 9 L12 3Z" fill="url(#isw)"/><path d="M14 0 L68 0" stroke="#7a5a2a" stroke-width="1.3" fill="none"/><rect x="8.5" y="-9" width="5" height="18" rx="2" fill="#c7954a"/><circle cx="11" cy="0" r="1.8" fill="#c43d3d" stroke-width="1"/></g>'; },
  '-16 -14 96 28');

var gilles = mkS('gilles', 'Gilles de Rais', 'Caster', '#6fb3a0',
  'A French marshal of the fifteenth century: black robes over dark plate armor with small red accents, a closed barbute helm, and a grimoire, the spellbook of his Noble Phantasm, carried in one hand.',
  [['Black robe', '#16181d'], ['Dark steel', '#3a3f47'], ['Mantle', '#0e1014'], ['Red accent', '#b3202a'], ['Tome glow', '#6fb3a0']],
  ['Mostly black, with a thin red cross and a red visor slit as the only accents.', 'Closed helm: the face is never shown.', 'The tome glows teal in his hand and rises open when he casts his Noble Phantasm.'],
  function () { return HB('gilles', { cloak: '#0e1014', cw: 26, cl: 40, t1: '#16181d', t2: '#23262d', torso: '<path d="M0 -14 L0 14 M-8 0 L8 0" stroke="#b3202a" stroke-width="1.8" fill="none"/>', sh: '#3a3f47', shw: 8.5, arm: '#2a2e35', skin: '#2a2e35', hair: '#3a3f47', noFace: true, noHands: false, head: '<path d="M3 -5 L13 -5 L13 5 L3 5Z" fill="#0a0c10" stroke-width="1.4"/><path d="M5 0 L12 0" stroke="#d0303c" stroke-width="1.8" fill="none"/><path d="M-7 0 L2 0" stroke="#5a606a" stroke-width="2" fill="none"/>' }); },
  function () { return '<defs>' + grad('tmc', '#262a32', '#0d0f13') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="0" y="-13" width="32" height="26" rx="3" fill="url(#tmc)"/><rect x="30" y="-11.5" width="5" height="23" rx="1.5" fill="#d9d2bd"/><path d="M2 -13 L2 13" stroke="#b3202a" stroke-width="3" fill="none"/><path d="M0 -13 L7 -13 L0 -6Z M0 13 L7 13 L0 6Z" fill="#b3202a" stroke-width="1.2"/><circle cx="17" cy="0" r="7.5" fill="none" stroke="#6fe3c8" stroke-width="1.8"/><path d="M17 -7.5 L17 7.5 M9.5 0 L24.5 0 M12 -5 L22 5 M22 -5 L12 5" stroke="#6fe3c8" stroke-width="1.1" fill="none"/><circle cx="17" cy="0" r="2.2" fill="#b3fff0" stroke-width="1"/></g>'; },
  '-4 -17 42 34');

var richard = mkS('richard', 'Richard the Lionheart', 'Saber', '#d9563a',
  'Richard I of England, the Lionheart: polished silver plate, a red cape, a gold lion on the breastplate, and gold hair streaked with red under a thin gold circlet. His longsword has a red grip and a gold guard.',
  [['Silver plate', '#cdd6de'], ['Red cape', '#a8202a'], ['Hair', '#e3b548'], ['Red streaks', '#b8322a'], ['Lion', '#e0a830']],
  ['Bright silver armor with a red cape: the boldest red and silver silhouette in the roster.', 'Gold hair with red streaks, visible from straight above.', 'A gold lion sits on the breastplate, the sign of the Lionheart.'],
  function () { return HB('richard', { cloak: '#a8202a', cw: 27, cl: 42, back: '<path d="M-8 -6 Q-20 -10 -26 -2 Q-20 6 -8 6Z" fill="#b8322a"/><path d="M-10 -3 L-22 -2 M-10 2 L-21 3" stroke="#f2c14e" stroke-width="1.4" fill="none"/>', t1: '#cdd6de', t2: '#eef3f6', torso: '<circle cx="1" cy="0" r="6.5" fill="#e0a830"/><path d="M-3 -3 L4 0 L-3 3 M1 -6 L1 6" stroke="#8a5a1a" stroke-width="1.2" fill="none"/>', sh: '#b8c2cc', shw: 9, arm: '#aeb8c2', skin: '#e2b08e', hair: '#e3b548', mh: true, hl: 'rgba(255,245,210,.5)', head: '<path d="M-8 -3 Q-1 -4.6 6 -3 M-8 3.4 Q-2 2 4 3.6" stroke="#b8322a" stroke-width="1.6" fill="none"/>' }); },
  function () { return '<defs>' + grad('rsw', '#f6fafc', '#97a8b6') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-8" y="-2.8" width="18" height="5.6" rx="2" fill="#8e1f28"/><circle cx="-10" cy="0" r="4.6" fill="#f2c14e"/><path d="M13 -3.8 L76 -4.4 L90 0 L76 4.4 L13 3.8Z" fill="url(#rsw)"/><path d="M15 0 L84 0" stroke="#6a7c8a" stroke-width="1.4" fill="none"/><path d="M9 -12 Q12 -4 11 0 Q12 4 9 12 L14 12 Q16 4 15 0 Q16 -4 14 -12Z" fill="#f2c14e"/></g>'; },
  '-18 -14 112 28');

var emiya = mkS('emiya', 'EMIYA', 'Archer', '#c4423a',
  'A heroic spirit from the future: a red shroud and red sleeves over black body armor, white hair swept back, dark skin, and the twin married swords Kanshou (black) and Bakuya (white).',
  [['Red shroud', '#a8202a'], ['Black armor', '#1d1f24'], ['Hair', '#e8e6e0'], ['Kanshou', '#1c1c22'], ['Bakuya', '#eceae4']],
  ['A long red shroud over black armor: red and black from above, with white hair on top.', 'One black blade and one white blade, so his two hands read differently.', 'The black bow appears only while he charges Caladbolg.'],
  function () { return HB('emiya', { cloak: '#a8202a', cw: 27, cl: 44, over: '<path d="M-6 -5 Q-14 -10 -20 -5 Q-16 -2 -21 0 Q-16 2 -20 5 Q-14 10 -6 5Z" fill="#e8e6e0"/>', mh: true, fringe: 'none', hl: 'rgba(255,255,255,.6)', t1: '#1d1f24', t2: '#2c2f36', torso: '<path d="M-10 6 L10 6" stroke="#a8202a" stroke-width="3" fill="none"/><path d="M-4 -14 L-4 4 M4 -14 L4 4" stroke="#3a3d45" stroke-width="1.2" fill="none"/>', sh: '#2a2c33', shw: 9, arm: '#a8202a', skin: '#a8714c', hair: '#e8e6e0', head: '<path d="M-6 -8 L-12 -5 M-6 0 L-13 0 M-6 8 L-12 5" stroke="#bdbab2" stroke-width="1.6" fill="none"/>' }); },
  function () { return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-6" y="-2.6" width="12" height="5.2" rx="2" fill="#2a2c33"/><path d="M8 -6 L10 6 L12 6Z" fill="#7a1f2a"/><path d="M9 -3 Q30 -6 46 -13 Q54 -16 58 -11 Q50 -4 40 1 Q26 4 9 3Z" fill="#1c1c22"/><path d="M14 -1 Q30 -3 46 -9" stroke="#a8202a" stroke-width="1.4" fill="none"/><path d="M8 -7 L13 -7 L13 7 L8 7Z" fill="#7a1f2a"/></g>'; },
  '-10 -20 72 32');
SPR_EXTRA.emiya_white = { wvb: '-10 -20 72 32', weapon: function () { return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-6" y="-2.6" width="12" height="5.2" rx="2" fill="#2a2c33"/><path d="M9 -3 Q30 -6 46 -13 Q54 -16 58 -11 Q50 -4 40 1 Q26 4 9 3Z" fill="#eceae4"/><path d="M14 -1 Q30 -3 46 -9" stroke="#8c8f98" stroke-width="1.4" fill="none"/><path d="M8 -7 L13 -7 L13 7 L8 7Z" fill="#c9c6bc"/></g>'; } };
SPR_EXTRA.emiya_bow = { wvb: '-8 -40 30 80', weapon: function () { return '<g stroke="#0b121a" stroke-width="2.4" stroke-linejoin="round" fill="none"><path d="M0 -36 Q22 -18 22 0 Q22 18 0 36" stroke="#1c1c22" stroke-width="6"/><path d="M0 -36 Q22 -18 22 0 Q22 18 0 36" stroke="#5a5d66" stroke-width="2"/><path d="M0 -36 L0 36" stroke="#d8d4c8" stroke-width="1.2"/></g>'; } };

var rin = mkS('rin', 'Rin Tohsaka', 'Master', '#c23b46', 'Heir of the Tohsaka in her red coat, black twin tails.', [['Coat', '#b8363f'], ['Hair', '#1c1414']], [], function () { return HB('rin', { t1: '#b8363f', t2: '#c9424b', sh: '#9b2a32', arm: '#b8363f', hair: '#1c1414', skin: '#efd2bc', mh: true, over: '<path d="M-2 -9.6 Q-10 -15 -20 -14.6 Q-28 -14 -29 -10 Q-28 -6.4 -20 -6.6 Q-11 -6 -4 -4Z" fill="#1c1414"/><path d="M-2 9.6 Q-10 15 -20 14.6 Q-28 14 -29 10 Q-28 6.4 -20 6.6 Q-11 6 -4 4Z" fill="#1c1414"/><path d="M-9 -10.4 Q-17 -11 -25 -10.4 M-9 10.4 Q-17 11 -25 10.4" stroke="#3e3030" stroke-width="1.1" fill="none"/>', head: '<path d="M-3 -8.5 L-7 -13 L-1 -12.5Z M-3 8.5 L-7 13 L-1 12.5Z" fill="#2a2c34" stroke-width="1"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.6"><path d="M4 -6 L12 0 L4 6 L-4 0Z" fill="#e04a5a"/><path d="M4 -6 L4 6" stroke="#ffb0b8" stroke-width="1"/></g>'; }, '-6 -8 20 16');
var kiritsugu = mkS('kiritsugu', 'Kiritsugu Emiya', 'Master', '#6a7480', 'The Magus Killer in a black coat, with the Calico and the Contender.', [['Coat', '#22252b']], [], function () { return HB('kiritsugu', { cloak: '#22252b', cw: 22, cl: 30, t1: '#2c3036', t2: '#383d44', sh: '#22252b', arm: '#2c3036', hair: '#1c1612', skin: '#d9b496', mh: true, fringe: 'M3.6 -9 Q9.8 -7 9.6 -3.6 L8.4 -2.2 L9.8 -0.2 L8.4 1.6 L9.8 3.6 Q9.6 7.4 3.6 9Z', strands: '<path d="M-6 -4 L-11 -6 M-7 2 L-11.4 3.6 M-4 7 L-8 9.6" stroke="#1c1612" stroke-width="2.2" fill="none"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="2"><rect x="0" y="-3" width="10" height="7" rx="1.5" fill="#2a2c30"/><rect x="8" y="-3" width="20" height="5" rx="1" fill="#4a4d55"/><rect x="5" y="-8" width="18" height="4.5" rx="2.2" fill="#5a5d66" stroke-width="1.4"/></g>'; }, '-4 -10 36 18');
var shirou = mkS('shirou', 'Shirou Emiya', 'Master', '#d9783a', 'A fledgling in a white and blue raglan shirt, with spiky red-orange hair.', [['Shirt', '#e8e6e0'], ['Sleeves', '#3a5a9a'], ['Hair', '#c8602e']], [], function () { return HB('shirou', { t1: '#e8e6e0', t2: '#f2f0ea', sh: '#3a5a9a', arm: '#3a5a9a', hair: '#c8602e', skin: '#e8c4a6', mh: true, hl: 'rgba(255,220,180,.35)', fringe: 'M3 -9.4 L10.8 -6.4 L8.6 -4 L11.2 -1.2 L8.8 1 L11 3.8 L8.4 5.4 L10.2 8.4 L3 9.4Z', strands: '<path d="M-4 -9 L-9 -14 L-1 -10.6 Z M-8 -4 L-14 -6 L-9 -1.6Z M-8.6 2 L-14 5 L-7.6 5.6Z M-4 8.6 L-8 13.6 L0 10.2Z" fill="#c8602e" stroke-width="1.2"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.8"><rect x="-2" y="-2.5" width="9" height="5" rx="1.5" fill="#3a2a22"/><rect x="6" y="-5" width="3" height="10" fill="#5a5d66"/><path d="M9 -3 L36 -1.5 L40 0 L36 1.5 L9 3Z" fill="#c9d0d6"/></g>'; }, '-4 -7 46 14');
var kayneth = mkS('kayneth', 'Kayneth El-Melloi', 'Master', '#4f7ab8', 'A Lord of the Clock Tower in a blue robe, slicked blond hair, with a mercury orb at his side.', [['Robe', '#2f4f86'], ['Hair', '#d8c070']], [], function () { return HB('kayneth', { cloak: '#24406e', cw: 22, cl: 32, t1: '#2f4f86', t2: '#3a5f9a', sh: '#24406e', arm: '#2f4f86', hair: '#d8c070', skin: '#f0d6c2', mh: true, fringe: 'none', strands: '<path d="M8 -5 Q-2 -6 -9 -3 M8.6 0 Q-2 0 -10 0 M8 5 Q-2 6 -9 3" stroke="#b49a4e" stroke-width="1.2" fill="none"/>', back: '<circle cx="-14" cy="28" r="9" fill="#c9d0d8"/><circle cx="-16" cy="25" r="3" fill="#ffffff" stroke="none"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.6"><circle cx="8" cy="0" r="7" fill="#c9d0d8"/><circle cx="6" cy="-2.5" r="2.4" fill="#ffffff" stroke="none"/></g>'; }, '-2 -9 20 18');
var kirei = mkS('kirei', 'Kirei Kotomine', 'Master', '#7d5aa8', 'An Executor of the Church in a long black cassock with a cross pendant.', [['Cassock', '#1b1d22']], [], function () { return HB('kirei', { t1: '#1b1d22', t2: '#262931', torso: '<path d="M-2 -14 L-2 14 M2 -14 L2 14" stroke="#7d5aa8" stroke-width="1.8" fill="none"/><path d="M8 -3 L8 3 M5 0 L11 0" stroke="#d8c070" stroke-width="1.6"/>', sh: '#1b1d22', arm: '#1b1d22', hair: '#3a2a22', skin: '#d9b496', mh: true, fringe: 'M4 -8.8 Q9.4 -6 9.6 -2.6 Q9 0 9.6 2.6 Q9.4 6 4 8.8Z' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.5"><path d="M0 -4 L34 -6 M0 0 L36 0 M0 4 L34 6" stroke="#e6ecf2" stroke-width="2.4"/><rect x="-4" y="-6" width="6" height="12" fill="#2a2c30"/></g>'; }, '-6 -8 44 16');
var waver = mkS('waver', 'Waver Velvet', 'Master', '#a88a5a', 'A young student of the Clock Tower in a brown sweater, long black hair, clutching a book.', [['Sweater', '#6e5a3e'], ['Hair', '#1c1612']], [], function () { return HB('waver', { t1: '#6e5a3e', t2: '#7d6848', sh: '#5a4a32', arm: '#6e5a3e', hair: '#1c1612', skin: '#eed6c2', mh: true, over: '<path d="M2 -10 Q-8 -14 -16 -11 Q-21 -6 -20 0 Q-21 6 -16 11 Q-8 14 2 10Z" fill="#1c1612"/><path d="M-8 -9 Q-14 -6 -16 -2 M-8 9 Q-14 6 -16 2" stroke="#3a302a" stroke-width="1.2" fill="none"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.6"><rect x="0" y="-8" width="14" height="16" rx="2" fill="#6a3a2a"/><path d="M3 -8 L3 8" stroke="#d8c070" stroke-width="1"/></g>'; }, '-2 -10 18 20');
var irisviel = mkS('irisviel', 'Irisviel von Einzbern', 'Master', '#d8dde6', 'An Einzbern homunculus in a white coat with long silver hair and red eyes.', [['Coat', '#eef0f4'], ['Hair', '#e8ecf2']], [], function () { return HB('irisviel', { cloak: '#e3e6ec', cw: 22, cl: 30, t1: '#eef0f4', t2: '#f8f8fa', sh: '#d8dce4', arm: '#eef0f4', hair: '#e8ecf2', skin: '#f6e2d6', mh: true, hl: 'rgba(255,255,255,.7)', torso: '<path d="M-6 -14 Q2 0 -6 14" stroke="#8a5aa8" stroke-width="2.4" fill="none"/>', over: '<path d="M2 -10 Q-10 -15 -20 -12 Q-30 -8 -33 0 Q-30 8 -20 12 Q-10 15 2 10Z" fill="#e8ecf2"/><path d="M-6 -8 Q-18 -9 -28 -3 M-6 0 L-30 0 M-6 8 Q-18 9 -28 3" stroke="#b9c0cc" stroke-width="1.3" fill="none"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.4" fill="#e6eef3"><path d="M2 0 L12 -8 L10 -1 L22 0 L10 1 L12 8Z"/></g>'; }, '-2 -10 26 20');
var kariya = mkS('kariya', 'Kariya Matou', 'Master', '#5a4a6a', 'A Matou in a dark hoodie, white-haired and pale from the crest worms.', [['Hoodie', '#4a3f5a'], ['Hair', '#d8d8dc']], [], function () { return HB('kariya', { t1: '#4a3f5a', t2: '#56496a', sh: '#3d3450', arm: '#4a3f5a', hair: '#d8d8dc', skin: '#cfbdb4', mh: true, hl: 'rgba(255,255,255,.6)', fringe: 'M3.6 -9 L10 -6.6 L8.4 -4.2 L10.4 -1.6 L8.6 0.6 L10.4 3 L8.4 5 L9.6 8 L3.6 9Z', strands: '<path d="M-5 -7 L-10 -9.6 M-7 0 L-12 -0.6 M-5 7 L-10 9.4" stroke="#d8d8dc" stroke-width="2.4" fill="none"/>', back: '<path d="M-8 -12 Q-22 0 -8 12" fill="#3d3450"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.6" fill="none"><path d="M0 0 Q6 -6 12 0 T24 0" stroke="#5a3a6a" stroke-width="4"/><path d="M0 0 Q6 -6 12 0 T24 0" stroke="#8a6a9a" stroke-width="1.5"/></g>'; }, '-2 -8 30 16');

var lancelot = mkS('lancelot', 'Lancelot du Lac', 'Berserker', '#7d7fb5',
  'The betrayer knight of the Arthurian legends, driven mad: a closed great helm with a red slit and a dark plume, blackened plate, a black surcoat and cloak, and no weapon but his gauntleted fists.',
  [['Black plate', '#2a2c35'], ['Surcoat', '#1a1b21'], ['Cloak', '#0f1014'], ['Red slit', '#d0303c'], ['Gauntlet', '#1f2128']],
  ['Blackened plate and a black cloak make him the darkest figure in the roster; the red visor slit is the one accent.', 'A closed great helm hides the face completely: the only servant with a blank head.', 'He fights bare-fisted until Seize Arms puts a weapon in his hands.'],
  function () { return HB('lancelot', { cloak: '#0f1014', cw: 26, cl: 38, t1: '#1a1b21', t2: '#2a2c35', torso: '<path d="M-5 -14 L-5 14" stroke="#7a1f2a" stroke-width="2" fill="none"/>', sh: '#2e3039', shw: 9, arm: '#23252c', skin: '#1f2128', hair: '#2a2c35', noFace: true, head: '<path d="M4 -1.2 L13 -1.2 L13 1.2 L4 1.2Z" fill="#d0303c" stroke-width="1"/><path d="M-9 0 L11 0" stroke="#7a1f2a" stroke-width="3.4" fill="none"/>' }); },
  function () { return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="0" y="-9" width="20" height="18" rx="6" fill="#1f2128"/><path d="M14 -7 L14 7 M10 -7 L10 7" stroke="#7a1f2a" stroke-width="1.6" fill="none"/><rect x="-8" y="-6" width="9" height="12" rx="2" fill="#2a2c35"/></g>'; },
  '-10 -12 34 24');
SPR_EXTRA.lancelot_sword = { wvb: '-16 -14 100 28', weapon: function () { return '<defs>' + grad('lsw', '#e7edf2', '#7d8a98') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-7" y="-2.8" width="16" height="5.6" rx="2" fill="#2a2c35"/><circle cx="-9" cy="0" r="4.4" fill="#4a4d58"/><path d="M12 -3.4 L70 -4.2 L84 0 L70 4.2 L12 3.4Z" fill="url(#lsw)"/><path d="M14 0 L78 0" stroke="#5f6b78" stroke-width="1.4" fill="none"/><rect x="8.5" y="-10" width="5" height="20" rx="2.5" fill="#4a4d58"/></g>'; } };
SPR_EXTRA.lancelot_spear = { wvb: '-22 -10 156 20', weapon: function () { return '<defs>' + grad('lsp2', '#e7edf2', '#7d8a98') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-18" y="-2.4" width="120" height="4.8" rx="2" fill="#4a3426"/><path d="M100 -6 L130 0 L100 6Z" fill="url(#lsp2)"/><rect x="95" y="-3.4" width="6" height="6.8" fill="#4a4d58"/></g>'; } };
SPR_EXTRA.lancelot_hammer = { wvb: '-10 -16 96 32', weapon: function () { return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-8" y="-3" width="66" height="6" rx="2.5" fill="#5a3a22"/><rect x="56" y="-14" width="22" height="28" rx="3" fill="#6b717c"/><rect x="56" y="-14" width="7" height="28" rx="2" fill="#4a4f59"/><path d="M78 -6 L86 0 L78 6Z" fill="#8a909a"/></g>'; } };
SPR_EXTRA.lancelot_gun = { wvb: '-6 -14 84 28', weapon: function () { return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="0" y="-9" width="22" height="18" rx="3" fill="#3a3d46"/><rect x="2" y="9" width="14" height="8" rx="2" fill="#5a4a2a"/><rect x="22" y="-7" width="46" height="4" rx="1.5" fill="#6b717c"/><rect x="22" y="-2" width="46" height="4" rx="1.5" fill="#7d838e"/><rect x="22" y="3" width="46" height="4" rx="1.5" fill="#6b717c"/><rect x="62" y="-9" width="6" height="18" rx="2" fill="#4a4f59"/><rect x="8" y="-5" width="8" height="10" rx="1.5" fill="#d9a73a" stroke-width="1.2"/></g>'; } };

var medusa = mkS('medusa', 'Medusa', 'Rider', '#d96bb8',
  'The gorgon of Greek myth in human form: long flowing pink hair, a plain sleeveless purple dress with bare shoulders, and a spiked steel rondel dagger on a long chain.',
  [['Skin', '#e8c4ae'], ['Pink hair', '#e86fae'], ['Purple dress', '#5b2e8c'], ['Dark trim', '#3a1d5c'], ['Steel chain', '#aeb7c2']],
  ['Very long pink hair streams behind her and shows which way she faces.', 'A plain purple dress with almost no adornment; the bright pink hair and bare shoulders carry her look.', 'The rondel swings out on a chain, so her reach reads as a loop around her.'],
  function () { return HB('medusa', { mh: true, hl: 'rgba(255,220,240,.45)', fringe: 'M3.6 -9 Q9.6 -7 9.8 -3 Q9 0 9.8 3 Q9.6 7 3.6 9Z', over: '<path d="M-6 -9 Q-26 -18 -46 -10 Q-58 -4 -70 6 Q-52 8 -44 3 Q-58 12 -66 24 Q-40 20 -28 9 Q-18 5 -6 9Z" fill="#e86fae"/><path d="M-12 -4 Q-34 -8 -56 -1 M-12 3 Q-34 4 -58 12" stroke="#b94d8b" stroke-width="1.6" fill="none"/>', t1: '#5b2e8c', t2: '#7a46b0', torso: '<path d="M-6 -13 L-6 13" stroke="#3a1d5c" stroke-width="1.4" fill="none"/>', sh: '#e8c4ae', arm: '#e8c4ae', skin: '#e8c4ae', hair: '#e86fae', head: '<path d="M-6 -8 Q2 -12 8 -7 M-6 8 Q2 12 8 7" stroke="#b94d8b" stroke-width="1.6" fill="none"/>' }); },
  function () { return '<defs>' + grad('mdw', '#f4f7fa', '#9aa6b2') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><path d="M-8 0 Q-16 9 -24 0 Q-32 -9 -40 0" fill="none" stroke="#aeb7c2" stroke-width="3" stroke-dasharray="4 3"/><circle cx="0" cy="0" r="5.2" fill="#8c95a0"/><rect x="4" y="-2.6" width="12" height="5.2" rx="2" fill="#5b2e8c"/><circle cx="19" cy="0" r="7" fill="#8c95a0"/><path d="M24 -3 L62 0 L24 3Z" fill="url(#mdw)"/><path d="M26 0 L56 0" stroke="#6a7682" stroke-width="1.1" fill="none"/></g>'; },
  '-42 -10 106 20');

var medea = mkS('medea', 'Medea of Colchis', 'Caster', '#7fc4ee',
  'The Colchian sorceress of Greek myth, priestess of Hecate: a long black robe, light blue hair under a dark veil, a silver crescent headdress, and a slender staff topped with a moon.',
  [['Robe', '#1b1b24'], ['Veil', '#0b0b10'], ['Hair', '#9fd4f2'], ['Moon silver', '#cfd8de'], ['Gem', '#7fc4ee']],
  ['A black robe and veil, with pale blue hair and a silver crescent as the only bright details.', 'The crescent headdress is an arc visible from above, the mark of Hecate.', 'Slender staff with a moon at the tip: the lightest weapon silhouette.'],
  function () { return HB('medea', { cloak: '#14141b', cw: 28, cl: 44, back: '<path d="M-8 -12 Q-30 -10 -34 0 Q-30 10 -8 12Z" fill="#0b0b10"/><path d="M-8 -3 Q-24 -6 -38 0 Q-24 6 -8 3Z" fill="#9fd4f2"/>', t1: '#1b1b24', t2: '#2c2c3a', torso: '<path d="M-9 4 L9 4" stroke="#cfd8de" stroke-width="2.4" fill="none"/>', sh: '#0b0b10', arm: '#1b1b24', hair: '#9fd4f2', mh: true, hl: 'rgba(255,255,255,.5)', head: '<path d="M-2 -11 Q11 0 -2 11" stroke="#cfd8de" stroke-width="3.2" fill="none"/>' }); },
  function () { return '<g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-12" y="-2" width="104" height="4" rx="1.8" fill="#8a6a44"/><path d="M90 -15 Q114 0 90 15 Q103 0 90 -15Z" fill="#cfd8de"/><circle cx="92" cy="0" r="4" fill="#7fc4ee"/></g>'; },
  '-14 -18 130 36');

var kojirou = mkS('kojirou', 'Sasaki Kojirou', 'Assassin', '#e9b8cc',
  'The swordsman Sasaki Kojirou of sixteenth-century Japan: a pale pink, almost white kimono and haori, blue hair in a topknot, and an extraordinarily long nodachi.',
  [['Kimono', '#fbf1f4'], ['Haori', '#f6e8ee'], ['Hair', '#3b6fd4'], ['Blade', '#e6eef2'], ['Hilt wrap', '#2b2f3a']],
  ['Near-white pink armor with blue hair: the palest figure in the roster.', 'The blue topknot at the back of the head shows which way he faces.', 'The longest weapon in the roster, thin and straight.'],
  function () { return HB('kojirou', { cloak: '#f6e8ee', cw: 24, cl: 34, mh: true, fringe: 'M3.6 -9 Q9.6 -6.6 9.8 -3 L8.6 -1 L9.8 1 L8.6 3 Q9.6 6.6 3.6 9Z', over: '<path d="M-6 -4 Q-20 -6 -26 -2 Q-20 0 -26 2 Q-20 6 -6 4Z" fill="#3b6fd4"/>', strands: '<circle cx="-7.6" cy="0" r="3.4" fill="#2a58b4" stroke-width="1.4"/><path d="M-4.6 -2.6 L-4.6 2.6" stroke="#f1dde5" stroke-width="1.6"/>', t1: '#fbf1f4', t2: '#f1dde5', torso: '<path d="M-3 -14 L3 14" stroke="#c9a9b6" stroke-width="1.6" fill="none"/>', sh: '#f3e2e9', shw: 9, arm: '#efd9e1', hair: '#3b6fd4', head: '' }); },
  function () { return '<defs>' + grad('ksw', '#f4f8fa', '#aab9c2') + '</defs><g stroke="#0b121a" stroke-width="2" stroke-linejoin="round"><rect x="-14" y="-2.6" width="38" height="5.2" rx="2" fill="#2b2f3a"/><path d="M-10 -2.6 L-6 2.6 M-2 -2.6 L2 2.6 M6 -2.6 L10 2.6 M14 -2.6 L18 2.6" stroke="#8a8f98" stroke-width="1" fill="none"/><circle cx="26" cy="0" r="6" fill="#8a8f98"/><path d="M30 -2.2 L140 -2.8 Q152 -2.8 158 0 L140 2.4 L30 2.2Z" fill="url(#ksw)"/><path d="M32 0 L150 0" stroke="#7d909b" stroke-width="1.1" fill="none"/></g>'; },
  '-18 -10 182 20');

var illya = mkS('illya', 'Illyasviel von Einzbern', 'Master', '#c9b8e0', 'A small girl in a purple winter coat and white hat, long silver hair, red eyes.', [['Coat', '#6e4f8e'], ['Hair', '#eef0f6']], [], function () { return HB('illya', { t1: '#6e4f8e', t2: '#7d5ea0', sh: '#5a3e78', arm: '#6e4f8e', hair: '#eef0f6', skin: '#f8e6dc', shw: 7, mh: true, hl: 'rgba(255,255,255,.7)', over: '<path d="M2 -10 Q-10 -16 -22 -13 Q-32 -8 -34 0 Q-32 8 -22 13 Q-10 16 2 10Z" fill="#eef0f6"/><path d="M-6 -8 Q-18 -10 -29 -4 M-6 0 L-31 0 M-6 8 Q-18 10 -29 4" stroke="#c4c6d4" stroke-width="1.3" fill="none"/>', head: '<circle cx="-0.5" cy="0" r="7.4" fill="#f4f2f8" stroke-width="1.4"/><path d="M-4 -5 Q-1 -7 3 -5" stroke="#d8d4e4" stroke-width="1.4" fill="none"/><circle cx="-7.4" cy="0" r="3.2" fill="#6e4f8e" stroke-width="1"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.4" fill="#f4f6fa"><path d="M2 0 L12 -8 L10 -1 L22 0 L10 1 L12 8Z"/><circle cx="16" cy="0" r="1.6" fill="#c43d3d" stroke="none"/></g>'; }, '-2 -10 26 20');
var sakura = mkS('sakura', 'Sakura Matou', 'Master', '#7a4a8a', 'The Matou heir in a black dress traced with red lines, long purple hair with a red ribbon.', [['Dress', '#1e1626'], ['Lines', '#b3202a'], ['Hair', '#5a3a7a']], [], function () { return HB('sakura', { t1: '#1e1626', t2: '#2a1e34', sh: '#1a1220', arm: '#1e1626', hair: '#5a3a7a', skin: '#f0dcd2', mh: true, hl: 'rgba(220,190,255,.35)', torso: '<path d="M-8 -12 Q0 -4 -8 4 M-6 6 Q2 12 -6 16 M4 -14 Q8 0 4 14" stroke="#b3202a" stroke-width="1.6" fill="none"/>', over: '<path d="M2 -10 Q-10 -15 -20 -12 Q-30 -8 -32 0 Q-30 8 -20 12 Q-10 15 2 10Z" fill="#5a3a7a"/><path d="M-6 -8 Q-17 -9 -27 -3 M-6 0 L-29 0 M-6 8 Q-17 9 -27 3" stroke="#3e2856" stroke-width="1.3" fill="none"/>', head: '<path d="M-2 -9.4 L-6.4 -13 L-6 -8 Z" fill="#c43d3d" stroke-width="1"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.4"><circle cx="8" cy="0" r="7" fill="#1a1020"/><circle cx="8" cy="0" r="7" fill="none" stroke="#b3202a" stroke-width="1.4"/><circle cx="8" cy="0" r="2.4" fill="#b3202a" stroke="none"/></g>'; }, '-2 -9 20 18');
var tokiomi = mkS('tokiomi', 'Tokiomi Tohsaka', 'Master', '#b8333c', 'Head of the Tohsaka in a deep red suit with a white cravat, brown hair swept back, a cane topped with a great ruby.', [['Suit', '#8a1e2a'], ['Cravat', '#f2ece0'], ['Hair', '#4a2e22']], [], function () { return HB('tokiomi', { t1: '#8a1e2a', t2: '#9c2834', sh: '#6e1620', arm: '#8a1e2a', hair: '#4a2e22', skin: '#e8c8b0', mh: true, fringe: 'none', hl: 'rgba(255,220,190,.3)', torso: '<path d="M6 -5 L12 0 L6 5 Z" fill="#f2ece0" stroke="#0b121a" stroke-width="1"/><path d="M-4 -13 L-4 13" stroke="#c9a24a" stroke-width="1.2"/>', strands: '<path d="M-8 -6 Q-2 -7.5 4 -6 M-8 0 L5 0 M-8 6 Q-2 7.5 4 6" stroke="#2e1c14" stroke-width="1.1" fill="none"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.4"><path d="M-4 0 L30 0" stroke="#2a1a14" stroke-width="3"/><path d="M27 -2 L31 -2 L31 2 L27 2Z" fill="#c9a24a"/><path d="M31 0 L36 -5 L41 0 L36 5Z" fill="#e0243a"/><path d="M34 -2 L37 -3" stroke="#ffb0b8" stroke-width="1"/></g>'; }, '-6 -8 50 16');
var kuzuki = mkS('kuzuki', 'Souichirou Kuzuki', 'Master', '#5b6b7c', 'A quiet teacher in a dark grey suit and tie, short black hair and thin glasses. He fights bare-handed.', [['Suit', '#2e343c'], ['Tie', '#5b6b7c'], ['Hair', '#141416']], [], function () { return HB('kuzuki', { t1: '#2e343c', t2: '#3a414a', sh: '#262b32', arm: '#2e343c', hair: '#141416', skin: '#e0c4a8', mh: true, fringe: 'M4 -8.8 Q8.6 -6.8 9.2 -3.4 Q8.6 0 9.2 3.4 Q8.6 6.8 4 8.8Z', torso: '<path d="M6 -2 L13 0 L6 2 Z" fill="#5b6b7c" stroke="#0b121a" stroke-width=".8"/><path d="M2 -10 L8 -3 M2 10 L8 3" stroke="#e6e8ea" stroke-width="1.4"/>', strands: '<path d="M11.2 -4.8 L13.6 -4.8 L13.6 -1.4 L11.2 -1.4Z M11.2 1.4 L13.6 1.4 L13.6 4.8 L11.2 4.8Z" fill="rgba(200,225,245,.55)" stroke="#101214" stroke-width=".7"/><path d="M12.4 -1.4 L12.4 1.4" stroke="#101214" stroke-width=".7"/>' }); }, function () { return '<g stroke="#0b121a" stroke-width="1.4"><circle cx="4" cy="0" r="5" fill="#e0c4a8"/></g>'; }, '-2 -6 12 12');
return { tokiomi: tokiomi, kuzuki: kuzuki, illya: illya, sakura: sakura, rin: rin, kiritsugu: kiritsugu, shirou: shirou, kayneth: kayneth, kirei: kirei, waver: waver, irisviel: irisviel, kariya: kariya, richard: richard, emiya: emiya, cid: cid, leonidas: leonidas, atalanta: atalanta, heracles: heracles, hassan: hassan, caerwyn: caerwyn, diarmuid: diarmuid, cu: cu, gilgamesh: gilgamesh, iskandar: iskandar, gilles: gilles, lancelot: lancelot, medusa: medusa, medea: medea, kojirou: kojirou };
})();

var GRIP = { tokiomi: { x: 22, y: 9, k: 1 }, kuzuki: { x: 22, y: 8, k: 1 }, illya: { x: 26, y: 8, k: 0.9 }, sakura: { x: 26, y: 8, k: 0.8 }, rin: { x: 26, y: 8, k: 0.8 }, kiritsugu: { x: 22, y: 8, k: 1 }, shirou: { x: 22, y: 8, k: 1 }, kayneth: { x: 26, y: 8, k: 0.8 }, kirei: { x: 20, y: 8, k: 1 }, waver: { x: 24, y: 8, k: 0.9 }, irisviel: { x: 26, y: 8, k: 0.9 }, kariya: { x: 26, y: 8, k: 0.9 }, richard: { x: 22, y: 9, k: 1.2 }, emiya: { x: 22, y: 10, k: 1.25, twin: true }, emiya_bow: { x: 22, y: 0, k: 1.0 }, cid: { x: 22, y: 9, k: 1.2 }, leonidas: { x: 24, y: 10, k: 1 }, atalanta: { x: 20, y: 0, k: 1.1 }, heracles: { x: 26, y: 16, k: 1.55 }, hassan: { x: 24, y: 9, k: 1.4 }, caerwyn: { x: 22, y: 9, k: 1.2 }, diarmuid: { x: 20, y: 9, k: 1, pair: 'diarmuid_yellow' }, cu: { x: 20, y: 9, k: 0.95 }, gilgamesh: { x: 26, y: -10, k: 0.9 }, iskandar: { x: 22, y: 9, k: 1.2 }, gilles: { x: 22, y: 7, k: 1.05 }, lancelot: { x: 28, y: 0, k: 1.1 }, lancelot_sword: { x: 22, y: 9, k: 1.15 }, lancelot_spear: { x: 24, y: 10, k: 1.0 }, lancelot_hammer: { x: 24, y: 12, k: 1.15 }, lancelot_gun: { x: 14, y: 2, k: 1.0 }, medusa: { x: 20, y: 9, k: 1.0 }, medea: { x: 18, y: 10, k: 1.0 }, kojirou: { x: 20, y: 9, k: 1.0 } };
var THUMBN = 0;
function thumb(id, w) {
  var s = SPR[id], g = GRIP[id], wp = s.weapon(), inner = s.body();
  if (g.twin) inner += '<g transform="translate(' + g.x + ',' + (-g.y) + ') scale(' + g.k + ',' + (-g.k) + ')">' + (SPR_EXTRA[id + '_white'] ? SPR_EXTRA[id + '_white'].weapon() : wp) + '</g><g transform="translate(' + g.x + ',' + g.y + ') scale(' + g.k + ')">' + wp + '</g>';
  else if (g.pair) inner += '<g transform="translate(' + g.x + ',' + (-g.y) + ') scale(' + g.k + ')">' + SPR_EXTRA[g.pair].weapon() + '</g><g transform="translate(' + g.x + ',' + g.y + ') scale(' + g.k + ')">' + wp + '</g>';
  else inner += '<g transform="translate(' + g.x + ',' + g.y + ') scale(' + g.k + ')">' + wp + '</g>';
  // every inline copy gets its own gradient ids: a copy inside a hidden panel would otherwise blank out the others
  var u = '_t' + (++THUMBN); inner = inner.replace(/id="([^"]+)"/g, 'id="$1' + u + '"').replace(/url\(#([^)]+)\)/g, 'url(#$1' + u + ')');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (s.cls === 'Master' ? '-50 -32 128 64' : '-48 -50 200 100') + '" width="' + w + '" height="' + (w / 2) + '">' + inner + '</svg>';
}
var IMG = {};
function mkImg(markup, vb) {
  var p = vb.split(' ').map(Number);
  var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="' + (p[2] * 2) + '" height="' + (p[3] * 2) + '">' + markup + '</svg>';
  var im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  return { im: im, x: p[0], y: p[1], w: p[2], h: p[3] };
}
ORDER.concat(MASTER_ORDER).forEach(function (id) { var s = SPR[id]; IMG[id] = { body: mkImg(s.body(), s.tdvb), weapon: mkImg(s.weapon(), s.wvb) }; });
Object.keys(SPR_EXTRA).forEach(function (id) { var s = SPR_EXTRA[id]; IMG[id] = { weapon: mkImg(s.weapon(), s.wvb) }; });

