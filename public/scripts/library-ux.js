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
    const pause = () => {
      paused = true;
      rail.classList.add("is-paused");
      shell.classList.add("is-paused");
    };
    const play = () => {
      paused = false;
      rail.classList.remove("is-paused");
      shell.classList.remove("is-paused");
    };

    const normalizeScroll = () => {
      if (reducedMotion || rail.dataset.loopReady !== "true") return;
      const loopPoint = rail.scrollWidth / 2;
      if (loopPoint <= 0) return;
      if (rail.scrollLeft >= loopPoint) {
        rail.scrollLeft -= loopPoint;
      } else if (rail.scrollLeft < 0) {
        rail.scrollLeft += loopPoint;
      }
    };

    const scrollRail = (direction) => {
      pause();
      const firstCard = originalItems[0];
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : rail.clientWidth * 0.78;
      const railStyle = getComputedStyle(rail);
      const parsedGap = parseFloat(railStyle.columnGap || railStyle.gap || "0");
      const gap = Number.isFinite(parsedGap) ? parsedGap : 16;
      if (direction < 0 && rail.dataset.loopReady === "true" && rail.scrollLeft < cardWidth + gap) {
        rail.scrollLeft += rail.scrollWidth / 2;
      }
      rail.scrollBy({ left: direction * Math.max(cardWidth + gap, rail.clientWidth * 0.72), behavior: "smooth" });
      window.setTimeout(() => {
        normalizeScroll();
        play();
      }, 760);
    };

    prevButton?.addEventListener("click", () => scrollRail(-1));
    nextButton?.addEventListener("click", () => scrollRail(1));

    shell.addEventListener("mouseenter", pause);
    shell.addEventListener("mouseleave", play);
    shell.addEventListener("focusin", pause);
    shell.addEventListener("focusout", play);
    shell.addEventListener("pointerdown", pause);
    shell.addEventListener("pointerup", play);
    shell.addEventListener("touchstart", pause, { passive: true });
    shell.addEventListener("touchend", play, { passive: true });
    rail.addEventListener("scroll", normalizeScroll, { passive: true });

    if (reducedMotion || originalItems.length < 3) {
      rail.dataset.loopReady = "manual";
      return;
    }

    rail.dataset.loopReady = "true";
    originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      clone.querySelectorAll("a, button").forEach((interactive) => {
        interactive.tabIndex = -1;
        interactive.setAttribute("aria-hidden", "true");
      });
      rail.append(clone);
    });

    let lastTime = 0;
    const speed = Number(rail.dataset.loopSpeed || 18 + index * 4);

    function tick(time) {
      if (!lastTime) lastTime = time;
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!paused && document.visibilityState === "visible") {
        const loopPoint = rail.scrollWidth / 2;
        rail.scrollLeft += speed * delta;
        if (rail.scrollLeft >= loopPoint) {
          rail.scrollLeft -= loopPoint;
        }
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
