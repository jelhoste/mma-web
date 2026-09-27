# MMA dans le navigateur

Portage du vrai moteur MMA (Musical MIDI Accompaniment, GPL-2+, Bob van der Poel)
pour qu'il tourne entièrement côté client, via Pyodide (CPython compilé en
WebAssembly). Aucune réimplémentation : c'est le même code Python que la
version installée en ligne de commande, avec toute sa bibliothèque de styles
(dossier `usr/share/mma/`, copié tel quel depuis une installation MMA réelle).

## Déployer sur GitHub Pages

1. Crée un nouveau dépôt GitHub (public, pour Pages gratuit).
2. Place tout le contenu de ce dossier à la racine du dépôt.
3. Commit + push.
4. Dans les paramètres du dépôt → *Pages* → *Source* : choisis la branche
   principale et le dossier `/ (root)`.
5. Attends une minute, l'URL fournie par GitHub sert directement `index.html`.

Aucune étape de build : ce sont des fichiers statiques.

## Ce qui a été vérifié avant ce port

- Le moteur (`MMA/*.py`) est du Python pur, aucune extension C — compatible
  Pyodide de base.
- J'ai réellement exécuté MMA en ligne de commande (installation locale) sur
  une grille de test, et vérifié en décodant le MIDI produit que les voicings
  de piano et le mécanisme `Walk` (walking bass) fonctionnaient comme attendu.
- Les fichiers `.mmaDB` (bases qui associent un nom de groove à son fichier de
  définition, pour pouvoir écrire juste `Groove NomDuStyle`) contiennent des
  chemins absolus. Pour que ça fonctionne sans les régénérer, l'arborescence
  virtuelle recrée exactement les mêmes chemins que l'installation d'origine
  (`/usr/share/mma/...`).

## Limite honnête de ce livrable

Je n'ai **pas pu tester la partie navigateur elle-même** (chargement de
Pyodide, écriture dans son système de fichiers virtuel, exécution du moteur
dans ce contexte) : mon environnement de développement n'a pas accès à un
navigateur ni aux domaines CDN utilisés (`cdn.jsdelivr.net`,
`cdnjs.cloudflare.com`). Tout ce qui touche à l'exécution réelle de MMA
(analyse des accords, génération du MIDI, algorithmes de voicing/walking
bass) a été vérifié en conditions réelles ; l'intégration Pyodide, elle,
repose sur une lecture attentive du code source de MMA (`mma.py`, `gbl.py`,
`options.py`, `main.py`, `paths.py`) mais n'a pas tourné devant moi.

Si quelque chose ne fonctionne pas au premier essai : ouvre la console du
navigateur (F12), et montre-moi le message d'erreur — je pourrai corriger
directement.

## Fonctionnement en bref

- `index.html` charge Pyodide, copie `usr/share/mma/` dans son système de
  fichiers virtuel (liste dans `file-manifest.json`), puis écrit ta grille
  d'accords dans un fichier `.mma` et appelle `MMA.main` exactement comme le
  ferait la commande `mma -f sortie.mid entree.mma`.
- Le MIDI généré est ensuite décodé par un petit analyseur MIDI (inclus dans
  la page) pour en tirer une partition affichée avec abcjs. Le fichier MIDI
  original reste téléchargeable tel quel.
- `service-worker.js` met tout en cache (app + MMA + bibliothèques CDN) pour
  un usage hors-ligne après le premier chargement.
