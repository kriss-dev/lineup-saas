---
name: Line Up — Conduite
description: Régie de diffusion pour une agence créative — une seule ligne, de la demande client au post publié.
colors:
  nuit: "#05060f"
  nuit-panneau: "#090b18"
  nuit-creux: "#0b0d1a"
  nuit-relief: "#101324"
  nuit-flottant: "#161a2e"
  filet: "rgba(255,255,255,0.09)"
  filet-franc: "rgba(255,255,255,0.17)"
  encre: "#f2f4fb"
  encre-seconde: "#a9b1c9"
  encre-tierce: "#7e88a6"
  marque-cyan: "#00d8ff"
  marque-bleu: "#2f6bff"
  marque-violet: "#8b5cff"
  marque-magenta: "#ff5cf4"
  etat-antenne: "#2ee6a8"
  etat-attente: "#ffb020"
  etat-alerte: "#ff4d6d"
  etat-alerte-encre: "#ffb3c1"
  etat-alerte-encre-clair: "#ffc2ce"
  encre-artwork-clair: "#00000055"
  encre-artwork-sombre: "#ffffff66"
  etat-production: "#00d8ff"
  etat-dormant: "#8a93a8"
  etat-relecture: "#8b5cff"
  serie-1: "#0f9db4"
  serie-2: "#a83a98"
  serie-3: "#95610f"
  serie-4: "#8a6bf0"
typography:
  display:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "normal"
  display-sm:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 300
    lineHeight: 1.1
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "23px"
    fontWeight: 400
    lineHeight: 1.15
  headline-sm:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.3
  title-sm:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.35
  section:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 300
    lineHeight: 1.6
  body-dense:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 300
    lineHeight: 1.5
  body-meta:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 300
    lineHeight: 1.45
  chiffre:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "19px"
    fontWeight: 300
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  mesure:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
  mesure-sm:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 400
    fontFeature: "tnum"
  mesure-xs:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "10.5px"
    fontWeight: 400
    fontFeature: "tnum"
  etiquette:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "10px"
    fontWeight: 500
    letterSpacing: "0.14em"
  etiquette-xs:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "9.5px"
    fontWeight: 500
    letterSpacing: "0.1em"
  micro:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "8.5px"
    fontWeight: 500
    letterSpacing: "0.16em"
rounded:
  filet: "2px"
  surface: "3px"
spacing:
  serre: "6px"
  cellule: "14px"
  bloc: "20px"
  section: "24px"
  rang: "44px"
components:
  bouton-cle:
    backgroundColor: "{colors.marque-cyan}"
    textColor: "{colors.nuit}"
    typography: "{typography.etiquette}"
    rounded: "{rounded.surface}"
    padding: "0 14px"
    height: "34px"
  bouton-sobre:
    backgroundColor: "transparent"
    textColor: "{colors.encre}"
    typography: "{typography.etiquette}"
    rounded: "{rounded.surface}"
    padding: "0 14px"
    height: "34px"
  bouton-sobre-hover:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "{colors.encre}"
  champ:
    backgroundColor: "{colors.nuit-creux}"
    textColor: "{colors.encre}"
    typography: "{typography.body}"
    rounded: "{rounded.surface}"
    padding: "9px 11px"
  pastille-etat:
    backgroundColor: "transparent"
    textColor: "{colors.encre-seconde}"
    typography: "{typography.etiquette}"
    rounded: "{rounded.filet}"
    padding: "0 8px"
    height: "21px"
  panneau:
    backgroundColor: "{colors.nuit-panneau}"
    textColor: "{colors.encre}"
    rounded: "{rounded.surface}"
    padding: "20px"
  ligne-conduite:
    backgroundColor: "transparent"
    textColor: "{colors.encre}"
    height: "44px"
  ligne-conduite-hover:
    backgroundColor: "rgba(255,255,255,0.028)"
---

# Design System: Line Up — Conduite

## Overview

**Creative North Star : « La régie de diffusion »**

