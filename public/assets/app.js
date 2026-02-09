// ======= CONFIG =======
// Потом свяжешь с бэком: поставь URL и переключи USE_MOCK=false
const API_BASE_URL = "http://localhost:5002/api";     // например: "https://your-backend.onrender.com"
const USE_MOCK = false;

// ======= localStorage keys =======
const LS = {
  token: "ht_token",
  user: "ht_user",
  habits: "ht_habits",
  accountEmail: "ht_account_email",
  accountPwSig: "ht_account_pw_sig",
};

// ======= helpers =======
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const nowISO = () => new Date().toISOString();
const todayKey = () => new Date().toISOString().slice(0, 10);
const uid = (p = "id") => `${p}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
const trim = (s) => String(s || "").trim();
const emailOk = (email) => /^\S+@\S+\.\S+$/.test(trim(email));
const timeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
};

function toast(msg, type = "good") {
  const t = $("#toast");
  if (!t) return alert(msg);
  t.className = `toast show ${type === "good" ? "good" : "bad"}`;
  t.textContent = msg;
  setTimeout(() => t.className = "toast", 2200);
}

function setActiveNav() {
  const path = location.pathname.split("/").pop();
  $$(".nav a").forEach(a => {
    const target = a.getAttribute("href");
    a.classList.toggle("active", target === path);
  });
}

function getToken() { return localStorage.getItem(LS.token); }
function setToken(t) { localStorage.setItem(LS.token, t); }
function clearToken() { localStorage.removeItem(LS.token); }

function getUser() {
  try { return JSON.parse(localStorage.getItem(LS.user)); }
  catch { return null; }
}
function setUser(u) { localStorage.setItem(LS.user, JSON.stringify(u)); }

function requireAuth() {
  if (!getToken()) {
    location.href = "login.html";
    throw new Error("Unauthorized");
  }
}

// ======= MOCK DB =======
function getHabits() {
  try { return JSON.parse(localStorage.getItem(LS.habits)) || []; }
  catch { return []; }
}
function saveHabits(list) {
  localStorage.setItem(LS.habits, JSON.stringify(list));
}

function seedHabitsOnce() {
  const list = getHabits();
  if (list.length) return;

  const demo = [
    {
      id: uid("habit"),
      title: "Meditate",
      description: "10 minutes breathing",
      area: "Mind",
      timeOfDay: timeOfDay(),
      targetPerDay: 1,
      icon: "moon",
      todayCount: 0,
      streakDays: 0,
      lastDoneDate: null,
      archived: false,
      createdAt: nowISO(),
    },
    {
      id: uid("habit"),
      title: "Drink Water",
      description: "Stay hydrated",
      area: "Health",
      timeOfDay: "Morning",
      targetPerDay: 8,
      icon: "droplet",
      todayCount: 2,
      streakDays: 4,
      lastDoneDate: nowISO(),
      archived: false,
      createdAt: nowISO(),
    }
  ];
  saveHabits(demo);
}

// ======= API ADAPTER =======
// Сейчас: мок. Потом: сделаешь реальные fetch-запросы по твоим эндпоинтам.
const api = {
  async register({ username, email, password }) {
    if (!USE_MOCK) return apiFetch("/register", "POST", { username, email, password });

    const u = { id: uid("user"), username: trim(username), email: trim(email).toLowerCase(), createdAt: nowISO() };
    localStorage.setItem(LS.accountEmail, u.email);
    localStorage.setItem(LS.accountPwSig, `mock:${password.length}:${password[0] || ""}`);
    setUser(u);
    setToken(uid("jwt"));
    seedHabitsOnce();
    return { token: getToken(), user: u };
  },

  async login({ email, password }) {
    if (!USE_MOCK) return apiFetch("/login", "POST", { email, password });

    const storedEmail = localStorage.getItem(LS.accountEmail);
    const storedSig = localStorage.getItem(LS.accountPwSig);
    const e = trim(email).toLowerCase();
    const sig = `mock:${password.length}:${password[0] || ""}`;
    if (!storedEmail || !storedSig || storedEmail !== e || storedSig !== sig) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    setToken(uid("jwt"));
    seedHabitsOnce();
    return { token: getToken(), user: getUser() };
  },

  async getProfile() {
    requireAuth();
    if (!USE_MOCK) return apiFetch("/users/profile", "GET");
    return { user: getUser() };
  },

  async updateProfile({ username, email }) {
    requireAuth();
    if (!USE_MOCK) return apiFetch("/users/profile", "PUT", { username, email });

    const u = getUser();
    const updated = {
      ...u,
      username: trim(username) || u.username,
      email: trim(email).toLowerCase() || u.email,
      updatedAt: nowISO()
    };
    setUser(updated);
    localStorage.setItem(LS.accountEmail, updated.email);
    return { user: updated };
  },

  async listHabits() {
    requireAuth();
    if (!USE_MOCK) return apiFetch("/habits", "GET");
    return { habits: getHabits().filter(h => !h.archived) };
  },

  async getHabit(id) {
    requireAuth();
    if (!USE_MOCK) return apiFetch(`/habits/${id}`, "GET");
    const h = getHabits().find(x => x.id === id);
    if (!h) throw Object.assign(new Error("Habit not found"), { status: 404 });
    return { habit: h };
  },

  async createHabit(payload) {
    requireAuth();
    if (!USE_MOCK) return apiFetch("/habits", "POST", payload);

    const list = getHabits();
    const h = {
      id: uid("habit"),
      title: trim(payload.title),
      description: trim(payload.description),
      area: payload.area || "General",
      timeOfDay: payload.timeOfDay || timeOfDay(),
      targetPerDay: Number(payload.targetPerDay || 1),
      icon: payload.icon || "flame",
      todayCount: 0,
      streakDays: 0,
      lastDoneDate: null,
      archived: false,
      createdAt: nowISO(),
    };
    list.unshift(h);
    saveHabits(list);
    return { habit: h };
  },

  async updateHabit(id, payload) {
    requireAuth();
    if (!USE_MOCK) return apiFetch(`/habits/${id}`, "PUT", payload);

    const list = getHabits();
    const i = list.findIndex(x => x.id === id);
    if (i === -1) throw Object.assign(new Error("Habit not found"), { status: 404 });
    list[i] = {
      ...list[i],
      title: trim(payload.title) || list[i].title,
      description: trim(payload.description),
      area: payload.area || list[i].area,
      timeOfDay: payload.timeOfDay || list[i].timeOfDay,
      targetPerDay: Number(payload.targetPerDay || list[i].targetPerDay || 1),
      icon: payload.icon || list[i].icon,
      archived: !!payload.archived,
      updatedAt: nowISO(),
    };
    saveHabits(list);
    return { habit: list[i] };
  },

  async deleteHabit(id) {
    requireAuth();
    if (!USE_MOCK) return apiFetch(`/habits/${id}`, "DELETE");
    const list = getHabits().filter(x => x.id !== id);
    saveHabits(list);
    return { ok: true };
  },

  async markHabitDone(id, delta = 1) {
    requireAuth();
    if (!USE_MOCK) return apiFetch(`/habits/${id}`, "PUT", { delta });

    const list = getHabits();
    const i = list.findIndex(x => x.id === id);
    if (i === -1) throw Object.assign(new Error("Habit not found"), { status: 404 });
    const h = list[i];

    const lastKey = h.lastDoneDate ? h.lastDoneDate.slice(0, 10) : null;
    const tKey = todayKey();

    // streak logic
    let streak = Number(h.streakDays || 0);
    if (!lastKey) streak = 1;
    else {
      const diffDays = Math.floor((Date.parse(tKey) - Date.parse(lastKey)) / 86400000);
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
    }

    list[i] = {
      ...h,
      todayCount: Math.max(0, Number(h.todayCount || 0) + delta),
      lastDoneDate: nowISO(),
      streakDays: streak
    };
    saveHabits(list);
    return { habit: list[i] };
  }
};

// ======= real fetch for later =======
async function apiFetch(path, method = "GET", body) {
  const url = API_BASE_URL + path;
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  // если login/register вернут token — сохрани его тут
  if (data?.token) setToken(data.token);
  return data;
}

// ======= UI init helpers =======
function fillSidebarUser() {
  const u = getUser();
  const nameEl = $("#sbName");
  const emailEl = $("#sbEmail");
  if (nameEl) nameEl.textContent = u?.username || "Guest";
  if (emailEl) emailEl.textContent = u?.email || "Not signed in";
}

function setNowDot() {
  const tod = timeOfDay();
  $$(".tod-item").forEach(el => {
    const v = el.getAttribute("data-tod");
    const dot = el.querySelector(".dot");
    if (dot) dot.style.display = (v === tod) ? "inline" : "none";
  });
}

function logoutUI() {
  clearToken();
  toast("Logged out", "good");
  setTimeout(() => location.href = "login.html", 300);
}

// ======= THEME =======
const THEME_KEY = "ht_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = theme === "dark" ? "🌙 Dark" : "☀️ Light";
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(cur === "dark" ? "light" : "dark");
}