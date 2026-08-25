const cheerio = require('cheerio');

// Titles that must never appear, per the user's explicit exclusions.
const EXCLUDED_TITLE_KEYWORDS = [
  'caissier', 'caissière', 'hote de caisse', 'hôte de caisse', 'hôtesse de caisse',
  'préparateur de commandes', 'preparateur de commandes',
];

// Best-effort signal that a driving licence is central to the role.
// This is a heuristic on the title/snippet text only (list pages don't
// expose the full description) — it will miss some cases and
// over-flag others. Treat it as a first filter, not a guarantee.
const DRIVING_LICENCE_KEYWORDS = [
  'chauffeur', 'livreur', 'conducteur routier', 'conducteur spl', 'permis b',
  'permis c', 'permis poids lourd', 'coursier',
];

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isExcludedByTitle(titleOrSnippet) {
  const n = normalize(titleOrSnippet);
  return EXCLUDED_TITLE_KEYWORDS.some((kw) => n.includes(normalize(kw)));
}

function looksLikeDrivingLicenceRequired(titleOrSnippet) {
  const n = normalize(titleOrSnippet);
  return DRIVING_LICENCE_KEYWORDS.some((kw) => n.includes(normalize(kw)));
}

function relativeDateToISO(text, today = new Date()) {
  const n = normalize(text);
  const d = new Date(today);
  if (/aujourd.?hui/.test(n)) return d.toISOString().slice(0, 10);
  let m = n.match(/il y a (\d+) jour/);
  if (m) { d.setDate(d.getDate() - parseInt(m[1], 10)); return d.toISOString().slice(0, 10); }
  m = n.match(/il y a (\d+) semaine/);
  if (m) { d.setDate(d.getDate() - parseInt(m[1], 10) * 7); return d.toISOString().slice(0, 10); }
  if (/il y a 1 semaine/.test(n)) { d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); }
  m = n.match(/il y a (\d+) mois/);
  if (m) { d.setMonth(d.getMonth() - parseInt(m[1], 10)); return d.toISOString().slice(0, 10); }
  return null; // unknown — caller decides what to do
}

function slugFromUrl(url) {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1].replace(/[^a-z0-9-]/gi, '').slice(0, 60);
}

/**
 * Alliance Emploi: every offer is an <a href="…/offre/…"> whose visible
 * text starts with a relative date, then the town, then the title.
 * Pattern observed: "il y a 2 semaines saint-saulveRondier Et si vous…"
 */
function parseAllianceEmploi(html, today = new Date()) {
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();
  $('a[href*="/offre/"]').each((_, el) => {
    const url = $(el).attr('href');
    if (!url || seen.has(url)) return; // page repeats the link ("Voir l'offre")
    seen.add(url);
    const anchorText = $(el).text().trim().replace(/\s+/g, ' ');
    if (!anchorText) return;
    // Contract badge and sector live as sibling elements, not inside the
    // title link — read the whole container for that part.
    const containerText = $(el).closest('div, li, article').text().trim().replace(/\s+/g, ' ') || anchorText;
    const dateISO = relativeDateToISO(anchorText, today);
    const cut = anchorText.split(/Et si vous|Nous sommes à la recherche|Nous recrutons|Avec 27 ans|Au sein/)[0];
    const titleGuess = cut.replace(/^(aujourd.?hui|il y a \d+ (jour|jours|semaine|semaines|mois))\s*/i, '')
      .replace(/^[a-zàâçéèêëîïôûùüÿñæœ\- ]{2,30}(?=[A-ZÉÈÀ])/, '')
      .trim();
    results.push({
      id: 'ae-' + slugFromUrl(url),
      titre: titleGuess || anchorText.slice(0, 60),
      url,
      contrat: /CDD/i.test(containerText) ? 'CDD' : (/Intérim|Interim/i.test(containerText) ? 'Intérim' : 'Autre'),
      dateRepere: dateISO,
      source: 'Alliance Emploi',
      rawSnippet: containerText,
    });
  });
  return results;
}

/**
 * France Travail: every offer is an <a href="…/offres/recherche/detail/ID">
 * whose text is "Origine de l'offre : … TITLE ENTREPRISE - DEPT - VILLE
 * description… CONTRAT - TEMPS Publié DATE …"
 */
function parseFranceTravail(html, today = new Date()) {
  const $ = cheerio.load(html);
  const results = [];
  $('a[href*="/offres/recherche/detail/"]').each((_, el) => {
    const url = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (!url || !text) return;
    const dateMatch = text.match(/Publié (aujourd.?hui|il y a \d+ (jour|jours|semaine|semaines|mois))/i);
    const dateISO = dateMatch ? relativeDateToISO(dateMatch[0].replace(/^Publié /i, ''), today) : null;
    const contratMatch = text.match(/\b(CDD|Intérim|Interim|CDI)\b/);
    const stripped = text.replace(/^Origine de l'offre\s*:\s*.*?\)\s*/i, '');
    const structured = stripped.match(/^(.*?\(H\/F[^)]*\))\s*(.*?)\s-\s(\d{2})\s-\s([^0-9]{2,40}?)(?:\s{2,}|\s[A-ZÀ-Ü])/);
    let titre, entreprise, lieu;
    if (structured) {
      titre = structured[1].trim();
      entreprise = structured[2].trim();
      lieu = structured[4].trim();
    } else {
      titre = stripped.split(/\s-\s\d{2}\s-/)[0].trim();
    }
    if (!titre || titre.length > 80) titre = text.slice(0, 60);
    results.push({
      id: 'ft-' + slugFromUrl(url).toLowerCase(),
      titre,
      entreprise: entreprise || null,
      lieu: lieu || null,
      url,
      contrat: contratMatch ? (contratMatch[0].match(/Interim/i) ? 'Intérim' : contratMatch[0]) : 'Autre',
      dateRepere: dateISO,
      source: 'France Travail',
      rawSnippet: text,
    });
  });
  return results;
}

function applyExclusionFilters(listings) {
  const kept = [];
  const excluded = [];
  for (const l of listings) {
    if (isExcludedByTitle(l.rawSnippet)) { excluded.push({ ...l, reason: 'titre exclu (caissier/préparateur de commandes)' }); continue; }
    if (l.contrat !== 'CDD' && l.contrat !== 'Intérim') { excluded.push({ ...l, reason: 'contrat hors CDD/Intérim' }); continue; }
    if (looksLikeDrivingLicenceRequired(l.rawSnippet)) { excluded.push({ ...l, reason: 'permis de conduire probable (à vérifier)' }); continue; }
    kept.push(l);
  }
  return { kept, excluded };
}

module.exports = {
  parseAllianceEmploi,
  parseFranceTravail,
  applyExclusionFilters,
  isExcludedByTitle,
  looksLikeDrivingLicenceRequired,
  relativeDateToISO,
  slugFromUrl,
};