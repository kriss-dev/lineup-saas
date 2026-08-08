(function () {
  'use strict';

/* =========================================================
   line up. — espace client
   La même ligne que la régie, filtrée aux droits du client.
   ========================================================= */

const {
  iconSprite, icon,
  NOW, D, ETATS, SOUS_ETATS, NATURES, RESEAUX, SERIE, CLIENTS, client, CHANTIERS,
  PUBLICATIONS, FACTURES, REALISATIONS, SERIE_ENGAGEMENT, PLANS,
  p2, heure, dateCourte, dateLongue, euros, nombre, memeJour, relatif, rebours, escape,
  etatChip, reseauGlyphe, jauge, apercuCrea, releve, vide, routeur, naviguer, tiroir,
  fermerTiroir, enteteTiroir, signal, reglerChart, axeX, axeY, legende, remplissage,
  tracer, detruireGraphiques, tableDonnees, surAction,
} = window.LU;

if (window.Chart) reglerChart(window.Chart);

const COMPTES = CLIENTS.filter((c) => c.charte);

const S = {
  compte: 'papiours',
  vue: 'accueil',
  args: [],
  mois: new Date(NOW.getFullYear(), NOW.getMonth(), 1),
  nouvelle: null,
};

const ONGLETS = [
  { cle: 'accueil', label: 'Accueil', ic: 'conduite' },
  { cle: 'demandes', label: 'Mes demandes', ic: 'pipeline' },
  { cle: 'validations', label: 'À valider', ic: 'check' },
  { cle: 'planning', label: 'Planning', ic: 'grille' },
  { cle: 'performance', label: 'Performance', ic: 'analytique' },
  { cle: 'marque', label: 'Ma marque', ic: 'palette' },
  { cle: 'factures', label: 'Factures', ic: 'facturation' },
];

/* L'interlocuteur Line Up du compte, tel que le client le connaît. */
const REFERENT = { initiales: 'AM', nom: 'Adrien M.', role: 'Chef de projet', couleur: '#b2455a' };

/* ---------------- Dérivés ---------------- */

const moi = () => client(S.compte);
const mesChantiers = () => CHANTIERS.filter((c) => c.clientId === S.compte);
const mesDevis = () => mesChantiers().filter((c) => c.devis.statut === 'envoye');
const mesValidations = () => mesChantiers().filter((c) => c.etat === 'validation');
const mesPubs = () => PUBLICATIONS.filter((p) => p.clientId === S.compte);
const mesFactures = () => FACTURES.filter((f) => f.clientId === S.compte);
const decisions = () => mesDevis().length + mesValidations().length;

/* ---------------- Coque ---------------- */

function coque() {
  document.getElementById('app').innerHTML = `
  ${iconSprite()}
  <header class="sticky top-0 z-40 border-b border-rule" style="background:rgba(17,22,35,.95);backdrop-filter:blur(8px)">
    <div class="flex items-center gap-4 px-4 lg:px-6 h-[58px]">
      <a href="index.html" class="shrink-0" aria-label="line up.">
        <img src="assets/lineup-mark.png" alt="line up." class="h-[21px] w-auto">
      </a>
      <span class="hidden sm:block h-6 w-px" style="background:var(--rule-strong)"></span>
      <p class="hidden sm:block tag">Espace client</p>
      <div class="ml-auto flex items-center gap-2">
        <label class="flex items-center gap-2">
          <span class="sr-only">Compte de démonstration</span>
          <select class="field !w-auto !py-1.5 !text-[12px]" data-champ="compte">
            ${COMPTES.map((c) => `<option value="${c.id}" ${S.compte === c.id ? 'selected' : ''}>${escape(c.nom)}</option>`).join('')}
          </select>
        </label>
        <button class="btn btn-sm !px-2" data-act="aide" aria-label="Comment ça marche">${icon('info', 14)}</button>
        <button class="btn btn-key btn-sm" data-act="nouvelle-demande">${icon('plus', 12)} <span class="hidden sm:inline">Nouvelle demande</span></button>
      </div>
    </div>
    <nav class="flex items-center gap-1 px-2 lg:px-4 overflow-x-auto scroll" aria-label="Sections">
      ${ONGLETS.map((o) => `
        <a href="#/${o.cle}" data-onglet="${o.cle}"
          class="relative flex items-center gap-2 px-3 py-2.5 text-[13px] whitespace-nowrap transition-colors">
          ${icon(o.ic, 15, 'opacity-60')}<span>${o.label}</span>
          <span class="mono text-[10px] opacity-0" data-badge="${o.cle}"></span>
        </a>`).join('')}
    </nav>
  </header>
  <main id="vue" class="flex-1" tabindex="-1"></main>
  <footer class="border-t border-rule px-4 lg:px-6 py-5 flex flex-wrap items-center gap-4" style="background:var(--ink-1)">
    <img src="assets/lineup-mark.png" alt="" class="h-[16px] w-auto opacity-60">
    <p class="text-[11.5px] text-txt-3">Espace client propulsé par Line Up — maquette de démonstration, données fictives.</p>
    <a href="agence.html" class="btn btn-sm ml-auto">${icon('externe', 12)} Vue agence</a>
  </footer>`;

  surAction(document.getElementById('app'), action);

  // L'en-tête n'est monté qu'une fois : son écouteur aussi.
  document.querySelector('[data-champ="compte"]').addEventListener('change', (e) => {
    S.compte = e.target.value;
    rendre();
  });
}

/* ---------------- Accueil ---------------- */

function vueAccueil() {
  const c = moi();
  const dus = Object.values(c.cadence).reduce((a, b) => a + b, 0);
  const faits = Object.values(c.consomme).reduce((a, b) => a + b, 0);
  const aVenir = mesPubs().filter((p) => p.quand > NOW).slice(0, 6);
  const enCours = mesChantiers().filter((x) => x.etat !== 'en_ligne');
  const dec = [
    ...mesDevis().map((x) => ({ type: 'devis', c: x })),
    ...mesValidations().map((x) => ({ type: 'crea', c: x })),
  ];

  return `
  <div class="max-w-[1240px] mx-auto px-4 lg:px-6 py-6">
    <div class="flex flex-wrap items-end gap-3 mb-5">
      <h1 class="text-[23px] font-normal leading-tight">Bonjour ${escape(c.contacts[0].nom.split(' ')[0])}.</h1>
      <p class="text-[13px] text-txt-3 mb-1">
        ${dec.length === 0 ? 'Rien n’attend votre décision.'
          : dec.length === 1 ? 'Une chose attend votre décision.'
          : `${dec.length} choses attendent votre décision.`}
      </p>
    </div>

    ${dec.length ? `
    <section class="mb-6" aria-labelledby="t-decisions">
      <div class="flex items-center gap-2 mb-2.5">
        <h2 id="t-decisions" class="tag">À vous de jouer</h2>
        <span class="flex-1 h-px" style="background:var(--rule)"></span>
      </div>
      <div class="roll grid grid-cols-1 md:grid-cols-2 gap-3">
        ${dec.map((d) => (d.type === 'devis' ? carteDevis(d.c) : carteCrea(d.c))).join('')}
      </div>
    </section>` : ''}

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-5">
      <div class="space-y-5 min-w-0">
        <section class="panel overflow-hidden">
          <div class="flex items-center gap-3 px-5 py-2.5 border-b border-rule">
            <h2 class="tag">Prochaines publications</h2>
            <a href="#/planning" class="mono text-[10px] text-txt-3 hover:text-txt-2 ml-auto transition-colors">tout le planning →</a>
          </div>
          ${aVenir.length ? aVenir.map((p) => {
            const reb = rebours(p.quand);
            return `
            <div class="rdo rail rail-${ETATS[p.etat].rail} px-3.5
                grid-cols-[58px_minmax(0,1fr)_auto] sm:grid-cols-[64px_minmax(0,1fr)_148px_84px]" style="min-height:52px">
              <div>
                <p class="mono text-[12px]">${heure(p.quand)}</p>
                <p class="tag">${dateCourte(p.quand)}</p>
              </div>
              <div class="min-w-0 pr-3 flex items-center gap-2.5">
                ${reseauGlyphe(p.reseau, 15)}
                <span class="text-[12.5px] truncate">${escape(p.legende)}</span>
              </div>
              <div class="justify-self-end sm:justify-self-start">${etatChip(p.etat, { taille: 'xs', voix: 'client' })}</div>
              <div class="mono text-[10.5px] text-txt-3 text-right hidden sm:block whitespace-nowrap">${reb.texte}</div>
            </div>`;
          }).join('') : vide('Rien de programmé', 'Aucune publication n’est encore calée sur les prochains jours.')}
        </section>

        <section class="panel overflow-hidden">
          <div class="flex items-center gap-3 px-5 py-2.5 border-b border-rule">
            <h2 class="tag">Demandes en cours</h2>
            <a href="#/demandes" class="mono text-[10px] text-txt-3 hover:text-txt-2 ml-auto transition-colors">toutes mes demandes →</a>
          </div>
          ${enCours.length ? enCours.map(ligneDemande).join('')
            : vide('Aucune demande ouverte', 'Vous pouvez en ouvrir une à tout moment.',
              `<button class="btn btn-key btn-sm" data-act="nouvelle-demande">${icon('plus', 12)} Nouvelle demande</button>`)}
        </section>
      </div>

      <aside class="space-y-5">
        <section class="panel p-5">
          <h2 class="tag mb-3">Votre formule</h2>
          <p class="text-[15px]">${escape(c.plan)}</p>
          <p class="mono text-[11px] text-txt-3 mb-4">${euros(c.prix)} / mois · client depuis ${new Date(c.depuis).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
          <div class="mb-1.5 flex items-baseline gap-2">
            <span class="num text-[23px]">${faits}</span>
            <span class="text-[12px] text-txt-3">/ ${dus} publications ce mois</span>
          </div>
          ${jauge(faits, dus, faits >= dus ? 'live' : 'work')}
          <div class="mt-4 space-y-2.5">
            ${Object.keys(RESEAUX).filter((r) => c.cadence[r]).map((r) => `
              <div class="flex items-center gap-2.5">
                <span class="text-txt-3">${icon(RESEAUX[r].icon, 14)}</span>
                <span class="text-[12px] w-[68px]">${RESEAUX[r].label}</span>
                <span class="flex-1">${jauge(c.consomme[r], c.cadence[r], c.consomme[r] >= c.cadence[r] ? 'live' : 'work')}</span>
                <span class="mono text-[10.5px] text-txt-3 w-10 text-right">${c.consomme[r]}/${c.cadence[r]}</span>
              </div>`).join('')}
          </div>
          <ul class="mt-4 pt-4 border-t border-rule space-y-1.5">
            ${c.engagements.map((e) => `<li class="flex gap-2 text-[12px] text-txt-2">
              <span style="color:var(--st-live)" class="shrink-0">${icon('check', 12)}</span>${escape(e)}</li>`).join('')}
          </ul>
        </section>

        <section class="panel p-5">
          <h2 class="tag mb-3">Votre audience</h2>
          ${Object.keys(RESEAUX).filter((r) => c.audience[r]).map((r) => `
            <div class="flex items-center gap-3 py-2 border-b border-rule last:border-0">
              <span class="text-txt-3">${icon(RESEAUX[r].icon, 15)}</span>
              <span class="text-[12.5px]">${RESEAUX[r].label}</span>
              <span class="num text-[13px] ml-auto">${nombre(c.audience[r])}</span>
              <span class="mono text-[10.5px] w-12 text-right" style="color:${c.croissance[r] >= 0 ? 'var(--st-live)' : 'var(--st-late)'}">
                ${c.croissance[r] >= 0 ? '+' : ''}${c.croissance[r]} %</span>
            </div>`).join('')}
          <a href="#/performance" class="btn btn-sm w-full justify-center mt-4">${icon('analytique', 12)} Voir la performance</a>
        </section>

        <section class="panel p-5">
          <h2 class="tag mb-2">Votre interlocuteur</h2>
          <div class="flex items-center gap-3">
            <span class="mono h-10 w-10 rounded-full flex items-center justify-center text-[13px]"
              style="background:${REFERENT.couleur}22;color:${REFERENT.couleur};border:1px solid ${REFERENT.couleur}55">${REFERENT.initiales}</span>
            <div>
              <p class="text-[13px]">${escape(REFERENT.nom)}</p>
              <p class="tag">${escape(REFERENT.role)}</p>
            </div>
          </div>
          <button class="btn btn-sm w-full justify-center mt-4" data-act="ecrire">${icon('message', 12)} Écrire à l’équipe</button>
        </section>
      </aside>
    </div>
  </div>`;
}

function carteDevis(c) {
  return `
  <article class="panel rail rail-wait p-4">
    <div class="flex items-center gap-2 mb-2">
      <span class="chip"><i class="pip pip-wait"></i>Devis à valider</span>
      <span class="mono text-[10px] text-txt-3 ml-auto">${c.id}</span>
    </div>
    <p class="text-[14px] mb-1">${escape(c.titre)}</p>
    <p class="text-[12px] text-txt-3 leading-relaxed line-clamp-2 mb-3">${escape(c.brief)}</p>
    <div class="flex items-baseline gap-2 mb-3.5">
      <span class="num text-[21px]">${euros(c.devis.montant)}</span>
      <span class="mono text-[10.5px] text-txt-3">envoyé ${relatif(c.devis.envoye)}</span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button class="btn btn-sm" data-act="devis-refus" data-id="${c.id}">Refuser</button>
      <button class="btn btn-sm" data-act="ouvrir-demande" data-id="${c.id}">${icon('oeil', 12)} Détail</button>
      <button class="btn btn-sm btn-key basis-full sm:basis-auto sm:flex-1 justify-center" data-act="devis-ok" data-id="${c.id}">${icon('check', 12)} Accepter le devis</button>
    </div>
  </article>`;
}

function carteCrea(c) {
  return `
  <article class="panel rail rail-plan p-4">
    <div class="flex items-center gap-2 mb-2">
      <span class="chip"><i class="pip pip-plan"></i>Création à valider</span>
      <span class="mono text-[10px] text-txt-3 ml-auto">${c.id}</span>
    </div>
    <p class="text-[14px] mb-1">${escape(c.titre)}</p>
    <p class="text-[12px] text-txt-3 leading-relaxed line-clamp-2 mb-3">${escape(c.brief)}</p>
    <div class="flex items-center gap-2 mb-3.5 text-txt-3">
      ${c.reseaux.map((r) => reseauGlyphe(r, 14)).join('')}
      <span class="mono text-[10.5px]">diffusion prévue ${c.diffusion ? dateCourte(c.diffusion) : '—'}</span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button class="btn btn-sm" data-act="crea-modif" data-id="${c.id}">${icon('message', 12)} Demander une modif</button>
      <button class="btn btn-sm btn-key basis-full sm:basis-auto sm:flex-1 justify-center" data-act="crea-ok" data-id="${c.id}">${icon('check', 12)} Valider</button>
    </div>
  </article>`;
}

function ligneDemande(c) {
  const reb = rebours(c.echeance);
  const faites = c.taches.filter((t) => t.etat === 'fait').length;
  return `
  <button class="rdo w-full text-left rail rail-${ETATS[c.etat].rail} px-3.5 py-2 hover:bg-white/[.03]
      grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_156px_112px_84px]"
      data-act="ouvrir-demande" data-id="${c.id}" style="min-height:52px">
    <div class="min-w-0 pr-3">
      <span class="block text-[12.5px] truncate">${escape(c.titre)}</span>
      <span class="tag block">${c.id} · ouvert ${relatif(c.ouvert)}<span class="sm:hidden"> · reste ${reb.passe ? '0' : reb.texte}</span></span>
      ${c.incident ? `<span class="block text-[11.5px] leading-snug mt-1" style="color:#ffb3c1">${escape(c.incident)}</span>` : ''}
    </div>
    <div class="justify-self-end sm:justify-self-start">${etatChip(c.etat, { taille: 'xs', voix: 'client' })}</div>
    <div class="pr-4 hidden sm:block">
      ${c.taches.length ? `<p class="mono text-[9.5px] text-txt-3 mb-1">${faites}/${c.taches.length} étapes</p>${jauge(faites, c.taches.length, 'work')}`
        : `<p class="mono text-[10px] text-txt-3">en cadrage</p>`}
    </div>
    <div class="mono text-[10.5px] text-right hidden sm:block whitespace-nowrap" style="color:${reb.passe ? 'var(--st-wait)' : 'var(--txt-3)'}">${reb.passe ? 'échue' : reb.texte}</div>
  </button>`;
}

/* ---------------- Mes demandes ---------------- */

function vueDemandes() {
  const toutes = mesChantiers();
  const ouvertes = toutes.filter((c) => c.etat !== 'en_ligne');
  const closes = toutes.filter((c) => c.etat === 'en_ligne');

  return `
  <div class="max-w-[1240px] mx-auto px-4 lg:px-6 py-6">
    <div class="flex flex-wrap items-end gap-3 mb-5">
      <h1 class="text-[23px] font-normal">Mes demandes</h1>
      <p class="text-[13px] text-txt-3 mb-1">${ouvertes.length} en cours · ${closes.length} livrée${closes.length > 1 ? 's' : ''}</p>
      <button class="btn btn-key btn-sm ml-auto" data-act="nouvelle-demande">${icon('plus', 12)} Nouvelle demande</button>
    </div>

    <section class="panel overflow-hidden mb-5">
      <div class="px-5 py-2.5 border-b border-rule"><h2 class="tag">En cours</h2></div>
      ${ouvertes.length ? ouvertes.map(ligneDemande).join('')
        : vide('Aucune demande en cours', 'Tout est livré. Vous pouvez ouvrir une nouvelle demande quand vous voulez.')}
    </section>

    ${closes.length ? `
    <section class="panel overflow-hidden">
      <div class="px-5 py-2.5 border-b border-rule"><h2 class="tag">Livrées</h2></div>
      ${closes.map(ligneDemande).join('')}
    </section>` : ''}
  </div>`;
}

function ouvrirDemande(id) {
  const c = CHANTIERS.find((x) => x.id === id);
  if (!c) return;
  const etapes = ['brief', 'devis', 'attente', 'production', 'relecture', 'validation', 'pret', 'en_ligne'];
  const rang = etapes.indexOf(c.etat);

  tiroir(`
    ${enteteTiroir(c.titre, `${c.id} · demande ouverte le ${dateCourte(c.ouvert)}`,
      `<div class="shrink-0">${etatChip(c.etat, { voix: 'client' })}</div>`)}

    <div class="px-6 py-5 border-b border-rule">
      <p class="tag mb-3">Où en est votre demande</p>
      <ol class="space-y-0">
        ${etapes.map((e, i) => {
          const passe = i < rang, actif = i === rang;
          return `
          <li class="flex items-start gap-3 pb-3 relative">
            ${i < etapes.length - 1 ? `<span class="absolute left-[5px] top-4 bottom-0 w-px" style="background:${passe ? 'var(--st-live)' : 'var(--rule-strong)'}"></span>` : ''}
            <i class="pip pip-${passe ? 'live' : actif ? ETATS[e].pip : 'idle'} ${actif ? 'pip-beat' : ''} mt-1.5 relative"
               style="${passe || actif ? '' : 'opacity:.4'}"></i>
            <span class="text-[12.5px] ${actif ? '' : 'text-txt-3'}">
              ${ETATS[e].client || ETATS[e].long}${actif ? ' <span class="tag ml-1">en ce moment</span>' : ''}
            </span>
          </li>`;
        }).join('')}
      </ol>
    </div>

    <div class="px-6 py-5 border-b border-rule">
      <p class="tag mb-2">Votre brief</p>
      <p class="text-[13px] text-txt-2 leading-relaxed">${escape(c.brief)}</p>
      <div class="flex flex-wrap gap-2 mt-3.5">
        ${c.reseaux.map((r) => `<span class="chip">${icon(RESEAUX[r].icon, 12)}${RESEAUX[r].label}</span>`).join('')}
        <span class="chip">${escape(c.type)}</span>
        <span class="chip">Livraison ${dateCourte(c.echeance)}</span>
      </div>
    </div>

    ${c.incident ? `
    <div class="px-6 py-4 border-b border-rule flex items-start gap-3" style="background:rgba(255,77,109,.07)">
      <span class="shrink-0 mt-0.5" style="color:var(--st-late)">${icon('alerte', 15)}</span>
      <div>
        <p class="text-[12.5px]">Line Up s’en occupe</p>
        <p class="text-[12.5px] text-txt-2 leading-relaxed mt-0.5">${escape(c.incident)}</p>
      </div>
    </div>` : ''}

    ${c.devis.montant ? `
    <div class="px-6 py-5 border-b border-rule">
      <div class="flex items-center gap-3 mb-2">
        <p class="tag">Chiffrage</p>
        <span class="num text-[17px] ml-auto">${euros(c.devis.montant)}</span>
      </div>
      ${c.devis.statut === 'envoye' ? `
        <p class="text-[12.5px] text-txt-3 mb-3">Envoyé ${relatif(c.devis.envoye)} — sans réponse de votre part.</p>
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-sm" data-act="devis-refus" data-id="${c.id}">Refuser</button>
          <button class="btn btn-sm btn-key basis-full sm:basis-auto sm:flex-1 justify-center" data-act="devis-ok" data-id="${c.id}">${icon('check', 12)} Accepter</button>
        </div>`
      : `<p class="text-[12.5px]" style="color:var(--st-live)">Accepté le ${c.devis.reponse ? dateCourte(c.devis.reponse) : ''} — la production est lancée.</p>`}
    </div>` : ''}

    ${c.taches.length ? `
    <div class="border-b border-rule">
      <div class="px-6 py-2.5 border-b border-rule"><p class="tag">Étapes de production</p></div>
      ${c.taches.map((t) => `
        <div class="flex items-center gap-3 px-6 py-2.5 border-b border-rule last:border-0">
          <i class="pip pip-${SOUS_ETATS[t.etat].rail}"></i>
          ${icon(NATURES[t.nature].icon, 14, 'opacity-45 shrink-0')}
          <span class="text-[12.5px] truncate">${escape(NATURES[t.nature].label)}</span>
          <span class="mono text-[10px] text-txt-3 ml-auto">${SOUS_ETATS[t.etat].client}</span>
        </div>`).join('')}
    </div>` : ''}

    <div>
      <div class="px-6 py-2.5 border-b border-rule"><p class="tag">Échanges</p></div>
      <div class="px-6 py-4 space-y-4">
        ${c.fil.length ? c.fil.map((m) => `
          <div class="flex gap-3">
            <span class="mono h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[9px]"
              style="background:${m.cote === 'client' ? 'var(--ink-3)' : 'rgba(0,216,255,.12)'};color:${m.cote === 'client' ? 'var(--txt-2)' : '#00d8ff'}">
              ${escape(m.qui.split(' ').map((x) => x[0]).join(''))}</span>
            <div class="min-w-0">
              <p class="text-[12px]"><span class="text-txt">${escape(m.qui)}</span>
                <span class="tag ml-1.5">${m.cote === 'client' ? 'vous' : 'line up.'} · ${dateCourte(m.quand)} ${heure(m.quand)}</span></p>
              <p class="text-[12.5px] text-txt-2 leading-relaxed mt-1">${escape(m.texte)}</p>
            </div>
          </div>`).join('') : `<p class="text-[12.5px] text-txt-3">Aucun échange pour l’instant.</p>`}
        <div class="flex gap-2 pt-2">
          <input class="field !py-2 !text-[12.5px]" placeholder="Écrire à l’équipe…" data-champ="msg" aria-label="Écrire à l'équipe">
          <button class="btn btn-key shrink-0" data-act="msg-envoi" data-id="${c.id}" aria-label="Envoyer le message">${icon('envoi', 12)}</button>
        </div>
      </div>
    </div>`, { large: true });
}

/* ---------------- Nouvelle demande ---------------- */

const TYPES_DEMANDE = [
  { cle: 'post', label: 'Publication simple', ic: 'image', aide: 'Un visuel et sa légende, pour un événement ou une annonce.' },
  { cle: 'video', label: 'Vidéo', ic: 'film', aide: 'Tournage, montage, ou reprise de vos propres rushes.' },
  { cle: 'affiche', label: 'Affiche / print', ic: 'texte', aide: 'Un support imprimé, décliné en publication si besoin.' },
  { cle: 'serie', label: 'Série éditoriale', ic: 'pipeline', aide: 'Plusieurs publications qui racontent une même histoire.' },
  { cle: 'autre', label: 'Autre besoin', ic: 'message', aide: 'Décrivez-le, on vous rappelle pour cadrer.' },
];

function ouvrirNouvelleDemande() {
  S.nouvelle = { etape: 1, type: '', titre: '', brief: '', urgence: 'normale', reseaux: [], quand: D(14).toISOString().slice(0, 10) };
  rendreNouvelle();
}

function rendreNouvelle() {
  const n = S.nouvelle;
  const corps = n.etape === 1 ? `
    <div class="px-6 py-5">
      <p class="text-[13px] text-txt-2 mb-4">De quoi avez-vous besoin ?</p>
      <div class="space-y-2">
        ${TYPES_DEMANDE.map((t) => `
          <button class="w-full text-left panel p-3.5 flex items-start gap-3 hover:border-white/30 transition-colors ${n.type === t.cle ? 'border-white/35' : ''}"
              data-act="nd-type" data-t="${t.cle}" style="background:${n.type === t.cle ? 'var(--ink-3)' : 'var(--ink-2)'}">
            <span class="mt-0.5 ${n.type === t.cle ? '' : 'opacity-50'}" style="${n.type === t.cle ? 'color:var(--cyan)' : ''}">${icon(t.ic, 18)}</span>
            <span class="min-w-0">
              <span class="block text-[13px]">${t.label}</span>
              <span class="block text-[12px] text-txt-3 leading-snug mt-0.5">${t.aide}</span>
            </span>
            ${n.type === t.cle ? `<span class="ml-auto shrink-0" style="color:var(--st-live)">${icon('check', 16)}</span>` : ''}
          </button>`).join('')}
      </div>
    </div>` : n.etape === 2 ? `
    <div class="px-6 py-5 space-y-4">
      <label class="block"><span class="tag block mb-1.5">En une phrase</span>
        <input class="field" data-nd="titre" value="${escape(n.titre)}" placeholder="Ex. Affiche pour la soirée concert du 21"></label>
      <label class="block"><span class="tag block mb-1.5">Dites-nous tout</span>
        <textarea class="field h-32 resize-none" data-nd="brief"
          placeholder="Le contexte, la date, ce que vous voulez mettre en avant, ce que vous ne voulez surtout pas.">${escape(n.brief)}</textarea></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="block"><span class="tag block mb-1.5">Pour quand</span>
          <input class="field" type="date" data-nd="quand" value="${n.quand}"></label>
        <label class="block"><span class="tag block mb-1.5">Urgence</span>
          <select class="field" data-nd="urgence">
            <option value="normale" ${n.urgence === 'normale' ? 'selected' : ''}>Normale</option>
            <option value="haute" ${n.urgence === 'haute' ? 'selected' : ''}>Ça presse</option>
            <option value="basse" ${n.urgence === 'basse' ? 'selected' : ''}>Quand vous pouvez</option>
          </select></label>
      </div>
      <fieldset><legend class="tag mb-1.5">Où cela doit paraître</legend>
        <div class="flex flex-wrap gap-2">
          ${Object.keys(RESEAUX).filter((r) => moi().cadence[r]).map((r) => `
            <button class="chip !h-8 !px-3 hover:border-white/35 transition-colors ${n.reseaux.includes(r) ? 'border-white/40' : ''}"
              data-act="nd-reseau" data-r="${r}" style="${n.reseaux.includes(r) ? 'background:var(--ink-3);color:var(--txt)' : ''}">
              ${icon(RESEAUX[r].icon, 13)}${RESEAUX[r].label}</button>`).join('')}
        </div>
      </fieldset>
      <div class="panel p-3.5 flex gap-3" style="background:var(--ink-2)">
        <span class="text-txt-3 shrink-0 mt-0.5">${icon('piece', 16)}</span>
        <div>
          <p class="text-[12.5px]">Ajoutez vos fichiers</p>
          <p class="text-[11.5px] text-txt-3 leading-snug mt-0.5">Photos, rushes, logo, documents — tout ce qui aide.</p>
          <button class="btn btn-sm mt-2.5" data-act="nd-fichier">${icon('televerser', 12)} Choisir des fichiers</button>
        </div>
      </div>
    </div>` : `
    <div class="px-6 py-5">
      <p class="tag mb-3">Récapitulatif</p>
      <dl class="space-y-3 mb-5">
        ${[['Type', TYPES_DEMANDE.find((t) => t.cle === n.type)?.label || '—'],
           ['Intitulé', n.titre || '—'],
           ['Pour le', new Date(n.quand).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })],
           ['Urgence', { normale: 'Normale', haute: 'Ça presse', basse: 'Quand vous pouvez' }[n.urgence]],
           ['Réseaux', n.reseaux.length ? n.reseaux.map((r) => RESEAUX[r].label).join(', ') : 'à définir ensemble']]
          .map(([k, v]) => `<div class="flex gap-4 py-2 border-b border-rule">
            <dt class="tag w-24 shrink-0 pt-0.5">${k}</dt>
            <dd class="text-[13px]">${escape(v)}</dd></div>`).join('')}
      </dl>
      <div class="panel p-4" style="background:var(--ink-2)">
        <p class="text-[12.5px] text-txt-2 leading-relaxed">${escape(n.brief || 'Aucun détail complémentaire.')}</p>
      </div>
      <p class="text-[12px] text-txt-3 leading-relaxed mt-4">
        Line Up vous répond sous 24 h ouvrées avec un chiffrage. Rien n’est engagé tant que vous ne l’avez pas accepté.
      </p>
    </div>`;

  const t = tiroir(`
    ${enteteTiroir('Nouvelle demande', `Étape ${n.etape} sur 3`)}
    <div class="px-6 pt-4">
      <div class="flex gap-1.5">
        ${[1, 2, 3].map((i) => `<span class="h-[3px] flex-1 rounded-full" style="background:${i <= n.etape ? 'var(--grad)' : 'rgba(255,255,255,.13)'}"></span>`).join('')}
      </div>
    </div>
    ${corps}
    <div class="sticky bottom-0 flex items-center gap-2 px-6 py-4 border-t border-rule" style="background:var(--ink-1)">
      ${n.etape > 1 ? `<button class="btn" data-act="nd-retour">${icon('chevronGauche', 12)} Retour</button>` : `<button class="btn" data-fermer>Annuler</button>`}
      ${n.etape < 3
        ? `<button class="btn btn-key flex-1 justify-center" data-act="nd-suite" ${n.etape === 1 && !n.type ? 'disabled' : ''}>Continuer ${icon('chevronDroit', 12)}</button>`
        : `<button class="btn btn-key flex-1 justify-center" data-act="nd-envoi">${icon('envoi', 13)} Envoyer la demande</button>`}
    </div>`);

  t.hote.querySelectorAll('[data-nd]').forEach((el) => {
    el.addEventListener('input', () => { S.nouvelle[el.dataset.nd] = el.value; });
    el.addEventListener('change', () => { S.nouvelle[el.dataset.nd] = el.value; });
  });
}

/* ---------------- À valider ---------------- */

function vueValidations() {
  const devis = mesDevis();
  const creas = mesValidations();
  const pubs = mesPubs().filter((p) => p.etat === 'validation' && p.quand > NOW);

  if (!devis.length && !creas.length && !pubs.length) {
    return `<div class="max-w-[1240px] mx-auto px-4 lg:px-6 py-6">
      <h1 class="text-[23px] font-normal mb-5">À valider</h1>
      ${vide('Rien ne vous attend', 'Toutes les propositions de Line Up ont reçu votre réponse. Nous vous préviendrons dès qu’une nouvelle création est prête.')}
    </div>`;
  }

  return `
  <div class="max-w-[1240px] mx-auto px-4 lg:px-6 py-6">
    <div class="flex flex-wrap items-end gap-3 mb-5">
      <h1 class="text-[23px] font-normal">À valider</h1>
      <p class="text-[13px] text-txt-3 mb-1">${devis.length + creas.length + pubs.length} élément(s) en attente de votre réponse</p>
    </div>

    ${devis.length ? `<section class="mb-6">
      <div class="flex items-center gap-2 mb-2.5"><h2 class="tag">Devis</h2><span class="flex-1 h-px" style="background:var(--rule)"></span></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${devis.map(carteDevis).join('')}</div>
    </section>` : ''}

    ${creas.length ? `<section class="mb-6">
      <div class="flex items-center gap-2 mb-2.5"><h2 class="tag">Créations</h2><span class="flex-1 h-px" style="background:var(--rule)"></span></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">${creas.map(carteCrea).join('')}</div>
    </section>` : ''}

    ${pubs.length ? `<section>
      <div class="flex items-center gap-2 mb-2.5"><h2 class="tag">Légendes à relire</h2><span class="flex-1 h-px" style="background:var(--rule)"></span></div>
      <div class="panel overflow-hidden">
        ${pubs.slice(0, 8).map((p) => `
          <div class="rdo rail rail-wait grid-cols-[minmax(0,1fr)_120px_150px] px-3.5" style="min-height:56px">
            <div class="min-w-0 pr-4 flex items-center gap-2.5">
              ${reseauGlyphe(p.reseau, 15)}
              <span class="min-w-0">
                <span class="block text-[12.5px] truncate">${escape(p.legende)}</span>
                <span class="tag">${p.format} · prévu ${dateCourte(p.quand)} à ${heure(p.quand)}</span>
              </span>
            </div>
            <div class="mono text-[10.5px] text-txt-3">${rebours(p.quand).texte}</div>
            <div class="flex items-center justify-end gap-1.5">
              <button class="btn btn-sm !px-2" data-act="pub-modif" data-pub="${p.id}" aria-label="Demander une modification">${icon('message', 12)}</button>
              <button class="btn btn-sm btn-key" data-act="pub-ok" data-pub="${p.id}">${icon('check', 12)} OK</button>
            </div>
          </div>`).join('')}
      </div>
    </section>` : ''}
  </div>`;
}

/* ---------------- Planning ---------------- */

function vuePlanning() {
  const m = S.mois;
  const premier = new Date(m.getFullYear(), m.getMonth(), 1);
  const decalage = (premier.getDay() + 6) % 7;
  const nb = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let j = 1; j <= nb; j++) cases.push(new Date(m.getFullYear(), m.getMonth(), j));
  while (cases.length % 7) cases.push(null);

  return `
  <div class="max-w-[1240px] mx-auto px-4 lg:px-6 py-6">
    <div class="flex flex-wrap items-center gap-2 mb-5">
      <h1 class="text-[23px] font-normal capitalize mr-2">${m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h1>
      <button class="btn btn-sm !px-2" data-act="mois" data-d="-1" aria-label="Mois précédent">${icon('chevronGauche', 13)}</button>
      <button class="btn btn-sm !px-2" data-act="mois" data-d="1" aria-label="Mois suivant">${icon('chevronDroit', 13)}</button>
      <button class="btn btn-sm" data-act="mois" data-d="0">Ce mois-ci</button>
      <p class="text-[12.5px] text-txt-3 ml-auto">${mesPubs().filter((p) => p.quand.getMonth() === m.getMonth() && p.quand.getFullYear() === m.getFullYear()).length} publications ce mois</p>
    </div>

    <div class="panel overflow-hidden">
      <div class="grid grid-cols-7 border-b border-rule" style="background:var(--ink-2)">
        ${['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map((j) => `<div class="tag px-2 py-2">${j}</div>`).join('')}
      </div>
      <div class="grid grid-cols-7 auto-rows-[minmax(104px,1fr)]">
        ${cases.map((d) => {
          if (!d) return `<div class="border-r border-b border-rule" style="background:var(--ink-2)"></div>`;
          const items = mesPubs().filter((p) => memeJour(p.quand, d));
          const auj = memeJour(d, NOW);
          return `
          <div class="border-r border-b border-rule p-1.5 relative">
            ${auj ? `<span class="absolute inset-x-0 top-0 h-[2px]" style="background:var(--grad)"></span>` : ''}
            <span class="mono text-[10.5px] ${auj ? 'text-txt' : 'text-txt-3'}">${p2(d.getDate())}</span>
            <div class="mt-1 space-y-[3px]">
              ${items.slice(0, 3).map((p) => `
                <button class="w-full flex items-center gap-1.5 rounded-[2px] px-1 py-[3px] text-left hover:bg-white/[.09] transition-colors"
                    style="background:rgba(255,255,255,.06)" data-act="pub" data-pub="${p.id}">
                  <i class="pip pip-${ETATS[p.etat].pip}" style="width:5px;height:5px;box-shadow:none"></i>
                  <span class="shrink-0 opacity-60">${icon(RESEAUX[p.reseau].icon, 11)}</span>
                  <span class="mono text-[9.5px] text-txt-2 truncate">${heure(p.quand)}</span>
                </button>`).join('')}
              ${items.length > 3 ? `<p class="mono text-[9.5px] text-txt-3 pl-1">+${items.length - 3}</p>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
      ${['pret', 'validation', 'production', 'en_ligne', 'echec'].map((e) => `
        <span class="flex items-center gap-1.5 tag" style="letter-spacing:.08em">
          <i class="pip pip-${ETATS[e].pip}"></i><span style="color:var(--txt-2)">${ETATS[e].client || ETATS[e].long}</span></span>`).join('')}
    </div>
  </div>`;
}

/* ---------------- Performance ---------------- */

function vuePerformance() {
  const c = moi();
  const passees = mesPubs().filter((p) => p.etat === 'en_ligne' && p.portee);
  const portee = passees.reduce((s, p) => s + p.portee, 0);
  const inter = passees.reduce((s, p) => s + p.interactions, 0);
  const parReseau = Object.keys(RESEAUX).filter((r) => c.cadence[r]).map((r) => ({
    r, n: passees.filter((p) => p.reseau === r).length,
    portee: passees.filter((p) => p.reseau === r).reduce((s, p) => s + p.portee, 0),
  }));
  const meilleures = [...passees].sort((a, b) => b.interactions - a.interactions).slice(0, 5);
  const eng = (SERIE_ENGAGEMENT[c.id] || SERIE_ENGAGEMENT.papiours);

  return `
  <div class="max-w-[1240px] mx-auto px-4 lg:px-6 py-6">
    <div class="flex flex-wrap items-end gap-3 mb-5">
      <h1 class="text-[23px] font-normal">Performance</h1>
      <p class="text-[13px] text-txt-3 mb-1">${passees.length} publications diffusées sur les 4 dernières semaines</p>
    </div>

    <div class="mb-5">
      ${releve(
        `Sur les quatre dernières semaines, vos ${passees.length} publications ont été vues
         <strong class="font-normal text-txt">${nombre(portee)}</strong> fois et ont déclenché
         ${nombre(inter)} interactions, soit un engagement de ${eng.at(-1)} %.`,
        [
          { label: 'Portée cumulée', valeur: nombre(portee) },
          { label: 'Interactions', valeur: nombre(inter) },
          { label: 'Engagement', valeur: eng.at(-1) + ' %', ton: 'var(--st-live)' },
          { label: 'Audience totale', valeur: nombre(Object.values(c.audience).reduce((a, b) => a + b, 0)) },
        ])}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <section class="panel p-5">
        <h2 class="text-[14px] font-normal">Taux d’engagement</h2>
        <p class="tag mb-4">en %, 8 dernières semaines</p>
        <div class="h-[230px]"><canvas id="g-eng-client" aria-label="Taux d'engagement hebdomadaire"></canvas></div>
        ${tableDonnees(['Semaine', 'Engagement'], SERIE_ENGAGEMENT.labels.map((l, i) => [l, eng[i] + ' %']), 'de l’engagement')}
      </section>

      <section class="panel p-5">
        <h2 class="text-[14px] font-normal">Portée par réseau</h2>
        <p class="tag mb-4">cumul des 4 dernières semaines</p>
        <div class="h-[230px]"><canvas id="g-reseaux-client" aria-label="Portée cumulée par réseau"></canvas></div>
        <div class="mt-4">${legende(parReseau.map((x) => ({ label: RESEAUX[x.r].label, couleur: RESEAUX[x.r].serie, valeur: nombre(x.portee) })))}</div>
      </section>

      <section class="panel overflow-hidden lg:col-span-2">
        <div class="px-5 py-2.5 border-b border-rule"><h2 class="tag">Vos publications les plus suivies</h2></div>
        ${meilleures.map((p) => `
          <div class="rdo grid-cols-[minmax(0,1fr)_110px_110px_110px] px-3.5" style="min-height:50px">
            <div class="min-w-0 pr-4 flex items-center gap-2.5">
              ${reseauGlyphe(p.reseau, 15)}
              <span class="text-[12.5px] truncate">${escape(p.legende)}</span>
            </div>
            <div class="mono text-[11px] text-txt-3">${dateCourte(p.quand)}</div>
            <div class="mono text-[11.5px] text-right">${nombre(p.portee)} <span class="text-txt-3">vues</span></div>
            <div class="mono text-[11.5px] text-right">${nombre(p.interactions)} <span class="text-txt-3">inter.</span></div>
          </div>`).join('')}
      </section>
    </div>
  </div>`;
}

function tracerPerformance() {
  const c = moi();
  const serie = SERIE_ENGAGEMENT[c.id] || SERIE_ENGAGEMENT.papiours;
  const el = document.getElementById('g-eng-client');
  if (el) {
    const g = el.getContext('2d');
    tracer('g-eng-client', {
      type: 'line',
      data: { labels: SERIE_ENGAGEMENT.labels, datasets: [{ label: 'Engagement', data: serie, borderColor: SERIE[0], backgroundColor: remplissage(g, SERIE[0], 230), borderWidth: 2, fill: true, tension: 0.32, pointRadius: 0, pointHoverRadius: 5 }] },
      options: {
        interaction: { mode: 'index', intersect: false },
        scales: { x: axeX(), y: axeY({ ticks: { callback: (v) => v + ' %', color: '#7e88a6', padding: 8, maxTicksLimit: 5 } }) },
      },
    });
  }

  const passees = mesPubs().filter((p) => p.etat === 'en_ligne' && p.portee);
  const reseaux = Object.keys(RESEAUX).filter((r) => c.cadence[r]);
  tracer('g-reseaux-client', {
    type: 'bar',
    data: {
      labels: reseaux.map((r) => RESEAUX[r].label),
      datasets: [{
        data: reseaux.map((r) => passees.filter((p) => p.reseau === r).reduce((s, p) => s + p.portee, 0)),
        backgroundColor: reseaux.map((r) => RESEAUX[r].serie),
        borderRadius: 3, borderSkipped: false, barThickness: 26,
      }],
    },
    options: {
      scales: { x: axeX(), y: axeY({ ticks: { callback: (v) => (v >= 1000 ? v / 1000 + ' k' : v), color: '#7e88a6', padding: 8, maxTicksLimit: 5 } }) },
      plugins: { tooltip: { callbacks: { label: (x) => nombre(x.parsed.y) + ' vues' } } },
    },
  });
}

/* ---------------- Ma marque ---------------- */

function vueMarque() {
  const c = moi();
  const reals = REALISATIONS[c.id] || [];
  return `
  <div class="max-w-[1240px] mx-auto px-4 lg:px-6 py-6">
    <div class="flex flex-wrap items-start gap-5 mb-6">
      <img src="${c.logo}" alt="Logo ${escape(c.nom)}" class="h-[84px] w-[84px] object-contain rounded-[3px] p-2.5 shrink-0" style="background:${c.logoFond}">
      <div class="min-w-0 flex-1">
        <h1 class="text-[23px] font-normal leading-tight">${escape(c.nom)}</h1>
        <p class="text-[13px] text-txt-2 mt-1">${escape(c.baseline)}</p>
        <p class="tag mt-2">Dossier de marque tenu à jour par Line Up</p>
      </div>
      <button class="btn btn-sm" data-act="telecharger-charte">${icon('telecharger', 12)} Télécharger la charte</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5">
      <div class="space-y-5 min-w-0">
        <section class="panel p-5">
          <h2 class="tag mb-3">Couleurs</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${c.charte.couleurs.map((k) => `
              <button class="text-left group" data-act="copier" data-valeur="${k.hex}" title="Copier ${k.hex}">
                <span class="block h-20 rounded-[3px] mb-2 transition-transform group-hover:scale-[1.02]"
                  style="background:${k.hex};border:1px solid rgba(255,255,255,.2)"></span>
                <span class="block text-[12.5px]">${escape(k.nom)}</span>
                <span class="mono block text-[10.5px] text-txt-3">${k.hex}</span>
              </button>`).join('')}
          </div>
        </section>

        <section class="panel p-5">
          <h2 class="tag mb-3">Typographies</h2>
          ${c.charte.typos.map((t) => `
            <div class="flex flex-wrap items-baseline gap-3 py-3 border-b border-rule last:border-0">
              <span class="mono text-[10px] text-txt-3 w-14 shrink-0">${escape(t.usage)}</span>
              <span class="text-[19px]">${escape(t.nom)}</span>
              <span class="text-[12px] text-txt-3 ml-auto">${escape(t.detail)}</span>
            </div>`).join('')}
        </section>

        <section class="panel p-5">
          <h2 class="tag mb-3">Vos réalisations</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${reals.map((r) => `
              <figure>
                ${apercuCrea({ fond: r.fond, accent: r.accent, marque: c.nom.toUpperCase(), titre: r.titre, format: RESEAUX[r.reseau].label })}
                <figcaption class="mt-2 flex items-center gap-1.5 text-txt-3">
                  ${reseauGlyphe(r.reseau, 12)}<span class="mono text-[9.5px]">${dateCourte(r.date)} · ${nombre(r.portee)} vues</span>
                </figcaption>
              </figure>`).join('')}
          </div>
          <p class="text-[11.5px] text-txt-3 mt-3">Aperçus reconstitués depuis votre charte — les fichiers d’origine sont téléchargeables un par un.</p>
        </section>
      </div>

      <aside class="space-y-5">
        <section class="panel p-5">
          <h2 class="tag mb-2">Ton de voix</h2>
          <p class="text-[13px] text-txt-2 leading-relaxed">${escape(c.charte.ton)}</p>
        </section>
        <section class="panel p-5">
          <h2 class="tag mb-2.5">Ce qu’on ne fait jamais</h2>
          <ul class="space-y-2">
            ${c.charte.interdits.map((i) => `<li class="flex gap-2 text-[12.5px] text-txt-2">
              <span style="color:var(--st-late)" class="shrink-0">${icon('croix', 13)}</span>${escape(i)}</li>`).join('')}
          </ul>
        </section>
        <section class="panel p-5">
          <h2 class="tag mb-2.5">Mots-dièse</h2>
          <div class="flex flex-wrap gap-1.5">
            ${c.charte.hashtags.map((h) => `<button class="chip hover:border-white/35 transition-colors" data-act="copier" data-valeur="${escape(h)}">${escape(h)}</button>`).join('')}
          </div>
        </section>
        <section class="panel p-5">
          <h2 class="tag mb-2.5">Fichiers logo</h2>
          ${['Logo quadri (PNG)', 'Logo monochrome (SVG)', 'Favicon 512 px', 'Déclinaisons réseaux sociaux'].map((f) => `
            <div class="flex items-center gap-2.5 py-2 border-b border-rule last:border-0">
              <span class="text-txt-3">${icon('image', 14)}</span>
              <span class="text-[12.5px] truncate">${escape(f)}</span>
              <button class="btn btn-sm !px-2 ml-auto" data-act="fichier" aria-label="Télécharger ${escape(f)}">${icon('telecharger', 12)}</button>
            </div>`).join('')}
        </section>
      </aside>
    </div>
  </div>`;
}

/* ---------------- Factures ---------------- */

function vueFactures() {
  const f = mesFactures();
  const c = moi();
  const plan = PLANS.find((p) => p.nom === c.plan);
  return `
  <div class="max-w-[1000px] mx-auto px-4 lg:px-6 py-6">
    <h1 class="text-[23px] font-normal mb-5">Abonnement & factures</h1>

    <section class="panel p-5 mb-5">
      <div class="flex flex-wrap items-start gap-5">
        <div class="min-w-0 flex-1">
          <p class="tag mb-1">Formule en cours</p>
          <p class="text-[19px]">${escape(c.plan)}</p>
          <p class="mono text-[12px] text-txt-3 mt-0.5">${euros(c.prix)} par mois, sans engagement au-delà du trimestre</p>
          <ul class="mt-4 space-y-1.5">
            ${plan.inclus.map((i) => `<li class="flex gap-2 text-[12.5px] text-txt-2">
              <span style="color:var(--st-live)" class="shrink-0">${icon('check', 12)}</span>${escape(i)}</li>`).join('')}
          </ul>
        </div>
        <div class="shrink-0 flex flex-col gap-2">
          <button class="btn btn-sm" data-act="changer-formule">${icon('rafraichir', 12)} Changer de formule</button>
          <button class="btn btn-sm" data-act="ecrire">${icon('message', 12)} Poser une question</button>
        </div>
      </div>
    </section>

    <section class="panel overflow-hidden">
      <div class="px-5 py-2.5 border-b border-rule"><h2 class="tag">Historique</h2></div>
      ${f.length ? f.map((x) => {
        const ton = { payee: 'live', envoyee: 'wait', retard: 'late' }[x.etat] || 'idle';
        return `
        <div class="rdo rail rail-${ton} grid-cols-[minmax(0,1fr)_110px_110px_90px] px-3.5" style="min-height:52px">
          <div class="min-w-0 pr-4">
            <span class="block text-[12.5px] truncate">${escape(x.objet)}</span>
            <span class="mono block text-[10px] text-txt-3">${x.id} · émise le ${dateCourte(x.emise)}</span>
          </div>
          <div><span class="chip"><i class="pip pip-${ton}"></i>${{ payee: 'Payée', envoyee: 'À régler', retard: 'En retard' }[x.etat]}</span></div>
          <div class="mono text-[12.5px] text-right">${euros(x.montant)}</div>
          <div class="flex justify-end">
            <button class="btn btn-sm !px-2" data-act="fichier" aria-label="Télécharger la facture ${x.id}">${icon('telecharger', 12)}</button>
          </div>
        </div>`;
      }).join('') : vide('Aucune facture', 'Rien n’a encore été facturé sur votre compte.')}
    </section>
  </div>`;
}

/* ---------------- Actions ---------------- */

function action(acte, el) {
  const id = el.dataset.id;
  const c = id ? CHANTIERS.find((x) => x.id === id) : null;
  switch (acte) {
    case 'nouvelle-demande': ouvrirNouvelleDemande(); break;
    case 'ouvrir-demande': ouvrirDemande(id); break;
    case 'devis-ok':
      c.devis.statut = 'accepte'; c.devis.reponse = new Date(); c.etat = 'production';
      c.fil.push({ qui: moi().contacts[0].nom, cote: 'client', quand: new Date(), texte: 'Devis accepté depuis l’espace client.' });
      fermerTiroir(); signal('Devis accepté — Line Up est prévenue', 'live'); rendre();
      break;
    case 'devis-refus':
      c.devis.statut = 'refuse'; c.etat = 'refuse';
      fermerTiroir(); signal('Devis refusé — l’équipe vous rappellera', 'late'); rendre();
      break;
    case 'crea-ok':
      c.etat = 'pret';
      signal('Création validée — elle part à la programmation', 'live'); rendre();
      break;
    case 'crea-modif': demanderModif(c); break;
    case 'pub-ok': {
      const p = PUBLICATIONS.find((x) => x.id === el.dataset.pub);
      p.etat = 'pret'; signal('Légende validée', 'live'); rendre();
      break;
    }
    case 'pub-modif': case 'pub': {
      const p = PUBLICATIONS.find((x) => x.id === el.dataset.pub);
      ouvrirPublication(p);
      break;
    }
    case 'pub-modif-fil': {
      const p = PUBLICATIONS.find((x) => x.id === el.dataset.pub);
      p.etat = 'production';
      fermerTiroir();
      signal('Modification demandée sur la légende', 'wait');
      rendre();
      break;
    }
    case 'mois': {
      const d = +el.dataset.d;
      S.mois = d === 0 ? new Date(NOW.getFullYear(), NOW.getMonth(), 1) : new Date(S.mois.getFullYear(), S.mois.getMonth() + d, 1);
      rendre();
      break;
    }
    case 'nd-type': S.nouvelle.type = el.dataset.t; rendreNouvelle(); break;
    case 'nd-reseau': {
      const r = el.dataset.r;
      const i = S.nouvelle.reseaux.indexOf(r);
      if (i < 0) S.nouvelle.reseaux.push(r); else S.nouvelle.reseaux.splice(i, 1);
      rendreNouvelle();
      break;
    }
    case 'nd-suite': S.nouvelle.etape++; rendreNouvelle(); break;
    case 'nd-retour': S.nouvelle.etape--; rendreNouvelle(); break;
    case 'nd-fichier': signal('Sélecteur de fichiers — simulation', 'plan'); break;
    case 'nd-envoi': envoyerDemande(); break;
    case 'msg-envoi': {
      const champ = document.querySelector('[data-champ="msg"]');
      if (champ && champ.value.trim()) {
        c.fil.push({ qui: moi().contacts[0].nom, cote: 'client', quand: new Date(), texte: champ.value.trim() });
        fermerTiroir(); ouvrirDemande(id); signal('Message envoyé à Line Up', 'live');
      }
      break;
    }
    case 'copier':
      navigator.clipboard?.writeText(el.dataset.valeur);
      signal(`${el.dataset.valeur} copié`, 'plan');
      break;
    case 'ecrire': signal('Messagerie — non implémentée dans la maquette', 'plan'); break;
    case 'aide': ouvrirAide(); break;
    case 'fichier': case 'telecharger-charte': signal('Téléchargement simulé', 'plan'); break;
    case 'changer-formule': ouvrirFormules(); break;
    default: break;
  }
}

function demanderModif(c) {
  tiroir(`
    ${enteteTiroir('Demander une modification', c.titre)}
    <div class="px-6 py-5">
      <label class="block mb-4">
        <span class="tag block mb-1.5">Ce qui ne va pas</span>
        <textarea class="field h-32 resize-none" data-champ="modif"
          placeholder="Soyez précis : « le logo est trop petit », « la date est fausse », « le ton est trop familier »."></textarea>
      </label>
      <p class="text-[12px] text-txt-3 leading-relaxed mb-5">
        Votre formule comprend deux allers-retours de validation. Celui-ci sera le premier sur cette création.
      </p>
      <div class="flex gap-2">
        <button class="btn" data-fermer>Annuler</button>
        <button class="btn btn-key flex-1 justify-center" data-act="modif-envoi" data-id="${c.id}">${icon('envoi', 13)} Envoyer la demande</button>
      </div>
    </div>`);

  document.querySelector('[data-act="modif-envoi"]').addEventListener('click', () => {
    const t = document.querySelector('[data-champ="modif"]').value.trim();
    c.etat = 'production';
    c.fil.push({ qui: moi().contacts[0].nom, cote: 'client', quand: new Date(), texte: t || 'Demande de modification.' });
    fermerTiroir();
    signal('Modification demandée — l’équipe reprend la main', 'wait');
    rendre();
  });
}

function ouvrirPublication(p) {
  if (!p) return;
  tiroir(`
    ${enteteTiroir('Publication programmée', `${RESEAUX[p.reseau].label} · ${dateLongue(p.quand)} à ${heure(p.quand)}`,
      `<div class="shrink-0">${etatChip(p.etat, { voix: 'client' })}</div>`)}
    <div class="px-6 py-5 border-b border-rule">
      <p class="tag mb-2">Légende</p>
      <p class="text-[13px] leading-relaxed">${escape(p.legende)}</p>
      <div class="flex flex-wrap gap-2 mt-4">
        <span class="chip">${icon(RESEAUX[p.reseau].icon, 12)}${RESEAUX[p.reseau].label}</span>
        <span class="chip">${escape(p.format)}</span>
        <span class="chip">${p.etat === 'en_ligne' ? 'diffusée'
          : rebours(p.quand).passe ? 'pas encore partie' : 'dans ' + rebours(p.quand).texte}</span>
      </div>
    </div>
    ${p.portee ? `
    <div class="px-6 py-5 border-b border-rule">
      <p class="tag mb-3">Résultats</p>
      <div class="flex gap-8">
        <div><p class="num text-[21px]">${nombre(p.portee)}</p><p class="tag">vues</p></div>
        <div><p class="num text-[21px]">${nombre(p.interactions)}</p><p class="tag">interactions</p></div>
        <div><p class="num text-[21px]">${(p.interactions / p.portee * 100).toFixed(1)} %</p><p class="tag">engagement</p></div>
      </div>
    </div>` : ''}
    ${p.etat === 'validation' ? `
    <div class="px-6 py-5 flex flex-wrap gap-2">
      <button class="btn" data-act="pub-modif-fil" data-pub="${p.id}">${icon('message', 12)} Demander une modif</button>
      <button class="btn btn-key flex-1 justify-center" data-act="pub-ok" data-pub="${p.id}">${icon('check', 13)} Valider la légende</button>
    </div>` : ''}`);
}

function envoyerDemande() {
  const n = S.nouvelle;
  const c = moi();
  const num = 'LU-' + (2460 + CHANTIERS.length);
  CHANTIERS.unshift({
    id: num,
    slug: `${c.nom.toUpperCase().replace(/[^A-Z]/g, '')}_${String(n.titre || 'DEMANDE').toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 22)}`,
    titre: n.titre || TYPES_DEMANDE.find((t) => t.cle === n.type).label,
    clientId: c.id,
    type: TYPES_DEMANDE.find((t) => t.cle === n.type).label,
    etat: 'brief', priorite: n.urgence, ownerId: 'am',
    ouvert: new Date(), echeance: new Date(n.quand + 'T18:00'), diffusion: null,
    reseaux: n.reseaux.length ? n.reseaux : ['instagram'],
    devis: { montant: 0, statut: 'a_chiffrer', envoye: null, reponse: null },
    brief: n.brief || '—', tempsVendu: 0, tempsPasse: 0, taches: [], fichiers: [],
    fil: [{ qui: c.contacts[0].nom, cote: 'client', quand: new Date(), texte: n.brief || 'Demande ouverte depuis l’espace client.' }],
  });
  S.nouvelle = null;
  fermerTiroir();
  signal('Demande envoyée — réponse sous 24 h ouvrées', 'live');
  naviguer('#/demandes');
  rendre();
}

function ouvrirFormules() {
  const c = moi();
  tiroir(`
    ${enteteTiroir('Changer de formule', 'Le changement prend effet au mois suivant')}
    <div class="px-6 py-5 space-y-3">
      ${PLANS.map((p) => `
        <article class="panel p-4 ${p.nom === c.plan ? 'border-white/35' : ''}" style="background:${p.nom === c.plan ? 'var(--ink-3)' : 'var(--ink-2)'}">
          <div class="flex items-baseline gap-2 mb-2">
            <p class="text-[15px]">${escape(p.nom)}</p>
            ${p.nom === c.plan ? `<span class="chip"><i class="pip pip-live"></i>Formule actuelle</span>` : ''}
            <span class="num text-[15px] ml-auto">${euros(p.prix)}<span class="text-[11px] text-txt-3">/mois</span></span>
          </div>
          <ul class="space-y-1.5 mb-3">
            ${p.inclus.map((i) => `<li class="flex gap-2 text-[12.5px] text-txt-2">
              <span style="color:var(--st-live)" class="shrink-0">${icon('check', 12)}</span>${escape(i)}</li>`).join('')}
          </ul>
          ${p.nom !== c.plan ? `<button class="btn btn-sm w-full justify-center" data-act="ecrire">Demander ce changement</button>` : ''}
        </article>`).join('')}
    </div>`);
}

function ouvrirAide() {
  tiroir(`
    ${enteteTiroir('Comment ça marche', 'Le parcours d’une demande, de bout en bout')}
    <div class="px-6 py-5">
      <ol class="space-y-4">
        ${[['Vous ouvrez une demande', 'Décrivez ce dont vous avez besoin, joignez ce que vous avez. Rien n’est engagé.'],
           ['Line Up chiffre', 'Vous recevez un devis sous 24 h ouvrées. Vous acceptez ou vous refusez, ici même.'],
           ['On produit', 'Tournage, montage, direction artistique : vous suivez l’avancement étape par étape.'],
           ['Vous validez', 'La création vous est soumise. Vous validez, ou vous demandez une modification en une phrase.'],
           ['Ça part tout seul', 'Une fois validée, la publication est programmée et poussée automatiquement sur vos réseaux.']]
          .map(([t, d], i) => `
          <li class="flex gap-3.5">
            <span class="mono text-[11px] shrink-0 h-6 w-6 rounded-full flex items-center justify-center"
              style="background:var(--ink-3);color:var(--txt-2)">${i + 1}</span>
            <div>
              <p class="text-[13px]">${t}</p>
              <p class="text-[12.5px] text-txt-3 leading-relaxed mt-0.5">${d}</p>
            </div>
          </li>`).join('')}
      </ol>
    </div>`);
}

/* ---------------- Rendu ---------------- */

const VUES = {
  accueil: vueAccueil, demandes: vueDemandes, validations: vueValidations,
  planning: vuePlanning, performance: vuePerformance, marque: vueMarque, factures: vueFactures,
};

function rendre() {
  detruireGraphiques();
  const hote = document.getElementById('vue');
  hote.innerHTML = (VUES[S.vue] || vueAccueil)();

  document.querySelectorAll('[data-onglet]').forEach((n) => {
    const actif = n.dataset.onglet === S.vue;
    n.setAttribute('aria-current', actif ? 'page' : 'false');
    n.className = `relative flex items-center gap-2 px-3 py-2.5 text-[13px] whitespace-nowrap transition-colors ${actif ? 'text-txt' : 'text-txt-3 hover:text-txt-2'}`;
    n.style.boxShadow = actif ? 'inset 0 -2px 0 0 #00d8ff' : '';
  });
  const badges = { validations: decisions(), demandes: mesChantiers().filter((c) => c.etat !== 'en_ligne').length };
  document.querySelectorAll('[data-badge]').forEach((n) => {
    const v = badges[n.dataset.badge];
    n.textContent = v || '';
    n.className = `mono text-[10px] ${v ? 'opacity-100' : 'opacity-0'}`;
    n.style.color = n.dataset.badge === 'validations' && v ? 'var(--st-wait)' : 'var(--txt-3)';
  });

  if (S.vue === 'performance') tracerPerformance();
}

/* ---------------- Amorçage ---------------- */

coque();

const compteDemande = new URLSearchParams(location.hash.split('?')[1] || '').get('compte');
if (compteDemande && COMPTES.some((c) => c.id === compteDemande)) S.compte = compteDemande;

routeur((vue, args) => {
  S.vue = VUES[vue] ? vue : 'accueil';
  S.args = args;
  rendre();
  scrollTo({ top: 0 });
});

})();
