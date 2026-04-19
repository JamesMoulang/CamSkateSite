// Fetches per-course data from the membership API and populates coaching
// pages in place. Pages ship with sensible static fallback copy — fields are
// only replaced on a successful fetch, so a flaky API degrades to stale-but-
// correct text rather than blanks.
//
// Markup contract:
//   <section data-course-key="after_work_club">
//     ... <span data-course-field="drop-in-price">£25</span> ...
//     ... <p data-course-show-when="has-term">next term runs ...</p>
//     ... <p data-course-show-when="no-term">no term currently scheduled</p>
//   </section>

const COACHING_API_BASE = "https://membership.cam-skate.co.uk/api/coaching";

const MONTHS = [
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
  "December",
];

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatDayMonth(d) {
  return `${d.getDate()}${ordinal(d.getDate())} ${MONTHS[d.getMonth()]}`;
}

function formatDayMonthYear(d) {
  return `${formatDayMonth(d)} ${d.getFullYear()}`;
}

function formatDateRange(firstIso, lastIso) {
  const a = new Date(firstIso);
  const b = new Date(lastIso);
  const left =
    a.getFullYear() === b.getFullYear()
      ? formatDayMonth(a)
      : formatDayMonthYear(a);
  return `${left} \u2013 ${formatDayMonthYear(b)}`;
}

function formatHour(h, m) {
  const suffix = h >= 12 ? "pm" : "am";
  const hr = ((h + 11) % 12) + 1;
  return m === 0
    ? `${hr}${suffix}`
    : `${hr}:${m.toString().padStart(2, "0")}${suffix}`;
}

function formatHourRange(startHour, duration) {
  const start = formatHour(startHour.hour, startHour.minutes);
  const totalMin =
    startHour.hour * 60 +
    startHour.minutes +
    (duration.hours || 0) * 60 +
    (duration.minutes || 0);
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${start} to ${formatHour(endH, endM)}`;
}

function pickTerm(data) {
  return (
    data.ongoing_term || (data.upcoming_terms && data.upcoming_terms[0]) || null
  );
}

function setField(root, field, value) {
  root.querySelectorAll(`[data-course-field="${field}"]`).forEach((el) => {
    el.textContent = value;
  });
}

function applyVisibility(root, hasTerm) {
  root.querySelectorAll('[data-course-show-when="has-term"]').forEach((el) => {
    el.style.display = hasTerm ? "" : "none";
  });
  root.querySelectorAll('[data-course-show-when="no-term"]').forEach((el) => {
    el.style.display = hasTerm ? "none" : "";
  });
}

function renderCampList(container, upcomingTerms) {
  if (!upcomingTerms || upcomingTerms.length === 0) {
    container.textContent = "No camps currently scheduled — check back soon!";
    return;
  }
  const lines = upcomingTerms.map((term, idx) => {
    const range = formatDateRange(term.first_date, term.last_date);
    return `Week ${idx + 1}: ${range}`;
  });
  container.innerHTML = lines.join("<br>");
}

function populateCourse(root, data) {
  const term = pickTerm(data);
  applyVisibility(root, term !== null);

  if (term) {
    setField(root, "drop-in-price", `£${term.prices.door}`);
    setField(root, "term-price-per-session", `£${term.prices.bulk}`);

    const length = term.dates ? term.dates.length : 0;
    if (length > 0) {
      setField(root, "term-length", String(length));
      setField(root, "term-price-total", `£${term.prices.bulk * length}`);
    }

    if (term.first_date) {
      setField(
        root,
        "term-start-date",
        formatDayMonthYear(new Date(term.first_date)),
      );
    }
    if (term.last_date) {
      setField(
        root,
        "term-end-date",
        formatDayMonthYear(new Date(term.last_date)),
      );
    }
    if (term.first_date && term.last_date) {
      setField(
        root,
        "term-date-range",
        formatDateRange(term.first_date, term.last_date),
      );
    }

    if (term.dates && term.dates.length > 0) {
      const first = new Date(term.dates[0].time);
      setField(
        root,
        "first-workshop-date-long",
        `${DAYS[first.getDay()]} ${formatDayMonthYear(first)}`,
      );
    }
    if (term.hours && term.hours.length > 0 && term.duration) {
      setField(
        root,
        "first-workshop-time-range",
        formatHourRange(term.hours[0], term.duration),
      );
    }
  }

  root.querySelectorAll('[data-course-field="camp-list"]').forEach((el) => {
    renderCampList(el, data.upcoming_terms || []);
  });
}

function loadCourse(key) {
  return fetch(`${COACHING_API_BASE}/${key}`).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ${key}: ${res.status}`);
    return res.json();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const roots = document.querySelectorAll("[data-course-key]");
  const pending = new Map();

  roots.forEach((el) => {
    const key = el.dataset.courseKey;
    if (!pending.has(key)) pending.set(key, loadCourse(key));
  });

  pending.forEach((promise, key) => {
    promise
      .then((data) => {
        document
          .querySelectorAll(`[data-course-key="${key}"]`)
          .forEach((root) => populateCourse(root, data));
      })
      .catch((err) => {
        console.error("coaching_loader:", err);
      });
  });
});
