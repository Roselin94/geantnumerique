# GÉANT NUMÉRIQUE 2.0

Application web professionnelle en français : site vitrine React, API REST Express et base de données MySQL.

## Architecture

- `client/` : React, Vite, Tailwind CSS et React Router.
- `server/` : API Express, authentification JWT, validation Zod et MySQL.
- `server/database/schema.sql` : schéma relationnel et contenu éditorial de départ.
- `server/uploads/` : images téléversées pour les réalisations.

Les demandes de devis, les messages, les statistiques et les contenus gérés par l'administrateur sont persistés en base. Les routes `/api/admin` nécessitent un jeton JWT. Le premier compte administrateur se crée avec `npm run create-admin -w server`.

## Démarrage

1. Installer Node.js 20+ et MySQL 8+.
2. Créer la base et importer `server/database/schema.sql` avec un client configuré en UTF-8, par exemple `mysql --default-character-set=utf8mb4 -u <utilisateur> -p < server/database/schema.sql`.
3. Copier `server/.env.example` vers `server/.env`, puis configurer la connexion MySQL, un secret JWT aléatoire et le port.
4. Depuis la racine, exécuter `npm install`, puis `npm run create-admin -w server`.
5. Démarrer avec `npm run dev`. Vite écoute sur `http://localhost:5173`, l'API sur `http://localhost:4000`.
6. Pour un déploiement Netlify + Render, Netlify construit `client/dist` depuis `netlify.toml`; définir `VITE_API_URL` dans Netlify avec l’URL Render terminée par `/api`. Le fichier `client/public/_redirects` permet le rechargement direct des routes React.
7. Créer le service API Render depuis `render.yaml`, puis renseigner dans Render `CLIENT_ORIGIN` avec l’URL Netlify, et les paramètres `DB_*` fournis par l’hébergeur MySQL. Les secrets doivent rester dans les variables d’environnement Render, jamais dans le dépôt. Activer `DB_SSL=true` si Tbcloud l’exige.
8. Importer le schéma MySQL sur Tbcloud en UTF-8, puis créer l’administrateur dans l’environnement Render après connexion à la base (`npm run create-admin -w server`).

Les fichiers téléversés sont écrits dans `server/uploads` par défaut. Le modèle Render configure un disque persistant de 1 Go monté sur `/var/data`, avec `UPLOAD_DIR=/var/data/uploads` ; cette option peut entraîner des frais Render. Les fichiers déjà présents en local ne sont pas inclus dans le dépôt et devront être transférés ou téléversés à nouveau après la mise en ligne.

Pour héberger aussi le frontend sur Express au lieu de Netlify, construire avec `npm run build`, définir `SERVE_CLIENT=true` et démarrer avec `npm start`.

## Tests

Exécuter les tests de validation du backend avec `npm test -w server`.

Le formulaire de contact et les demandes de devis créent des enregistrements consultables dans l'administration. Pour recevoir également des courriels, ajouter un fournisseur SMTP et ses secrets à la configuration du serveur avant de brancher un transport mail.

## Sauvegarde

Sauvegarder régulièrement la base avec `mysqldump` et le contenu du dossier `server/uploads/`. Exemple : `mysqldump -u <utilisateur> -p geant_numerique > sauvegarde.sql`.

Les logiciels sont installés et activés uniquement conformément aux licences applicables. Les tarifs, coordonnées, horaires et informations cartographiques se modifient dans les paramètres administrateur.
