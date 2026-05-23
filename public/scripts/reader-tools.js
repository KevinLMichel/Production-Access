const PROGRESS_KEY = "klm.library.progress.v1";
const PREFS_KEY = "klm.library.readerPrefs.v1";
const HIGHLIGHTS_KEY = "klm.library.highlights.v1";

if (document.body.classList.contains("reader-mode")) {
  initReaderTools();
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initReaderTools() {
  const prose = document.querySelector(".freedom-prose");
  const readerColumn = document.querySelector(".reader-column");
  if (!prose || !readerColumn) return;

  const pathKey = window.location.pathname;
  const book = document.querySelector(".reader-sidebar__back")?.textContent?.trim() || "Library reading";
  const section = document.querySelector(".reader-header h1")?.textContent?.trim() || document.title;
  const originalProseHtml = prose.innerHTML;
  const prefs = readJson(PREFS_KEY, { scale: 1, theme: "default" });

  const progress = document.createElement("div");
  progress.className = "reader-progress";
  progress.innerHTML = "<span></span>";
  document.body.append(progress);

  const tools = document.createElement("aside");
  tools.className = "reader-tools";
  tools.setAttribute("aria-label", "Reader tools");
  tools.innerHTML = `
    <button type="button" class="reader-tools__toggle" data-reader-toggle>Reader tools</button>
    <div class="reader-tools__panel">
      <p>Local reader memory</p>
      <div class="reader-tools__row" aria-label="Font size">
        <button type="button" data-reader-font="-">A-</button>
        <button type="button" data-reader-font="+">A+</button>
      </div>
      <div class="reader-tools__row" aria-label="Reader theme">
        <button type="button" data-reader-theme="default">Night</button>
        <button type="button" data-reader-theme="sepia">Sepia</button>
        <button type="button" data-reader-theme="focus">Focus</button>
      </div>
      <button type="button" data-reader-mark>Mark read</button>
      <button type="button" data-reader-highlight>Highlight selection</button>
      <button type="button" data-reader-clear>Clear highlights</button>
      <small>Highlights are saved on this device and may reset if the text changes.</small>
    </div>
  `;
  document.body.append(tools);

  function applyPrefs() {
    document.documentElement.style.setProperty("--reader-font-scale", String(prefs.scale || 1));
    document.body.classList.toggle("reader-theme-sepia", prefs.theme === "sepia");
    document.body.classList.toggle("reader-theme-focus", prefs.theme === "focus");
  }

  function saveProgress(read = false) {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const current = Math.max(0, Math.min(1, window.scrollY / max));
    const all = readJson(PROGRESS_KEY, {});
    all[pathKey] = {
      href: pathKey,
      book,
      section,
      progress: read ? 1 : current,
      read: read || all[pathKey]?.read || false,
      lastReadAt: Date.now()
    };
    writeJson(PROGRESS_KEY, all);
  }

  function updateProgress() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const current = Math.max(0, Math.min(1, window.scrollY / max));
    progress.querySelector("span").style.transform = `scaleX(${current})`;
    saveProgress(false);
  }

  function getHighlights() {
    const all = readJson(HIGHLIGHTS_KEY, {});
    return all[pathKey] || [];
  }

  function setHighlights(items) {
    const all = readJson(HIGHLIGHTS_KEY, {});
    all[pathKey] = items;
    writeJson(HIGHLIGHTS_KEY, all);
  }

  function applyHighlight(text, id) {
    const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const index = node.nodeValue.indexOf(text);
      if (index === -1) continue;

      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + text.length);
      const mark = document.createElement("mark");
      mark.className = "reader-highlight";
      mark.dataset.highlightId = id;
      range.surroundContents(mark);
      return true;
    }
    return false;
  }

  function renderHighlights() {
    prose.innerHTML = originalProseHtml;
    getHighlights().forEach((item) => applyHighlight(item.text, item.id));
  }

  function addSelectionHighlight() {
    const selection = window.getSelection();
    const text = selection?.toString().replace(/\s+/g, " ").trim();
    if (!selection || !text || text.length < 4 || !prose.contains(selection.anchorNode) || !prose.contains(selection.focusNode)) return;

    const highlights = getHighlights();
    if (!highlights.some((item) => item.text === text)) {
      highlights.push({ id: `hl-${Date.now()}`, text, createdAt: Date.now() });
      setHighlights(highlights.slice(-40));
    }
    selection.removeAllRanges();
    renderHighlights();
  }

  tools.querySelector("[data-reader-toggle]")?.addEventListener("click", () => {
    tools.classList.toggle("is-open");
  });

  tools.querySelectorAll("[data-reader-font]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-reader-font");
      prefs.scale = Math.max(0.88, Math.min(1.24, (prefs.scale || 1) + (direction === "+" ? 0.06 : -0.06)));
      writeJson(PREFS_KEY, prefs);
      applyPrefs();
    });
  });

  tools.querySelectorAll("[data-reader-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      prefs.theme = button.getAttribute("data-reader-theme") || "default";
      writeJson(PREFS_KEY, prefs);
      applyPrefs();
    });
  });

  tools.querySelector("[data-reader-mark]")?.addEventListener("click", () => saveProgress(true));
  tools.querySelector("[data-reader-highlight]")?.addEventListener("click", addSelectionHighlight);
  tools.querySelector("[data-reader-clear]")?.addEventListener("click", () => {
    setHighlights([]);
    renderHighlights();
  });

  applyPrefs();
  renderHighlights();
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
}
