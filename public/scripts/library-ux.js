const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function initLoopingRails() {
  if (prefersReducedMotion()) return;

  const rails = Array.from(document.querySelectorAll(".home-page .book-rail"));
  rails.forEach((rail, index) => {
    const originalItems = Array.from(rail.children);
    if (originalItems.length < 3 || rail.dataset.loopReady === "true") return;

    rail.dataset.loopReady = "true";
    rail.dataset.loopRail = String(index + 1);
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

    let paused = false;
    let lastTime = 0;
    const speed = Number(rail.dataset.loopSpeed || 18 + index * 4);

    const pause = () => {
      paused = true;
      rail.classList.add("is-paused");
    };
    const play = () => {
      paused = false;
      rail.classList.remove("is-paused");
    };

    rail.addEventListener("mouseenter", pause);
    rail.addEventListener("mouseleave", play);
    rail.addEventListener("focusin", pause);
    rail.addEventListener("focusout", play);
    rail.addEventListener("pointerdown", pause);
    rail.addEventListener("pointerup", play);
    rail.addEventListener("touchstart", pause, { passive: true });
    rail.addEventListener("touchend", play, { passive: true });

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
  const threshold = () => Math.max(180, column.getBoundingClientRect().top + window.scrollY - 72);

  function update() {
    const immersive = window.scrollY > threshold();
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
