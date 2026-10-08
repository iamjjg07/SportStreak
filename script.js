const sports = [
  { id: "running", name: "Running", icon: "directions_run", category: "track", image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1400&q=80" },
  { id: "jogging", name: "Jogging", icon: "directions_walk", category: "track", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1400&q=80" },
  { id: "longjump", name: "Long Jump", icon: "straighten", category: "track", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?w=1400&q=80" },
  { id: "football", name: "Football", icon: "sports_soccer", category: "team", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&q=80" },
  { id: "volleyball", name: "Volleyball", icon: "sports_volleyball", category: "team", image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1400&q=80" },
  { id: "basketball", name: "Basketball", icon: "sports_basketball", category: "team", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1400&q=80" },
  { id: "tabletennis", name: "Table Tennis", icon: "sports_tennis", category: "racket", image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=1400&q=80" },
  { id: "lawntennis", name: "Lawn Tennis", icon: "sports_tennis", category: "racket", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1400&q=80" },
  { id: "badminton", name: "Badminton", icon: "sports_tennis", category: "racket", image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1400&q=80" },
  { id: "gym", name: "Gym", icon: "fitness_center", category: "gym", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80" },
  { id: "swimming", name: "Swimming", icon: "pool", category: "water", image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1400&q=80" }
];

const daysOfWeek = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
  { id: "saturday", name: "Saturday" },
  { id: "sunday", name: "Sunday" }
];

const quotes = {
  morning: [
    "Morning is your advantage. Start before the excuses do.",
    "A strong morning builds a strong day.",
    "Show up early. Your future self is watching."
  ],
  afternoon: [
    "The afternoon is not too late. It is still your day.",
    "Consistency beats a perfect morning.",
    "One session now is better than a plan for later."
  ],
  evening: [
    "Finish the day proud, not perfect.",
    "Evening effort still counts.",
    "Rest is part of training. So is showing up."
  ]
};

let currentCategory = "all";
let slideIndex = 0;
let calCursor = new Date();
let alarmTimer = null;
let currentOpenSportId = null; // which sport detail page is currently open

/* ========== GLOBAL TIMER STATE ==========
   One active timer only. Continues counting in the mini-timer
   across every section. Returning to the sport that started it
   shows the big timer in sync. */
let activeTimerSportId = null;
let timerSeconds = 0;
let timerRunning = false;
let timerInterval = null;
let timerBaseTimestamp = null; // Date.now() when last started/resumed
let timerAccumulated = 0;      // seconds already counted before current run segment

function loadTheme() {
  const saved = localStorage.getItem("sportstreak-theme");
  const icon = document.getElementById("theme-icon");
  if (saved === "light") {
    document.body.classList.add("light-mode");
    icon.textContent = "light_mode";
  } else {
    document.body.classList.remove("light-mode");
    icon.textContent = "dark_mode";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const light = document.body.classList.contains("light-mode");
  localStorage.setItem("sportstreak-theme", light ? "light" : "dark");
  document.getElementById("theme-icon").textContent = light ? "light_mode" : "dark_mode";
}

function getToday() { return new Date().toISOString().split("T")[0]; }
function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
function getDayName(date = new Date()) {
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()];
}
function period() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 16) return "afternoon";
  return "evening";
}
function renderQuote() {
  const p = period();
  const list = quotes[p];
  const index = new Date().getDate() % list.length;
  document.getElementById("quote-label").textContent = p.charAt(0).toUpperCase() + p.slice(1) + " Motivation";
  document.getElementById("daily-quote").textContent = list[index];
}

function loadData() {
  const data = localStorage.getItem("sportstreak-data");
  return data ? JSON.parse(data) : {};
}
function saveData(data) { localStorage.setItem("sportstreak-data", JSON.stringify(data)); }
function getSportData(id) {
  const all = loadData();
  if (!all[id]) {
    all[id] = { streak: 0, lastCompleted: null, history: [], sessions: [] };
    saveData(all);
  }
  if (!all[id].sessions) all[id].sessions = [];
  return all[id];
}
function loadSchedule() {
  const data = localStorage.getItem("sportstreak-schedule");
  if (data) return JSON.parse(data);
  const empty = {};
  daysOfWeek.forEach(d => empty[d.id] = []);
  return empty;
}
function saveSchedule(schedule) { localStorage.setItem("sportstreak-schedule", JSON.stringify(schedule)); }

/* ---------- Records lifecycle (24h transfer / 48h sport-page purge / archive) ----------
   Timeline for every saved activity:
   0–24 h  → visible only on the sport page that created it
   24–48 h → appears in Records section AND still on the sport page
   after 48 h → removed from sport page; remains permanently in Records
   after 7 days → moved from "recent records" into archive (month/year filter)
*/
function loadRecords() {
  return JSON.parse(localStorage.getItem("sportstreak-records") || "[]");
}
function saveRecords(arr) {
  localStorage.setItem("sportstreak-records", JSON.stringify(arr));
}
function loadArchive() {
  return JSON.parse(localStorage.getItem("sportstreak-archive") || "[]");
}
function saveArchive(arr) {
  localStorage.setItem("sportstreak-archive", JSON.stringify(arr));
}

function hoursAgo(isoOrDate) {
  const t = new Date(isoOrDate).getTime();
  if (isNaN(t)) return 9999;
  return (Date.now() - t) / 3600000;
}

/** Ensure every history date / session has a transferred entry in Records after 24h,
    and purge sport-page copies after 48h. Also archive Records older than 7 days. */
function promoteOldRecords() {
  const all = loadData();
  const records = loadRecords();
  const archive = loadArchive();
  let dataChanged = false;
  let recordsChanged = false;
  let archiveChanged = false;

  const existingKeys = new Set(
    records.map(r => `${r.sportId}|${r.date}|${r.type}|${r.durationSec || 0}`)
  );

  Object.keys(all).forEach(sportId => {
    const sport = all[sportId];
    const sportName = (sports.find(s => s.id === sportId) || {}).name || sportId;

    // --- Completions (history dates) ---
    // history entries are plain "YYYY-MM-DD". We treat midnight of that day as savedAt
    // unless we stored a richer object. Support both string and {date, savedAt}.
    const keepHistory = [];
    (sport.history || []).forEach(entry => {
      const date = typeof entry === "string" ? entry : entry.date;
      const savedAt = typeof entry === "string"
        ? date + "T12:00:00.000Z"
        : (entry.savedAt || date + "T12:00:00.000Z");
      const ageH = hoursAgo(savedAt);

      // After 24h → ensure it exists in Records section
      if (ageH >= 24) {
        const key = `${sportId}|${date}|completion|0`;
        if (!existingKeys.has(key)) {
          records.push({
            sportId,
            sportName,
            date,
            type: "completion",
            durationSec: 0,
            savedAt,
            transferredAt: new Date().toISOString()
          });
          existingKeys.add(key);
          recordsChanged = true;
        }
      }

      // Keep on sport page until 48h
      if (ageH < 48) {
        keepHistory.push(typeof entry === "string" ? entry : entry);
      } else {
        dataChanged = true; // purged from sport page
      }
    });
    if (keepHistory.length !== (sport.history || []).length) {
      sport.history = keepHistory;
      dataChanged = true;
    }

    // --- Timed sessions ---
    const keepSessions = [];
    (sport.sessions || []).forEach(sess => {
      const date = (sess.date || "").slice(0, 10);
      const savedAt = sess.savedAt || date + "T12:00:00.000Z";
      const ageH = hoursAgo(savedAt);
      const dur = sess.durationSec || 0;

      if (ageH >= 24) {
        const key = `${sportId}|${date}|session|${dur}`;
        if (!existingKeys.has(key)) {
          records.push({
            sportId,
            sportName,
            date,
            type: "session",
            durationSec: dur,
            savedAt,
            transferredAt: new Date().toISOString()
          });
          existingKeys.add(key);
          recordsChanged = true;
        }
      }

      if (ageH < 48) {
        keepSessions.push(sess);
      } else {
        dataChanged = true;
      }
    });
    if (keepSessions.length !== (sport.sessions || []).length) {
      sport.sessions = keepSessions;
      dataChanged = true;
    }
  });

  // Archive Records older than 7 days (they stay in Records "all" / month / year views)
  const keepRecords = [];
  records.forEach(r => {
    const ageH = hoursAgo(r.savedAt || r.date);
    if (ageH >= 24 * 7) {
      archive.push({ ...r, archivedAt: new Date().toISOString() });
      archiveChanged = true;
    } else {
      keepRecords.push(r);
    }
  });

  if (dataChanged) saveData(all);
  if (recordsChanged || archiveChanged) {
    // If we archived, write the trimmed records list
    saveRecords(archiveChanged ? keepRecords : records);
  } else if (recordsChanged) {
    saveRecords(records);
  }
  if (archiveChanged) saveArchive(archive);
}

function completedDates() {
  const set = new Set();
  const all = loadData();
  Object.values(all).forEach(sport => (sport.history || []).forEach(d => {
    set.add(typeof d === "string" ? d : d.date);
  }));
  return set;
}

function renderTodayPlan() {
  const schedule = loadSchedule();
  const list = schedule[getDayName()] || [];
  const container = document.getElementById("today-plan-list");
  container.innerHTML = list.length
    ? list.map(id => `<div class="today-plan-item">${sports.find(s => s.id === id).name}</div>`).join("")
    : `<p class="hint">No activities planned for today</p>`;
}

function renderSportsGrid() {
  const grid = document.getElementById("sports-grid");
  grid.innerHTML = "";
  const filtered = currentCategory === "all" ? sports : sports.filter(s => s.category === currentCategory);
  filtered.forEach(sport => {
    const data = getSportData(sport.id);
    const card = document.createElement("div");
    card.className = "sport-card";
    const isLocked = activeTimerSportId && activeTimerSportId !== sport.id;
    if (isLocked) card.classList.add("locked");
    card.innerHTML = `
      <span class="material-icons">${sport.icon}</span>
      <h3>${sport.name}</h3>
      <p class="streak">Streak: <span>${data.streak}</span></p>
      ${activeTimerSportId === sport.id ? '<p class="live-badge">● Live</p>' : ''}
      ${isLocked ? '<p class="lock-badge">Timer locked</p>' : ''}
    `;
    card.onclick = () => openSport(sport.id);
    grid.appendChild(card);
  });
}

function openSport(id) {
  const sport = sports.find(s => s.id === id);
  const data = getSportData(id);
  const today = getToday();
  currentOpenSportId = id;

  document.getElementById("sports-grid").style.display = "none";
  document.getElementById("today-plan-section").style.display = "none";
  document.getElementById("category-tabs").style.display = "none";
  document.getElementById("calendar-section").style.display = "none";
  document.getElementById("details-section").style.display = "block";
  document.getElementById("detail-icon").textContent = sport.icon;
  document.getElementById("detail-name").textContent = sport.name;
  document.getElementById("streak-number").textContent = data.streak;

  // Sync big timer with global state — do NOT reset if this is the active sport
  if (activeTimerSportId === id) {
    updateTimerDisplay();
  } else if (!activeTimerSportId) {
    // No timer running anywhere — show 00:00 ready to start
    timerSeconds = 0;
    updateTimerDisplay();
  } else {
    // Another sport owns the timer — show locked message, keep display at 00:00
    timerSeconds = 0;
    updateTimerDisplay();
  }
  updateTimerControlsState(id);

  const doneBtn = document.getElementById("done-btn");
  const status = document.getElementById("status-message");
  if (data.lastCompleted === today) {
    doneBtn.disabled = true;
    doneBtn.textContent = "Completed today";
    status.textContent = "Saved successfully";
  } else {
    doneBtn.disabled = false;
    doneBtn.textContent = "I did it today!";
    status.textContent = "";
  }

  // Sport page only shows entries still within the 48h window
  // (promoteOldRecords already purged anything older)
  const historyList = document.getElementById("history-list");
  const recent = (data.history || []).slice(-12).reverse();
  const sessions = (data.sessions || []).slice(-6).reverse();
  let html = "";
  if (recent.length) {
    html += recent.map(entry => {
      const date = typeof entry === "string" ? entry : entry.date;
      return `<li>${date}</li>`;
    }).join("");
  }
  if (sessions.length) {
    html += sessions.map(s => {
      const m = Math.floor((s.durationSec || 0) / 60);
      const sec = (s.durationSec || 0) % 60;
      return `<li class="session-item">${s.date} · ${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}</li>`;
    }).join("");
  }
  historyList.innerHTML = html || "<li>No activity yet</li>";

  doneBtn.onclick = () => markAsDone(id);
}

function markAsDone(id) {
  const all = loadData();
  const data = all[id];
  const today = getToday();
  if (data.lastCompleted === today) return;
  data.streak = data.lastCompleted === getYesterday() ? data.streak + 1 : 1;
  data.lastCompleted = today;
  // Store as object with savedAt so 24h/48h windows work accurately
  const already = (data.history || []).some(e => (typeof e === "string" ? e : e.date) === today);
  if (!already) {
    data.history.push({ date: today, savedAt: new Date().toISOString() });
  }
  if (data.history.length > 400) data.history = data.history.slice(-400);
  all[id] = data;
  saveData(all);
  document.getElementById("status-message").textContent = "Saved successfully";
  openSport(id);
  renderSportsGrid();
  renderCalendar();
}

/* ========== TIMER LOGIC ========== */

function formatTime(totalSec) {
  const mins = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const secs = String(totalSec % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function getCurrentSeconds() {
  if (timerRunning && timerBaseTimestamp) {
    return timerAccumulated + Math.floor((Date.now() - timerBaseTimestamp) / 1000);
  }
  return timerAccumulated;
}

function updateTimerDisplay() {
  const sec = getCurrentSeconds();
  timerSeconds = sec;
  const text = formatTime(sec);
  const big = document.getElementById("timer-display");
  if (big) big.textContent = text;
  const mini = document.getElementById("mini-timer-display");
  if (mini) mini.textContent = text;
}

function showMiniTimer(show) {
  const el = document.getElementById("mini-timer");
  if (!el) return;
  el.style.display = show ? "flex" : "none";
  if (show && activeTimerSportId) {
    const sport = sports.find(s => s.id === activeTimerSportId);
    document.getElementById("mini-timer-sport").textContent = sport ? sport.name : "";
  }
}

function updateTimerControlsState(viewingSportId) {
  const startBtn = document.getElementById("timer-start");
  const pauseBtn = document.getElementById("timer-pause");
  const stopBtn = document.getElementById("timer-stop");
  const lockMsg = document.getElementById("timer-lock-msg");

  if (!startBtn) return;

  const lockedByOther = activeTimerSportId && activeTimerSportId !== viewingSportId;

  if (lockedByOther) {
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    if (lockMsg) {
      const other = sports.find(s => s.id === activeTimerSportId);
      lockMsg.style.display = "block";
      lockMsg.textContent = `Timer is running on ${other ? other.name : "another sport"}. Stop it there first.`;
    }
  } else {
    startBtn.disabled = false;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    if (lockMsg) lockMsg.style.display = "none";
  }
}

function startTimer() {
  // Can only start if no other sport owns the timer, or we own it
  if (activeTimerSportId && activeTimerSportId !== currentOpenSportId) return;
  if (timerRunning) return;

  if (!activeTimerSportId) {
    activeTimerSportId = currentOpenSportId;
    timerAccumulated = 0;
  }

  timerRunning = true;
  timerBaseTimestamp = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    updateTimerDisplay();
  }, 250);

  showMiniTimer(true);
  updateTimerDisplay();
  renderSportsGrid();
  if (currentOpenSportId) updateTimerControlsState(currentOpenSportId);
}

function pauseTimer() {
  if (!timerRunning) return;
  timerAccumulated = getCurrentSeconds();
  timerRunning = false;
  timerBaseTimestamp = null;
  clearInterval(timerInterval);
  updateTimerDisplay();
}

function stopAndSaveTimer() {
  // Capture final time
  const finalSec = getCurrentSeconds();
  const sportId = activeTimerSportId;

  // Stop everything
  timerRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  timerBaseTimestamp = null;
  timerAccumulated = 0;
  timerSeconds = 0;
  activeTimerSportId = null;

  showMiniTimer(false);
  updateTimerDisplay();

  if (sportId && finalSec > 0) {
    // Permanently save the timed session to that sport
    const all = loadData();
    if (!all[sportId]) all[sportId] = { streak: 0, lastCompleted: null, history: [], sessions: [] };
    if (!all[sportId].sessions) all[sportId].sessions = [];
    all[sportId].sessions.push({
      date: getToday(),
      durationSec: finalSec,
      savedAt: new Date().toISOString()
    });
    // Keep last 100 sessions per sport
    if (all[sportId].sessions.length > 100) {
      all[sportId].sessions = all[sportId].sessions.slice(-100);
    }
    saveData(all);

    // Also mark the day as completed if not already
    const data = all[sportId];
    const today = getToday();
    if (data.lastCompleted !== today) {
      data.streak = data.lastCompleted === getYesterday() ? data.streak + 1 : 1;
      data.lastCompleted = today;
      const already = (data.history || []).some(e => (typeof e === "string" ? e : e.date) === today);
      if (!already) {
        data.history.push({ date: today, savedAt: new Date().toISOString() });
      }
    }
    saveData(all);

    if (currentOpenSportId === sportId) {
      document.getElementById("status-message").textContent =
        `Session saved: ${formatTime(finalSec)}`;
      openSport(sportId);
    }
  }

  renderSportsGrid();
  renderCalendar();
  if (currentOpenSportId) updateTimerControlsState(currentOpenSportId);
}

function resetTimerUIOnly() {
  // Used when leaving a non-active sport page — do not touch global timer
  if (activeTimerSportId !== currentOpenSportId) {
    const big = document.getElementById("timer-display");
    if (big) big.textContent = "00:00";
  }
}

/* ---------- Schedule / calendar / friends (unchanged core) ---------- */

function renderWeeklySchedule() {
  const schedule = loadSchedule();
  const container = document.getElementById("weekly-schedule");
  container.innerHTML = "";
  daysOfWeek.forEach(day => {
    const checks = sports.map(sport => {
      const checked = (schedule[day.id] || []).includes(sport.id) ? "checked" : "";
      return `<label class="sport-check"><input type="checkbox" data-day="${day.id}" data-sport="${sport.id}" ${checked}>${sport.name}</label>`;
    }).join("");
    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `<div class="day-name">${day.name}</div><div class="sport-checkboxes">${checks}</div>`;
    container.appendChild(row);
  });
}

function saveCurrentSchedule() {
  const schedule = {};
  daysOfWeek.forEach(d => schedule[d.id] = []);
  document.querySelectorAll(".sport-check input:checked").forEach(input => {
    schedule[input.dataset.day].push(input.dataset.sport);
  });
  saveSchedule(schedule);
  renderTodayPlan();
  document.getElementById("save-status").textContent = "Saved successfully";
}

function openGoogleCalendar() {
  const schedule = loadSchedule();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  let opened = 0;
  daysOfWeek.forEach((day, i) => {
    const list = schedule[day.id] || [];
    if (!list.length) return;
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const title = "SportStreak: " + list.map(id => sports.find(s => s.id === id).name).join(" + ");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${y}${m}${d}/${y}${m}${d}&details=${encodeURIComponent("Planned in SportStreak")}`;
    window.open(url, "_blank");
    opened++;
  });
  document.getElementById("save-status").textContent = opened ? "Saved successfully" : "Add sports to the week first";
}

function setAlarm() {
  const time = document.getElementById("alarm-time").value || "06:00";
  localStorage.setItem("sportstreak-alarm", time);
  if (Notification.permission !== "granted") Notification.requestPermission();
  if (alarmTimer) clearTimeout(alarmTimer);
  const [h, m] = time.split(":").map(Number);
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);
  const wait = next - new Date();
  alarmTimer = setTimeout(() => {
    const plan = (loadSchedule()[getDayName()] || []).map(id => sports.find(s => s.id === id).name).join(", ") || "No sport planned";
    if (Notification.permission === "granted") new Notification("SportStreak alarm", { body: plan });
    else alert("SportStreak alarm: " + plan);
    setAlarm();
  }, Math.min(wait, 2147483647));
  document.getElementById("alarm-status").textContent = "Alarm set for " + time + ". It rings while this page stays open.";
}

function renderCalendar() {
  const year = calCursor.getFullYear();
  const month = calCursor.getMonth();
  document.getElementById("cal-title").textContent = calCursor.toLocaleString("en", { month: "long", year: "numeric" });
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const done = completedDates();
  const today = getToday();
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  for (let i = 0; i < first; i++) grid.appendChild(Object.assign(document.createElement("div"), { className: "cal-day empty" }));
  for (let day = 1; day <= days; day++) {
    const date = new Date(year, month, day);
    const key = date.toISOString().split("T")[0];
    const cell = document.createElement("div");
    cell.className = "cal-day";
    let mark = "";
    if (done.has(key)) {
      cell.classList.add("done");
      mark = "✓";
    } else if (key < today) {
      cell.classList.add("missed");
      mark = "✕";
    }
    cell.innerHTML = `${day}<span class="mark">${mark}</span>`;
    grid.appendChild(cell);
  }
}

/* ========== RECORDS PAGE ========== */

function collectAllRecords() {
  promoteOldRecords();
  const items = [];

  // Records section only shows items that have already transferred (≥24h)
  // plus anything in the archive (older than 7 days).
  loadRecords().forEach(r => {
    items.push({
      sportId: r.sportId,
      sportName: r.sportName,
      date: r.date,
      type: r.type || "completion",
      durationSec: r.durationSec || 0,
      source: "records",
      savedAt: r.savedAt
    });
  });

  loadArchive().forEach(a => {
    items.push({
      sportId: a.sportId,
      sportName: a.sportName,
      date: a.date,
      type: a.type || "completion",
      durationSec: a.durationSec || 0,
      source: "archive",
      savedAt: a.savedAt
    });
  });

  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return items;
}

function renderRecords() {
  const range = document.getElementById("records-range").value;
  const monthInput = document.getElementById("records-month");
  const yearInput = document.getElementById("records-year");
  const monthWrap = document.getElementById("records-month-wrap");
  const yearWrap = document.getElementById("records-year-wrap");

  monthWrap.style.display = range === "month" ? "block" : "none";
  yearWrap.style.display = range === "year" ? "block" : "none";

  const all = collectAllRecords();
  const today = new Date();
  let filtered = all;

  if (range === "7") {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 7);
    const c = cutoff.toISOString().split("T")[0];
    filtered = all.filter(r => r.date >= c && r.source === "records");
  } else if (range === "30") {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 30);
    const c = cutoff.toISOString().split("T")[0];
    filtered = all.filter(r => r.date >= c);
  } else if (range === "month") {
    const val = monthInput.value; // YYYY-MM
    if (val) filtered = all.filter(r => (r.date || "").startsWith(val));
  } else if (range === "year") {
    const y = String(yearInput.value || "").trim();
    if (y.length === 4) filtered = all.filter(r => (r.date || "").startsWith(y));
  }
  // "all" → no extra filter

  const list = document.getElementById("records-list");
  if (!filtered.length) {
    list.innerHTML = `<p class="hint">No records for this range yet.</p>`;
    return;
  }

  list.innerHTML = filtered.map(r => {
    const dur = r.durationSec
      ? ` · ${formatTime(r.durationSec)}`
      : "";
    const badge = r.source === "archive" ? `<span class="archive-badge">archived</span>` : "";
    return `<div class="record-row">
      <span class="record-sport">${r.sportName}</span>
      <span class="record-date">${r.date}${dur}</span>
      ${badge}
    </div>`;
  }).join("");
}

function backupAll() {
  localStorage.setItem("sportstreak-backup", JSON.stringify({
    data: loadData(),
    schedule: loadSchedule(),
    records: loadRecords(),
    archive: loadArchive(),
    friends: JSON.parse(localStorage.getItem("sportstreak-friends") || "[]")
  }));
}
function resetAll() {
  if (!confirm("Reset all records? You can restore them after.")) return;
  backupAll();
  localStorage.removeItem("sportstreak-data");
  localStorage.removeItem("sportstreak-schedule");
  localStorage.removeItem("sportstreak-records");
  localStorage.removeItem("sportstreak-archive");
  document.getElementById("records-status").textContent = "Saved successfully";
  renderSportsGrid();
  renderTodayPlan();
  renderCalendar();
  renderRecords();
}
function restoreAll() {
  const raw = localStorage.getItem("sportstreak-backup");
  if (!raw) {
    document.getElementById("records-status").textContent = "No previous records found";
    return;
  }
  const backup = JSON.parse(raw);
  saveData(backup.data || {});
  saveSchedule(backup.schedule || loadSchedule());
  saveRecords(backup.records || []);
  saveArchive(backup.archive || []);
  localStorage.setItem("sportstreak-friends", JSON.stringify(backup.friends || []));
  document.getElementById("records-status").textContent = "Saved successfully";
  renderSportsGrid();
  renderTodayPlan();
  renderCalendar();
  renderRecords();
  renderFriends();
}

function myCode() {
  const streaks = sports.map(s => getSportData(s.id).streak).join(".");
  return "SS-" + streaks;
}
function renderFriends() {
  document.getElementById("my-code").value = myCode();
  const friends = JSON.parse(localStorage.getItem("sportstreak-friends") || "[]");
  document.getElementById("friends-list").innerHTML = friends.map(f => `<li><span>${f.name}</span><span>${f.code}</span></li>`).join("") || "<li>No friends yet</li>";
}
function addFriend() {
  const name = document.getElementById("friend-name").value.trim();
  const code = document.getElementById("friend-code").value.trim();
  if (!name || !code) return;
  const friends = JSON.parse(localStorage.getItem("sportstreak-friends") || "[]");
  friends.push({ name, code });
  localStorage.setItem("sportstreak-friends", JSON.stringify(friends));
  document.getElementById("friend-name").value = "";
  document.getElementById("friend-code").value = "";
  renderFriends();
}

function buildSlides() {
  const wrap = document.getElementById("hero-slides");
  wrap.innerHTML = sports.map((s, i) => `<div class="hero-slide${i === 0 ? " active" : ""}" style="background-image:url('${s.image}')"></div>`).join("");
  document.getElementById("hero-sport").textContent = sports[0].name;
  setInterval(() => {
    const slides = [...document.querySelectorAll(".hero-slide")];
    slides[slideIndex].classList.remove("active");
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add("active");
    document.getElementById("hero-sport").textContent = sports[slideIndex].name;
  }, 5000);
}

function switchPage(page) {
  ["tracker", "schedule", "records", "friends"].forEach(name => {
    document.getElementById("page-" + name).style.display = name === page ? "block" : "none";
  });
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
  if (page === "schedule") renderWeeklySchedule();
  if (page === "records") renderRecords();
  if (page === "friends") renderFriends();
  if (page === "tracker") {
    // Keep current detail view if a sport is open; otherwise show home
    if (!currentOpenSportId) showTrackerHome();
  }
}

function showTrackerHome() {
  currentOpenSportId = null;
  document.getElementById("details-section").style.display = "none";
  document.getElementById("sports-grid").style.display = "grid";
  document.getElementById("today-plan-section").style.display = "block";
  document.getElementById("category-tabs").style.display = "flex";
  document.getElementById("calendar-section").style.display = "block";
  // Do NOT reset the global timer — only hide the big display context
  renderSportsGrid();
}

/* ========== EVENT LISTENERS ========== */

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
document.getElementById("back-btn").addEventListener("click", showTrackerHome);
document.querySelectorAll(".nav-btn").forEach(btn => btn.addEventListener("click", () => switchPage(btn.dataset.page)));
document.querySelectorAll(".cat-btn").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentCategory = btn.dataset.cat;
  renderSportsGrid();
}));

document.getElementById("timer-start").addEventListener("click", startTimer);
document.getElementById("timer-pause").addEventListener("click", pauseTimer);
document.getElementById("timer-stop").addEventListener("click", stopAndSaveTimer);

document.getElementById("mini-timer-pause").addEventListener("click", () => {
  if (timerRunning) pauseTimer();
  else if (activeTimerSportId) startTimer();
});
document.getElementById("mini-timer-stop").addEventListener("click", stopAndSaveTimer);

document.getElementById("save-schedule-btn").addEventListener("click", saveCurrentSchedule);
document.getElementById("google-cal-btn").addEventListener("click", openGoogleCalendar);
document.getElementById("set-alarm-btn").addEventListener("click", setAlarm);
document.getElementById("cal-prev").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() - 1); renderCalendar(); });
document.getElementById("cal-next").addEventListener("click", () => { calCursor.setMonth(calCursor.getMonth() + 1); renderCalendar(); });
document.getElementById("reset-btn").addEventListener("click", resetAll);
document.getElementById("restore-btn").addEventListener("click", restoreAll);
document.getElementById("add-friend").addEventListener("click", addFriend);
document.getElementById("copy-code").addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementById("my-code").value);
});

document.getElementById("records-range").addEventListener("change", renderRecords);
document.getElementById("records-month").addEventListener("change", renderRecords);
document.getElementById("records-year").addEventListener("input", renderRecords);

document.getElementById("alarm-time").value = localStorage.getItem("sportstreak-alarm") || "06:00";

// Init
loadTheme();
buildSlides();
renderQuote();
renderSportsGrid();
renderTodayPlan();
renderCalendar();
promoteOldRecords();
setInterval(renderQuote, 60000);
