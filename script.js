// ======================
// SPORTS DATA
// ======================
const sports = [
  { id: "tabletennis", name: "Table Tennis", emoji: "🏓" },
  { id: "jogging", name: "Jogging", emoji: "🏃" },
  { id: "running", name: "Running", emoji: "🏃‍♂️" },
  { id: "swimming", name: "Swimming", emoji: "🏊" }
];

// ======================
// MOTIVATION QUOTES
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
// THEME FUNCTIONS
// ======================
function loadTheme() {
  const savedTheme = localStorage.getItem("sportstreak-theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    document.getElementById("theme-icon").textContent = "☀️";
  } else {
    document.body.classList.remove("light-mode");
    document.getElementById("theme-icon").textContent = "🌙";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  
  if (document.body.classList.contains("light-mode")) {
    localStorage.setItem("sportstreak-theme", "light");
    document.getElementById("theme-icon").textContent = "☀️";
  } else {
    localStorage.setItem("sportstreak-theme", "dark");
    document.getElementById("theme-icon").textContent = "🌙";
  }
}

// ======================
// HELPER FUNCTIONS
// ======================
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function getDailyQuote() {
  const today = getToday();
  const dayNumber = parseInt(today.replace(/-/g, ""), 10);
  const index = dayNumber % quotes.length;
  return quotes[index];
}

function loadData() {
  const data = localStorage.getItem("sportstreak-data");
  return data ? JSON.parse(data) : {};
}

function saveData(data) {
  localStorage.setItem("sportstreak-data", JSON.stringify(data));
}

function getSportData(sportId) {
  const allData = loadData();
  if (!allData[sportId]) {
    allData[sportId] = {
      streak: 0,
      lastCompleted: null,
      history: []
    };
    saveData(allData);
  }
  return allData[sportId];
}

// ======================
// RENDER FUNCTIONS
// ======================
function renderQuote() {
  document.getElementById("daily-quote").textContent = getDailyQuote();
}

function renderSportsGrid() {
  const grid = document.getElementById("sports-grid");
  grid.innerHTML = "";

  sports.forEach(sport => {
    const data = getSportData(sport.id);
    const card = document.createElement("div");
    card.className = "sport-card";
    card.innerHTML = `
      <span class="emoji">${sport.emoji}</span>
      <h3>${sport.name}</h3>
      <p class="mini-streak">Streak: <span>${data.streak}</span></p>
    `;
    card.addEventListener("click", () => openSport(sport.id));
    grid.appendChild(card);
  });
}

function openSport(sportId) {
  const sport = sports.find(s => s.id === sportId);
  const data = getSportData(sportId);
  const today = getToday();

  document.getElementById("sports-grid").style.display = "none";
  document.getElementById("details-section").style.display = "block";

  document.getElementById("detail-emoji").textContent = sport.emoji;
  document.getElementById("detail-name").textContent = sport.name;
  document.getElementById("streak-number").textContent = data.streak;

  const doneBtn = document.getElementById("done-btn");
  const statusMsg = document.getElementById("status-message");

  if (data.lastCompleted === today) {
    doneBtn.disabled = true;
    doneBtn.textContent = "Completed today ✓";
    statusMsg.textContent = "Great job! Come back tomorrow.";
  } else {
    doneBtn.disabled = false;
    doneBtn.textContent = "I did it today!";
    statusMsg.textContent = "";
  }

  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";
  const recent = data.history.slice(-14).reverse();
  
  if (recent.length === 0) {
    historyList.innerHTML = "<li>No activity yet</li>";
  } else {
    recent.forEach(date => {
      const li = document.createElement("li");
      li.textContent = date;
      if (date === today) li.classList.add("today");
      historyList.appendChild(li);
    });
  }

  doneBtn.onclick = () => markAsDone(sportId);
}

function markAsDone(sportId) {
  const allData = loadData();
  const data = allData[sportId];
  const today = getToday();
  const yesterday = getYesterday();

  if (data.lastCompleted === today) return;

  if (data.lastCompleted === yesterday) {
    data.streak += 1;
  } else {
    data.streak = 1;
  }

  data.lastCompleted = today;

  if (!data.history.includes(today)) {
    data.history.push(today);
  }

  if (data.history.length > 60) {
    data.history = data.history.slice(-60);
  }

  allData[sportId] = data;
  saveData(allData);

  openSport(sportId);
  renderSportsGrid();
}

// ======================
// EVENT LISTENERS
// ======================
document.getElementById("back-btn").addEventListener("click", () => {
  document.getElementById("details-section").style.display = "none";
  document.getElementById("sports-grid").style.display = "grid";
});

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

// ======================
// START THE APP
// ======================
loadTheme();
renderQuote();
renderSportsGrid();
