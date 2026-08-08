---
name: Line Up — Conduite
description: Tableau de bord clair aux couleurs de la marque, qui reste une conduite — de la demande client au post publié.
colors:
  page: "#eef1f8"
  surface: "#ffffff"
  surface-creux: "#f6f8fd"
  surface-enfonce: "#e8ecf6"
  encre-solide: "#131a2e"
  filet: "rgba(19,26,46,0.09)"
  filet-franc: "rgba(19,26,46,0.18)"
  survol: "rgba(19,26,46,0.045)"
  encre: "#131a2e"
  encre-seconde: "#414c68"
  encre-tierce: "#646f8c"
  marque-cyan: "#00d8ff"
  marque-bleu: "#2f6bff"
  marque-violet: "#8b5cff"
  marque-magenta: "#ff5cf4"
  etat-antenne: "#10b981"
  etat-antenne-encre: "#067a55"
  etat-attente: "#f59e0b"
  etat-attente-encre: "#96590a"
  etat-alerte: "#ef4444"
  etat-alerte-encre: "#c2183c"
  etat-production: "#06a9d6"
  etat-production-encre: "#0a6c8f"
  etat-relecture: "#7c4dff"
  etat-relecture-encre: "#5b2fd6"
  etat-dormant: "#94a3b8"
  etat-dormant-encre: "#5e6a85"
  serie-1: "#2fa9c9"
  serie-2: "#9e2e86"
  serie-3: "#c98a16"
  serie-4: "#5b37c0"
  rail-sombre: "#131a2e"
  rail-sombre-surface: "#1a2136"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Poppins, sans-serif"
    fontSize: "54px"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.035em"
  display-sm:
    fontFamily: "Bricolage Grotesque, Poppins, sans-serif"
    fontSize: "38px"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Poppins, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline-sm:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "23px"
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
    fontWeight: 400
    lineHeight: 1.6
  body-dense:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  body-meta:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.45
  chiffre:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "36px"
    fontWeight: 500
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  chiffre-sm:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "30px"
    fontWeight: 500
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  mesure:
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
    letterSpacing: "0.12em"
  etiquette-xs:
    fontFamily: "Azeret Mono, ui-monospace, Consolas, monospace"
    fontSize: "9.5px"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  pastille: "999px"
  carte: "14px"
  champ: "10px"
  menu: "8px"
spacing:
  serre: "8px"
  cellule: "14px"
  bloc: "20px"
  section: "24px"
  rang: "48px"
components:
  bouton-cle:
    backgroundColor: "{colors.marque-bleu}"
    textColor: "#0b1020"
    typography: "{typography.etiquette}"
    rounded: "{rounded.pastille}"
    padding: "0 14px"
    height: "36px"
  bouton-sobre:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.encre}"
    typography: "{typography.etiquette}"
    rounded: "{rounded.pastille}"
    padding: "0 14px"
    height: "36px"
  bouton-sobre-hover:
    backgroundColor: "{colors.surface-creux}"
    textColor: "{colors.encre}"
  champ:
    backgroundColor: "{colors.surface-creux}"
    textColor: "{colors.encre}"
    typography: "{typography.body}"
    rounded: "{rounded.champ}"
    padding: "9px 12px"
  pastille-etat:
    backgroundColor: "{colors.surface-enfonce}"
    textColor: "{colors.encre-seconde}"
    typography: "{typography.etiquette-xs}"
    rounded: "{rounded.pastille}"
    padding: "0 9px"
    height: "23px"
  panneau:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.encre}"
    rounded: "{rounded.carte}"
    padding: "20px"
  lentille:
    backgroundColor: "transparent"
    textColor: "{colors.encre-seconde}"
    rounded: "{rounded.pastille}"
    padding: "9px 12px"
  lentille-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.rail-sombre}"
  ligne-conduite:
    backgroundColor: "transparent"
    textColor: "{colors.encre}"
    height: "48px"
  ligne-conduite-hover:
    backgroundColor: "{colors.survol}"
---

# Design System: Line Up — Conduite

## Overview

**Creative North Star : « La conduite, en plein jour »**

