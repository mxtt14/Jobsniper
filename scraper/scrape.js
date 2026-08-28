const fs = require('fs');
const path = require('path');
const { parseAllianceEmploi, parseFranceTravail, parseManpower, parseRasInterim, applyExclusionFilters } = require('./lib/parse.js');

const SOURCES = [
  {
    name: 'Alliance Emploi',
    url: 'https://alliance-emploi.org/offres?contrats=cdd&location=50.358552%2C3.510438&radius=25&city=Valenciennes',
    baseUrl: 'https://alliance-emploi.org/',
    parse: parseAllianceEmploi,
  },
  {
    name: 'France Travail',
    url: 'https://candidat.francetravail.fr/offres/recherche?lieux=59606&offresPartenaires=true&rayon=20&tri=0&typeContrat=CDD,MIS',
    baseUrl: 'https://candidat.francetravail.fr/',
    parse: parseFranceTravail,
  },
  {
    name: 'Manpower',
    url: 'https://www.manpower.fr/offre-emploi/hauts-de-france/nord/valenciennes/r17d59v59606.html',
    baseUrl: 'https://www.manpower.fr/',
    parse: parseManpower,
  },
  {
    name: 'R.A.S Intérim',
    url: 'https://www.ras-interim.fr/offres/agence/valenciennes/',
    baseUrl: 'https://www.ras-interim.fr/',
    parse: parseRasInterim,
  },
  // Indeed is deliberately excluded: it returns HTTP 403 / blocks automated
  // fetches (robots.txt disallow), confirmed when this was first built.
  // Manpower and R.A.S Intérim only cover pages 1 / the single-page agency
  // listing respectively — no pagination handling yet. CRIT's page renders
  // via JavaScript (no usable static HTML found) — skipped for now.
];

const DATA_FILE = path.join(__dirname, 'data', 'listings.json');

async function fetchWithTimeout(url, ms = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PilotageEmploiBot/1.0; usage personnel)' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function loadExisting() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { updatedAt: null, listings: [], runLog: [] };
  }
}

function saveData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function main() {
  const today = new Date();
  const existing = loadExisting();
  const existingIds = new Set(existing.listings.map((l) => l.id));

  const runLog = { date: today.toISOString().slice(0, 10), sources: [] };
  let allParsed = [];

  for (const src of SOURCES) {
    try {
      const html = await fetchWithTimeout(src.url);
      const parsed = src.parse(html, today, src.baseUrl);
      allParsed = allParsed.concat(parsed);
      runLog.sources.push({ name: src.name, status: 'ok', found: parsed.length });
    } catch (err) {
      runLog.sources.push({ name: src.name, status: 'error', error: String(err.message || err) });
      console.error(`[${src.name}] échec:`, err.message || err);
    }
  }

  const { kept, excluded } = applyExclusionFilters(allParsed);
  const brandNew = kept.filter((l) => !existingIds.has(l.id));

  runLog.parsedTotal = allParsed.length;
  runLog.keptAfterFilters = kept.length;
  runLog.excludedByFilters = excluded.length;
  runLog.newListings = brandNew.length;

  const updated = {
    updatedAt: today.toISOString(),
    listings: existing.listings.concat(
      brandNew.map((l) => ({
        id: l.id,
        titre: l.titre,
        entreprise: l.entreprise || 'Non précisé',
        lieu: l.lieu || 'Non précisé',
        contrat: l.contrat,
        source: l.source,
        url: l.url,
        dateRepere: l.dateRepere || today.toISOString().slice(0, 10),
      }))
    ),
    runLog: [runLog, ...(existing.runLog || [])].slice(0, 30),
  };

  saveData(updated);

  console.log(`Terminé. ${brandNew.length} nouvelle(s) annonce(s) ajoutée(s) sur ${kept.length} retenue(s) (${allParsed.length} vues au total).`);
  if (excluded.length) {
    console.log(`${excluded.length} annonce(s) écartée(s) par les filtres.`);
  }
}

main().catch((err) => {
  console.error('Échec du scraper:', err);
  process.exitCode = 1;
});