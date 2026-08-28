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
  return null;
}

function slugFromUrl(url) {
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1].replace(/[^a-z0-9-]/gi, '').slice(0, 60);
}

function parseAllianceEmploi(html, today = new Date(), baseUrl = 'https://alliance-emploi.org/') {
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();
  $('a[href*="/offre/"]').each((_, el) => {
    const hrefRaw = $(el).attr('href');
    if (!hrefRaw) return;
    const url = new URL(hrefRaw, baseUrl).toString();
    if (seen.has(url)) return;
    seen.add(url);
    const anchorText = $(el).text().trim().replace(/\s+/g, ' ');
    if (!anchorText) return;
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

function parseFranceTravail(html, today = new Date(), baseUrl = 'https://candidat.francetravail.fr/') {
  const $ = cheerio.load(html);
  const results = [];
  $('a[href*="/offres/recherche/detail/"]').each((_, el) => {
    const hrefRaw = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (!hrefRaw || !text) return;
    const url = new URL(hrefRaw, baseUrl).toString();
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

function parseManpower(html, today = new Date(), baseUrl = 'https://www.manpower.fr/') {
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();
  $('a[href*="/offers/details/"]').each((_, el) => {
    const hrefRaw = $(el).attr('href');
    const title = $(el).text().trim();
    if (!hrefRaw || !title) return;
    const url = new URL(hrefRaw, baseUrl).toString();
    if (seen.has(url)) return;
    seen.add(url);
    let containerText = $(el).closest('article, li, div').text().trim().replace(/\s+/g, ' ');
    const secondPublie = containerText.indexOf('Publié le', containerText.indexOf('Publié le') + 1);
    if (secondPublie > -1) containerText = containerText.slice(0, secondPublie);
    const dateMatch = containerText.match(/Publié le (\d{2}\/\d{2}\/\d{4})/);
    let dateISO = null;
    if (dateMatch) {
      const [d, m, y] = dateMatch[1].split('/');
      dateISO = `${y}-${m}-${d}`;
    }
    const contratMatch = containerText.match(/\b(CDI Intérimaire|CDI|CDD|Mission en intérim|Alternance)\b/);
    const villeMatch = containerText.match(/\b\d{5}\s+([A-ZÀ-Ü][a-zà-ü'\- ]+)/);
    results.push({
      id: 'mp-' + slugFromUrl(url),
      titre: title,
      url,
      entreprise: 'Manpower',
      lieu: villeMatch ? villeMatch[1].trim() : null,
      contrat: contratMatch ? (contratMatch[0] === 'Mission en intérim' ? 'Intérim' : contratMatch[0]) : 'Autre',
      dateRepere: dateISO,
      source: 'Manpower',
      rawSnippet: containerText,
    });
  });
  return results;
}

function parseRasInterim(html, today = new Date(), baseUrl = 'https://www.ras-interim.fr/') {
  const $ = cheerio.load(html);
  const results = [];
  $('a[href*="/offres/"]').each((_, el) => {
    const hrefRaw = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (!hrefRaw || !text || !text.includes('—')) return;
    const url = new URL(hrefRaw, baseUrl).toString();
    const parts = text.split('—').map((p) => p.trim());
    const titre = parts[0];
    const lieu = parts[1] || null;
    const contrat = parts[2] || 'Autre';
    const dateMatch = text.match(/Publiée le (\d{2})\/(\d{2})\/(\d{4})/);
    const dateISO = dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : null;
    results.push({
      id: 'ras-' + slugFromUrl(url),
      titre,
      url,
      entreprise: 'R.A.S Intérim',
      lieu,
      contrat: contrat === 'Interim' ? 'Intérim' : contrat,
      dateRepere: dateISO,
      source: 'R.A.S Intérim',
      rawSnippet: text,
    });
  });
  return results;
}

function looksLikeSignificantExperienceRequired(text) {
  const n = normalize(text);
  const m = n.match(/(\d+)\s*an[s]?\s*(minimum\s*)?d.experience/);
  return !!m && parseInt(m[1], 10) >= 2;
}

function applyExclusionFilters(listings) {
  const kept = [];
  const excluded = [];
  for (const l of listings) {
    if (isExcludedByTitle(l.rawSnippet)) { excluded.push({ ...l, reason: 'titre exclu (caissier/préparateur de commandes)' }); continue; }
    if (l.contrat !== 'CDD' && l.contrat !== 'Intérim') { excluded.push({ ...l, reason: 'contrat hors CDD/Intérim' }); continue; }
    if (looksLikeDrivingLicenceRequired(l.rawSnippet)) { excluded.push({ ...l, reason: 'permis de conduire probable (à vérifier)' }); continue; }
    if (looksLikeSignificantExperienceRequired(l.rawSnippet)) { excluded.push({ ...l, reason: '2 ans d\'expérience ou plus requis' }); continue; }
    kept.push(l);
  }
  return { kept, excluded };
}

module.exports = {
  parseAllianceEmploi,
  parseFranceTravail,
  parseManpower,
  parseRasInterim,
  applyExclusionFilters,
  isExcludedByTitle,
  looksLikeDrivingLicenceRequired,
  looksLikeSignificantExperienceRequired,
  relativeDateToISO,
  slugFromUrl,
};