Line Up est une agence dont le nom est un terme de plateau : la *line-up*, c'est la conduite
d'antenne, l'ordre de passage d'une émission. Le produit garde cet objet — une seule ligne
ordonnée par heure de diffusion, de la demande du client au post publié — mais il le sort de
la régie sombre pour le poser en plein jour, sur du papier froid, en cartes blanches arrondies.
Les autres écrans ne sont pas d'autres applications : ce sont des lentilles posées sur la même ligne.

La page s'ouvre sur un bandeau qui dit l'état de l'antenne en une seconde : un aplat du dégradé
de marque porte le compte à rebours de la prochaine diffusion, trois cartes teintées portent ce
qui demande une décision. Sous lui, la ligne du jour, en rangs de 48 px : heure, état, objet,
réseaux, échéance. Le rail de navigation, lui, reste sombre — c'est le seul aplat profond de
l'interface, et il encadre le plan de travail clair.

Tout ce qui se mesure — heure, compte à rebours, slug, compteur, montant — est en Azeret Mono
tabulaire ; tout ce qui se lit est en Poppins. La bascule typographique reste le repère de lecture
principal. Le titre des pages d'accueil, lui, passe en Bricolage Grotesque : la seule voix
d'affichage du système, réservée aux génériques.

**Key Characteristics :**
- Une conduite ordonnée par heure de diffusion, ouverte par un bandeau qui dit l'antenne.
- Cartes blanches arrondies à 14 px sur papier froid, ombres douces, jamais de bordure lourde.
- Navigation en pastilles ; le rail de navigation est sombre, tout le reste est clair.
- Pastille d'état vive doublée d'un libellé à son encre — jamais la couleur seule.
- Le dégradé de marque porte le bandeau, l'action clé et les jauges. Rien d'autre.
- Monospace pour la mesure, Poppins pour la prose, Bricolage Grotesque pour les génériques.

## Colors

Un papier froid, des cartes blanches, six couleurs d'état à deux niveaux, et un dégradé de
marque tenu pour le signal.

### Primary
- **Dégradé de marque** (`#00d8ff → #2f6bff → #8b5cff → #ff5cf4`) : l'action clé, les jauges de
  forfait, le repère « aujourd'hui ». Sur du texte, jamais.
- **Dégradé profond** (`#0b7fa8 → #2f4fd8 → #6b3ad6 → #b8309e`) : la seule variante sur laquelle
  du texte blanc reste lisible. Elle porte les bandeaux.

### Secondary — les états (réservés)
Chaque état a deux valeurs : la **vive** pour les formes (pastille, rail, jauge, marque de graphique),
l'**encre** pour le texte, plus sombre, qui tient le contraste sur blanc.
- **Antenne** `#10b981` / encre `#067a55` : prêt, publié, validé, dans les délais.
- **Attente** `#f59e0b` / encre `#96590a` : la balle est chez le client.
- **Alerte** `#ef4444` / encre `#c2183c` : retard, publication tombée, liaison rompue, refus.
- **Production** `#06a9d6` / encre `#0a6c8f` : en cours chez Line Up.
- **Relecture** `#7c4dff` / encre `#5b2fd6` : chiffrage, relecture interne.
- **Dormant** `#94a3b8` / encre `#5e6a85` : brief non découpé, colonne vide.

### Neutral
- **Papier** `#eef1f8` : fond de l'application. **Surface** `#ffffff` : cartes, barres, panneaux.
- **Creux** `#f6f8fd` : champs, en-têtes de tableau. **Enfoncé** `#e8ecf6` : pistes de jauge.
- **Encre solide** `#131a2e` : le rail de navigation, et l'aplat des pastilles actives.
- **Encre** `#131a2e` / **seconde** `#414c68` / **tierce** `#646f8c` (4,9:1 sur blanc).

### Séries de données
- **Série 1 à 4** (`#2fa9c9`, `#9e2e86`, `#c98a16`, `#5b37c0`) : palette catégorielle assignée dans
  un ordre fixe, validée en mode clair (bande de clarté OKLCH, plancher de chroma, séparation
  deutan/protan, contraste). Deux des quatre passent sous 3:1 sur blanc : c'est admis parce que
  chaque graphique porte une légende écrite et un tableau de repli.
- **Rampe ordinale** (`#c9e8f2` → `#134f64`, 7 pas) : une seule teinte à clarté décroissante, pour
  les séquences ordonnées.

