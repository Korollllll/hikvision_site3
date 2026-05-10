let allCameras = [];
const activeFilters = {};

async function loadCatalog() {
  try {
    const res = await fetch('data/catalog.json');
    allCameras = await res.json();
    renderCatalog(allCameras);
    updateResultCount(allCameras.length);
  } catch (e) {
    console.error('Помилка завантаження каталогу:', e);
  }
}

function renderCatalog(cameras) {
  const grid = document.getElementById('catalogGrid');
  const noRes = document.getElementById('noResults');
  if (cameras.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = 'block';
    return;
  }
  noRes.style.display = 'none';
  grid.innerHTML = cameras.map(cam => `
    <article class="cam-card">
      <div class="cam-card-img">
        <img src="${cam.image}" alt="${cam.name}" loading="lazy">
      </div>
      <div class="cam-card-body">
        <span class="cam-card-series">${cam.series}</span>
        <h3>${cam.name}</h3>
        <p class="cam-card-desc">${cam.shortDesc}</p>
        <div class="cam-card-footer">
          <span class="cam-card-type">${cam.type} · ${cam.resolution}</span>
          <a href="instruction.html?id=${cam.id}" class="cam-card-btn">Інструкція →</a>
        </div>
      </div>
    </article>
  `).join('');
}

function filterCameras() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const filtered = allCameras.filter(cam => {
    const matchQ = !q ||
      cam.name.toLowerCase().includes(q) ||
      cam.series.toLowerCase().includes(q) ||
      cam.type.toLowerCase().includes(q);
    const matchSeries = !activeFilters.series     || cam.series === activeFilters.series;
    const matchType   = !activeFilters.type       || cam.type === activeFilters.type;
    const matchRes    = !activeFilters.resolution || cam.resolution === activeFilters.resolution;
    const matchFocal  = !activeFilters.focal      || cam.focal === activeFilters.focal;
    const matchProt   = !activeFilters.protection || cam.protection.includes(activeFilters.protection);
    const matchTech   = !activeFilters.technology || cam.technology === activeFilters.technology;
    return matchQ && matchSeries && matchType && matchRes && matchFocal && matchProt && matchTech;
  });
  renderCatalog(filtered);
  updateResultCount(filtered.length);
}

function updateResultCount(count) {
  const el = document.getElementById('resultCount');
  if (el) el.textContent = count + ' ' + (count === 1 ? 'камера' : count < 5 ? 'камери' : 'камер');
}

function setFilter(key, value) {
  if (activeFilters[key] === value) {
    delete activeFilters[key];
  } else {
    activeFilters[key] = value;
  }
  document.querySelectorAll(`[data-filter-key="${key}"]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filterValue === activeFilters[key]);
  });
  updateActiveCount();
  filterCameras();
}

function resetFilters() {
  Object.keys(activeFilters).forEach(k => delete activeFilters[k]);
  document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
  document.getElementById('searchInput').value = '';
  updateActiveCount();
  filterCameras();
}

function updateActiveCount() {
  const count = Object.keys(activeFilters).length;
  const badge = document.getElementById('filterBadge');
  if (badge) { badge.textContent = count || ''; badge.style.display = count ? 'flex' : 'none'; }
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) resetBtn.style.display = count ? 'inline-flex' : 'none';
}

function toggleGroup(id) {
  const body = document.getElementById(id);
  const icon = document.querySelector(`[data-group="${id}"] .fg-icon`);
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'flex';
  if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();
  initSidebar();
  initCalc();
  window.addEventListener('resize', () => { initSidebar(); initCalc(); });
  document.getElementById('searchInput').addEventListener('input', filterCameras);
});

function toggleSidebar() {
  const body = document.getElementById('sidebarBody');
  const icon = document.getElementById('sidebarToggleIcon');
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  icon.classList.toggle('collapsed', isOpen);
}

function initSidebar() {
  const body = document.getElementById('sidebarBody');
  const icon = document.getElementById('sidebarToggleIcon');
  if (!body || !icon) return;
  if (window.innerWidth <= 860) {
    body.style.display = 'none';
    icon.classList.add('collapsed');
  } else {
    body.style.display = 'block';
    icon.classList.remove('collapsed');
  }
}


// ── КАЛЬКУЛЯТОР — ЗГОРТАННЯ ─────────────────────────────────
function toggleCalc() {
  const body = document.getElementById('calcBody');
  const icon = document.getElementById('calcToggleIcon');
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  icon.classList.toggle('collapsed', isOpen);
}

function initCalc() {
  const body = document.getElementById('calcBody');
  const icon = document.getElementById('calcToggleIcon');
  if (!body || !icon) return;
  if (window.innerWidth <= 860) {
    body.style.display = 'none';
    icon.classList.add('collapsed');
  } else {
    body.style.display = 'block';
    icon.classList.remove('collapsed');
  }
}

// ── КАЛЬКУЛЯТОР ФОКУСНОЇ ВІДСТАНІ ───────────────────────────
function calcFocal() {
  const distance = parseFloat(document.getElementById('fc-distance').value);
  const width    = parseFloat(document.getElementById('fc-width').value);
  const sensor   = parseFloat(document.getElementById('fc-sensor').value);

  if (!distance || !width || distance <= 0 || width <= 0) {
    alert('Введіть коректні значення відстані та ширини');
    return;
  }

  const focal = (sensor * distance) / width;

  let hint = '';
  if (focal <= 2.8)       hint = 'Рекомендовано: об\'єктив 2.8 мм — широкий кут, ідеально для входів і коридорів';
  else if (focal <= 4.0)  hint = 'Рекомендовано: об\'єктив 4 мм — стандартний кут огляду для більшості сценаріїв';
  else if (focal <= 6.0)  hint = 'Рекомендовано: об\'єктив 6 мм — середній телефото, паркінги та вулиці';
  else if (focal <= 8.0)  hint = 'Рекомендовано: об\'єктив 8 мм — телефото для периметру';
  else if (focal <= 12.0) hint = 'Рекомендовано: варіофокальний 2.8–12 мм або фіксований 12 мм';
  else                    hint = 'Рекомендовано: варіофокальний об\'єктив або PTZ-камера';

  document.getElementById('focalValue').textContent = focal.toFixed(1) + ' мм';
  document.getElementById('focalHint').textContent = hint;
  document.getElementById('focalResult').style.display = 'flex';
}