Line Up est une agence dont le nom est un terme de plateau : la *line-up*, c'est la conduite
d'antenne, l'ordre de passage d'une émission. Le système reprend cet objet à la lettre. Une
seule ligne, ordonnée par heure de diffusion, porte tout le travail de l'agence : la demande
du client, son chiffrage, ses sous-tâches de production, la création à valider, puis le post
qui part. Les autres écrans — pipeline, grille, comptes, équipe, facturation, liaisons — ne
sont pas d'autres applications : ce sont des lentilles posées sur la même ligne.

La conséquence est une densité assumée. La ligne se lit en rangs de 44 px, filets de 1 px à
9 % de blanc, sans ombre, sans carte, sans arrondi mou. Tout ce qui se mesure — heure, compte
à rebours, slug, compteur, code d'état, montant — est en monospace tabulaire ; tout ce qui se
lit — titre, brief, message, légende — est en Poppins 300. Cette bascule typographique est le
signal de lecture principal du système : l'œil sait instantanément s'il regarde une donnée ou
une phrase.

Le fond nuit vient de la marque et du poste de travail réel : une régie se regarde dans une
pièce sombre, sur un écran allumé toute la journée. Le dégradé cyan → magenta du logotype n'est
jamais décoratif ; il ne signale que trois choses : l'antenne, la lentille active, et l'action
principale d'un écran. Partout ailleurs, la couleur porte un état, et un état est toujours
doublé d'un libellé.

**Key Characteristics :**
- Une conduite ordonnée par heure de diffusion, jamais une grille de cartes-indicateurs.
- Rail d'état de 2 px + libellé en capitales : la couleur ne dit jamais rien toute seule.
- Monospace pour la mesure, Poppins pour la prose — la bascule est le repère de lecture.
- Filets de 1 px, pas d'ombre portée dans le contenu ; la profondeur vient des valeurs de fond.
- Le dégradé de marque est un signal rare, pas une texture.
- Barre maîtresse continue et segmentée, jamais une rangée de tuiles séparées.

## Colors

Une nuit profonde à quatre valeurs, une encre à trois niveaux, six couleurs d'état réservées,
et un dégradé de marque tenu en laisse.

### Primary
- **Cyan d'antenne** (`#00d8ff`) : première couleur du dégradé de marque et couleur de l'état
  « en production ». Elle porte l'anneau de focus clavier et la bordure d'un champ actif.
- **Magenta d'antenne** (`#ff5cf4`) : dernière couleur du dégradé. N'apparaît jamais seule ;
  uniquement comme fin du dégradé sur l'action principale, le rail de lentille active et le
  filet d'aujourd'hui dans les calendriers.

### Secondary — les états (réservés)
- **Vert antenne** (`#2ee6a8`) : prêt à diffuser, publié, validé, dans les délais.
- **Ambre attente** (`#ffb020`) : la balle est dans le camp du client, jeton qui approche de
  l'expiration, note de frais à décider.
- **Rouge alerte** (`#ff4d6d`) : retard, publication tombée, liaison rompue, refus.
- **Violet relecture** (`#8b5cff`) : chiffrage en cours, relecture interne, action neutre différée.
- **Gris dormant** (`#8a93a8`) : brief non découpé, colonne vide, élément sans échéance.

### Neutral
- **Nuit** (`#05060f`) : fond de page.
- **Nuit panneau** (`#090b18`) : barres, colonnes latérales, panneaux, tiroirs.
- **Nuit creux** (`#0b0d1a`) : champs de saisie, en-têtes de tableau, cartes posées sur un panneau.
- **Nuit relief** (`#101324`) / **Nuit flottant** (`#161a2e`) : notifications, infobulles de graphique.
- **Filet** (`rgba(255,255,255,.09)`) : toute séparation. **Filet franc** (`rgba(255,255,255,.17)`) :
  contour des boutons sobres et filiation des sous-tâches.
- **Encre** (`#f2f4fb`) / **seconde** (`#a9b1c9`) / **tierce** (`#7e88a6`, 5,4:1 sur la nuit) : titre, prose, étiquette.

