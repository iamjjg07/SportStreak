// ======================
// SPORTS DATA
// ======================
const sports = [
  { id: "running", name: "Running", icon: "directions_run", category: "track" },
  { id: "jogging", name: "Jogging", icon: "directions_walk", category: "track" },
  { id: "longjump", name: "Long Jump", icon: "straighten", category: "track" },
  { id: "football", name: "Football", icon: "sports_soccer", category: "team" },
  { id: "volleyball", name: "Volleyball", icon: "sports_volleyball", category: "team" },
  { id: "basketball", name: "Basketball", icon: "sports_basketball", category: "team" },
  { id: "tabletennis", name: "Table Tennis", icon: "sports_tennis", category: "racket" },
  { id: "lawntennis", name: "Lawn Tennis", icon: "sports_tennis", category: "racket" },
  { id: "badminton", name: "Badminton", icon: "sports_tennis", category: "racket" },
  { id: "gym", name: "Gym", icon: "fitness_center", category: "gym" },
  { id: "swimming", name: "Swimming", icon: "pool", category: "water" }
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

// ======================
// QUOTES
// ======================
const quotes = [
  "The only bad workout is the one that didn’t happen.",
  "Small progress is still progress.",
  "You don’t have to be extreme, just consistent.",
  "One day or day one. You decide.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your body can stand almost anything. It’s your mind you have to convince.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Success is the sum of small efforts repeated day in and day out.",
  "It always seems impossible until it’s done.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Wake up with determination. Go to bed with satisfaction.",
  "The only way to finish is to start.",
  "Be stronger than your excuses.",
  "You are one workout away from a good mood.",
  "Consistency beats intensity.",
  "Make yourself proud.",
  "Every champion was once a contender who refused to give up.",
  "The secret of getting ahead is getting started."
];

// ======================
// STATE
// ======================
let currentCategory = "all";
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let currentSportId = null;

// ======================
// THEME
// ======================
function loadTheme() {
  const saved = localStorage.getItem("sportstreak-theme");
  if (saved === "light") {
    document.body.classList.add("light-mode");
    document.getElementById("theme-icon").textContent = "light_mode";
  } else {
    document.body.classList.remove("light-mode");
    document.getElementById("theme-icon").textContent = "dark_mode";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    localStorage.setItem("sportstreak-theme", "light");
    document.getElementById("theme-icon").textContent = "light_mode";
  } else {
    localStorage.setItem("sportstreak-theme", "dark");
    document.getElementById("theme-icon").textContent = "dark_mode";
  }
}

// ======================
// HELPERS
// ======================
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function getDayName() {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date().getDay()];
}

function getDailyQuote() {
  const today = getToday();
  const num = parseInt(today.replace(/-/g, ""), 10);
  return quotes[num % quotes.length];
}

function loadData() {
  const data = localStorage.getItem("sportstreak-data");
  return data ? JSON.parse(data) : {};
}

function saveData(data) {
  localStorage.setItem("sportstreak-data", JSON.stringify(data));
}

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

function saveSchedule(schedule) {
  localStorage.setItem("sportstreak-schedule", JSON.stringify(schedule));
}

// ======================
// RENDER FUNCTIONS
// ======================
function renderQuote() {
  document.getElementById("daily-quote").textContent = getDailyQuote();
}

function renderTodayPlan() {
  const schedule = loadSchedule();
  const today = getDayName();
  const list = schedule[today] || [];
  const container = document.getElementById("today-plan-list");

  if (list.length === 0) {
    container.innerHTML = `<p style="color:var(--text2)">No activities planned for today</p>`;
    return;
  }

  container.innerHTML = list.map(id => {
    const s = sports.find(sp => sp.id === id);
    return `<div class="today-plan-item">${s.name}</div>`;
  }).join("");
}

function renderSportsGrid() {
  const grid = document.getElementById("sports-grid");
  grid.innerHTML = "";

  const filtered = currentCategory === "all"
    ? sports
    : sports.filter(s => s.category === currentCategory);

  filtered.forEach(sport => {
    const data = getSportData(sport.id);
    const card = document.createElement("div");
    card.className = "sport-card";
    card.innerHTML = `
      <span class="material-icons">${sport.icon}</span>
      <h3>${sport.name}</h3>
      <p class="streak">Streak: <span>${data.streak}</span></p>
    `;
    card.onclick = () => openSport(sport.id);
    grid.appendChild(card);
  });
}

