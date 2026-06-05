/* ==========================================================================
   Experimental Assistant Logic - app.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. Initial State & Configuration
  // ==========================================
  const state = {
    activePage: 'home',
    homeTab: 'tools', // 'tools' or 'timers'
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
  const pageSplitTimer = document.getElementById('page-split-timer');
  const pageDyeingTimer = document.getElementById('page-dyeing-timer');
  
  // Home tab groups
  const radioTabTools = document.getElementById('tab-tools');
  const radioTabTimers = document.getElementById('tab-timers');
  const groupTools = document.getElementById('group-tools');
  const groupTimers = document.getElementById('group-timers');
  
  // Navigation buttons
  const btnGoCollagen = document.querySelector('.menu-card[data-target="collagen"]');
  const btnGoHemocytometer = document.querySelector('.menu-card[data-target="hemocytometer"]');
  const btnGoSplit = document.querySelector('.menu-card[data-target="split-timer"]');
  const btnGoDyeing = document.querySelector('.menu-card[data-target="dyeing-timer"]');
  const btnBackHome = document.getElementById('btn-back-home');
  const btnBackHomeHemo = document.getElementById('btn-back-home-hemo');
  const btnBackHomeSplit = document.getElementById('btn-back-home-split');
  const btnBackHomeDyeing = document.getElementById('btn-back-home-dyeing');
  
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

  // Reset Buttons
  const btnResetForm = document.getElementById('btn-reset-form');
  const btnResetFormHemo = document.getElementById('btn-reset-form-hemo');

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
    if (pageSplitTimer) pageSplitTimer.classList.remove('active');
    if (pageDyeingTimer) pageDyeingTimer.classList.remove('active');

    if (pageId === 'home') {
      pageHome.classList.add('active');
    } else if (pageId === 'collagen') {
      pageCollagen.classList.add('active');
      document.querySelector('.app-container').scrollTop = 0;
      calculateAndRender();
    } else if (pageId === 'hemocytometer') {
      if (pageHemocytometer) {
        pageHemocytometer.classList.add('active');
        document.querySelector('.app-container').scrollTop = 0;
        calculateHemocytometer();
      }
    } else if (pageId === 'split-timer') {
      if (pageSplitTimer) {
        pageSplitTimer.classList.add('active');
        document.querySelector('.app-container').scrollTop = 0;
      }
    } else if (pageId === 'dyeing-timer') {
      if (pageDyeingTimer) {
        pageDyeingTimer.classList.add('active');
        document.querySelector('.app-container').scrollTop = 0;
      }
    }
  }

  // Home Screen Tab Switcher logic
  function updateHomeTab() {
    if (!radioTabTools || !radioTabTimers || !groupTools || !groupTimers) return;
    
    if (radioTabTools.checked) {
      state.homeTab = 'tools';
      groupTools.classList.remove('hidden');
      groupTimers.classList.add('hidden');
    } else if (radioTabTimers.checked) {
      state.homeTab = 'timers';
      groupTools.classList.add('hidden');
      groupTimers.classList.remove('hidden');
    }
  }

  if (radioTabTools) radioTabTools.addEventListener('change', updateHomeTab);
  if (radioTabTimers) radioTabTimers.addEventListener('change', updateHomeTab);

  // Event Listeners for Nav
  if (btnGoCollagen) btnGoCollagen.addEventListener('click', () => switchPage('collagen'));
  if (btnGoHemocytometer) btnGoHemocytometer.addEventListener('click', () => switchPage('hemocytometer'));
  if (btnGoSplit) btnGoSplit.addEventListener('click', () => switchPage('split-timer'));
  if (btnGoDyeing) btnGoDyeing.addEventListener('click', () => switchPage('dyeing-timer'));
  
  if (btnBackHome) btnBackHome.addEventListener('click', () => switchPage('home'));
  if (btnBackHomeHemo) btnBackHomeHemo.addEventListener('click', () => switchPage('home'));
  if (btnBackHomeSplit) btnBackHomeSplit.addEventListener('click', () => switchPage('home'));
  if (btnBackHomeDyeing) btnBackHomeDyeing.addEventListener('click', () => switchPage('home'));

  // ==========================================
  // 4. Dark/Light Theme Handler (Default to Dark)
  // ==========================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    // Default to dark theme if no preference is saved
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
      // Remove active class from all
      presetButtons.forEach(b => b.classList.remove('active'));
      // Add active to current
      btn.classList.add('active');

      const presetType = btn.dataset.preset;
      state.preset = presetType;

      if (presetType === 'custom') {
        // Unlock inputs
        inputCInit.removeAttribute('readonly');
        inputCTarget.removeAttribute('readonly');
        inputCInit.closest('.floating-input-group').classList.remove('locked');
        inputCTarget.closest('.floating-input-group').classList.remove('locked');
        presetStatusText.textContent = '농도값을 직접 수정할 수 있습니다.';
        presetStatusText.className = 'status-msg-info text-primary';
      } else {
        // Lock inputs & set values
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

  // Handle manual input in custom mode
  inputCInit.addEventListener('input', (e) => {
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

  // Volume Input handler
  inputVolume.addEventListener('input', (e) => {
    state.volume = parseFloat(e.target.value) || 0;
    calculateAndRender();
  });

  // ==========================================
  // 7. Pure Mathematical Engine (Collagen)
  // ==========================================
  /**
   * Calculates recipe proportions.
   * @param {number} cInit Initial concentration (mg/mL)
   * @param {number} cTarget Target concentration (mg/mL)
   * @param {number} volume Input volume (uL)
   * @param {string} mode 'collagen' or 'total' volume mode
   * @returns {object} Recipe results or error status
   */
  function calculateCollagenRecipe(cInit, cTarget, volume, mode) {
    if (cInit <= 0 || cTarget <= 0 || volume <= 0) {
      return { error: true, message: '모든 입력값은 0보다 커야 합니다.', type: 'invalid' };
    }

    // Physical constraint: Target concentration cannot exceed cInit / 1.125
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
      // total volume is fixed
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
      // Hide results, show warning card
      resultCard.classList.add('hidden');
      errorCard.classList.remove('hidden');

      if (result.type === 'constraint') {
        maxAchievableConcSpan.textContent = result.maxAchievableConc.toFixed(2);
        errorDesc.innerHTML = `PBS와 NaOH를 넣는 것만으로 콜라겐은 1.125배로 희석됩니다. 따라서 목표 농도는 시작 농도의 88.8% 이하(최대 <strong>${result.maxAchievableConc.toFixed(2)}</strong> mg/mL)여야만 조제가 가능합니다.`;
      } else {
        errorDesc.textContent = result.message || '입력값을 다시 확인해주세요.';
      }
    } else {
      // Hide warning card, show results
      errorCard.classList.add('hidden');
      resultCard.classList.remove('hidden');

      // Update concentrations displayed in labels dynamically
      if (recipeConcTitle) {
        recipeConcTitle.textContent = `(${state.cInit.toFixed(2)} → ${state.cTarget.toFixed(2)} mg/mL)`;
      }
      if (resCollagenConc) {
        resCollagenConc.textContent = `(${state.cInit.toFixed(2)} mg/mL)`;
      }
      if (resTotalConc) {
        resTotalConc.textContent = `(${state.cTarget.toFixed(2)} mg/mL)`;
      }

      // Update text values
      resCollagen.textContent = result.collagen.toFixed(2);
      resPbs.textContent = result.pbs.toFixed(2);
      resNaoh.textContent = result.naoh.toFixed(2);
      resSfm.textContent = Math.max(0, result.sfm).toFixed(2);
      resTotal.textContent = result.total.toFixed(2);

      // Render visually proportion bar
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

  // Reset Collagen Form
  btnResetForm.addEventListener('click', () => {
    presetButtons[0].click(); // Reset to Preset 1
    inputVolume.value = 1000;
    state.volume = 1000;
    inputVolume.focus();
    calculateAndRender();
  });

  // ==========================================
  // 9. Hemocytometer Logic & UI Rendering
  // ==========================================
  /**
   * Format numbers to scientific notation in HTML superscript style: X.XX x 10^Y unit
   */
  function formatScientificHTML(value, unit = "") {
    if (value <= 0) return `0.00 &times; 10<sup>0</sup> ${unit}`;
    const exponent = Math.floor(Math.log10(value));
    const base = value / Math.pow(10, exponent);
    return `${base.toFixed(2)} &times; 10<sup>${exponent}</sup> ${unit}`;
  }

  function calculateHemocytometer() {
    if (!pageHemocytometer) return;

    // 1. Core Stock density variables
    const cells = parseFloat(document.getElementById('hemo-cells').value) || 0;
    const stockVolume = parseFloat(document.getElementById('hemo-volume').value) || 0;

    // cell concentration per mL = cells * 2 * 10^4 = cells * 20000
    const density = cells * 20000;
    const totalCells = density * stockVolume;

    // Render Stock density stats using premium HTML formatting
    document.getElementById('hemo-res-density').innerHTML = formatScientificHTML(density, "cells/mL");
    document.getElementById('hemo-res-total-cells').innerHTML = formatScientificHTML(totalCells, "cells");

    // 2. Feature 1: Harvest Target Cells Volume Calculation
    const harvestBase = parseFloat(document.getElementById('harvest-base').value) || 0;
    const harvestExp = parseFloat(document.getElementById('harvest-exponent').value) || 0;
    const targetCells = harvestBase * Math.pow(10, harvestExp);
    
    const resHarvestVolSpan = document.getElementById('res-harvest-vol');
    if (density > 0 && targetCells > 0) {
      // Harvest Volume in uL = (targetCells / density) * 1000
      const harvestVol = (targetCells / density) * 1000;
      resHarvestVolSpan.textContent = harvestVol.toFixed(2);
    } else {
      resHarvestVolSpan.textContent = "0.00";
    }

    // 3. Feature 2: Target Dilution Recipe Calculation (Default target concentration base 5.0)
    const diluteBase = parseFloat(document.getElementById('dilute-base').value) || 0;
    const diluteExp = parseFloat(document.getElementById('dilute-exponent').value) || 0;
    const targetDensity = diluteBase * Math.pow(10, diluteExp);
    const targetVolume = parseFloat(document.getElementById('dilute-volume').value) || 0; // in mL

    const errorCardHemo = document.getElementById('hemo-error-card');
    const resultListHemo = document.getElementById('hemo-dilute-result-list');
    const resCellVolSpan = document.getElementById('res-dilute-cell-vol');
    const resMediaVolSpan = document.getElementById('res-dilute-media-vol');
    const resTotalVolSpan = document.getElementById('res-dilute-total-vol');

    if (targetDensity > density && density > 0) {
      // Dilution impossible: target density exceeds stock density
      errorCardHemo.classList.remove('hidden');
      resultListHemo.classList.add('hidden');
    } else {
      errorCardHemo.classList.add('hidden');
      resultListHemo.classList.remove('hidden');

      if (density > 0 && targetDensity > 0 && targetVolume > 0) {
        // stock cells volume in mL = targetVolume * (targetDensity / density)
        // stock cells in uL = cellVol * 1000
        const cellVol = targetVolume * (targetDensity / density) * 1000;
        const totalVol = targetVolume * 1000;
        const mediaVol = totalVol - cellVol;

        resCellVolSpan.textContent = cellVol.toFixed(2);
        resMediaVolSpan.textContent = Math.max(0, mediaVol).toFixed(2);
        resTotalVolSpan.textContent = totalVol.toFixed(2);
      } else {
        resCellVolSpan.textContent = "0.00";
        resMediaVolSpan.textContent = "0.00";
        resTotalVolSpan.textContent = "0.00";
      }
    }
  }

  // Register Hemo inputs listeners (Removed non-existent squares and dilution)
  const hemoInputIds = [
    'hemo-cells', 'hemo-volume',
    'harvest-base', 'harvest-exponent',
    'dilute-base', 'dilute-exponent', 'dilute-volume'
  ];
  hemoInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateHemocytometer);
    }
  });

  // Hemo reset handler
  if (btnResetFormHemo) {
    btnResetFormHemo.addEventListener('click', () => {
      document.getElementById('hemo-cells').value = 120;
      document.getElementById('hemo-volume').value = 1.0;
      
      document.getElementById('harvest-base').value = 1.5;
      document.getElementById('harvest-exponent').value = 5;
      
      document.getElementById('dilute-base').value = 5.0; // Reset target base concentration to 5.0
      document.getElementById('dilute-exponent').value = 5;
      document.getElementById('dilute-volume').value = 1.0;
      
      calculateHemocytometer();
      document.getElementById('hemo-cells').focus();
    });
  }

  // ==========================================
  // 10. PWA Installation & Service Worker
  // ==========================================
  // Register service worker if supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.log('Service Worker registration failed:', err);
        });
    });
  }

  // Handle PWA installation prompts
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
          console.log('User accepted PWA installation');
        }
        deferredPrompt = null;
      });
    }
  });

  btnCloseBanner.addEventListener('click', () => {
    installBanner.classList.add('hidden');
  });

  // ==========================================
  // 11. Initial Run
  // ==========================================
  calculateAndRender();
});
