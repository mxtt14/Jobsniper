/*
 * Pulls scraper/data/listings.json (published by the daily GitHub Actions
 * run) and merges only the ids not seen before into local IndexedDB —
 * exactly like importSeedIfNeeded() does for the hardcoded catch-up list,
 * so a status you've already set is never touched or overwritten.
 *
 * Call syncRemoteListings() on app load and/or from a "Vérifier les
 * nouvelles offres" button. Requires sGet/sSet/sList from app.js to
 * already be defined (storage-polyfill.js + app.js loaded first).
 */
const REMOTE_LISTINGS_URL = './scraper/data/listings.json';
const REMOTE_IMPORTED_KEY = 'meta:remote-imported';

async function syncRemoteListings() {
  let remoteData;
  try {
    const res = await fetch(REMOTE_LISTINGS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    remoteData = await res.json();
  } catch (err) {
    console.warn('Sync veille distante indisponible:', err.message || err);
    return { ok: false, added: 0, reason: 'offline_or_unreachable' };
  }

  let imported = await sGet(REMOTE_IMPORTED_KEY);
  if (!imported) imported = [];
  const importedSet = new Set(imported);

  let added = 0;
  for (const item of remoteData.listings || []) {
    if (importedSet.has(item.id)) continue;
    const record = {
      id: item.id,
      titre: item.titre,
      entreprise: item.entreprise || 'Non précisé',
      lieu: item.lieu || 'Non précisé',
      contrat: item.contrat || 'Autre',
      duree: item.duree || 'Non précisée',
      source: item.source || 'Veille automatique',
      url: item.url || '',
      notes: item.notes || '',
      exigence: item.exigence || '',
      dateRepere: item.dateRepere,
      statut: 'reperee',
      dateMaj: item.dateRepere,
    };
    await sSet('listing:' + item.id, record);
    importedSet.add(item.id);
    added++;
  }

  if (added > 0) {
    await sSet(REMOTE_IMPORTED_KEY, Array.from(importedSet));
  }

  return { ok: true, added, updatedAt: remoteData.updatedAt || null };
}

async function runRemoteSyncAndRefresh(button) {
  if (button) { button.disabled = true; button.textContent = 'Vérification…'; }
  const result = await syncRemoteListings();
  const statusEl = document.getElementById('remoteSyncStatus');
  if (result.ok) {
    if (result.added > 0) {
      await loadListings();
      renderAll();
      showToast(result.added + ' nouvelle(s) annonce(s) récupérée(s)');
    } else {
      showToast('Aucune nouvelle annonce depuis la dernière vérification');
    }
    if (statusEl) {
      statusEl.textContent = result.updatedAt
        ? 'Veille automatique — dernière exécution : ' + new Date(result.updatedAt).toLocaleString('fr-FR')
        : "Veille automatique connectée, en attente du premier passage programmé.";
    }
  } else {
    if (statusEl) statusEl.textContent = "Veille automatique pas encore branchée (scraper/data/listings.json introuvable) — c'est normal tant que le backend n'est pas déployé.";
    showToast("Veille distante indisponible pour l'instant");
  }
  if (button) { button.disabled = false; button.textContent = 'Vérifier les nouvelles offres'; }
  return result;
}

// Runs once app.js's own init has fully finished (storage ready,
// listings loaded, DOM rendered) — no arbitrary timeout needed.
(async () => {
  if (window.appReady) await window.appReady;
  runRemoteSyncAndRefresh();
})();

