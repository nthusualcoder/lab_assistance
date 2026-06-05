/* ==========================================================================
   Experimental Assistant Logic - app.js (v형민 Version)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Initial State & Configuration
  // ==========================================
  const state = {
    activePage: 'home',
    preset: 'preset-1', // 'preset-1', 'preset-2', 'custom'
    cInit: 8.64,
    cTarget: 6.00,
    inputMode: 'collagen', // 'collagen' or 'total'
    volume: 1000 // Default Collagen Volume is 1000 uL
  };

  // ==========================================
  // 2. DOM Elements Cache
  // ==========================================
  // Navigation pages
  const pageHome = document.getElementById('page-home');
  const pageCollagen = document.getElementById('page-collagen');
  const pageHemocytometer = document.getElementById('page-hemocytometer');
  const pageSpheroid = document.getElementById('page-spheroid');
  
  // Navigation buttons
  const btnGoCollagen = document.querySelector('.menu-card[data-target="collagen"]');
  const btnGoHemocytometer = document.querySelector('.menu-card[data-target="hemocytometer"]');
  const btnGoSpheroid = document.querySelector('.menu-card[data-target="spheroid"]');
  
  const btnBackHome = document.getElementById('btn-back-home');
  const btnBackHomeHemo = document.getElementById('btn-back-home-hemo');
  const btnBackHomeSph = document.getElementById('btn-back-home-sph');
  
  // Theme Controls
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');

  // Collagen Form Elements
  const presetButtons = document.querySelectorAll('.btn-preset');
  const inputCInit = document.getElementById('input-c-init');
  const inputCTarget = document.getElementById('input-c-target');
  const radioModeCollagen = document.getElementById('mode-collagen');
  const radioModeTotal = document.getElementById('mode-total');
  const inputVolume = document.getElementById('input-volume');
  const labelVolume = document.getElementById('label-volume');
  const presetStatusText = document.getElementById('preset-status-text');

  // Collagen Result Elements
  const resultCard = document.getElementById('result-card');
  const errorCard = document.getElementById('error-card');
  const errorDesc = document.getElementById('error-desc');
  const maxAchievableConcSpan = document.getElementById('max-achievable-conc');
  
  const recipeConcTitle = document.getElementById('recipe-conc-title');
  const resCollagenConc = document.getElementById('res-collagen-conc');
  const resTotalConc = document.getElementById('res-total-conc');
  
  const resCollagen = document.getElementById('res-collagen');
  const resPbs = document.getElementById('res-pbs');
  const resNaoh = document.getElementById('res-naoh');
  const resSfm = document.getElementById('res-sfm');
  const resTotal = document.getElementById('res-total');

  // Collagen Portion Bar Elements
  const barCol = document.querySelector('.portion-col');
  const barPbs = document.querySelector('.portion-pbs');
  const barSfm = document.querySelector('.portion-sfm');
  const barNaoh = document.querySelector('.portion-naoh');

  // Spheroid Form Elements
  const inputSphHemoCells = document.getElementById('sph-hemo-cells');
  const inputSphCurrentVol = document.getElementById('sph-current-vol');
  const inputSphNewVol = document.getElementById('sph-new-vol');
  const inputSphPlateWells = document.getElementById('sph-plate-wells');
  const inputSphMicrowells = document.getElementById('sph-microwells');
  const inputSphCellsPerMicro = document.getElementById('sph-cells-per-micro');
  const inputSphFinalVol = document.getElementById('sph-final-vol');
  const sphResDensity = document.getElementById('sph-res-density');
  const sphResTotalCells = document.getElementById('sph-res-total-cells');
  const sphResNewDensity = document.getElementById('sph-res-new-density');
  const sphRequiredInfoBox = document.getElementById('sph-required-info-box');
  
  // Spheroid Result Elements
  const sphResultCard = document.getElementById('sph-result-card');
  const sphErrorCard = document.getElementById('sph-error-card');
  const sphErrorTitle = document.getElementById('sph-error-title');
  const sphErrorDesc = document.getElementById('sph-error-desc');
  
  const resSphWellCells = document.getElementById('res-sph-well-cells');
  const resSphRequiredCells = document.getElementById('res-sph-required-cells');
  const resSphTakeVol = document.getElementById('res-sph-take-vol');
  const resSphMediaVol = document.getElementById('res-sph-media-vol');
  const resSphTotalVol = document.getElementById('res-sph-total-vol');
  
  const barSphCell = document.querySelector('.spheroid-portion-cell');
  const barSphMedia = document.querySelector('.spheroid-portion-media');

  // Reset Buttons
  const btnResetForm = document.getElementById('btn-reset-form');
  const btnResetFormHemo = document.getElementById('btn-reset-form-hemo');
  const btnResetFormSph = document.getElementById('btn-reset-form-sph');

  // PWA elements
  const installBanner = document.getElementById('install-banner');
  const btnInstall = document.getElementById('btn-install');
  const btnCloseBanner = document.getElementById('btn-close-banner');
  let deferredPrompt = null;

  // ==========================================
  // 3. Routing (SPA Page Switching)
  // ==========================================
  function switchPage(pageId) {
    state.activePage = pageId;
    
    // Hide all pages, show the selected one
    pageHome.classList.remove('active');
    pageCollagen.classList.remove('active');
    if (pageHemocytometer) pageHemocytometer.classList.remove('active');
    if (pageSpheroid) pageSpheroid.classList.remove('active');

    const appContainer = document.querySelector('.app-container');

    if (pageId === 'home') {
      pageHome.classList.add('active');
    } else if (pageId === 'collagen') {
      pageCollagen.classList.add('active');
      appContainer.scrollTop = 0;
      calculateAndRender();
    } else if (pageId === 'hemocytometer') {
      if (pageHemocytometer) {
        pageHemocytometer.classList.add('active');
        appContainer.scrollTop = 0;
        calculateHemocytometer();
      }
    } else if (pageId === 'spheroid') {
      if (pageSpheroid) {
        pageSpheroid.classList.add('active');
        appContainer.scrollTop = 0;
        calculateSpheroid();
      }
    }
  }

  // Event Listeners for Nav
  btnGoCollagen.addEventListener('click', () => switchPage('collagen'));
  if (btnGoHemocytometer) {
    btnGoHemocytometer.addEventListener('click', () => switchPage('hemocytometer'));
  }
  if (btnGoSpheroid) {
    btnGoSpheroid.addEventListener('click', () => switchPage('spheroid'));
  }
  btnBackHome.addEventListener('click', () => switchPage('home'));
  if (btnBackHomeHemo) {
    btnBackHomeHemo.addEventListener('click', () => switchPage('home'));
  }
  if (btnBackHomeSph) {
    btnBackHomeSph.addEventListener('click', () => switchPage('home'));
  }

  // ==========================================
  // 4. Dark/Light Theme Handler (Default to Dark)
  // ==========================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme', !isDark);
    
    if (isDark) {
      localStorage.setItem('theme', 'dark');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      localStorage.setItem('theme', 'light');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  });

  initTheme();

  // ==========================================
  // 5. Presets Management (Collagen)
  // ==========================================
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetType = btn.dataset.preset;
      state.preset = presetType;

      if (presetType === 'custom') {
        inputCInit.removeAttribute('readonly');
        inputCTarget.removeAttribute('readonly');
        inputCInit.closest('.floating-input-group').classList.remove('locked');
        inputCTarget.closest('.floating-input-group').classList.remove('locked');
        presetStatusText.textContent = '농도값을 직접 수정할 수 있습니다.';
        presetStatusText.className = 'status-msg-info text-primary';
      } else {
        inputCInit.setAttribute('readonly', 'true');
        inputCTarget.setAttribute('readonly', 'true');
        inputCInit.closest('.floating-input-group').classList.add('locked');
        inputCTarget.closest('.floating-input-group').classList.add('locked');
        
        state.cInit = parseFloat(btn.dataset.init);
        state.cTarget = parseFloat(btn.dataset.target);
        
        inputCInit.value = state.cInit;
        inputCTarget.value = state.cTarget;
        
        presetStatusText.textContent = '농도값이 프리셋으로 고정되었습니다.';
        presetStatusText.className = 'status-msg-info';
      }
      
      calculateAndRender();
    });
  });

  inputCInit.addEventListener('input', (e) => {
    if (state.preset === 'custom') {
      state.cInit = parseFloat(e.target.value) || 0;
      calculateAndRender();
    }
  });
  inputCInit.addEventListener('change', (e) => {
    if (state.preset === 'custom') {
      state.cInit = parseFloat(e.target.value) || 0;
      calculateAndRender();
    }
  });

  inputCTarget.addEventListener('input', (e) => {
    if (state.preset === 'custom') {
      state.cTarget = parseFloat(e.target.value) || 0;
      calculateAndRender();
    }
  });
  inputCTarget.addEventListener('change', (e) => {
    if (state.preset === 'custom') {
      state.cTarget = parseFloat(e.target.value) || 0;
      calculateAndRender();
    }
  });

  // ==========================================
  // 6. Calculation Modes (Segmented Toggle - Collagen)
  // ==========================================
  function updateInputMode() {
    if (radioModeCollagen.checked) {
      state.inputMode = 'collagen';
      labelVolume.textContent = '콜라겐 부피 (Collagen)';
    } else {
      state.inputMode = 'total';
      labelVolume.textContent = '최종 목표 부피 (Total)';
    }
    calculateAndRender();
  }

  radioModeCollagen.addEventListener('change', updateInputMode);
  radioModeTotal.addEventListener('change', updateInputMode);

  inputVolume.addEventListener('input', (e) => {
    state.volume = parseFloat(e.target.value) || 0;
    calculateAndRender();
  });
  inputVolume.addEventListener('change', (e) => {
    state.volume = parseFloat(e.target.value) || 0;
    calculateAndRender();
  });

  // ==========================================
  // 7. Pure Mathematical Engine (Collagen)
  // ==========================================
  function calculateCollagenRecipe(cInit, cTarget, volume, mode) {
    if (cInit <= 0 || cTarget <= 0 || volume <= 0) {
      return { error: true, message: '모든 입력값은 0보다 커야 합니다.', type: 'invalid' };
    }

    const maxTargetConc = cInit / 1.125;
    if (cTarget > maxTargetConc) {
      return { 
        error: true, 
        message: `제조 불가`, 
        maxAchievableConc: maxTargetConc,
        type: 'constraint'
      };
    }

    let vCol = 0;
    let vTotal = 0;

    if (mode === 'collagen') {
      vCol = volume;
      vTotal = vCol * (cInit / cTarget);
    } else {
      vTotal = volume;
      vCol = vTotal * (cTarget / cInit);
    }

    const vPbs = vCol * 0.1;
    const vNaoh = vCol * 0.025;
    const vSfm = vTotal - (vCol + vPbs + vNaoh);

    return {
      error: false,
      collagen: vCol,
      pbs: vPbs,
      naoh: vNaoh,
      sfm: vSfm,
      total: vTotal
    };
  }

  // ==========================================
  // 8. View Rendering (Collagen)
  // ==========================================
  function calculateAndRender() {
    const result = calculateCollagenRecipe(state.cInit, state.cTarget, state.volume, state.inputMode);

    if (result.error) {
      resultCard.classList.add('hidden');
      errorCard.classList.remove('hidden');

      if (result.type === 'constraint') {
        maxAchievableConcSpan.textContent = result.maxAchievableConc.toFixed(2);
        errorDesc.innerHTML = `PBS와 NaOH를 넣는 것만으로 콜라겐은 1.125배로 희석됩니다. 따라서 목표 농도는 시작 농도의 88.8% 이하(최대 <strong>${result.maxAchievableConc.toFixed(2)}</strong> mg/mL)여야만 조제가 가능합니다.`;
      } else {
        errorDesc.textContent = result.message || '입력값을 다시 확인해주세요.';
      }
    } else {
      errorCard.classList.add('hidden');
      resultCard.classList.remove('hidden');

      if (recipeConcTitle) {
        recipeConcTitle.textContent = `(${state.cInit.toFixed(2)} → ${state.cTarget.toFixed(2)} mg/mL)`;
      }
      if (resCollagenConc) {
        resCollagenConc.textContent = `(${state.cInit.toFixed(2)} mg/mL)`;
      }
      if (resTotalConc) {
        resTotalConc.textContent = `(${state.cTarget.toFixed(2)} mg/mL)`;
      }

      resCollagen.textContent = result.collagen.toFixed(2);
      resPbs.textContent = result.pbs.toFixed(2);
      resNaoh.textContent = result.naoh.toFixed(2);
      resSfm.textContent = Math.max(0, result.sfm).toFixed(2);
      resTotal.textContent = result.total.toFixed(2);

      const colPercent = (result.collagen / result.total) * 100;
      const pbsPercent = (result.pbs / result.total) * 100;
      const sfmPercent = (Math.max(0, result.sfm) / result.total) * 100;
      const naohPercent = (result.naoh / result.total) * 100;

      barCol.style.width = `${colPercent}%`;
      barPbs.style.width = `${pbsPercent}%`;
      barSfm.style.width = `${sfmPercent}%`;
      barNaoh.style.width = `${naohPercent}%`;
    }
  }

  btnResetForm.addEventListener('click', () => {
    presetButtons[0].click();
    inputVolume.value = 1000;
    state.volume = 1000;
    inputVolume.focus();
    calculateAndRender();
  });

  // ==========================================
  // 9. Hemocytometer Logic & UI Rendering
  // ==========================================
  function formatScientificHTML(value, unit = "") {
    if (value <= 0) return `0.00 &times; 10<sup>0</sup> ${unit}`;
    const exponent = Math.floor(Math.log10(value));
    const base = value / Math.pow(10, exponent);
    return `${base.toFixed(2)} &times; 10<sup>${exponent}</sup> ${unit}`;
  }

  function calculateHemocytometer() {
    if (!pageHemocytometer) return;

    const hemoCellsInput = document.getElementById('hemo-cells');
    const hemoVolumeInput = document.getElementById('hemo-volume');
    if (!hemoCellsInput || !hemoVolumeInput) return;

    const cells = parseFloat(hemoCellsInput.value) || 0;
    const stockVolume = parseFloat(hemoVolumeInput.value) || 0;

    // cell concentration per mL = cells * 10^4 = cells * 10000
    const density = cells * 10000;
    const totalCells = density * stockVolume;

    const resDensityEl = document.getElementById('hemo-res-density');
    const resTotalCellsEl = document.getElementById('hemo-res-total-cells');
    if (resDensityEl) resDensityEl.innerHTML = formatScientificHTML(density, "cells/mL");
    if (resTotalCellsEl) resTotalCellsEl.innerHTML = formatScientificHTML(totalCells, "cells");

    const harvestBaseInput = document.getElementById('harvest-base');
    const harvestExponentInput = document.getElementById('harvest-exponent');
    if (harvestBaseInput && harvestExponentInput) {
      const harvestBase = parseFloat(harvestBaseInput.value) || 0;
      const harvestExp = parseFloat(harvestExponentInput.value) || 0;
      const targetCells = harvestBase * Math.pow(10, harvestExp);
      
      const resHarvestVolSpan = document.getElementById('res-harvest-vol');
      if (resHarvestVolSpan) {
        if (density > 0 && targetCells > 0) {
          const harvestVol = (targetCells / density) * 1000;
          resHarvestVolSpan.textContent = harvestVol.toFixed(2);
        } else {
          resHarvestVolSpan.textContent = "0.00";
        }
      }
    }

    const diluteBaseInput = document.getElementById('dilute-base');
    const diluteExponentInput = document.getElementById('dilute-exponent');
    const diluteVolumeInput = document.getElementById('dilute-volume');
    if (diluteBaseInput && diluteExponentInput && diluteVolumeInput) {
      const diluteBase = parseFloat(diluteBaseInput.value) || 0;
      const diluteExp = parseFloat(diluteExponentInput.value) || 0;
      const targetDensity = diluteBase * Math.pow(10, diluteExp);
      const targetVolume = parseFloat(diluteVolumeInput.value) || 0;

      const errorCardHemo = document.getElementById('hemo-error-card');
      const resultListHemo = document.getElementById('hemo-dilute-result-list');
      const resCellVolSpan = document.getElementById('res-dilute-cell-vol');
      const resMediaVolSpan = document.getElementById('res-dilute-media-vol');
      const resTotalVolSpan = document.getElementById('res-dilute-total-vol');

      if (targetDensity > density && density > 0) {
        if (errorCardHemo) errorCardHemo.classList.remove('hidden');
        if (resultListHemo) resultListHemo.classList.add('hidden');
      } else {
        if (errorCardHemo) errorCardHemo.classList.add('hidden');
        if (resultListHemo) resultListHemo.classList.remove('hidden');

        if (density > 0 && targetDensity > 0 && targetVolume > 0) {
          const cellVol = targetVolume * (targetDensity / density) * 1000;
          const totalVol = targetVolume * 1000;
          const mediaVol = totalVol - cellVol;

          if (resCellVolSpan) resCellVolSpan.textContent = cellVol.toFixed(2);
          if (resMediaVolSpan) resMediaVolSpan.textContent = Math.max(0, mediaVol).toFixed(2);
          if (resTotalVolSpan) resTotalVolSpan.textContent = totalVol.toFixed(2);
        } else {
          if (resCellVolSpan) resCellVolSpan.textContent = "0.00";
          if (resMediaVolSpan) resMediaVolSpan.textContent = "0.00";
          if (resTotalVolSpan) resTotalVolSpan.textContent = "0.00";
        }
      }
    }
  }

  const hemoInputIds = [
    'hemo-cells', 'hemo-volume',
    'harvest-base', 'harvest-exponent',
    'dilute-base', 'dilute-exponent', 'dilute-volume'
  ];
  hemoInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateHemocytometer);
      el.addEventListener('change', calculateHemocytometer);
    }
  });

  if (btnResetFormHemo) {
    btnResetFormHemo.addEventListener('click', () => {
      document.getElementById('hemo-cells').value = 120;
      document.getElementById('hemo-volume').value = 1.0;
      
      document.getElementById('harvest-base').value = 1.5;
      document.getElementById('harvest-exponent').value = 5;
      
      document.getElementById('dilute-base').value = 5.0;
      document.getElementById('dilute-exponent').value = 5;
      document.getElementById('dilute-volume').value = 1.0;
      
      calculateHemocytometer();
      document.getElementById('hemo-cells').focus();
    });
  }

  // ==========================================
  // 10. Microwell Spheroid Logic & UI Rendering
  // ==========================================
  function calculateSpheroid() {
    if (!pageSpheroid) return;
    if (!inputSphHemoCells || !inputSphCurrentVol || !inputSphNewVol || !inputSphPlateWells || !inputSphMicrowells || !inputSphCellsPerMicro || !inputSphFinalVol) return;

    // 1. Parse previous stock information from Hemocytometer inputs
    const cellsCount = parseFloat(inputSphHemoCells.value) || 0;
    const vCurrent = parseFloat(inputSphCurrentVol.value) || 0;

    // Stock concentration: C_current = cellsCount * 10000 cells/mL
    const cCurrent = cellsCount * 10000;
    const nTotal = cCurrent * vCurrent;

    // Display previous stock density and total cells
    if (sphResDensity) sphResDensity.innerHTML = formatScientificHTML(cCurrent, "cells/mL");
    if (sphResTotalCells) sphResTotalCells.innerHTML = formatScientificHTML(nTotal, "cells");

    // 1.5. Parse new stock (diluted) volume & calculate new density
    const vNewCurrent = parseFloat(inputSphNewVol.value) || 0;
    const cCurrentNew = vNewCurrent > 0 ? (nTotal / vNewCurrent) : 0;

    // Display new dispensed density
    if (sphResNewDensity) sphResNewDensity.innerHTML = formatScientificHTML(cCurrentNew, "cells/mL");

    // 2. Parse target setup information
    const plateWells = parseInt(inputSphPlateWells.value) || 0;
    const mWell = parseInt(inputSphMicrowells.value) || 0;
    const nMicro = parseInt(inputSphCellsPerMicro.value) || 0;
    const vFinalPrep = parseFloat(inputSphFinalVol.value) || 0; // mL (Well당 분주 부피)

    // Mathematical targets (개정 공식)
    const nWell = mWell * nMicro; // Well당 필요 세포 수
    const nPlate = nWell * plateWells; // Well 수 * Well당 필요 세포 수
    const nRequired = nWell * plateWells; // 목표 총 필요 세포 수 (Well 수 * Well당 필요 세포 수)
    const cTarget = nWell / vFinalPrep; // 목표 세포 농도 (cells/mL) = Well당 필요 세포 수 / Well당 분주 부피
    const vTotalPrepUL = plateWells * vFinalPrep * 1000; // 목표 총 준비 부피 (uL) = Well 수 * Well당 분주 부피 (mL) * 1000

    // Display dynamic required cells information summary
    if (sphRequiredInfoBox) {
      const nWellKorean = (nWell / 10000).toFixed(1).replace(".0", "") + "만";
      const nPlateKorean = (nPlate / 10000).toFixed(1).replace(".0", "") + "만";
      
      sphRequiredInfoBox.innerHTML = `
      👉 <strong>1 well당 필요 세포 수</strong>: ${nWell.toLocaleString()} cells (${formatScientificHTML(nWell, "cells")}, 총 ${nWellKorean} 개)<br>
      👉 <strong>총 (${plateWells} well) 필요 세포 수</strong>: ${nPlate.toLocaleString()} cells (${formatScientificHTML(nPlate, "cells")}, 총 ${nPlateKorean} 개)
      `;
    }

    // 3. Boundary & constraint checking
    let hasError = false;
    let errTitleText = "";
    let errDescText = "";

    if (vCurrent <= 0 || nTotal <= 0 || vNewCurrent <= 0 || mWell <= 0 || nMicro <= 0 || vFinalPrep <= 0 || plateWells <= 0) {
      hasError = true;
      errTitleText = "입력값 오류";
      errDescText = "모든 입력값은 0보다 큰 숫자여야 계산할 수 있습니다.";
    } else if (nRequired > nTotal) {
      hasError = true;
      errTitleText = "보유 세포 수 부족";
      errDescText = `목표 현탁액을 만들기 위해 총 <strong>${nRequired.toLocaleString()}</strong>개(${formatScientificHTML(nRequired)})의 세포가 필요하지만, 현재 보유 중인 세포는 총 <strong>${nTotal.toLocaleString()}</strong>개(${formatScientificHTML(nTotal)})입니다.`;
    } else {
      // Calculate taking volume in uL: V_take = (N_required / C_current_new) * 1000
      const vTake = (nRequired / cCurrentNew) * 1000;

      if (vTake > vTotalPrepUL) {
        hasError = true;
        errTitleText = "희석 조제 불가능";
        errDescText = `목표 세포 농도(<strong>${cTarget.toLocaleString()}</strong> cells/mL)가 현재 세포 분주액 농도(<strong>${cCurrentNew.toLocaleString()}</strong> cells/mL)보다 높습니다. 원액보다 더 진하게 희석 조제할 수는 없습니다. 원액을 원심분리하여 농축해 주셔야 합니다.`;
      }
    }

    // 4. Render UI according to status
    if (hasError) {
      if (sphResultCard) sphResultCard.classList.add('hidden');
      if (sphErrorCard) {
        sphErrorCard.classList.remove('hidden');
        if (sphErrorTitle) sphErrorTitle.textContent = errTitleText;
        if (sphErrorDesc) sphErrorDesc.innerHTML = errDescText;
      }
    } else {
      if (sphErrorCard) sphErrorCard.classList.add('hidden');
      if (sphResultCard) {
        sphResultCard.classList.remove('hidden');

        // Success recipe calculation
        const vTake = (nRequired / cCurrentNew) * 1000;
        const vMedia = vTotalPrepUL - vTake;

        // Display numeric outputs
        if (resSphWellCells) resSphWellCells.innerHTML = formatScientificHTML(nWell, "cells");
        if (resSphRequiredCells) resSphRequiredCells.innerHTML = formatScientificHTML(nRequired, "cells");
        
        if (resSphTakeVol) resSphTakeVol.textContent = vTake.toFixed(2);
        if (resSphMediaVol) resSphMediaVol.textContent = Math.max(0, vMedia).toFixed(2);
        if (resSphTotalVol) resSphTotalVol.textContent = vTotalPrepUL.toFixed(2);

        // Portion bars
        const cellPercent = (vTake / vTotalPrepUL) * 100;
        const mediaPercent = (Math.max(0, vMedia) / vTotalPrepUL) * 100;

        if (barSphCell) barSphCell.style.width = `${cellPercent}%`;
        if (barSphMedia) barSphMedia.style.width = `${mediaPercent}%`;
      }
    }
  }

  // Register spheroid inputs change triggers
  const sphInputIds = [
    'sph-hemo-cells', 'sph-current-vol', 'sph-new-vol', 'sph-plate-wells',
    'sph-microwells', 'sph-cells-per-micro', 'sph-final-vol'
  ];
  sphInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateSpheroid);
      el.addEventListener('change', calculateSpheroid);
    }
  });

  // Spheroid reset button trigger
  if (btnResetFormSph) {
    btnResetFormSph.addEventListener('click', () => {
      if (inputSphHemoCells) inputSphHemoCells.value = "100";
      if (inputSphCurrentVol) inputSphCurrentVol.value = "15.0";
      if (inputSphNewVol) inputSphNewVol.value = "1.0";
      if (inputSphPlateWells) inputSphPlateWells.value = "1";
      if (inputSphMicrowells) inputSphMicrowells.value = "1200";
      if (inputSphCellsPerMicro) inputSphCellsPerMicro.value = "200";
      if (inputSphFinalVol) inputSphFinalVol.value = "1.0";

      calculateSpheroid();
      if (inputSphHemoCells) inputSphHemoCells.focus();
    });
  }

  // ==========================================
  // 11. PWA Installation & Service Worker
  // ==========================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('Service Worker registered successfully (v형민):', reg.scope);
          // Detect updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker version detected! Auto-reloading page.');
                window.location.reload();
              }
            });
          });
        })
        .catch((err) => {
          console.log('Service Worker registration failed (v형민):', err);
        });
    });

    // Reload the page when the controller changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.remove('hidden');
  });

  btnInstall.addEventListener('click', () => {
    if (deferredPrompt) {
      installBanner.classList.add('hidden');
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA installation (v형민)');
        }
        deferredPrompt = null;
      });
    }
  });

  btnCloseBanner.addEventListener('click', () => {
    installBanner.classList.add('hidden');
  });

  // ==========================================
  // 12. Initial Run
  // ==========================================
  calculateAndRender();
});
