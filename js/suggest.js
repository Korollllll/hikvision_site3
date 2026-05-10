const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyLIF6lu68Swp9MdeQCUwUQVT3MrmtXHpK5aM6EbpGE_KdxgWUIJm3i3IWd9-XCTPQR5g/exec';

// ── ВАЛІДАЦІЯ ────────────────────────────────────────────────
function validateForm() {
  let valid = true;

  // Імʼя — обовʼязкове, мінімум 2 символи
  const name = document.getElementById('s-name').value.trim();
  if (name.length < 2) {
    setError('s-name', 'Введіть імʼя (мінімум 2 символи)');
    valid = false;
  } else {
    setError('s-name', '');
  }

  // Email — обовʼязковий, тільки коректний формат
  const contact = document.getElementById('s-contact').value.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
  if (contact.length === 0) {
    setError('s-contact', 'Введіть email — це обовʼязкове поле');
    valid = false;
  } else if (!isEmail) {
    setError('s-contact', 'Введіть коректний email (наприклад: name@domain.com)');
    valid = false;
  } else {
    setError('s-contact', '');
  }

  // Модель — обовʼязкова, мінімум 3 символи
  const model = document.getElementById('s-model').value.trim();
  if (model.length < 3) {
    setError('s-model', 'Введіть назву моделі (мінімум 3 символи)');
    valid = false;
  } else {
    setError('s-model', '');
  }

  return valid;
}

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  let err = field.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field-error';
    field.parentElement.appendChild(err);
  }
  err.textContent = message;
  field.style.borderColor = message ? 'var(--red)' : '';
  field.style.boxShadow   = message ? '0 0 0 3px rgba(232,0,29,0.1)' : '';
}

// ── MODAL OPEN / CLOSE ───────────────────────────────────────
function openSuggest() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSuggest() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    const form = document.getElementById('suggestForm');
    form.reset();
    form.style.display = 'flex';
    document.getElementById('suggestSuccess').style.display = 'none';
    // Скидаємо помилки
    ['s-name', 's-contact', 's-model'].forEach(id => setError(id, ''));
  }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeSuggest();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSuggest();
  });

  document.getElementById('suggestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    submitSuggest();
  });
});

// ── SUBMIT ───────────────────────────────────────────────────
function submitSuggest() {
  if (!validateForm()) return;

  const entry = {
    id:        Date.now(),
    timestamp: new Date().toISOString(),
    name:      document.getElementById('s-name').value.trim(),
    contact:   document.getElementById('s-contact').value.trim(),
    model:     document.getElementById('s-model').value.trim(),
    series:    document.getElementById('s-series').value,
    comment:   document.getElementById('s-comment').value.trim(),
    status:    'new'
  };

  // Зберігаємо локально
  const key = 'hik_suggestions';
  let existing = [];
  try { existing = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
  existing.push(entry);
  localStorage.setItem(key, JSON.stringify(existing));

  // Відправляємо в Google Sheets
  fetch(SHEET_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(entry)
  }).catch(err => console.warn('[suggest] Fetch error:', err));

  document.getElementById('suggestForm').style.display = 'none';
  document.getElementById('suggestSuccess').style.display = 'block';
}

// ── EXPORT для адміна (DevTools → Console) ───────────────────
window.exportSuggestions = function() {
  const data = JSON.parse(localStorage.getItem('hik_suggestions') || '[]');
  if (!data.length) { console.log('Немає записів'); return; }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'suggestions.json' });
  a.click();
  console.log(`Експортовано ${data.length} записів`);
};

window.showSuggestions = function() {
  const data = JSON.parse(localStorage.getItem('hik_suggestions') || '[]');
  console.table(data);
  return data;
};
