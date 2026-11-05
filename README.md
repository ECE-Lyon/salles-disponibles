# Salles Citadelle

Application Windows et Mac qui affiche les salles disponibles du campus Citadelle.
Une fois installée, elle ne demande ni Node.js ni autre logiciel.

## Essayer sur son poste (Node.js requis pour le développement seulement)

    npm install
    npm start        # avec le vrai planning
    npm run demo     # avec des données d'exemple

## Créer les installateurs

Le plus simple : mettre le projet sur GitHub, puis lancer le workflow **Installateurs** depuis l'onglet **Actions**.
Il produit un `.exe` pour Windows et un `.dmg` pour Mac.

Sur son poste : `npm run dist:win` sur un PC Windows, `npm run dist:mac` sur un Mac. Les fichiers arrivent dans `dist/`.

## Première ouverture (application non signée)

- **Windows :** sur l'avertissement SmartScreen, cliquer sur « Informations complémentaires », puis « Exécuter quand même ».
- **Mac :** ouvrir l'application une fois, puis aller dans Réglages Système > Confidentialité et sécurité et cliquer sur « Ouvrir quand même ».
  Si macOS indique que l'application est endommagée, lancer dans le Terminal :
  `xattr -cr "/Applications/Salles Citadelle.app"`

## Réglages et diagnostic

- Créneaux et durée maximale d'une pause : constantes `CRENEAUX` et `PAUSE_MAX` dans `src/index.html`.
- Menu **Affichage > Outils de diagnostic** : la console signale les salles du planning absentes de la liste.
