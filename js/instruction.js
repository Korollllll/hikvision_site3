let camData = null;
let currentLevel = 'beginner';
let currentStep = 0;

function getSteps() {
  return camData.instructions[currentLevel];
}

function renderStep() {
  const steps = getSteps();
  const step = steps[currentStep];
  const total = steps.length;

  document.getElementById('stepNumber').innerHTML = `// КРОК <span class="step-num-value">${step.step}</span> З <span class="step-num-value">${total}</span>`;
  document.getElementById('stepLabel').textContent = `КРОК ${step.step}`;
  document.getElementById('stepCount').textContent = `${step.step} / ${total}`;
  document.getElementById('stepTitle').textContent = step.title;
  document.getElementById('stepDesc').textContent = step.description;

  const img = document.getElementById('stepImage');
  const placeholder = document.getElementById('stepImgPlaceholder');

  if (step.image && step.image !== 'images/step-placeholder.svg') {
    img.src = step.image;
    img.alt = step.title;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    // Show styled placeholder
    img.style.display = 'none';
    placeholder.style.display = 'block';
    const phLabel = placeholder.querySelector('.ph-label');
    if (phLabel) {
      phLabel.innerHTML = `Ілюстрація: ${step.title}<span class="ph-size">step-0${step.step}.jpg · ~800×600 px</span>`;
    }
  }

  const fill = (step.step / total) * 100;
  document.getElementById('progressFill').style.width = fill + '%';

  document.getElementById('prevBtn').disabled = currentStep === 0;
  document.getElementById('nextBtn').disabled = currentStep === total - 1;

  document.title = `${step.title} — ${camData.name} — Hikvision`;
}

function switchLevel(level) {
  currentLevel = level;
  currentStep = 0;
  document.getElementById('btnBeginner').classList.toggle('active', level === 'beginner');
  document.getElementById('btnExpert').classList.toggle('active', level === 'expert');
  renderStep();
}

function prevStep() {
  if (currentStep > 0) { currentStep--; renderStep(); }
}

function nextStep() {
  const steps = getSteps();
  if (currentStep < steps.length - 1) { currentStep++; renderStep(); }
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { showError(); return; }

  try {
    const res = await fetch(`data/${id}.json`);
    if (!res.ok) throw new Error('not found');
    camData = await res.json();

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('instructionContent').style.display = 'block';

    document.getElementById('camName').textContent = camData.name;
    document.getElementById('camImage').src = camData.image;
    document.getElementById('camImage').alt = camData.name;
    document.getElementById('camSeries').textContent = camData.series;
    document.getElementById('camType').textContent = camData.type;
    document.getElementById('camRes').textContent = camData.resolution;

    const specsList = document.getElementById('camSpecs');
    specsList.innerHTML = '<ul>' + camData.specs.map(s => `<li>${s}</li>`).join('') + '</ul>';

    renderStep();
  } catch (e) {
    showError();
  }
}

function showError() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorState').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevStep();
  if (e.key === 'ArrowRight') nextStep();
});
