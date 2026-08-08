(function () {
  'use strict';

/* Jeu d'icônes dessiné pour line up. — grille 24, trait 1.5, bouts ronds.
   Une seule famille : aucun emoji, aucun glyphe unicode ne tient lieu d'icône. */

const P = {
  /* — navigation — */
  conduite: '<path d="M4 6h16M4 12h16M4 18h10"/><path d="M4 6v12" opacity=".35"/>',
  pipeline: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="9.5" y="4" width="5" height="11" rx="1"/><rect x="16" y="4" width="5" height="7" rx="1"/>',
  grille: '<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14.5h2M11 14.5h2M14.5 14.5h2M7.5 17.5h2M11 17.5h2"/>',
  comptes: '<path d="M3 20V7.5L10 4v16"/><path d="M10 20h11V11l-11-3.5"/><path d="M13.5 14h1M17 14h1M13.5 17h1M17 17h1M6 10h1M6 13.5h1M6 17h1"/>',
  studio: '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z"/><path d="M18.5 16.5 19.2 18.6 21.3 19.3 19.2 20 18.5 22 17.8 20 15.7 19.3 17.8 18.6z"/>',
  equipe: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5c.6-3 2.9-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><path d="M16.5 6.6a3 3 0 0 1 0 5.6"/><path d="M17.6 15.4c2 .5 3.4 2 3.9 4.1"/>',
  facturation: '<path d="M6 3.5h12v17l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 20.5z"/><path d="M9.5 8.5h5M9.5 12.5h5"/>',
  reseaux: '<circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="4.6" r="2"/><circle cx="5.3" cy="17" r="2"/><circle cx="18.7" cy="17" r="2"/><path d="M12 9.4V6.6M10.2 13.6 7 15.8M13.8 13.6 17 15.8"/>',
  analytique: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M7.5 17V12M11.5 17V7.5M15.5 17v-3M19.5 17V9.5"/>',
  reglages: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.5 12H2.1M21.9 12h-2.4M6.7 6.7 5 5M19 19l-1.7-1.7M6.7 17.3 5 19M19 5l-1.7 1.7"/>',

  /* — actions — */
  plus: '<path d="M12 5v14M5 12h14"/>',
  recherche: '<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8 20 20"/>',
  filtre: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  chevronBas: '<path d="m6 9 6 6 6-6"/>',
  chevronDroit: '<path d="m9 6 6 6-6 6"/>',
  chevronGauche: '<path d="m15 6-6 6 6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  croix: '<path d="M6 6l12 12M18 6 6 18"/>',
  fleche: '<path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5"/>',
  horloge: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',
  envoi: '<path d="M21 3 10.5 13.5"/><path d="M21 3 14.5 21l-4-7.5L3 9.5z"/>',
  televerser: '<path d="M12 16V4.5"/><path d="m7.5 9 4.5-4.5L16.5 9"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  telecharger: '<path d="M12 4v11.5"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  piece: '<path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8-8a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.8 1.8 0 0 1-2.5-2.5l7.3-7.3"/>',
  message: '<path d="M20.5 12.2c0 3.9-3.8 7-8.5 7a10 10 0 0 1-2.6-.34L4 20.5l1.4-3.6A6.6 6.6 0 0 1 3.5 12.2c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7z"/>',
  crayon: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="m14.5 5.5 4 4"/>',
  poubelle: '<path d="M4.5 6.5h15"/><path d="M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7"/><path d="M6.5 6.5 7.4 20a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l.9-13.5"/><path d="M10.5 10.5v6.5M13.5 10.5v6.5"/>',
  oeil: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.8"/>',
  cadenas: '<rect x="4.5" y="10.5" width="15" height="10" rx="1.5"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><path d="M12 14.5v2.5"/>',
  alerte: '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 9.5v5M12 17.2v.2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
  cible: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6" fill="currentColor"/>',
  rafraichir: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20.5 4v4.5H16"/>',
  camera: '<path d="M3.5 8.5h3l1.5-2.5h8l1.5 2.5h3v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18.5z"/><circle cx="12" cy="13.5" r="3.4"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M8 5v14M16 5v14M3 12h18"/><path d="M5.5 8.5h.01M5.5 15.5h.01M18.5 8.5h.01M18.5 15.5h.01"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17 4.5-4.5 3.5 3.5 3-3L20 17"/>',
  texte: '<path d="M5 6.5h14M5 11h14M5 15.5h9"/>',
  euro: '<path d="M17 6.8a6 6 0 1 0 0 10.4"/><path d="M4.5 10.5h8M4.5 13.5h8"/>',
  calendrier: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
  utilisateur: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.7-3.6 3.7-5.5 7.5-5.5s6.8 1.9 7.5 5.5"/>',
  externe: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 3 19.5v-12A1.5 1.5 0 0 1 4.5 6H10"/>',
  cloche: '<path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10z"/><path d="M10 18.5a2.2 2.2 0 0 0 4 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sortie: '<path d="M14 5.5V4a1.5 1.5 0 0 0-1.5-1.5h-8A1.5 1.5 0 0 0 3 4v16a1.5 1.5 0 0 0 1.5 1.5h8A1.5 1.5 0 0 0 14 20v-1.5"/><path d="M9 12h12M17.5 8.5 21 12l-3.5 3.5"/>',
  glisser: '<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/>',
  bloc: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9.5h16"/>',
  avion: '<path d="m3 11 18-7-7 18-2.5-8z"/>',
  palette: '<path d="M12 3.5c-4.7 0-8.5 3.6-8.5 8s3.8 8 8.5 8c1.4 0 2-1 1.4-2-.7-1.2.2-2.5 1.6-2.5h2c2 0 3.5-1.5 3.5-3.5 0-4.4-3.8-8-8.5-8z"/><circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="10.5" r="1.1" fill="currentColor" stroke="none"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  lecture: '<path d="M7 4.5 19 12 7 19.5z"/>',
  archive: '<path d="M3.5 7.5h17v12a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M2.5 3.5h19v4h-19z"/><path d="M9.5 12h5"/>',

  /* — réseaux : famille de glyphes, même trait — */
  facebook: '<circle cx="12" cy="12" r="8.6"/><path d="M14.6 8.4h-1.5c-.9 0-1.4.5-1.4 1.4v1.5h2.7l-.4 2.8h-2.3v5.9"/><path d="M9.3 11.3h2.4"/>',
  instagram: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5"/><circle cx="12" cy="12" r="3.7"/><circle cx="16.8" cy="7.2" r=".9" fill="currentColor" stroke="none"/>',
  linkedin: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2.4"/><path d="M8 10.6v6.2"/><circle cx="8" cy="7.9" r=".95" fill="currentColor" stroke="none"/><path d="M11.8 16.8v-6.2"/><path d="M11.8 13.2a2.2 2.2 0 0 1 4.4 0v3.6"/>',
  tiktok: '<path d="M14.2 3.5v10.9a3.9 3.9 0 1 1-3.9-3.9c.35 0 .7.05 1 .14"/><path d="M14.2 3.5c.4 2.4 2.1 4 4.4 4.2"/>',
  google: '<circle cx="12" cy="12" r="8.5"/><path d="M12 10.6h4.6a4.7 4.7 0 1 1-1.4-3"/><path d="M16.6 10.6v2.8"/>',
};

/* Les attributs de tracé vivent sur chaque <symbol> : un <use> ne récupère pas
   ceux posés sur la racine du sprite, il hérite de son propre point d'insertion. */
const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

function iconSprite() {
  const symbols = Object.entries(P)
    .map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 24 24" ${STROKE}>${d}</symbol>`)
    .join('');
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${symbols}</svg>`;
}

/** <svg> prêt à poser. `size` en px, `cls` classes Tailwind additionnelles. */
function icon(name, size = 16, cls = '') {
  return `<svg class="${cls}" width="${size}" height="${size}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
}

const ICON_NAMES = Object.keys(P);


  window.LU = Object.assign(window.LU || {}, { iconSprite, icon, ICON_NAMES });
})();