### Séries de données
- **Série 1 à 4** (`#0f9db4`, `#a83a98`, `#95610f`, `#8a6bf0`) : palette catégorielle assignée dans
  un ordre fixe, validée en mode sombre (bande de clarté OKLCH 0,48–0,67, plancher de chroma,
  séparation deutan/tritan, contraste ≥ 3:1 sur `#0b0d1a`). Quatre entrées, pas plus.
- **Rampe ordinale** (`#0f4b59` → `#96dde9`, 7 pas) : une seule teinte à clarté croissante, pour
  les séquences ordonnées (les états de chantier sont une séquence, pas des catégories).

### Named Rules
**La règle du signal.** Le dégradé cyan → magenta ne sert qu'à trois usages : l'action principale
d'un écran, le rail de la lentille active, et le repère « aujourd'hui ». Il n'habille jamais un
titre, un fond de panneau ni une bordure décorative. Sa rareté est ce qui le rend lisible.

**La règle de l'état doublé.** Un état se lit sans couleur. Chaque rail de 2 px est accompagné
d'un libellé en capitales monospace (`PROD`, `ATT.CLI`, `ÉCHEC`), chaque pastille d'un texte.
Une couleur seule ne porte jamais une information.

**La règle des couleurs réservées.** Les six couleurs d'état ne sont jamais réemployées comme
couleurs de série dans un graphique, et les quatre couleurs de série ne signalent jamais un état.

## Typography

**Police de lecture :** Poppins (secours : ui-sans-serif, system-ui, Segoe UI)
**Police de mesure :** Azeret Mono (secours : ui-monospace, Consolas)
Les deux sont embarquées en base64 dans `demo/css/fonts.css` : la maquette doit charger depuis
`file://`, sans serveur ni réseau.

**Caractère :** un géométrique clair et très léger pour la parole humaine, un monospace
technique, large et à chasse fixe pour tout ce qui se compte. Aucune police d'affichage : sur
une surface d'opération, la voix vient de la densité et du rythme, pas d'un caractère à effet.

### Hierarchy
- **Display** (300, 30–40 px, 1.1) : titre de la page d'entrée uniquement.
- **Headline** (400, 23 px, 1.15) : titre d'écran dans les deux applications.
- **Title** (400, 15–17 px, 1.35) : titre de panneau, titre de tiroir.
- **Body** (300, 12,5–13 px, 1.6) : brief, message, légende, prose explicative. Mesure ≤ 74ch.
- **Mesure** (400, 10,5–11,5 px, tabulaire) : heure, date courte, slug, compteur, montant en ligne.
- **Chiffre** (300, 19–25 px, −0.03em, tabulaire) : valeur d'instrument dans la barre maîtresse
  et les bandes segmentées.
- **Étiquette** (500, 10 px, 0.14em, capitales, monospace) : nom de champ, nom de colonne, nom de
  section, métadonnée sous un titre.

**Dette assumée, à réduire.** L'échelle compte 17 pas, dont dix entre 8,5 et 15 px. C'est le
prix d'une interface très dense où chaque colonne a sa propre densité — mais huit pas suffiraient.
Toute nouvelle surface se sert dans les pas ci-dessus et n'en crée aucun ; la réduction de
l'échelle est un chantier à ouvrir avant la mise en production.

### Named Rules
**La règle de la bascule.** Si la valeur se compte, se compare ou s'aligne en colonne, elle est en
Azeret Mono tabulaire. Sinon elle est en Poppins. Aucun nombre destiné à être comparé ne reste en
proportionnel, aucune phrase ne passe en monospace.

**La règle de l'étiquette sous le titre.** L'étiquette monospace en capitales nomme un champ, une
colonne ou une section — elle ne se pose jamais au-dessus d'un titre en guise de surtitre.

## Layout

Deux coques distinctes pour deux métiers.

**Régie (agence)** : hauteur d'écran fixe, sans défilement de page. Rail de lentilles de 212 px à
gauche (masqué sous 1024 px, remplacé par un tiroir), barre maîtresse en haut, zone de vue qui
défile seule. Les vues denses se découpent en `minmax(0,1fr)` + colonne de décision de 330–336 px,
qui disparaît sous 1280 px. Le pipeline défile horizontalement dans son propre conteneur, en
colonnes de 254 px.

