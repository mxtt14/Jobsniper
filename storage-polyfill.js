/*
 * Reproduces the get/set/delete/list shape of window.storage (used by the
 * Claude artifact version of this dashboard) on top of IndexedDB, so the
 * exact same app.js runs unmodified as a standalone installable app.
 * Everything stays on the device — nothing is sent to a server.
 */
window.storage = (function () {
  const DB_NAME = 'pilotage-emploi-db';
  const STORE = 'kv';

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbSet(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbDelete(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbKeys() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAllKeys();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  return {
    async get(key, shared) {
      const value = await idbGet(key);
      if (value === undefined) throw new Error('key not found: ' + key);
      return { key, value, shared: !!shared };
    },
    async set(key, value, shared) {
      await idbSet(key, value);
      return { key, value, shared: !!shared };
    },
    async delete(key, shared) {
      await idbDelete(key);
      return { key, deleted: true, shared: !!shared };
    },
    async list(prefix, shared) {
      const keys = await idbKeys();
      const filtered = prefix ? keys.filter((k) => String(k).startsWith(prefix)) : keys;
      return { keys: filtered, prefix, shared: !!shared };
    },
  };
})();