### Named Rules
**La règle du signal.** Le dégradé de marque ne sert qu'à trois usages : le bandeau d'antenne,
l'action clé d'un écran, et les jauges de consommation. Il n'habille jamais un titre, une bordure
ni un fond de panneau.

**La règle de l'état doublé.** Un état se lit sans couleur. Chaque pastille est accompagnée d'un
libellé ; chaque rail de 3 px est doublé de cette pastille.

**La règle des deux encres.** Une couleur d'état ne devient jamais du texte telle quelle : le texte
prend sa variante encre, plus sombre, qui tient 4,5:1 sur blanc.

**La règle des couleurs réservées.** Les six couleurs d'état ne sont jamais réemployées comme
couleurs de série, et les quatre couleurs de série ne signalent jamais un état.

## Typography

**Affichage :** Bricolage Grotesque (800 / 600) — les génériques uniquement.
**Lecture :** Poppins. **Mesure :** Azeret Mono, chiffres tabulaires.
Les trois sont embarquées en base64 dans `demo/css/fonts.css` : la maquette doit charger depuis
`file://`, sans serveur ni réseau.

### Hierarchy
- **Display** (800, 38–54 px, −0.035em) : titre des pages d'entrée et de la vue mobile.
- **Headline** (600, 28 px) : titre de porte sur les génériques ; (400, 23 px) titre d'écran applicatif.
- **Title** (400, 15–17 px) : titre de panneau, titre de tiroir.
- **Body** (400, 12,5–13 px) : brief, message, légende. Mesure ≤ 74ch.
- **Chiffre** (500, 30–36 px, tabulaire) : valeur du bandeau et des cartes de suivi.
- **Mesure** (400, 10,5–11 px, tabulaire) : heure, date, slug, compteur, montant en ligne.
- **Étiquette** (500, 9,5–10 px, 0.12em, capitales) : nom de champ, de colonne, de section.

### Named Rules
**La règle de la bascule.** Si la valeur se compte, se compare ou s'aligne en colonne, elle est en
Azeret Mono tabulaire. Sinon elle est en Poppins.

**La règle du générique.** Bricolage Grotesque ne sort jamais des pages d'entrée. Dans
l'application, la voix d'affichage n'existe pas : la hiérarchie tient à la taille et à la densité.

**La règle de l'objet d'abord.** Dans une ligne de conduite, le titre humain vient en premier ;
le slug, le compte et l'avancement descendent sur la ligne de métadonnée.

## Layout

**Régie (agence)** : hauteur d'écran fixe. Rail de lentilles sombre de 222 px à gauche (tiroir sous
1024 px), barre d'action blanche en haut, bandeau de suivi, puis la conduite dans une carte
blanche. Colonne des décisions de 356 px à droite, claire, qui disparaît sous 1280 px.

**Espace client** : page qui défile, en-tête collant translucide, onglets en pastilles, contenu
centré à 1000–1240 px.

**La ligne de conduite** tient en quatre colonnes : `56px | 116px | 1fr | 72px | 150px` —
heure, état, objet, réseaux, bloc de droite. Sous 768 px, réseaux et jauge s'effacent.

**Rythme** : rang à 48 px, gouttière de cellule 14 px, bloc 20 px, section 24 px, cartes espacées
de 16–20 px. Toujours plus d'espace au-dessus d'un titre qu'en dessous.

**Ruptures** : 640 px (sm), 768 px (md), 1024 px (lg — le rail apparaît), 1280 px (xl — la colonne
des décisions apparaît).

## Elevation & Depth

La profondeur vient de deux choses : la carte blanche posée sur le papier froid, et une ombre
douce. Pas de bordure épaisse, pas d'ombre dure.

### Shadow Vocabulary
- **Carte** (`0 1px 2px rgba(19,26,46,.05), 0 10px 26px -14px rgba(19,26,46,.22)`) : tout panneau.
- **Flottant** (`0 12px 24px -8px rgba(19,26,46,.14), 0 32px 64px -24px rgba(19,26,46,.28)`) :
  tiroir latéral et notifications.
- **Bandeau** (`0 10px 30px -12px rgba(43,34,120,.55)`) : l'ombre colorée sous l'aplat de marque.
- **Diode d'état** (`0 0 0 3px <état à 20 %>`) : anneau autour d'une pastille ; sur une alerte, il
  respire entre 3 et 7 px.

