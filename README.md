# Site de mariage — 08 / 07 / 2027

Site une page, statique (HTML / CSS / JS, sans dépendance), avec :

- l’accueil (prénoms, photo, date, compte à rebours),
- le programme : **Mairie**, **Soirée**, **Brunch** du lendemain,
- les informations pratiques (hébergement, accès, dress code, cadeaux),
- un formulaire de réponse (présence à la mairie, à la soirée et au brunch, nombre de personnes, régime alimentaire, message).

Charte : ivoire, bordeaux, terracotta, abricot et pêche, reprise du save the date et du moodboard floral ; typographies Cormorant Garamond, Pinyon Script et Jost.

## Personnaliser

Tous les textes à compléter sont repérés par un commentaire `✏️` dans `index.html` :
prénoms et initiales, ville, horaires, lieux et adresses (+ liens Google Maps), date limite de réponse, e-mail de contact.

Dans `script.js`, bloc `CONFIG` :

| Clé | Rôle |
| --- | --- |
| `weddingDate` | date/heure utilisée par le compte à rebours |
| `endpoint` | URL du Google Apps Script qui enregistre les réponses |
| `fallbackEmail` | si `endpoint` est vide, la réponse s’ouvre dans la messagerie de l’invité, adressée à cet e-mail |

## Recevoir les réponses dans une Google Sheet (gratuit)

1. Créer une Google Sheet vide.
2. Menu **Extensions → Apps Script**, coller le contenu de `apps-script/Code.gs`, enregistrer.
   (Optionnel : renseigner `NOTIFY_EMAIL` pour être prévenu à chaque réponse.)
3. **Déployer → Nouveau déploiement → Application Web** :
   - Exécuter en tant que : *Moi*
   - Qui a accès : *Tout le monde*
4. Autoriser l’accès, copier l’URL obtenue (`https://script.google.com/macros/s/…/exec`) et la coller dans `CONFIG.endpoint`.

Chaque réponse ajoute une ligne dans l’onglet « Réponses ».

## Mettre en ligne

Le site est statique : GitHub Pages (Settings → Pages → branche + dossier racine), Netlify ou Vercel fonctionnent directement.

Pour le tester en local : `python3 -m http.server` puis http://localhost:8000.
