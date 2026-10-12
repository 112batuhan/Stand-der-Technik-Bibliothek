/* SdT Navigator – Single-Page-App ohne Abhängigkeiten.
 * Daten: window.SDT_DATA (erzeugt von build.py). Routing über location.hash. */
(function () {
  'use strict';

  const D = window.SDT_DATA;
  const $main = document.getElementById('main');
  if (!D) {
    $main.innerHTML = '<div class="empty"><h2>Keine Daten gefunden</h2><p>Bitte zuerst <code>python website/build.py</code> ausführen.</p></div>';
    return;
  }

  // ------------------------------------------------------------ Grunddaten
  const R = D.reqs;
  const ORDER = D.order;
  const V = D.vocab;
  const PR = {};
  D.practices.forEach((p, i) => { PR[p.id] = p; p.idx = i; });
  const TP = D.topics;
  const COLL = {};
  D.collections.forEach(c => { COLL[c.key] = c; });
  const MAP = {};
  D.mappings.forEach(m => { MAP[m.key] = m; });
  const IMPL = {};
  D.impls.forEach(i => { IMPL[i.key] = i; });

  const SRC_LABEL = {
    kernel: 'Stand-der-Technik-Kernel',
    methodik: 'Methodik Grundschutz++',
    risiko: 'Anforderungen Risikomanagement',
    tls: 'Entwurf Mindeststandard TLS',
    other: 'Sonstige'
  };
  const SL_LABEL = { 'normal-SdT': 'Normal (Stand der Technik)', 'erhöht': 'Erhöhter Schutzbedarf' };
  const EFFORT_LABEL = {
    '0': 'Zwingend (nicht bewertet)',
    '1': 'Quick Win (am selben Tag)',
    '2': 'Gering (ca. eine Woche)',
    '3': 'Mittel (Wochen bis Monate)',
    '4': 'Hoch (längerfristig)',
    '5': 'Sehr hoch (komplex)'
  };
  const GOALS = [
    { k: 'c', t: 'Vertraulichkeit' },
    { k: 'i', t: 'Integrität' },
    { k: 'a', t: 'Verfügbarkeit' },
    { k: 'au', t: 'Authentizität' }
  ];
  const GOAL_LEVEL = { '0': 'kaum', '1': 'wirkt', '2': 'im Fokus' };
  const REL = {
    'equivalent-to': { s: '≡', l: 'gleichwertig', d: 'Quelle und Ziel sind inhaltlich gleichwertig.' },
    'equal-to': { s: '=', l: 'identisch', d: 'Quelle und Ziel sind identisch.' },
    'subset-of': { s: '⊂', l: 'Teilmenge', d: 'Die Quell-Anforderung ist vollständig in den Ziel-Anforderungen enthalten. Wer die Ziele erfüllt, deckt die Quelle ab.' },
    'superset-of': { s: '⊃', l: 'Obermenge', d: 'Die Quell-Anforderung geht über die Ziel-Anforderungen hinaus. Die Ziele decken sie nur teilweise ab.' },
    'intersects-with': { s: '∩', l: 'Überschneidung', d: 'Quelle und Ziel überschneiden sich teilweise.' }
  };
  const ITGS_LAYERS = {
    ISMS: 'Sicherheitsmanagement', ORP: 'Organisation und Personal', CON: 'Konzepte und Vorgehensweisen',
    OPS: 'Betrieb', DER: 'Detektion und Reaktion', APP: 'Anwendungen', SYS: 'IT-Systeme',
    IND: 'Industrielle IT', NET: 'Netze und Kommunikation', INF: 'Infrastruktur'
  };
  const ISO_THEMES = { '5': 'Organisatorische Maßnahmen', '6': 'Personenbezogene Maßnahmen', '7': 'Physische Maßnahmen', '8': 'Technologische Maßnahmen' };
  const PRACTICE_GROUPS = [
    { k: 'Methodik', t: 'ISMS-Methodik', d: 'Das Managementsystem aufbauen, steuern und verbessern.' },
    { k: 'Organisatorisch', t: 'Organisatorisch', d: 'Regelungen für Assets, Personal, Beschaffung, Gebäude und Notfälle.' },
    { k: 'Technisch', t: 'Technisch', d: 'Netze, Berechtigungen, Konfiguration, Detektion und Entwicklung.' }
  ];

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4 1v-7.5z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    arrows: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
    tool: '<path d="M14.5 5.5a4 4 0 0 0 5 5L12 18l-3 3-3-3 3-3 7.5-7.5"/><path d="M14.5 5.5L17 3"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    tree: '<path d="M5 4v16M5 8h6M5 14h6M11 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0M11 14a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/>',
    rel: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.5-3.8M8.2 13l7.5 3.8"/>',
    req: '<path d="M9 6l-5 6 5 6M15 6l5 6-5 6"/>',
    zap: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.5M4 12h.5M4 18h.5"/>'
  };

  // --------------------------------------------------------------- Helfer
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
  const fmtN = n => Number(n).toLocaleString('de-DE');
  const icon = (n, cls) => `<svg class="icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const fmtDate = iso => {
    const d = new Date(iso);
    return isNaN(d) ? String(iso || '') : d.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const plural = (n, one, many) => `${fmtN(n)} ${n === 1 ? one : many}`;
  const byId = id => R[id];
  const uniq = a => Array.from(new Set(a));
  function cmpId(a, b) {
    const pa = a.split('.'), pb = b.split('.');
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      if (pa[i] === undefined) return -1;
      if (pb[i] === undefined) return 1;
      const na = parseInt(pa[i], 10), nb = parseInt(pb[i], 10);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      if (isNaN(na) || isNaN(nb)) { const c = pa[i].localeCompare(pb[i]); if (c) return c; }
    }
    return 0;
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, 1900);
  }
  async function copyText(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg || 'Kopiert'); }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(msg || 'Kopiert'); } catch (e2) { toast('Kopieren nicht möglich'); }
      ta.remove();
    }
  }
  function download(name, text, type) {
    const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignorieren */ } }
  };

  // -------------------------------------------------------- Abgeleitete Daten
  ORDER.forEach(id => {
    const r = R[id];
    let d = 0, p = r.par;
    while (p && R[p]) { d++; p = R[p].par; }
    r._depth = d;
    r._cols = [];
  });
  D.collections.forEach(c => {
    Object.keys(c.members).forEach(id => { if (R[id]) R[id]._cols.push(c.key); });
  });
  ORDER.forEach((id, i) => {
    const r = R[id];
    r._i = i;
    r._nid = norm(id);
    r._nt = norm(r.t);
    r._ns = norm(r.s);
    r._ng = norm(r.g);
    const extra = [].concat(
      r.tags || [], r.to || [], r.doc || [], r.a || [],
      (r.thr || []).map(t => (V.threats[t] ? V.threats[t].t : '')),
      PR[r.pr] ? PR[r.pr].t : '', r.tp && TP[r.tp] ? TP[r.tp].t : '',
      r.tax || [],
      r._cols.map(k => (COLL[k].members[id] || {}).label || '')
    );
    r._nx = norm(extra.join(' | '));
  });

  D.practices.forEach(p => { p._n = 0; });
  ORDER.forEach(id => { if (PR[R[id].pr]) PR[R[id].pr]._n++; });

  // Zählwerte für Vokabulare
  const COUNT = { to: {}, doc: {}, tags: {}, thr: {}, a: {}, m: {}, e: {} };
  ORDER.forEach(id => {
    const r = R[id];
    ['to', 'doc', 'tags', 'thr'].forEach(k => (r[k] || []).forEach(v => { COUNT[k][v] = (COUNT[k][v] || 0) + 1; }));
    ['a', 'm', 'e'].forEach(k => { if (r[k] != null) COUNT[k][r[k]] = (COUNT[k][r[k]] || 0) + 1; });
  });

  // ITGS-Struktur
  function parseItgs(id) {
    const m = id.match(/^(.+?)\.(A\d+)(?:-UA\.(\d+))?$/);
    if (!m) return { bst: id, anf: '', ua: '', layer: id.split('.')[0] };
    return { bst: m[1], anf: m[2], ua: m[3] || '', layer: m[1].split('.')[0] };
  }
  const ITGS_ROWS = {};
  if (MAP.itgs) MAP.itgs.rows.forEach(row => { ITGS_ROWS[row.id] = row; row._p = parseItgs(row.id); });
  const ISO_ROWS = {};
  if (MAP.iso) MAP.iso.rows.forEach(row => { ISO_ROWS[row.id] = row; });

  // ------------------------------------------------------------ Merkliste
  let bookmarks = store.get('sdt-bookmarks', []).filter(id => R[id]);
  function isBm(id) { return bookmarks.indexOf(id) >= 0; }
  function toggleBm(id) {
    if (isBm(id)) bookmarks = bookmarks.filter(x => x !== id);
    else bookmarks.push(id);
    store.set('sdt-bookmarks', bookmarks);
    updateBmCount();
    document.querySelectorAll(`[data-bm="${CSS.escape(id)}"]`).forEach(b => {
      b.classList.toggle('on', isBm(id));
      b.setAttribute('aria-pressed', isBm(id));
      if (b.dataset.label) b.querySelector('span').textContent = isBm(id) ? 'Gemerkt' : 'Merken';
    });
    toast(isBm(id) ? `${id} zur Merkliste hinzugefügt` : `${id} von der Merkliste entfernt`);
  }
  function updateBmCount() {
    const el = document.getElementById('bmCount');
    el.textContent = bookmarks.length;
    el.hidden = !bookmarks.length;
  }

  // ----------------------------------------------------- Text & Hervorhebung
  function tokenize(q) { return norm(q).split(/[\s,;]+/).filter(t => t.length > 0); }
  function buildHlRe(tokens) {
    if (!tokens || !tokens.length) return null;
    const map = { a: '[aàáâäå]', o: '[oòóôöø]', u: '[uùúûü]', e: '[eèéêë]', i: '[iìíîï]', c: '[cç]', n: '[nñ]' };
    const parts = tokens.filter(t => t.length > 1 || tokens.length === 1)
      .sort((a, b) => b.length - a.length)
      .map(t => t.split('').map(ch => map[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('').replace(/ss/g, '(?:ss|ß)'));
    if (!parts.length) return null;
    try { return new RegExp('(' + parts.join('|') + ')', 'gi'); } catch (e) { return null; }
  }
  function hl(text, re) {
    text = String(text || '');
    if (!re) return esc(text);
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      if (!m[0]) { re.lastIndex++; continue; }
      out += esc(text.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>';
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }
  const KW_RE = /\b(MUSS|MÜSSEN|SOLLTE|SOLLTEN|KANN|KÖNNEN|DARF|DÜRFEN)\b/;
  function kwClass(w) { return /^M/.test(w) || /^D/.test(w) ? 'MUSS' : /^S/.test(w) ? 'SOLLTE' : 'KANN'; }
  function rich(text, re) {
    return String(text || '').split(/(\{\{[^}]*\}\})/).map(part => {
      const m = part.match(/^\{\{([^}]*)\}\}$/);
      if (m) {
        const eq = m[1].indexOf('=');
        const label = eq >= 0 ? m[1].slice(0, eq) : m[1];
        const val = eq >= 0 ? m[1].slice(eq + 1) : '';
        const shown = val && val !== label ? val : label;
        const title = val ? `Parameter „${label}“ – Vorgabe: ${val}` : `Parameter „${label}“ – von der Institution festzulegen`;
        return `<span class="param" title="${esc(title)}">${hl(shown, re)}</span>`;
      }
      return part.split(KW_RE).map((x, i) => (i % 2 ? `<span class="kw ${kwClass(x)}">${hl(x, re)}</span>` : hl(x, re))).join('');
    }).join('');
  }
  function plain(text) {
    return String(text || '').replace(/\{\{([^}]*)\}\}/g, (_, x) => { const i = x.indexOf('='); return i >= 0 ? x.slice(i + 1) : x; });
  }

  // Minimaler Markdown-Renderer (Überschriften, Listen, Tabellen, Code, Hervorhebungen)
  function mdInline(s) {
    let h = esc(s);
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
    h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    h = h.replace(/\{\{([^}]+)\}\}/g, '<span class="ph" title="Platzhalter – von der Institution festzulegen">$1</span>');
    return h;
  }
  function md(src) {
    const lines = String(src || '').replace(/\r/g, '').split('\n');
    const out = [];
    let i = 0;
    const isBlockStart = l => /^```/.test(l) || /^#{1,6}\s/.test(l) || /^\s*([-*+]|\d+[.)])\s+/.test(l) || /^>\s?/.test(l) || /^\s*\|.*\|\s*$/.test(l);
    while (i < lines.length) {
      const l = lines[i];
      if (/^```/.test(l)) {
        const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }
      const h = l.match(/^(#{1,6})\s+(.*)$/);
      if (h) { const lv = Math.min(6, h[1].length + 2); out.push(`<h${lv}>${mdInline(h[2])}</h${lv}>`); i++; continue; }
      if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        const cells = x => x.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        const head = cells(l); i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        out.push('<table><thead><tr>' + head.map(c => `<th>${mdInline(c)}</th>`).join('') + '</tr></thead><tbody>' +
          rows.map(r => '<tr>' + r.map(c => `<td>${mdInline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
        continue;
      }
      if (/^\s*([-*+]|\d+[.)])\s+/.test(l)) {
        const ordered = /^\s*\d/.test(l);
        const items = [];
        while (i < lines.length && (/^\s*([-*+]|\d+[.)])\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
          if (/^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, ''));
          else items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        }
        const tag = ordered ? 'ol' : 'ul';
        out.push(`<${tag}>` + items.map(x => `<li>${mdInline(x)}</li>`).join('') + `</${tag}>`);
        continue;
      }
      if (/^>\s?/.test(l)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
        out.push('<blockquote>' + md(buf.join('\n')) + '</blockquote>');
        continue;
      }
      if (!l.trim()) { i++; continue; }
      const buf = [l]; i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++]);
      out.push('<p>' + buf.map(mdInline).join('<br>') + '</p>');
    }
    return out.join('');
  }

  // --------------------------------------------------------- Bausteine (UI)
  function modalBadge(m) { return m ? `<span class="badge b-${esc(m)}" title="${esc(V.modal[m] || '')}">${esc(m)}</span>` : ''; }
  function slBadge(sl) { return sl === 'erhöht' ? `<span class="badge b-hoch" title="${esc(V.secLevel[sl] || '')}">erhöht</span>` : ''; }
  function effortMeter(e, withLabel) {
    if (e == null || e === '') return '';
    const n = parseInt(e, 10);
    const title = `Aufwand ${e}: ${EFFORT_LABEL[e] || ''}`;
    let bars = '';
    for (let i = 1; i <= 5; i++) bars += `<i class="${i <= n ? 'on' : ''}"></i>`;
    return `<span class="effort${n === 0 ? ' zero' : ''}" title="${esc(title)}" aria-label="${esc(title)}">${bars}</span>` +
      (withLabel ? ` <span class="small">${esc(EFFORT_LABEL[e] || e)}</span>` : '');
  }
  function onlyBadge(r) {
    return r.only ? `<span class="badge b-draft" title="Nur in ${esc(COLL[r.only].title)} enthalten, nicht im Anwenderkatalog Grundschutz++">nur ${esc(COLL[r.only].short)}</span>` : '';
  }
  function bmButton(id, labelled) {
    const on = isBm(id);
    if (labelled) {
      return `<button class="btn${on ? ' on' : ''}" data-bm="${esc(id)}" data-label="1" aria-pressed="${on}">${icon('star')}<span>${on ? 'Gemerkt' : 'Merken'}</span></button>`;
    }
    return `<button class="star${on ? ' on' : ''}" data-bm="${esc(id)}" aria-pressed="${on}" title="Merken" aria-label="${esc(id)} merken">${icon('star')}</button>`;
  }
  function reqLink(id, opts) {
    const r = R[id];
    if (!r) return `<span class="chip id" title="Nicht im Datenbestand">${esc(id)}</span>`;
    return `<a class="chip id" href="#/a/${encodeURIComponent(id)}" title="${esc(r.t)}">${esc(id)}</a>`;
  }
  function linkRow(id, note) {
    const r = R[id];
    if (!r) return `<div class="card linkrow"><span class="lr-id">${esc(id)}</span><span class="lr-t muted">Nicht im Datenbestand</span><span></span></div>`;
    return `<a class="card linkrow" href="#/a/${encodeURIComponent(id)}">
      <span class="lr-id">${esc(id)}</span>
      <span class="lr-t">${esc(r.t)}${note ? '' : `<small>${esc(plain(r.s))}</small>`}</span>
      <span class="r-badges">${note || ''}${modalBadge(r.m)}</span></a>`;
  }
  function reqItem(r, re, opts) {
    opts = opts || {};
    const depth = opts.flat ? 0 : Math.min(r._depth, 3);
    const cls = depth ? ` child${depth > 1 ? ' depth' + depth : ''}` : '';
    const meta = [];
    if (r.to && r.to.length) meta.push(`<span title="Zielobjekte">${icon('target')}${hl(r.to.join(', '), re)}</span>`);
    if (r.doc && r.doc.length) meta.push(`<span title="Dokumentation">${icon('file')}${hl(r.doc.join(', '), re)}</span>`);
    if (r.tags && r.tags.length) meta.push(`<span title="Schlagwörter">#${hl(r.tags.join(' · #'), re)}</span>`);
    const links = [];
    if (r.iso) links.push(`ISO ${r.iso.length}`);
    if (r.itgs) links.push(`IT-GS ${r.itgs.length}`);
    if (r.impl) links.push(`${plural(r.impl.length, 'Umsetzung', 'Umsetzungen')}`);
    if (r.ch) links.push(`${plural(r.ch.length, 'Unteranforderung', 'Unteranforderungen')}`);
    if (links.length) meta.push(`<span>${icon('rel')}${links.join(' · ')}</span>`);
    if (opts.showParent && r.par && R[r.par]) meta.unshift(`<span title="Übergeordnete Anforderung">↳ ${esc(r.par)} ${esc(R[r.par].t)}</span>`);
    return `<article class="card ritem${cls}">
      <div class="r-top">
        <span class="r-id">${hl(r.id, re)}</span>
        <a class="r-title stretched" href="#/a/${encodeURIComponent(r.id)}">${hl(r.t, re)}</a>
        <span class="r-badges">${onlyBadge(r)}${slBadge(r.sl)}${modalBadge(r.m)}${effortMeter(r.e)}</span>
      </div>
      <p class="r-stm">${rich(r.s, re)}</p>
      ${meta.length ? `<div class="r-meta">${meta.join('')}</div>` : ''}
      ${bmButton(r.id)}
    </article>`;
  }
  function relBadge(rel, defaulted) {
    const x = REL[rel] || { s: '?', l: rel, d: '' };
    const cls = rel === 'equivalent-to' || rel === 'equal-to' ? ' eq' : '';
    const d = defaulted ? ' (Standardwert, nicht fachlich geprüft)' : '';
    return `<span class="rel${cls}" title="${esc(x.d + d)}">${x.s} ${esc(x.l)}${defaulted ? '*' : ''}</span>`;
  }

  // ------------------------------------------------------------- Suche
  function searchReqs(q, ids) {
    const toks = tokenize(q);
    const list = ids || ORDER;
    if (!toks.length) return list.map(id => ({ id, s: 0 }));
    const out = [];
    for (const id of list) {
      const r = R[id];
      let total = 0, ok = true;
      for (const t of toks) {
        let s = 0;
        if (r._nid === t) s += 120;
        else if (r._nid.startsWith(t)) s += 45;
        const ti = r._nt.indexOf(t);
        if (ti >= 0) s += (ti === 0 || /[\s\-/(]/.test(r._nt[ti - 1])) ? 14 : 9;
        if (r._nx.indexOf(t) >= 0) s += 6;
        if (r._ns.indexOf(t) >= 0) s += 4;
        if (r._ng.indexOf(t) >= 0) s += 1.5;
        if (!s) { ok = false; break; }
        total += s;
      }
      if (ok) out.push({ id, s: total - r._depth * 0.5 });
    }
    return out;
  }
  function mappingHits(q) {
    const raw = q.trim();
    if (!raw) return [];
    const hits = [];
    const isoQ = raw.replace(/^(iso\s*(27001)?\s*:?\s*)?(a\.)?/i, '');
    if (/^\d+(\.\d+)?$/.test(isoQ) && /^(iso|a\.|\d)/i.test(raw)) {
      const qq = isoQ;
      MAP.iso.rows.filter(r => r.id === qq || r.id.startsWith(qq + '.') || (qq.indexOf('.') < 0 && r.id.split('.')[0] === qq))
        .slice(0, 6).forEach(r => hits.push({ kind: 'iso', row: r }));
    }
    const up = raw.toUpperCase().replace(/\s+/g, '');
    if (/^[A-Z]{3,4}(\.\d+)*(\.A\d+)?/.test(up) && MAP.itgs) {
      const rows = MAP.itgs.rows.filter(r => r.id.toUpperCase() === up || r.id.toUpperCase().startsWith(up + (/\.A\d+$/.test(up) ? '-' : '.')) || r.id.toUpperCase().startsWith(up + '.'));
      const exactBst = MAP.itgs.rows.some(r => r._p.bst.toUpperCase() === up);
      if (exactBst) hits.push({ kind: 'itgs-bst', bst: up, n: rows.length });
      rows.slice(0, exactBst ? 3 : 6).forEach(r => hits.push({ kind: 'itgs', row: r }));
    }
    return hits;
  }
  function vocabHits(q) {
    const t = norm(q.trim());
    if (t.length < 3) return [];
    const res = [];
    const add = (kind, key, label, n) => { if (norm(label).indexOf(t) >= 0) res.push({ kind, key, label, n }); };
    Object.keys(V.targets).forEach(k => add('to', k, k, COUNT.to[k] || 0));
    Object.keys(COUNT.tags).forEach(k => add('tag', k, k, COUNT.tags[k]));
    Object.keys(COUNT.doc).forEach(k => add('doc', k, k, COUNT.doc[k]));
    Object.keys(V.threats).forEach(k => add('thr', k, `${k} ${V.threats[k].t}`, COUNT.thr[k] || 0));
    D.practices.forEach(p => add('pr', p.id, `${p.id} ${p.t}`, p._n || 0));
    return res.filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 5);
  }
  const VOCAB_KIND = { to: 'Zielobjekt', tag: 'Schlagwort', doc: 'Dokumentation', thr: 'Gefährdung', pr: 'Praktik' };

  // ---------------------------------------------- Vorschläge (Suchfelder)
  function attachSuggest(input, box) {
    let sel = -1;
    function close() { box.hidden = true; input.setAttribute('aria-expanded', 'false'); sel = -1; }
    function render() {
      const q = input.value;
      if (!q.trim()) { close(); return; }
      const toks = tokenize(q);
      const re = buildHlRe(toks);
      const res = searchReqs(q).sort((a, b) => b.s - a.s);
      const groups = [];
      const mh = mappingHits(q);
      if (mh.length) {
        groups.push(`<div class="suggest-group"><div class="suggest-head">Mappings</div>` + mh.map(h => {
          if (h.kind === 'iso') return `<a class="sg" href="#/mappings/iso?q=${encodeURIComponent(h.row.id)}"><span class="sg-id">ISO ${esc(h.row.id)}</span><span class="sg-t">${esc(ISO_THEMES[h.row.id.split('.')[0]] || '')}</span><span class="sg-meta">→ ${h.row.maps.reduce((n, m) => n + m.t.length, 0)} GS++</span></a>`;
          if (h.kind === 'itgs-bst') return `<a class="sg" href="#/mappings/itgs?q=${encodeURIComponent(h.bst)}"><span class="sg-id">${esc(h.bst)}</span><span class="sg-t">IT-Grundschutz-Baustein (2023)</span><span class="sg-meta">${h.n} Anforderungen</span></a>`;
          return `<a class="sg" href="#/mappings/itgs?q=${encodeURIComponent(h.row.id)}"><span class="sg-id">${esc(h.row.id)}</span><span class="sg-t">IT-Grundschutz 2023</span><span class="sg-meta">→ ${h.row.maps.reduce((n, m) => n + m.t.length, 0)} GS++</span></a>`;
        }).join('') + '</div>');
      }
      if (res.length) {
        groups.push(`<div class="suggest-group"><div class="suggest-head">Anforderungen</div>` + res.slice(0, 7).map(x => {
          const r = R[x.id];
          return `<a class="sg" href="#/a/${encodeURIComponent(r.id)}"><span class="sg-id">${hl(r.id, re)}</span><span class="sg-t">${hl(r.t, re)}</span><span class="sg-meta">${esc(r.m || '')}</span></a>`;
        }).join('') + '</div>');
      }
      const vh = vocabHits(q);
      if (vh.length) {
        groups.push(`<div class="suggest-group"><div class="suggest-head">Filtern nach</div>` + vh.map(v =>
          `<a class="sg" href="#/anforderungen?${v.kind === 'tag' ? 'tag' : v.kind}=${encodeURIComponent(v.key)}"><span class="sg-id">${esc(VOCAB_KIND[v.kind])}</span><span class="sg-t">${hl(v.label, re)}</span><span class="sg-meta">${v.n}</span></a>`).join('') + '</div>');
      }
      groups.push(`<div class="suggest-group"><a class="sg sg-all" href="#/anforderungen?q=${encodeURIComponent(q.trim())}">${res.length ? `Alle ${fmtN(res.length)} Treffer anzeigen →` : 'Keine Anforderung gefunden – im Explorer weitersuchen →'}</a></div>`);
      box.innerHTML = groups.join('');
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      sel = -1;
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', () => { if (input.value.trim()) render(); });
    input.addEventListener('keydown', e => {
      const items = Array.from(box.querySelectorAll('a.sg'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (box.hidden) return;
        e.preventDefault();
        sel = e.key === 'ArrowDown' ? Math.min(items.length - 1, sel + 1) : Math.max(-1, sel - 1);
        items.forEach((a, i) => a.classList.toggle('sel', i === sel));
        if (items[sel]) items[sel].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const q = input.value.trim();
        if (sel >= 0 && items[sel]) location.hash = items[sel].getAttribute('href');
        else if (q) {
          const exact = R[q.toUpperCase()] ? q.toUpperCase() : null;
          location.hash = exact ? '#/a/' + encodeURIComponent(exact) : '#/anforderungen?q=' + encodeURIComponent(q);
        }
        close();
        input.blur();
      } else if (e.key === 'Escape') { close(); input.blur(); }
    });
    box.addEventListener('mousedown', e => e.preventDefault());
    box.addEventListener('click', e => { if (e.target.closest('a')) { close(); input.blur(); } });
    input.addEventListener('blur', () => setTimeout(close, 120));
  }

  // ---------------------------------------------------------- Explorer
  const FACETS = [
    { k: 'm', t: 'Verbindlichkeit', get: r => r.m ? [r.m] : [], order: ['MUSS', 'SOLLTE', 'KANN'], fmt: v => `<span class="badge b-${v}">${v}</span>`, tip: v => V.modal[v] },
    { k: 'e', t: 'Aufwand', get: r => r.e != null ? [r.e] : [], order: ['0', '1', '2', '3', '4', '5'], fmt: v => `${effortMeter(v)} ${esc(EFFORT_LABEL[v] || v)}`, tip: v => V.effort[v] },
    { k: 'sl', t: 'Sicherheitsniveau', get: r => r.sl ? [r.sl] : [], order: ['normal-SdT', 'erhöht'], fmt: v => esc(SL_LABEL[v] || v) },
    { k: 'goal', t: 'Schutzziel im Fokus', get: r => r.cia ? GOALS.filter((g, i) => r.cia[i] === '2').map(g => g.k) : [], order: GOALS.map(g => g.k), fmt: v => esc(GOALS.find(g => g.k === v).t), tip: () => 'Anforderungen, bei denen dieses Schutzziel im Zentrum steht (Wirkungsstufe 2)' },
    { k: 'pr', t: 'Praktik', get: r => [r.pr], order: D.practices.map(p => p.id), fmt: v => `<span class="mono small">${esc(v)}</span> ${esc(PR[v] ? PR[v].t : v)}`, many: true },
    { k: 'tp', t: 'Thema', get: r => r.tp ? [r.tp] : [], fmt: v => `<span class="mono small">${esc(v)}</span> ${esc(TP[v] ? TP[v].t : v)}`, hideUnlessActive: true },
    { k: 'to', t: 'Zielobjekt', get: r => r.to || [], fmt: esc, many: true, search: true, tip: v => V.targets[v] && V.targets[v].d },
    { k: 'doc', t: 'Dokumentation', get: r => r.doc || [], fmt: esc, many: true, search: true, tip: v => V.docs[v] && V.docs[v].d },
    { k: 'tag', t: 'Schlagwort', get: r => r.tags || [], fmt: esc, many: true, search: true, tip: v => V.tags[v] },
    { k: 'thr', t: 'Elementare Gefährdung', get: r => r.thr || [], fmt: v => `<span class="mono small">${esc(v)}</span> ${esc(V.threats[v] ? V.threats[v].t : '')}`, many: true, search: true, sortId: true },
    { k: 'a', t: 'Tätigkeit', get: r => r.a ? [r.a] : [], fmt: esc, many: true, search: true, tip: v => V.actions[v] && V.actions[v].d },
    { k: 'col', t: 'Kollektion', get: r => r._cols, order: D.collections.map(c => c.key), fmt: v => esc(COLL[v].short) },
    { k: 'src', t: 'Herkunft', get: r => [r.src], order: ['methodik', 'kernel', 'risiko', 'tls'], fmt: v => esc(SRC_LABEL[v] || v) },
    { k: 'has', t: 'Verknüpft mit', get: r => [r.iso && 'iso', r.itgs && 'itgs', r.impl && 'impl', (r.req || r.reqBy) && 'dep'].filter(Boolean), order: ['iso', 'itgs', 'impl', 'dep'], fmt: v => ({ iso: 'ISO 27001-Mapping', itgs: 'IT-Grundschutz-2023-Mapping', impl: 'Umsetzungsbeispiel', dep: 'Abhängigkeiten' }[v]) },
    { k: 'lvl', t: 'Ebene', get: r => [r.par ? 'sub' : 'top'], order: ['top', 'sub'], fmt: v => (v === 'top' ? 'Hauptanforderungen' : 'Unteranforderungen') }
  ];
  const FK = {};
  FACETS.forEach(f => { FK[f.k] = f; });
  const ex = { q: '', f: {}, sort: '', shown: 60, openFacets: {}, facetQ: {}, mounted: false, results: [] };
  let lastExplorerHash = '';
  let navList = null; // Liste für Vor/Zurück auf der Detailseite

  function parseQuery(qs) {
    const p = {};
    new URLSearchParams(qs || '').forEach((v, k) => { p[k] = v; });
    return p;
  }
  function explorerHash() {
    const p = new URLSearchParams();
    if (ex.q) p.set('q', ex.q);
    FACETS.forEach(f => { if (ex.f[f.k] && ex.f[f.k].length) p.set(f.k, ex.f[f.k].join('|')); });
    if (ex.sort) p.set('sort', ex.sort);
    const s = p.toString();
    return '#/anforderungen' + (s ? '?' + s : '');
  }
  function computeExplorer() {
    const base = searchReqs(ex.q);
    const scores = {};
    base.forEach(x => { scores[x.id] = x.s; });
    const active = FACETS.filter(f => ex.f[f.k] && ex.f[f.k].length);
    const counts = {};
    FACETS.forEach(f => { counts[f.k] = {}; });
    const results = [];
    for (const x of base) {
      const r = R[x.id];
      let failed = null, nFail = 0;
      for (const f of active) {
        const vals = f.get(r);
        const sel = ex.f[f.k];
        if (!vals.some(v => sel.indexOf(v) >= 0)) { nFail++; failed = f.k; if (nFail > 1) break; }
      }
      if (nFail > 1) continue;
      const vals = {};
      if (nFail === 0) {
        results.push(x.id);
        FACETS.forEach(f => { uniq(f.get(r)).forEach(v => { counts[f.k][v] = (counts[f.k][v] || 0) + 1; }); });
      } else {
        uniq(FK[failed].get(r)).forEach(v => { counts[failed][v] = (counts[failed][v] || 0) + 1; });
      }
    }
    const sort = ex.sort || (ex.q ? 'rel' : 'doc');
    if (sort === 'rel') results.sort((a, b) => scores[b] - scores[a] || R[a]._i - R[b]._i);
    else if (sort === 'effort') results.sort((a, b) => (+R[a].e || 0) - (+R[b].e || 0) || R[a]._i - R[b]._i);
    else if (sort === 'modal') {
      const o = { MUSS: 0, SOLLTE: 1, KANN: 2 };
      results.sort((a, b) => (o[R[a].m] ?? 3) - (o[R[b].m] ?? 3) || R[a]._i - R[b]._i);
    } else if (sort === 'id') results.sort(cmpId);
    else results.sort((a, b) => R[a]._i - R[b]._i);
    return { results, counts, sort };
  }

  function renderFacet(f, counts) {
    const sel = ex.f[f.k] || [];
    let values = Object.keys(counts[f.k]);
    sel.forEach(v => { if (values.indexOf(v) < 0) values.push(v); });
    if (f.hideUnlessActive && !sel.length) return '';
    if (!values.length) return '';
    if (f.order) values.sort((a, b) => (f.order.indexOf(a) + 1 || 999) - (f.order.indexOf(b) + 1 || 999));
    else if (f.sortId) values.sort((a, b) => parseFloat(a.replace(/[^\d.]/g, '').slice(2)) - parseFloat(b.replace(/[^\d.]/g, '').slice(2)) || a.localeCompare(b));
    else values.sort((a, b) => (counts[f.k][b] || 0) - (counts[f.k][a] || 0) || a.localeCompare(b, 'de'));
    const fq = norm(ex.facetQ[f.k] || '');
    if (fq) values = values.filter(v => norm(v + ' ' + (f.k === 'thr' && V.threats[v] ? V.threats[v].t : '')).indexOf(fq) >= 0 || sel.indexOf(v) >= 0);
    const limit = f.many && !ex.openFacets[f.k] && !fq ? 7 : 1e9;
    // Ausgewählte immer oben zeigen
    if (limit < values.length) values = values.filter(v => sel.indexOf(v) >= 0).concat(values.filter(v => sel.indexOf(v) < 0));
    const opts = values.slice(0, Math.max(limit, sel.length)).map(v => {
      const c = counts[f.k][v] || 0;
      const on = sel.indexOf(v) >= 0;
      const tip = f.tip ? f.tip(v) : '';
      return `<label class="opt${on ? ' checked' : ''}${!c && !on ? ' zero' : ''}"${tip ? ` title="${esc(tip)}"` : ''}>
        <input type="checkbox" data-f="${f.k}" value="${esc(v)}"${on ? ' checked' : ''}>
        <span class="ol">${f.fmt(v)}</span><span class="oc">${fmtN(c)}</span></label>`;
    }).join('');
    const total = Object.keys(counts[f.k]).length;
    return `<div class="facet" data-facet="${f.k}">
      <h3>${esc(f.t)}${sel.length ? `<button data-clear="${f.k}">zurücksetzen</button>` : ''}</h3>
      ${f.search && total > 10 ? `<input class="input facet-search" data-fq="${f.k}" placeholder="${esc(f.t)} suchen …" value="${esc(ex.facetQ[f.k] || '')}">` : ''}
      ${opts || '<div class="small muted">Keine Treffer</div>'}
      ${limit < values.length ? `<button class="more-btn" data-more="${f.k}">Alle ${values.length} anzeigen</button>` : ''}
      ${ex.openFacets[f.k] && f.many && !fq && values.length > 7 ? `<button class="more-btn" data-less="${f.k}">Weniger anzeigen</button>` : ''}
    </div>`;
  }

  function renderExplorerShell() {
    $main.innerHTML = `
      <div class="explorer">
        <aside class="filters" id="filters" aria-label="Filter"></aside>
        <section id="exResults" aria-live="polite">
          <div id="exBanner"></div>
          <div class="local-search">
            ${icon('search')}
            <input id="exQ" class="input" type="search" placeholder="In Anforderungen suchen (Titel, Text, Hinweise, Schlagwörter …)" value="${esc(ex.q)}" aria-label="Anforderungen durchsuchen">
          </div>
          <div id="exActive" class="active-filters"></div>
          <div class="results-head" id="exHead"></div>
          <div id="exList"></div>
        </section>
      </div>`;
    ex.mounted = true;
    const q = document.getElementById('exQ');
    let t;
    q.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        ex.q = q.value.trim();
        ex.shown = 60;
        history.replaceState(null, '', explorerHash());
        lastRoute = location.hash;
        updateExplorer();
      }, 120);
    });
    const filters = document.getElementById('filters');
    filters.addEventListener('change', e => {
      const cb = e.target.closest('input[type=checkbox][data-f]');
      if (!cb) return;
      const k = cb.dataset.f;
      const cur = ex.f[k] || [];
      ex.f[k] = cb.checked ? cur.concat(cb.value) : cur.filter(v => v !== cb.value);
      if (k === 'pr' && !cb.checked) ex.f.tp = (ex.f.tp || []).filter(tp => ex.f.pr.indexOf(TP[tp] && TP[tp].pr) >= 0);
      ex.shown = 60;
      pushExplorer();
    });
    filters.addEventListener('input', e => {
      const fi = e.target.closest('[data-fq]');
      if (!fi) return;
      ex.facetQ[fi.dataset.fq] = fi.value;
      const pos = fi.selectionStart;
      updateExplorer();
      const again = document.querySelector(`[data-fq="${fi.dataset.fq}"]`);
      if (again) { again.focus(); again.setSelectionRange(pos, pos); }
    });
    filters.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.more) { ex.openFacets[b.dataset.more] = true; updateExplorer(); }
      else if (b.dataset.less) { ex.openFacets[b.dataset.less] = false; updateExplorer(); }
      else if (b.dataset.clear) { ex.f[b.dataset.clear] = []; pushExplorer(); }
      else if (b.dataset.closeFilters != null) filters.classList.remove('open');
      else if (b.dataset.clearAll != null) { ex.f = {}; pushExplorer(); }
    });
    document.getElementById('exResults').addEventListener('click', e => {
      const b = e.target.closest('button, [data-rm]');
      if (!b) return;
      if (b.dataset.rm) {
        const [k, v] = b.dataset.rm.split('::');
        if (k === 'q') { ex.q = ''; q.value = ''; } else ex.f[k] = (ex.f[k] || []).filter(x => x !== v);
        pushExplorer();
      } else if (b.dataset.sort != null) { ex.sort = b.dataset.sort; pushExplorer(); }
      else if (b.dataset.showMore != null) { ex.shown += 100; renderList(); }
      else if (b.dataset.openFilters != null) document.getElementById('filters').classList.add('open');
      else if (b.dataset.csv != null) exportCsv(ex.results, 'sdt-anforderungen.csv');
      else if (b.dataset.clearAll != null) { ex.f = {}; ex.q = ''; q.value = ''; pushExplorer(); }
      else if (b.dataset.addTp) { ex.f.tp = [b.dataset.addTp]; pushExplorer(); }
    });
  }
  function pushExplorer() {
    history.pushState(null, '', explorerHash());
    lastRoute = location.hash;
    updateExplorer();
  }

  function updateExplorer() {
    const { results, counts, sort } = computeExplorer();
    ex.results = results;
    ex.counts = counts;
    ex.curSort = sort;
    lastExplorerHash = explorerHash();
    navList = results;
    const filters = document.getElementById('filters');
    const st = filters.scrollTop;
    const anyActive = FACETS.some(f => ex.f[f.k] && ex.f[f.k].length);
    filters.innerHTML = `<div class="filters-head"><h2>Filter</h2>
        <span>${anyActive ? '<button class="btn small" data-clear-all>Alle zurücksetzen</button>' : ''}
        <button class="icon-btn filter-toggle" data-close-filters aria-label="Filter schließen">${icon('x')}</button></span></div>` +
      FACETS.map(f => renderFacet(f, counts)).join('');
    filters.scrollTop = st;

    // Banner für Praktik/Thema
    const banner = document.getElementById('exBanner');
    const prSel = ex.f.pr || [];
    const tpSel = ex.f.tp || [];
    if (prSel.length === 1 && PR[prSel[0]]) {
      const p = PR[prSel[0]];
      const vp = V.practices[p.id] || {};
      banner.innerHTML = `<div class="card prac-banner">
        <div class="crumbs"><a href="#/anforderungen">Alle Anforderungen</a><span class="sep">›</span><span>Praktik</span></div>
        <h1><span class="mono" style="color:var(--brand)">${esc(p.id)}</span> ${esc(p.t)}</h1>
        ${vp.aka ? `<p class="small muted" style="margin-bottom:6px">Auch bekannt als: ${esc(vp.aka)} · Schwerpunkt: ${esc(vp.fokus)}</p>` : ''}
        <p>${esc(vp.d || p.d)}</p>
        <div class="chips topics">${p.items.map(tid => `<button class="chip${tpSel.indexOf(tid) >= 0 ? ' on' : ''}" data-add-tp="${esc(tid)}" style="cursor:pointer${tpSel.indexOf(tid) >= 0 ? ';background:var(--brand-soft);color:var(--brand)' : ''}"><span class="mono">${esc(tid)}</span> ${esc(TP[tid].t)}</button>`).join('')}</div>
      </div>`;
    } else banner.innerHTML = '';

    // Aktive Filter
    const chips = [];
    if (ex.q) chips.push(`<button class="chip" data-rm="q::">Suche: <b>${esc(ex.q)}</b> ${icon('x')}</button>`);
    FACETS.forEach(f => (ex.f[f.k] || []).forEach(v => {
      const label = f.k === 'pr' ? `${v} ${PR[v] ? PR[v].t : ''}` : f.k === 'tp' ? `${v} ${TP[v] ? TP[v].t : ''}` : f.k === 'thr' ? `${v}` : f.k === 'col' ? COLL[v].short : f.k === 'src' ? SRC_LABEL[v] : f.k === 'sl' ? SL_LABEL[v] : f.k === 'e' ? `Aufwand ${v}` : f.k === 'goal' ? GOALS.find(g => g.k === v).t : f.k === 'has' ? FK.has.fmt(v) : f.k === 'lvl' ? FK.lvl.fmt(v) : v;
      chips.push(`<button class="chip" data-rm="${f.k}::${esc(v)}" title="Filter entfernen">${esc(f.t)}: <b>${esc(label)}</b> ${icon('x')}</button>`);
    }));
    document.getElementById('exActive').innerHTML = chips.join('');

    const nTop = results.filter(id => !R[id].par).length;
    document.getElementById('exHead').innerHTML = `
      <button class="btn small filter-toggle" data-open-filters>${icon('filter')} Filter${anyActive ? ` (${FACETS.reduce((n, f) => n + (ex.f[f.k] || []).length, 0)})` : ''}</button>
      <span class="rc">${plural(results.length, 'Anforderung', 'Anforderungen')}</span>
      <span class="muted small">${results.length !== nTop ? `davon ${fmtN(nTop)} Haupt- und ${fmtN(results.length - nTop)} Unteranforderungen` : ''}</span>
      <span class="spacer"></span>
      <span class="small muted">Sortierung</span>
      <span class="seg" role="group" aria-label="Sortierung">
        <button data-sort="doc" class="${sort === 'doc' ? 'on' : ''}">Gliederung</button>
        ${ex.q ? `<button data-sort="rel" class="${sort === 'rel' ? 'on' : ''}">Relevanz</button>` : ''}
        <button data-sort="modal" class="${sort === 'modal' ? 'on' : ''}">Verbindlichkeit</button>
        <button data-sort="effort" class="${sort === 'effort' ? 'on' : ''}">Aufwand</button>
      </span>
      <button class="btn small" data-csv title="Ergebnisliste als CSV (Excel) herunterladen">${icon('download')} CSV</button>`;
    renderList();
  }

  function renderList() {
    const list = document.getElementById('exList');
    const { results } = ex;
    const re = buildHlRe(tokenize(ex.q));
    if (!results.length) {
      const mh = ex.q ? mappingHits(ex.q) : [];
      list.innerHTML = `<div class="card empty"><h2>Keine Anforderungen gefunden</h2>
        <p>Versuchen Sie einen allgemeineren Begriff oder entfernen Sie Filter.</p>
        ${mh.length ? `<p>Ihre Eingabe passt zu einem Mapping: ${mh.map(h => h.row ? `<a href="#/mappings/${h.kind === 'iso' ? 'iso' : 'itgs'}?q=${encodeURIComponent(h.row.id)}">${esc(h.row.id)}</a>` : `<a href="#/mappings/itgs?q=${encodeURIComponent(h.bst)}">${esc(h.bst)}</a>`).join(', ')}</p>` : ''}
        <button class="btn" data-clear-all>Suche und Filter zurücksetzen</button></div>`;
      return;
    }
    let html = '';
    const mh = ex.q ? mappingHits(ex.q) : [];
    if (mh.length) {
      html += `<div class="note info" style="margin-bottom:12px">Mapping gefunden: ${mh.map(h => h.row ? `<a href="#/mappings/${h.kind === 'iso' ? 'iso' : 'itgs'}?q=${encodeURIComponent(h.row.id)}"><b>${h.kind === 'iso' ? 'ISO ' : ''}${esc(h.row.id)}</b></a>` : `<a href="#/mappings/itgs?q=${encodeURIComponent(h.bst)}"><b>Baustein ${esc(h.bst)}</b></a>`).join(', ')} – zeigt die entsprechenden Grundschutz++-Anforderungen.</div>`;
    }
    const slice = results.slice(0, ex.shown);
    const grouped = ex.curSort === 'doc';
    let lastPr = null, lastTp = null;
    html += '<div class="rlist">';
    slice.forEach(id => {
      const r = R[id];
      if (grouped) {
        if (r.pr !== lastPr) {
          const p = PR[r.pr];
          const n = results.filter(x => R[x].pr === r.pr).length;
          html += `</div><div class="group-h"><span class="gid">${esc(r.pr)}</span><h2>${esc(p ? p.t : r.pr)}</h2><span class="n">${plural(n, 'Anforderung', 'Anforderungen')}</span></div><div class="rlist">`;
          lastPr = r.pr; lastTp = null;
        }
        if (r.tp !== lastTp && r.tp) {
          html += `</div><div class="topic-h"><span class="gid">${esc(r.tp)}</span>${esc(TP[r.tp] ? TP[r.tp].t : '')}</div><div class="rlist">`;
          lastTp = r.tp;
        }
      }
      html += reqItem(r, re, { flat: !grouped, showParent: !grouped });
    });
    html += '</div>';
    if (results.length > ex.shown) {
      html += `<div class="load-more"><button class="btn" data-show-more>Weitere anzeigen (${fmtN(Math.min(100, results.length - ex.shown))} von ${fmtN(results.length - ex.shown)} verbleibenden)</button></div>`;
    }
    list.innerHTML = html.replace(/<div class="rlist"><\/div>/g, '');
    const more = list.querySelector('[data-show-more]');
    if (more && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { io.disconnect(); ex.shown += 100; renderList(); }
      }, { rootMargin: '600px' });
      io.observe(more);
    }
  }

  function viewExplorer(params) {
    ex.q = params.q || '';
    ex.f = {};
    FACETS.forEach(f => { if (params[f.k]) ex.f[f.k] = params[f.k].split('|').filter(Boolean); });
    ex.sort = params.sort || '';
    ex.shown = 60;
    renderExplorerShell();
    updateExplorer();
    document.title = (ex.q ? `„${ex.q}“ – ` : '') + 'Anforderungen – SdT Navigator';
  }

  // ------------------------------------------------------------ CSV-Export
  function exportCsv(ids, name) {
    const cols = ['ID', 'Titel', 'Praktik', 'Thema', 'Übergeordnet', 'Verbindlichkeit', 'Sicherheitsniveau', 'Aufwand', 'Anforderung', 'Umsetzungshinweise',
      'Zielobjekte', 'Dokumentation', 'Schlagwörter', 'Gefährdungen', 'Vertraulichkeit', 'Integrität', 'Verfügbarkeit', 'Authentizität',
      'Setzt voraus', 'ISO 27001', 'IT-Grundschutz 2023', 'Kollektionen'];
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = ids.map(id => {
      const r = R[id];
      return [r.id, r.t, PR[r.pr] ? `${r.pr} ${PR[r.pr].t}` : r.pr, r.tp && TP[r.tp] ? `${r.tp} ${TP[r.tp].t}` : '', r.par || '', r.m, SL_LABEL[r.sl] || r.sl, r.e,
        plain(r.s), plain(r.g), (r.to || []).join(', '), (r.doc || []).join(', '), (r.tags || []).join(', '), (r.thr || []).join(', '),
        r.cia ? r.cia[0] : '', r.cia ? r.cia[1] : '', r.cia ? r.cia[2] : '', r.cia ? r.cia[3] : '',
        (r.req || []).join(', '), (r.iso || []).map(x => x[0]).join(', '), (r.itgs || []).map(x => x[0]).join(', '),
        r._cols.map(k => COLL[k].short).join(', ')].map(q).join(';');
    });
    download(name, '\ufeff' + [cols.map(q).join(';')].concat(rows).join('\r\n'), 'text/csv;charset=utf-8');
    toast(`${plural(ids.length, 'Anforderung', 'Anforderungen')} exportiert`);
  }

  // ------------------------------------------------------------ Detailseite
  function viewDetail(id) {
    const r = R[id];
    if (!r) {
      $main.innerHTML = `<div class="card empty"><h2>Anforderung „${esc(id)}“ nicht gefunden</h2><p><a href="#/anforderungen?q=${encodeURIComponent(id)}">Danach suchen</a></p></div>`;
      return;
    }
    document.title = `${r.id} ${r.t} – SdT Navigator`;
    const p = PR[r.pr];
    const crumbs = [`<a href="#/anforderungen">Anforderungen</a>`];
    if (p) crumbs.push(`<a href="#/anforderungen?pr=${encodeURIComponent(p.id)}">${esc(p.id)} ${esc(p.t)}</a>`);
    if (r.tp && TP[r.tp]) crumbs.push(`<a href="#/anforderungen?pr=${encodeURIComponent(r.pr)}&tp=${encodeURIComponent(r.tp)}">${esc(r.tp)} ${esc(TP[r.tp].t)}</a>`);
    const chain = [];
    let pp = r.par;
    while (pp && R[pp]) { chain.unshift(pp); pp = R[pp].par; }
    chain.forEach(c => crumbs.push(`<a href="#/a/${encodeURIComponent(c)}">${esc(c)}</a>`));

    const fromList = lastExplorerHash && navList && navList.indexOf(id) >= 0 ? navList : ORDER;
    const pos = fromList.indexOf(id);
    const prev = pos > 0 ? R[fromList[pos - 1]] : null;
    const next = pos >= 0 && pos < fromList.length - 1 ? R[fromList[pos + 1]] : null;

    // Satzschablone
    const act = V.actions[r.a];
    const anatomy = `<dl class="card anatomy" aria-label="Aufbau der Anforderung">
      <div><dt>Wer / Wofür</dt><dd>${r.to && r.to.length ? r.to.map(t => `<a href="#/anforderungen?to=${encodeURIComponent(t)}" title="${esc(V.targets[t] ? V.targets[t].d : '')}">${esc(t)}</a>`).join(', ') : `<span title="Praktik">${esc(p ? p.t : r.pr)}</span>`}</dd></div>
      <div><dt>Verbindlichkeit</dt><dd>${modalBadge(r.m) || '–'}</dd></div>
      <div><dt>Ergebnis</dt><dd>${r.res ? rich(r.res) : '–'}</dd></div>
      <div><dt>Tätigkeit</dt><dd>${r.a ? `<a href="#/anforderungen?a=${encodeURIComponent(r.a)}" title="${esc(act ? act.d : '')}">${esc(r.a)}</a>` : '–'}</dd></div>
    </dl>`;

    const sections = [];
    if (r.g) sections.push(`<section class="dsec"><h2>${icon('book')}Umsetzungshinweise</h2><div class="prose">${rich(r.g).split(/\n{2,}/).map(x => `<p>${x.replace(/\n/g, '<br>')}</p>`).join('')}</div></section>`);
    if (r.prm && r.prm.length) {
      sections.push(`<section class="dsec"><h2>${icon('list')}Parameter <span class="n">${r.prm.length}</span></h2>
        <p class="small muted">Platzhalter im Anforderungstext, die von der Institution (oder einem Profil) konkretisiert werden.</p>
        <div class="chips">${r.prm.map(x => `<span class="chip" title="${x.v && x.v.length ? 'Vorgabe: ' + esc(x.v.join(', ')) : 'Von der Institution festzulegen'}"><span class="param">${esc(x.l)}</span>${x.v && x.v.length && x.v.join(', ') !== x.l ? ' = ' + esc(x.v.join(', ')) : ''}</span>`).join('')}</div></section>`);
    }
    if (r.ch && r.ch.length) {
      sections.push(`<section class="dsec"><h2>${icon('tree')}Unteranforderungen <span class="n">${r.ch.length}</span>${hint(V.relations.enhancement)}</h2>
                <div class="linkrows">${r.ch.map(c => linkRow(c)).join('')}</div></section>`);
    }
    if (r.par && R[r.par]) {
      sections.push(`<section class="dsec"><h2>${icon('tree')}Übergeordnete Anforderung</h2><div class="linkrows">${linkRow(r.par)}</div></section>`);
    }
    const dep = [];
    if (r.req && r.req.length) dep.push(`<div class="sub-h">Setzt voraus</div><div class="linkrows">${r.req.map(x => linkRow(x)).join('')}</div>`);
    if (r.reqBy && r.reqBy.length) dep.push(`<div class="sub-h">Wird vorausgesetzt von</div><div class="linkrows">${r.reqBy.map(x => linkRow(x)).join('')}</div>`);
    if (dep.length) sections.push(`<section class="dsec"><h2>${icon('req')}Abhängigkeiten${hint(V.relations.required)}</h2>${dep.join('')}</section>`);
    const depIds = (r.req || []).concat(r.reqBy || []);
    const related = uniq((r.rel || []).concat(r.relBy || [])).filter(x => depIds.indexOf(x) < 0 && x !== r.par && (r.ch || []).indexOf(x) < 0);
    if (related.length) sections.push(`<section class="dsec"><h2>${icon('rel')}Verwandte Anforderungen <span class="n">${related.length}</span>${hint(V.relations.related.split(/\n/)[0])}</h2><div class="linkrows">${related.map(x => linkRow(x)).join('')}</div></section>`);

    // Mappings
    const mapParts = [];
    if (r.iso) {
      mapParts.push(`<div class="sub-h">ISO/IEC 27001:2022 Anhang A</div>` + r.iso.map(([src, rel]) =>
        `<div class="maprow"><a class="msrc" href="#/mappings/iso?q=${encodeURIComponent(src)}">A.${esc(src)}</a>${relBadge(rel)}<span class="small muted">${esc(ISO_THEMES[src.split('.')[0]] || '')}</span></div>`).join(''));
    }
    if (r.itgs) {
      const byBst = {};
      r.itgs.forEach(([src, rel]) => { const b = parseItgs(src).bst; (byBst[b] = byBst[b] || []).push([src, rel]); });
      mapParts.push(`<div class="sub-h">IT-Grundschutz-Kompendium 2023 <span title="Entwurfsstand des Mappings">(Entwurf)</span></div>` + Object.keys(byBst).sort(cmpId).map(b =>
        `<div class="maprow"><a class="msrc" href="#/mappings/itgs?q=${encodeURIComponent(b)}">${esc(b)}</a>${byBst[b].map(([src, rel]) => {
          const row = ITGS_ROWS[src];
          const d = row && row.maps.some(m => m.d && m.t.indexOf(r.id) >= 0);
          return `<a class="chip id" href="#/mappings/itgs?q=${encodeURIComponent(src)}" title="${esc((REL[rel] || {}).d || '')}">${esc(src.slice(b.length + 1))} ${(REL[rel] || {}).s || ''}${d ? '*' : ''}</a>`;
        }).join('')}</div>`).join(''));
    }
    if (mapParts.length) {
      sections.push(`<section class="dsec"><h2>${icon('arrows')}Entsprechungen in anderen Regelwerken</h2>
        <div class="card pad">${mapParts.join('')}
        <p class="small muted" style="margin:10px 0 0">≡ gleichwertig · ⊂ Quelle ist Teilmenge · ⊃ Quelle ist Obermenge · ∩ Überschneidung${r.itgs ? ' · * Beziehung als Standardwert gesetzt, nicht fachlich geprüft' : ''}</p></div></section>`);
    }

    // Umsetzungsbeispiele
    if (r.impl && r.impl.length) {
      sections.push(`<section class="dsec"><h2>${icon('tool')}Umsetzungsbeispiele <span class="n">${r.impl.length}</span></h2>` + r.impl.map(([k, ci], n) => {
        const doc = IMPL[k];
        const comp = doc.comps[ci];
        const items = comp.items.filter(it => it.id === r.id);
        return `<details class="impl"${n === 0 ? ' open' : ''}><summary>
          <span class="it">${esc(comp.t)}<small>${esc(doc.title)}</small></span>
          ${doc.draft ? '<span class="badge b-draft">Entwurf</span>' : ''}<span class="badge b-neutral">${esc(compType(comp.type))}</span></summary>
          <div class="ibody">${items.map(it => implItemBody(it)).join('<hr style="border:0;border-top:1px dashed var(--border)">')}
          <p class="small" style="margin-top:10px"><a href="#/umsetzung/${encodeURIComponent(k)}/${ci}">Komponente „${esc(comp.t)}“ vollständig ansehen →</a></p></div></details>`;
      }).join('') + '</section>');
    }

    // Abweichungen in Kollektionen
    const variants = r._cols.filter(k => k !== 'gspp' && (COLL[k].members[id].s || COLL[k].members[id].g || COLL[k].members[id].t));
    if (variants.length) {
      sections.push(`<section class="dsec"><h2>${icon('layers')}Anpassungen in Kollektionen</h2>
        <p class="small muted">Profile können Anforderungen zuschneiden, z. B. die Verbindlichkeit erhöhen oder eigene Hinweise ergänzen.</p>` +
        variants.map(k => {
          const m = COLL[k].members[id];
          return `<div class="variant"><h4><a href="#/kollektion/${k}">${esc(COLL[k].title)}</a>${m.label ? `<span class="chip id">${esc(m.label)}</span>` : ''}${m.m && m.m !== r.m ? `${modalBadge(r.m)} → ${modalBadge(m.m)}` : ''}</h4>
            ${m.t ? `<div class="vl">Titel</div><div>${esc(m.t)}</div>` : ''}
            ${m.s ? `<div class="vl">Anforderung</div><div>${rich(m.s)}</div>` : ''}
            ${m.g ? `<div class="vl">Hinweise</div><div class="small">${rich(m.g)}</div>` : ''}</div>`;
        }).join('') + '</section>');
    }

    // Gefährdungen
    if (r.thr && r.thr.length) {
      sections.push(`<section class="dsec"><h2>${icon('alert')}Elementare Gefährdungen <span class="n">${r.thr.length}</span></h2>` +
        r.thr.map(t => {
          const th = V.threats[t];
          return `<details class="threat"><summary><span class="tid">${esc(t)}</span><span>${esc(th ? th.t : 'Unbekannt')}</span><a class="small" style="margin-left:auto" href="#/anforderungen?thr=${encodeURIComponent(t)}">${COUNT.thr[t] || 0} Anforderungen</a></summary>
            ${th ? `<div class="tbody">${esc(th.d)}</div>` : ''}</details>`;
        }).join('') + '</section>');
    }

    // Seitenleiste
    const aside = [];
    aside.push(`<div class="card"><h3>Eckdaten</h3><dl class="kv">
      <dt>Verbindlichkeit</dt><dd>${modalBadge(r.m) || '–'}</dd>
      <dt>Sicherheitsniveau</dt><dd title="${esc(V.secLevel[r.sl] || '')}">${esc(SL_LABEL[r.sl] || r.sl || '–')}</dd>
      <dt>Aufwand</dt><dd title="${esc(V.effort[r.e] || '')}">${effortMeter(r.e)} <span class="small">${esc(r.e != null ? r.e + '/5' : '–')}</span></dd>
      <dt>Herkunft</dt><dd class="small">${esc(SRC_LABEL[r.src] || r.src)}</dd>
    </dl>${r.e != null ? `<p class="small muted" style="margin:10px 0 0">${esc(EFFORT_LABEL[r.e] || '')}: ${esc(V.effort[r.e] || '')}</p>` : ''}</div>`);
    if (r.cia) {
      aside.push(`<div class="card"><h3>Wirkung auf Schutzziele</h3><div class="goals">${GOALS.map((g, i) => {
        const v = r.cia[i];
        return `<div class="goal" title="${esc(V.goalLevels[v] || '')}"><span>${g.t}</span><span class="bar"><i style="width:${v === '2' ? 100 : v === '1' ? 50 : 4}%"></i></span><span class="gl">${GOAL_LEVEL[v] || '–'}</span></div>`;
      }).join('')}</div></div>`);
    }
    const chipBlock = (title, items, key, tipFn) => items && items.length ? `<div class="card"><h3>${title}</h3><div class="chips">${items.map(v =>
      `<a class="chip" href="#/anforderungen?${key}=${encodeURIComponent(v)}" title="${esc(tipFn ? tipFn(v) || '' : '')}">${esc(v)}</a>`).join('')}</div></div>` : '';
    aside.push(chipBlock('Nachweis / Dokumentation', r.doc, 'doc', v => V.docs[v] && V.docs[v].d));
    aside.push(chipBlock('Zielobjekte', r.to, 'to', v => V.targets[v] && V.targets[v].d));
    aside.push(chipBlock('Schlagwörter', r.tags, 'tag', v => V.tags[v]));
    if (r.tax) aside.push(`<div class="card"><h3>Taxonomie (Lösungskategorie)</h3><div class="small">${r.tax.map(esc).join(' › ')}</div></div>`);
    aside.push(`<div class="card"><h3>Enthalten in</h3><div class="linkrows">${r._cols.map(k => {
      const m = COLL[k].members[id];
      return `<a class="small" href="#/kollektion/${k}">${esc(COLL[k].title)}${m.label ? ` <span class="mono muted">(${esc(m.label)})</span>` : ''}</a>`;
    }).join('')}</div></div>`);

    $main.innerHTML = `
      <div class="crumbs">${crumbs.join('<span class="sep">›</span>')}${lastExplorerHash ? `<span style="margin-left:auto"><a href="${esc(lastExplorerHash)}">← Zur Ergebnisliste</a></span>` : ''}</div>
      <div class="d-head">
        <span class="d-id">${esc(r.id)}</span>
        <h1>${esc(r.t)}</h1>
        <div class="d-badges">${modalBadge(r.m)}${slBadge(r.sl)}${onlyBadge(r)}<span class="badge b-neutral" title="${esc(V.effort[r.e] || '')}">Aufwand ${esc(r.e != null ? r.e : '–')}</span>
          ${r.iso ? `<span class="badge b-neutral">ISO 27001: ${r.iso.length}</span>` : ''}${r.itgs ? `<span class="badge b-neutral">IT-GS 2023: ${r.itgs.length}</span>` : ''}${r.impl ? `<span class="badge b-ok">${plural(r.impl.length, 'Umsetzungsbeispiel', 'Umsetzungsbeispiele')}</span>` : ''}</div>
      </div>
      <div class="detail">
        <div>
          <div class="statement ${esc(r.m || '')}">${rich(r.s)}</div>
          ${anatomy}
          <div class="d-actions">
            ${bmButton(r.id, true)}
            <button class="btn" data-copy="${esc(r.id + ' ' + r.t + '\n' + plain(r.s))}">${icon('copy')}Text kopieren</button>
            <button class="btn" data-copy-link>${icon('link')}Link kopieren</button>
            <button class="btn" data-print>${icon('print')}Drucken</button>
          </div>
          <div style="height:22px"></div>
          ${sections.join('')}
          <nav class="pager" aria-label="Weitere Anforderungen">
            ${prev ? `<a class="card prev" href="#/a/${encodeURIComponent(prev.id)}"><small>← ${fromList === ORDER ? 'Vorherige' : 'Vorheriger Treffer'}</small><span><b class="mono">${esc(prev.id)}</b> ${esc(prev.t)}</span></a>` : '<span></span>'}
            ${next ? `<a class="card next" href="#/a/${encodeURIComponent(next.id)}"><small>${fromList === ORDER ? 'Nächste' : 'Nächster Treffer'} →</small><span><b class="mono">${esc(next.id)}</b> ${esc(next.t)}</span></a>` : ''}
          </nav>
        </div>
        <aside class="aside">${aside.join('')}</aside>
      </div>`;
    $main.querySelector('[data-copy-link]').addEventListener('click', () => copyText(location.href, 'Link kopiert'));
    $main.querySelector('[data-copy]').addEventListener('click', e => copyText(e.currentTarget.dataset.copy, 'Anforderungstext kopiert'));
    $main.querySelector('[data-print]').addEventListener('click', () => window.print());
  }

  function hint(text) {
    return text ? `<span class="hint" tabindex="0" title="${esc(text)}" aria-label="${esc(text)}">?</span>` : '';
  }
  function compType(t) {
    return { software: 'Software', service: 'Dienst', policy: 'Richtlinie', 'process-procedure': 'Prozess', plan: 'Plan', hardware: 'Hardware', guidance: 'Leitfaden' }[t] || t;
  }
  function implItemBody(it) {
    let h = `<div class="md">${md(it.d)}</div>`;
    if (it.sp) h += `<div class="sub-h">Parameterwerte</div><ul class="small">${it.sp.map(s => `<li><span class="mono">${esc(s.p)}</span>: ${esc((s.v || []).join(', '))}</li>`).join('')}</ul>`;
    if (it.cmd) h += `<div class="sub-h">Konfigurationsbefehle</div>${it.cmd.map(c => `<div class="md"><pre><code>${esc(c)}</code></pre></div>`).join('')}`;
    if (it.rm) h += `<div class="sub-h">Anmerkungen</div><div class="md">${md(it.rm)}</div>`;
    if (it.refs) h += `<ul class="refs">${it.refs.map(rf => `<li>${rf.h ? `<a href="${esc(rf.h)}" target="_blank" rel="noopener">${esc(rf.t)}</a>` : esc(rf.t)}</li>`).join('')}</ul>`;
    return h;
  }

  // --------------------------------------------------------------- Start
  function viewHome() {
    document.title = 'SdT Navigator – Stand-der-Technik-Bibliothek durchsuchen';
    const nMap = D.mappings.reduce((n, m) => n + m.rows.length, 0);
    const nImplReq = ORDER.filter(id => R[id].impl).length;
    const topTargets = Object.keys(COUNT.to).sort((a, b) => COUNT.to[b] - COUNT.to[a]).slice(0, 14);
    const nMuss = COUNT.m.MUSS || 0;
    const quickWins = COUNT.e['1'] || 0;

    const pracCol = g => {
      const items = D.practices.filter(p => (V.practices[p.id] || {}).fokus === g.k);
      return `<div class="prac-col"><h3>${esc(g.t)}</h3><p class="sub">${esc(g.d)}</p><div class="prac-list">${items.map(p => {
        const vp = V.practices[p.id] || {};
        return `<a class="card prac" href="#/anforderungen?pr=${encodeURIComponent(p.id)}" title="${esc(vp.d || p.d)}">
          <span class="pid">${esc(p.id)}</span><span class="pt">${esc(p.t)}<small>${esc(vp.aka || '')}</small></span><span class="pn">${p._n}</span></a>`;
      }).join('')}</div></div>`;
    };

    $main.innerHTML = `
      <section class="hero">
        <h1>Sicherheitsanforderungen finden statt suchen</h1>
        <p class="lead">Alle Anforderungen der Stand-der-Technik-Bibliothek des BSI, darunter Grundschutz++, Lieferkettensicherheit und WLAN, durchsuchbar und mit Mappings und Umsetzungsbeispielen verknüpft.</p>
        <div class="hero-search">
          ${icon('search')}
          <input id="heroQ" type="search" autocomplete="off" spellcheck="false" placeholder="Wonach suchen Sie? z. B. Passwort, Datensicherung, Firewall …" aria-label="Suche" aria-expanded="false">
          <div id="heroSuggest" class="suggest" role="listbox" hidden></div>
        </div>
        <div class="examples"><span>Beispiele:</span>
          ${['Passwort', 'Datensicherung', 'Protokollierung', 'Cloud', 'Schwachstellen', 'BER.6.1', 'ISO 8.13', 'OPS.1.1.3'].map(x => `<a class="chip" href="#" data-example="${esc(x)}">${esc(x)}</a>`).join('')}
        </div>
      </section>

      <div class="stats">
        <a class="card stat" href="#/anforderungen"><b>${fmtN(ORDER.length)}</b><span>Anforderungen</span></a>
        <a class="card stat" href="#/anforderungen?m=MUSS"><b>${fmtN(nMuss)}</b><span>davon MUSS</span></a>
        <a class="card stat" href="#/kollektionen"><b>${D.collections.length}</b><span>Kollektionen</span></a>
        <a class="card stat" href="#/mappings"><b>${fmtN(nMap)}</b><span>Mapping-Einträge (ISO, IT-GS)</span></a>
        <a class="card stat" href="#/umsetzungen"><b>${fmtN(nImplReq)}</b><span>Anforderungen mit Umsetzungsbeispiel</span></a>
      </div>

      <div class="section-title"><h2>Wo möchten Sie einsteigen?</h2></div>
      <div class="entry-grid">
        <div class="card entry">
          <h3>${icon('target')}Was wollen Sie absichern?</h3>
          <p>Anforderungen nach Zielobjekt, also nach dem Gegenstand, für den sie gelten.</p>
          <div class="chips">${topTargets.map(t => `<a class="chip" href="#/anforderungen?to=${encodeURIComponent(t)}" title="${esc(V.targets[t] ? V.targets[t].d : '')}">${esc(t)} <span class="muted">${COUNT.to[t]}</span></a>`).join('')}</div>
        </div>
        <div class="card entry">
          <h3>${icon('arrows')}Sie kommen von einem anderen Standard?</h3>
          <p>Sehen Sie, welche Grundschutz++-Anforderungen Ihren bisherigen Controls entsprechen.</p>
          <div class="chips">
            <a class="chip" href="#/mappings/iso">ISO/IEC 27001:2022 Anhang A</a>
            <a class="chip" href="#/mappings/itgs">IT-Grundschutz-Kompendium 2023</a>
          </div>
          <p class="small muted">Tipp: Geben Sie oben direkt eine ID wie „A.5.15“ oder „ORP.4“ ein.</p>
        </div>
        <div class="card entry">
          <h3>${icon('zap')}Schnell priorisieren</h3>
          <p>Vorgefilterte Listen für den Einstieg in die Umsetzung.</p>
          <div class="chips">
            <a class="chip" href="#/anforderungen?m=MUSS&lvl=top">Alle MUSS-Anforderungen</a>
            <a class="chip" href="#/anforderungen?e=1">Quick Wins (${quickWins})</a>
            <a class="chip" href="#/anforderungen?src=methodik">ISMS-Methodik</a>
            <a class="chip" href="#/anforderungen?sl=erh%C3%B6ht">Erhöhter Schutzbedarf</a>
            <a class="chip" href="#/anforderungen?has=impl">Mit Umsetzungsbeispiel</a>
          </div>
        </div>
      </div>

      <div class="section-title"><h2>Nach Praktik stöbern</h2><a href="#/glossar/praktiken" class="small">Was ist eine Praktik?</a></div>
      <div class="prac-cols">${PRACTICE_GROUPS.map(pracCol).join('')}</div>

      <div class="section-title"><h2>Kollektionen</h2><a href="#/kollektionen" class="small">Alle Kollektionen →</a></div>
      <div class="coll-grid">${D.collections.map(collCard).join('')}</div>
    `;
    const hq = document.getElementById('heroQ');
    attachSuggest(hq, document.getElementById('heroSuggest'));
    $main.querySelectorAll('[data-example]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      hq.value = a.dataset.example;
      hq.focus();
      hq.dispatchEvent(new Event('input'));
    }));
  }

  // ---------------------------------------------------------- Kollektionen
  function modalDist(ids) {
    const c = { MUSS: 0, SOLLTE: 0, KANN: 0 };
    ids.forEach(id => { const m = R[id] && R[id].m; if (c[m] != null) c[m]++; });
    const n = ids.length || 1;
    return `<div class="modal-bar" title="MUSS ${c.MUSS} · SOLLTE ${c.SOLLTE} · KANN ${c.KANN}">${['MUSS', 'SOLLTE', 'KANN'].map(k => `<i class="${k}" style="width:${(c[k] / n) * 100}%"></i>`).join('')}</div>
      <div class="legend"><span><i style="background:var(--muss)"></i>MUSS ${c.MUSS}</span><span><i style="background:var(--sollte)"></i>SOLLTE ${c.SOLLTE}</span><span><i style="background:var(--kann)"></i>KANN ${c.KANN}</span></div>`;
  }
  function collDesc(c) {
    const txt = plain(c.remarks || '').replace(/[#*>`]/g, '').replace(/\s+/g, ' ').replace(/^HINWEIS:\s*Dieses Dokument ist ein Entwurf\.\s*/i, '').trim();
    return txt.length > 220 ? txt.slice(0, 210).replace(/\s\S*$/, '') + ' …' : txt;
  }
  function collCard(c) {
    const ids = Object.keys(c.members);
    return `<a class="card coll" href="#/kollektion/${c.key}">
      <div class="chips"><span class="badge ${c.kind === 'Entwurf' ? 'b-draft' : 'b-neutral'}">${esc(c.kind)}</span></div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(collDesc(c))}</p>
      ${modalDist(ids)}
      <div class="cmeta"><span><b>${fmtN(ids.length)}</b> Anforderungen</span><span>Stand ${esc(fmtDate(c.modified))}</span></div>
    </a>`;
  }
  function viewCollections() {
    document.title = 'Kollektionen – SdT Navigator';
    $main.innerHTML = `<h1>Kollektionen</h1>
      <p class="muted" style="max-width:760px">Kollektionen sind veröffentlichte Zusammenstellungen von Anforderungen für einen bestimmten Zweck. Anwenderkataloge sind aus Profilen aufgelöst und direkt nutzbar. Viele Anforderungen kommen in mehreren Kollektionen vor und tragen dort dieselbe ID.</p>
      <div class="coll-grid" style="margin-top:18px">${D.collections.map(collCard).join('')}</div>`;
  }
  function viewCollection(key, params) {
    const c = COLL[key];
    if (!c) { $main.innerHTML = '<div class="empty">Kollektion nicht gefunden.</div>'; return; }
    document.title = `${c.title} – SdT Navigator`;
    const ids = Object.keys(c.members);
    const nAdj = ids.filter(id => c.members[id].s || c.members[id].g || c.members[id].t).length;
    function bodyHtml(q) {
      const re = buildHlRe(tokenize(q));
      const hits = q ? new Set(searchReqs(q, ids).map(x => x.id)) : null;
      function items(list, depth) {
        return list.map(id => {
          const r = R[id];
          const m = c.members[id] || {};
          const kids = m.ch ? items(m.ch, depth + 1) : '';
          if (!r || (hits && !hits.has(id) && !kids)) return kids;
          const adj = m.s || m.g || m.t;
          const view = Object.assign({}, r, { t: m.t || r.t, s: m.s || r.s, m: m.m || r.m, _depth: depth });
          let html = reqItem(view, re);
          if (m.label || adj) {
            html = html.replace('<span class="r-badges">', `<span class="r-badges">${m.label ? `<span class="chip id" title="Nummer in dieser Kollektion">${esc(m.label)}</span>` : ''}${adj ? '<span class="badge b-ok" title="Text in dieser Kollektion gegenüber Grundschutz++ angepasst">angepasst</span>' : ''}`);
          }
          return html + kids;
        }).join('');
      }
      function grp(g, level) {
        const inner = items(g.items, 0) + (g.groups || []).map(s => grp(s, level + 1)).join('');
        if (!inner.trim()) return '';
        const head = level === 0
          ? `<div class="group-h"><span class="gid">${esc(g.label || g.id)}</span><h2>${esc(g.t)}</h2></div>`
          : `<div class="topic-h"><span class="gid">${esc(g.label || g.id)}</span>${esc(g.t)}</div>`;
        return head + `<div class="rlist">${inner}</div>`;
      }
      return c.groups.map(g => grp(g, 0)).join('') || '<div class="card empty">Keine Treffer</div>';
    }
    const q = params.q || '';
    const remarksHtml = md(c.remarks || '');
    $main.innerHTML = `
      <div class="crumbs"><a href="#/kollektionen">Kollektionen</a><span class="sep">›</span><span>${esc(c.short)}</span></div>
      <div class="card pad" style="margin-bottom:18px">
        <div class="chips" style="margin-bottom:8px"><span class="badge ${c.kind === 'Entwurf' ? 'b-draft' : 'b-neutral'}">${esc(c.kind)}</span><span class="small muted">Stand ${esc(fmtDate(c.modified))}</span></div>
        <h1>${esc(c.title)}</h1>
        <div class="md coll-remarks" id="collRemarks">${remarksHtml}</div>
        ${remarksHtml.length > 1500 ? '<button class="more-btn" id="collMore">Vollständige Beschreibung anzeigen</button>' : ''}
        <div style="max-width:420px;margin:14px 0 6px">${modalDist(ids)}</div>
        <p class="small muted" style="margin:10px 0 0">${fmtN(ids.length)} Anforderungen${nAdj ? ` · ${nAdj} davon gegenüber Grundschutz++ angepasst` : ''} · Datei: <code>${esc(c.file)}</code></p>
        ${c.refs.length ? `<div class="sub-h">Referenzen</div><ul class="refs">${c.refs.map(rf => `<li>${rf.h ? `<a href="${esc(rf.h)}" target="_blank" rel="noopener">${esc(rf.t)}</a>` : esc(rf.t)}</li>`).join('')}</ul>` : ''}
        <div class="d-actions"><a class="btn primary" href="#/anforderungen?col=${key}">${icon('filter')}Im Explorer filtern</a>
          <button class="btn" id="collCsv">${icon('download')}Als CSV exportieren</button></div>
      </div>
      <div class="local-search">${icon('search')}<input id="collQ" class="input" type="search" placeholder="In dieser Kollektion suchen …" value="${esc(q)}"></div>
      <div id="collBody">${bodyHtml(q)}</div>`;
    const more = document.getElementById('collMore');
    if (more) more.addEventListener('click', () => { document.getElementById('collRemarks').classList.add('open'); more.remove(); });
    document.getElementById('collCsv').addEventListener('click', () => exportCsv(ids.filter(id => R[id]).sort((a, b) => R[a]._i - R[b]._i), `sdt-${key}.csv`));
    const qi = document.getElementById('collQ');
    let t;
    qi.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const nq = qi.value.trim();
        history.replaceState(null, '', `#/kollektion/${key}` + (nq ? '?q=' + encodeURIComponent(nq) : ''));
        lastRoute = location.hash;
        document.getElementById('collBody').innerHTML = bodyHtml(nq);
      }, 120);
    });
    navList = ids.filter(id => R[id]).sort((a, b) => R[a]._i - R[b]._i);
    lastExplorerHash = '';
  }

  // ------------------------------------------------------------- Mappings
  function viewMappings(key, params) {
    key = key || 'iso';
    const M = MAP[key];
    if (!M) { location.hash = '#/mappings/iso'; return; }
    document.title = `Mapping ${M.src} – SdT Navigator`;
    const q = params.q || '';
    const tabs = `<nav class="tabs">${D.mappings.map(m => `<a href="#/mappings/${m.key}" class="${m.key === key ? 'active' : ''}">${esc(m.title)} <span class="n">${fmtN(m.rows.length)}</span></a>`).join('')}</nav>`;
    const intro = key === 'iso'
      ? `<p class="muted" style="max-width:820px">Welche Grundschutz++-Anforderungen decken die Controls aus ISO/IEC 27001:2022 Anhang A ab? Das Mapping wurde manuell erstellt und qualitätsgesichert (Version ${esc(M.version)}). Die Titel der ISO-Controls sind urheberrechtlich geschützt und nicht enthalten.${M.missing ? ` ${M.missing} Verweise zeigen auf IDs, die im aktuellen Katalog nicht (mehr) existieren; sie sind grau markiert.` : ''}</p>`
      : `<div class="note" style="max-width:820px;margin-bottom:14px"><b>Entwurfsstand:</b> Dieses Mapping ist als Entwurf veröffentlicht (${esc(M.mtitle)}). ${fmtN(M.defaulted)} Beziehungen sind als Standardwert („∩ Überschneidung“) gesetzt und nicht fachlich geprüft – sie sind mit * gekennzeichnet.${M.renamed ? ` Das Mapping referenziert einen älteren Katalogstand: ${M.renamed} Verweise wurden über ihre UUID der heutigen ID zugeordnet (Hinweis „vorher …“).` : ''}${M.missing ? ` ${M.missing} Verweise sind nicht auflösbar und grau markiert.` : ''}</div>
         <p class="muted" style="max-width:820px">Für Umsteiger vom IT-Grundschutz-Kompendium 2023: Zu jeder Anforderung eines Bausteins sehen Sie die entsprechenden Grundschutz++-Anforderungen.</p>`;
    const nq = norm(q).replace(/^iso\s*/, '').replace(/^a\./, '');
    const rowMatch = row => {
      if (!nq) return true;
      if (norm(row.id).startsWith(nq) || norm(row.id) === nq) return true;
      if (key === 'itgs' && norm(row._p.bst) === nq) return true;
      return row.maps.some(m => m.t.some(t => norm(t).startsWith(nq) || (R[t] && R[t]._nt.indexOf(nq) >= 0)));
    };
    const rows = M.rows.filter(rowMatch);

    function targetsHtml(row) {
      return row.maps.map(m => `<div style="margin-bottom:6px">${relBadge(m.r, m.d)}<div class="tgt-list" style="margin-top:4px">${m.t.map(t => R[t]
        ? `<a class="tgt" href="#/a/${encodeURIComponent(t)}"><span class="ti">${esc(t)}</span><span class="tt">${esc(R[t].t)}</span>${modalBadge(R[t].m)}${m.o && m.o[t] ? `<span class="small muted" title="Im Mapping-Dokument als ${esc(m.o[t])} referenziert (älterer Katalogstand). Über die UUID dem aktuellen Katalog zugeordnet.">vorher ${esc(m.o[t])}</span>` : ''}</a>`
        : `<span class="tgt missing" title="Diese ID ist im aktuellen Katalog nicht (mehr) enthalten"><span class="ti">${esc(t)}</span><span class="muted small">nicht im aktuellen Katalog</span></span>`).join('')}</div></div>`).join('');
    }
    function tableHtml(list, label) {
      return `<table class="mtable"><thead><tr><th style="width:170px">${label}</th><th>Grundschutz++</th></tr></thead><tbody>${list.map(row => `<tr id="m-${esc(row.id)}">
        <td class="src">${key === 'iso' ? 'A.' : ''}${esc(row.id)}${row.thr ? `<div class="thr-mini">${row.thr.map(t => `<span title="${esc(V.threats[t] ? V.threats[t].t : '')}">${esc(t)}</span>`).join(', ')}</div>` : ''}</td>
        <td>${targetsHtml(row)}</td></tr>`).join('')}</tbody></table>`;
    }

    let nav = '', body = '';
    if (key === 'iso') {
      const themes = {};
      rows.forEach(r => { const t = r.id.split('.')[0]; (themes[t] = themes[t] || []).push(r); });
      nav = `<div class="mn-h">Themen</div>` + Object.keys(ISO_THEMES).map(t => `<a href="#/mappings/iso${q ? '?q=' + encodeURIComponent(q) : ''}" data-jump="th-${t}"><span>${t} ${esc(ISO_THEMES[t])}</span><span class="muted">${(themes[t] || []).length}</span></a>`).join('');
      body = Object.keys(ISO_THEMES).filter(t => themes[t]).map(t => `<div class="card bst" id="th-${t}"><h3><span class="gid">A.${t}</span>${esc(ISO_THEMES[t])}<span class="n">${themes[t].length} Controls</span></h3>${tableHtml(themes[t], 'ISO-Control')}</div>`).join('');
    } else {
      const layers = {};
      rows.forEach(r => { const L = r._p.layer; (layers[L] = layers[L] || {}); (layers[L][r._p.bst] = layers[L][r._p.bst] || []).push(r); });
      const allLayers = Object.keys(ITGS_LAYERS).filter(L => layers[L]).concat(Object.keys(layers).filter(L => !ITGS_LAYERS[L]));
      const selLayer = params.layer && layers[params.layer] ? params.layer : (q ? null : allLayers[0]);
      nav = `<div class="mn-h">Schichten</div>` + allLayers.map(L => {
        const n = Object.values(layers[L]).reduce((a, b) => a + b.length, 0);
        return `<a href="#/mappings/itgs?layer=${L}${q ? '&q=' + encodeURIComponent(q) : ''}" class="${selLayer === L ? 'active' : ''}"><span><b class="mono">${L}</b> ${esc(ITGS_LAYERS[L] || '')}</span><span class="muted">${n}</span></a>`;
      }).join('');
      const showLayers = selLayer ? [selLayer] : allLayers;
      body = showLayers.map(L => Object.keys(layers[L]).sort(cmpId).map(b => {
        const list = layers[L][b].slice().sort((x, y) => {
          const ax = parseInt(x._p.anf.slice(1), 10), ay = parseInt(y._p.anf.slice(1), 10);
          return ax - ay || (parseInt(x._p.ua || '0', 10) - parseInt(y._p.ua || '0', 10));
        });
        const tgtIds = uniq([].concat.apply([], list.map(r => [].concat.apply([], r.maps.map(m => m.t)))));
        return `<div class="card bst" id="b-${esc(b)}"><h3><span class="gid">${esc(b)}</span>Baustein<span class="n">${list.length} Anforderungen → ${tgtIds.length} GS++-Anforderungen</span></h3>${tableHtml(list, 'IT-GS-Anforderung')}</div>`;
      }).join('')).join('');
      if (selLayer && !q) nav += '';
    }
    $main.innerHTML = `<h1>Mappings</h1>${tabs}${intro}
      <div class="local-search">${icon('search')}<input id="mapQ" class="input" type="search" placeholder="${key === 'iso' ? 'ISO-Control (z. B. 5.15) oder GS++-ID/Begriff filtern …' : 'Baustein oder Anforderung (z. B. OPS.1.1.3, SYS.2.1.A4) oder GS++-ID/Begriff …'}" value="${esc(q)}"></div>
      <p class="small muted">${q ? `${fmtN(rows.length)} von ${fmtN(M.rows.length)} Einträgen passen zu „${esc(q)}“. <a href="#/mappings/${key}">Filter zurücksetzen</a>` : `${fmtN(M.rows.length)} Einträge · Stand ${esc(fmtDate(M.modified))}`}</p>
      <div class="map-layout"><nav class="map-nav" aria-label="Gliederung">${nav}</nav><div>${body || '<div class="card empty">Keine Einträge gefunden.</div>'}</div></div>`;
    const mq = document.getElementById('mapQ');
    let t;
    mq.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const v = mq.value.trim();
        const pos = mq.selectionStart;
        history.replaceState(null, '', `#/mappings/${key}` + (v ? '?q=' + encodeURIComponent(v) : ''));
        lastRoute = location.hash;
        viewMappings(key, { q: v });
        const n = document.getElementById('mapQ');
        n.focus(); n.setSelectionRange(pos, pos);
      }, 200);
    });
    $main.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById(a.dataset.jump);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    if (q && rows.length === 1) {
      const el = document.getElementById('m-' + rows[0].id);
      if (el) el.style.background = 'var(--brand-soft)';
    }
  }

  // ----------------------------------------------------------- Umsetzungen
  function implStats(doc) {
    const ids = uniq([].concat.apply([], doc.comps.map(c => c.items.filter(i => !i.x).map(i => i.id))));
    return { ids, nItems: doc.comps.reduce((n, c) => n + c.items.length, 0) };
  }
  function viewImpls() {
    document.title = 'Umsetzungsbeispiele – SdT Navigator';
    $main.innerHTML = `<h1>Umsetzungsbeispiele</h1>
      <p class="muted" style="max-width:820px">Komponentendefinitionen beschreiben wiederverwendbar, wie Produkte, Dienste, Richtlinien oder Prozesse Anforderungen erfüllen. Sie sind Vorlagen und ersetzen nicht die eigene Umsetzung. Auf jeder Anforderungsseite sehen Sie die passenden Beispiele.</p>
      <div class="impl-grid" style="margin-top:18px">${D.impls.map(doc => {
        const st = implStats(doc);
        const types = uniq(doc.comps.map(c => compType(c.type)));
        const desc = plain(doc.remarks || doc.comps.map(c => c.t).join(', ')).replace(/[#*`]/g, '').replace(/\s+/g, ' ');
        return `<a class="card coll" href="#/umsetzung/${doc.key}">
          <div class="chips">${doc.draft ? '<span class="badge b-draft">Entwurf</span>' : ''}${types.map(t => `<span class="badge b-neutral">${esc(t)}</span>`).join('')}</div>
          <h3 title="${esc(doc.title)}">${esc(doc.title.replace(/^Entwurf\s+/, ''))}</h3>
          <p>${esc(desc.length > 220 ? desc.slice(0, 210).replace(/\s\S*$/, '') + ' …' : desc)}</p>
          <div class="cmeta"><span><b>${doc.comps.length}</b> Komponenten</span><span><b>${st.ids.length}</b> Anforderungen abgedeckt</span>${doc.caps.length ? `<span>${doc.caps.length} Fähigkeiten</span>` : ''}</div>
        </a>`;
      }).join('')}</div>`;
  }
  function viewImpl(key, compIdx) {
    const doc = IMPL[key];
    if (!doc) { $main.innerHTML = '<div class="empty">Nicht gefunden.</div>'; return; }
    document.title = `${doc.title} – SdT Navigator`;
    const st = implStats(doc);
    $main.innerHTML = `
      <div class="crumbs"><a href="#/umsetzungen">Umsetzungsbeispiele</a><span class="sep">›</span><span>${esc(doc.title)}</span></div>
      <div class="card pad" style="margin-bottom:18px">
        <div class="chips" style="margin-bottom:8px">${doc.draft ? '<span class="badge b-draft">Entwurf</span>' : ''}<span class="small muted">Version ${esc(doc.version)}${doc.modified ? ' · Stand ' + esc(fmtDate(doc.modified)) : ''}</span></div>
        <h1>${esc(doc.title)}</h1>
        ${doc.remarks ? `<div class="md">${md(doc.remarks)}</div>` : ''}
        ${doc.imports.length ? `<div class="sub-h">Nutzt weitere Komponenten</div>${doc.imports.map(x => `<div class="md small">${md(x)}</div>`).join('')}` : ''}
        <p class="small muted" style="margin:10px 0 0">${doc.comps.length} Komponenten · ${st.nItems} Umsetzungsbeschreibungen · ${st.ids.length} Anforderungen · Datei: <code>${esc(doc.file)}</code></p>
        <div class="d-actions"><a class="btn" href="#/anforderungen?has=impl">${icon('filter')}Alle Anforderungen mit Umsetzungsbeispiel</a></div>
      </div>
      ${doc.caps.length ? `<h2>Fähigkeiten</h2><p class="small muted">Fähigkeiten (Capabilities) bündeln mehrere Komponenten zu einer Gesamtleistung.</p>${doc.caps.map(c => `<div class="card cap"><h4>${esc(c.t)}</h4><div class="md small">${md(c.d)}</div>${c.comps.length ? `<div class="chips">${c.comps.filter(Boolean).map(t => {
        const i = doc.comps.findIndex(x => x.t === t);
        return `<a class="chip" href="#/umsetzung/${key}/${i}">${esc(t)}</a>`;
      }).join('')}</div>` : ''}</div>`).join('')}<div style="height:18px"></div>` : ''}
      <h2>Komponenten</h2>
      <div class="toc">${doc.comps.map((c, i) => `<a class="chip" href="#/umsetzung/${key}/${i}">${esc(c.t)} <span class="muted">${c.items.length}</span></a>`).join('')}</div>
      ${doc.comps.map((c, i) => `<section class="card comp" id="comp-${i}">
        <header><h3>${esc(c.t)} <span class="badge b-neutral">${esc(compType(c.type))}</span></h3>
          ${c.tax ? `<div class="small muted">${c.tax.map(esc).join(' › ')}</div>` : ''}</header>
        <div class="cbody"><details${c.d.length < 900 ? ' open' : ''}><summary class="small" style="cursor:pointer;color:var(--brand);margin-bottom:6px">Beschreibung</summary><div class="md">${md(c.d)}</div>${c.purpose ? `<div class="md small"><b>Zweck:</b> ${esc(c.purpose)}</div>` : ''}${c.rm ? `<div class="md small">${md(c.rm)}</div>` : ''}</details></div>
        ${c.items.length ? `<div class="sub-h" style="padding:0 18px">Umgesetzte Anforderungen (${c.items.length})</div>` : ''}
        ${c.items.map(it => {
          const r = R[it.id];
          return `<details class="ir"><summary><span class="ti">${esc(it.id)}</span><span>${r ? esc(r.t) : '<span class="muted">Anforderung nicht im Katalog gefunden</span>'}</span>${r ? `<span style="margin-left:auto">${modalBadge(r.m)}</span>` : ''}</summary>
            <div class="irbody">${r ? `<p class="small" style="margin-bottom:8px"><a href="#/a/${encodeURIComponent(r.id)}">Anforderung ${esc(r.id)} öffnen →</a> <span class="muted">${esc(plain(r.s))}</span></p>` : ''}${implItemBody(it)}</div></details>`;
        }).join('')}
      </section>`).join('')}`;
    if (compIdx != null) {
      const el = document.getElementById('comp-' + compIdx);
      if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 30);
    }
  }

  // --------------------------------------------------------------- Glossar
  const GLOSSARY = [
    { k: 'begriffe', t: 'Begriffe', items: () => V.terms.map(x => ({ id: x.t, t: x.t, d: x.d, meta: x.syn ? 'Synonyme: ' + x.syn : '' })) },
    { k: 'praktiken', t: 'Praktiken', items: () => D.practices.map(p => { const vp = V.practices[p.id] || {}; return { id: p.id, code: p.id, t: p.t, d: vp.d || p.d, meta: [vp.fokus && 'Schwerpunkt: ' + vp.fokus, vp.aka && 'Auch: ' + vp.aka].filter(Boolean).join(' · '), n: ORDER.filter(id => R[id].pr === p.id).length, href: '#/anforderungen?pr=' + p.id }; }) },
    { k: 'themen', t: 'Themen', items: () => Object.keys(V.topics).sort((a, b) => a.localeCompare(b, 'de')).map(t => { const tids = Object.keys(TP).filter(id => TP[id].t === t); return { id: t, t, d: V.topics[t], chips: tids.map(id => `<a class="chip id" href="#/anforderungen?pr=${TP[id].pr}&tp=${encodeURIComponent(id)}">${esc(id)}</a>`).join('') }; }) },
    { k: 'zielobjekte', t: 'Zielobjekte', items: () => Object.keys(V.targets).sort((a, b) => a.localeCompare(b, 'de')).map(k => { const x = V.targets[k]; return { id: k, t: k, d: x.d, meta: [x.typ && 'Typ: ' + x.typ, x.kat && 'Kategorie: ' + x.kat, x.ex && 'Beispiele: ' + x.ex, x.syn && 'Synonyme: ' + x.syn].filter(Boolean).join(' · '), n: COUNT.to[k] || 0, href: '#/anforderungen?to=' + encodeURIComponent(k) }; }) },
    { k: 'dokumentation', t: 'Dokumentation', items: () => Object.keys(V.docs).sort((a, b) => a.localeCompare(b, 'de')).map(k => { const x = V.docs[k]; return { id: k, t: k, d: x.d, meta: [x.kat && 'Kategorie: ' + x.kat, x.zg && 'Zielgruppe: ' + x.zg].filter(Boolean).join(' · '), n: COUNT.doc[k] || 0, href: '#/anforderungen?doc=' + encodeURIComponent(k) }; }) },
    { k: 'schlagwoerter', t: 'Schlagwörter', items: () => uniq(Object.keys(V.tags).concat(Object.keys(COUNT.tags))).sort((a, b) => a.localeCompare(b, 'de')).map(k => ({ id: k, t: k, d: V.tags[k] || '', n: COUNT.tags[k] || 0, href: '#/anforderungen?tag=' + encodeURIComponent(k) })) },
    { k: 'gefaehrdungen', t: 'Elementare Gefährdungen', items: () => Object.keys(V.threats).map(k => ({ id: k, code: k, t: V.threats[k].t, d: V.threats[k].d, n: COUNT.thr[k] || 0, href: '#/anforderungen?thr=' + encodeURIComponent(k) })) },
    { k: 'taetigkeiten', t: 'Tätigkeiten', items: () => Object.keys(V.actions).sort((a, b) => a.localeCompare(b, 'de')).map(k => { const x = V.actions[k]; return { id: k, t: k, d: x.d, meta: [x.typ && 'Typ: ' + x.typ, x.nom && 'Nominalisierung: ' + x.nom, x.syn && 'Synonyme: ' + x.syn].filter(Boolean).join(' · '), n: COUNT.a[k] || 0, href: '#/anforderungen?a=' + encodeURIComponent(k) }; }) },
    { k: 'skalen', t: 'Bewertungsskalen', items: () => [].concat(
      Object.keys(V.modal).map(k => ({ id: 'modal-' + k, code: 'Modalverb', t: k, d: V.modal[k], n: COUNT.m[k] || 0, href: '#/anforderungen?m=' + k })),
      Object.keys(V.effort).map(k => ({ id: 'effort-' + k, code: 'Aufwand ' + k, t: EFFORT_LABEL[k] || k, d: V.effort[k], n: COUNT.e[k] || 0, href: '#/anforderungen?e=' + k })),
      Object.keys(V.secLevel).map(k => ({ id: 'sl-' + k, code: 'Sicherheitsniveau', t: SL_LABEL[k] || k, d: V.secLevel[k], href: '#/anforderungen?sl=' + encodeURIComponent(k) })),
      V.goals.map(g => ({ id: 'goal-' + g.t, code: 'Schutzziel', t: g.t, d: g.d })),
      Object.keys(V.goalLevels).map(k => ({ id: 'gl-' + k, code: 'Wirkungsstufe ' + k, t: GOAL_LEVEL[k] || k, d: V.goalLevels[k] })),
      [{ id: 'rel-required', code: 'Beziehung', t: 'Abhängigkeit', d: V.relations.required }, { id: 'rel-enh', code: 'Beziehung', t: 'Verbesserung (Unteranforderung)', d: V.relations.enhancement }, { id: 'rel-related', code: 'Beziehung', t: 'Verwandtschaft', d: V.relations.related }]
    ) }
  ];
  function viewGlossary(key, params) {
    const tab = GLOSSARY.find(g => g.k === key) || GLOSSARY[0];
    document.title = `Glossar: ${tab.t} – SdT Navigator`;
    const q = params.q || '';
    const all = tab.items();
    const nq = norm(q);
    const items = nq ? all.filter(x => norm(x.t + ' ' + (x.code || '') + ' ' + x.d + ' ' + (x.meta || '')).indexOf(nq) >= 0) : all;
    const re = buildHlRe(tokenize(q));
    $main.innerHTML = `<h1>Glossar</h1>
      <p class="muted" style="max-width:820px">Kontrollierte Vokabulare der Bibliothek (<code>documentation/namespaces</code>). Über die Zahl rechts gelangen Sie zu den Anforderungen mit diesem Merkmal.</p>
      <div class="gl-layout" style="margin-top:16px">
        <nav class="gl-nav" aria-label="Kategorien">${GLOSSARY.map(g => `<a href="#/glossar/${g.k}" class="${g.k === tab.k ? 'active' : ''}"><span>${esc(g.t)}</span><span class="n">${g.items().length}</span></a>`).join('')}</nav>
        <div>
          <div class="local-search">${icon('search')}<input id="glQ" class="input" type="search" placeholder="${esc(tab.t)} durchsuchen …" value="${esc(q)}"></div>
          <div class="gl-list">${items.map(x => `<div class="card gl-item${params.id === x.id ? ' target' : ''}" id="g-${esc(x.id)}">
            <h3>${x.code ? `<span class="gid">${esc(x.code)}</span>` : ''}${hl(x.t, re)}</h3>
            ${x.d ? `<p>${hl(x.d, re)}</p>` : '<p class="muted">Keine Definition hinterlegt.</p>'}
            ${x.meta || x.n != null || x.chips ? `<div class="gl-meta">${x.meta ? `<span>${hl(x.meta, re)}</span>` : ''}${x.chips ? `<span class="chips">${x.chips}</span>` : ''}${x.n != null ? (x.n ? `<a class="gl-count" href="${x.href}">${plural(x.n, 'Anforderung', 'Anforderungen')} →</a>` : '<span class="gl-count muted">nicht verwendet</span>') : ''}</div>` : ''}
          </div>`).join('') || '<div class="card empty">Keine Einträge gefunden.</div>'}</div>
        </div>
      </div>`;
    const gq = document.getElementById('glQ');
    let t;
    gq.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const v = gq.value.trim();
        const pos = gq.selectionStart;
        history.replaceState(null, '', `#/glossar/${tab.k}` + (v ? '?q=' + encodeURIComponent(v) : ''));
        lastRoute = location.hash;
        viewGlossary(tab.k, { q: v });
        const n = document.getElementById('glQ');
        n.focus(); n.setSelectionRange(pos, pos);
      }, 150);
    });
    if (params.id) {
      const el = document.getElementById('g-' + params.id);
      if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 30);
    }
  }

  // ------------------------------------------------------------- Merkliste
  function viewBookmarks(params) {
    document.title = 'Merkliste – SdT Navigator';
    const shared = params.ids ? params.ids.split(',').filter(id => R[id]) : null;
    const list = shared || bookmarks;
    const sorted = list.slice().sort((a, b) => R[a]._i - R[b]._i);
    navList = sorted;
    lastExplorerHash = '';
    $main.innerHTML = `<h1>${shared ? 'Geteilte Liste' : 'Merkliste'}</h1>
      <p class="muted" style="max-width:760px">${shared ? 'Diese Liste wurde per Link geteilt. Sie können sie in Ihre eigene Merkliste übernehmen.' : 'Merken Sie sich Anforderungen mit dem Stern. Die Liste wird nur in diesem Browser gespeichert und lässt sich als CSV exportieren oder als Link teilen.'}</p>
      ${list.length ? `<div class="d-actions" style="margin-bottom:16px">
        ${shared ? `<button class="btn primary" id="bmTake">${icon('star')}In meine Merkliste übernehmen</button>` : ''}
        <button class="btn" id="bmCsv">${icon('download')}CSV exportieren</button>
        <button class="btn" id="bmMd">${icon('copy')}Als Text kopieren</button>
        ${shared ? '' : `<button class="btn" id="bmShare">${icon('link')}Link zum Teilen kopieren</button><button class="btn" id="bmClear">${icon('x')}Liste leeren</button>`}
      </div>
      <p class="small muted">${plural(list.length, 'Anforderung', 'Anforderungen')}</p>
      <div class="rlist">${sorted.map(id => reqItem(R[id], null, { flat: true, showParent: true })).join('')}</div>`
      : `<div class="card empty">${icon('star')}<h2>Noch nichts gemerkt</h2><p>Klicken Sie bei einer Anforderung auf den Stern, um sie hier zu sammeln.</p><a class="btn primary" href="#/anforderungen">Anforderungen durchsuchen</a></div>`}`;
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    on('bmCsv', () => exportCsv(sorted, 'sdt-merkliste.csv'));
    on('bmMd', () => copyText(sorted.map(id => `- ${id} ${R[id].t} (${R[id].m}): ${plain(R[id].s)}`).join('\n'), 'Liste kopiert'));
    on('bmShare', () => copyText(location.href.split('#')[0] + '#/merkliste?ids=' + sorted.join(','), 'Link kopiert'));
    on('bmClear', () => { if (confirm('Merkliste wirklich leeren?')) { bookmarks = []; store.set('sdt-bookmarks', bookmarks); updateBmCount(); viewBookmarks({}); } });
    on('bmTake', () => { bookmarks = uniq(bookmarks.concat(shared)); store.set('sdt-bookmarks', bookmarks); updateBmCount(); toast('Übernommen'); location.hash = '#/merkliste'; });
  }

  // --------------------------------------------------------------- Router
  let lastRoute = null;
  function route() {
    const h = location.hash || '#/';
    if (h === lastRoute) return;
    const prevRoute = lastRoute;
    lastRoute = h;
    const [path, qs] = h.slice(1).split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const params = parseQuery(qs);
    const top = parts[0] || '';
    document.querySelectorAll('.mainnav a').forEach(a => {
      const n = a.dataset.nav;
      a.classList.toggle('active', n === top || (n === 'anforderungen' && top === 'a') || (n === 'kollektionen' && top === 'kollektion') || (n === 'umsetzungen' && top === 'umsetzung'));
    });
    document.getElementById('mainnav').classList.remove('open');
    if (top !== 'anforderungen') ex.mounted = false;
    const samePage = prevRoute && prevRoute.split('?')[0] === h.split('?')[0] && (top === 'mappings' || top === 'glossar');
    switch (top) {
      case '': viewHome(); break;
      case 'anforderungen': viewExplorer(params); break;
      case 'a': viewDetail(parts[1]); break;
      case 'kollektionen': viewCollections(); break;
      case 'kollektion': viewCollection(parts[1], params); break;
      case 'mappings': viewMappings(parts[1], params); break;
      case 'umsetzungen': viewImpls(); break;
      case 'umsetzung': viewImpl(parts[1], parts[2] != null ? parseInt(parts[2], 10) : null); break;
      case 'glossar': viewGlossary(parts[1], params); break;
      case 'merkliste': viewBookmarks(params); break;
      default: $main.innerHTML = '<div class="card empty"><h2>Seite nicht gefunden</h2><p><a href="#/">Zur Startseite</a></p></div>';
    }
    if (!(top === 'umsetzung' && parts[2] != null) && !(top === 'glossar' && params.id) && !samePage) window.scrollTo(0, 0);
  }

  // ------------------------------------------------------- Globale Events
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-bm]');
    if (b) { e.preventDefault(); e.stopPropagation(); toggleBm(b.dataset.bm); return; }
    // Mobiles Filter-Panel schließen, wenn außerhalb getippt wird
    const fl = document.getElementById('filters');
    if (fl && fl.classList.contains('open') && !fl.contains(e.target) && !e.target.closest('[data-open-filters]')) fl.classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      document.getElementById('gsearch').focus();
    }
  });
  document.getElementById('menuBtn').addEventListener('click', () => {
    const nav = document.getElementById('mainnav');
    nav.classList.toggle('open');
    document.getElementById('menuBtn').setAttribute('aria-expanded', nav.classList.contains('open'));
  });
  document.getElementById('themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sdt-theme', next); } catch (err) { /* ignorieren */ }
  });
  attachSuggest(document.getElementById('gsearch'), document.getElementById('gsuggest'));
  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);
  document.getElementById('buildInfo').textContent = `Datenstand: ${fmtDate(D.built)} · ${fmtN(ORDER.length)} Anforderungen aus ${D.collections.length} Kollektionen`;
  updateBmCount();
  route();
})();
