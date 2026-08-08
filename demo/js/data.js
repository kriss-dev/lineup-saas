(function () {
  'use strict';

/* =========================================================
   Jeu de données de démonstration — line up.
   ⚠ Tout ce fichier est du contenu FICTIF écrit pour la maquette :
   clients, montants, salariés, statistiques et performances n'ont
   aucune valeur réelle. Les seuls éléments authentiques sont les
   logos fournis par Line Up et ses deux clients de démonstration.
   Les dates sont calculées par rapport à l'instant du chargement
   pour que la démo reste vivante quel que soit le jour.
   ========================================================= */

const NOW = new Date();

/** Date décalée de `days` jours, à h:m. */
function D(days, h = 9, m = 0) {
  const t = new Date(NOW);
  t.setDate(t.getDate() + days);
  t.setHours(h, m, 0, 0);
  return t;
}

/* ---------------------------------------------------------
   Registre des états — la couleur ne porte jamais seule le sens :
   chaque état a un libellé court, un libellé long et une forme.
   --------------------------------------------------------- */

/* court : le code d'antenne, pour la régie. client : ce que lit le client,
   qui n'a ni le vocabulaire ni le contexte des codes internes. */
const ETATS = {
  brief:         { court: 'BRIEF',     long: 'Brief reçu',            client: 'Reçue',                  rail: 'idle', pip: 'idle' },
  devis:         { court: 'DEVIS',     long: 'Chiffrage en cours',    client: 'Chiffrage en cours',     rail: 'plan', pip: 'plan' },
  attente:       { court: 'ATT.CLI',   long: 'En attente client',     client: 'À vous de répondre',     rail: 'wait', pip: 'wait' },
  production:    { court: 'PROD',      long: 'En production',         client: 'En production',          rail: 'work', pip: 'work' },
  relecture:     { court: 'RELEC',     long: 'Relecture interne',     client: 'Relecture Line Up',      rail: 'plan', pip: 'plan' },
  validation:    { court: 'VALID.CLI', long: 'Validation client',     client: 'À vous de valider',      rail: 'wait', pip: 'wait' },
  pret:          { court: 'PRÊT',      long: 'Prêt à diffuser',       client: 'Programmée',             rail: 'live', pip: 'live' },
  en_ligne:      { court: 'EN LIGNE',  long: 'Publié',                client: 'Publiée',                rail: 'live', pip: 'live' },
  manque:        { court: 'NON PARTI', long: 'Non parti à l’heure',   client: 'Retardée par Line Up',   rail: 'late', pip: 'late' },
  echec:         { court: 'ÉCHEC',     long: 'Échec de publication',  client: 'Line Up la relance',     rail: 'late', pip: 'late' },
  refuse:        { court: 'REFUSÉ',    long: 'Refusé par le client',  client: 'Refusée',                rail: 'late', pip: 'late' },
};

const PIPELINE = ['brief', 'devis', 'attente', 'production', 'relecture', 'validation', 'pret'];

const SOUS_ETATS = {
  a_faire:  { court: 'À FAIRE',  client: 'À venir',    rail: 'idle', pip: 'idle' },
  en_cours: { court: 'EN COURS', client: 'En cours',   rail: 'work', pip: 'work' },
  bloque:   { court: 'BLOQUÉ',   client: 'En attente', rail: 'late', pip: 'late' },
  fait:     { court: 'FAIT',     client: 'Terminée',   rail: 'live', pip: 'live' },
};

/* Vocabulaire de production réellement employé en agence. */
const NATURES = {
  tournage:   { label: 'Aller tourner',   icon: 'camera' },
  derush:     { label: 'Dérushage',       icon: 'film' },
  montage:    { label: 'Montage',         icon: 'film' },
  da:         { label: 'Direction artistique', icon: 'palette' },
  redac:      { label: 'Rédaction',       icon: 'texte' },
  retouche:   { label: 'Retouche photo',  icon: 'image' },
  export:     { label: 'Export & masters', icon: 'telecharger' },
  program:    { label: 'Programmation',   icon: 'calendrier' },
  impression: { label: 'Fichier imprimeur', icon: 'archive' },
};

/* ---------------------------------------------------------
   Réseaux — couleurs de série assignées dans un ordre fixe et
   validées pour la vision des couleurs. L'identité passe aussi
   par le glyphe : jamais la couleur seule.
   --------------------------------------------------------- */

const RESEAUX = {
  instagram: { label: 'Instagram', icon: 'instagram', serie: '#a83a98' },
  facebook:  { label: 'Facebook',  icon: 'facebook',  serie: '#0f9db4' },
  linkedin:  { label: 'LinkedIn',  icon: 'linkedin',  serie: '#8a6bf0' },
  tiktok:    { label: 'TikTok',    icon: 'tiktok',    serie: '#95610f' },
};

const SERIE = ['#0f9db4', '#a83a98', '#95610f', '#8a6bf0'];
/* Rampe ordinale : une seule teinte, clarté croissante — les états de chantier
   forment une séquence, pas des catégories. 7 pas pour les 7 colonnes. */
const RAMPE = ['#0f4b59', '#126173', '#15788d', '#0f9db4', '#35b8ce', '#63cbdc', '#96dde9'];

/* ---------------------------------------------------------
   Équipe
   --------------------------------------------------------- */

const EQUIPE = [
  { id: 'cr', prenom: 'Camille', nom: 'Roux',     initiales: 'CR', role: 'Direction artistique', couleur: '#8a6bf0', entree: '2021-03-01', contrat: 'CDI', tjm: 480, conges: { acquis: 25, pris: 11, solde: 14 }, rtt: 4, charge: 0.86 },
  { id: 'yl', prenom: 'Yanis',   nom: 'Lemoine',  initiales: 'YL', role: 'Vidéaste — monteur',   couleur: '#0f9db4', entree: '2022-09-12', contrat: 'CDI', tjm: 430, conges: { acquis: 25, pris: 18, solde: 7 },  rtt: 2, charge: 1.04 },
  { id: 'sb', prenom: 'Sarah',   nom: 'Bianchi',  initiales: 'SB', role: 'Community manager',    couleur: '#a83a98', entree: '2023-01-09', contrat: 'CDI', tjm: 360, conges: { acquis: 25, pris: 6,  solde: 19 }, rtt: 5, charge: 0.72 },
  { id: 'tm', prenom: 'Théo',    nom: 'Marchand', initiales: 'TM', role: 'Motion designer',      couleur: '#95610f', entree: '2024-06-03', contrat: 'CDD', tjm: 390, conges: { acquis: 14, pris: 4,  solde: 10 }, rtt: 0, charge: 0.61 },
  { id: 'am', prenom: 'Adrien',  nom: 'M.',       initiales: 'AM', role: 'Chef de projet',       couleur: '#b2455a', entree: '2020-11-16', contrat: 'CDI', tjm: 450, conges: { acquis: 25, pris: 20, solde: 5 },  rtt: 3, charge: 0.93 },
];

const membre = (id) => EQUIPE.find((e) => e.id === id);

/* ---------------------------------------------------------
   Clients
   --------------------------------------------------------- */

const CLIENTS = [
  {
    id: 'papiours',
    nom: 'Papi Ours',
    baseline: 'Brasserie artisanale & bar à manger',
    logo: 'assets/client-papiours.png',
    logoFond: '#FAF7F0',
    secteur: 'Restauration',
    ville: 'Aix-en-Provence',
    depuis: '2024-02-01',
    plan: 'Studio',
    prix: 890,
    cadence: { instagram: 8, facebook: 6, linkedin: 0, tiktok: 4 },
    consomme: { instagram: 6, facebook: 5, linkedin: 0, tiktok: 2 },
    engagements: ['1 tournage / mois', '2 allers-retours de validation inclus', 'Réponse aux commentaires 5j/7'],
    contacts: [
      { nom: 'Marc Deleuze', role: 'Gérant', mail: 'marc@papiours.fr', tel: '06 12 44 09 71', principal: true },
      { nom: 'Léa Deleuze', role: 'Salle & réseaux', mail: 'lea@papiours.fr', tel: '07 88 21 63 40' },
    ],
    charte: {
      couleurs: [
        { nom: 'Noir fût', hex: '#111111' },
        { nom: 'Crème', hex: '#FAF7F0' },
        { nom: 'Miel', hex: '#C8862A' },
        { nom: 'Vert bouteille', hex: '#2F4B3F' },
      ],
      typos: [
        { usage: 'Titres', nom: 'Anton', detail: 'Capitales, interlettrage serré' },
        { usage: 'Textes', nom: 'Karla', detail: 'Regular 400 / Medium 500' },
      ],
      ton: 'Chaleureux, direct, tutoiement. Humour de comptoir assumé, jamais familier sur les sujets service ou horaires.',
      interdits: ['Pas de photo de bière sans mention « L\'abus d\'alcool… »', 'Jamais de fond blanc pur', 'Le logo ne se déforme pas et garde 1 hauteur d\'oreille de marge'],
      hashtags: ['#papiours', '#aixenprovence', '#brasserieartisanale', '#barameanger'],
    },
    audience: { instagram: 6840, facebook: 3120, linkedin: 0, tiktok: 2410 },
    croissance: { instagram: 4.2, facebook: 0.8, linkedin: 0, tiktok: 11.6 },
    tempsPasse: 14.5,
    tempsVendu: 18,
  },
  {
    id: 'kalpy',
    nom: 'Kalpy',
    baseline: 'Build. Automate. Elevate.',
    logo: 'assets/client-kalpy.png',
    logoFond: '#FFFFFF',
    secteur: 'Automatisation & IA — B2B',
    ville: 'Lyon',
    depuis: '2025-04-15',
    plan: 'Signature',
    prix: 1690,
    cadence: { instagram: 6, facebook: 2, linkedin: 12, tiktok: 0 },
    consomme: { instagram: 5, facebook: 2, linkedin: 9, tiktok: 0 },
    engagements: ['2 tournages / mois', 'Ligne éditoriale trimestrielle', 'Reporting mensuel commenté', 'Community management LinkedIn inclus'],
    contacts: [
      { nom: 'Priya Nandan', role: 'Directrice marketing', mail: 'priya@kalpy.io', tel: '06 74 30 55 12', principal: true },
      { nom: 'Bastien Wolff', role: 'CEO', mail: 'bastien@kalpy.io', tel: '06 09 17 82 33' },
    ],
    charte: {
      couleurs: [
        { nom: 'Indigo', hex: '#2B2255' },
        { nom: 'Cyan', hex: '#35C3D8' },
        { nom: 'Rose', hex: '#E9A8C9' },
        { nom: 'Bleu profond', hex: '#3C4CA8' },
      ],
      typos: [
        { usage: 'Titres', nom: 'Poppins', detail: 'SemiBold 600, interlettrage -2%' },
        { usage: 'Textes', nom: 'Inter', detail: 'Regular 400 / Medium 500' },
      ],
      ton: 'Expert et limpide, vouvoiement. On explique un mécanisme, on ne vend pas du rêve. Pas de superlatif sans chiffre derrière.',
      interdits: ['Pas de stock photo « bureau souriant »', 'Le chevron ne se dissocie jamais du mot-symbole', 'Pas de dégradé sur le texte'],
      hashtags: ['#automatisation', '#IA', '#kalpy', '#opsexcellence'],
    },
    audience: { instagram: 1980, facebook: 640, linkedin: 8760, tiktok: 0 },
    croissance: { instagram: 6.9, facebook: -1.2, linkedin: 14.3, tiktok: 0 },
    tempsPasse: 26,
    tempsVendu: 24,
  },
  { id: 'vaganay', nom: 'Maison Vaganay', baseline: 'Traiteur événementiel', secteur: 'Traiteur', ville: 'Salon-de-Provence', depuis: '2025-09-02', plan: 'Essentiel', prix: 490, cadence: { instagram: 6, facebook: 4, linkedin: 0, tiktok: 0 }, consomme: { instagram: 4, facebook: 3, linkedin: 0, tiktok: 0 }, audience: { instagram: 3210, facebook: 2870, linkedin: 0, tiktok: 0 } },
  { id: 'ocres', nom: 'Domaine des Ocres', baseline: 'Vignoble & caveau', secteur: 'Viticulture', ville: 'Roussillon', depuis: '2024-06-20', plan: 'Studio', prix: 890, cadence: { instagram: 8, facebook: 6, linkedin: 2, tiktok: 0 }, consomme: { instagram: 8, facebook: 5, linkedin: 1, tiktok: 0 }, audience: { instagram: 9450, facebook: 5120, linkedin: 780, tiktok: 0 } },
  { id: 'ferrand', nom: 'Cabinet Ferrand', baseline: 'Avocats associés', secteur: 'Juridique', ville: 'Marseille', depuis: '2026-01-12', plan: 'Essentiel', prix: 490, cadence: { instagram: 0, facebook: 2, linkedin: 8, tiktok: 0 }, consomme: { instagram: 0, facebook: 1, linkedin: 6, tiktok: 0 }, audience: { instagram: 0, facebook: 910, linkedin: 4230, tiktok: 0 } },
  { id: 'sudtoit', nom: 'Sud Toitures', baseline: 'Couverture & zinguerie', secteur: 'Bâtiment', ville: 'Vitrolles', depuis: '2025-11-04', plan: 'Essentiel', prix: 490, cadence: { instagram: 4, facebook: 6, linkedin: 0, tiktok: 2 }, consomme: { instagram: 3, facebook: 4, linkedin: 0, tiktok: 1 }, audience: { instagram: 1240, facebook: 2050, linkedin: 0, tiktok: 640 } },
];

const client = (id) => CLIENTS.find((c) => c.id === id);

const PLANS = [
  { nom: 'Essentiel', prix: 490, posts: 10, inclus: ['10 publications / mois', '1 réseau principal', 'Reporting trimestriel'] },
  { nom: 'Studio', prix: 890, posts: 18, inclus: ['18 publications / mois', '1 tournage mensuel', '3 réseaux', 'Reporting mensuel'] },
  { nom: 'Signature', prix: 1690, posts: 20, inclus: ['20 publications + 2 vidéos', '2 tournages mensuels', 'Community management', 'Ligne éditoriale trimestrielle'] },
];

/* ---------------------------------------------------------
   Chantiers — l'objet central. Chaque chantier porte ses
   sous-tâches, son chiffrage et son fil de discussion.
   --------------------------------------------------------- */

const CHANTIERS = [
  {
    id: 'LU-2418', slug: 'PAPIOURS_FETEDESMERES_REEL', titre: 'Reel fête des mères — menu spécial',
    clientId: 'papiours', type: 'Vidéo sociale', etat: 'production', priorite: 'haute', ownerId: 'yl',
    ouvert: D(-9, 10, 15), echeance: D(2, 18, 0), diffusion: D(4, 11, 30),
    reseaux: ['instagram', 'tiktok'], devis: { montant: 1450, statut: 'accepte', envoye: D(-8), reponse: D(-7) },
    brief: "Marc veut mettre en avant le menu spécial fête des mères servi le dimanche. Ambiance salle pleine, plan sur le dressage, la mère et la fille au comptoir. Ton chaleureux, pas de voix off, texte incrusté.",
    tempsVendu: 11, tempsPasse: 7.5,
    taches: [
      { id: 't1', nature: 'tournage', label: 'Aller tourner — service du dimanche', etat: 'fait', ownerId: 'yl', duree: 4, echeance: D(-4, 12, 0) },
      { id: 't2', nature: 'derush', label: 'Dérushage 3 h de rushes', etat: 'fait', ownerId: 'yl', duree: 2, echeance: D(-2, 18, 0) },
      { id: 't3', nature: 'montage', label: 'Montage 30 s vertical', etat: 'en_cours', ownerId: 'yl', duree: 3, echeance: D(1, 12, 0) },
      { id: 't4', nature: 'da', label: 'Habillage titres & sous-titres', etat: 'a_faire', ownerId: 'tm', duree: 1.5, echeance: D(2, 12, 0) },
      { id: 't5', nature: 'program', label: 'Programmation IG + TikTok', etat: 'a_faire', ownerId: 'sb', duree: 0.5, echeance: D(3, 17, 0) },
    ],
    fichiers: [
      { nom: 'rushes_dimanche.zip', poids: '4,2 Go', type: 'film' },
      { nom: 'menu_fetedesmeres.pdf', poids: '380 Ko', type: 'texte' },
    ],
    fil: [
      { qui: 'Marc Deleuze', cote: 'client', quand: D(-9, 10, 15), texte: "On aimerait un reel pour le menu du dimanche. Vous pouvez venir tourner ce dimanche-là ?" },
      { qui: 'Adrien M.', cote: 'agence', quand: D(-8, 9, 5), texte: "Chiffrage envoyé : 1 450 € pour un tournage + un reel 30 s décliné IG et TikTok." },
      { qui: 'Marc Deleuze', cote: 'client', quand: D(-7, 14, 40), texte: "C'est validé, on vous attend dimanche à 11 h." },
      { qui: 'Yanis Lemoine', cote: 'agence', quand: D(-2, 18, 10), texte: "Dérushage terminé, on a un très beau plan de dressage. Montage en cours." },
    ],
  },
  {
    id: 'LU-2431', slug: 'KALPY_LIVREBLANC_CARROUSEL', titre: 'Carrousel LinkedIn — livre blanc automatisation',
    clientId: 'kalpy', type: 'Carrousel', etat: 'validation', priorite: 'haute', ownerId: 'cr',
    ouvert: D(-6, 9, 0), echeance: D(1, 12, 0), diffusion: D(2, 8, 30),
    reseaux: ['linkedin'], devis: { montant: 780, statut: 'accepte', envoye: D(-6), reponse: D(-5) },
    brief: "Décliner les 3 chiffres clés du livre blanc en carrousel 8 slides. Reprendre la mise en page du rapport, chevron en fil rouge. Vouvoiement, pas de superlatif.",
    tempsVendu: 6, tempsPasse: 5.5,
    taches: [
      { id: 't1', nature: 'redac', label: 'Écriture des 8 slides', etat: 'fait', ownerId: 'sb', duree: 2, echeance: D(-4, 17, 0) },
      { id: 't2', nature: 'da', label: 'Mise en page charte Kalpy', etat: 'fait', ownerId: 'cr', duree: 3, echeance: D(-2, 17, 0) },
      { id: 't3', nature: 'export', label: 'Export 1080×1350 ×8', etat: 'fait', ownerId: 'cr', duree: 0.5, echeance: D(-1, 12, 0) },
      { id: 't4', nature: 'program', label: 'Programmation LinkedIn', etat: 'a_faire', ownerId: 'sb', duree: 0.5, echeance: D(1, 17, 0) },
    ],
    fichiers: [{ nom: 'carrousel_v2.pdf', poids: '6,1 Mo', type: 'image' }],
    fil: [
      { qui: 'Priya Nandan', cote: 'client', quand: D(-6, 9, 0), texte: "Le livre blanc sort le 12. Il nous faut un carrousel LinkedIn pour l'annonce." },
      { qui: 'Camille Roux', cote: 'agence', quand: D(-1, 11, 20), texte: "V2 en ligne dans votre espace, avec le chevron en fil conducteur sur les 8 slides." },
    ],
  },
  {
    id: 'LU-2436', slug: 'PAPIOURS_TERRASSE_PHOTOS', titre: 'Shooting photo — nouvelle terrasse',
    clientId: 'papiours', type: 'Photo', etat: 'attente', priorite: 'normale', ownerId: 'am',
    ouvert: D(-3, 16, 20), echeance: D(9, 18, 0), diffusion: D(12, 12, 0),
    reseaux: ['instagram', 'facebook'], devis: { montant: 960, statut: 'envoye', envoye: D(-2), reponse: null },
    brief: "La terrasse rouvre après travaux. 12 photos retouchées, dont 4 verticales pour les stories. Fin de journée pour la lumière.",
    tempsVendu: 8, tempsPasse: 0.5,
    taches: [
      { id: 't1', nature: 'tournage', label: 'Aller tourner — golden hour', etat: 'a_faire', ownerId: 'yl', duree: 3, echeance: D(6, 19, 0) },
      { id: 't2', nature: 'retouche', label: 'Retouche 12 photos', etat: 'a_faire', ownerId: 'cr', duree: 4, echeance: D(8, 18, 0) },
      { id: 't3', nature: 'program', label: 'Programmation IG + FB', etat: 'a_faire', ownerId: 'sb', duree: 0.5, echeance: D(9, 17, 0) },
    ],
    fichiers: [],
    fil: [
      { qui: 'Léa Deleuze', cote: 'client', quand: D(-3, 16, 20), texte: "La terrasse est finie ! On peut faire des photos avant le week-end du 15 ?" },
      { qui: 'Adrien M.', cote: 'agence', quand: D(-2, 10, 0), texte: "Devis de 960 € envoyé pour le shooting + 12 retouches. En attente de votre retour." },
    ],
  },
  {
    id: 'LU-2440', slug: 'KALPY_TEMOIGNAGE_CLIENT_VIDEO', titre: 'Vidéo témoignage client — Groupe Bertin',
    clientId: 'kalpy', type: 'Vidéo', etat: 'production', priorite: 'normale', ownerId: 'yl',
    ouvert: D(-12, 11, 0), echeance: D(6, 18, 0), diffusion: D(9, 8, 30),
    reseaux: ['linkedin', 'instagram'], devis: { montant: 2400, statut: 'accepte', envoye: D(-11), reponse: D(-10) },
    brief: "Interview de 2 min du DSI du Groupe Bertin sur l'automatisation de leur back-office. Décliner en 3 formats courts pour LinkedIn.",
    tempsVendu: 18, tempsPasse: 9,
    taches: [
      { id: 't1', nature: 'tournage', label: 'Aller tourner — interview sur site', etat: 'fait', ownerId: 'yl', duree: 6, echeance: D(-5, 14, 0) },
      { id: 't2', nature: 'derush', label: 'Dérushage & sélection verbatims', etat: 'en_cours', ownerId: 'tm', duree: 3, echeance: D(1, 18, 0) },
      { id: 't3', nature: 'montage', label: 'Montage master 2 min', etat: 'a_faire', ownerId: 'yl', duree: 5, echeance: D(4, 18, 0) },
      { id: 't4', nature: 'montage', label: 'Déclinaison 3 formats courts', etat: 'a_faire', ownerId: 'tm', duree: 3, echeance: D(5, 18, 0) },
      { id: 't5', nature: 'export', label: 'Sous-titres FR/EN & exports', etat: 'a_faire', ownerId: 'cr', duree: 1, echeance: D(6, 12, 0) },
    ],
    fichiers: [
      { nom: 'itw_bertin_A.mov', poids: '11,4 Go', type: 'film' },
      { nom: 'itw_bertin_B.mov', poids: '10,8 Go', type: 'film' },
      { nom: 'verbatims.md', poids: '12 Ko', type: 'texte' },
    ],
    fil: [
      { qui: 'Bastien Wolff', cote: 'client', quand: D(-12, 11, 0), texte: "Bertin accepte de témoigner. Fenêtre de tournage étroite, ils nous donnent 1 h sur site." },
      { qui: 'Yanis Lemoine', cote: 'agence', quand: D(-5, 17, 30), texte: "Tournage bouclé en 50 min, deux axes caméra. Le DSI est très bon face caméra." },
    ],
  },
  {
    id: 'LU-2444', slug: 'OCRES_VENDANGES_SERIE', titre: 'Série vendanges — 6 posts',
    clientId: 'ocres', type: 'Série éditoriale', etat: 'relecture', priorite: 'normale', ownerId: 'sb',
    ouvert: D(-8, 14, 0), echeance: D(3, 18, 0), diffusion: D(5, 10, 0),
    reseaux: ['instagram', 'facebook'], devis: { montant: 1200, statut: 'accepte', envoye: D(-8), reponse: D(-7) },
    brief: "Six publications qui suivent les vendanges du domaine, du premier matin au premier verre.",
    tempsVendu: 10, tempsPasse: 8,
    taches: [
      { id: 't1', nature: 'tournage', label: 'Aller tourner — premier jour', etat: 'fait', ownerId: 'yl', duree: 4, echeance: D(-6, 12, 0) },
      { id: 't2', nature: 'retouche', label: 'Retouche série', etat: 'fait', ownerId: 'cr', duree: 3, echeance: D(-2, 18, 0) },
      { id: 't3', nature: 'redac', label: 'Légendes des 6 posts', etat: 'en_cours', ownerId: 'sb', duree: 2, echeance: D(2, 18, 0) },
    ],
    fichiers: [{ nom: 'vendanges_selection.zip', poids: '820 Mo', type: 'image' }],
    fil: [],
  },
  {
    id: 'LU-2447', slug: 'FERRAND_IDENTITE_LINKEDIN', titre: 'Refonte visuelle des posts LinkedIn',
    clientId: 'ferrand', type: 'Identité sociale', etat: 'devis', priorite: 'normale', ownerId: 'cr',
    ouvert: D(-2, 9, 45), echeance: D(11, 18, 0), diffusion: null,
    reseaux: ['linkedin'], devis: { montant: 1850, statut: 'brouillon', envoye: null, reponse: null },
    brief: "Le cabinet trouve ses posts trop austères. Créer un système de gabarits : citation, décision de justice commentée, portrait d'associé.",
    tempsVendu: 0, tempsPasse: 1,
    taches: [
      { id: 't1', nature: 'da', label: 'Planches de recherche', etat: 'en_cours', ownerId: 'cr', duree: 4, echeance: D(4, 18, 0) },
    ],
    fichiers: [],
    fil: [{ qui: 'Hélène Ferrand', cote: 'client', quand: D(-2, 9, 45), texte: "Nos publications LinkedIn font vieillottes à côté des cabinets parisiens. Que proposez-vous ?" }],
  },
  {
    id: 'LU-2449', slug: 'SUDTOIT_AVANTAPRES_TIKTOK', titre: 'Format avant/après — chantier Vitrolles',
    clientId: 'sudtoit', type: 'Vidéo sociale', etat: 'brief', priorite: 'basse', ownerId: 'am',
    ouvert: D(-1, 17, 10), echeance: D(14, 18, 0), diffusion: null,
    reseaux: ['tiktok', 'facebook'], devis: { montant: 0, statut: 'a_chiffrer', envoye: null, reponse: null },
    brief: "Le patron filme lui-même ses chantiers. Reprendre ses rushes et en faire un format avant/après propre, récurrent.",
    tempsVendu: 0, tempsPasse: 0,
    taches: [],
    fichiers: [{ nom: 'rushes_client_vitrolles.zip', poids: '2,1 Go', type: 'film' }],
    fil: [{ qui: 'Fabien Roussel', cote: 'client', quand: D(-1, 17, 10), texte: "J'ai filmé le chantier de Vitrolles avec mon téléphone, y'a moyen d'en faire quelque chose ?" }],
  },
  {
    id: 'LU-2452', slug: 'VAGANAY_CARTE_AUTOMNE', titre: 'Annonce carte d\'automne',
    clientId: 'vaganay', type: 'Post', etat: 'pret', priorite: 'normale', ownerId: 'cr',
    ouvert: D(-5, 10, 0), echeance: D(0, 18, 0), diffusion: D(0, 18, 30),
    reseaux: ['instagram', 'facebook'], devis: { montant: 340, statut: 'accepte', envoye: D(-5), reponse: D(-5) },
    brief: "Visuel unique pour annoncer la carte d'automne, décliné feed et story.",
    tempsVendu: 3, tempsPasse: 2.5,
    taches: [
      { id: 't1', nature: 'da', label: 'Visuel feed + story', etat: 'fait', ownerId: 'cr', duree: 2, echeance: D(-1, 18, 0) },
      { id: 't2', nature: 'program', label: 'Programmation', etat: 'fait', ownerId: 'sb', duree: 0.5, echeance: D(0, 12, 0) },
    ],
    fichiers: [], fil: [],
  },
  {
    id: 'LU-2455', slug: 'PAPIOURS_SOIREE_CONCERT', titre: 'Affiche + posts — soirée concert du 21',
    clientId: 'papiours', type: 'Affiche & posts', etat: 'brief', priorite: 'haute', ownerId: 'am',
    ouvert: D(0, 8, 40), echeance: D(7, 18, 0), diffusion: null,
    reseaux: ['instagram', 'facebook'], devis: { montant: 0, statut: 'a_chiffrer', envoye: null, reponse: null },
    brief: "Concert le 21 au soir. Il faut une affiche A3 pour la vitrine et deux posts. Le groupe s'appelle « Les Frères Cabas ».",
    tempsVendu: 0, tempsPasse: 0,
    taches: [], fichiers: [],
    fil: [{ qui: 'Marc Deleuze', cote: 'client', quand: D(0, 8, 40), texte: "On a booké un groupe pour le 21 ! Il me faut une affiche pour la vitrine et de quoi poster." }],
  },
  {
    id: 'LU-2402', slug: 'KALPY_WEBINAIRE_TEASER', titre: 'Teaser webinaire — 30 s',
    clientId: 'kalpy', type: 'Vidéo sociale', etat: 'en_ligne', priorite: 'normale', ownerId: 'tm',
    ouvert: D(-24, 10, 0), echeance: D(-6, 18, 0), diffusion: D(-4, 8, 30),
    reseaux: ['linkedin', 'instagram'], devis: { montant: 890, statut: 'accepte', envoye: D(-24), reponse: D(-23) },
    brief: "Teaser motion pour le webinaire du 3, format 30 s, sans tournage.",
    tempsVendu: 7, tempsPasse: 6.5,
    taches: [
      { id: 't1', nature: 'da', label: 'Story-board motion', etat: 'fait', ownerId: 'cr', duree: 2, echeance: D(-14) },
      { id: 't2', nature: 'montage', label: 'Animation After Effects', etat: 'fait', ownerId: 'tm', duree: 4, echeance: D(-8) },
      { id: 't3', nature: 'program', label: 'Programmation', etat: 'fait', ownerId: 'sb', duree: 0.5, echeance: D(-5) },
    ],
    fichiers: [], fil: [],
  },
  {
    id: 'LU-2409', slug: 'PAPIOURS_MENU_SEMAINE_S32', titre: 'Menu de la semaine — S32',
    clientId: 'papiours', type: 'Post récurrent', etat: 'echec', priorite: 'haute', ownerId: 'sb',
    ouvert: D(-7, 9, 0), echeance: D(-1, 12, 0), diffusion: D(-1, 11, 0),
    reseaux: ['facebook'], devis: { montant: 0, statut: 'inclus', envoye: null, reponse: null },
    brief: "Publication récurrente du menu de la semaine, incluse dans l'abonnement.",
    tempsVendu: 1, tempsPasse: 1,
    taches: [
      { id: 't1', nature: 'da', label: 'Gabarit menu S32', etat: 'fait', ownerId: 'cr', duree: 0.5, echeance: D(-3) },
      { id: 't2', nature: 'program', label: 'Republication après renouvellement du jeton', etat: 'bloque', ownerId: 'sb', duree: 0.25, echeance: D(0, 12, 0) },
    ],
    fichiers: [], fil: [],
    incident: "Publication refusée par l'API Meta : le jeton de la page Facebook a expiré le " + D(-2).toLocaleDateString('fr-FR') + '.',
  },
];

const chantier = (id) => CHANTIERS.find((c) => c.id === id);

/* ---------------------------------------------------------
   Publications programmées — la grille de diffusion
   --------------------------------------------------------- */

const LEGENDES = {
  papiours: [
    'Le dimanche, c’est menu des mamans. Réservation conseillée.',
    'Nouvelle pression au comptoir : une blonde de Gardanne, brassée à 14 km d’ici.',
    'Le menu de la semaine est en ligne. Spoiler : il y a du gratin.',
    'La terrasse rouvre vendredi. On a même repeint les tabourets.',
    'Ce soir, Les Frères Cabas au comptoir. Ça va être serré, venez tôt.',
  ],
  kalpy: [
    '3 chiffres du livre blanc que personne n’attendait. Le 2ᵉ change la façon de dimensionner un back-office.',
    'Le DSI du Groupe Bertin raconte 9 mois d’automatisation, sans filtre.',
    'Automatiser n’est pas supprimer des postes. Démonstration en 90 secondes.',
    'Notre webinaire du 3 est disponible en replay.',
  ],
  vaganay: ['La carte d’automne est arrivée.', 'Retour sur le mariage de S. & T. — 140 couverts, zéro accroc.'],
  ocres: ['Jour 1 des vendanges. 6 h du matin, 11 °C, tout le monde est là.', 'Le caveau est ouvert tout le week-end.'],
  ferrand: ['Décision du 14 : ce que change l’arrêt pour les baux commerciaux.'],
  sudtoit: ['Avant / après — toiture 120 m² à Vitrolles, 4 jours de chantier.'],
};

function genPublications() {
  const out = [];
  const clientsActifs = ['papiours', 'kalpy', 'vaganay', 'ocres', 'ferrand', 'sudtoit'];
  let n = 0;
  for (let j = -26; j <= 24; j++) {
    clientsActifs.forEach((cid) => {
      const c = client(cid);
      const reseaux = Object.keys(c.cadence).filter((r) => c.cadence[r] > 0);
      reseaux.forEach((r) => {
        // Densité pilotée par la cadence de l'abonnement.
        const proba = c.cadence[r] / 30;
        const graine = Math.abs(Math.sin((j + 40) * 12.9898 + reseaux.indexOf(r) * 78.233 + cid.length * 3.7)) % 1;
        if (graine > proba * 2.4) return;
        const passe = j < 0;
        const heure = 8 + ((n * 3) % 11);
        const legendes = LEGENDES[cid] || ['Publication programmée.'];
        let etat;
        if (passe) etat = graine < 0.03 ? 'echec' : 'en_ligne';
        else if (j <= 1) etat = 'pret';
        else if (j <= 5) etat = graine < 0.35 ? 'validation' : 'pret';
        else etat = graine < 0.4 ? 'production' : 'brief';
        out.push({
          id: 'P' + String(1000 + n),
          clientId: cid,
          reseau: r,
          quand: D(j, heure, (n % 4) * 15),
          etat,
          format: ['Post', 'Reel', 'Carrousel', 'Story'][n % 4],
          legende: legendes[n % legendes.length],
          portee: passe ? Math.round(600 + graine * 5200) : null,
          interactions: passe ? Math.round(40 + graine * 480) : null,
          chantierId: null,
        });
        n++;
      });
    });
  }
  return out.sort((a, b) => a.quand - b.quand);
}

const PUBLICATIONS = genPublications();

const pubsDuJour = (date) =>
  PUBLICATIONS.filter((p) => p.quand.toDateString() === date.toDateString());

/* ---------------------------------------------------------
   Connexions aux réseaux
   --------------------------------------------------------- */

const CONNEXIONS = [
  { id: 'meta-fb', reseau: 'facebook', compte: 'Papi Ours — Page', clientId: 'papiours', etat: 'echec', expire: D(-2), derniereSync: D(-2, 11, 4), message: 'Jeton expiré — reconnexion nécessaire' },
  { id: 'meta-ig-po', reseau: 'instagram', compte: '@papiours', clientId: 'papiours', etat: 'ok', expire: D(41), derniereSync: D(0, 7, 12), message: null },
  { id: 'tiktok-po', reseau: 'tiktok', compte: '@papiours', clientId: 'papiours', etat: 'ok', expire: D(19), derniereSync: D(0, 7, 12), message: null },
  { id: 'li-kalpy', reseau: 'linkedin', compte: 'Kalpy — Page entreprise', clientId: 'kalpy', etat: 'ok', expire: D(58), derniereSync: D(0, 7, 14), message: null },
  { id: 'meta-ig-kalpy', reseau: 'instagram', compte: '@kalpy.io', clientId: 'kalpy', etat: 'ok', expire: D(37), derniereSync: D(0, 7, 14), message: null },
  { id: 'meta-fb-kalpy', reseau: 'facebook', compte: 'Kalpy — Page', clientId: 'kalpy', etat: 'attention', expire: D(6), derniereSync: D(0, 7, 14), message: 'Jeton expire dans 6 jours' },
  { id: 'meta-ig-ocres', reseau: 'instagram', compte: '@domainedesocres', clientId: 'ocres', etat: 'ok', expire: D(64), derniereSync: D(0, 7, 15), message: null },
  { id: 'li-ferrand', reseau: 'linkedin', compte: 'Cabinet Ferrand', clientId: 'ferrand', etat: 'ok', expire: D(72), derniereSync: D(0, 7, 16), message: null },
];

const JOURNAL_API = [
  { quand: D(0, 7, 30), reseau: 'instagram', compte: '@kalpy.io', action: 'Publication', resultat: 'ok', detail: 'Carrousel 8 slides — id 17982…' },
  { quand: D(-1, 11, 0), reseau: 'facebook', compte: 'Papi Ours — Page', action: 'Publication', resultat: 'echec', detail: 'OAuthException 190 — jeton expiré' },
  { quand: D(-1, 9, 30), reseau: 'linkedin', compte: 'Kalpy — Page entreprise', action: 'Publication', resultat: 'ok', detail: 'Post texte + image' },
  { quand: D(-2, 18, 30), reseau: 'instagram', compte: '@papiours', action: 'Publication', resultat: 'ok', detail: 'Reel 28 s' },
  { quand: D(-2, 8, 0), reseau: 'tiktok', compte: '@papiours', action: 'Publication', resultat: 'ok', detail: 'Vidéo 22 s' },
  { quand: D(-3, 14, 12), reseau: 'facebook', compte: 'Kalpy — Page', action: 'Rafraîchissement jeton', resultat: 'ok', detail: 'Prolongé de 60 jours' },
];

/* ---------------------------------------------------------
   RH
   --------------------------------------------------------- */

const CONGES = [
  { id: 'C-118', qui: 'yl', type: 'Congés payés', du: D(12), au: D(19), jours: 6, etat: 'attente', depose: D(-2) },
  { id: 'C-117', qui: 'sb', type: 'RTT', du: D(5), au: D(5), jours: 1, etat: 'attente', depose: D(-1) },
  { id: 'C-116', qui: 'cr', type: 'Congés payés', du: D(-14), au: D(-8), jours: 5, etat: 'valide', depose: D(-40) },
  { id: 'C-115', qui: 'tm', type: 'Sans solde', du: D(28), au: D(30), jours: 3, etat: 'refuse', depose: D(-6), motif: 'Chevauche le tournage Kalpy du 29.' },
  { id: 'C-114', qui: 'am', type: 'Congés payés', du: D(22), au: D(36), jours: 10, etat: 'valide', depose: D(-25) },
];

const FRAIS = [
  { id: 'F-341', qui: 'yl', objet: 'Péage + carburant — tournage Bertin', montant: 68.4, date: D(-5), categorie: 'Déplacement', etat: 'attente', justificatif: true },
  { id: 'F-340', qui: 'cr', objet: 'Licence police de caractères Anton Pro', montant: 129, date: D(-6), categorie: 'Logiciel', etat: 'attente', justificatif: true },
  { id: 'F-339', qui: 'am', objet: 'Déjeuner client — Papi Ours', montant: 54.5, date: D(-8), categorie: 'Réception', etat: 'valide', justificatif: true, rembourse: D(-1) },
  { id: 'F-338', qui: 'yl', objet: 'Cartes SD 128 Go ×2', montant: 79.9, date: D(-12), categorie: 'Matériel', etat: 'valide', justificatif: true, rembourse: D(-1) },
  { id: 'F-337', qui: 'sb', objet: 'Abonnement outil de veille', montant: 24, date: D(-14), categorie: 'Logiciel', etat: 'refuse', justificatif: false, motif: 'Justificatif manquant' },
];

const RENDEZVOUS = [
  { id: 'R-77', quand: D(0, 14, 0), duree: 60, clientId: 'papiours', objet: 'Point mensuel + brief soirée concert', qui: ['am', 'sb'], lieu: 'Sur place' },
  { id: 'R-78', quand: D(1, 10, 30), duree: 45, clientId: 'kalpy', objet: 'Validation carrousel livre blanc', qui: ['cr'], lieu: 'Visio' },
  { id: 'R-79', quand: D(2, 9, 0), duree: 90, clientId: 'ferrand', objet: 'Présentation des pistes graphiques', qui: ['cr', 'am'], lieu: 'Marseille' },
  { id: 'R-80', quand: D(4, 16, 0), duree: 30, clientId: 'sudtoit', objet: 'Cadrage format avant/après', qui: ['am'], lieu: 'Téléphone' },
  { id: 'R-81', quand: D(7, 11, 0), duree: 120, clientId: 'ocres', objet: 'Repérage tournage caveau', qui: ['yl', 'cr'], lieu: 'Roussillon' },
];

const FICHES_PAIE = EQUIPE.flatMap((e) =>
  [0, 1, 2, 3, 4, 5].map((i) => {
    const m = new Date(NOW);
    m.setMonth(m.getMonth() - i, 1);
    return {
      id: `${e.id}-${m.getFullYear()}${String(m.getMonth() + 1).padStart(2, '0')}`,
      qui: e.id,
      periode: m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      depose: new Date(m.getFullYear(), m.getMonth() + 1, 2),
      poids: '184 Ko',
    };
  })
);

/* ---------------------------------------------------------
   Facturation
   --------------------------------------------------------- */

const FACTURES = [
  { id: 'FA-2026-0148', clientId: 'kalpy', objet: 'Abonnement Signature — ' + D(0).toLocaleDateString('fr-FR', { month: 'long' }), montant: 1690, emise: D(-8), echeance: D(22), etat: 'envoyee' },
  { id: 'FA-2026-0147', clientId: 'papiours', objet: 'Abonnement Studio + reel fête des mères', montant: 2340, emise: D(-8), echeance: D(22), etat: 'envoyee' },
  { id: 'FA-2026-0146', clientId: 'ocres', objet: 'Abonnement Studio + série vendanges', montant: 2090, emise: D(-8), echeance: D(22), etat: 'payee', paiement: D(-3) },
  { id: 'FA-2026-0145', clientId: 'vaganay', objet: 'Abonnement Essentiel', montant: 490, emise: D(-8), echeance: D(22), etat: 'payee', paiement: D(-6) },
  { id: 'FA-2026-0139', clientId: 'sudtoit', objet: 'Abonnement Essentiel', montant: 490, emise: D(-38), echeance: D(-8), etat: 'retard' },
  { id: 'FA-2026-0138', clientId: 'ferrand', objet: 'Abonnement Essentiel', montant: 490, emise: D(-38), echeance: D(-8), etat: 'payee', paiement: D(-12) },
  { id: 'FA-2026-0132', clientId: 'kalpy', objet: 'Abonnement Signature + vidéo témoignage', montant: 4090, emise: D(-38), echeance: D(-8), etat: 'payee', paiement: D(-14) },
  { id: 'FA-2026-0131', clientId: 'papiours', objet: 'Abonnement Studio', montant: 890, emise: D(-38), echeance: D(-8), etat: 'payee', paiement: D(-30) },
];

/* ---------------------------------------------------------
   Séries de données pour les graphiques
   --------------------------------------------------------- */

const MOIS_COURTS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function derniersMois(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(NOW);
    m.setMonth(m.getMonth() - i, 1);
    out.push(MOIS_COURTS[m.getMonth()]);
  }
  return out;
}

const SERIE_PUBLICATIONS = {
  labels: derniersMois(6),
  facebook: [22, 26, 24, 29, 27, 31],
  instagram: [34, 38, 41, 44, 46, 52],
  linkedin: [18, 21, 26, 28, 33, 38],
  tiktok: [6, 9, 11, 10, 14, 17],
};

const SERIE_MRR = { labels: derniersMois(6), valeurs: [3450, 3450, 3940, 4430, 4940, 4940] };

const SERIE_ENGAGEMENT = {
  labels: ['S-7', 'S-6', 'S-5', 'S-4', 'S-3', 'S-2', 'S-1', 'S'],
  papiours: [3.1, 3.4, 2.9, 3.8, 4.2, 3.9, 4.6, 5.1],
  kalpy: [2.2, 2.4, 2.8, 2.6, 3.1, 3.4, 3.3, 3.7],
};

const SERIE_DELAI_VALIDATION = {
  labels: ['Papi Ours', 'Kalpy', 'M. Vaganay', 'D. des Ocres', 'C. Ferrand', 'Sud Toitures'],
  valeurs: [1.2, 0.6, 2.8, 1.9, 4.1, 3.2],
};

/* Charge de l'équipe, en jours, sur 4 semaines. */
const SERIE_CHARGE = {
  labels: ['S', 'S+1', 'S+2', 'S+3'],
  parPersonne: {
    cr: [4.5, 5, 3.5, 4],
    yl: [5, 5.5, 4, 2],
    sb: [3, 3.5, 3, 3.5],
    tm: [2.5, 4, 4.5, 3],
    nf: [4, 4.5, 4.5, 4],
  },
};

/* ---------------------------------------------------------
   Studio IA — propositions générées à partir de la charte
   --------------------------------------------------------- */

const OCCASIONS = [
  { id: 'fetedesmeres', label: 'Fête des mères', quand: 'dernier dimanche de mai' },
  { id: 'rentree', label: 'Rentrée', quand: 'première semaine de septembre' },
  { id: 'blackfriday', label: 'Black Friday', quand: 'dernier vendredi de novembre' },
  { id: 'fetes', label: 'Fêtes de fin d’année', quand: 'décembre' },
  { id: 'recrutement', label: 'Annonce de recrutement', quand: 'toute l’année' },
  { id: 'anniversaire', label: 'Anniversaire de l’entreprise', quand: 'date de création' },
];

const PROPOSITIONS_IA = {
  papiours: [
    { titre: 'Affiche « Menu des mamans »', angle: 'Le menu écrit à la craie sur l’ardoise du bar, cadré serré.', accroche: 'Dimanche, c’est elle qui choisit la table.', format: 'Post 1080×1350', fond: '#111111', encre: '#FAF7F0', accent: '#C8862A', motif: 'ardoise' },
    { titre: 'Reel « Les mains de la cuisine »', angle: 'Plan-séquence sur le dressage du plat du dimanche.', accroche: 'On a mis les petits plats dans les grands. Littéralement.', format: 'Reel 9:16', fond: '#2F4B3F', encre: '#FAF7F0', accent: '#C8862A', motif: 'grain' },
    { titre: 'Story « Réserve ta table »', angle: 'Compte à rebours jusqu’au service, sur fond crème.', accroche: 'Il reste 4 tables pour dimanche midi.', format: 'Story 9:16', fond: '#FAF7F0', encre: '#111111', accent: '#C8862A', motif: 'points' },
  ],
  kalpy: [
    { titre: 'Carte « 3 chiffres »', angle: 'Chiffre au centre, chevron en filigrane, une ligne d’explication.', accroche: '38 % du temps de back-office est passé sur des tâches sans décision.', format: 'Post 1080×1350', fond: '#2B2255', encre: '#FFFFFF', accent: '#35C3D8', motif: 'chevron' },
    { titre: 'Carrousel « Avant / Après »', angle: 'Un processus en 6 étapes, ramené à 2. Colonne gauche / colonne droite.', accroche: 'Six étapes hier. Deux aujourd’hui. La même conformité.', format: 'Carrousel ×5', fond: '#FFFFFF', encre: '#2B2255', accent: '#E9A8C9', motif: 'grille' },
    { titre: 'Post recrutement', angle: 'Portrait détouré sur aplat indigo, poste en gros.', accroche: 'On cherche un·e ingénieur·e d’intégration. Lyon ou distanciel.', format: 'Post 1200×628', fond: '#3C4CA8', encre: '#FFFFFF', accent: '#35C3D8', motif: 'chevron' },
  ],
};

/* Réalisations passées, décrites (pas d'images factices de créas). */
const REALISATIONS = {
  papiours: [
    { titre: 'Reel « Le fût du mois »', date: D(-38), reseau: 'instagram', portee: 12400, interactions: 980, fond: '#111111', accent: '#C8862A' },
    { titre: 'Affiche soirée blind test', date: D(-52), reseau: 'facebook', portee: 5200, interactions: 310, fond: '#2F4B3F', accent: '#C8862A' },
    { titre: 'Carrousel « D’où vient notre bière »', date: D(-66), reseau: 'instagram', portee: 8900, interactions: 640, fond: '#FAF7F0', accent: '#111111' },
    { titre: 'TikTok « 30 s au comptoir »', date: D(-74), reseau: 'tiktok', portee: 24800, interactions: 2100, fond: '#111111', accent: '#C8862A' },
  ],
  kalpy: [
    { titre: 'Carrousel « Automatiser sans casser »', date: D(-30), reseau: 'linkedin', portee: 18600, interactions: 720, fond: '#2B2255', accent: '#35C3D8' },
    { titre: 'Teaser webinaire', date: D(-44), reseau: 'linkedin', portee: 9400, interactions: 410, fond: '#3C4CA8', accent: '#E9A8C9' },
    { titre: 'Post « 3 chiffres du secteur »', date: D(-58), reseau: 'instagram', portee: 4100, interactions: 260, fond: '#FFFFFF', accent: '#2B2255' },
    { titre: 'Motion « Notre méthode en 40 s »', date: D(-80), reseau: 'linkedin', portee: 22300, interactions: 1180, fond: '#2B2255', accent: '#E9A8C9' },
  ],
};

/* ---------------------------------------------------------
   Journal d'activité (fil de la conduite)
   --------------------------------------------------------- */

const ACTIVITE = [
  { quand: D(0, 8, 42), qui: 'sb', texte: 'a programmé 3 publications pour Domaine des Ocres' },
  { quand: D(0, 8, 12), qui: null, texte: 'Publication Facebook « Menu de la semaine — S32 » en échec : jeton expiré', alerte: true },
  { quand: D(0, 7, 55), qui: 'yl', texte: 'a passé « Montage 30 s vertical » en cours sur LU-2418' },
  { quand: D(-1, 18, 4), qui: 'cr', texte: 'a déposé la V2 du carrousel Kalpy pour validation client' },
  { quand: D(-1, 15, 20), qui: null, texte: 'Papi Ours a ouvert une demande : affiche + posts soirée concert' },
  { quand: D(-1, 11, 2), qui: 'am', texte: 'a envoyé le devis LU-2436 (960 €) à Papi Ours' },
  { quand: D(-2, 17, 40), qui: 'tm', texte: 'a terminé le dérushage de l’interview Bertin' },
];


  window.LU = Object.assign(window.LU || {}, { NOW, D, ETATS, PIPELINE, SOUS_ETATS, NATURES, RESEAUX, SERIE, RAMPE, EQUIPE, membre, CLIENTS, client, PLANS, CHANTIERS, chantier, PUBLICATIONS, pubsDuJour, CONNEXIONS, JOURNAL_API, CONGES, FRAIS, RENDEZVOUS, FICHES_PAIE, FACTURES, MOIS_COURTS, derniersMois, SERIE_PUBLICATIONS, SERIE_MRR, SERIE_ENGAGEMENT, SERIE_DELAI_VALIDATION, SERIE_CHARGE, OCCASIONS, PROPOSITIONS_IA, REALISATIONS, ACTIVITE });
})();
