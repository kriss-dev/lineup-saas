(function () {
  'use strict';

/* Boîte à outils commune aux deux applications. */

const { icon, ETATS, SOUS_ETATS, RESEAUX, membre } = window.LU;

/* ---------------- Format ---------------- */

const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const p2 = (n) => String(n).padStart(2, '0');
const heure = (d) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
const jourCourt = (d) => `${JOURS[d.getDay()]} ${p2(d.getDate())}`;
const dateCourte = (d) => `${p2(d.getDate())} ${MOIS[d.getMonth()]}`;
const dateLongue = (d) => `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
const euros = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
const nombre = (n) => new Intl.NumberFormat('fr-FR').format(n);

const memeJour = (a, b) => a.toDateString() === b.toDateString();

/** « dans 3 j », « il y a 2 h », « à l'instant ». */
function relatif(d, ref = new Date()) {
  const s = (d - ref) / 1000;
  const abs = Math.abs(s);
  const futur = s > 0;
  const fmt = (v, u) => (futur ? `dans ${v} ${u}` : `il y a ${v} ${u}`);
  if (abs < 60) return 'à l’instant';
  if (abs < 3600) return fmt(Math.round(abs / 60), 'min');
  if (abs < 86400) return fmt(Math.round(abs / 3600), 'h');
  if (abs < 86400 * 30) return fmt(Math.round(abs / 86400), 'j');
  return fmt(Math.round(abs / 2592000), 'mois');
}

/** Compte à rebours compact : « 2 j 04 h », « 6 h 12 », « 42 min ».
    Jamais au format hh:mm — un décompte ne doit pas se lire comme une heure. */
function rebours(d, ref = new Date()) {
  const s = Math.round((d - ref) / 1000);
  const a = Math.abs(s);
  const j = Math.floor(a / 86400);
  const h = Math.floor((a % 86400) / 3600);
  const m = Math.floor((a % 3600) / 60);
  const txt = j > 0 ? `${j} j ${p2(h)} h` : h > 0 ? `${h} h ${p2(m)}` : `${m} min`;
  return { texte: txt, passe: s < 0 };
}

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- Fragments d'interface ---------------- */

/** Pastille + libellé d'état. La couleur ne porte jamais seule le sens.
    `voix: 'client'` remplace le code d'antenne par ce qu'un client peut lire. */
function etatChip(cle, { taille = 'sm', voix = 'regie' } = {}) {
  const e = ETATS[cle] || SOUS_ETATS[cle] || { court: cle, pip: 'idle' };
  const h = taille === 'xs' ? 'h-[19px] text-[9.5px]' : 'h-[21px] text-[9.5px]';
  const mot = voix === 'client' ? (e.client || e.long || e.court) : e.court;
  const casse = voix === 'client' ? 'normal-case tracking-[.04em]' : '';
  return `<span class="chip ${h} ${casse}" title="${escape(e.long || e.court)}">
    <i class="pip pip-${e.pip}"></i>${escape(mot)}</span>`;
}

function reseauGlyphe(cle, size = 14, cls = 'opacity-80') {
  const r = RESEAUX[cle];
  if (!r) return '';
  return `<span title="${r.label}" aria-label="${r.label}" class="inline-flex">${icon(r.icon, size, cls)}</span>`;
}

function avatar(id, size = 24) {
  const m = membre(id);
  if (!m) return '';
  return `<span class="mono inline-flex items-center justify-center rounded-full shrink-0"
    title="${escape(m.prenom)} ${escape(m.nom)} — ${escape(m.role)}"
    style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px;letter-spacing:0;
    background:${m.couleur}22;color:${m.couleur};border:1px solid ${m.couleur}55">${m.initiales}</span>`;
}

function pileAvatars(ids, size = 22) {
  return `<span class="flex -space-x-1.5">${ids.map((i) => avatar(i, size)).join('')}</span>`;
}

/** Jauge horizontale sobre. `ton` = live | wait | late | work | plan */
function jauge(valeur, max, ton = 'work') {
  const pct = max ? Math.min(100, Math.round((valeur / max) * 100)) : 0;
  const couleurs = { live: '#2ee6a8', wait: '#ffb020', late: '#ff4d6d', work: '#00d8ff', plan: '#8b5cff' };
  return `<span class="meter block" role="img" aria-label="${pct} %"
    style="--meter-color:${couleurs[ton]}"><i style="--v:${pct / 100}"></i></span>`;
}

/** Aperçu d'une création, reconstitué dans la charte du compte.
    Ce n'est pas un placeholder : la composition (marque, filet d'accent, titre,
    lignes de texte grecquées, mention de format) est celle des créas de l'agence. */
function apercuCrea(o) {
  const clair = ['#FFFFFF', '#FAF7F0', '#ffffff'].includes(o.fond);
  const encre = o.encre || (clair ? '#111111' : '#FFFFFF');
  const greek = clair ? 'rgba(17,17,17,.22)' : 'rgba(255,255,255,.24)';
  const motifs = {
    chevron: `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 w-full h-full opacity-[.14]" aria-hidden="true">
      <path d="M18 6 2 50l16 44" fill="none" stroke="${o.accent}" stroke-width="9"/>
      <path d="M40 6 24 50l16 44" fill="none" stroke="${o.accent}" stroke-width="3" opacity=".55"/></svg>`,
    grille: `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 w-full h-full opacity-[.15]" aria-hidden="true">
      ${[20, 40, 60, 80].map((v) => `<line x1="0" y1="${v}" x2="100" y2="${v}" stroke="${o.accent}" stroke-width=".7"/><line x1="${v}" y1="0" x2="${v}" y2="100" stroke="${o.accent}" stroke-width=".7"/>`).join('')}</svg>`,
    points: `<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 w-full h-full opacity-[.2]" aria-hidden="true">
      ${Array.from({ length: 48 }, (_, k) => `<circle cx="${(k % 8) * 13 + 6}" cy="${Math.floor(k / 8) * 16 + 8}" r="1.5" fill="${o.accent}"/>`).join('')}</svg>`,
  };
  const lignes = [100, 88, 64];
  return `<div class="relative overflow-hidden rounded-[3px] flex flex-col justify-between p-3.5"
      style="background:${o.fond};border:1px solid rgba(255,255,255,.12);aspect-ratio:${o.ratio || '4 / 5'}">
    ${motifs[o.motif] || '<span class="absolute inset-0 scan opacity-45"></span>'}
    <div class="relative flex items-start gap-2">
      <span class="mono text-[8.5px] tracking-[.2em]" style="color:${o.accent}">${escape(o.marque)}</span>
      ${o.format ? `<span class="mono text-[8.5px] tracking-[.12em] ml-auto" style="color:${clair ? '#00000055' : '#ffffff66'}">${escape(o.format)}</span>` : ''}
    </div>
    <div class="relative">
      <span class="block h-[3px] ${o.grand ? 'w-12' : 'w-9'} mb-2.5" style="background:${o.accent}"></span>
      <span class="block ${o.grand ? 'text-[15px]' : 'text-[11px]'} leading-[1.2] mb-3" style="color:${encre};font-weight:500">${escape(o.titre)}</span>
      ${lignes.map((w) => `<span class="block h-[2px] mb-[5px]" style="width:${w}%;background:${greek}"></span>`).join('')}
    </div>
  </div>`;
}

/** Relevé : une phrase qui dit la situation, puis le registre des valeurs.
    Remplace la rangée de tuiles « grand chiffre / petite étiquette », qui est
    le gabarit de tableau de bord que ce produit refuse d'ouvrir. */
function releve(phrase, entrees) {
  return `<div class="panel overflow-hidden">
    <p class="px-5 py-4 text-[14px] leading-relaxed text-txt-2 border-b border-[color:var(--rule)]">${phrase}</p>
    <dl class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      ${entrees.map((e, i) => `
        <div class="flex items-baseline gap-3 px-5 py-2.5 border-[color:var(--rule)]
             ${i % 2 ? 'sm:border-l' : ''} ${i >= 2 ? 'xl:border-l' : ''} ${i < entrees.length - 1 ? 'border-b sm:border-b-0' : ''}
             ${i >= 2 ? 'sm:border-t xl:border-t-0' : ''}">
          <dt class="tag shrink-0">${escape(e.label)}</dt>
          <dd class="mono text-[13px] ml-auto text-right" style="color:${e.ton || 'var(--txt)'}">${e.valeur}</dd>
        </div>`).join('')}
    </dl>
  </div>`;
}

function vide(titre, texte, action = '') {
  return `<div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div class="mb-4 opacity-25">${icon('cible', 30)}</div>
    <p class="text-[15px] mb-1.5">${escape(titre)}</p>
    <p class="text-[13px] text-[color:var(--txt-3)] max-w-[42ch] leading-relaxed">${escape(texte)}</p>
    ${action ? `<div class="mt-5">${action}</div>` : ''}
  </div>`;
}

/* ---------------- Routage ---------------- */

function routeur(rendu) {
  const aller = () => {
    const brut = location.hash.replace(/^#\/?/, '');
    const parts = brut.split('/').filter(Boolean);
    rendu(parts[0] || '', parts.slice(1));
  };
  addEventListener('hashchange', aller);
  aller();
  return aller;
}

const naviguer = (h) => { location.hash = h; };

/* ---------------- Tiroir latéral ---------------- */

let fermerTiroirCourant = null;

const FOCUSABLES = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function tiroir(html, { large = false } = {}) {
  fermerTiroir();
  const rendu = document.activeElement;
  const app = document.getElementById('app');
  const titreId = 'tiroir-titre-' + Math.round(performance.now());

  const hote = document.createElement('div');
  hote.className = 'fixed inset-0 z-50';
  hote.innerHTML = `
    <div class="veil absolute inset-0" style="background:rgba(3,4,9,.76)" data-fermer></div>
    <section role="dialog" aria-modal="true" aria-labelledby="${titreId}"
      class="drawer-panel scroll absolute right-0 top-0 h-full w-full ${large ? 'max-w-[820px]' : 'max-w-[560px]'}
      overflow-y-auto border-l border-[color:var(--rule)]" style="background:var(--ink-1)">${html}</section>`;
  document.body.appendChild(hote);
  document.body.style.overflow = 'hidden';

  // Le titre du tiroir nomme le dialogue ; sans lui, un lecteur d'écran
  // annonce « dialogue » et rien d'autre.
  const titre = hote.querySelector('h2');
  if (titre) titre.id = titreId;
  // Le fond n'est plus atteignable tant que le tiroir est ouvert.
  if (app) app.setAttribute('aria-hidden', 'true');

  const fermer = () => {
    hote.remove();
    document.body.style.overflow = '';
    if (app) app.removeAttribute('aria-hidden');
    removeEventListener('keydown', surTouche);
    fermerTiroirCourant = null;
    if (rendu && document.contains(rendu)) rendu.focus();
  };

  const surTouche = (e) => {
    if (e.key === 'Escape') { fermer(); return; }
    if (e.key !== 'Tab') return;
    // Piège de focus : la tabulation tourne dans le tiroir.
    const cibles = [...hote.querySelectorAll(FOCUSABLES)].filter((n) => n.offsetParent !== null);
    if (!cibles.length) return;
    const premier = cibles[0];
    const dernier = cibles[cibles.length - 1];
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
    else if (!hote.contains(document.activeElement)) { e.preventDefault(); premier.focus(); }
  };

  hote.querySelectorAll('[data-fermer]').forEach((n) => n.addEventListener('click', fermer));
  addEventListener('keydown', surTouche);
  fermerTiroirCourant = fermer;
  const premier = hote.querySelector(FOCUSABLES);
  if (premier) premier.focus();
  return { hote, fermer };
}

function fermerTiroir() { if (fermerTiroirCourant) fermerTiroirCourant(); }

function enteteTiroir(titre, sousTitre = '', droite = '') {
  return `<header class="sticky top-0 z-10 flex items-start gap-4 px-6 py-5 border-b border-[color:var(--rule)]"
      style="background:var(--ink-1)">
    <div class="flex-1 min-w-0">
      <h2 class="text-[17px] font-normal leading-snug">${escape(titre)}</h2>
      ${sousTitre ? `<p class="tag mt-1.5">${escape(sousTitre)}</p>` : ''}
    </div>
    ${droite}
    <button class="btn btn-sm shrink-0" data-fermer aria-label="Fermer">${icon('croix', 13)}</button>
  </header>`;
}

/* ---------------- Notifications ---------------- */

function signal(texte, ton = 'live') {
  let pile = document.getElementById('pile-signaux');
  if (!pile) {
    pile = document.createElement('div');
    pile.id = 'pile-signaux';
    pile.className = 'fixed bottom-5 right-5 z-[70] flex flex-col gap-2 items-end';
    document.body.appendChild(pile);
  }
  const n = document.createElement('div');
  n.className = 'panel flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] shadow-[0_16px_40px_-12px_rgba(0,0,0,.8)]';
  n.style.background = 'var(--ink-3)';
  n.setAttribute('role', 'status');
  n.innerHTML = `<i class="pip pip-${ton}"></i><span>${escape(texte)}</span>`;
  n.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
  pile.appendChild(n);
  setTimeout(() => {
    n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).onfinish = () => n.remove();
  }, 3400);
}

/* ---------------- Chart.js ---------------- */

const ENCRE = '#a9b1c9';
const ENCRE_3 = '#7e88a6';
const GRILLE = 'rgba(255,255,255,.06)';
const MONO = '"Azeret Mono", ui-monospace, Consolas, monospace';

function reglerChart(Chart) {
  Chart.defaults.font.family = MONO;
  Chart.defaults.font.size = 10;
  Chart.defaults.font.weight = 400;
  Chart.defaults.color = ENCRE_3;
  Chart.defaults.borderColor = GRILLE;
  Chart.defaults.animation.duration = 620;
  Chart.defaults.animation.easing = 'easeOutQuart';
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.tooltip = {
    ...Chart.defaults.plugins.tooltip,
    backgroundColor: '#1a2030',
    borderColor: 'rgba(255,255,255,.14)',
    borderWidth: 1,
    cornerRadius: 3,
    padding: 10,
    titleColor: '#f2f4fb',
    titleFont: { family: MONO, size: 10, weight: 500 },
    bodyColor: ENCRE,
    bodyFont: { family: MONO, size: 11 },
    displayColors: true,
    boxWidth: 8,
    boxHeight: 8,
    boxPadding: 4,
    usePointStyle: true,
  };
}

const axeX = (extra = {}) => ({
  grid: { display: false, drawBorder: false },
  border: { color: GRILLE },
  ticks: { color: ENCRE_3, padding: 6, maxRotation: 0, autoSkipPadding: 12 },
  ...extra,
});

const axeY = (extra = {}) => ({
  grid: { color: GRILLE, drawTicks: false },
  border: { display: false, dash: [2, 3] },
  ticks: { color: ENCRE_3, padding: 8, maxTicksLimit: 5 },
  beginAtZero: true,
  ...extra,
});

/** Légende écrite en HTML : toujours présente dès 2 séries. */
function legende(entrees) {
  return `<ul class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    ${entrees.map((e) => `<li class="flex items-center gap-1.5 tag" style="letter-spacing:.08em">
      <span style="width:8px;height:8px;border-radius:2px;background:${e.couleur};display:inline-block"></span>
      <span style="color:var(--txt-2)">${escape(e.label)}</span>
      ${e.valeur !== undefined ? `<span class="num" style="color:var(--txt-3)">${escape(e.valeur)}</span>` : ''}
    </li>`).join('')}
  </ul>`;
}

/** Dégradé vertical doux sous une courbe. */
function remplissage(ctx, couleur, hauteur = 220) {
  const g = ctx.createLinearGradient(0, 0, 0, hauteur);
  g.addColorStop(0, couleur + '55');
  g.addColorStop(1, couleur + '00');
  return g;
}

const graphiques = new Map();

/** Crée (ou remplace) un graphique sur un <canvas> identifié. */
function tracer(id, config) {
  const el = document.getElementById(id);
  if (!el || !window.Chart) return null;
  if (graphiques.has(id)) graphiques.get(id).destroy();
  const c = new window.Chart(el.getContext('2d'), config);
  graphiques.set(id, c);
  return c;
}

function detruireGraphiques() {
  graphiques.forEach((c) => c.destroy());
  graphiques.clear();
}

/* ---------------- Divers ---------------- */

/** Table de repli, exigée dès qu'un graphique porte de l'information. */
function tableDonnees(entetes, lignes, titre) {
  return `<details class="mt-3 group">
    <summary class="tag cursor-pointer select-none hover:text-[color:var(--txt-2)] transition-colors">
      Voir les données ${escape(titre || '')}</summary>
    <div class="scroll mt-2 overflow-x-auto">
      <table class="w-full text-[11px] mono">
        <thead><tr class="text-left" style="color:var(--txt-3)">
          ${entetes.map((h) => `<th class="py-1.5 pr-4 font-medium whitespace-nowrap">${escape(h)}</th>`).join('')}
        </tr></thead>
        <tbody>${lignes.map((l) => `<tr class="border-t border-[color:var(--rule)]">
          ${l.map((c) => `<td class="py-1.5 pr-4 whitespace-nowrap" style="color:var(--txt-2)">${escape(c)}</td>`).join('')}
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </details>`;
}

/** Délégation de clic : `data-act="nom"` → poignée(nom, élément, événement).
    Les éléments qui ne sont pas des <button>/<a> mais portent role="button"
    sont activés au clavier par Entrée et Espace : sans cela, une ligne de
    conduite est atteignable en tabulant mais impossible à déplier. */
function surAction(racine, poignee) {
  racine.addEventListener('click', (e) => {
    const cible = e.target.closest('[data-act]');
    if (!cible || !racine.contains(cible)) return;
    poignee(cible.dataset.act, cible, e);
  });
  racine.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const cible = e.target.closest('[data-act][role="button"]');
    if (!cible || !racine.contains(cible)) return;
    e.preventDefault();
    poignee(cible.dataset.act, cible, e);
  });
}


  window.LU = Object.assign(window.LU || {}, { p2, heure, jourCourt, dateCourte, dateLongue, euros, nombre, memeJour, relatif, rebours, escape, etatChip, reseauGlyphe, avatar, pileAvatars, jauge, apercuCrea, releve, vide, routeur, naviguer, tiroir, fermerTiroir, enteteTiroir, signal, reglerChart, axeX, axeY, legende, remplissage, tracer, detruireGraphiques, tableDonnees, surAction });
})();