function openSport(id) {
  currentSportId = id;
  const sport = sports.find(s => s.id === id);
  const data = getSportData(id);
  const today = getToday();

  // Hide other sections
  document.getElementById("sports-grid").style.display = "none";
  document.getElementById("today-plan-section").style.display = "none";
  document.getElementById("category-tabs").style.display = "none";
  document.getElementById("details-section").style.display = "block";

  document.getElementById("detail-icon").textContent = sport.icon;
  document.getElementById("detail-name").textContent = sport.name;
  document.getElementById("streak-number").textContent = data.streak;

  // Reset timer
  resetTimer();

  const doneBtn = document.getElementById("done-btn");
  const status = document.getElementById("status-message");

  if (data.lastCompleted === today) {
    doneBtn.disabled = true;
    doneBtn.textContent = "Completed today ✓";
    status.textContent = "Great job! Come back tomorrow.";
  } else {
    doneBtn.disabled = false;
    doneBtn.textContent = "I did it today!";
    status.textContent = "";
  }

  // History
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";
  const recent = data.history.slice(-12).reverse();
  if (recent.length === 0) {
    historyList.innerHTML = "<li>No activity yet</li>";
  } else {
    recent.forEach(date => {
      const li = document.createElement("li");
      li.textContent = date;
      historyList.appendChild(li);
    });
  }

  doneBtn.onclick = () => markAsDone(id);
}

function markAsDone(id) {
  const all = loadData();
  const data = all[id];
  const today = getToday();
  const yesterday = getYesterday();

  if (data.lastCompleted === today) return;

  data.streak = data.lastCompleted === yesterday ? data.streak + 1 : 1;
  data.lastCompleted = today;
  if (!data.history.includes(today)) data.history.push(today);
  if (data.history.length > 60) data.history = data.history.slice(-60);

  all[id] = data;
  saveData(all);

  openSport(id);
  renderSportsGrid();
}

// ======================
// TIMER
// ======================
function updateTimerDisplay() {
  const mins = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
  const secs = (timerSeconds % 60).toString().padStart(2, "0");
  document.getElementById("timer-display").textContent = `${mins}:${secs}`;
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  timerSeconds = 0;
  updateTimerDisplay();
}

// ======================
// SCHEDULE
// ======================
function renderWeeklySchedule() {
  const schedule = loadSchedule();
  const container = document.getElementById("weekly-schedule");
  container.innerHTML = "";

  daysOfWeek.forEach(day => {
    const row = document.createElement("div");
    row.className = "day-row";

    const checks = sports.map(sport => {
      const checked = (schedule[day.id] || []).includes(sport.id) ? "checked" : "";
      return `
        <label class="sport-check">
          <input type="checkbox" data-day="${day.id}" data-sport="${sport.id}" ${checked}>
          ${sport.name}
        </label>
      `;
    }).join("");

    row.innerHTML = `
      <div class="day-name">${day.name}</div>
      <div class="sport-checkboxes">${checks}</div>
    `;
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
  alert("Schedule saved!");
}

// ======================
// .ICS DOWNLOAD
// ======================
function downloadICS() {
  const schedule = loadSchedule();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SportStreak//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  daysOfWeek.forEach((day, i) => {
    const list = schedule[day.id] || [];
    if (list.length === 0) return;

    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");

    const title = list.map(id => sports.find(s => s.id === id).name).join(" + ");

    ics += `BEGIN:VEVENT
UID:${dateStr}-${day.id}@sportstreak.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:SportStreak: ${title}
DESCRIPTION:Planned sports – ${day.name}
END:VEVENT
`;
  });

  ics += "END:VCALENDAR";

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "SportStreak-Week.ics";
  a.click();
}

// ======================
// NAVIGATION
// ======================
function switchPage(page) {
  document.getElementById("page-tracker").style.display = page === "tracker" ? "block" : "none";
  document.getElementById("page-schedule").style.display = page === "schedule" ? "block" : "none";

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  if (page === "schedule") {
    renderWeeklySchedule();
  } else {
    // Reset tracker view
    document.getElementById("details-section").style.display = "none";
    document.getElementById("sports-grid").style.display = "grid";
    document.getElementById("today-plan-section").style.display = "block";
    document.getElementById("category-tabs").style.display = "flex";
    renderSportsGrid();
  }
}

// ======================
// EVENT LISTENERS
// ======================
document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("details-section").style.display = "none";
  document.getElementById("sports-grid").style.display = "grid";
  document.getElementById("today-plan-section").style.display = "block";
  document.getElementById("category-tabs").style.display = "flex";
  resetTimer();
});

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchPage(btn.dataset.page));
});

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    renderSportsGrid();
  });
});

document.getElementById("timer-start").addEventListener("click", startTimer);
document.getElementById("timer-pause").addEventListener("click", pauseTimer);
document.getElementById("timer-reset").addEventListener("click", resetTimer);

document.getElementById("save-schedule-btn").addEventListener("click", saveCurrentSchedule);
document.getElementById("download-ics-btn").addEventListener("click", downloadICS);

// ======================
// START APP
// ======================
loadTheme();
renderQuote();
renderSportsGrid();
renderTodayPlan();
