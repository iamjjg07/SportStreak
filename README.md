# SportStreak

A clean personal sports tracker you can host on GitHub Pages.

Track daily activity, build streaks, plan your week, and open planned days in Google Calendar.

## Sports

- **Track:** Running, Jogging, Long Jump
- **Team:** Football, Volleyball, Basketball
- **Racket:** Table Tennis, Lawn Tennis, Badminton
- **Gym:** Gym
- **Water:** Swimming

## Features

- Hero photos of each sport, changing every 5 seconds
- Motivational quotes that change by time of day
  - Morning from 6:00
  - Afternoon from 12:00
  - Evening from 16:00
- Category tabs, streaks, and history
- Activity calendar with a tick for done days and an X for missed days
- Dark mode and light mode
- Round timer buttons: green start, pause bars, red stop
- Weekly schedule and “Today’s Plan”
- Opens Google Calendar so you can save each planned day
- Alarm based on the schedule (works while the page is open)
- Reset and restore records
- Time spent: seconds, minutes, hours, days, weeks, months, and years
- Share code friends can paste from any chat app
- Save messages say “Saved successfully”
- Fully responsive on phone and computer
- Data saved in the browser (no account needed)

## Project structure

```
SportStreak/
├── index.html      # Page structure
├── style.css       # Design, themes, and layout
├── script.js       # App logic
└── README.md       # This file
```

## Live demo

After you turn on GitHub Pages:

`https://iamjjg07.github.io/SportStreak`


## How to use the app

1. Read the quote for the current part of the day.
2. Click a sport to track your streak and use the timer.
3. Open the calendar to see done days and missed days.
4. Go to **Schedule**, plan the week, then save.
5. Set an alarm time for planned sports.
6. Click **Open in Google Calendar** and save each event.
7. Open **Records** to see time spent, or reset and restore.
8. Open **Friends**, copy your code, and share it in any chat app.

## Deploy on GitHub Pages

1. Create a repository named `SportStreak`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md`.
3. Go to **Settings → Pages**.
4. Set the source to the `main` branch and `/ (root)`.
5. Wait 1–2 minutes, then open the Pages link.

## Technologies

- HTML5
- CSS3 with CSS variables
- Vanilla JavaScript
- Google Material Icons
- LocalStorage
- Unsplash photos for the hero

No frameworks. Suitable for a first GitHub project.

## Limits

GitHub Pages is a static site. It cannot log into Google for you or host a live friend network.

- Google Calendar opens in a new tab so you can save the event.
- Friend codes stay on this device until you add a backend such as Firebase.

## Author

Beginner project for practicing HTML, CSS, JavaScript, and GitHub.
