/* Navigasi antar halaman dan menu MASTER SMDT */
const VIEWS = ['view-landing', 'view-login', 'view-smdt-home', 'view-report', 'view-do', 'view-to', 'view-boq'];
/* Halaman di dalam aplikasi: menampilkan sidebar, topbar, dan navigasi bawah */
const APP_VIEWS = ['view-smdt-home', 'view-report', 'view-do', 'view-to', 'view-boq'];

function showView(id) {
  VIEWS.forEach(v => document.getElementById(v).classList.toggle('hidden', v !== id));
  document.body.classList.toggle('app-on', APP_VIEWS.includes(id));
  document.querySelectorAll('[data-nav]').forEach(b => {
    const on = b.dataset.nav === id;
    b.classList.toggle('is-active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  syncUserChrome();
  if (id === 'view-smdt-home' && typeof renderHome === 'function') renderHome();
  lucide.createIcons();
}

/* Nama, inisial, dan peran pengguna di sidebar dan topbar */
function syncUserChrome() {
  const n = (appState.user && appState.user.subconName) || 'ADMIN';
  document.querySelectorAll('[data-user-name]').forEach(e => e.textContent = n);
  document.querySelectorAll('[data-user-initial]').forEach(e => e.textContent = n.charAt(0).toUpperCase());
  document.querySelectorAll('[data-user-role]').forEach(e => e.textContent = n === 'ADMIN' ? 'Administrator · semua subcont' : 'Akun subkontraktor');
}

function openLoginPage() { showView('view-login'); window.scrollTo(0, 0); document.getElementById('login-subcont-input').focus(); }

function backToLandingFromLogin() { showView('view-landing'); window.scrollTo(0, 0); }

function backToSmdtHome() { showView('view-smdt-home'); window.scrollTo(0, 0); }

function openReportForm() { showView('view-report'); window.scrollTo(0, 0); }

const SMDT_MENU = [
  { name: 'Dashboard', sub: 'Ringkasan aktivitas', icon: 'layout-grid', tint: 'bg-[#e6f2f8] text-[#006699]' },
  { name: 'Total DO', sub: 'Delivery Order', icon: 'truck', tint: 'bg-sky-50 text-sky-600', view: 'view-do', init: 'initDO' },
  { name: 'Total TO', sub: 'Transfer Order', icon: 'refresh-cw', tint: 'bg-amber-50 text-amber-600', view: 'view-to', init: 'initTO' },
  { name: 'Total BOQ', sub: 'Bill of Quantity', icon: 'clipboard-list', tint: 'bg-lime-50 text-lime-700', view: 'view-boq', init: 'initBOQ' },
  { name: 'WHControl', sub: 'Laporan stok gudang', icon: 'warehouse', tint: 'bg-pink-50 text-pink-600', open: true }
];

let activeSmdtMenu = 'Dashboard';

/* Kartu akses cepat di beranda (Dashboard = beranda itu sendiri, jadi tidak ditampilkan) */
function renderSmdtMenu() {
  const list = document.getElementById('smdt-menu-list');
  if (!list) return;
  list.innerHTML = SMDT_MENU.map((m, i) => (m.view || m.open) ?
    '<button type="button" class="quick-card" onclick="selectSmdtMenu(SMDT_MENU[' + i + '])">' +
    '<div class="quick-ic ' + m.tint + '"><i data-lucide="' + m.icon + '" class="w-5 h-5"></i></div>' +
    '<div class="min-w-0 flex-1"><div class="quick-title">' + m.name + '</div><div class="quick-sub">' + m.sub + '</div></div>' +
    '<i data-lucide="arrow-up-right" class="quick-arrow w-4 h-4"></i></button>' : '').join('');
  lucide.createIcons();
}

function selectSmdtMenu(m) {
  if (m.open) { openReportForm(); return; }
  if (m.view) { if (m.init && typeof window[m.init] === 'function') window[m.init](); showView(m.view); window.scrollTo(0, 0); return; }
  backToSmdtHome();
}

/* Dipakai sidebar dan navigasi bawah */
function goNav(view) {
  if (view === 'view-smdt-home') { backToSmdtHome(); return; }
  if (view === 'view-report') { openReportForm(); return; }
  const m = SMDT_MENU.find(x => x.view === view);
  if (m) selectSmdtMenu(m);
}
