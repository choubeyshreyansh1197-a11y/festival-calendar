// --------------- FESTIVAL DATA (EXAMPLE) ----------------
// You can add more festivals here.
// Key: "YYYY-MM-DD"
const festivalEvents = {
  "2025-01-01": [
    { title: "New Year's Day", type: "festival" }
  ],
  "2025-01-14": [
    { title: "Makar Sankranti", type: "festival" }
  ],
  "2025-01-26": [
    { title: "Republic Day (India)", type: "festival" }
  ],
  "2025-03-14": [
    { title: "Holi", type: "festival" }
  ],
  "2025-04-18": [
    { title: "Good Friday", type: "festival" }
  ],
  "2025-08-15": [
    { title: "Independence Day (India)", type: "festival" }
  ],
  "2025-11-01": [
    { title: "Diwali (example date)", type: "festival" }
  ]
};

// --------------- STATE & HELPERS ----------------
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

let currentDate = new Date(); // Date being shown in calendar
let selectedDate = null;      // Date selected in sidebar

// Load custom events from localStorage
function loadCustomEvents() {
  const raw = localStorage.getItem("customEvents");
  return raw ? JSON.parse(raw) : {};
}

// Save custom events to localStorage
function saveCustomEvents(events) {
  localStorage.setItem("customEvents", JSON.stringify(events));
}

// Get ISO date string from Date object (YYYY-MM-DD)
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Return all events (festival + custom) for an ISO date string
function getEventsForDate(isoDate) {
  const customEvents = loadCustomEvents();
  const f = festivalEvents[isoDate] || [];
  const c = customEvents[isoDate] || [];
  return [...f, ...c];
}

// --------------- RENDER CALENDAR ----------------
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const calendarGrid = document.getElementById("calendarGrid");
  const monthNameEl = document.getElementById("monthName");
  const yearEl = document.getElementById("year");

  monthNameEl.textContent = monthNames[month];
  yearEl.textContent = year;

  // Clear previous cells
  calendarGrid.innerHTML = "";

  // Find how many days in this month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Weekday of first day (0 = Sunday, 6 = Saturday)
  const startWeekday = firstDayOfMonth.getDay();

  // Add empty cells for days before 1st
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement("div");
    calendarGrid.appendChild(emptyCell);
  }

  // Add cells for each day
  const todayISO = toISODate(new Date());

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("day-cell");

    const cellDate = new Date(year, month, day);
    const isoDate = toISODate(cellDate);

    // Mark today
    if (isoDate === todayISO) {
      cell.classList.add("today");
    }

    // Day number
    const numberSpan = document.createElement("div");
    numberSpan.classList.add("day-number");
    numberSpan.textContent = day;

    // Event dots
    const events = getEventsForDate(isoDate);
    const dotsWrapper = document.createElement("div");
    dotsWrapper.classList.add("event-dots");

    const usedTypes = new Set();
    events.forEach((ev) => {
      if (!usedTypes.has(ev.type)) {
        usedTypes.add(ev.type);
        const dot = document.createElement("div");
        dot.classList.add("event-dot", ev.type);
        dotsWrapper.appendChild(dot);
      }
    });

    cell.appendChild(numberSpan);
    cell.appendChild(dotsWrapper);

    // On click: select this date
    cell.addEventListener("click", () => {
      selectedDate = isoDate;
      updateSelectedDateDisplay();
    });

    calendarGrid.appendChild(cell);
  }
}

// --------------- UPDATE SIDEBAR ----------------
function updateSelectedDateDisplay() {
  const titleEl = document.getElementById("selectedDateTitle");
  const eventListEl = document.getElementById("eventList");
  const eventDateInput = document.getElementById("eventDate");

  if (!selectedDate) {
    titleEl.textContent = "Select a date";
    eventListEl.innerHTML =
      '<li class="empty-state">No date selected.</li>';
    return;
  }

  // Show human readable date
  const [year, month, day] = selectedDate.split("-");
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const pretty =
    day + " " + monthNames[dateObj.getMonth()] + " " + year;

  titleEl.textContent = `Events on ${pretty}`;

  // Set form date input
  eventDateInput.value = selectedDate;

  // Load events
  const events = getEventsForDate(selectedDate);

  if (!events.length) {
    eventListEl.innerHTML =
      '<li class="empty-state">No events for this day yet.</li>';
    return;
  }

  // Render events list
  eventListEl.innerHTML = "";
  events.forEach((ev) => {
    const li = document.createElement("li");

    const badge = document.createElement("span");
    badge.classList.add("event-badge", ev.type);
    badge.textContent = ev.type;

    const titleSpan = document.createElement("span");
    titleSpan.classList.add("event-title");
    titleSpan.textContent = ev.title;

    li.appendChild(badge);
    li.appendChild(titleSpan);
    eventListEl.appendChild(li);
  });
}

// --------------- EVENT FORM HANDLING ----------------
function setupEventForm() {
  const form = document.getElementById("addEventForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dateInput = document.getElementById("eventDate");
    const titleInput = document.getElementById("eventTitle");
    const typeSelect = document.getElementById("eventType");

    const isoDate = dateInput.value;
    const title = titleInput.value.trim();
    const type = typeSelect.value;

    if (!isoDate || !title) {
      alert("Please select a date and enter a title.");
      return;
    }

    // Save to localStorage
    const customEvents = loadCustomEvents();
    if (!customEvents[isoDate]) {
      customEvents[isoDate] = [];
    }
    customEvents[isoDate].push({ title, type });
    saveCustomEvents(customEvents);

    // If the event is in the currently displayed month, re-render calendar
    const dateObj = new Date(isoDate);
    if (
      dateObj.getFullYear() === currentDate.getFullYear() &&
      dateObj.getMonth() === currentDate.getMonth()
    ) {
      renderCalendar();
    }

    // If this date is selected, refresh sidebar list
    if (selectedDate === isoDate) {
      updateSelectedDateDisplay();
    }

    titleInput.value = "";
    alert("Event added successfully!");
  });
}

// --------------- MONTH NAVIGATION ----------------
function setupMonthNavigation() {
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    // After changing month, reset selected date
    selectedDate = null;
    updateSelectedDateDisplay();
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    selectedDate = null;
    updateSelectedDateDisplay();
  });
}

// --------------- INITIALIZE ----------------
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  setupEventForm();
  setupMonthNavigation();
  updateSelectedDateDisplay();
});
