const PROGRESS_KEY = "klm.library.progress.v1";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
}

function writeUrlState(state) {
  const params = new URLSearchParams();
  if (state.topic) params.set("topic", state.topic);
  if (state.shelf) params.set("shelf", state.shelf);
  if (state.status) params.set("status", state.status);
  if (state.q) params.set("q", state.q);
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
  window.history.replaceState({}, "", next);
}

function updatePressed(buttons, value, attr) {
  buttons.forEach((button) => {
    const active = (button.getAttribute(attr) || "") === value;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function initDiscovery() {
  const panel = document.querySelector("[data-library-discovery]");
  const grid = document.querySelector("[data-book-grid]");
  if (!panel || !grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-book-card]"));
  const search = panel.querySelector("[data-library-search]");
  const count = panel.querySelector("[data-library-result-count]");
  const empty = document.querySelector("[data-library-empty]");
  const clear = panel.querySelector("[data-library-clear]");
  const topicButtons = Array.from(panel.querySelectorAll("[data-topic-filter]"));
  const shelfButtons = Array.from(panel.querySelectorAll("[data-shelf-filter]"));
  const statusButtons = Array.from(panel.querySelectorAll("[data-status-filter]"));
  const params = new URLSearchParams(window.location.search);
  const state = {
    topic: params.get("topic") || "",
    shelf: params.get("shelf") || "",
    status: params.get("status") || "",
    q: params.get("q") || ""
  };

  if (search) search.value = state.q;

  function matches(card) {
    const query = state.q.trim().toLowerCase();
    const title = card.dataset.bookTitle || "";
    const topics = card.dataset.bookTopics || "";
    const shelves = card.dataset.bookShelves || "";
    const status = card.dataset.bookStatus || "";
    const formats = card.dataset.bookFormats || "";
    const haystack = `${title} ${topics} ${shelves} ${status} ${formats}`;

    if (query && !haystack.includes(query)) return false;
    if (state.topic && !topics.includes(state.topic.toLowerCase())) return false;
    if (state.shelf && !shelves.includes(state.shelf.toLowerCase())) return false;
    if (state.status && status !== state.status) return false;
    return true;
  }

  function render() {
    let visible = 0;
    const hasActiveFilter = Boolean(state.topic || state.shelf || state.status || state.q.trim());
    cards.forEach((card) => {
      const show = matches(card);
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (count) count.textContent = `${visible} ${visible === 1 ? "title" : "titles"} showing`;
    if (empty) empty.hidden = visible !== 0;
    panel.classList.toggle("has-active-filter", hasActiveFilter);
    updatePressed(topicButtons, state.topic, "data-topic-filter");
    updatePressed(shelfButtons, state.shelf, "data-shelf-filter");
    updatePressed(statusButtons, state.status, "data-status-filter");
    writeUrlState(state);
  }

  topicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.topic = button.getAttribute("data-topic-filter") || "";
      render();
    });
  });

  shelfButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.shelf = button.getAttribute("data-shelf-filter") || "";
      render();
    });
  });

  statusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.status = button.getAttribute("data-status-filter") || "";
      render();
    });
  });

  search?.addEventListener("input", () => {
    state.q = search.value;
    render();
  });

  clear?.addEventListener("click", (event) => {
    event.preventDefault();
    state.topic = "";
    state.shelf = "";
    state.status = "";
    state.q = "";
    if (search) search.value = "";
    render();
  });

  render();
}

function initDashboard() {
  const dashboard = document.querySelector("[data-library-dashboard]");
  if (!dashboard) return;

  const progress = Object.values(readJson(PROGRESS_KEY, {}))
    .filter((entry) => entry && entry.href)
    .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));

  const latest = progress[0];
  const title = dashboard.querySelector("[data-dashboard-title]");
  const copy = dashboard.querySelector("[data-dashboard-copy]");
  const link = dashboard.querySelector("[data-dashboard-link]");
  const signals = dashboard.querySelector("[data-dashboard-signals]");

  if (latest) {
    const percent = Math.max(0, Math.min(100, Math.round((latest.progress || 0) * 100)));
    if (title) title.textContent = latest.book || "Continue reading";
    if (copy) copy.textContent = `${latest.section || "Last section"} - ${latest.read ? "marked read" : `${percent}% complete`}.`;
    if (link) {
      link.href = latest.href;
      link.textContent = latest.read ? "Reopen section" : "Resume reading";
    }
  }

  if (signals) {
    const recent = progress.slice(0, 4).map((entry) => entry.book).filter(Boolean);
    if (recent.length) {
      signals.replaceChildren(
        ...recent.map((item) => {
          const signal = document.createElement("span");
          signal.textContent = item;
          return signal;
        })
      );
    }
  }
}

initDiscovery();
initDashboard();
