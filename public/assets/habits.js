let state = {
  view: "list",    // list | grid
  query: "",
  filterTime: "All",
  filterArea: "All",
  selectedId: null,
  habits: [],
};

function iconEmoji(name) {
  const m = {
    flame: "🔥",
    moon: "🧘‍♀️",
    droplet: "💧",
    book: "📚",
    run: "🏃‍♀️",
    gym: "🏋️",
    heart: "❤️",
    timer: "⏱️",
  };
  return m[name] || "✨";
}

function computeAreas(habits) {
  const set = new Set(habits.map(h => h.area || "General"));
  return ["All", ...Array.from(set).sort()];
}

function habitProgressText(h) {
  const a = Number(h.todayCount || 0);
  const b = Number(h.targetPerDay || 1);
  return `${a} / ${b} times`;
}

function applyFilters() {
  const q = trim(state.query).toLowerCase();
  return state.habits
    .filter(h => !h.archived)
    .filter(h => {
      if (!q) return true;
      const hay = `${h.title} ${h.description} ${h.area} ${h.timeOfDay}`.toLowerCase();
      return hay.includes(q);
    })
    .filter(h => state.filterTime === "All" ? true : h.timeOfDay === state.filterTime)
    .filter(h => state.filterArea === "All" ? true : h.area === state.filterArea);
}

function render() {
  fillSidebarUser();
  setNowDot();
  setActiveNav();

  $("#viewBtn").textContent = (state.view === "list") ? "List" : "Grid";

  // Sync Topbar Dropdowns
  const tBtn = $("#timeBtn");
  if (tBtn) tBtn.textContent = (state.filterTime === "All") ? "All day ▾" : `${state.filterTime} ▾`;

  const aBtn = $("#areaBtn");
  if (aBtn) aBtn.textContent = (state.filterArea === "All") ? "All ▾" : `${state.filterArea} ▾`;

  $("#search").value = state.query;

  const list = applyFilters();
  $("#count").textContent = `${list.length} habits`;

  const wrap = $("#habitsWrap");
  wrap.className = state.view === "grid" ? "grid cols-3" : "grid cols-1";
  wrap.innerHTML = "";

  if (list.length === 0) {
    wrap.innerHTML = `
      <div class="card" style="text-align:center; padding:28px;">
        <div style="font-size:30px;">✨</div>
        <div style="font-weight:800; margin-top:6px;">No habits found</div>
        <div class="help" style="margin-top:6px;">Create your first habit and start tracking it.</div>
        <div style="margin-top:12px;">
          <a class="btn primary" href="habit-form.html">＋ Add habit</a>
        </div>
      </div>`;
  } else {
    list.forEach(h => wrap.appendChild(renderHabitCard(h)));
  }

  renderBottomBar(list);
}

function renderHabitCard(h) {
  const div = document.createElement("div");
  div.className = "card";
  div.tabIndex = 0;
  div.style.cursor = "pointer";
  div.onclick = () => toggleSelect(h.id);

  const selected = state.selectedId === h.id;
  if (selected) div.style.outline = "2px solid rgba(109,123,255,.45)";

  const done = Number(h.todayCount || 0) >= Number(h.targetPerDay || 1);

  div.innerHTML = `
    <div class="card-head">
      <div class="card-title">
        <div class="icon">${iconEmoji(h.icon)}</div>
        <div style="min-width:0">
          <p class="h-name">${escapeHtml(h.title)}</p>
          <div class="h-sub">${escapeHtml(h.description || "")}</div>
        </div>
      </div>
      <div class="actions">
        <a class="btn small js-edit" href="habit-form.html?id=${encodeURIComponent(h.id)}">✏️ Edit</a>
      </div>
    </div>

    <div class="meta">
      <span class="badge primary">${escapeHtml(h.timeOfDay)}</span>
      <span class="badge">${escapeHtml(h.area || "General")}</span>
      <span class="badge ${done ? "ok" : "warn"}">${done ? "Done" : "In progress"}</span>
      <span class="badge">🔥 ${Number(h.streakDays || 0)}d</span>
    </div>

    <div style="margin-top:10px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
      <div class="help">${habitProgressText(h)}</div>
      <div class="row" style="justify-content:flex-end">
        <button class="btn small ok js-complete">✓ Complete</button>
        <button class="btn small js-undo">↺ Undo</button>
        <button class="btn small danger js-delete">🗑 Delete</button>
      </div>
    </div>
  `;

  // Attach listeners
  const editBtn = div.querySelector(".js-edit");
  if (editBtn) editBtn.addEventListener("click", (e) => e.stopPropagation());

  const completeBtn = div.querySelector(".js-complete");
  if (completeBtn) completeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    markDone(h.id, +1);
  });

  const undoBtn = div.querySelector(".js-undo");
  if (undoBtn) undoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    markDone(h.id, -1);
  });

  const deleteBtn = div.querySelector(".js-delete");
  if (deleteBtn) deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    delHabit(h.id);
  });

  return div;
}

