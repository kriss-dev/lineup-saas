# Maquette — logiciel d'agence Line Up

Démonstration cliquable, sans installation ni serveur.
**Double-cliquez sur `index.html`.** Tout est embarqué : Tailwind, Chart.js, les deux polices
(Poppins, Azeret Mono, en base64) et les logos. Ça tourne hors ligne, sur n'importe quel portable.

## Les deux portes

| Fichier | Ce que c'est |
|---|---|
| `index.html` | Écran d'entrée de la démo : le choix entre les deux applications. |
| `agence.html` | **La régie** — le poste de pilotage de Line Up (9 écrans). |
| `client.html` | **L'espace client** — ce que voit Papi Ours ou Kalpy (7 écrans). |

## Ce qui est cliquable

**Régie** — `agence.html`
- **Conduite** : la ligne du jour. Cliquez un rang de chantier pour déplier ses sous-tâches,
  « Ouvrir le chantier » pour le tiroir complet (brief, chiffrage, fichiers, fil client).
  Filtres par compte, par intervenant, horizon 3 / 7 / 14 jours, recherche par slug.
- **Pipeline** : glissez-déposez une carte d'une colonne à l'autre, l'état change.
- **Grille de diffusion** : navigation par mois, clic sur un jour, bouton « Pousser » qui simule
  l'appel API, et « Pousser toute la file prête ».
- **Comptes clients** : cliquez Papi Ours ou Kalpy pour la fiche complète (charte, cadence
  consommée, chantiers, réalisations, contacts, factures). Cliquez une couleur pour la copier.
- **Studio IA** : choisissez un compte et une occasion, puis « Générer 3 pistes ».
  Raccourci direct : `agence.html#/studio/pistes`.
- **Équipe & RH** : cinq onglets — charge, congés (valider/refuser), notes de frais
  (rembourser/refuser), rendez-vous, coffre à bulletins.
- **Facturation**, **Liaisons réseaux** (reconnecter un jeton expiré répare le chantier en échec),
  **Analytique**.
- Bouton **+ Chantier** en haut à droite : formulaire complet, le chantier créé rejoint la conduite.

**Espace client** — `client.html`
- Sélecteur **Papi Ours / Kalpy** en haut à droite pour basculer de compte.
- **Accueil** : ce qui attend une décision, en premier.
- **Nouvelle demande** : formulaire en 3 étapes, la demande apparaît ensuite dans « Mes demandes »
  et côté agence.
- **À valider** : accepter ou refuser un devis, valider une créa ou demander une modification.
- **Planning**, **Performance**, **Ma marque** (charte téléchargeable), **Factures**.

## Ce qui est vrai, ce qui ne l'est pas

Les logos de Line Up, Papi Ours et Kalpy sont authentiques. **Tout le reste est fictif** :
clients, montants, salariés, audiences, performances, factures. Aucun appel n'est émis vers
Meta, LinkedIn ou TikTok — les boutons « pousser » simulent la publication.

Les données vivent en mémoire : vos actions (glisser une carte, valider un devis, créer une
demande) sont visibles immédiatement mais **disparaissent au rechargement de la page**. C'est
volontaire : la maquette se remet à zéro pour la démonstration suivante.

Les dates sont calculées par rapport au jour d'ouverture : la conduite est toujours « vivante »,
quelle que soit la date de la démonstration.

## Structure

```
demo/
  index.html  agence.html  client.html
  css/    fonts.css (polices en base64) · lineup.css (le système visuel)
  js/     icons.js · data.js · ui.js · agence.js · client.js
  vendor/ tailwind.js · chart.umd.min.js
  assets/ logos Line Up, Papi Ours, Kalpy
```

Le jeu de données de démonstration est **entièrement** dans `js/data.js` : clients, chartes,
chantiers, sous-tâches, publications, équipe, congés, frais, factures, connexions API. Modifier
un client ou ajouter un chantier ne demande de toucher que ce fichier.

Le système visuel (couleurs, typographies, règles, composants) est documenté dans
`../DESIGN.md`, et le contexte produit dans `../PRODUCT.md`.

## Limites connues de la maquette

- Pas d'authentification, pas de base de données, pas de backend.
- Les téléchargements (bulletins, factures, fichiers, charte) sont simulés.
- Les propositions du Studio IA sont écrites à l'avance ; dans le produit, elles seraient
  générées par un modèle nourri du dossier de marque du compte, puis relues par l'équipe.
- Les graphiques utilisent des séries fixes, pas de calcul sur les données de démonstration.
