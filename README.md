# Salles Citadelle

Page d'affichage des salles disponibles du campus Citadelle.

    node server.js

Puis ouvrir http://localhost:3000 en plein écran sur l'écran d'affichage (Node 18 ou plus, aucune dépendance).
Pour changer de port : `PORT=8080 node server.js`.

- `http://localhost:3000/#demo` affiche des données d'exemple.
- Créneaux et durée maximale d'une pause : constantes `CRENEAUX` et `PAUSE_MAX` dans `public/index.html`.
- Une salle du planning absente de la liste est signalée dans la console du navigateur.