**Espace client** : page qui défile normalement, en-tête collant, contenu centré à 1000–1240 px
selon la vue, gouttières de 16 px (24 px au-delà de 1024 px).

**Rythme** : rang de conduite à 44 px minimum, rang secondaire à 38 px, cellule à 14 px de
gouttière horizontale, bloc à 20 px, section à 24 px. Toujours plus d'espace au-dessus d'un titre
qu'en dessous.

**Ruptures** : 640 px (sm) — les rangs passent de 4 à 2 ou 3 colonnes et les décomptes disparaissent
au profit d'une mention dans la ligne d'étiquette ; 768 px (md) — client, réseaux et avancement
reviennent dans les rangs de conduite ; 1024 px (lg) — le rail de lentilles apparaît ; 1280 px (xl)
— la colonne des décisions apparaît.

**La règle du repli.** Une barre d'instruments se replie en passant à la ligne, jamais en
débordant : chaque segment porte son filet à gauche et sa largeur minimale, et les segments
secondaires s'effacent sous 640 px puis 768 px.

## Elevation & Depth

Le système est plat par principe. Il n'y a pas d'ombre portée dans le contenu : la profondeur
vient de quatre valeurs de fond empilées (`#05060f` → `#090b18` → `#0b0d1a` → `#101324`) et de
filets de 1 px. Un panneau est un aplat cerné, pas un objet posé.

Deux exceptions, toutes deux liées à un objet réellement détaché de la page :

### Shadow Vocabulary
- **Notification** (`box-shadow: 0 16px 40px -12px rgba(0,0,0,.8)`) : la pile de signaux, seul
  élément qui flotte au-dessus de tout.
- **Halo de pastille** (`box-shadow: 0 0 0 3px <état à 18 %>`) : anneau de couleur autour d'une
  pastille d'état ; sur une alerte vive, il respire entre 3 et 6 px.

### Named Rules
**La règle du plat.** Toute ombre porte un décalage et un flou. Un halo centré sans décalage n'est
admis que sur une pastille d'état, où il joue le rôle d'une diode, pas d'une élévation.

## Shapes