### Named Rules
**La règle de l'ombre portée.** Toute ombre a un décalage et un flou. Un halo centré n'est admis
que sur une pastille d'état, où il joue une diode et non une élévation.

## Shapes

Pastille (999px) pour tout ce qui se clique ou s'étiquette : boutons, onglets, lentilles, chips,
jauges. Carte à 14 px pour les surfaces, champ à 10 px. Rien entre les deux.

Le rail d'état est la forme signature : une barre de 3 px arrondie au bord droit, collée au bord
gauche d'un rang ou d'une carte, jamais épaissie, jamais posée à droite. Les sous-tâches se
décrochent par un filet de filiation en L arrondi.

## Components

### Boutons
- Pastille, 36 px (28 px en version courte), libellé mono 10,5 px capitales.
- **Clé :** dégradé de marque, texte `#0b1020`, ombre bleue portée. Un seul par écran.
- **Sobre :** blanc, filet 1 px ; survol : filet renforcé + fond creux.
- **Sombre :** aplat `#131a2e`, texte blanc — pour les actions de second rang sur fond clair.
- Sous 640 px, l'action principale d'une carte de décision prend toute la largeur.

### Pastilles d'état
Aplat teinté à 14–18 % de la couleur d'état sur le fond courant, texte à l'encre de l'état, diode
de 7 px. Le fond de teinte suit `--chip-base`, ce qui les rend justes aussi dans le rail sombre.

### Panneaux et cartes
Blanc, filet 1 px, rayon 14 px, ombre de carte. Une carte posée dans un panneau descend d'une
valeur au lieu de se soulever. Pas de carte dans une carte.

### Navigation
- **Rail (sombre)** : pastilles, actif = aplat blanc à texte sombre.
- **Onglets (clair)** : pastilles, actif = aplat `#131a2e` à texte blanc.

### Le bandeau de conduite (composant signature)
Un aplat du dégradé profond porte le compte à rebours de la prochaine diffusion ; trois cartes
teintées à 11 % d'une couleur d'état portent les retards, ce qui est chez le client, et l'antenne
du jour. Ce n'est pas une rangée de tuiles neutres : chaque carte est teintée de l'état qu'elle
mesure et mène à l'écran qui la traite.

### La zone sombre
`.zone-sombre` ne redéfinit que des jetons — surfaces, filets, encres, encres d'état. Tous les
composants la suivent sans être réécrits. Les jetons Tailwind pointent eux aussi sur les variables
CSS, sans quoi le texte resterait sombre sur sombre.

### Graphiques
Chart.js, légende écrite en HTML dès deux séries, tableau de repli dépliable sous chaque
graphique. Grille à 8 % d'encre, axes sans bordure, marques fines, rayon 3 px sur les barres,
écart de 2 px entre segments empilés. Jamais deux échelles verticales.

## Do's and Don'ts

### Do :
- **Do** ouvrir la conduite par le bandeau d'antenne, puis la ligne.
- **Do** doubler chaque couleur d'état d'un libellé, et prendre l'encre de l'état pour le texte.
- **Do** écrire en Azeret Mono tabulaire tout ce qui se compte ou s'aligne.
- **Do** garder le dégradé de marque pour le bandeau, l'action clé et les jauges.
- **Do** mettre le titre humain en premier dans une ligne, le technique en métadonnée.
- **Do** passer par des jetons CSS pour toute couleur, y compris dans les classes Tailwind.
- **Do** fournir légende et tableau de repli sous chaque graphique.

### Don't :
- **Don't** écrire un compte à rebours au format hh:mm.
- **Don't** teinter le portail client aux couleurs du compte : il porte l'identité Line Up.
- **Don't** poser une étiquette monospace en surtitre au-dessus d'un titre.
- **Don't** appliquer le dégradé de marque à du texte ou à une bordure.
- **Don't** sortir Bricolage Grotesque des pages d'entrée.
- **Don't** réemployer une couleur d'état comme couleur de série, ni l'inverse.
- **Don't** imbriquer une carte dans une carte.
- **Don't** animer une largeur ou une hauteur : les jauges se remplissent par `transform: scaleX`.
- **Don't** dépasser quatre séries catégorielles.
