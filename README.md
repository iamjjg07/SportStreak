# SportStreak

A clean personal sports tracker you can host on GitHub Pages.

Track daily activity, build streaks, run a global timer, plan your week, watch technique videos, and review your history.

**Live demo:** [https://iamjjg07.github.io/SportStreak/](https://iamjjg07.github.io/SportStreak/)

---

## Sports

| Category | Sports |
|----------|--------|
| **Track** | Running, Jogging, Long Jump |
| **Team** | Football, Volleyball, Basketball |
| **Racket** | Table Tennis, Lawn Tennis, Badminton |
| **Gym** | Gym |
| **Water** | Swimming |

---

## Features

### Tracker
- Hero photos of each sport (rotates every 5 seconds)
- Motivational quotes by time of day (morning / afternoon / evening)
- Category tabs, per-sport streaks, and recent history
- Activity calendar: ✓ done · ✕ missed · empty = future or not yet done
- Dark mode and light mode
- **Global timer**
  - Start / pause / stop on any sport
  - Only **one** timer can run at a time (other sports lock until you stop & save)
  - **Mini-timer** appears when you leave the sport page so the time keeps counting across Tracker home, Schedule, Records, Videos, and Friends
  - Mini-timer stays **hidden** on every sport detail page (only the big timer shows there)
  - Stop saves the session length to that sport and can mark the day complete

### Schedule
- Weekly plan with checkboxes per sport
- “Today’s Plan” on the Tracker home
- Optional alarm (rings while the page stays open)
- **Open in Google Calendar** for each planned day

### Records
Activity lifecycle:
| Window | Sport page | Records section |
|--------|------------|-----------------|
| 0–24 hours | Visible | Not yet |
| 24–48 hours | Still visible | Transferred here |
| After 48 hours | Removed | Permanent only |
| After 7 days | — | Archived (still filterable by month / year) |

- Filters: Last 7 days · Last 30 days · By month · By year · All
- Reset all records + restore from backup

### Videos
- Realistic YouTube technique tutorials for every sport
- Filter by sport (All, Running, Basketball, Swimming, …)
- Embedded players so you can watch without leaving the app
- Examples: shooting form, freestyle swimming, football skills, running form, badminton footwork, gym form

### Friends
- Share code you can copy into WhatsApp, Instagram, X, etc.
- Paste a friend’s code to keep a local list (device-only; no live network without a backend)

### General
- Fully responsive (phone and desktop)
- All data stored in the browser (`localStorage`) — no account required
- Status messages (“Saved successfully”) auto-hide after a few seconds

---

## Project structure

## Project structure

```
SportStreak/
├── index.html      # Page structure
├── style.css       # Design, themes, and layout
├── script.js       # App logic
└── README.md       # This file
```
---

## How to use

1. Read the quote for the current part of the day.
2. Open a sport → start the timer or tap **I did it today!**
3. Leave the sport page → the **mini-timer** keeps counting in the header.
4. Stop the timer to save the session (and unlock other sports).
5. Use the calendar to see done and missed days.
6. **Schedule** → plan the week, set an alarm, open Google Calendar.
7. **Records** → view activity after the 24h transfer; filter by range.
8. **Videos** → filter by sport and watch technique tutorials.
9. **Friends** → copy your code and share it.

---

## Deploy on GitHub Pages

1. Create a repository named `SportStreak` (or use your existing one).
2. Upload / replace `index.html`, `style.css`, `script.js`, and `README.md`.
3. Go to **Settings → Pages**.
4. Set source to the `main` branch and `/ (root)`.
5. Wait 1–2 minutes, then open:  
   `https://iamjjg07.github.io/SportStreak/`

---

## Technologies

- HTML5
- CSS3 (CSS variables, responsive layout)
- Vanilla JavaScript
- Google Material Icons
- LocalStorage
- YouTube embeds
- Unsplash photos for the hero

No frameworks. Suitable for a first GitHub project.

---

## Limits

GitHub Pages is static. It cannot log into Google for you or host a live social network.

- Google Calendar opens in a new tab so you can save events yourself.
- Friend codes and all progress stay on this device until you add a backend (e.g. Firebase).
- The alarm only fires while the SportStreak tab stays open.

---

## Author

Created by [iamjjg07](https://github.com/iamjjg07)




