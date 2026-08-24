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
assert.strictEqual(ae.length, 5, 'Alliance Emploi: devrait trouver 5 annonces dans la fixture');
assert.ok(ae.every((o) => o.contrat === 'CDD'), 'Alliance Emploi: le type de contrat doit être détecté depuis le badge');
assert.strictEqual(ae.find((o) => o.id.includes('rondier')).titre, 'Rondier');

const ftHtml = fs.readFileSync(path.join(__dirname, '../fixtures/france-travail.html'), 'utf8');
const ft = parseFranceTravail(ftHtml, today);
assert.strictEqual(ft.length, 5, 'France Travail: devrait trouver 5 annonces dans la fixture');
const hote = ft.find((o) => o.id.includes('212spkk'));
assert.strictEqual(hote.entreprise, 'COM AND GO');
assert.strictEqual(hote.contrat, 'CDD');

const { kept, excluded } = applyExclusionFilters([...ae, ...ft]);
assert.ok(kept.every((o) => !/caissier|préparateur de commandes/i.test(o.titre)), 'aucun poste exclu ne doit passer les filtres');
assert.ok(excluded.some((o) => o.reason.includes('permis')), 'le chauffeur livreur doit être écarté pour permis probable');

console.log(`OK — ${ae.length} annonces Alliance Emploi + ${ft.length} France Travail parsées, ${kept.length} retenues après filtres, ${excluded.length} écartées.`);
