# Jemifier

Ce projet a été créé pour améliorer le très bon site jemaf.fr pour chercher et choisir les chants du JEM.
Une partie importante est le lien avec les chants choisis les autres dimanches.
Pour ceci, jemifier peut importer les fichiers XMLs créés par le logiciel utilisé par la
chapelle de Chavannes.

Jemifier est un site web statique. 
Ca veut dire qu'on peut le mettre sur un serveur très simple, et qu'on n'a pas besoin d'ajouter un
"backend server" pour une API.
Au démarrage, le client reçoit toutes les informations: les chants et les listes des chants des différents
cultes.
Après c'est le client qui va faire le tri.
L'avantage est que c'est plus rapide, que le serveur n'apprend rien sur les clients, et que le serveur
peut rester bien plus simple.

## Démarrage

Pour un démarrage local, il faut installer [devbox](https://www.jetpack.io/devbox) et puis lancer
le serveur ainsi:

```bash
devbox run start
```

L'utilisation de `devbox` permet d'utiliser la bonne version de `bun`.

## Développement

Si vous voulez participer au développement, il est plus facile de faire comme suite:

```bash
devbox shell --pure
```

Et puis vous pouvez utiliser les commandes comme `bun install package_name` et autres pour
faire du développement.

# TODO

- find why the text of the buttons and checkboxes are so small
- faire des listes de chants
  - Pick list from old lists, duplicate, create new, ...
  - Send link to list
  - exporter des listes de chants en PDF
- ajouter des liens sur jemaf.fr et/ou youtube
- on ne peut pas revenir sur une recherche - ajouter un "?search=text" dans l'URL
- quelques chants n'ont pas de mots clés, p.e. 338, 339
- merger "dates" et "dates/:date" pour éviter un rechargement de la page
- bien traduire tout l'interface
- éditer les paroles des chants
- mettre sur github ou fledg.re d'une façon automatisée, surtout pour l'intégration des listes des cultes

# CHANGELOG

2024-08-18:
- faire des listes de chants
  - Pick list from old lists, duplicate, create new, ...

2024-08-12:
- add youtube search: https://www.youtube.com/results?search_query=Chef%20couvert%20de%20blessures.%20-%20Hans%20Leo%20Hassler%20-%20af%20100

2024-08-04:
- bug: storage doesn't work anymore
- faire des listes de chants et les exporter
  - Choose song from /song/JEM-xxxx
  - Also do a markov-chain on past services and let the user choose what they want to see
  - Store current list in localStorage
  - fix UI bug when showing the songs (too squeezed vertically)

2024-07-15:
  - Song 1004 has no title

2024-06-22:
- ajouter une page pour le compositeur, comme pour les dates et les mots clés

2024-06-17:
- chercher: faire que plusieurs mots justes sont montrés d'abord
- ajouter le compositeur

2024-04-03:
- bug: si on clique sur le "x" de la recherche, la page se recharge
- améliorer les résultats des recherches
  - recherche: faire des morceaux plus petits pour être plus rapide
  - en cherchant plusieurs mots séparés par des espaces en AND
  - trouvant "l'esprit" si on entre "esprit"
  = modifier la recherche: ListSongs.search(str: string, start: number, end: number): SearchResult[]
    - SearchResult{ song: Song, match: number}
    - `match` est 4 pour un match numéro, 3 pour un match keyword, 2 pour un match titre, 1 pour un match texte

2024-04-02:
- update keywords
- UI responsiveness
  - dates: afficher petit à petit
  - dates: quand on quitte, revenir en haut

2024-03-24:
- CSS pour téléphones mobiles

2024-03-19:
- mettre le tab et/ou le # du chant dans le titre
- plusieurs petites améliorations
  - utiliser song-entry partout
  - mise à jour correcte des dates
  - montrer "loading" jusqu'à ce que tous les données sont chargées
  - augmenter la taille des mots clés, et éviter qu'ils se cassent
  - avoir le livre et # de chants dans l'URL des "/song"

2024-03-18:
- améliorer la recherche en cherchant les lyrics seulement par groupe de 200 chants
- augmenter la vitesse de la recherche en montrant d'abord les titres des chants, puis les mots clés, et finalement
les contenus des chants
- faire un composant pour afficher une liste de chants
- utiliser le composant "app-song-list" pour la recherche

2024-03-16:
- faire un composant pour afficher une entrée de chant