function renderBottomBar(list) {
  const bar = $("#bar");
  const selected = state.selectedId && list.find(x => x.id === state.selectedId) || state.habits.find(x => x.id === state.selectedId);
  if (!selected) {
    bar.style.display = "none";
    return;
  }
  bar.style.display = "flex";
  $("#barTitle").textContent = selected.title;
  $("#barSub").textContent = `${selected.timeOfDay} • ${selected.area} • ${habitProgressText(selected)}`;

  $("#barEdit").href = `habit-form.html?id=${encodeURIComponent(selected.id)}`;
  $("#barDone").onclick = () => markDone(selected.id, +1);
  $("#barUndo").onclick = () => markDone(selected.id, -1);
  $("#barDelete").onclick = () => delHabit(selected.id);
  $("#barClear").onclick = () => { state.selectedId = null; render(); };
}

function toggleSelect(id) {
  state.selectedId = (state.selectedId === id) ? null : id;
  render();
}

async function loadHabits() {
  requireAuth();
  try {
    const res = await api.listHabits();
    state.habits = res.habits;
  } catch (err) {
    toast(err.message || "Failed to load habits", "bad");
  }
  // renderFilters(); // REMOVED (legacy)
  bindSidebarTimeFilters();
  highlightSidebarTime();
  render();

  // кастом dropdownы
  const timeDD = bindDropdown("ddTime", "timeBtn", "timeMenu");
  const areaDD = bindDropdown("ddArea", "areaBtn", "areaMenu");

  // time items
  const timeItems = ["All", "Morning", "Afternoon", "Evening"];
  ddRender(
    timeDD.menu,
    timeDD.btn,
    timeItems,
    state.filterTime,
    (v) => { state.filterTime = v; highlightSidebarTime(); render(); },
    (v) => v === "All" ? "All day" : v
  );

  // area items
  const areas = computeAreas(state.habits); // уже есть функция
  ddRender(
    areaDD.menu,
    areaDD.btn,
    areas,
    state.filterArea,
    (v) => { state.filterArea = v; render(); },
    (v) => v === "All" ? "All" : v
  );
}

async function delHabit(id) {
  if (!confirm("Delete this habit?")) return;
  try {
    await api.deleteHabit(id);
    state.selectedId = null;
    await loadHabits();
    toast("Habit deleted", "good");
  } catch (err) {
    toast(err.message || "Delete failed", "bad");
  }
}

async function markDone(id, delta) {
  try {
    await api.markHabitDone(id, delta);
    await loadHabits();
    toast(delta > 0 ? "Marked done" : "Undone", "good");
  } catch (err) {
    toast(err.message || "Update failed", "bad");
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bindSidebarTimeFilters() {
  $$(".tod-item").forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      const val = el.getAttribute("data-tod");
      // If clicking the already active one, toggle off? Or just keep it?
      // Requirement says "Sidebar items... Must... Filter habits correctly".
      // Usually sidebars act as tabs.
      state.filterTime = val;
      render();
    });
  });
}

function highlightSidebarTime() {
  $$(".tod-item").forEach(el => {
    const v = el.getAttribute("data-tod");
    el.classList.toggle("active", state.filterTime === v);
  });
}

function ddRender(menuEl, btnEl, items, activeValue, onPick, labelFn) {
  menuEl.innerHTML = items.map(v => `
    <div class="dd-item ${v === activeValue ? "active" : ""}" data-value="${v}">${labelFn ? labelFn(v) : v}</div>
  `).join("");

  btnEl.textContent = `${labelFn ? labelFn(activeValue) : activeValue} ▾`;

  $$(".dd-item", menuEl).forEach(it => {
    it.addEventListener("click", () => {
      const v = it.getAttribute("data-value");
      onPick(v);
      menuEl.classList.remove("open");
    });
  });
}

function bindDropdown(ddRootId, btnId, menuId) {
  const root = document.getElementById(ddRootId);
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });
  document.addEventListener("click", () => menu.classList.remove("open"));
  return { btn, menu };
}