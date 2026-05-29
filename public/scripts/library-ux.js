const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function initLoopingRails() {
  const reducedMotion = prefersReducedMotion();
  const rails = Array.from(document.querySelectorAll(".home-page .book-rail"));
  rails.forEach((rail, index) => {
    const shell = rail.closest("[data-rail-shell]") || rail;
    const prevButton = shell.querySelector("[data-rail-prev]");
    const nextButton = shell.querySelector("[data-rail-next]");
    const originalItems = Array.from(rail.children);
    if (originalItems.length < 2 || rail.dataset.railEnhanced === "true") return;

    rail.dataset.railEnhanced = "true";
    rail.dataset.loopRail = String(index + 1);

    let paused = false;
    let hovering = false;
    let focused = false;
    let resumeTimer = 0;
    let lastTime = 0;
    let middleStart = 0;
    let afterStart = 0;
    let loopSpan = 0;
    let resizeTimer = 0;

    const setPaused = (value) => {
      paused = value;
      rail.classList.toggle("is-paused", value);
      shell.classList.toggle("is-paused", value);
    };

    const pause = () => {
      window.clearTimeout(resumeTimer);
      setPaused(true);
    };

    const schedulePlay = (delay = 1450) => {
      if (reducedMotion || rail.dataset.loopReady !== "true") return;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        if (!hovering && !focused) setPaused(false);
      }, delay);
    };

    const createClone = (item, placement) => {
      const clone = item.cloneNode(true);
      clone.dataset.railClone = placement;
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      if ("inert" in clone) clone.inert = true;
      clone.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((interactive) => {
        interactive.tabIndex = -1;
        interactive.setAttribute("aria-hidden", "true");
      });
      return clone;
    };

    const measureLoop = () => {
      if (rail.dataset.loopReady !== "true") return;
      const firstOriginal = originalItems[0];
      const firstAfter = rail.querySelector('[data-rail-clone="after"]');
      if (!firstOriginal || !firstAfter) return;
      middleStart = firstOriginal.offsetLeft;
      afterStart = firstAfter.offsetLeft;
      loopSpan = afterStart - middleStart;
    };

    const normalizeScroll = () => {
      if (reducedMotion || rail.dataset.loopReady !== "true") return;
      if (!loopSpan) measureLoop();
      if (loopSpan <= 0) return;
      if (rail.scrollLeft < middleStart) {
        rail.scrollLeft += loopSpan;
      } else if (rail.scrollLeft >= afterStart) {
        rail.scrollLeft -= loopSpan;
      }
    };

    const jumpToMiddle = () => {
      measureLoop();
      if (loopSpan > 0) {
        rail.scrollLeft = middleStart;
      }
    };

    const getScrollAmount = () => {
      const firstCard = originalItems[0];
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : rail.clientWidth * 0.78;
      const railStyle = getComputedStyle(rail);
      const parsedGap = parseFloat(railStyle.columnGap || railStyle.gap || "0");
      const gap = Number.isFinite(parsedGap) ? parsedGap : 16;
      return Math.max(cardWidth + gap, rail.clientWidth * 0.72);
    };

    const ensureButtonRunway = (direction, amount) => {
      if (rail.dataset.loopReady !== "true") return;
      if (!loopSpan) measureLoop();
      if (loopSpan <= 0) return;
      const buffer = amount * 1.45;
      if (direction < 0 && rail.scrollLeft - middleStart < buffer) {
        rail.scrollLeft += loopSpan;
      } else if (direction > 0 && afterStart - rail.scrollLeft < buffer) {
        rail.scrollLeft -= loopSpan;
      }
    };

    const scrollRail = (direction) => {
      pause();
      const amount = getScrollAmount();
      ensureButtonRunway(direction, amount);
      rail.scrollBy({
        left: direction * amount,
        behavior: reducedMotion ? "auto" : "smooth"
      });
      window.setTimeout(() => {
        normalizeScroll();
        schedulePlay(1100);
      }, reducedMotion ? 0 : 860);
    };

    const pauseForInteraction = () => {
      pause();
      schedulePlay(1650);
    };

    const remeasureAfterResize = () => {
      if (rail.dataset.loopReady !== "true") return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const previousSpan = loopSpan || 1;
        const relativePosition = (rail.scrollLeft - middleStart) / previousSpan;
        measureLoop();
        if (loopSpan > 0) {
          const safeRelativePosition = Math.max(0, Math.min(0.98, relativePosition));
          rail.scrollLeft = middleStart + safeRelativePosition * loopSpan;
          normalizeScroll();
        }
      }, 140);
    };

    prevButton?.addEventListener("click", () => scrollRail(-1));
    nextButton?.addEventListener("click", () => scrollRail(1));

    shell.addEventListener("mouseenter", () => {
      hovering = true;
      pause();
    });
    shell.addEventListener("mouseleave", () => {
      hovering = false;
      schedulePlay(900);
    });
    shell.addEventListener("focusin", () => {
      focused = true;
      pause();
    });
    shell.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!shell.contains(document.activeElement)) {
          focused = false;
          schedulePlay(900);
        }
      }, 0);
    });
    shell.addEventListener("pointerdown", pause);
    shell.addEventListener("pointerup", () => schedulePlay(1550));
    shell.addEventListener("pointercancel", () => schedulePlay(1550));
    shell.addEventListener("touchstart", pause, { passive: true });
    shell.addEventListener("touchend", () => schedulePlay(1550), { passive: true });
    shell.addEventListener("touchcancel", () => schedulePlay(1550), { passive: true });
    shell.addEventListener("wheel", pauseForInteraction, { passive: true });
    shell.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown", " "].includes(event.key)) {
        pauseForInteraction();
      }
    });
    rail.addEventListener("scroll", normalizeScroll, { passive: true });
    window.addEventListener("resize", remeasureAfterResize, { passive: true });

    if (reducedMotion || originalItems.length < 4) {
      rail.dataset.loopReady = "manual";
      return;
    }

    const beforeClones = originalItems.map((item) => createClone(item, "before"));
    const afterClones = originalItems.map((item) => createClone(item, "after"));
    rail.prepend(...beforeClones);
    rail.append(...afterClones);

    rail.dataset.loopReady = "true";
    requestAnimationFrame(jumpToMiddle);

    const speed = Number(rail.dataset.loopSpeed || 18 + index * 4);

    function tick(time) {
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!paused && document.visibilityState === "visible") {
        rail.scrollLeft += speed * delta;
        normalizeScroll();
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

function initPageReveals() {
  if (prefersReducedMotion()) return;

  const items = document.querySelectorAll(".home-page .book-card, .home-page .glass-panel, .home-page .featured-book, .signal-map, .book-grid .book-card");
  if (!items.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  items.forEach((item, index) => {
    item.classList.add("reveal-surface");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 8, 7) * 35}ms`);
    observer.observe(item);
  });
}

function initReaderImmersion() {
  if (!document.body.classList.contains("reader-mode")) return;

  const reader = document.querySelector(".freedom-reader");
  const column = document.querySelector(".reader-column");
  if (!reader || !column) return;

  let ticking = false;
  let immersive = false;
  const threshold = () => Math.max(190, column.getBoundingClientRect().top + window.scrollY - 92);

  function update() {
    const base = threshold();
    const enterAt = base + 86;
    const exitAt = base - 58;

    if (!immersive && window.scrollY > enterAt) {
      immersive = true;
    } else if (immersive && window.scrollY < exitAt) {
      immersive = false;
    }

    document.body.classList.toggle("reader-immersive", immersive);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  update();
}

initLoopingRails();
initPageReveals();
initReaderImmersion();
