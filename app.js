/* ---------- Reference data ---------- */
const STATUTS = [
  {key:'reperee',  label:'Repérée',    color:'#8C8368'},
  {key:'cv',       label:'CV à faire', color:'#F2B705'},
  {key:'lm',       label:'LM à faire', color:'#E0900A'},
  {key:'envoyee',  label:'Envoyée',    color:'#3A6EA5'},
  {key:'entretien',label:'Entretien',  color:'#1F4B4C'},
  {key:'refus',    label:'Refus',      color:'#B3402A'},
  {key:'offre',    label:'Offre',      color:'#2F7A4F'},
];
const statutLabel = k => (STATUTS.find(s=>s.key===k)||{}).label || k;
const statutColor = k => (STATUTS.find(s=>s.key===k)||{}).color || '#999';

const SEED_LISTINGS = [
  {id:'ae-rondier-3211', titre:'Rondier', entreprise:'Alliance Emploi', lieu:'Saint-Saulve', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/rondier-2026-3211', dateRepere:'2026-08-10', notes:''},
  {id:'ae-pontier-3212', titre:'Pontier', entreprise:'Alliance Emploi', lieu:'Saint-Saulve', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/pontier-2026-3212', dateRepere:'2026-08-10', notes:''},
  {id:'ae-assistant-log-3234', titre:'Assistant logistique et production', entreprise:'Alliance Emploi', lieu:'Onnaing', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/assistant-logistique-et-production-2026-3234', dateRepere:'2026-08-19', notes:''},
  {id:'ae-controleur-qualite-3241', titre:'Contrôleur qualité', entreprise:'Alliance Emploi', lieu:'Feignies', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/controleur-qualite-2026-3241', dateRepere:'2026-08-21', notes:''},
  {id:'ae-conducteur-ligne-2204', titre:'Conducteur de ligne', entreprise:'Alliance Emploi', lieu:'Tilloy-lez-Cambrai', contrat:'CDD', duree:'3 mois', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/conducteur-de-ligne-2025-2204', dateRepere:'2026-08-17', notes:'Durée exactement alignée sur votre objectif de 3 mois.'},
  {id:'ae-operateur-prod-aero-2819', titre:'Opérateur de production en aéronautique', entreprise:'Alliance Emploi', lieu:'Saint-Amand-les-Eaux', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/operateur-production-en-aeronautique-2026-2819', dateRepere:'2026-08-17', notes:''},
  {id:'ae-operateur-prod-3120', titre:'Opérateur de production', entreprise:'Alliance Emploi', lieu:'Onnaing', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/operateur-production-2026-3120', dateRepere:'2026-08-17', notes:''},
  {id:'ae-operateur-prod-2875', titre:'Opérateur de production', entreprise:'Alliance Emploi', lieu:'Sars-et-Rosières', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/operateur-production-2026-2875', dateRepere:'2026-08-17', notes:''},
  {id:'ae-operateur-qualite-aero-3218', titre:'Opérateur qualité en aéronautique', entreprise:'Alliance Emploi', lieu:'Sars-et-Rosières', contrat:'CDD', duree:'Non précisée', source:'Alliance Emploi', url:'https://alliance-emploi.org/offre/operateur-qualite-en-aeronautique-2026-3218', dateRepere:'2026-08-10', notes:''},
  {id:'ft-facteur-212sysx', titre:'Facteur / Factrice', entreprise:"L'UCIE Intérim", lieu:'Valenciennes', contrat:'Intérim', duree:'Temps plein', source:'France Travail', url:'https://candidat.francetravail.fr/offres/recherche/detail/212SYSX', dateRepere:'2026-08-21', notes:''},
  {id:'ft-operateur-saisie-212qbnm', titre:'Opérateur de saisie', entreprise:'XBP Europe Arista', lieu:'Valenciennes', contrat:'CDD', duree:'Temps plein', source:'France Travail', url:'https://candidat.francetravail.fr/offres/recherche/detail/212QBNM', dateRepere:'2026-08-18', notes:''},
  {id:'ft-prise-commande-pizza-212jlgm', titre:'Prise de commande physique et téléphonique', entreprise:"Pizz'Apéro", lieu:'Maing', contrat:'CDD', duree:'Temps partiel', source:'France Travail', url:'https://candidat.francetravail.fr/offres/recherche/detail/212JLGM', dateRepere:'2026-08-11', notes:''},
  {id:'ft-aide-menagere-212hdvh', titre:'Aide ménagère', entreprise:'Bien-être & Santé', lieu:'Denain', contrat:'CDD', duree:'Temps partiel', source:'France Travail', url:'https://candidat.francetravail.fr/offres/recherche/detail/212HDVH', dateRepere:'2026-08-10', notes:'Intervention au domicile de séniors.'},
  {id:'ft-hote-accueil-212spkk', titre:'Hôte / Hôtesse accueil', entreprise:'Com and Go', lieu:'Valenciennes', contrat:'CDD', duree:'Temps partiel', source:'France Travail', url:'https://candidat.francetravail.fr/offres/recherche/detail/212SPKK', dateRepere:'2026-08-21', notes:'10 postes — distribution de bons cadeaux en centre-ville pour la rentrée.'},
  {id:'ft-vendeur-boulangerie-212rpfr', titre:'Vendeur / Vendeuse en boulangerie-pâtisserie', entreprise:'B and D', lieu:'Bouchain', contrat:'CDD', duree:'1 mois (remplacement)', source:'France Travail', url:'https://candidat.francetravail.fr/offres/recherche/detail/212RPFR', dateRepere:'2026-08-20', notes:''},
  {id:'mp-teleconseiller-1101390925', titre:'Téléconseiller pour les CSE, Assos, Comités', entreprise:'Manpower', lieu:'Valenciennes', contrat:'Intérim', duree:'1 semaine renouvelable', source:'Manpower', url:'https://www.manpower.fr/offers/details/1101390925', dateRepere:'2026-08-19', notes:'Mission courte, accessible sans diplôme spécifique.'},
  {id:'mp-vendeur-magasin-alim-1101479762', titre:'Vendeur en magasin alimentaire', entreprise:'Manpower', lieu:'Valenciennes', contrat:'Intérim', duree:'Longue mission', source:'Manpower', url:'https://www.manpower.fr/offers/details/1101479762', dateRepere:'2026-08-20', notes:"10 postes disponibles — bon volume de recrutement, mission jusqu'au 15/09 minimum."},
];
const LAST_VEILLE_DATE = '2026-08-24';
// Annonces retirées car elles ne correspondent plus aux critères (ex. permis de conduire exigé).
// On ne les supprime que si l'utilisateur ne les a pas encore travaillées, pour ne jamais effacer une candidature en cours.
const RETIRED_IDS = ['ft-chauffeur-accomp-212vfzr', 'ft-chauffeur-livreur-212pqqj', 'ft-coursier-pizza-212jlcx'];

/* ---------- Storage helpers ---------- */
async function sGet(key){
  try{ const r = await window.storage.get(key, false); return r ? JSON.parse(r.value) : null; }
  catch(e){ return null; }
}
async function sSet(key, val){
  try{ return await window.storage.set(key, JSON.stringify(val), false); }
  catch(e){ console.error('storage set failed', e); return null; }
}
async function sDelete(key){
  try{ return await window.storage.delete(key, false); }
  catch(e){ return null; }
}
async function sList(prefix){
  try{ const r = await window.storage.list(prefix, false); return r ? r.keys : []; }
  catch(e){ return []; }
}

/* ---------- App state ---------- */
let listings = [];

async function retireStaleListings(){
  for(const id of RETIRED_IDS){
    const rec = await sGet('listing:'+id);
    if(rec && rec.statut === 'reperee'){
      await sDelete('listing:'+id);
    }
  }
}

async function importSeedIfNeeded(){
  let imported = await sGet('meta:seed-imported');
  if(!imported) imported = [];
  let changed = false;
  for(const item of SEED_LISTINGS){
    if(!imported.includes(item.id)){
      const record = {
        id:item.id, titre:item.titre, entreprise:item.entreprise, lieu:item.lieu,
        contrat:item.contrat, duree:item.duree, source:item.source, url:item.url,
        notes:item.notes||'', exigence:item.exigence||'',
        dateRepere:item.dateRepere, statut:'reperee', dateMaj:item.dateRepere
      };
      await sSet('listing:'+item.id, record);
      imported.push(item.id);
      changed = true;
    }
  }
  if(changed) await sSet('meta:seed-imported', imported);
}

async function loadListings(){
  const keys = await sList('listing:');
  const out = [];
  for(const k of keys){
    const v = await sGet(k);
    if(v) out.push(v);
  }
  listings = out;
}

function todayISO(){ return new Date().toISOString().slice(0,10); }

async function updateStatus(id, newStatus){
  const rec = listings.find(l=>l.id===id);
  if(!rec) return;
  rec.statut = newStatus;
  rec.dateMaj = todayISO();
  await sSet('listing:'+id, rec);
  showToast('Statut mis à jour → ' + statutLabel(newStatus));
  renderAll();
}

async function deleteListing(id){
  if(!confirm('Supprimer cette annonce du tableau de bord ?')) return;
  await sDelete('listing:'+id);
  listings = listings.filter(l=>l.id!==id);
  showToast('Annonce supprimée');
  renderAll();
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- Rendering ---------- */
function cardHTML(l, opts){
  opts = opts||{};
  const color = statutColor(l.statut);
  const statusOptions = STATUTS.map(s=>`<option value="${s.key}" ${s.key===l.statut?'selected':''}>${s.label}</option>`).join('');
  return `
  <div class="card" style="--status-color:${color}">
    <div class="card-top">
      <h3 class="card-title">${escapeHTML(l.titre)}</h3>
      <span class="card-ref">${l.id.split('-').slice(-1)[0].toUpperCase()}</span>
    </div>
    <div class="card-meta"><strong>${escapeHTML(l.entreprise)}</strong> · ${escapeHTML(l.lieu)} · repérée le ${frDate(l.dateRepere)}</div>
    <div class="tags">
      <span class="tag contrat">${l.contrat}</span>
      ${l.duree && l.duree!=='Non précisée' ? `<span class="tag duree">${escapeHTML(l.duree)}</span>` : ''}
      <span class="tag">${escapeHTML(l.source)}</span>
      ${l.exigence ? `<span class="tag warn">${escapeHTML(l.exigence)}</span>` : ''}
    </div>
    ${l.notes ? `<p class="card-notes">${escapeHTML(l.notes)}</p>` : ''}
    <div class="card-bottom">
      <select class="status-select" onchange="updateStatus('${l.id}', this.value)">${statusOptions}</select>
      <div class="card-actions">
        ${l.url ? `<a class="icon-link" href="${l.url}" target="_blank">Voir l'annonce ↗</a>` : ''}
        <button class="btn btn-danger btn-sm" onclick="deleteListing('${l.id}')">Suppr.</button>
      </div>
    </div>
  </div>`;
}

function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function frDate(iso){
  if(!iso) return '—';
  const [y,m,d] = iso.split('-');
  const mois = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  return `${parseInt(d)} ${mois[parseInt(m)-1]} ${y}`;
}

function renderVeille(){
  const search = document.getElementById('searchInput').value.toLowerCase();
  const contratFilter = document.getElementById('filterContrat').value;
  const sortBy = document.getElementById('sortBy').value;
  const hideRefus = document.getElementById('hideRefus').checked;

  let list = listings.filter(l=>{
    if(l.source==='Candidature personnelle') return false;
    if(hideRefus && l.statut==='refus') return false;
    if(contratFilter && l.contrat!==contratFilter) return false;
    if(search){
      const hay = (l.titre+' '+l.entreprise+' '+l.lieu).toLowerCase();
      if(!hay.includes(search)) return false;
    }
    return true;
  });

  if(sortBy==='date') list.sort((a,b)=> b.dateRepere.localeCompare(a.dateRepere));
  else if(sortBy==='lieu') list.sort((a,b)=> a.lieu.localeCompare(b.lieu));
  else if(sortBy==='contrat') list.sort((a,b)=> a.contrat.localeCompare(b.contrat));

  const el = document.getElementById('veilleList');
  el.innerHTML = list.length ? list.map(l=>cardHTML(l)).join('') :
    `<div class="empty"><b>Aucune annonce ne correspond</b>Ajustez les filtres ou demandez-moi de lancer une nouvelle veille.</div>`;
  document.getElementById('cnt-veille').textContent = listings.filter(l=>l.statut!=='refus').length;
}

function renderTaches(){
  const list = listings.filter(l=>l.statut==='cv' || l.statut==='lm');
  const el = document.getElementById('tachesList');
  el.innerHTML = list.length ? list.map(l=>cardHTML(l)).join('') :
    `<div class="empty"><b>Rien à produire pour l'instant</b>Passez une annonce en « CV à faire » ou « LM à faire » depuis l'onglet Veille pour qu'elle apparaisse ici.</div>`;
  document.getElementById('cnt-taches').textContent = list.length;
}

function renderPerso(){
  const list = listings.filter(l=>l.source==='Candidature personnelle')
    .sort((a,b)=> b.dateRepere.localeCompare(a.dateRepere));
  const el = document.getElementById('persoList');
  el.innerHTML = list.length ? list.map(l=>cardHTML(l)).join('') :
    `<div class="empty"><b>Aucune candidature perso enregistrée</b>Utilisez le formulaire ci-dessus pour suivre un poste auquel vous avez postulé de votre côté.</div>`;
  document.getElementById('cnt-perso').textContent = list.length;
}

function renderSuivi(){
  const kanban = document.getElementById('kanban');
  kanban.innerHTML = STATUTS.map(s=>{
    const items = listings.filter(l=>l.statut===s.key);
    return `
    <div class="kcol">
      <div class="kcol-head" style="--status-color:${s.color}">${s.label} <span>${items.length}</span></div>
      <div class="kcol-body">
        ${items.map(l=>`
          <div class="kcard" style="--status-color:${s.color}">
            <b>${escapeHTML(l.titre)}</b>
            <div class="kmeta">${escapeHTML(l.entreprise)} · ${escapeHTML(l.lieu)}</div>
            <select onchange="updateStatus('${l.id}', this.value)">
              ${STATUTS.map(st=>`<option value="${st.key}" ${st.key===l.statut?'selected':''}>${st.label}</option>`).join('')}
            </select>
          </div>`).join('') || '<span style="font-size:11.5px;color:var(--ink-soft);">Vide</span>'}
      </div>
    </div>`;
  }).join('');
  document.getElementById('cnt-suivi').textContent = listings.filter(l=>['envoyee','entretien'].includes(l.statut)).length;
}

function renderStats(){
  const total = listings.filter(l=>l.statut!=='refus').length;
  const aTraiter = listings.filter(l=>['cv','lm'].includes(l.statut)).length;
  const enAttente = listings.filter(l=>l.statut==='envoyee').length;
  const entretiens = listings.filter(l=>l.statut==='entretien').length;
  const offres = listings.filter(l=>l.statut==='offre').length;
  const refus = listings.filter(l=>l.statut==='refus').length;
  const stats = [
    ['Annonces actives', total],
    ['À traiter', aTraiter],
    ['En attente', enAttente],
    ['Entretiens', entretiens],
    ['Offres', offres],
    ['Refus', refus],
  ];
  document.getElementById('statRow').innerHTML = stats.map(([label,val])=>`<div class="stat"><b>${val}</b><span>${label}</span></div>`).join('');
}

function renderAll(){
  renderStats();
  renderVeille();
  renderTaches();
  renderPerso();
  renderSuivi();
}

/* ---------- Tabs ---------- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.dataset.tab).classList.add('active');
  });
});

/* ---------- Toolbar events ---------- */
['searchInput','filterContrat','sortBy','hideRefus'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderVeille);
  document.getElementById(id).addEventListener('change', renderVeille);
});

/* ---------- Add modal ---------- */
const modalBg = document.getElementById('modalBg');
document.getElementById('fabAdd').addEventListener('click', ()=> modalBg.classList.add('open'));
document.getElementById('cancelAdd').addEventListener('click', ()=> modalBg.classList.remove('open'));
modalBg.addEventListener('click', e=>{ if(e.target===modalBg) modalBg.classList.remove('open'); });

document.getElementById('confirmAdd').addEventListener('click', async ()=>{
  const titre = document.getElementById('f-titre').value.trim();
  if(!titre){ showToast('Indiquez au moins un intitulé de poste'); return; }
  const id = 'manuel-' + Date.now();
  const rec = {
    id,
    titre,
    entreprise: document.getElementById('f-entreprise').value.trim() || 'Non renseigné',
    lieu: document.getElementById('f-lieu').value.trim() || 'Non renseigné',
    contrat: document.getElementById('f-contrat').value,
    duree: document.getElementById('f-duree').value.trim() || 'Non précisée',
    source: 'Ajout manuel',
    url: document.getElementById('f-url').value.trim(),
    notes: document.getElementById('f-notes').value.trim(),
    exigence: '',
    dateRepere: todayISO(),
    statut: 'reperee',
    dateMaj: todayISO(),
  };
  await sSet('listing:'+id, rec);
  listings.push(rec);
  ['f-titre','f-entreprise','f-lieu','f-duree','f-url','f-notes'].forEach(fid=>document.getElementById(fid).value='');
  modalBg.classList.remove('open');
  showToast('Annonce ajoutée');
  renderAll();
});

/* ---------- Mes candidatures form ---------- */
document.getElementById('confirmAddPerso').addEventListener('click', async ()=>{
  const titre = document.getElementById('p-titre').value.trim();
  if(!titre){ showToast('Indiquez au moins un intitulé de poste'); return; }
  const id = 'perso-' + Date.now();
  const dateCandidature = document.getElementById('p-date').value || todayISO();
  const rec = {
    id,
    titre,
    entreprise: document.getElementById('p-entreprise').value.trim() || 'Non renseigné',
    lieu: document.getElementById('p-lieu').value.trim() || 'Non renseigné',
    contrat: document.getElementById('p-contrat').value,
    duree: 'Non précisée',
    source: 'Candidature personnelle',
    url: document.getElementById('p-url').value.trim(),
    notes: document.getElementById('p-notes').value.trim(),
    exigence: '',
    dateRepere: dateCandidature,
    statut: document.getElementById('p-statut').value || 'envoyee',
    dateMaj: dateCandidature,
  };
  await sSet('listing:'+id, rec);
  listings.push(rec);
  ['p-titre','p-entreprise','p-lieu','p-url','p-notes'].forEach(fid=>document.getElementById(fid).value='');
  document.getElementById('p-date').value = todayISO();
  showToast('Candidature ajoutée à votre suivi');
  renderAll();
});

/* ---------- Init ---------- */
window.appReady = (async function init(){
  document.getElementById('lastVeilleText').textContent = 'Dernière recherche effectuée le ' + frDate(LAST_VEILLE_DATE) + '.';
  document.getElementById('p-statut').innerHTML = STATUTS.map(s=>`<option value="${s.key}" ${s.key==='envoyee'?'selected':''}>${s.label}</option>`).join('');
  document.getElementById('p-date').value = todayISO();
  await retireStaleListings();
  await importSeedIfNeeded();
  await loadListings();
  renderAll();
})();
