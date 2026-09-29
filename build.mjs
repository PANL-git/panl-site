// Génère le site PANL à partir de content/site.json (édité via Pages CMS).
// Sortie : dist/ (index.html, mentions-legales.html, static/, media/). Aucune dépendance.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";

const c = JSON.parse(readFileSync("content/site.json", "utf8"));
const alertes = [];

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Un titre qui finit par un point reçoit le point orange de la marque.
const titre = (s = "") => {
  const t = String(s).trim();
  return t.endsWith(".") ? `${esc(t.slice(0, -1))}<span class="point">.</span>` : esc(t);
};

const media = (chemin = "") => (chemin.startsWith("/") ? chemin : `/${chemin}`);
const logo = (cls = "", attrs = "") =>
  `<span class="logo ${cls}" ${attrs}><i class="bar b1"></i><span class="mot"><span class="pa">pan</span><i class="dot"></i><span class="L">L</span></span><i class="bar b2"></i></span>`;

const email = c.contact.email.trim();
const lienCarrieres = c.carrieres.lien.trim() || `mailto:${email}?subject=${encodeURIComponent("Candidature")}`;
const linkedin = c.contact.linkedin.trim();

const tete = (titrePage, description) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titrePage)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(titrePage)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/static/fonts/Carlito-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/static/fonts.css">
<link rel="stylesheet" href="/static/style.css">
<script>document.documentElement.classList.add("js")</script>
</head>`;

const entete = (accueil) => {
  const a = accueil ? "" : "/";
  return `<header${accueil ? "" : ' class="plein"'}>
  <div class="wrap">
    <a href="/" class="logo-lien" aria-label="PANL, accueil">${logo()}</a>
    <nav>
      <a href="${a}#expertises">Expertises</a>
      <a href="${a}#expertises">Secteurs</a>
      <a href="${a}#groupe">Groupe</a>
      <a href="${a}#carrieres">Carrières</a>
      <a href="${a}#contact" class="btn btn-orange">Contact</a>
    </nav>
  </div>
