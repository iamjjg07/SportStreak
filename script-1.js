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
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let slideIndex = 0;
let calCursor = new Date();
let sessionStart = Date.now();
let alarmTimer = null;

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
    all[id] = { streak: 0, lastCompleted: null, history: [] };
    saveData(all);
  }
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

function completedDates() {
  const set = new Set();
  const all = loadData();
  Object.values(all).forEach(sport => (sport.history || []).forEach(d => set.add(d)));
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
    card.innerHTML = `<span class="material-icons">${sport.icon}</span><h3>${sport.name}</h3><p class="streak">Streak: <span>${data.streak}</span></p>`;
    card.onclick = () => openSport(sport.id);
    grid.appendChild(card);
  });
}

function openSport(id) {
  const sport = sports.find(s => s.id === id);
  const data = getSportData(id);
  const today = getToday();
  document.getElementById("sports-grid").style.display = "none";
  document.getElementById("today-plan-section").style.display = "none";
  document.getElementById("category-tabs").style.display = "none";
  document.getElementById("calendar-section").style.display = "none";
  document.getElementById("details-section").style.display = "block";
  document.getElementById("detail-icon").textContent = sport.icon;
  document.getElementById("detail-name").textContent = sport.name;
  document.getElementById("streak-number").textContent = data.streak;
  resetTimer();
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
  const historyList = document.getElementById("history-list");
  const recent = (data.history || []).slice(-12).reverse();
  historyList.innerHTML = recent.length ? recent.map(date => `<li>${date}</li>`).join("") : "<li>No activity yet</li>";
  doneBtn.onclick = () => markAsDone(id);
}

function markAsDone(id) {
  const all = loadData();
  const data = all[id];
  const today = getToday();
  if (data.lastCompleted === today) return;
  data.streak = data.lastCompleted === getYesterday() ? data.streak + 1 : 1;
  data.lastCompleted = today;
  if (!data.history.includes(today)) data.history.push(today);
  if (data.history.length > 400) data.history = data.history.slice(-400);
  all[id] = data;
  saveData(all);
  document.getElementById("status-message").textContent = "Saved successfully";
  openSport(id);
  renderSportsGrid();
  renderCalendar();
}

function updateTimerDisplay() {
  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const secs = String(timerSeconds % 60).padStart(2, "0");
  document.getElementById("timer-display").textContent = `${mins}:${secs}`;
}
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => { timerSeconds++; updateTimerDisplay(); }, 1000);
}
function pauseTimer() { timerRunning = false; clearInterval(timerInterval); }
function resetTimer() { pauseTimer(); timerSeconds = 0; updateTimerDisplay(); }

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

function loadUsage() {
  return JSON.parse(localStorage.getItem("sportstreak-usage") || "{\"seconds\":0}");
}
function tickUsage() {
  const usage = loadUsage();
  usage.seconds += 1;
  localStorage.setItem("sportstreak-usage", JSON.stringify(usage));
  renderUsage();
}
function renderUsage() {
  const total = loadUsage().seconds + Math.floor((Date.now() - sessionStart) / 1000);
  const minutes = Math.floor(total / 60);
  const hours = Math.floor(total / 3600);
  const days = Math.floor(total / 86400);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  document.getElementById("time-grid").innerHTML = [
    ["Seconds", total], ["Minutes", minutes], ["Hours", hours],
    ["Days", days], ["Weeks", weeks], ["Months", months], ["Years", years]
  ].map(([label, value]) => `<div class="time-card"><strong>${value}</strong>${label}</div>`).join("");
}
function backupAll() {
  localStorage.setItem("sportstreak-backup", JSON.stringify({
    data: loadData(),
    schedule: loadSchedule(),
    usage: loadUsage(),
    friends: JSON.parse(localStorage.getItem("sportstreak-friends") || "[]")
  }));
}
function resetAll() {
  if (!confirm("Reset all records? You can restore them after.")) return;
  backupAll();
  localStorage.removeItem("sportstreak-data");
  localStorage.removeItem("sportstreak-schedule");
  localStorage.removeItem("sportstreak-usage");
  sessionStart = Date.now();
  document.getElementById("records-status").textContent = "Saved successfully";
  renderSportsGrid();
  renderTodayPlan();
  renderCalendar();
  renderUsage();
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
  localStorage.setItem("sportstreak-usage", JSON.stringify(backup.usage || { seconds: 0 }));
  localStorage.setItem("sportstreak-friends", JSON.stringify(backup.friends || []));
  document.getElementById("records-status").textContent = "Saved successfully";
  renderSportsGrid();
  renderTodayPlan();
  renderCalendar();
  renderUsage();
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
  if (page === "records") renderUsage();
  if (page === "friends") renderFriends();
  if (page === "tracker") showTrackerHome();
}
function showTrackerHome() {
  document.getElementById("details-section").style.display = "none";
  document.getElementById("sports-grid").style.display = "grid";
  document.getElementById("today-plan-section").style.display = "block";
  document.getElementById("category-tabs").style.display = "flex";
  document.getElementById("calendar-section").style.display = "block";
  resetTimer();
  renderSportsGrid();
}

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
document.getElementById("timer-stop").addEventListener("click", resetTimer);
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
  document.getElementById("records-status") && (document.getElementById("my-code").select());
});
document.getElementById("alarm-time").value = localStorage.getItem("sportstreak-alarm") || "06:00";

loadTheme();
buildSlides();
renderQuote();
renderSportsGrid();
renderTodayPlan();
renderCalendar();
renderUsage();
setInterval(tickUsage, 1000);
setInterval(renderQuote, 60000);
