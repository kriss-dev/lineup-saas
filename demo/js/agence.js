(function () {
  'use strict';

/* =========================================================
   line up. — poste de pilotage de l'agence
   ========================================================= */

const {
  iconSprite, icon,
  NOW, D, ETATS, SOUS_ETATS, PIPELINE, NATURES, RESEAUX, SERIE, RAMPE,
  EQUIPE, membre, CLIENTS, client, PLANS, CHANTIERS, chantier, PUBLICATIONS,
  CONNEXIONS, JOURNAL_API, CONGES, FRAIS, RENDEZVOUS, FICHES_PAIE, FACTURES,
  SERIE_PUBLICATIONS, SERIE_MRR, SERIE_ENGAGEMENT, SERIE_DELAI_VALIDATION,
  SERIE_CHARGE, OCCASIONS, PROPOSITIONS_IA, REALISATIONS, ACTIVITE,
  p2, heure, jourCourt, dateCourte, dateLongue, euros, nombre, memeJour, relatif, rebours,
  escape, etatChip, reseauGlyphe, avatar, logoClient, pileAvatars, jauge, apercuCrea, lecteurLivrable, apercuChantier, releve, vide, routeur, naviguer,
  tiroir, fermerTiroir, enteteTiroir, signal, reglerChart, axeX, axeY, legende, remplissage,
  tracer, detruireGraphiques, tableDonnees, surAction,
} = window.LU;

if (window.Chart) reglerChart(window.Chart);

/* ---------------------------------------------------------
   État de l'application
   --------------------------------------------------------- */

const S = {
  vue: 'conduite',
  args: [],
  horizon: 7,
  filtreClient: '',
  filtreMembre: '',
  recherche: '',
  moisGrille: new Date(NOW.getFullYear(), NOW.getMonth(), 1),
  studio: { clientId: 'papiours', occasion: 'fetedesmeres', reseau: 'instagram', intention: '', resultats: null, calcul: false },
  equipeOnglet: 'charge',
};

const LENTILLES = [
  { groupe: 'Production', items: [
    { cle: 'conduite', label: 'Conduite', ic: 'conduite' },
    { cle: 'pipeline', label: 'Pipeline', ic: 'pipeline' },
    { cle: 'grille', label: 'Grille de diffusion', ic: 'grille' },
    { cle: 'studio', label: 'Studio IA', ic: 'studio' },
  ] },
  { groupe: 'Agence', items: [
    { cle: 'comptes', label: 'Comptes clients', ic: 'comptes' },
    { cle: 'equipe', label: 'Équipe & RH', ic: 'equipe' },
    { cle: 'facturation', label: 'Facturation', ic: 'facturation' },
    { cle: 'reseaux', label: 'Liaisons réseaux', ic: 'reseaux' },
    { cle: 'analytique', label: 'Analytique', ic: 'analytique' },
  ] },
];

/* ---------------------------------------------------------
   Dérivés
   --------------------------------------------------------- */

const enRetard = (c) => c.echeance < NOW && !['en_ligne', 'pret'].includes(c.etat);
const chantiersActifs = () => CHANTIERS.filter((c) => c.etat !== 'en_ligne');
const aValider = () => CHANTIERS.filter((c) => ['validation', 'attente'].includes(c.etat));
const incidents = () => [
  ...CHANTIERS.filter((c) => c.etat === 'echec'),
];
const prochaineDiffusion = () => PUBLICATIONS.filter((p) => p.quand > NOW && ['pret', 'validation'].includes(p.etat))[0];
const liaisonsKO = () => CONNEXIONS.filter((c) => c.etat !== 'ok');

function avancement(c) {
  if (!c.taches.length) return 0;
  return c.taches.filter((t) => t.etat === 'fait').length / c.taches.length;
}

/* ---------------------------------------------------------
   Coque
   --------------------------------------------------------- */

function coque() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${iconSprite()}
    <aside class="zone-sombre hidden lg:flex w-[222px] shrink-0 flex-col">
      <a href="index.html" class="flex items-center h-[62px] px-5 shrink-0" aria-label="line up. — accueil de la démonstration">
        <img src="assets/lineup-mark.png" alt="line up." class="h-[21px] w-auto">
      </a>
      <nav class="flex-1 overflow-y-auto scroll py-4" aria-label="Lentilles">
        ${LENTILLES.map((g) => `
          <p class="tag px-4 pb-2 pt-3">${g.groupe}</p>
          ${g.items.map((i) => `
            <a href="#/${i.cle}" class="nav-item text-[13px]" data-lentille="${i.cle}">
              ${icon(i.ic, 17, 'shrink-0 opacity-70')}<span>${i.label}</span>
              <span class="ml-auto mono text-[10px] opacity-0" data-compteur="${i.cle}"></span>
            </a>`).join('')}
        `).join('')}
      </nav>
      <div class="border-t border-rule p-3 shrink-0">
        <a href="client.html" class="btn btn-sm w-full justify-center mb-3">${icon('externe', 12)} Portail client</a>
        <div class="flex items-center gap-2.5 px-1">
          ${avatar('am', 28)}
          <div class="min-w-0">
            <p class="text-[12px] truncate">Adrien M.</p>
            <p class="tag" style="font-size:9px">Chef de projet</p>
          </div>
          <button class="btn btn-sm ml-auto !px-2" aria-label="Se déconnecter" data-act="deconnexion">${icon('sortie', 12)}</button>
        </div>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <div id="barre-maitresse" class="shrink-0"></div>
      <main id="vue" class="flex-1 overflow-y-auto scroll" tabindex="-1"></main>
    </div>`;

  surAction(app, actionGlobale);
}

function barreMaitresse() {
  const pd = prochaineDiffusion();
  const reb = pd ? rebours(pd.quand) : null;
  const retards = chantiersActifs().filter(enRetard);
  const ko = liaisonsKO();
  const lampes = ['instagram', 'facebook', 'linkedin', 'tiktok'].map((r) => {
    const liees = CONNEXIONS.filter((c) => c.reseau === r);
    const mauvaise = liees.find((c) => c.etat === 'echec') || liees.find((c) => c.etat === 'attention');
    const ton = !liees.length ? 'idle' : mauvaise ? (mauvaise.etat === 'echec' ? 'late' : 'wait') : 'live';
    const mot = ton === 'live' ? 'liaison établie' : ton === 'wait' ? 'jeton bientôt expiré' : ton === 'late' ? 'liaison rompue' : 'non connecté';
    return `<a href="#/reseaux" class="flex items-center gap-1.5 hover:opacity-100 opacity-80 transition-opacity"
        title="${RESEAUX[r].label} — ${mot}">
      ${icon(RESEAUX[r].icon, 15)}<i class="pip pip-${ton} ${ton === 'late' ? 'pip-beat' : ''}"></i>
      <span class="sr-only">${RESEAUX[r].label} : ${mot}</span></a>`;
  }).join('');

  /* Barre d'action : l'identité de la vue, la recherche, l'état des liaisons
     et l'action clé. Les mesures, elles, vivent dans le bandeau de la conduite. */
  return `
  <header class="border-b border-rule" style="background:var(--surface)">
    <div class="flex flex-wrap items-center gap-3 px-3 lg:px-5 py-3">
      <button class="btn btn-sm !px-2 lg:hidden" data-act="menu" aria-label="Ouvrir la navigation">${icon('menu', 14)}</button>
      <img src="assets/lineup-mark-dark.png" alt="line up." class="h-[17px] w-auto lg:hidden">

      <div class="hidden sm:block min-w-0">
        <p class="text-[15px] leading-tight">${escape(TITRES[S.vue] || 'Conduite')}</p>
        <p class="tag">${dateLongue(NOW)} · <span class="mono" id="horloge">${heure(NOW)}</span><span class="mono" id="secondes">:${p2(NOW.getSeconds())}</span></p>
      </div>

      <label class="relative ml-auto flex-1 min-w-[150px] max-w-[300px] order-last sm:order-none">
        <span class="sr-only">Rechercher</span>
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3 pointer-events-none">${icon('recherche', 14)}</span>
        <input class="field !rounded-full !pl-9 !py-2 !text-[12.5px]" placeholder="Chercher un chantier…"
          value="${escape(S.recherche)}" data-champ="recherche">
      </label>

      <div class="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full" style="background:var(--surface-2)"
           title="État des liaisons vers les réseaux">
        ${lampes}
      </div>

      <button class="btn btn-sm !px-2.5 relative" data-act="notifs" aria-label="Notifications">
        ${icon('cloche', 15)}${ko.length ? '<i class="pip pip-late absolute top-1 right-1"></i>' : ''}
      </button>
      <button class="btn btn-key btn-sm" data-act="nouveau-chantier">${icon('plus', 13)} <span class="hidden sm:inline">Chantier</span></button>
    </div>
  </header>`;
}

const TITRES = {
  conduite: 'Conduite du jour', pipeline: 'Pipeline des chantiers', grille: 'Grille de diffusion',
  studio: 'Studio IA', comptes: 'Comptes clients', equipe: 'Équipe & RH',
  facturation: 'Abonnements & facturation', reseaux: 'Liaisons réseaux', analytique: 'Analytique',
};

/* Le bandeau du tableau de bord : le dégradé de marque porte l'antenne,
   trois cartes teintées portent ce qui demande une décision. */
function bandeauConduite() {
  const pd = prochaineDiffusion();
  const reb = pd ? rebours(pd.quand) : null;
  const retards = chantiersActifs().filter(enRetard);
  const attentes = aValider();
  const duJour = PUBLICATIONS.filter((p) => memeJour(p.quand, NOW));
  const parties = duJour.filter((p) => p.etat === 'en_ligne').length;

  const carte = (ton, valeur, titre, detail, lien, jaugeVal, jaugeMax) => `
    <a href="${lien}" class="panel teinte p-4 flex flex-col justify-between hov" style="--ton:var(--st-${ton})">
      <div class="flex items-start gap-2">
        <p class="tag">${escape(titre)}</p>
        <i class="pip pip-${ton} ml-auto mt-1"></i>
      </div>
      <p class="num text-[30px] leading-none mt-3" style="color:var(--st-${ton}-ink)">${valeur}</p>
      <p class="text-[12px] text-txt-2 mt-1.5 leading-snug">${detail}</p>
      ${jaugeMax ? `<div class="mt-3">${jauge(jaugeVal, jaugeMax, ton)}</div>` : ''}
    </a>`;

  return `
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4 lg:p-5 pb-1">
    <section class="hero p-5 flex flex-col justify-between md:col-span-2 xl:col-span-1 min-h-[164px]">
      <div class="flex items-center gap-2 relative">
        <p class="tag">Prochaine diffusion</p>
        <i class="pip pip-live pip-beat ml-auto"></i>
      </div>
      ${pd ? `
        <div class="relative">
          <p class="num text-[36px] leading-none mt-3">${reb.texte}</p>
          <p class="text-[13px] mt-2 opacity-90 flex items-center gap-2">
            ${reseauGlyphe(pd.reseau, 15, 'opacity-100')} ${escape(client(pd.clientId).nom)} · ${heure(pd.quand)}
          </p>
        </div>
        <p class="text-[12px] relative mt-3 opacity-80">
          ${duJour.length} publication${duJour.length > 1 ? 's' : ''} aujourd’hui,
          ${parties} déjà partie${parties > 1 ? 's' : ''}.</p>`
      : `<p class="text-[15px] mt-3 relative">Aucune diffusion programmée.</p>`}
    </section>

    ${carte('late', p2(retards.length), 'En retard', retards.length ? 'chantiers dont l’échéance est passée' : 'tout est dans les temps', '#/conduite')}
    ${carte('wait', p2(attentes.length), 'Chez le client', attentes.length ? 'devis ou créations sans réponse' : 'rien n’attend le client', '#/pipeline')}
    ${carte('work', `${parties}<span class="text-[16px] text-txt-3">/${duJour.length}</span>`, 'Antenne du jour',
      'publications parties sur les réseaux', '#/grille', parties, duJour.length || 1)}
  </div>`;
}

/* ---------------------------------------------------------
   Vue — La Conduite
   --------------------------------------------------------- */

function lignesConduite() {
  const fin = D(S.horizon, 23, 59);
  const debut = D(-1, 0, 0);
  const q = S.recherche.trim().toLowerCase();

  const pubs = PUBLICATIONS
    .filter((p) => p.quand >= debut && p.quand <= fin)
    .map((p) => ({ type: 'pub', quand: p.quand, ref: p, clientId: p.clientId, etat: p.etat }));

  const chs = CHANTIERS
    .filter((c) => c.echeance >= debut && c.echeance <= fin && c.etat !== 'en_ligne')
    .map((c) => ({ type: 'chantier', quand: c.echeance, ref: c, clientId: c.clientId, etat: c.etat }));

  return [...pubs, ...chs]
    .filter((l) => !S.filtreClient || l.clientId === S.filtreClient)
    .filter((l) => !S.filtreMembre || (l.type === 'chantier' && (l.ref.ownerId === S.filtreMembre || l.ref.taches.some((t) => t.ownerId === S.filtreMembre))))
    .filter((l) => !q || (l.type === 'chantier'
      ? (l.ref.slug + l.ref.titre + l.ref.id).toLowerCase().includes(q)
      : (l.ref.legende + client(l.clientId).nom).toLowerCase().includes(q)))
    .sort((a, b) => a.quand - b.quand);
}

function ligneChantier(c) {
  const e = ETATS[c.etat];
  const reb = rebours(c.echeance);
  const av = avancement(c);
  const retard = enRetard(c);
  const faites = c.taches.filter((t) => t.etat === 'fait').length;
  return `
  <div class="rdo rail rail-${retard ? 'late' : e.rail} cursor-pointer select-none
       ${GRILLE_LIGNE}"
       data-act="ouvrir-chantier" data-id="${c.id}" role="button" tabindex="0"
       aria-label="Ouvrir le chantier ${escape(c.titre)}">
    <div class="pl-3.5 mono text-[11px] text-txt-3">${heure(c.echeance)}</div>
    <div>${etatChip(retard && c.etat !== 'echec' ? 'echec' : c.etat)}</div>
    <div class="min-w-0 pr-4 flex items-center gap-2.5">
      ${logoClient(client(c.clientId), 28)}
      <span class="min-w-0">
        <span class="text-[13px] block truncate leading-snug">${escape(c.titre)}
          ${c.priorite === 'haute' ? '<span class="chip chip-late !h-[17px] !text-[8.5px] ml-1.5 align-middle">Prioritaire</span>' : ''}</span>
        <span class="text-[11.5px] text-txt-3 block truncate mt-0.5">
          ${escape(client(c.clientId).nom)} · ${escape(c.slug)}${c.taches.length ? ` · ${faites}/${c.taches.length} tâches` : ''}</span>
      </span>
    </div>
    <div class="hidden lg:flex items-center gap-2 text-txt-3">${c.reseaux.map((r) => reseauGlyphe(r, 14)).join('')}</div>
    <div class="pr-3.5 flex items-center justify-end gap-3 whitespace-nowrap">
      ${c.taches.length ? `<span class="hidden lg:block w-[52px]">${jauge(av, 1, retard ? 'late' : 'work')}</span>` : ''}
      <span class="mono text-[11px]" style="color:${reb.passe ? 'var(--st-late-ink)' : 'var(--txt-2)'}">${reb.passe ? '+' : ''}${reb.texte}</span>
      ${avatar(c.ownerId, 24)}
    </div>
  </div>
`;
}

/* Quatre colonnes, les mêmes pour un chantier et pour une publication :
   l'heure, l'état, l'objet (titre humain d'abord, technique en dessous),
   les réseaux, puis le bloc de droite — échéance et main qui tient. */
const GRILLE_LIGNE = 'grid-cols-[46px_104px_minmax(0,1fr)_auto] md:grid-cols-[56px_116px_minmax(0,1fr)_72px_150px]';

function sousLignes(c) {
  const t = c.taches.length
    ? c.taches.map((t) => `
      <div class="rdo subline rail rail-${SOUS_ETATS[t.etat].rail} grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_116px_140px_60px]"
           style="min-height:40px;border-bottom-color:var(--rule)">
        <div class="flex items-center gap-2.5 min-w-0 pr-4">
          ${icon(NATURES[t.nature].icon, 14, 'opacity-45 shrink-0')}
          <span class="text-[12.5px] truncate">${escape(t.label)}</span>
        </div>
        <div class="hidden md:block">${etatChip(t.etat, { taille: 'xs' })}</div>
        <div class="hidden md:block mono text-[10.5px] text-txt-3">${t.duree} h · ${dateCourte(t.echeance)}</div>
        <div class="flex items-center justify-end gap-2 pr-3.5">${avatar(t.ownerId, 20)}</div>
      </div>`).join('')
    : `<div class="rdo subline text-[12.5px] text-txt-3" style="min-height:38px">Aucune sous-tâche — le chantier n’est pas encore découpé.</div>`;

  return `<div class="border-b border-rule" style="background:var(--wash)">
    ${c.incident ? `<div class="subline flex items-start gap-2.5 px-0 py-2.5 text-[12.5px]" style="color:var(--st-late-ink)">
        ${icon('alerte', 14, 'shrink-0 mt-0.5')}<span>${escape(c.incident)}</span></div>` : ''}
    ${t}
    <div class="subline flex flex-wrap items-center gap-2 py-2.5">
      <button class="btn btn-sm" data-act="ouvrir-chantier" data-id="${c.id}">${icon('oeil', 12)} Ouvrir le chantier</button>
      <button class="btn btn-sm" data-act="ajouter-tache" data-id="${c.id}">${icon('plus', 12)} Sous-tâche</button>
      ${c.etat === 'relecture' ? `<button class="btn btn-sm btn-key" data-act="envoyer-validation" data-id="${c.id}">${icon('envoi', 12)} Envoyer en validation</button>` : ''}
      ${c.etat === 'echec' ? `<button class="btn btn-sm btn-key" data-act="reconnecter" data-id="${c.id}">${icon('rafraichir', 12)} Reconnecter et republier</button>` : ''}
    </div>
  </div>`;
}

/* Une publication dont l'heure est passée sans être partie n'est pas « diffusée » :
   elle est manquée. L'état prime toujours sur l'horloge — c'est le seul écran où
   l'équipe peut voir qu'un objet est resté à quai, et le bouton doit rester là. */
function etatReel(p) {
  if (p.etat === 'en_ligne' || p.etat === 'echec') return p.etat;
  return p.quand < NOW ? 'manque' : p.etat;
}

function lignePublication(p) {
  const c = client(p.clientId);
  const etat = etatReel(p);
  const e = ETATS[etat];
  const reb = rebours(p.quand);
  const sortie = etat === 'en_ligne'
    ? `<span class="mono text-[11px] text-txt-3">diffusé</span>`
    : etat === 'echec'
      ? `<span class="mono text-[11px]" style="color:var(--st-late-ink)">échec</span>`
      : etat === 'manque'
        ? `<span class="mono text-[11px]" style="color:var(--st-late-ink)">+${reb.texte}</span>`
        : `<span class="mono text-[11px] text-txt-2">${reb.texte}</span>`;
  const poussable = ['pret', 'manque'].includes(etat);
  return `
  <div class="rdo rail rail-${e.rail} ${GRILLE_LIGNE}">
    <div class="pl-3.5 mono text-[11px] text-txt-3">${heure(p.quand)}</div>
    <div>${etatChip(etat)}</div>
    <div class="min-w-0 pr-4 flex items-center gap-2.5">
      ${logoClient(c, 28)}
      <span class="min-w-0">
        <span class="text-[13px] block truncate leading-snug">${escape(p.legende)}</span>
        <span class="text-[11.5px] text-txt-3 block truncate mt-0.5">
          ${escape(c.nom)} · ${escape(p.format)}${p.portee ? ` · ${nombre(p.portee)} vues` : ''}</span>
      </span>
    </div>
    <div class="hidden lg:flex items-center gap-2 text-txt-3">${reseauGlyphe(p.reseau, 14)}</div>
    <div class="pr-3.5 flex items-center justify-end gap-3 whitespace-nowrap">
      ${sortie}
      ${poussable
        ? `<button class="btn btn-sm !h-7 !w-7 !px-0 justify-center shrink-0" data-act="pousser" data-pub="${p.id}"
             aria-label="Publier maintenant : ${escape(c.nom)}, ${RESEAUX[p.reseau].label}">${icon('envoi', 12)}</button>`
        : '<span class="w-7 shrink-0"></span>'}
    </div>
  </div>`;
}

function vueConduite() {
  const lignes = lignesConduite();
  const parJour = new Map();
  lignes.forEach((l) => {
    const k = l.quand.toDateString();
    if (!parJour.has(k)) parJour.set(k, []);
    parJour.get(k).push(l);
  });

  const corps = parJour.size ? [...parJour.entries()].map(([k, items]) => {
    const d = new Date(k);
    const aujourdhui = memeJour(d, NOW);
    const passe = d < new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
    const demain = memeJour(d, D(1));
    const nomJour = d.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase();
    return `
    <div class="sticky top-0 z-10 flex items-center gap-3 px-3.5 py-2 border-b border-rule backdrop-blur-sm"
         style="background:rgba(255,255,255,.92)">
      <span class="text-[12.5px] font-medium ${aujourdhui ? '' : 'text-txt-3'}" style="${aujourdhui ? 'color:var(--st-live)' : ''}">
        ${aujourdhui ? 'Aujourd’hui' : passe ? 'Hier' : demain ? 'Demain' : nomJour.charAt(0) + nomJour.slice(1).toLowerCase()}</span>
      <span class="tag">${dateLongue(d)}</span>
      <span class="flex-1 border-t border-rule"></span>
      <span class="text-[11px] text-txt-3">${items.length} objets</span>
    </div>
    <div class="roll">
      ${items.map((l) => (l.type === 'chantier' ? ligneChantier(l.ref) : lignePublication(l.ref))).join('')}
    </div>`;
  }).join('') : vide('Rien sur la ligne', 'Aucun objet ne correspond à ces filtres sur l’horizon choisi.');

  return `
  <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_356px] h-full">
    <section class="min-w-0 flex flex-col overflow-y-auto scroll">
      ${bandeauConduite()}
      ${barreFiltres()}
      <div class="px-4 lg:px-5 pb-5">
        <div class="panel overflow-hidden">${corps}</div>
      </div>
    </section>
    <aside class="hidden xl:flex flex-col overflow-y-auto scroll border-l border-rule" style="background:var(--surface)">
      ${colonneDecisions()}
    </aside>
  </div>`;
}

function barreFiltres() {
  return `
  <div class="flex flex-wrap items-center gap-2 px-4 lg:px-5 py-3 shrink-0">
    <select class="field !w-auto !py-1.5 !text-[12px] !rounded-full" data-champ="filtreClient" aria-label="Filtrer par client">
      <option value="">Tous les comptes</option>
      ${CLIENTS.map((c) => `<option value="${c.id}" ${S.filtreClient === c.id ? 'selected' : ''}>${escape(c.nom)}</option>`).join('')}
    </select>
    <select class="field !w-auto !py-1.5 !text-[12px] !rounded-full" data-champ="filtreMembre" aria-label="Filtrer par intervenant">
      <option value="">Toute l’équipe</option>
      ${EQUIPE.map((e) => `<option value="${e.id}" ${S.filtreMembre === e.id ? 'selected' : ''}>${escape(e.prenom)} ${escape(e.nom)}</option>`).join('')}
    </select>
    <div class="flex items-center gap-1 p-1 rounded-full ml-auto" style="background:var(--surface-3)">
      ${[3, 7, 14].map((h) => `<button class="text-[12px] px-3 py-1.5 rounded-full transition-colors ${S.horizon === h ? 'text-white' : 'text-txt-2 hover:text-txt'}"
        style="${S.horizon === h ? 'background:var(--ink-solid)' : ''}" data-act="horizon" data-h="${h}">${h} j</button>`).join('')}
    </div>
  </div>`;
}

function colonneDecisions() {
  const devis = CHANTIERS.filter((c) => ['a_chiffrer', 'brouillon'].includes(c.devis.statut));
  const attentes = aValider();
  const inc = incidents();
  const ko = liaisonsKO();

  const total = inc.length + ko.length + devis.length + attentes.length;

  /* Un seul en-tête pour toute la colonne, puis des séparateurs légers.
     Chaque entrée est une ligne unique : pastille, objet, une ligne de contexte,
     et — seulement là où une action est possible — un bouton discret. */
  const separateur = (titre, compte) => `
    <div class="flex items-center gap-2 px-5 pt-5 pb-2">
      <p class="tag">${titre}</p>
      <span class="mono text-[10px] text-txt-3 ml-auto">${p2(compte)}</span>
    </div>`;

  const entree = (o) => `
    <${o.href ? 'a' : 'button'} ${o.href ? `href="${o.href}"` : `data-act="${o.act}" data-id="${o.id}"`}
        class="w-full text-left flex gap-3 px-5 py-2.5 hov">
      <i class="pip pip-${o.ton} ${o.battement ? 'pip-beat' : ''} mt-[7px] shrink-0"></i>
      <span class="min-w-0 flex-1">
        <span class="block text-[12.5px] leading-snug">${escape(o.titre)}</span>
        <span class="block text-[11.5px] text-txt-3 leading-snug mt-0.5">${escape(o.detail)}</span>
      </span>
      ${o.marque ? `<span class="mono text-[10px] shrink-0 mt-1" style="color:${o.marqueTon || 'var(--txt-3)'}">${escape(o.marque)}</span>` : ''}
    </${o.href ? 'a' : 'button'}>`;

  return `
  <div class="sticky top-0 z-10 flex items-center gap-2 px-5 h-[62px] border-b border-rule" style="background:var(--surface)">
    <p class="text-[14px]">À traiter</p>
    <span class="chip chip-wait ml-auto">${p2(total)}</span>
  </div>

  ${inc.length || ko.length ? `
    ${separateur('Incidents', inc.length + ko.length)}
    ${inc.map((c) => entree({ act: 'ouvrir-chantier', id: c.id, ton: 'late', battement: true,
      titre: c.titre, detail: c.incident || 'Chantier en échec' })).join('')}
    ${ko.map((c) => entree({ href: '#/reseaux', ton: c.etat === 'echec' ? 'late' : 'wait',
      titre: c.compte, detail: c.message })).join('')}` : ''}

  ${devis.length ? `
    ${separateur('À chiffrer', devis.length)}
    ${devis.map((c) => `
      <div class="px-5 py-2.5 hov flex gap-3">
        <i class="pip pip-idle mt-[7px] shrink-0"></i>
        <div class="min-w-0 flex-1">
          <p class="text-[12.5px] leading-snug">${escape(c.titre)}</p>
          <p class="text-[11.5px] text-txt-3 leading-snug mt-0.5">${escape(client(c.clientId).nom)} · ouvert ${relatif(c.ouvert)}</p>
        </div>
        <button class="btn btn-sm shrink-0 !px-2.5" data-act="chiffrer" data-id="${c.id}"
          aria-label="Établir le chiffrage de ${escape(c.titre)}">${icon('euro', 13)}</button>
      </div>`).join('')}` : ''}

  ${attentes.length ? `
    ${separateur('Chez le client', attentes.length)}
    ${attentes.map((c) => {
      const j = Math.round((NOW - (c.devis.envoye || c.ouvert)) / 86400000);
      return entree({ act: 'ouvrir-chantier', id: c.id, ton: 'wait',
        titre: c.titre, detail: `${client(c.clientId).nom} · ${ETATS[c.etat].long.toLowerCase()}`,
        marque: `${j} j`, marqueTon: j > 3 ? 'var(--st-wait-ink)' : 'var(--txt-3)' });
    }).join('')}` : ''}

  ${!total ? `<p class="px-5 py-6 text-[12.5px] text-txt-3">Rien n’attend de décision. Tout est chez nous.</p>` : ''}

  <div class="mt-4 border-t border-rule">
    ${separateur('Activité', ACTIVITE.length)}
    ${ACTIVITE.map((a) => `
      <div class="flex gap-2.5 px-5 py-2">
        ${a.qui ? avatar(a.qui, 21) : `<i class="pip pip-late mt-[7px] mx-[7px] shrink-0"></i>`}
        <p class="text-[12px] leading-snug flex-1 min-w-0 ${a.alerte ? '' : 'text-txt-2'}"
           style="${a.alerte ? 'color:var(--st-late-ink)' : ''}">
          ${a.qui ? `<span class="text-txt">${escape(membre(a.qui).prenom)}</span> ` : ''}${escape(a.texte)}
        </p>
        <span class="mono text-[10px] text-txt-3 shrink-0 mt-0.5">${heure(a.quand)}</span>
      </div>`).join('')}
    <div class="h-5"></div>
  </div>`;
}

/* ---------------------------------------------------------
   Vue — Pipeline
   --------------------------------------------------------- */

function vuePipeline() {
  const colonnes = PIPELINE.map((cle) => {
    const items = CHANTIERS.filter((c) => c.etat === cle && (!S.filtreClient || c.clientId === S.filtreClient));
    const valeur = items.reduce((s, c) => s + (c.devis.montant || 0), 0);
    return `
    <div class="flex flex-col min-w-[228px] w-[228px] border-r border-rule last:border-r-0" data-colonne="${cle}">
      <div class="flex items-center gap-2 px-3 py-2.5 border-b border-rule sticky top-0 z-10" style="background:var(--ink-1)">
        <i class="pip pip-${ETATS[cle].pip}"></i>
        <p class="mono text-[10.5px] tracking-[.1em]">${ETATS[cle].court}</p>
        <span class="mono text-[10px] text-txt-3 ml-auto">${p2(items.length)}${valeur ? ` · ${euros(valeur)}` : ''}</span>
      </div>
      <div class="flex-1 p-2 space-y-2 overflow-y-auto scroll zone-depot" data-etat="${cle}">
        ${items.map(carteChantier).join('') || `<p class="text-[12px] text-txt-3 px-1.5 py-3">Colonne vide</p>`}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="h-full flex flex-col">
    <div class="flex flex-wrap items-center gap-2 px-3.5 py-2.5 border-b border-rule shrink-0" style="background:var(--ink-1)">
      <h1 class="text-[15px] font-normal mr-2">Pipeline des chantiers</h1>
      <p class="text-[12px] text-txt-3">Glissez une carte, ou utilisez les flèches de la carte au clavier.</p>
      <select class="field !w-auto !py-1.5 !text-[12px] ml-auto" data-champ="filtreClient" aria-label="Filtrer par client">
        <option value="">Tous les comptes</option>
        ${CLIENTS.map((c) => `<option value="${c.id}" ${S.filtreClient === c.id ? 'selected' : ''}>${escape(c.nom)}</option>`).join('')}
      </select>
      <button class="btn btn-key btn-sm" data-act="nouveau-chantier">${icon('plus', 12)} Nouveau chantier</button>
    </div>
    <div class="flex-1 relative min-h-0"><div class="absolute inset-0 overflow-x-auto scroll flex">${colonnes}</div><span aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 w-10" style="background:linear-gradient(90deg,transparent,var(--ink))"></span></div>
  </div>`;
}

function carteChantier(c) {
  const i = PIPELINE.indexOf(c.etat);
  const reb = rebours(c.echeance);
  const retard = enRetard(c);
  const av = avancement(c);
  return `
  <article class="panel rail rail-${retard ? 'late' : ETATS[c.etat].rail} p-3 cursor-grab active:cursor-grabbing hover:border-[color:var(--rule-strong)] transition-colors"
      draggable="true" tabindex="-1" data-carte="${c.id}">
    <div class="flex items-start gap-2 mb-2">
      <span class="mono text-[10px] text-txt-3">${c.id}</span>
      ${c.priorite === 'haute' ? `<span class="chip !h-[17px] !text-[8.5px]" style="border-color:rgba(255,77,109,.4);color:#ffb3c1">Prioritaire</span>` : ''}
      <span class="ml-auto opacity-30">${icon('glisser', 12)}</span>
    </div>
    <button class="text-left w-full" data-act="ouvrir-chantier" data-id="${c.id}">
      <p class="text-[13px] leading-snug mb-1">${escape(c.titre)}</p>
      <p class="mono text-[10px] text-txt-3 truncate mb-2.5">${escape(c.slug)}</p>
    </button>
    <div class="flex items-center gap-2 mb-2.5 text-txt-3">
      ${logoClient(client(c.clientId), 22)}
      <span class="text-[11.5px] text-txt-2 truncate">${escape(client(c.clientId).nom)}</span>
      <span class="flex items-center gap-1.5 ml-auto">${c.reseaux.map((r) => reseauGlyphe(r, 13)).join('')}</span>
    </div>
    ${c.taches.length ? `<div class="mb-2.5">
      <p class="mono text-[9.5px] text-txt-3 mb-1">${c.taches.filter((t) => t.etat === 'fait').length}/${c.taches.length} sous-tâches</p>
      ${jauge(av, 1, retard ? 'late' : 'work')}
    </div>` : ''}
    <div class="flex items-center gap-2">
      ${avatar(c.ownerId, 21)}
      <span class="mono text-[10.5px] ml-auto" style="color:${reb.passe ? 'var(--st-late)' : 'var(--txt-3)'}">
        ${reb.passe ? 'retard ' : ''}${reb.texte}</span>
      ${c.devis.montant ? `<span class="mono text-[10.5px] text-txt-2">${euros(c.devis.montant)}</span>` : ''}
    </div>
    <div class="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-rule">
      <button class="btn btn-sm !px-1.5" data-act="etat-precedent" data-id="${c.id}" ${i <= 0 ? 'disabled' : ''}
        aria-label="${i > 0 ? `Reculer ${c.id} vers « ${ETATS[PIPELINE[i - 1]].long} »` : `${c.id} est déjà dans la première colonne`}">${icon('chevronGauche', 12)}</button>
      <span class="mono text-[9.5px] text-txt-3 px-1 truncate">${ETATS[c.etat].court}</span>
      <button class="btn btn-sm !px-1.5 ml-auto" data-act="etat-suivant" data-id="${c.id}" ${i >= PIPELINE.length - 1 ? 'disabled' : ''}
        aria-label="${i < PIPELINE.length - 1 ? `Avancer ${c.id} vers « ${ETATS[PIPELINE[i + 1]].long} »` : `${c.id} est déjà dans la dernière colonne`}">${icon('chevronDroit', 12)}</button>
    </div>
  </article>`;
}

function brancherGlisserDeposer() {
  let porte = null;
  document.querySelectorAll('[data-carte]').forEach((n) => {
    n.addEventListener('dragstart', (e) => {
      porte = n.dataset.carte;
      n.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', porte);
    });
    n.addEventListener('dragend', () => { n.classList.remove('dragging'); porte = null; });
  });
  document.querySelectorAll('.zone-depot').forEach((z) => {
    z.addEventListener('dragover', (e) => { e.preventDefault(); z.classList.add('drop-live'); });
    z.addEventListener('dragleave', () => z.classList.remove('drop-live'));
    z.addEventListener('drop', (e) => {
      e.preventDefault();
      z.classList.remove('drop-live');
      const id = e.dataTransfer.getData('text/plain') || porte;
      const c = chantier(id);
      if (!c || c.etat === z.dataset.etat) return;
      c.etat = z.dataset.etat;
      signal(`${c.id} passé en « ${ETATS[c.etat].long} »`, ETATS[c.etat].pip);
      rendre();
    });
  });
}

/* ---------------------------------------------------------
   Vue — Grille de diffusion
   --------------------------------------------------------- */

function vueGrille() {
  const m = S.moisGrille;
  const premier = new Date(m.getFullYear(), m.getMonth(), 1);
  const decalage = (premier.getDay() + 6) % 7;
  const nbJours = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= nbJours; j++) cases.push(new Date(m.getFullYear(), m.getMonth(), j));
  while (cases.length % 7) cases.push(null);

  const pubsFiltre = (d) => PUBLICATIONS.filter((p) => memeJour(p.quand, d) && (!S.filtreClient || p.clientId === S.filtreClient));

  // La file affiche exactement ce que « pousser toute la file » enverrait,
  // plus ce qui attend encore le client : les deux portées doivent coïncider.
  const file = PUBLICATIONS
    .filter((p) => ['pret', 'manque', 'validation'].includes(etatReel(p)))
    .slice(0, 9);
  const nbPrets = PUBLICATIONS.filter((p) => ['pret', 'manque'].includes(etatReel(p))).length;

  return `
  <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_330px] h-full">
    <section class="flex flex-col border-r border-rule min-w-0">
      <div class="flex flex-wrap items-center gap-2 px-3.5 py-2.5 border-b border-rule shrink-0" style="background:var(--ink-1)">
        <h1 class="text-[15px] font-normal capitalize mr-1">${m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h1>
        <button class="btn btn-sm !px-2" data-act="mois" data-d="-1" aria-label="Mois précédent">${icon('chevronGauche', 13)}</button>
        <button class="btn btn-sm !px-2" data-act="mois" data-d="1" aria-label="Mois suivant">${icon('chevronDroit', 13)}</button>
        <button class="btn btn-sm" data-act="mois" data-d="0">Aujourd’hui</button>
        <select class="field !w-auto !py-1.5 !text-[12px] ml-auto" data-champ="filtreClient" aria-label="Filtrer par client">
          <option value="">Tous les comptes</option>
          ${CLIENTS.map((c) => `<option value="${c.id}" ${S.filtreClient === c.id ? 'selected' : ''}>${escape(c.nom)}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-7 border-b border-rule shrink-0" style="background:var(--ink-1)">
        ${['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map((j) => `<div class="tag px-2 py-1.5">${j}</div>`).join('')}
      </div>
      <div class="flex-1 overflow-y-auto scroll">
        <div class="grid grid-cols-7 auto-rows-[minmax(112px,1fr)]">
          ${cases.map((d) => {
            if (!d) return `<div class="border-r border-b border-rule" style="background:var(--wash)"></div>`;
            const items = pubsFiltre(d);
            const auj = memeJour(d, NOW);
            return `
            <button class="border-r border-b border-rule p-1.5 text-left align-top hov transition-colors relative"
                data-act="jour" data-j="${d.toISOString()}">
              ${auj ? `<span class="absolute inset-x-0 top-0 h-[2px]" style="background:var(--grad)"></span>` : ''}
              <span class="mono text-[10.5px] ${auj ? 'text-txt' : 'text-txt-3'}">${p2(d.getDate())}</span>
              <span class="block mt-1 space-y-[3px]">
                ${items.slice(0, 3).map((p) => `
                  <span class="flex items-center gap-1.5 rounded-[2px] px-1 py-[3px]" style="background:var(--hover)">
                    <i class="pip pip-${ETATS[etatReel(p)].pip}" style="width:5px;height:5px;box-shadow:none"></i>
                    <span class="shrink-0 opacity-60">${icon(RESEAUX[p.reseau].icon, 11)}</span>
                    <span class="mono text-[9.5px] text-txt-2 truncate">${heure(p.quand)} ${escape(client(p.clientId).nom)}</span>
                  </span>`).join('')}
                ${items.length > 3 ? `<span class="mono text-[9.5px] text-txt-3 pl-1">+${items.length - 3}</span>` : ''}
              </span>
            </button>`;
          }).join('')}
        </div>
      </div>
    </section>

    <aside class="flex flex-col overflow-y-auto scroll" style="background:var(--ink-1)">
      <div class="px-4 py-2.5 border-b border-rule flex items-center gap-2">
        <p class="tag">File de diffusion</p>
        <span class="mono text-[10px] text-txt-3 ml-auto">${p2(file.length)}</span>
      </div>
      ${file.map((p) => {
        const etat = etatReel(p);
        const reb = rebours(p.quand);
        const pret = ['pret', 'manque'].includes(etat);
        return `<div class="px-4 py-3 border-b border-rule">
          <div class="flex items-center gap-2 mb-1.5">
            ${reseauGlyphe(p.reseau, 14)}
            <span class="text-[12.5px] truncate">${escape(client(p.clientId).nom)}</span>
            <span class="mono text-[10px] ml-auto" style="color:${etat === 'manque' ? 'var(--st-late)' : 'var(--txt-3)'}">
              ${etat === 'manque' ? '+' : ''}${reb.texte}</span>
          </div>
          <p class="text-[11.5px] text-txt-3 leading-snug line-clamp-2 mb-2">${escape(p.legende)}</p>
          <div class="flex items-center gap-2">
            ${etatChip(etat, { taille: 'xs' })}
            <button class="btn btn-sm ml-auto ${pret ? 'btn-key' : ''}" data-act="pousser" data-pub="${p.id}"
              ${pret ? '' : 'disabled title="En attente de validation client"'}>
              ${icon('envoi', 11)} Pousser</button>
          </div>
        </div>`;
      }).join('')}
      <div class="px-4 py-3">
        <button class="btn w-full justify-center" data-act="pousser-tout" ${nbPrets ? '' : 'disabled'}>
          ${icon('avion', 13)} Pousser les ${p2(nbPrets)} prêtes</button>
        <p class="text-[11.5px] text-txt-3 mt-2.5 leading-snug">Démonstration : aucun appel réel n’est émis vers Meta, LinkedIn ou TikTok.</p>
      </div>
    </aside>
  </div>`;
}

/* ---------------------------------------------------------
   Vue — Comptes clients
   --------------------------------------------------------- */

function vueComptes() {
  if (S.args[0]) return ficheClient(S.args[0]);

  return `
  <div class="p-4 lg:p-6 max-w-[1400px]">
    <div class="flex flex-wrap items-end gap-3 mb-5">
      <h1 class="text-[21px] font-normal">Comptes clients</h1>
      <p class="text-[13px] text-txt-3 mb-0.5">${CLIENTS.length} comptes actifs · ${euros(CLIENTS.reduce((s, c) => s + c.prix, 0))} de récurrent mensuel</p>
      <button class="btn btn-key btn-sm ml-auto" data-act="nouveau-compte">${icon('plus', 12)} Nouveau compte</button>
    </div>

    <div class="panel overflow-hidden">
      <div class="rdo grid-cols-[minmax(0,1fr)_120px_140px_1fr_110px] px-3.5 tag" style="min-height:36px;background:var(--ink-2)">
        <div>Compte</div><div>Formule</div><div>Chantiers</div><div>Consommation du forfait</div><div class="text-right">Mensuel</div>
      </div>
      ${CLIENTS.map((c) => {
        const chs = CHANTIERS.filter((x) => x.clientId === c.id && x.etat !== 'en_ligne');
        const du = Object.values(c.cadence).reduce((a, b) => a + b, 0);
        const fait = Object.values(c.consomme).reduce((a, b) => a + b, 0);
        const ton = fait / du > 0.9 ? 'live' : fait / du > 0.55 ? 'work' : 'wait';
        return `
        <button class="rdo w-full text-left grid-cols-[minmax(0,1fr)_120px_140px_1fr_110px] px-3.5 hov"
            data-act="fiche" data-id="${c.id}">
          <div class="flex items-center gap-3 min-w-0 pr-4">
            ${c.logo
              ? `<img src="${c.logo}" alt="" class="h-7 w-7 object-contain rounded-[2px] p-[3px] shrink-0" style="background:${c.logoFond}">`
              : `<span class="mono h-7 w-7 shrink-0 rounded-[2px] flex items-center justify-center text-[10px] text-txt-3" style="background:var(--ink-3)">${escape(c.nom.slice(0, 2).toUpperCase())}</span>`}
            <span class="min-w-0">
              <span class="block text-[13px] truncate">${escape(c.nom)}</span>
              <span class="block text-[11.5px] text-txt-3 truncate">${escape(c.baseline)} · ${escape(c.ville)}</span>
            </span>
          </div>
          <div><span class="chip">${escape(c.plan)}</span></div>
          <div class="mono text-[11.5px] text-txt-2">${chs.length} en cours</div>
          <div class="pr-6">
            <p class="mono text-[10px] text-txt-3 mb-1">${fait}/${du} publications ce mois</p>
            ${jauge(fait, du, ton)}
          </div>
          <div class="mono text-[12px] text-right">${euros(c.prix)}</div>
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

function ficheClient(id) {
  const c = client(id);
  if (!c) return vide('Compte introuvable', 'Ce compte n’existe pas dans le jeu de démonstration.');
  const chs = CHANTIERS.filter((x) => x.clientId === c.id);
  const enCours = chs.filter((x) => x.etat !== 'en_ligne');
  const reals = REALISATIONS[c.id] || [];
  const facts = FACTURES.filter((f) => f.clientId === c.id);
  const complet = !!c.charte;

  return `
  <div class="max-w-[1400px]">
    <div class="flex items-center gap-2 px-4 lg:px-6 py-3 border-b border-rule">
      <a href="#/comptes" class="btn btn-sm">${icon('chevronGauche', 12)} Comptes</a>
      <span class="mono text-[11px] text-txt-3 ml-1">/ ${escape(c.nom)}</span>
    </div>

    <header class="flex flex-wrap items-start gap-5 p-4 lg:p-6 border-b border-rule">
      ${c.logo
        ? `<img src="${c.logo}" alt="Logo ${escape(c.nom)}" class="h-[74px] w-[74px] object-contain rounded-[3px] p-2.5 shrink-0" style="background:${c.logoFond}">`
        : `<span class="mono h-[74px] w-[74px] shrink-0 rounded-[3px] flex items-center justify-center text-[19px] text-txt-3" style="background:var(--ink-3)">${escape(c.nom.slice(0, 2).toUpperCase())}</span>`}
      <div class="min-w-0 flex-1">
        <h1 class="text-[23px] font-normal leading-tight">${escape(c.nom)}</h1>
        <p class="text-[13px] text-txt-2 mt-1">${escape(c.baseline)}</p>
        <p class="tag mt-2">${escape(c.secteur)} · ${escape(c.ville)} · client depuis ${new Date(c.depuis).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-sm" data-act="nouveau-chantier">${icon('plus', 12)} Chantier</button>
        <a class="btn btn-sm" href="#/studio">${icon('studio', 12)} Studio IA</a>
        <a class="btn btn-sm btn-key" href="client.html#/?compte=${c.id}">${icon('externe', 12)} Voir son portail</a>
      </div>
    </header>

    <div class="p-4 lg:p-6 pb-0">
      ${(() => {
        const depasse = (c.tempsPasse || 0) > (c.tempsVendu || 1);
        return releve(
          `${escape(c.nom)} est en formule <strong class="font-normal text-txt">${escape(c.plan)}</strong> depuis
           ${new Date(c.depuis).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}.
           ${enCours.length ? `${enCours.length} chantier${enCours.length > 1 ? 's sont' : ' est'} ouvert${enCours.length > 1 ? 's' : ''}` : 'Aucun chantier n’est ouvert'},
           et le temps passé ${depasse ? '<strong class="font-normal" style="color:var(--st-late)">dépasse</strong> le temps vendu' : 'reste dans l’enveloppe vendue'}.`,
          [
            { label: 'Mensuel', valeur: euros(c.prix) },
            { label: 'Chantiers ouverts', valeur: p2(enCours.length) },
            { label: 'Temps passé / vendu', valeur: `${(c.tempsPasse || 0).toLocaleString('fr-FR')} / ${c.tempsVendu || 0} h`, ton: depasse ? 'var(--st-late)' : 'var(--st-live)' },
            { label: 'Audience cumulée', valeur: nombre(Object.values(c.audience).reduce((a, b) => a + b, 0)) },
          ]);
      })()}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="min-w-0 border-r border-rule">
        ${sectionFiche('Cadence de publication', `
          <div class="px-5 py-4 space-y-3.5">
            ${Object.keys(RESEAUX).filter((r) => c.cadence[r]).map((r) => `
              <div class="flex items-center gap-3">
                <span class="text-txt-3">${icon(RESEAUX[r].icon, 15)}</span>
                <span class="text-[12.5px] w-20">${RESEAUX[r].label}</span>
                <span class="flex-1">${jauge(c.consomme[r], c.cadence[r], c.consomme[r] >= c.cadence[r] ? 'live' : 'work')}</span>
                <span class="mono text-[11px] text-txt-2 w-16 text-right">${c.consomme[r]}/${c.cadence[r]}</span>
              </div>`).join('')}
            ${c.engagements ? `<ul class="pt-2 space-y-1.5">${c.engagements.map((e) => `
              <li class="flex gap-2 text-[12.5px] text-txt-2"><span style="color:var(--st-live)">${icon('check', 13)}</span>${escape(e)}</li>`).join('')}</ul>` : ''}
          </div>`)}

        ${sectionFiche(`Chantiers (${chs.length})`, chs.length ? `
          <div>${chs.map((x) => `
            <button class="rdo w-full text-left rail rail-${ETATS[x.etat].rail} grid-cols-[minmax(0,1fr)_96px_110px_86px] px-3.5 hov"
                data-act="ouvrir-chantier" data-id="${x.id}">
              <div class="min-w-0 pr-4">
                <span class="block text-[12.5px] truncate">${escape(x.titre)}</span>
                <span class="mono block text-[10px] text-txt-3 truncate">${escape(x.slug)}</span>
              </div>
              <div>${etatChip(x.etat, { taille: 'xs' })}</div>
              <div class="mono text-[11px] text-txt-3">${dateCourte(x.echeance)}</div>
              <div class="mono text-[11px] text-right">${x.devis.montant ? euros(x.devis.montant) : '—'}</div>
            </button>`).join('')}</div>` : vide('Aucun chantier', 'Ce compte n’a pas encore de chantier ouvert.'))}

        ${complet ? sectionFiche('Réalisations passées', `
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
            ${reals.map((r) => `
              <figure class="group">
                ${apercuCrea({ fond: r.fond, accent: r.accent, marque: c.nom.toUpperCase(), titre: r.titre, format: RESEAUX[r.reseau].label })}
                <figcaption class="mt-2">
                  <span class="flex items-center gap-1.5 text-txt-3">${reseauGlyphe(r.reseau, 12)}
                    <span class="mono text-[9.5px]">${dateCourte(r.date)}</span></span>
                  <span class="mono text-[10px] text-txt-2 block mt-0.5">${nombre(r.portee)} vues · ${nombre(r.interactions)} inter.</span>
                </figcaption>
              </figure>`).join('')}
          </div>
          <p class="px-5 pb-4 text-[11.5px] text-txt-3">Aperçus reconstitués à partir de la charte : les visuels d’origine ne sont pas embarqués dans la maquette.</p>`) : ''}

        ${sectionFiche('Facturation', facts.length ? `
          <div>${facts.map((f) => `
            <div class="rdo grid-cols-[minmax(0,1fr)_110px_100px_90px] px-3.5">
              <div class="min-w-0 pr-4">
                <span class="mono block text-[11px] text-txt-3">${f.id}</span>
                <span class="block text-[12.5px] truncate">${escape(f.objet)}</span>
              </div>
              <div>${chipFacture(f)}</div>
              <div class="mono text-[11px] text-txt-3">éch. ${dateCourte(f.echeance)}</div>
              <div class="mono text-[12px] text-right">${euros(f.montant)}</div>
            </div>`).join('')}</div>` : vide('Aucune facture', 'Rien n’a encore été facturé sur ce compte.'))}
      </div>

      <aside style="background:var(--ink-1)">
        ${complet ? `
          ${sectionFiche('Charte', `
            <div class="p-5 space-y-5">
              <div>
                <p class="tag mb-2">Couleurs</p>
                <div class="grid grid-cols-2 gap-2">
                  ${c.charte.couleurs.map((k) => `
                    <button class="flex items-center gap-2.5 p-1.5 rounded-[3px] hov transition-colors text-left"
                        data-act="copier" data-valeur="${k.hex}" title="Copier ${k.hex}">
                      <span class="h-7 w-7 rounded-[2px] shrink-0" style="background:${k.hex};border:1px solid var(--art-edge)"></span>
                      <span class="min-w-0">
                        <span class="block text-[11.5px] truncate">${escape(k.nom)}</span>
                        <span class="mono block text-[9.5px] text-txt-3">${k.hex}</span>
                      </span>
                    </button>`).join('')}
                </div>
              </div>
              <div>
                <p class="tag mb-2">Typographies</p>
                ${c.charte.typos.map((t) => `
                  <div class="flex items-baseline gap-2 py-1 border-b border-rule last:border-0">
                    <span class="mono text-[9.5px] text-txt-3 w-12 shrink-0">${escape(t.usage)}</span>
                    <span class="text-[13px]">${escape(t.nom)}</span>
                    <span class="text-[11px] text-txt-3 ml-auto text-right">${escape(t.detail)}</span>
                  </div>`).join('')}
              </div>
              <div>
                <p class="tag mb-1.5">Ton</p>
                <p class="text-[12.5px] text-txt-2 leading-relaxed">${escape(c.charte.ton)}</p>
              </div>
              <div>
                <p class="tag mb-1.5">Interdits</p>
                <ul class="space-y-1.5">${c.charte.interdits.map((i) => `
                  <li class="flex gap-2 text-[12.5px] text-txt-2"><span style="color:var(--st-late)">${icon('croix', 12)}</span>${escape(i)}</li>`).join('')}</ul>
              </div>
              <div>
                <p class="tag mb-1.5">Mots-dièse</p>
                <p class="mono text-[11.5px] text-txt-2 leading-relaxed">${c.charte.hashtags.map(escape).join(' ')}</p>
              </div>
            </div>`)}

          ${sectionFiche('Audience', `
            <div class="p-5">
              ${Object.keys(RESEAUX).filter((r) => c.audience[r]).map((r) => `
                <div class="flex items-center gap-3 py-2 border-b border-rule last:border-0">
                  <span class="text-txt-3">${icon(RESEAUX[r].icon, 15)}</span>
                  <span class="text-[12.5px]">${RESEAUX[r].label}</span>
                  <span class="num text-[13px] ml-auto">${nombre(c.audience[r])}</span>
                  <span class="mono text-[10.5px] w-14 text-right" style="color:${c.croissance[r] >= 0 ? 'var(--st-live)' : 'var(--st-late)'}">
                    ${c.croissance[r] >= 0 ? '+' : ''}${c.croissance[r]} %</span>
                </div>`).join('')}
            </div>`)}
        ` : `<div class="p-5">${vide('Charte non renseignée', 'Ce compte de démonstration n’a pas de dossier de marque complet. Les deux comptes documentés sont Papi Ours et Kalpy.')}</div>`}

        ${c.contacts ? sectionFiche('Contacts', `
          <div class="p-5 space-y-3.5">
            ${c.contacts.map((k) => `
              <div class="flex items-start gap-3">
                <span class="mono h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[10px]"
                  style="background:var(--ink-3);color:var(--txt-2)">${escape(k.nom.split(' ').map((x) => x[0]).join(''))}</span>
                <div class="min-w-0">
                  <p class="text-[12.5px]">${escape(k.nom)} ${k.principal ? '<span class="chip !h-[16px] !text-[8.5px] ml-1">Principal</span>' : ''}</p>
                  <p class="tag">${escape(k.role)}</p>
                  <p class="mono text-[11px] text-txt-2 mt-1">${escape(k.mail)}</p>
                  <p class="mono text-[11px] text-txt-3">${escape(k.tel)}</p>
                </div>
              </div>`).join('')}
          </div>`) : ''}
      </aside>
    </div>
  </div>`;
}

const sectionFiche = (titre, contenu) => `
  <section class="border-b border-rule">
    <div class="px-5 py-2.5 border-b border-rule flex items-center" style="background:var(--wash)">
      <p class="tag">${escape(titre)}</p>
    </div>
    ${contenu}
  </section>`;

const chipFacture = (f) => {
  const map = { payee: ['live', 'Payée'], envoyee: ['wait', 'Envoyée'], retard: ['late', 'En retard'], brouillon: ['idle', 'Brouillon'] };
  const [ton, mot] = map[f.etat] || ['idle', f.etat];
  return `<span class="chip"><i class="pip pip-${ton}"></i>${mot}</span>`;
};

/* ---------------------------------------------------------
   Vue — Studio IA
   --------------------------------------------------------- */

function vueStudio() {
  // #/studio/pistes ouvre directement sur des propositions générées.
  if (S.args[0] === 'pistes') S.studio.resultats = true;
  const c = client(S.studio.clientId);
  const occ = OCCASIONS.find((o) => o.id === S.studio.occasion);
  const reals = REALISATIONS[c.id] || [];

  return `
  <div class="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] h-full">
    <aside class="border-r border-rule overflow-y-auto scroll" style="background:var(--ink-1)">
      <div class="px-5 py-4 border-b border-rule">
        <h1 class="text-[15px] font-normal">Studio IA</h1>
        <p class="text-[12.5px] text-txt-3 leading-snug mt-1">Les propositions sont construites à partir de la charte du compte et de ses publications passées, jamais d’un modèle générique.</p>
      </div>

      <div class="p-5 space-y-4">
        <label class="block">
          <span class="tag block mb-1.5">Compte</span>
          <select class="field" data-champ="studioClient">
            ${CLIENTS.filter((x) => x.charte).map((x) => `<option value="${x.id}" ${S.studio.clientId === x.id ? 'selected' : ''}>${escape(x.nom)}</option>`).join('')}
          </select>
        </label>
        <label class="block">
          <span class="tag block mb-1.5">Occasion</span>
          <select class="field" data-champ="studioOccasion">
            ${OCCASIONS.map((o) => `<option value="${o.id}" ${S.studio.occasion === o.id ? 'selected' : ''}>${escape(o.label)}</option>`).join('')}
          </select>
        </label>
        <label class="block">
          <span class="tag block mb-1.5">Réseau visé</span>
          <select class="field" data-champ="studioReseau">
            ${Object.keys(RESEAUX).filter((r) => c.cadence[r]).map((r) => `<option value="${r}" ${S.studio.reseau === r ? 'selected' : ''}>${RESEAUX[r].label}</option>`).join('')}
          </select>
        </label>
        <label class="block">
          <span class="tag block mb-1.5">Intention (facultatif)</span>
          <textarea class="field h-[74px] resize-none" data-champ="studioIntention"
            placeholder="Ex. mettre en avant la réservation, ton plus sobre que d’habitude…">${escape(S.studio.intention)}</textarea>
        </label>
        <button class="btn btn-key w-full justify-center ${S.studio.calcul ? 'sweeping' : ''}" data-act="generer" ${S.studio.calcul ? 'disabled' : ''}>
          ${icon('studio', 13)} ${S.studio.calcul ? 'Génération…' : 'Générer 3 pistes'}
        </button>
      </div>

      <div class="border-t border-rule">
        <div class="px-5 py-2.5 border-b border-rule"><p class="tag">Matière utilisée</p></div>
        <div class="p-5 space-y-3">
          <div class="flex gap-1.5">
            ${c.charte.couleurs.map((k) => `<span class="h-6 flex-1 rounded-[2px]" title="${escape(k.nom)} ${k.hex}" style="background:${k.hex};border:1px solid var(--art-edge)"></span>`).join('')}
          </div>
          <p class="text-[12px] text-txt-2 leading-relaxed">${escape(c.charte.ton)}</p>
          <p class="tag">${reals.length} publications passées analysées · ${occ ? escape(occ.quand) : ''}</p>
        </div>
      </div>
    </aside>

    <section class="overflow-y-auto scroll p-4 lg:p-6">
      ${S.studio.calcul ? etatCalcul(c) : (S.studio.resultats ? resultatsStudio(c) : accueilStudio(c, reals))}
    </section>
  </div>`;
}

function accueilStudio(c, reals) {
  return `
  <div class="max-w-[860px]">
    <h2 class="text-[19px] font-normal mb-2">Trois pistes pour ${escape(c.nom)}, dans sa charte</h2>
    <p class="text-[13px] text-txt-2 leading-relaxed max-w-[68ch] mb-7">
      Le studio part de ce qui existe déjà : les couleurs et typographies du dossier de marque, le ton
      d’écriture consigné, les interdits, et les ${reals.length} publications les plus performantes du compte.
      Il propose une piste graphique et une accroche par format — à retoucher, jamais à publier tel quel.
    </p>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
      ${reals.map((r) => apercuCrea({ fond: r.fond, accent: r.accent, marque: c.nom.toUpperCase(), titre: r.titre, format: RESEAUX[r.reseau].label })).join('')}
    </div>
    <p class="tag">Sélectionnez une occasion à gauche, puis lancez la génération.</p>
  </div>`;
}

function etatCalcul(c) {
  const etapes = ['Lecture du dossier de marque', 'Analyse des publications passées', 'Recherche d’angles', 'Mise en page dans la charte'];
  return `
  <div class="max-w-[520px]">
    <p class="tag mb-4">Génération en cours pour ${escape(c.nom)}</p>
    <div class="space-y-3">
      ${etapes.map((e, i) => `
        <div class="flex items-center gap-3">
          <i class="pip pip-work ${i < 2 ? '' : 'pip-beat'}"></i>
          <span class="text-[13px] ${i < 2 ? 'text-txt-2' : ''}">${escape(e)}</span>
          <span class="flex-1 h-px" style="background:var(--rule)"></span>
          <span class="mono text-[10px] text-txt-3">${i < 2 ? 'fait' : '…'}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

function resultatsStudio(c) {
  const props = PROPOSITIONS_IA[c.id] || [];
  const occ = OCCASIONS.find((o) => o.id === S.studio.occasion);
  return `
  <div class="max-w-[1100px]">
    <div class="flex flex-wrap items-end gap-3 mb-5">
      <h2 class="text-[19px] font-normal">${escape(occ.label)} — ${escape(c.nom)}</h2>
      <p class="text-[12.5px] text-txt-3 mb-0.5">3 pistes générées ${relatif(NOW)}</p>
      <button class="btn btn-sm ml-auto" data-act="generer">${icon('rafraichir', 12)} Regénérer</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${props.map((p, i) => `
        <article class="panel overflow-hidden flex flex-col">
          ${apercuCrea({ fond: p.fond, accent: p.accent, encre: p.encre, motif: p.motif, grand: true,
            marque: c.nom.toUpperCase(), titre: p.accroche, format: p.format, ratio: '4 / 5' })}
          <div class="p-4 flex-1 flex flex-col">
            <p class="text-[13px] mb-1.5">${escape(p.titre)}</p>
            <p class="text-[12px] text-txt-3 leading-relaxed flex-1">${escape(p.angle)}</p>
            <div class="flex flex-wrap items-center gap-2 mt-4">
              <button class="btn btn-sm flex-1 justify-center" data-act="studio-retoucher" data-i="${i}">${icon('crayon', 12)} Retoucher</button>
              <button class="btn btn-sm btn-key flex-1 justify-center" data-act="studio-valider" data-i="${i}">${icon('envoi', 12)} Envoyer</button>
            </div>
          </div>
        </article>`).join('')}
    </div>

    <p class="text-[12px] text-txt-3 leading-relaxed max-w-[70ch] mt-6">
      Maquette : ces trois pistes sont écrites à l’avance pour la démonstration. Dans le produit, elles
      seraient produites par un modèle nourri du dossier de marque du compte, puis systématiquement
      relues par un membre de l’équipe avant d’atteindre le client.
    </p>
  </div>`;
}

/* ---------------------------------------------------------
   Vue — Équipe & RH
   --------------------------------------------------------- */

const ONGLETS_RH = [
  { cle: 'charge', label: 'Charge' },
  { cle: 'conges', label: 'Congés' },
  { cle: 'frais', label: 'Notes de frais' },
  { cle: 'rdv', label: 'Rendez-vous' },
  { cle: 'paie', label: 'Coffre' },
];

function vueEquipe() {
  const congesAttente = CONGES.filter((c) => c.etat === 'attente').length;
  const fraisAttente = FRAIS.filter((f) => f.etat === 'attente');
  const compteurs = { conges: congesAttente, frais: fraisAttente.length };

  return `
  <div class="h-full flex flex-col">
    <div class="flex flex-wrap items-center gap-2 px-3.5 py-2.5 border-b border-rule shrink-0" style="background:var(--ink-1)">
      <h1 class="text-[15px] font-normal mr-3">Équipe & RH</h1>
      <nav class="flex items-center border border-rule rounded-[3px] overflow-hidden" aria-label="Sections RH">
        ${ONGLETS_RH.map((o) => `
          <button class="mono text-[10px] px-3 py-1.5 flex items-center gap-1.5 transition-colors ${S.equipeOnglet === o.cle ? 'text-txt' : 'text-txt-3 hover:text-txt-2'}"
            style="${S.equipeOnglet === o.cle ? 'background:var(--surface-3)' : ''}"
            data-act="onglet-rh" data-o="${o.cle}" aria-pressed="${S.equipeOnglet === o.cle}">
            ${o.label.toUpperCase()}${compteurs[o.cle] ? `<i class="pip pip-wait"></i>` : ''}
          </button>`).join('')}
      </nav>
      <p class="text-[12px] text-txt-3 ml-auto">${EQUIPE.length} personnes · ${euros(fraisAttente.reduce((s, f) => s + f.montant, 0))} de frais à rembourser</p>
    </div>
    <div class="flex-1 overflow-y-auto scroll">${
      { charge: rhCharge, conges: rhConges, frais: rhFrais, rdv: rhRdv, paie: rhPaie }[S.equipeOnglet]()
    }</div>
  </div>`;
}

/* Cinq personnes ne tiennent pas dans une palette catégorielle lisible en mode
   sombre : on trace la charge totale contre la capacité, et l'identité par
   personne se lit dans le registre à droite, où elle est nommée. */
const CAPACITE = EQUIPE.length * 5;
const chargeTotale = SERIE_CHARGE.labels.map((_, i) =>
  EQUIPE.reduce((s, e) => s + SERIE_CHARGE.parPersonne[e.id][i], 0));

function rhCharge() {
  return `
  <div class="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-5 max-w-[1500px]">
    <section class="panel p-5 flex flex-col">
      <div class="flex items-start justify-between gap-4 mb-1">
        <h2 class="text-[15px] font-normal">Charge planifiée sur 4 semaines</h2>
        <p class="mono text-[10px] text-txt-3">en jours ouvrés</p>
      </div>
      <p class="text-[12.5px] text-txt-3 mb-4 max-w-[64ch]">
        Cinq personnes, ${CAPACITE} jours ouvrés par semaine. La semaine ${SERIE_CHARGE.labels[chargeTotale.indexOf(Math.max(...chargeTotale))]}
        est la plus tendue, à ${Math.max(...chargeTotale).toLocaleString('fr-FR')} jours engagés.
      </p>
      <div class="h-[330px]"><canvas id="g-charge" aria-label="Charge totale de l'équipe par semaine, comparée à la capacité"></canvas></div>
      <div class="mt-4">${legende([
        { label: 'Charge engagée', couleur: SERIE[0] },
        { label: 'Capacité de l’équipe', couleur: '#646f8c', valeur: CAPACITE + ' j' },
      ])}</div>
      ${tableDonnees(['Semaine', 'Charge', 'Capacité', ...EQUIPE.map((e) => e.prenom)],
        SERIE_CHARGE.labels.map((l, i) => [l, chargeTotale[i].toLocaleString('fr-FR') + ' j', CAPACITE + ' j',
          ...EQUIPE.map((e) => `${SERIE_CHARGE.parPersonne[e.id][i]} j`)]), 'de charge')}

      <div class="mt-6 pt-5 border-t border-rule">
        <p class="tag mb-3">Ce qui entame la capacité sur la période</p>
        ${(() => {
          const fin = D(28);
          const abs = CONGES.filter((c) => c.au >= NOW && c.du <= fin && c.etat !== 'refuse');
          const rdv = RENDEZVOUS.filter((r) => r.quand >= NOW && r.quand <= fin);
          if (!abs.length && !rdv.length) return `<p class="text-[12.5px] text-txt-3">Rien ne vient entamer la capacité sur ces quatre semaines.</p>`;
          return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            ${abs.map((c) => `
              <div class="flex items-center gap-2.5 py-1.5 border-b border-rule">
                <i class="pip pip-${c.etat === 'valide' ? 'plan' : 'wait'}"></i>
                ${avatar(c.qui, 20)}
                <span class="text-[12.5px] truncate">${escape(c.type)}</span>
                <span class="mono text-[10.5px] text-txt-3 ml-auto whitespace-nowrap">
                  ${dateCourte(c.du)} → ${dateCourte(c.au)} · ${c.jours} j${c.etat === 'attente' ? ' · à valider' : ''}</span>
              </div>`).join('')}
            ${rdv.map((r) => `
              <div class="flex items-center gap-2.5 py-1.5 border-b border-rule">
                <i class="pip pip-work"></i>
                ${pileAvatars(r.qui, 20)}
                <span class="text-[12.5px] truncate">${escape(client(r.clientId).nom)}</span>
                <span class="mono text-[10.5px] text-txt-3 ml-auto whitespace-nowrap">
                  ${dateCourte(r.quand)} · ${r.duree} min</span>
              </div>`).join('')}
          </div>`;
        })()}
      </div>
    </section>

    <section class="panel divide-y" style="border-color:var(--rule)">
      <div class="px-5 py-2.5"><p class="tag">Taux d’occupation cette semaine</p></div>
      ${EQUIPE.map((e) => `
        <div class="px-5 py-3.5 flex items-center gap-3">
          ${avatar(e.id, 30)}
          <div class="min-w-0 flex-1">
            <p class="text-[13px] truncate">${escape(e.prenom)} ${escape(e.nom)}</p>
            <p class="tag">${escape(e.role)}</p>
            <div class="mt-2">${jauge(Math.min(e.charge, 1), 1, e.charge > 1 ? 'late' : e.charge > 0.85 ? 'wait' : 'live')}</div>
          </div>
          <div class="text-right shrink-0">
            <p class="num text-[15px]" style="color:${e.charge > 1 ? 'var(--st-late)' : 'var(--txt)'}">${Math.round(e.charge * 100)} %</p>
            <p class="tag">${e.conges.solde} j de solde</p>
          </div>
        </div>`).join('')}
    </section>
  </div>`;
}

function rhConges() {
  return `
  <div class="p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 max-w-[1500px]">
    <section class="panel overflow-hidden">
      <div class="rdo grid-cols-[minmax(0,1fr)_120px_150px_70px_150px] px-3.5 tag" style="min-height:36px;background:var(--ink-2)">
        <div>Demande</div><div>Type</div><div>Période</div><div>Jours</div><div class="text-right">Décision</div>
      </div>
      ${CONGES.map((c) => {
        const m = membre(c.qui);
        const ton = { attente: 'wait', valide: 'live', refuse: 'late' }[c.etat];
        return `
        <div class="rdo rail rail-${ton} grid-cols-[minmax(0,1fr)_120px_150px_70px_150px] px-3.5">
          <div class="flex items-center gap-2.5 min-w-0 pr-4">
            ${avatar(c.qui, 24)}
            <span class="min-w-0">
              <span class="block text-[12.5px] truncate">${escape(m.prenom)} ${escape(m.nom)}</span>
              <span class="mono block text-[9.5px] text-txt-3">${c.id} · déposé ${relatif(c.depose)}</span>
            </span>
          </div>
          <div class="text-[12px] text-txt-2">${escape(c.type)}</div>
          <div class="mono text-[11px] text-txt-2">${dateCourte(c.du)} → ${dateCourte(c.au)}</div>
          <div class="num text-[13px]">${c.jours}</div>
          <div class="flex items-center justify-end gap-1.5">
            ${c.etat === 'attente' ? `
              <button class="btn btn-sm !px-2" data-act="conge-refus" data-id="${c.id}" aria-label="Refuser">${icon('croix', 12)}</button>
              <button class="btn btn-sm btn-key" data-act="conge-valide" data-id="${c.id}">${icon('check', 12)} Valider</button>`
            : `<span class="chip"><i class="pip pip-${ton}"></i>${c.etat === 'valide' ? 'Validé' : 'Refusé'}</span>`}
          </div>
        </div>
        ${c.motif ? `<div class="px-3.5 py-2 text-[11.5px] text-txt-3 border-b border-rule">Motif : ${escape(c.motif)}</div>` : ''}`;
      }).join('')}
    </section>

    <section class="panel">
      <div class="px-5 py-2.5 border-b border-rule"><p class="tag">Soldes de congés</p></div>
      <div class="p-5 space-y-4">
        ${EQUIPE.map((e) => `
          <div>
            <div class="flex items-baseline gap-2 mb-1.5">
              <span class="text-[12.5px]">${escape(e.prenom)} ${escape(e.nom)}</span>
              <span class="mono text-[11px] text-txt-3 ml-auto">${e.conges.pris}/${e.conges.acquis} j pris · ${e.rtt} RTT</span>
            </div>
            ${jauge(e.conges.pris, e.conges.acquis, e.conges.solde < 6 ? 'wait' : 'work')}
          </div>`).join('')}
      </div>
    </section>
  </div>`;
}

function rhFrais() {
  const total = FRAIS.filter((f) => f.etat === 'attente').reduce((s, f) => s + f.montant, 0);
  return `
  <div class="p-4 lg:p-6 max-w-[1200px]">
    <div class="flex flex-wrap items-end gap-3 mb-4">
      <h2 class="text-[15px] font-normal">Notes de frais</h2>
      <p class="text-[12.5px] text-txt-3 mb-0.5">${euros(total)} en attente de remboursement</p>
      <button class="btn btn-sm ml-auto" data-act="exporter-frais">${icon('telecharger', 12)} Export comptable</button>
    </div>
    <div class="panel overflow-hidden">
      <div class="rdo grid-cols-[minmax(0,1fr)_130px_100px_100px_160px] px-3.5 tag" style="min-height:36px;background:var(--ink-2)">
        <div>Objet</div><div>Catégorie</div><div>Date</div><div class="text-right">Montant</div><div class="text-right">Décision</div>
      </div>
      ${FRAIS.map((f) => {
        const ton = { attente: 'wait', valide: 'live', refuse: 'late' }[f.etat];
        return `
        <div class="rdo rail rail-${ton} grid-cols-[minmax(0,1fr)_130px_100px_100px_160px] px-3.5">
          <div class="flex items-center gap-2.5 min-w-0 pr-4">
            ${avatar(f.qui, 24)}
            <span class="min-w-0">
              <span class="block text-[12.5px] truncate">${escape(f.objet)}</span>
              <span class="mono block text-[9.5px] text-txt-3">${f.id}${f.justificatif ? ' · justificatif joint' : ' · sans justificatif'}</span>
            </span>
          </div>
          <div class="text-[12px] text-txt-2">${escape(f.categorie)}</div>
          <div class="mono text-[11px] text-txt-3">${dateCourte(f.date)}</div>
          <div class="mono text-[12.5px] text-right">${euros(f.montant)}</div>
          <div class="flex items-center justify-end gap-1.5">
            ${f.etat === 'attente' ? `
              <button class="btn btn-sm !px-2" data-act="frais-refus" data-id="${f.id}" aria-label="Refuser">${icon('croix', 12)}</button>
              <button class="btn btn-sm btn-key" data-act="frais-valide" data-id="${f.id}">${icon('check', 12)} Rembourser</button>`
            : `<span class="chip"><i class="pip pip-${ton}"></i>${f.etat === 'valide' ? `Remboursé ${dateCourte(f.rembourse)}` : 'Refusé'}</span>`}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function rhRdv() {
  return `
  <div class="p-4 lg:p-6 max-w-[1000px]">
    <h2 class="text-[15px] font-normal mb-4">Rendez-vous clients à venir</h2>
    <div class="panel overflow-hidden">
      ${RENDEZVOUS.map((r) => {
        const c = client(r.clientId);
        const reb = rebours(r.quand);
        return `
        <div class="rdo rail rail-plan grid-cols-[86px_minmax(0,1fr)_150px_120px_100px] px-3.5" style="min-height:56px">
          <div>
            <p class="mono text-[13px]">${heure(r.quand)}</p>
            <p class="tag">${dateCourte(r.quand)}</p>
          </div>
          <div class="min-w-0 pr-4">
            <p class="text-[13px] truncate">${escape(r.objet)}</p>
            <p class="tag mt-0.5">${escape(c.nom)} · ${r.duree} min</p>
          </div>
          <div class="text-[12px] text-txt-2">${escape(r.lieu)}</div>
          <div>${pileAvatars(r.qui, 22)}</div>
          <div class="mono text-[11px] text-txt-3 text-right">${reb.texte}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function rhPaie() {
  return `
  <div class="p-4 lg:p-6 max-w-[1100px]">
    <div class="flex items-start gap-3 mb-4">
      <span style="color:var(--st-plan)">${icon('cadenas', 18)}</span>
      <div>
        <h2 class="text-[15px] font-normal">Coffre-fort des bulletins</h2>
        <p class="text-[12.5px] text-txt-3 leading-snug mt-0.5 max-w-[70ch]">
          Chaque salarié n’accède qu’à ses propres bulletins. La direction voit les dépôts, jamais le contenu des documents.
        </p>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      ${EQUIPE.map((e) => {
        const fiches = FICHES_PAIE.filter((f) => f.qui === e.id);
        return `
        <section class="panel">
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-rule">
            ${avatar(e.id, 26)}
            <div class="min-w-0">
              <p class="text-[12.5px] truncate">${escape(e.prenom)} ${escape(e.nom)}</p>
              <p class="tag">${e.contrat} · entré ${new Date(e.entree).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          ${fiches.map((f) => `
            <div class="flex items-center gap-2.5 px-4 py-2 border-b border-rule last:border-0">
              <span class="text-txt-3">${icon('cadenas', 13)}</span>
              <span class="text-[12px] capitalize">${escape(f.periode)}</span>
              <span class="mono text-[10px] text-txt-3 ml-auto">${f.poids}</span>
              <button class="btn btn-sm !px-2" data-act="paie" data-id="${f.id}" aria-label="Télécharger le bulletin de ${escape(f.periode)}">${icon('telecharger', 12)}</button>
            </div>`).join('')}
        </section>`;
      }).join('')}
    </div>
  </div>`;
}

/* ---------------------------------------------------------
   Vue — Facturation
   --------------------------------------------------------- */

function vueFacturation() {
  const mrr = CLIENTS.reduce((s, c) => s + c.prix, 0);
  const enRetardF = FACTURES.filter((f) => f.etat === 'retard');
  const attente = FACTURES.filter((f) => f.etat === 'envoyee');
  const encaisse = FACTURES.filter((f) => f.etat === 'payee').reduce((s, f) => s + f.montant, 0);

  return `
  <div class="p-4 lg:p-6 max-w-[1500px]">
    <h1 class="text-[21px] font-normal mb-5">Abonnements & facturation</h1>

    <div class="mb-5">
      ${releve(
        `Le récurrent s’établit à <strong class="font-normal text-txt">${euros(mrr)}</strong> par mois, en hausse de
         ${euros(SERIE_MRR.valeurs.at(-1) - SERIE_MRR.valeurs.at(-3))} sur deux mois.
         ${attente.length} facture${attente.length > 1 ? 's attendent' : ' attend'} leur règlement
         ${enRetardF.length ? `et <strong class="font-normal" style="color:var(--st-late)">${enRetardF.length} est à relancer</strong>.` : 'et rien n’est en retard.'}`,
        [
          { label: 'Récurrent mensuel', valeur: euros(mrr) },
          { label: 'Encaissé (2 mois)', valeur: euros(encaisse), ton: 'var(--st-live)' },
          { label: 'En attente', valeur: euros(attente.reduce((s, f) => s + f.montant, 0)), ton: 'var(--st-wait)' },
          { label: 'En retard', valeur: euros(enRetardF.reduce((s, f) => s + f.montant, 0)), ton: enRetardF.length ? 'var(--st-late)' : 'var(--txt-3)' },
        ])}
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-5">
      <section class="panel overflow-hidden">
        <div class="px-5 py-2.5 border-b border-rule flex items-center gap-3">
          <p class="tag">Factures</p>
          <button class="btn btn-sm ml-auto" data-act="nouvelle-facture">${icon('plus', 12)} Émettre</button>
        </div>
        <div class="rdo grid-cols-[130px_minmax(0,1fr)_110px_110px_110px] px-3.5 tag" style="min-height:34px;background:var(--ink-2)">
          <div>Numéro</div><div>Objet</div><div>Échéance</div><div>État</div><div class="text-right">Montant</div>
        </div>
        ${FACTURES.map((f) => `
          <div class="rdo rail rail-${{ payee: 'live', envoyee: 'wait', retard: 'late' }[f.etat] || 'idle'} grid-cols-[130px_minmax(0,1fr)_110px_110px_110px] px-3.5">
            <div class="mono text-[11px] text-txt-2">${f.id}</div>
            <div class="min-w-0 pr-4">
              <span class="block text-[12.5px] truncate">${escape(f.objet)}</span>
              <span class="tag">${escape(client(f.clientId).nom)}</span>
            </div>
            <div class="mono text-[11px] ${f.etat === 'retard' ? '' : 'text-txt-3'}" style="${f.etat === 'retard' ? 'color:var(--st-late)' : ''}">${dateCourte(f.echeance)}</div>
            <div>${chipFacture(f)}</div>
            <div class="mono text-[12.5px] text-right">${euros(f.montant)}</div>
          </div>`).join('')}
      </section>

      <div class="space-y-5">
        <section class="panel p-5">
          <h2 class="text-[14px] font-normal mb-1">Récurrent mensuel</h2>
          <p class="tag mb-4">6 derniers mois</p>
          <div class="h-[190px]"><canvas id="g-mrr" aria-label="Évolution du revenu récurrent mensuel"></canvas></div>
          ${tableDonnees(['Mois', 'Récurrent'], SERIE_MRR.labels.map((l, i) => [l, euros(SERIE_MRR.valeurs[i])]), 'du récurrent')}
        </section>

        <section class="panel p-5">
          <h2 class="text-[14px] font-normal mb-4">Formules</h2>
          <div class="space-y-3">
            ${PLANS.map((p) => {
              const n = CLIENTS.filter((c) => c.plan === p.nom).length;
              return `
              <div class="flex items-center gap-3">
                <span class="text-[13px] w-24">${escape(p.nom)}</span>
                <span class="flex-1">${jauge(n, CLIENTS.length, 'plan')}</span>
                <span class="mono text-[11px] text-txt-2 w-28 text-right">${n} × ${euros(p.prix)}</span>
              </div>`;
            }).join('')}
          </div>
        </section>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------
   Vue — Liaisons réseaux
   --------------------------------------------------------- */

function vueReseaux() {
  return `
  <div class="p-4 lg:p-6 max-w-[1300px]">
    <h1 class="text-[21px] font-normal mb-1">Liaisons réseaux</h1>
    <p class="text-[13px] text-txt-3 mb-5 max-w-[74ch]">
      Chaque compte client est relié aux API des plateformes. Une liaison rompue bloque toutes les publications
      programmées du compte : c’est la panne la plus coûteuse du système, elle est donc affichée en premier.
    </p>

    <section class="panel overflow-hidden mb-5">
      <div class="rdo grid-cols-[minmax(0,1fr)_130px_150px_150px_130px] px-3.5 tag" style="min-height:36px;background:var(--ink-2)">
        <div>Compte relié</div><div>État</div><div>Expiration du jeton</div><div>Dernière synchro</div><div class="text-right">Action</div>
      </div>
      ${[...CONNEXIONS].sort((a, b) => (a.etat === 'ok') - (b.etat === 'ok')).map((k) => {
        const ton = { ok: 'live', attention: 'wait', echec: 'late' }[k.etat];
        const jours = Math.round((k.expire - NOW) / 86400000);
        return `
        <div class="rdo rail rail-${ton} grid-cols-[minmax(0,1fr)_130px_150px_150px_130px] px-3.5" style="min-height:54px">
          <div class="flex items-center gap-3 min-w-0 pr-4">
            <span class="text-txt-2 shrink-0">${icon(RESEAUX[k.reseau].icon, 18)}</span>
            <span class="min-w-0">
              <span class="block text-[12.5px] truncate">${escape(k.compte)}</span>
              <span class="tag">${escape(client(k.clientId).nom)} · ${RESEAUX[k.reseau].label}</span>
            </span>
          </div>
          <div><span class="chip"><i class="pip pip-${ton} ${ton === 'late' ? 'pip-beat' : ''}"></i>${{ ok: 'Établie', attention: 'À renouveler', echec: 'Rompue' }[k.etat]}</span></div>
          <div class="pr-6">
            <p class="mono text-[10.5px] mb-1" style="color:${jours < 0 ? 'var(--st-late)' : jours < 10 ? 'var(--st-wait)' : 'var(--txt-3)'}">
              ${jours < 0 ? `expiré depuis ${-jours} j` : `dans ${jours} j`}</p>
            ${jauge(Math.max(0, Math.min(jours, 60)), 60, jours < 0 ? 'late' : jours < 10 ? 'wait' : 'live')}
          </div>
          <div class="mono text-[11px] text-txt-3">${heure(k.derniereSync)} · ${dateCourte(k.derniereSync)}</div>
          <div class="flex justify-end">
            <button class="btn btn-sm ${k.etat !== 'ok' ? 'btn-key' : ''}" data-act="reconnecter-liaison" data-id="${k.id}">
              ${icon('rafraichir', 12)} ${k.etat === 'ok' ? 'Tester' : 'Reconnecter'}</button>
          </div>
        </div>
        ${k.message ? `<div class="px-3.5 py-2 text-[11.5px] border-b border-rule" style="color:${k.etat === 'echec' ? '#ffb3c1' : 'var(--st-wait)'}">${escape(k.message)}</div>` : ''}`;
      }).join('')}
    </section>

    <section class="panel overflow-hidden">
      <div class="px-5 py-2.5 border-b border-rule"><p class="tag">Journal des appels API</p></div>
      ${JOURNAL_API.map((j) => `
        <div class="rdo grid-cols-[110px_minmax(0,1fr)_120px_90px] px-3.5" style="min-height:40px">
          <div class="mono text-[11px] text-txt-3">${heure(j.quand)} ${dateCourte(j.quand)}</div>
          <div class="flex items-center gap-2.5 min-w-0 pr-4">
            <span class="text-txt-3 shrink-0">${icon(RESEAUX[j.reseau].icon, 14)}</span>
            <span class="text-[12.5px] truncate">${escape(j.compte)}</span>
            <span class="mono text-[10.5px] text-txt-3 truncate hidden sm:inline">${escape(j.detail)}</span>
          </div>
          <div class="text-[12px] text-txt-2">${escape(j.action)}</div>
          <div class="flex justify-end">
            <span class="chip"><i class="pip pip-${j.resultat === 'ok' ? 'live' : 'late'}"></i>${j.resultat === 'ok' ? 'OK' : 'Échec'}</span>
          </div>
        </div>`).join('')}
    </section>
  </div>`;
}

/* ---------------------------------------------------------
   Vue — Analytique
   --------------------------------------------------------- */

function vueAnalytique() {
  const totalPubs = Object.keys(RESEAUX).reduce((s, r) => s + SERIE_PUBLICATIONS[r].reduce((a, b) => a + b, 0), 0);
  return `
  <div class="p-4 lg:p-6 max-w-[1500px]">
    <div class="flex flex-wrap items-end gap-3 mb-5">
      <h1 class="text-[21px] font-normal">Analytique</h1>
      <p class="text-[13px] text-txt-3 mb-0.5">6 derniers mois · ${nombre(totalPubs)} publications diffusées</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <section class="panel p-5">
        <h2 class="text-[14px] font-normal">Publications diffusées par réseau</h2>
        <p class="tag mb-4">cumul mensuel, tous comptes</p>
        <div class="h-[250px]"><canvas id="g-pubs" aria-label="Publications diffusées par réseau et par mois"></canvas></div>
        <div class="mt-4">${legende(Object.keys(RESEAUX).map((r) => ({
          label: RESEAUX[r].label, couleur: RESEAUX[r].serie,
          valeur: SERIE_PUBLICATIONS[r].reduce((a, b) => a + b, 0),
        })))}</div>
        ${tableDonnees(['Mois', ...Object.values(RESEAUX).map((r) => r.label)],
          SERIE_PUBLICATIONS.labels.map((l, i) => [l, ...Object.keys(RESEAUX).map((r) => SERIE_PUBLICATIONS[r][i])]), 'des publications')}
      </section>

      <section class="panel p-5">
        <h2 class="text-[14px] font-normal">Taux d’engagement</h2>
        <p class="tag mb-4">en %, 8 dernières semaines, comptes documentés</p>
        <div class="h-[250px]"><canvas id="g-engagement" aria-label="Taux d'engagement hebdomadaire par compte"></canvas></div>
        <div class="mt-4">${legende([
          { label: 'Papi Ours', couleur: SERIE[0], valeur: SERIE_ENGAGEMENT.papiours.at(-1) + ' %' },
          { label: 'Kalpy', couleur: SERIE[1], valeur: SERIE_ENGAGEMENT.kalpy.at(-1) + ' %' },
        ])}</div>
        ${tableDonnees(['Semaine', 'Papi Ours', 'Kalpy'],
          SERIE_ENGAGEMENT.labels.map((l, i) => [l, SERIE_ENGAGEMENT.papiours[i] + ' %', SERIE_ENGAGEMENT.kalpy[i] + ' %']), 'de l’engagement')}
      </section>

      <section class="panel p-5">
        <h2 class="text-[14px] font-normal">Délai moyen de validation client</h2>
        <p class="tag mb-4">en jours entre l’envoi d’une créa et la réponse</p>
        <div class="h-[230px]"><canvas id="g-delai" aria-label="Délai moyen de validation par client"></canvas></div>
        ${tableDonnees(['Compte', 'Délai moyen'],
          SERIE_DELAI_VALIDATION.labels.map((l, i) => [l, SERIE_DELAI_VALIDATION.valeurs[i] + ' j']), 'des délais')}
      </section>

      <section class="panel p-5">
        <h2 class="text-[14px] font-normal">Répartition des états de chantier</h2>
        <p class="tag mb-4">instantané du pipeline</p>
        <div class="h-[230px]"><canvas id="g-etats" aria-label="Répartition des chantiers par état"></canvas></div>
        <div class="mt-4">${legende(PIPELINE.filter((e) => CHANTIERS.some((c) => c.etat === e)).map((e, i) => ({
          label: ETATS[e].long, couleur: RAMPE[i % RAMPE.length],
          valeur: CHANTIERS.filter((c) => c.etat === e).length,
        })))}</div>
      </section>
    </div>
  </div>`;
}

function tracerAnalytique() {
  tracer('g-pubs', {
    type: 'bar',
    data: {
      labels: SERIE_PUBLICATIONS.labels,
      datasets: Object.keys(RESEAUX).map((r) => ({
        label: RESEAUX[r].label,
        data: SERIE_PUBLICATIONS[r],
        backgroundColor: RESEAUX[r].serie,
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 3,
        borderSkipped: false,
      })),
    },
    options: { scales: { x: { ...axeX(), stacked: true }, y: { ...axeY(), stacked: true } }, plugins: { tooltip: { mode: 'index' } } },
  });

  const ctxE = document.getElementById('g-engagement');
  if (ctxE) {
    const g = ctxE.getContext('2d');
    tracer('g-engagement', {
      type: 'line',
      data: {
        labels: SERIE_ENGAGEMENT.labels,
        datasets: [
          { label: 'Papi Ours', data: SERIE_ENGAGEMENT.papiours, borderColor: SERIE[0], backgroundColor: remplissage(g, SERIE[0], 250), borderWidth: 2, fill: true, tension: 0.32, pointRadius: 0, pointHoverRadius: 5 },
          { label: 'Kalpy', data: SERIE_ENGAGEMENT.kalpy, borderColor: SERIE[1], backgroundColor: remplissage(g, SERIE[1], 250), borderWidth: 2, fill: true, tension: 0.32, pointRadius: 0, pointHoverRadius: 5 },
        ],
      },
      options: {
        interaction: { mode: 'index', intersect: false },
        scales: { x: axeX(), y: axeY({ ticks: { callback: (v) => v + ' %', color: '#646f8c', padding: 8, maxTicksLimit: 5 } }) },
      },
    });
  }

  tracer('g-delai', {
    type: 'bar',
    data: {
      labels: SERIE_DELAI_VALIDATION.labels,
      datasets: [{ data: SERIE_DELAI_VALIDATION.valeurs, backgroundColor: SERIE_DELAI_VALIDATION.valeurs.map((v) => (v > 3 ? '#95610f' : '#0f9db4')), borderRadius: 3, borderSkipped: false, barThickness: 14 }],
    },
    options: {
      indexAxis: 'y',
      scales: { x: axeY({ ticks: { callback: (v) => v + ' j', color: '#646f8c', padding: 8, maxTicksLimit: 5 } }), y: { ...axeX(), grid: { display: false } } },
      plugins: { tooltip: { callbacks: { label: (c) => c.parsed.x + ' jours en moyenne' } } },
    },
  });

  const etats = PIPELINE.filter((e) => CHANTIERS.some((c) => c.etat === e));
  tracer('g-etats', {
    type: 'doughnut',
    data: {
      labels: etats.map((e) => ETATS[e].long),
      datasets: [{
        data: etats.map((e) => CHANTIERS.filter((c) => c.etat === e).length),
        backgroundColor: etats.map((_, i) => RAMPE[i % RAMPE.length]),
        borderColor: '#ffffff', borderWidth: 2, hoverOffset: 6,
      }],
    },
    options: { cutout: '62%' },
  });
}

/* ---------------------------------------------------------
   Tiroir — détail d'un chantier
   --------------------------------------------------------- */

function ouvrirChantier(id) {
  const c = chantier(id);
  if (!c) return;
  const cl = client(c.clientId);
  const reb = rebours(c.echeance);

  const html = `
  ${enteteTiroir(c.titre, `${c.id} · ${cl.nom} · ${c.type}`, `
    <div class="flex items-center gap-2 shrink-0">${etatChip(c.etat)}</div>`)}

  ${c.incident ? `
  <div class="px-6 py-4 border-b border-rule flex items-start gap-3" style="background:color-mix(in srgb, var(--st-late) 8%, #fff)">
    <span class="shrink-0 mt-0.5" style="color:var(--st-late-ink)">${icon('alerte', 16)}</span>
    <div class="min-w-0 flex-1">
      <p class="text-[13px]" style="color:var(--st-late-ink)">${escape(c.incident)}</p>
      <button class="btn btn-sm btn-key mt-3" data-act="reconnecter" data-id="${c.id}">
        ${icon('rafraichir', 12)} Reconnecter et republier</button>
    </div>
  </div>` : ''}

  ${c.etat === 'relecture' ? `
  <div class="px-6 py-4 border-b border-rule flex items-center gap-3" style="background:var(--surface-2)">
    <p class="text-[13px] text-txt-2 flex-1">La relecture interne est terminée ?</p>
    <button class="btn btn-sm btn-key shrink-0" data-act="envoyer-validation" data-id="${c.id}">
      ${icon('envoi', 12)} Envoyer en validation</button>
  </div>` : ''}

  <div class="px-6 py-5 border-b border-rule">
    <div class="flex items-center gap-3 mb-3">
      <p class="tag">${c.livrable ? 'Livrable' : 'Aperçu de la créa'}</p>
      <span class="mono text-[10.5px] text-txt-3 ml-auto">${escape(c.slug)}</span>
    </div>
    ${apercuChantier(c, cl)}
    ${c.livrable
      ? `<div class="flex flex-wrap gap-2 mt-3">
           <button class="btn btn-sm" data-act="fichier">${icon('telecharger', 12)} Télécharger le master</button>
           <button class="btn btn-sm" data-act="fichier">${icon('externe', 12)} Lien de relecture</button>
         </div>`
      : `<p class="text-[11.5px] text-txt-3 mt-2.5">Aperçu reconstitué depuis la charte du compte —
           le fichier source vit dans les outils de création.</p>`}
  </div>

  <div class="px-6 py-5 border-b border-rule">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-3">
      <div><p class="tag">Échéance</p><p class="mono text-[13px] mt-1" style="color:${reb.passe ? 'var(--st-late)' : 'var(--txt)'}">${dateCourte(c.echeance)} · ${heure(c.echeance)}</p></div>
      <div><p class="tag">Reste</p><p class="mono text-[13px] mt-1" style="color:${reb.passe ? 'var(--st-late)' : 'var(--txt)'}">${reb.passe ? 'retard ' : ''}${reb.texte}</p></div>
      <div><p class="tag">Responsable</p><p class="mt-1 flex items-center gap-2">${avatar(c.ownerId, 22)}<span class="text-[12.5px]">${membre(c.ownerId).prenom}</span></p></div>
      <div><p class="tag">Diffusion</p><p class="mono text-[13px] mt-1">${c.diffusion ? dateCourte(c.diffusion) : '—'}</p></div>
    </div>
  </div>

  <div class="px-6 py-5 border-b border-rule">
    <p class="tag mb-2">Brief du client</p>
    <p class="text-[13px] text-txt-2 leading-relaxed">${escape(c.brief)}</p>
    <div class="flex flex-wrap items-center gap-2 mt-4">
      ${c.reseaux.map((r) => `<span class="chip">${icon(RESEAUX[r].icon, 12)}${RESEAUX[r].label}</span>`).join('')}
    </div>
  </div>

  <div class="border-b border-rule">
    <div class="flex items-center gap-3 px-6 py-2.5 border-b border-rule">
      <p class="tag">Chiffrage</p>
      <span class="ml-auto mono text-[13px]">${c.devis.montant ? euros(c.devis.montant) : 'à établir'}</span>
    </div>
    <div class="px-6 py-4 flex flex-wrap items-center gap-3">
      ${{
        accepte: `<span class="chip"><i class="pip pip-live"></i>Accepté le ${c.devis.reponse ? dateCourte(c.devis.reponse) : ''}</span>`,
        envoye: `<span class="chip"><i class="pip pip-wait"></i>Envoyé le ${c.devis.envoye ? dateCourte(c.devis.envoye) : ''} — sans réponse</span>`,
        brouillon: `<span class="chip"><i class="pip pip-plan"></i>Brouillon</span>`,
        a_chiffrer: `<span class="chip"><i class="pip pip-idle"></i>Pas encore chiffré</span>`,
        inclus: `<span class="chip"><i class="pip pip-live"></i>Inclus dans l’abonnement</span>`,
      }[c.devis.statut] || ''}
      ${['a_chiffrer', 'brouillon'].includes(c.devis.statut)
        ? `<button class="btn btn-sm btn-key ml-auto" data-act="chiffrer" data-id="${c.id}">${icon('euro', 12)} Chiffrer et envoyer</button>`
        : `<span class="mono text-[11px] text-txt-3 ml-auto">${c.tempsPasse} h passées / ${c.tempsVendu} h vendues</span>`}
    </div>
    ${c.tempsVendu ? `<div class="px-6 pb-4">${jauge(c.tempsPasse, c.tempsVendu, c.tempsPasse > c.tempsVendu ? 'late' : 'work')}</div>` : ''}
  </div>

  <div class="border-b border-rule">
    <div class="flex items-center gap-3 px-6 py-2.5 border-b border-rule">
      <p class="tag">Sous-tâches</p>
      <span class="mono text-[10px] text-txt-3 ml-auto">${c.taches.filter((t) => t.etat === 'fait').length}/${c.taches.length}</span>
    </div>
    ${c.taches.length ? c.taches.map((t) => `
      <div class="rdo rail rail-${SOUS_ETATS[t.etat].rail} grid-cols-[minmax(0,1fr)_92px_86px_40px] px-6" style="min-height:46px">
        <div class="flex items-center gap-2.5 min-w-0 pr-3">
          ${icon(NATURES[t.nature].icon, 14, 'opacity-45 shrink-0')}
          <span class="min-w-0">
            <span class="block text-[12.5px] truncate">${escape(t.label)}</span>
            <span class="tag">${NATURES[t.nature].label} · ${t.duree} h</span>
          </span>
        </div>
        <div>${etatChip(t.etat, { taille: 'xs' })}</div>
        <div class="mono text-[10.5px] text-txt-3">${dateCourte(t.echeance)}</div>
        <div class="flex justify-end">${avatar(t.ownerId, 22)}</div>
      </div>`).join('') : `<p class="px-6 py-4 text-[12.5px] text-txt-3">Chantier pas encore découpé.</p>`}
    <div class="px-6 py-3">
      <button class="btn btn-sm" data-act="ajouter-tache" data-id="${c.id}">${icon('plus', 12)} Ajouter une sous-tâche</button>
    </div>
  </div>

  ${c.fichiers.length ? `
  <div class="border-b border-rule">
    <div class="px-6 py-2.5 border-b border-rule"><p class="tag">Fichiers</p></div>
    ${c.fichiers.map((f) => `
      <div class="flex items-center gap-3 px-6 py-2.5 border-b border-rule last:border-0">
        <span class="text-txt-3">${icon(f.type, 15)}</span>
        <span class="text-[12.5px] truncate">${escape(f.nom)}</span>
        <span class="mono text-[10.5px] text-txt-3 ml-auto">${escape(f.poids)}</span>
        <button class="btn btn-sm !px-2" aria-label="Télécharger ${escape(f.nom)}" data-act="fichier">${icon('telecharger', 12)}</button>
      </div>`).join('')}
  </div>` : ''}

  <div>
    <div class="px-6 py-2.5 border-b border-rule"><p class="tag">Fil de discussion</p></div>
    <div class="px-6 py-4 space-y-4">
      ${c.fil.length ? c.fil.map((m) => `
        <div class="flex gap-3">
          <span class="mono h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[9.5px]"
            style="background:${m.cote === 'client' ? 'rgba(255,176,32,.14)' : 'var(--ink-3)'};color:${m.cote === 'client' ? '#ffb020' : 'var(--txt-2)'}">
            ${escape(m.qui.split(' ').map((x) => x[0]).join(''))}</span>
          <div class="min-w-0">
            <p class="text-[12px]"><span class="text-txt">${escape(m.qui)}</span>
              <span class="tag ml-1.5">${m.cote === 'client' ? 'client' : 'agence'} · ${dateCourte(m.quand)} ${heure(m.quand)}</span></p>
            <p class="text-[12.5px] text-txt-2 leading-relaxed mt-1">${escape(m.texte)}</p>
          </div>
        </div>`).join('') : `<p class="text-[12.5px] text-txt-3">Aucun échange sur ce chantier.</p>`}
      <div class="flex gap-2 pt-2">
        <input class="field !py-2 !text-[12.5px]" placeholder="Répondre au client…" data-champ="reponse" aria-label="Répondre au client">
        <button class="btn btn-key shrink-0" data-act="repondre" data-id="${c.id}">${icon('envoi', 12)}</button>
      </div>
    </div>
  </div>`;

  tiroir(html, { large: true });
}

/* ---------------------------------------------------------
   Actions
   --------------------------------------------------------- */

function actionGlobale(acte, el) {
  const id = el.dataset.id;
  switch (acte) {
    case 'horizon': S.horizon = +el.dataset.h; rendre(); break;
    case 'ouvrir-chantier': ouvrirChantier(id); break;
    case 'fiche': naviguer(`#/comptes/${id}`); break;
    case 'mois': {
      const d = +el.dataset.d;
      S.moisGrille = d === 0 ? new Date(NOW.getFullYear(), NOW.getMonth(), 1)
        : new Date(S.moisGrille.getFullYear(), S.moisGrille.getMonth() + d, 1);
      rendre();
      break;
    }
    case 'jour': ouvrirJour(new Date(el.dataset.j)); break;
    case 'pousser': pousser(el.dataset.pub); break;
    case 'pousser-tout': {
      const prets = PUBLICATIONS.filter((p) => ['pret', 'manque'].includes(etatReel(p)));
      prets.forEach((p) => { p.etat = 'en_ligne'; });
      signal(`${prets.length} publications poussées vers les réseaux (simulation)`, 'live');
      rendre();
      break;
    }
    case 'etat-precedent': case 'etat-suivant': {
      // Équivalent clavier du glisser-déposer : sans lui, changer l'état d'un
      // chantier serait impossible sans souris.
      const c = chantier(id);
      const i = PIPELINE.indexOf(c.etat) + (acte === 'etat-suivant' ? 1 : -1);
      if (i < 0 || i >= PIPELINE.length) return;
      c.etat = PIPELINE[i];
      signal(`${c.id} passé en « ${ETATS[c.etat].long} »`, ETATS[c.etat].pip);
      rendre();
      // En bout de course le bouton d'origine devient inactif : on rend le focus
      // à celui qui reste utilisable plutôt que de le laisser retomber sur le corps.
      const carte = document.querySelector(`[data-carte="${c.id}"]`);
      const memeSens = carte && carte.querySelector(`[data-act="${acte}"]:not([disabled])`);
      const autreSens = carte && carte.querySelector('[data-act^="etat-"]:not([disabled])');
      (memeSens || autreSens || carte)?.focus();
      break;
    }
    case 'onglet-rh': S.equipeOnglet = el.dataset.o; rendre(); break;
    case 'conge-valide': case 'conge-refus': {
      const c = CONGES.find((x) => x.id === id);
      c.etat = acte === 'conge-valide' ? 'valide' : 'refuse';
      if (acte === 'conge-refus') c.motif = 'Refusé depuis la conduite.';
      signal(`Demande ${c.id} ${c.etat === 'valide' ? 'validée' : 'refusée'}`, c.etat === 'valide' ? 'live' : 'late');
      rendre();
      break;
    }
    case 'frais-valide': case 'frais-refus': {
      const f = FRAIS.find((x) => x.id === id);
      f.etat = acte === 'frais-valide' ? 'valide' : 'refuse';
      if (f.etat === 'valide') f.rembourse = NOW;
      signal(`Note ${f.id} ${f.etat === 'valide' ? 'mise au remboursement' : 'refusée'}`, f.etat === 'valide' ? 'live' : 'late');
      rendre();
      break;
    }
    case 'generer': {
      S.studio.calcul = true; S.studio.resultats = null; rendre();
      setTimeout(() => { S.studio.calcul = false; S.studio.resultats = true; rendre(); }, 1500);
      break;
    }
    case 'studio-valider': {
      signal('Piste envoyée au client pour validation', 'live');
      break;
    }
    case 'studio-retoucher': signal('Ouverture dans l’éditeur — non implémenté dans la maquette', 'plan'); break;
    case 'reconnecter': case 'reconnecter-liaison': {
      const ch = chantier(id);
      const remettre = (k) => { k.etat = 'ok'; k.expire = D(60); k.message = null; k.derniereSync = new Date(); };
      const k = CONNEXIONS.find((x) => x.id === id);
      if (k) remettre(k);
      if (ch && ch.etat === 'echec') {
        // Republier un chantier en échec suppose de réparer la liaison qui l'a fait tomber.
        CONNEXIONS.filter((x) => x.clientId === ch.clientId && ch.reseaux.includes(x.reseau) && x.etat !== 'ok').forEach(remettre);
        ch.etat = 'pret';
        ch.incident = null;
        ch.taches.filter((t) => t.etat === 'bloque').forEach((t) => { t.etat = 'fait'; });
      }
      signal('Liaison rétablie (simulation) — publications réarmées', 'live');
      rendre();
      break;
    }
    case 'envoyer-validation': {
      const c = chantier(id);
      c.etat = 'validation';
      signal(`${c.id} envoyé au client pour validation`, 'wait');
      rendre();
      break;
    }
    case 'chiffrer': {
      const c = chantier(id);
      c.devis.statut = 'envoye';
      c.devis.envoye = new Date();
      c.devis.montant = c.devis.montant || 1200;
      c.etat = 'attente';
      signal(`Devis de ${euros(c.devis.montant)} envoyé à ${client(c.clientId).nom}`, 'wait');
      fermerTiroir();
      rendre();
      break;
    }
    case 'copier': {
      navigator.clipboard?.writeText(el.dataset.valeur);
      signal(`${el.dataset.valeur} copié`, 'plan');
      break;
    }
    case 'repondre': {
      const champ = document.querySelector('[data-champ="reponse"]');
      const c = chantier(id);
      if (champ && champ.value.trim()) {
        c.fil.push({ qui: 'Adrien M.', cote: 'agence', quand: new Date(), texte: champ.value.trim() });
        fermerTiroir();
        ouvrirChantier(id);
        signal('Réponse envoyée au client', 'live');
      }
      break;
    }
    case 'ajouter-tache': {
      const c = chantier(id);
      c.taches.push({ id: 't' + (c.taches.length + 1), nature: 'montage', label: 'Nouvelle sous-tâche', etat: 'a_faire', ownerId: c.ownerId, duree: 2, echeance: c.echeance });
      fermerTiroir();
      signal('Sous-tâche ajoutée', 'work');
      rendre();
      break;
    }
    case 'nouveau-chantier': ouvrirNouveauChantier(); break;
    case 'notifs': ouvrirNotifications(); break;
    case 'menu': ouvrirMenuMobile(); break;
    case 'paie': signal('Bulletin déchiffré et téléchargé (simulation)', 'plan'); break;
    case 'fichier': signal('Téléchargement simulé', 'plan'); break;
    case 'exporter-frais': signal('Export comptable généré (simulation)', 'plan'); break;
    case 'nouvelle-facture': signal('Éditeur de facture — non implémenté dans la maquette', 'plan'); break;
    case 'nouveau-compte': signal('Création de compte — non implémentée dans la maquette', 'plan'); break;
    case 'deconnexion': signal('Déconnexion simulée', 'idle'); break;
    default: break;
  }
}

function pousser(pubId) {
  const p = PUBLICATIONS.find((x) => x.id === pubId);
  if (!p) return;
  p.etat = 'en_ligne';
  signal(`Publication poussée vers ${RESEAUX[p.reseau].label} (simulation)`, 'live');
  rendre();
}

function ouvrirJour(d) {
  const items = PUBLICATIONS.filter((p) => memeJour(p.quand, d) && (!S.filtreClient || p.clientId === S.filtreClient));
  tiroir(`
    ${enteteTiroir(dateLongue(d), `${items.length} publication${items.length > 1 ? 's' : ''} programmée${items.length > 1 ? 's' : ''}`)}
    ${items.length ? items.map((p) => `
      <article class="px-6 py-4 border-b border-rule rail rail-${ETATS[etatReel(p)].rail}">
        <div class="flex items-center gap-2.5 mb-2">
          <span class="mono text-[13px]">${heure(p.quand)}</span>
          ${reseauGlyphe(p.reseau, 15)}
          <span class="text-[12.5px]">${escape(client(p.clientId).nom)}</span>
          <span class="ml-auto">${etatChip(etatReel(p), { taille: 'xs' })}</span>
        </div>
        <p class="text-[13px] text-txt-2 leading-relaxed">${escape(p.legende)}</p>
        <div class="flex items-center gap-2 mt-3">
          <span class="chip">${escape(p.format)}</span>
          ${p.portee ? `<span class="mono text-[10.5px] text-txt-3">${nombre(p.portee)} vues · ${nombre(p.interactions)} interactions</span>` : ''}
          ${['pret','manque'].includes(etatReel(p)) ? `<button class="btn btn-sm btn-key ml-auto" data-act="pousser" data-pub="${p.id}">${icon('envoi', 12)} Pousser</button>` : ''}
        </div>
      </article>`).join('') : vide('Journée libre', 'Aucune publication n’est programmée ce jour-là pour la sélection en cours.')}
  `);
}

function ouvrirNouveauChantier() {
  tiroir(`
    ${enteteTiroir('Nouveau chantier', 'Il rejoindra la conduite dès sa création')}
    <form class="px-6 py-5 space-y-4" data-form="chantier">
      <label class="block"><span class="tag block mb-1.5">Compte</span>
        <select class="field" name="client">${CLIENTS.map((c) => `<option value="${c.id}">${escape(c.nom)}</option>`).join('')}</select></label>
      <label class="block"><span class="tag block mb-1.5">Intitulé</span>
        <input class="field" name="titre" placeholder="Ex. Affiche soirée concert du 21" required></label>
      <label class="block"><span class="tag block mb-1.5">Type</span>
        <select class="field" name="type">${['Post', 'Carrousel', 'Vidéo sociale', 'Vidéo', 'Photo', 'Affiche & posts', 'Identité sociale'].map((t) => `<option>${t}</option>`).join('')}</select></label>
      <label class="block"><span class="tag block mb-1.5">Brief</span>
        <textarea class="field h-24 resize-none" name="brief" placeholder="Ce que le client demande, dans ses mots."></textarea></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block"><span class="tag block mb-1.5">Échéance</span>
          <input class="field" type="date" name="echeance" value="${D(7).toISOString().slice(0, 10)}"></label>
        <label class="block"><span class="tag block mb-1.5">Responsable</span>
          <select class="field" name="owner">${EQUIPE.map((e) => `<option value="${e.id}">${escape(e.prenom)} ${escape(e.nom)}</option>`).join('')}</select></label>
      </div>
      <fieldset><legend class="tag mb-1.5">Réseaux visés</legend>
        <div class="flex flex-wrap gap-2">
          ${Object.keys(RESEAUX).map((r) => `
            <label class="chip cursor-pointer hover:border-[color:var(--rule-strong)] transition-colors">
              <input type="checkbox" name="reseau" value="${r}" class="accent-[#00d8ff]">${RESEAUX[r].label}</label>`).join('')}
        </div>
      </fieldset>
      <div class="flex items-center gap-2 pt-2">
        <button type="button" class="btn" data-fermer>Annuler</button>
        <button type="submit" class="btn btn-key flex-1 justify-center">${icon('plus', 13)} Créer le chantier</button>
      </div>
    </form>`);

  document.querySelector('[data-form="chantier"]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const cl = client(f.get('client'));
    const reseaux = f.getAll('reseau');
    const num = 'LU-' + (2456 + CHANTIERS.length);
    CHANTIERS.unshift({
      id: num,
      slug: `${cl.nom.toUpperCase().replace(/[^A-Z]/g, '')}_${String(f.get('titre')).toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 24)}`,
      titre: f.get('titre'), clientId: cl.id, type: f.get('type'), etat: 'brief', priorite: 'normale',
      ownerId: f.get('owner'), ouvert: new Date(), echeance: new Date(f.get('echeance') + 'T18:00'),
      diffusion: null, reseaux: reseaux.length ? reseaux : ['instagram'],
      devis: { montant: 0, statut: 'a_chiffrer', envoye: null, reponse: null },
      brief: f.get('brief') || '—', tempsVendu: 0, tempsPasse: 0, taches: [], fichiers: [], fil: [],
    });
    fermerTiroir();
    signal(`${num} créé et posé sur la conduite`, 'live');
    naviguer('#/conduite');
    rendre();
  });
}

function ouvrirNotifications() {
  const ko = liaisonsKO();
  tiroir(`
    ${enteteTiroir('Notifications', `${ko.length + incidents().length} points d’attention`)}
    ${[...incidents().map((c) => ({ ton: 'late', titre: c.titre, texte: c.incident || 'Chantier en échec', quand: c.echeance })),
       ...ko.map((k) => ({ ton: k.etat === 'echec' ? 'late' : 'wait', titre: k.compte, texte: k.message, quand: k.derniereSync })),
       ...ACTIVITE.slice(0, 5).map((a) => ({ ton: a.alerte ? 'late' : 'idle', titre: a.qui ? membre(a.qui).prenom : 'Système', texte: a.texte, quand: a.quand }))]
      .map((n) => `
        <div class="flex gap-3 px-6 py-3.5 border-b border-rule">
          <i class="pip pip-${n.ton} mt-1.5"></i>
          <div class="min-w-0">
            <p class="text-[12.5px]">${escape(n.titre)}</p>
            <p class="text-[12px] text-txt-3 leading-snug mt-0.5">${escape(n.texte)}</p>
            <p class="tag mt-1">${heure(n.quand)} · ${dateCourte(n.quand)}</p>
          </div>
        </div>`).join('')}
  `);
}

function ouvrirMenuMobile() {
  tiroir(`
    ${enteteTiroir('Navigation', 'line up. — conduite d’agence')}
    <nav class="py-2">
      ${LENTILLES.map((g) => `
        <p class="tag px-6 pb-2 pt-4">${g.groupe}</p>
        ${g.items.map((i) => `<a href="#/${i.cle}" class="nav-item !px-6 text-[13px]" data-fermer>
          ${icon(i.ic, 17, 'opacity-70')}<span>${i.label}</span></a>`).join('')}`).join('')}
      <div class="px-6 pt-5"><a href="client.html" class="btn w-full justify-center">${icon('externe', 12)} Portail client</a></div>
    </nav>`);
}

/* ---------------------------------------------------------
   Rendu
   --------------------------------------------------------- */

const VUES = {
  conduite: vueConduite, pipeline: vuePipeline, grille: vueGrille, comptes: vueComptes,
  studio: vueStudio, equipe: vueEquipe, facturation: vueFacturation, reseaux: vueReseaux,
  analytique: vueAnalytique,
};

function rendre() {
  detruireGraphiques();
  document.getElementById('barre-maitresse').innerHTML = barreMaitresse();
  const hote = document.getElementById('vue');
  hote.innerHTML = (VUES[S.vue] || vueConduite)();

  document.querySelectorAll('[data-lentille]').forEach((n) => {
    n.setAttribute('aria-current', n.dataset.lentille === S.vue ? 'page' : 'false');
  });
  const compteurs = {
    conduite: chantiersActifs().filter(enRetard).length,
    pipeline: aValider().length,
    equipe: CONGES.filter((c) => c.etat === 'attente').length + FRAIS.filter((f) => f.etat === 'attente').length,
    reseaux: liaisonsKO().length,
  };
  document.querySelectorAll('[data-compteur]').forEach((n) => {
    const v = compteurs[n.dataset.compteur];
    n.textContent = v || '';
    n.className = `ml-auto mono text-[10px] ${v ? 'opacity-100' : 'opacity-0'}`;
    n.style.color = v ? 'var(--st-wait)' : '';
  });

  if (S.vue === 'pipeline') brancherGlisserDeposer();
  if (S.vue === 'analytique') tracerAnalytique();
  if (S.vue === 'facturation') tracerFacturation();
  if (S.vue === 'equipe' && S.equipeOnglet === 'charge') tracerCharge();

  /* La recherche vit dans la barre d'action, hors de la vue : les deux
     conteneurs sont recréés à chaque rendu, aucun écouteur ne s'empile. */
  [...document.getElementById('barre-maitresse').querySelectorAll('[data-champ]'),
   ...hote.querySelectorAll('[data-champ]')].forEach((n) => {
    const nom = n.dataset.champ;
    const evt = n.tagName === 'SELECT' ? 'change' : 'input';
    n.addEventListener(evt, () => {
      if (nom.startsWith('studio')) {
        const k = nom.replace('studio', '').toLowerCase();
        S.studio[k === 'client' ? 'clientId' : k] = n.value;
        if (k === 'client') S.studio.resultats = null;
        if (evt === 'change') rendre();
        return;
      }
      if (nom === 'recherche') {
        S.recherche = n.value;
        const pos = n.selectionStart;
        rendre();
        const nouveau = document.querySelector('[data-champ="recherche"]');
        if (nouveau) { nouveau.focus(); nouveau.setSelectionRange(pos, pos); }
        return;
      }
      S[nom] = n.value;
      rendre();
    });
  });
}

function tracerFacturation() {
  const el = document.getElementById('g-mrr');
  if (!el) return;
  const g = el.getContext('2d');
  tracer('g-mrr', {
    type: 'line',
    data: {
      labels: SERIE_MRR.labels,
      datasets: [{ label: 'Récurrent', data: SERIE_MRR.valeurs, borderColor: SERIE[0], backgroundColor: remplissage(g, SERIE[0], 190), borderWidth: 2, fill: true, tension: 0.3, pointRadius: 0, pointHoverRadius: 5 }],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      scales: { x: axeX(), y: axeY({ ticks: { callback: (v) => (v / 1000).toFixed(1) + ' k€', color: '#646f8c', padding: 8, maxTicksLimit: 4 } }) },
      plugins: { tooltip: { callbacks: { label: (c) => euros(c.parsed.y) } } },
    },
  });
}

function tracerCharge() {
  tracer('g-charge', {
    type: 'bar',
    data: {
      labels: SERIE_CHARGE.labels,
      datasets: [
        {
          label: 'Charge engagée',
          data: chargeTotale,
          backgroundColor: chargeTotale.map((v) => (v > CAPACITE ? '#95610f' : SERIE[0])),
          borderRadius: 3, borderSkipped: false, barThickness: 44, order: 2,
        },
        {
          label: 'Capacité de l’équipe',
          data: SERIE_CHARGE.labels.map(() => CAPACITE),
          type: 'line',
          borderColor: '#646f8c', borderWidth: 2, borderDash: [4, 4],
          pointRadius: 0, pointHoverRadius: 0, fill: false, order: 1,
        },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: axeX(),
        y: axeY({ suggestedMax: CAPACITE + 4, ticks: { callback: (v) => v + ' j', color: '#646f8c', padding: 8, maxTicksLimit: 5 } }),
      },
      plugins: { tooltip: { callbacks: { label: (c) => `${c.dataset.label} : ${c.parsed.y.toLocaleString('fr-FR')} j` } } },
    },
  });
}

/* ---------------------------------------------------------
   Amorçage
   --------------------------------------------------------- */

coque();
routeur((vue, args) => {
  S.vue = VUES[vue] ? vue : 'conduite';
  S.args = args;
  rendre();
  document.getElementById('vue').scrollTop = 0;
});

/* L'horloge de la barre maîtresse bat toute seule. */
setInterval(() => {
  const h = document.getElementById('horloge');
  const s = document.getElementById('secondes');
  if (!h || !s) return;
  const t = new Date();
  h.childNodes[0].nodeValue = heure(t);
  s.textContent = ':' + p2(t.getSeconds());
}, 1000);

})();