</header>`;
};

const pied = () => `<footer>
  <div class="wrap">
    <a href="/" class="logo-lien" aria-label="PANL">${logo()}</a>
    <nav><a href="/#expertises">Expertises</a><a href="/#groupe">Groupe</a><a href="/#carrieres">Carrières</a>${
      linkedin ? `<a href="${esc(linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""
    }<a href="/mentions-legales.html">Mentions légales</a></nav>
    <span>© ${new Date().getFullYear()} PANL</span>
  </div>
</footer>`;

// ---------- Accueil ----------
const chiffres = c.chiffres
  .map((ch, i) => {
    const num = /^\d+$/.test(ch.valeur.trim());
    const valeur = num ? `<span class="compte" data-n="${ch.valeur.trim()}">${esc(ch.valeur)}</span>` : esc(ch.valeur);
    return `    <div class="chiffre rv" style="--i:${i}"><b>${ch.avant ? `<i>${esc(ch.avant)}</i>` : ""}${valeur}${
      ch.apres ? `<i>${esc(ch.apres)}</i>` : ""
    }</b><span>${esc(ch.libelle)}</span></div>`;
  })
  .join("\n");

const volets = c.secteurs.liste
  .map(
    (s, i) => `      <article class="volet${i === 0 ? " ouvert" : ""}" tabindex="0">
        <img src="${esc(media(s.image))}" alt="${esc(s.description_image)}" loading="lazy">
        <div class="volet-texte">
          <h3>${esc(s.titre)}</h3>
          <div class="detail"><p>${esc(s.texte)}</p>${
            s.lien.trim() ? `<a href="${esc(s.lien)}">En savoir plus <span class="fleche">→</span></a>` : ""
          }</div>
        </div>
      </article>`
  )
  .join("\n");

const piste = (cache) =>
  c.engagements.map((e) => `<span${cache ? ' aria-hidden="true"' : ""}>${esc(e)}</span>`).join("");

const accueil = `${tete(c.referencement.titre, c.referencement.description)}
<body>

<div class="intro" aria-hidden="true">
  ${logo()}
  <span class="base">${esc(c.signature)}</span>
</div>

${entete(true)}

<main>
<section class="hero">
  <div class="hero-photo"><img src="${esc(media(c.hero.image))}" alt="" fetchpriority="high"></div>
  <div class="wrap">
    <h1 class="rv">${titre(c.hero.titre)}</h1>
    <div class="hero-bas">
      <p class="rv" style="--i:1">${esc(c.hero.texte)}</p>
      <div class="ctas rv" style="--i:2">
        <a href="#expertises" class="btn btn-orange">${esc(c.hero.bouton_principal)} <span class="fleche">→</span></a>
        <a href="#carrieres" class="btn btn-contour">${esc(c.hero.bouton_secondaire)}</a>
      </div>
    </div>
  </div>
</section>

<section class="chiffres" aria-label="Chiffres clés">
  <div class="wrap">
${chiffres}
  </div>
</section>

<section class="secteurs" id="expertises">
  <div class="wrap">
    <h2 class="rv">${titre(c.secteurs.titre)}</h2>
    <div class="accordeon rv" style="--i:1">
${volets}
    </div>
  </div>
</section>

<section class="manifeste" id="groupe">
  <div class="wrap">
    <div class="signe rv" aria-hidden="true"><i></i><b></b><i></i></div>
    <div>
      <h2 class="rv">${titre(c.manifeste.titre)}</h2>
      <p class="rv" style="--i:1">${esc(c.manifeste.texte)}</p>
    </div>
  </div>
</section>

<section class="messages" aria-label="Nos engagements">
  <div class="piste">${piste(false)}${piste(true)}</div>
</section>

<section class="carrieres" id="carrieres">
  <div class="wrap">
    <div class="carrieres-photo rv"><img src="${esc(media(c.carrieres.image))}" alt="" loading="lazy"></div>
    <div>
      <h2 class="rv">${titre(c.carrieres.titre)}</h2>
      <p class="rv" style="--i:1">${esc(c.carrieres.texte)}</p>
      <a href="${esc(lienCarrieres)}" class="btn btn-orange rv" style="--i:2">${esc(c.carrieres.bouton)} <span class="fleche">→</span></a>
    </div>
  </div>
</section>

<section class="contact" id="contact">
  <div class="wrap">
    <p class="rv">${esc(c.contact.accroche)}</p>
    <a href="mailto:${esc(email)}" class="mail rv" style="--i:1">${esc(email)} <span class="fleche">→</span></a>
  </div>
</section>
</main>

${pied()}

<script src="/static/site.js"></script>
</body>
</html>
`;

// ---------- Mentions légales ----------
const ml = c.mentions_legales;
const ligne = (libelle, valeur) => (valeur && valeur.trim() ? `<dt>${libelle}</dt><dd>${esc(valeur)}</dd>` : "");
for (const [cle, libelle] of [["editeur", "Éditeur"], ["siege", "Siège social"], ["rcs_siren", "RCS / SIREN"], ["directeur_publication", "Directeur de la publication"]]) {
  if (!ml[cle] || !ml[cle].trim()) alertes.push(`Mentions légales : « ${libelle} » est vide (obligatoire, loi LCEN).`);
}

const mentions = `${tete("Mentions légales | PANL", "Mentions légales du site panl.fr")}
<body class="page-simple">
${entete(false)}
<main class="legal">
  <div class="wrap">
    <h1>Mentions légales<span class="point">.</span></h1>
    <h2>Éditeur du site</h2>
    <dl>
      ${ligne("Raison sociale", ml.editeur)}
      ${ligne("Forme et capital", ml.forme_et_capital)}
      ${ligne("Siège social", ml.siege)}
      ${ligne("RCS / SIREN", ml.rcs_siren)}
      ${ligne("TVA intracommunautaire", ml.tva)}
      ${ligne("Directeur de la publication", ml.directeur_publication)}
      ${ligne("Téléphone", ml.telephone)}
      ${ligne("E-mail", email)}
    </dl>
    <h2>Hébergement</h2>
    <dl>${ligne("Hébergeur", ml.hebergeur)}</dl>
    <h2>Données personnelles</h2>
    <p>Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure d'audience. Les messages envoyés à ${esc(email)} servent uniquement à répondre à votre demande. Pour exercer vos droits d'accès, de rectification ou de suppression, écrivez à cette même adresse.</p>
    ${ml.credits_photos && ml.credits_photos.trim() ? `<h2>Crédits photographiques</h2>\n    <p>${esc(ml.credits_photos)}</p>` : ""}
  </div>
</main>
${pied()}
<script src="/static/site.js"></script>
</body>
</html>
`;

// ---------- Écriture ----------
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", accueil);
writeFileSync("dist/mentions-legales.html", mentions);
cpSync("static", "dist/static", { recursive: true });
if (existsSync("media")) cpSync("media", "dist/media", { recursive: true });
writeFileSync("dist/robots.txt", "User-agent: *\nAllow: /\nSitemap: https://panl.fr/sitemap.xml\n");
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://panl.fr/</loc></url><url><loc>https://panl.fr/mentions-legales.html</loc></url></urlset>\n`
);

// Images référencées mais absentes : on échoue, pour ne jamais publier une image cassée.
const images = [c.hero.image, c.carrieres.image, ...c.secteurs.liste.map((s) => s.image)];
const manquantes = images.filter((i) => !existsSync(`dist${media(i)}`));
if (manquantes.length) {
  console.error("Images introuvables :", manquantes.join(", "));
  process.exit(1);
}

alertes.forEach((a) => console.warn("Attention :", a));
console.log("Site généré dans dist/ (accueil + mentions légales).");
