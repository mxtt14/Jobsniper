// Run with: npm test
// This does NOT hit the live sites — it replays real fixture pages
// (captured from Alliance Emploi and France Travail) through the parser,
// so anyone can verify the extraction logic actually works without
// needing network access.
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { parseAllianceEmploi, parseFranceTravail, applyExclusionFilters } = require('../lib/parse.js');

const today = new Date('2026-08-24');

const aeHtml = fs.readFileSync(path.join(__dirname, '../fixtures/alliance-emploi.html'), 'utf8');
const ae = parseAllianceEmploi(aeHtml, today);
assert.strictEqual(ae.length, 6, 'Alliance Emploi: devrait trouver 6 annonces dans la fixture (dont une avec un lien relatif)');
assert.ok(ae.every((o) => o.contrat === 'CDD'), 'Alliance Emploi: le type de contrat doit être détecté depuis le badge');
assert.strictEqual(ae.find((o) => o.id.includes('rondier')).titre, 'Rondier');
const relatifTeste = ae.find((o) => o.id.includes('agent-logistique'));
assert.ok(relatifTeste.url.startsWith('https://alliance-emploi.org/'), 'un href relatif (/offre/...) doit être résolu en URL absolue, pas laissé tel quel');

const ftHtml = fs.readFileSync(path.join(__dirname, '../fixtures/france-travail.html'), 'utf8');
const ft = parseFranceTravail(ftHtml, today);
assert.strictEqual(ft.length, 5, 'France Travail: devrait trouver 5 annonces dans la fixture');
const hote = ft.find((o) => o.id.includes('212spkk'));
assert.strictEqual(hote.entreprise, 'COM AND GO');
assert.strictEqual(hote.contrat, 'CDD');

const mpHtml = fs.readFileSync(path.join(__dirname, '../fixtures/manpower.html'), 'utf8');
const { parseManpower } = require('../lib/parse.js');
const mp = parseManpower(mpHtml, today);
assert.strictEqual(mp.length, 5, 'Manpower: devrait trouver 5 annonces dans la fixture');
assert.ok(mp.every((o) => o.url.startsWith('https://www.manpower.fr/offers/details/')), 'chaque URL Manpower doit être absolue');

const rasHtml = fs.readFileSync(path.join(__dirname, '../fixtures/ras-interim.html'), 'utf8');
const { parseRasInterim } = require('../lib/parse.js');
const ras = parseRasInterim(rasHtml, today);
assert.strictEqual(ras.length, 5, 'R.A.S Intérim: devrait trouver 5 annonces dans la fixture');
assert.strictEqual(ras.find((o) => o.id.includes('cuisinier')).lieu, 'Cambrai');

const { kept, excluded } = applyExclusionFilters([...ae, ...ft, ...mp, ...ras]);
assert.ok(kept.every((o) => !/caissier|préparateur de commandes/i.test(o.titre)), 'aucun poste exclu ne doit passer les filtres');
assert.ok(excluded.some((o) => o.reason.includes('permis')), 'le chauffeur livreur doit être écarté pour permis probable');
assert.ok(excluded.some((o) => o.reason.includes("expérience")), 'le peintre exigeant 5 ans d\'expérience doit être écarté');
assert.ok(excluded.some((o) => o.id.startsWith('ras-conducteur') && o.reason.includes('permis')), 'les conducteurs SPL de R.A.S doivent être écartés pour permis');

console.log(`OK — ${ae.length} Alliance Emploi + ${ft.length} France Travail + ${mp.length} Manpower + ${ras.length} R.A.S Intérim parsées, ${kept.length} retenues après filtres, ${excluded.length} écartées.`);