Rayon de 3 px sur les surfaces (panneaux, boutons, champs, tuiles de créa), 2 px sur les
micro-objets (pastilles d'état, échantillons de couleur, cases de calendrier). Rien de plus :
au-delà, la densité se met à ressembler à une application grand public.

Le rail d'état est la forme signature : une barre de 2 px collée au bord gauche d'un rang, d'une
carte ou d'un bloc, jamais épaissie, jamais posée à droite. Les sous-tâches se décrochent de leur
chantier par un filet de filiation en L (1 px, `rgba(255,255,255,.17)`) tracé à 11 px du bord.

Les séparateurs sont toujours des filets de 1 px pleine largeur, jamais des espaces vides : sur une
ligne dense, c'est le filet qui tient l'alignement de l'œil.

## Components

### Boutons
- **Forme :** rayon 3 px, hauteur 34 px (27 px en version courte), libellé en Azeret Mono 11 px,
  capitales, interlettrage 0.08em.
- **Clé :** dégradé de marque, texte `#05060f`, graisse 700. Un seul par écran ou par bloc de
  décision.
- **Sobre :** fond transparent, contour `rgba(255,255,255,.17)`. Survol : contour à 40 % de blanc,
  fond à 5 %. Désactivé : opacité 0.38, curseur interdit, aucun effet de survol.
- **Danger :** contour et texte rosés, réservé au refus ou à la suppression.
- Sous 640 px, l'action principale d'une carte de décision prend toute la largeur du rang.

### Pastilles d'état
- Contour de 1 px, rayon 2 px, hauteur 21 px (19 px en version courte), texte monospace 9,5 px en
  capitales, précédé d'une diode de 7 px à la couleur de l'état.
- Une alerte vivante fait respirer son halo (2,4 s) ; rien d'autre ne clignote.

### Panneaux et cartes
- Fond `#090b18`, contour de 1 px `rgba(255,255,255,.09)`, rayon 3 px, aucune ombre.
- Une carte posée dans un panneau descend d'une valeur (`#0b0d1a`) au lieu de se soulever.
- Pas de carte dans une carte : au deuxième niveau, on passe à des rangs séparés par des filets.

### Champs
- Fond `#0b0d1a`, contour de 1 px, rayon 3 px, texte 13 px en Poppins 300.
- Focus : contour cyan à 55 %. Focus clavier global : anneau cyan de 2 px avec 2 px de décalage.
- Les `select` perdent leur chevron natif et gardent un fond d'option `#101324`.

### Navigation
- **Régie :** rang de 13 px, icône à 17 px et 70 % d'opacité, actif = fond blanc à 5,5 % + rail
  dégradé de 2 px à gauche ; un compteur ambre à droite signale ce qui attend une décision.
- **Espace client :** onglets horizontaux, actif souligné d'un trait cyan de 2 px en `inset`
  box-shadow, défilement horizontal sous 640 px.

### La ligne de conduite (composant signature)
Le rang porte, dans l'ordre : heure de diffusion, pastille d'état, chevron de dépliage, slug en
monospace, intitulé en Poppins, compte à rebours, responsable. Le rail d'état colle au bord gauche.
Un clic déplie les sous-tâches en rangs décrochés de 38 px reliés par le filet de filiation.
Un compte à rebours ne s'écrit jamais `hh:mm` — toujours `2 j 04 h`, `6 h 12` ou `42 min` — pour
qu'il ne se lise pas comme une heure de diffusion.

### La barre maîtresse (composant signature)
Une seule barre continue, segmentée par des filets de 1 px : horloge d'antenne, date et volume du
jour, prochaine diffusion en compte à rebours, retards, à valider, lampes de liaison API. Ce n'est
jamais une rangée de tuiles détachées, et jamais un jeu de cartes-indicateurs.

### L'aperçu de créa
Une création passée ou proposée est reconstituée dans la charte du compte : aplat de fond, motif
de marque en filigrane (chevron, grille, points ou trame diagonale), mot-symbole en monospace,
filet d'accent, accroche réelle, puis deux ou trois lignes de texte grecquées. Un aperçu n'est
jamais un rectangle vide, et il est toujours légendé comme une reconstitution.

### Graphiques
Chart.js, sans légende native : la légende est écrite en HTML, présente dès deux séries, et
accompagnée d'un tableau de repli dépliable. Grille à 6 % de blanc, axes sans bordure, marques
fines, rayon de 3 px sur les barres, écart de 2 px de la couleur du fond entre segments empilés.
Jamais deux échelles verticales sur un même graphique.

## Do's and Don'ts

### Do :
- **Do** ordonner par heure de diffusion : c'est l'axe de lecture du produit.
- **Do** doubler chaque couleur d'état d'un libellé en capitales monospace.
- **Do** écrire en Azeret Mono tabulaire tout ce qui se compte, s'aligne ou se compare.
- **Do** garder le dégradé de marque pour l'action principale, la lentille active et « aujourd'hui ».
- **Do** replier une barre d'instruments en passant à la ligne, avec des segments à largeur minimale.
- **Do** séparer par un filet de 1 px plutôt que par du vide dès que l'alignement compte.
- **Do** étiqueter comme reconstitution tout aperçu de création rejoué depuis une charte.
- **Do** fournir un tableau de repli sous chaque graphique porteur d'information.

### Don't :
- **Don't** ouvrir un écran sur une rangée de cartes-indicateurs : la ligne d'abord.
- **Don't** écrire un compte à rebours au format `hh:mm`.
- **Don't** teinter le portail client aux couleurs du compte : il porte l'identité Line Up.
- **Don't** poser une étiquette monospace en surtitre au-dessus d'un titre.
- **Don't** appliquer le dégradé de marque à du texte, à un fond de panneau ou à une bordure.
- **Don't** réemployer une couleur d'état comme couleur de série, ni l'inverse.
- **Don't** imbriquer une carte dans une carte ; passer à des rangs filetés.
- **Don't** animer une largeur ou une hauteur : les jauges se remplissent par `transform: scaleX`.
- **Don't** dépasser quatre séries catégorielles ; au-delà, facetter ou regrouper.
