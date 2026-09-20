/**
 * ============================================================
 *  UZARA CORE ENGINE
 *  Scroll-driven hardware rendering and sequence telemetry.
 *  Handles asset pipelining, canvas draw calls, and scroll state.
 * ============================================================
 */
(() => {
  'use strict';

  const CFG = window.SCROLLY_CONFIG;
  const frameCount = CFG.frames.count;

  // ---------------------------------------------------------
  // 1. Cinematic Chapter Generation
  // ---------------------------------------------------------
  const chaptersHost = document.getElementById('chapters');

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Wrap individual words for staggered CSS animation reveals
  const wrapWords = (text) => {
    return escapeHtml(text)
      .split(' ')
      .map((word, i) => `<span class="word" style="--i:${i}">${word}</span>`)
      .join(' ');
  };

  const chapters = CFG.chapters.map((ch) => {
    const el = document.createElement('div');
    const alignClass = `chapter--${ch.align === 'right' ? 'right' : ch.align === 'center' ? 'center' : 'left'}`;
    el.className = `chapter ${alignClass} ${ch.emphasis ? 'chapter--xl' : ''}`;
    
    el.innerHTML = `
      <span class="chapter__eyebrow">${escapeHtml(ch.eyebrow || '')}</span>
      <h2 class="chapter__title">${wrapWords(ch.title || '')}</h2>
      <p class="chapter__body">${escapeHtml(ch.body || '')}</p>
    `;
    
    chaptersHost.appendChild(el);
    return { el, start: ch.start, end: ch.end };
  });

  // ---------------------------------------------------------
  // 2. Asset Pipeline & Preloading
  // ---------------------------------------------------------
  const images = new Array(frameCount);
  let loadedCount = 0;
  let loadErrorCount = 0;

  const loaderEl = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderError = document.getElementById('loaderError');

  const frameSrc = (oneIndexed) => {
    const n = String(oneIndexed).padStart(CFG.frames.padLength, '0');
    return `${CFG.frames.path}${CFG.frames.prefix}${n}${CFG.frames.extension}`;
  };

  console.info(`[UZARA System] Asset pipeline initialized. Target zero-frame: ${frameSrc(1)}`);

  // Surface initialization errors if the pipeline stalls
  const stallTimer = setTimeout(() => {
    if (loadedCount === 0 && loaderError) {
      loaderError.hidden = false;
    }
  }, 6000);

  const onFrameSettled = (success) => {
    loadedCount++;
    if (!success) loadErrorCount++;
    if (loadedCount === 1) clearTimeout(stallTimer);

    const pct = Math.round((loadedCount / frameCount) * 100);
    loaderFill.style.width = `${pct}%`;
    loaderPercent.textContent = `${pct}%`;

    if (loadedCount >= frameCount) {
      if (loadErrorCount > 0) {
        console.warn(`[UZARA System] Warning: ${loadErrorCount}/${frameCount} frames failed to load. Verify config.js asset parameters.`);
      }
      // Halt execution if critical asset failure occurs
      if (loadErrorCount >= frameCount * 0.5 && loaderError) {
        loaderError.hidden = false;
        return;
      }
      
      loaderEl.classList.add('is-done');
      setTimeout(() => loaderEl.remove(), 600);
      initializeEngine();
    }
  };

  const loadFrame = (zeroIndex) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { images[zeroIndex] = img; onFrameSettled(true); resolve(); };
      img.onerror = () => {
        console.warn(`[UZARA System] Missing asset target: ${frameSrc(zeroIndex + 1)}`);
        onFrameSettled(false);
        resolve();
      };
      img.src = frameSrc(zeroIndex + 1);
    });
  };

  const preloadSequence = async (concurrencyLevel) => {
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < frameCount) {
        const i = nextIndex++;
        await loadFrame(i);
      }
    };
    const workers = Array.from({ length: concurrencyLevel }, worker);
    await Promise.all(workers);
  };

  // ---------------------------------------------------------
  // 3. Hardware Canvas Rendering
  // ---------------------------------------------------------
  const canvas = document.getElementById('scrollyCanvas');
  const ctx = canvas.getContext('2d');
  let currentFrame = 0;

  const resizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    renderFrame();
  };

  const drawToCanvas = (index) => {
    const img = images[index];
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;

    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;
    let sx, sy, sw, sh;

    // Mathematical simulation of CSS background-size: cover
    if (imgRatio > canvasRatio) {
      sh = ih;
      sw = ih * canvasRatio;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      sw = iw;
      sh = iw / canvasRatio;
      sx = 0;
      sy = (ih - sh) / 2;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  };

  const renderFrame = () => drawToCanvas(currentFrame);

  // ---------------------------------------------------------
  // 4. Scroll Telemetry & State Management
  // ---------------------------------------------------------
  const wrap = document.getElementById('scrollyWrap');
  const progressFill = document.getElementById('scrollyProgressFill');
  const counterEl = document.getElementById('scrollyCounter');
  let ticking = false;

  const calculateScrollProgress = () => {
    const rect = wrap.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    if (scrollableDistance <= 0) return 0;
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / scrollableDistance));
  };

  const syncChapterState = (progress) => {
    chapters.forEach((c) => {
      const isActive = progress >= c.start && progress <= c.end;
      c.el.classList.toggle('is-active', isActive);
    });
  };

  const formatCounter = (n) => String(n).padStart(3, '0');

  const processScrollTelemetry = () => {
    if (ticking) return;
    ticking = true;
    
    requestAnimationFrame(() => {
      const progress = calculateScrollProgress();
      currentFrame = Math.min(frameCount - 1, Math.round(progress * (frameCount - 1)));
      
      renderFrame();
      progressFill.style.transform = `scaleX(${progress})`;
      counterEl.textContent = `${formatCounter(currentFrame + 1)} / ${frameCount}`;
      syncChapterState(progress);
      
      ticking = false;
    });
  };

  // ---------------------------------------------------------
  // 5. System Initialization
  // ---------------------------------------------------------
  const initializeEngine = () => {
    wrap.style.height = `${CFG.scrollLengthVh}vh`;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', processScrollTelemetry, { passive: true });
    processScrollTelemetry();
  };

  // Initiate preloading pipeline with parallel stream workers
  preloadSequence(8);
})();