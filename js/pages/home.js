/* WHControl - Beranda: ringkasan DO dan BOQ dari data yang sudah dimuat (mengikuti akun yang login) */
const HOME_STATUS_COLOR = { 'rfsc': '#65a30d', 'boq opname': '#0284c7', 'redline': '#e11d48', 'fo cut': '#d97706', 'vandalisme': '#9333ea' };
const homeEsc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const homeMsg = (t, err) => '<div class="py-10 px-4 text-center text-sm ' + (err ? 'text-rose-600' : 'text-slate-500') + '">' + homeEsc(t) + '</div>';

/* Batang horizontal: [{ label, n, color }] */
function homeBars(items, total) {
  return items.map(x => {
    const pct = total ? x.n / total * 100 : 0;
    return '<div><div class="flex items-center justify-between gap-3 text-[13px]">' +
      '<span class="flex items-center gap-2 font-semibold text-slate-700 min-w-0"><span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + x.color + '"></span><span class="truncate">' + homeEsc(x.label) + '</span></span>' +
      '<span class="shrink-0 tabular-nums"><b class="text-slate-900">' + nf(x.n) + '</b><span class="text-slate-400 text-xs ml-1.5">' + (pct < 1 && pct > 0 ? '<1' : Math.round(pct)) + '%</span></span></div>' +
      '<div class="bar-track mt-1.5"><div class="bar-fill" style="width:' + Math.max(pct, x.n ? 1.5 : 0) + '%;background:' + x.color + '"></div></div></div>';
  }).join('');
}

function renderHome() {
  const $ = id => document.getElementById(id);
  if (!$('home-k-do')) return;
  const doOk = doStatus === 'ready', boqOk = boqStatus === 'ready';
  const dos = doOk ? doScope() : [], boqs = boqOk ? boqScope() : [];
  const val = (ok, st, n) => ok ? nf(n) : (st === 'error' ? 'Gagal' : '…');

  $('home-date').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('home-k-do').textContent = val(doOk, doStatus, dos.length);
  $('home-k-boq').textContent = val(boqOk, boqStatus, boqs.length);
  $('home-k-cable').textContent = val(doOk, doStatus, dos.reduce((t, d) => t + d.cable, 0));
  $('home-k-device').textContent = val(doOk, doStatus, dos.reduce((t, d) => t + d.device, 0));

  /* DO terbaru (data DO sudah terurut dari tanggal terbaru) */
  const adm = doIsAdmin();
  $('home-latest').innerHTML = !doOk ? homeMsg(doStatus === 'error' ? (doError || 'Data DO gagal dimuat.') : 'Memuat data DO…', doStatus === 'error')
    : !dos.length ? homeMsg('Belum ada DO untuk akun ini.')
    : dos.slice(0, 6).map((d, i) =>
      '<button type="button" class="home-row" onclick="homeOpenDO(' + i + ')">' +
      '<div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0"><i data-lucide="truck" class="w-[18px] h-[18px]"></i></div>' +
      '<div class="min-w-0 flex-1"><div class="text-[13.5px] font-extrabold text-slate-900 truncate">' + homeEsc(d.no) + '</div>' +
      '<div class="text-xs text-slate-500 truncate">' + homeEsc(d.date) + ' · ' + (adm ? homeEsc(d.sub) + ' · ' : '') + homeEsc(d.city) + '</div></div>' +
      '<div class="text-right shrink-0 hidden sm:block"><div class="text-[13px] font-extrabold text-slate-900 tabular-nums">' + nf(d.rows.length) + '</div><div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">material</div></div>' +
      '<i data-lucide="chevron-right" class="w-4 h-4 text-slate-300 shrink-0"></i></button>').join('');

  /* Status BOQ dan region */
  if (!boqOk) {
    const m = homeMsg(boqStatus === 'error' ? (boqError || 'Data BOQ gagal dimuat.') : 'Memuat data BOQ…', boqStatus === 'error');
    $('home-status').innerHTML = m; $('home-region').innerHTML = m;
  } else if (!boqs.length) {
    $('home-status').innerHTML = homeMsg('Belum ada BOQ untuk akun ini.'); $('home-region').innerHTML = '';
  } else {
    const so = s => { const i = BOQ_STATUS_ORDER.findIndex(x => x.toLowerCase() === s.toLowerCase()); return i < 0 ? 99 : i; };
    const st = {}, rg = {};
    boqs.forEach(b => { const s = b.status || 'Tanpa status'; st[s] = (st[s] || 0) + 1; rg[b.region] = (rg[b.region] || 0) + 1; });
    $('home-status').innerHTML = homeBars(Object.entries(st).sort((a, b) => so(a[0]) - so(b[0]) || b[1] - a[1])
      .map(([label, n]) => ({ label, n, color: HOME_STATUS_COLOR[label.toLowerCase()] || '#94a3b8' })), boqs.length);
    $('home-region').innerHTML = homeBars(Object.entries(rg).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([label, n]) => ({ label, n, color: '#006699' })), boqs.length);
  }
  lucide.createIcons();
}

/* Buka halaman DO lalu langsung tampilkan detail DO yang dipilih */
function homeOpenDO(i) { goNav('view-do'); doOpen(i); }

/* Perbarui beranda setiap kali satu file data selesai dimuat */
const homeSourceDone = sourceDone;
sourceDone = function (names) {
  homeSourceDone(names);
  if (!document.getElementById('view-smdt-home').classList.contains('hidden')) renderHome();
};
