# panl.fr

Site vitrine PANL. Contenu éditable sans code via [Pages CMS](https://app.pagescms.org).

- `content/site.json` : tous les textes, chiffres et chemins d'images (édité par le CMS).
- `media/` : photos (téléversées par le CMS).
- `static/` : style, script, polices, favicon.
- `build.mjs` : génère `dist/` (aucune dépendance). `node build.mjs` en local.
- `.pages.yml` : formulaire du CMS.

Publication : Netlify reconstruit le site à chaque commit sur `main`.
Le build échoue si une image référencée est absente, et signale les mentions légales obligatoires encore vides.
