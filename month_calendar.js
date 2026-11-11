// Month-at-a-glance calendar on /sessions, shown under the weekly schedule.
// Fetches the visible month from Google Calendar (via calendarEvents) and
// draws a Monday-first grid. Behind each week row sits a "progress" fill that
// tracks how much of the month has already happened, like a loading bar that
// wraps row by row, covering every day that has finished (today stays clear).

const monthCalendarUtils = (() => {
  // Local midnight for a given date
  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  // Stable local-date key, e.g. "2026-11-03"
  function dateKey(date) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${mm}-${dd}`;
  }

  // Weeks (arrays of 7 dates, Monday first) covering every day of the month
  function getMonthGrid(year, month) {
    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    let cursor = addDays(first, -mondayOffset);
    const weeks = [];

    while (
      weeks.length === 0 ||
      (cursor.getMonth() === month && cursor.getFullYear() === year)
    ) {
      const week = [];
      for (let i = 0; i < 7; i++) week.push(addDays(cursor, i));
      weeks.push(week);
      cursor = addDays(cursor, 7);
    }

    return weeks;
  }

  // How far through a week `now` is, measured in days (0 to 7). The whole part
  // is the day column and the fraction is how far through that day we are, so
  // the fill lines up with the grid columns. Each day is measured against its
  // own length, so clock changes don't skew the position.
  function weekProgressDays(weekStart, now) {
    const start = startOfDay(weekStart);
    if (now < start) return 0;

    for (let i = 0; i < 7; i++) {
      const dayStart = addDays(start, i);
      const dayEnd = addDays(start, i + 1);
      if (now < dayEnd) {
        return i + (now - dayStart) / (dayEnd - dayStart);
      }
    }

    return 7;
  }

  function formatClock(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const suffix = hours < 12 ? "am" : "pm";
    const h = hours % 12 || 12;
    return minutes === 0
      ? `${h}${suffix}`
      : `${h}:${String(minutes).padStart(2, "0")}${suffix}`;
  }

  function formatTimeRange(event) {
    if (!event.start.dateTime) return "All day";
    return `${formatClock(new Date(event.start.dateTime))}-${formatClock(
      new Date(event.end.dateTime),
    )}`;
  }

  // All-day events carry a bare "YYYY-MM-DD" date, which must be read as local
  function eventStartDate(event) {
    if (event.start.dateTime) return new Date(event.start.dateTime);
    const [y, m, d] = event.start.date.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  return {
    addDays,
    dateKey,
    getMonthGrid,
    weekProgressDays,
    formatClock,
    formatTimeRange,
    eventStartDate,
    ordinal,
  };
})();

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("month_calendar");
    if (!root || typeof calendarEvents === "undefined") return;

    const {
      addDays,
      dateKey,
      getMonthGrid,
      weekProgressDays,
      formatClock,
      formatTimeRange,
      eventStartDate,
      ordinal,
    } = monthCalendarUtils;

    const titleEl = root.querySelector(".month-calendar-title");
    const prevBtn = root.querySelector(".month-calendar-nav.prev");
    const nextBtn = root.querySelector(".month-calendar-nav.next");
    const gridEl = root.querySelector(".month-calendar-grid");
    const detailEl = root.querySelector(".month-calendar-detail");

    // How far either side of the current month people can browse
    const MONTHS_BACK = 1;
    const MONTHS_AHEAD = 3;
    // Session chips shown inside a day cell before collapsing to "+N more"
    const MAX_CHIPS = 3;

    const today = new Date();
    const baseIndex = today.getFullYear() * 12 + today.getMonth();
    let viewIndex = baseIndex;
    let selectedKey = null;
    let renderToken = 0;
    const cache = new Map();

    const el = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    };

    function fetchMonth(weeks) {
      const from = weeks[0][0];
      const key = dateKey(from);
      if (!cache.has(key)) {
        const to = addDays(weeks.at(-1)[6], 1);
        const request = calendarEvents
          .getCalendarEvents({
            timeMin: from.toISOString(),
            timeMax: to.toISOString(),
            maxResults: 250,
            singleEvents: true,
            orderBy: "startTime",
          })
          .then((events) => {
            const byDay = {};
            for (const event of events) {
              const k = dateKey(eventStartDate(event));
              (byDay[k] ||= []).push(event);
            }
            return byDay;
          })
          .catch((error) => {
            cache.delete(key);
            throw error;
          });
        cache.set(key, request);
      }
      return cache.get(key);
    }

    const monthIndexOf = (date) => date.getFullYear() * 12 + date.getMonth();
    const canView = (index) =>
      index >= baseIndex - MONTHS_BACK && index <= baseIndex + MONTHS_AHEAD;

    function updateNav() {
      prevBtn.disabled = !canView(viewIndex - 1);
      nextBtn.disabled = !canView(viewIndex + 1);
    }

    // Marks today and past days. Run on render and every minute so the page
    // stays right if it's left open past midnight.
    function updateDayStates() {
      const todayKey = dateKey(new Date());
      gridEl.querySelectorAll(".month-day").forEach((cell) => {
        cell.classList.toggle("is-today", cell.dataset.date === todayKey);
        cell.classList.toggle("is-past", cell.dataset.date < todayKey);
      });
    }

    // Sizes each row's fill to cover the finished days. Called once the month
    // has loaded and then every minute, so it moves on at midnight if the
    // page is left open.
    function updateProgress() {
      const now = new Date();
      updateDayStates();
      gridEl.querySelectorAll(".month-week").forEach((row) => {
        const weekStart = new Date(Number(row.dataset.start));
        const days = weekProgressDays(weekStart, now);
        const fill = row.querySelector(".month-week-fill");
        // Only finished days are filled; today stays clear
        const doneDays = Math.floor(days);
        fill.style.setProperty("--progress-day", doneDays);
        fill.classList.toggle("is-full", doneDays >= 7);
        fill.classList.toggle("is-empty", doneDays <= 0);
      });
    }

    function renderGrid(weeks, year, month, byDay) {
      gridEl.replaceChildren();

      weeks.forEach((week, rowIndex) => {
        const row = el("div", "month-week");
        row.dataset.start = String(week[0].getTime());
        row.style.setProperty("--row-index", rowIndex);

        const fill = el("div", "month-week-fill");
        fill.setAttribute("aria-hidden", "true");
        row.appendChild(fill);

        for (const day of week) {
          const key = dateKey(day);
          const events = (byDay && byDay[key]) || [];
          const inMonth = day.getMonth() === month;
          // Spill-over days from a neighbouring month are clickable (they
          // jump to that month) unless that month is outside the nav range
          const locked = !inMonth && !canView(monthIndexOf(day));

          const cell = el("div", "month-day");
          cell.dataset.date = key;
          if (!inMonth) cell.classList.add("is-outside");
          if (locked) cell.classList.add("is-locked");
          if (events.length) cell.classList.add("has-events");

          const label = day.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          });
          cell.setAttribute("role", "button");
          cell.setAttribute("tabindex", locked ? "-1" : "0");
          if (locked) cell.setAttribute("aria-disabled", "true");
          cell.setAttribute(
            "aria-label",
            `${label}: ${
              events.length
                ? `${events.length} session${events.length > 1 ? "s" : ""}`
                : "nothing on"
            }`,
          );

          cell.appendChild(el("span", "month-day-num", String(day.getDate())));

          if (events.length) {
            const list = el("ul", "month-day-events");
            events.slice(0, MAX_CHIPS).forEach((event) => {
              const chip = el("li", "month-event");
              chip.style.setProperty("--event-color", event.color);
              chip.title = `${formatTimeRange(event)} ${event.title}`;
              if (event.start.dateTime) {
                chip.appendChild(
                  el(
                    "span",
                    "month-event-time",
                    formatClock(new Date(event.start.dateTime)),
                  ),
                );
              }
              chip.appendChild(el("span", "month-event-title", event.title));
              list.appendChild(chip);
            });
            if (events.length > MAX_CHIPS) {
              list.appendChild(
                el("li", "month-event-more", `+${events.length - MAX_CHIPS}`),
              );
            }
            cell.appendChild(list);
          }

          row.appendChild(cell);
        }

        gridEl.appendChild(row);
      });

      updateDayStates();
      // Fills start empty while loading. Once there's data, wait for the
      // empty rows to paint so the fills sweep in row by row.
      if (byDay) {
        requestAnimationFrame(() => requestAnimationFrame(updateProgress));
      }
    }

    function renderDetail(byDay) {
      detailEl.replaceChildren();
      if (!selectedKey) return;

      gridEl.querySelectorAll(".month-day").forEach((cell) => {
        const selected = cell.dataset.date === selectedKey;
        cell.classList.toggle("is-selected", selected);
        cell.setAttribute("aria-pressed", String(selected));
      });

      const [y, m, d] = selectedKey.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
      const monthName = date.toLocaleDateString("en-GB", { month: "long" });
      detailEl.appendChild(
        el("h3", "", `${weekday} ${d}${ordinal(d)} ${monthName}`),
      );

      const events = (byDay && byDay[selectedKey]) || [];
      if (!events.length) {
        detailEl.appendChild(
          el("p", "month-calendar-empty", "Nothing on the calendar this day."),
        );
        return;
      }

      const list = el("div", "month-calendar-detail-list");
      for (const event of events) {
        const item = el("div", "session-item");
        item.style.background = event.color;
        item.appendChild(el("div", "session-time", formatTimeRange(event)));
        item.appendChild(el("div", "session-title", event.title));

        // Same rule as the weekly schedule (week_loader.js): only coached
        // sessions show their links, which are the booking links
        const isCoached = event.tags?.includes("coached") ?? false;
        const links = isCoached
          ? (event.links || []).filter((link) => link.text)
          : [];
        if (links.length) {
          const ul = el("ul", "book-coaching-links");
          for (const link of links) {
            const li = el("li");
            const a = el("a", "", link.text);
            a.href = link.href;
            if (/^https?:/.test(link.href)) a.target = "_blank";
            li.appendChild(a);
            ul.appendChild(li);
          }
          item.appendChild(ul);
        }

        if (event.tags?.length) {
          const tags = el("div", "session-tags");
          for (const tag of event.tags) {
            tags.appendChild(el("span", "session-tag", tag));
          }
          item.appendChild(tags);
        }

        list.appendChild(item);
      }
      detailEl.appendChild(list);
    }

    async function render() {
      const token = ++renderToken;
      const year = Math.floor(viewIndex / 12);
      const month = viewIndex % 12;
      const weeks = getMonthGrid(year, month);

      titleEl.textContent = new Date(year, month, 1).toLocaleDateString(
        "en-GB",
        { month: "long", year: "numeric" },
      );
      updateNav();

      // Draw the empty grid straight away so the layout doesn't jump
      root.classList.add("is-loading");
      renderGrid(weeks, year, month, null);
      detailEl.replaceChildren();

      let byDay;
      try {
        byDay = await fetchMonth(weeks);
      } catch (error) {
        if (token !== renderToken) return;
        root.classList.remove("is-loading");
        updateProgress();
        detailEl.replaceChildren(
          el(
            "p",
            "month-calendar-error",
            "Error loading this month's schedule.",
          ),
        );
        return;
      }
      if (token !== renderToken) return;

      root.classList.remove("is-loading");
      renderGrid(weeks, year, month, byDay);

      // Keep the selection if it's in this month, otherwise prefer today, then
      // the first day with anything on
      const inView = (key) =>
        key && Number(key.slice(5, 7)) - 1 === month && key.startsWith(year);
      if (!inView(selectedKey)) {
        const todayKey = dateKey(new Date());
        selectedKey = inView(todayKey)
          ? todayKey
          : Object.keys(byDay).filter(inView).sort()[0] ||
            dateKey(new Date(year, month, 1));
      }
      renderDetail(byDay);
    }

    function selectFrom(target) {
      const cell = target.closest(".month-day");
      if (!cell || cell.classList.contains("is-locked")) return;
      selectedKey = cell.dataset.date;

      // A day from the previous/next month switches the view to that month;
      // render() keeps the selection because it's now in view
      if (cell.classList.contains("is-outside")) {
        const [y, m] = selectedKey.split("-").map(Number);
        viewIndex = y * 12 + (m - 1);
        render().then(revealDetail);
        return;
      }

      fetchMonth(getMonthGrid(Math.floor(viewIndex / 12), viewIndex % 12))
        .then(renderDetail)
        .then(revealDetail, () => {});
    }

    // Scrolls just enough to show the day panel under the calendar. Does
    // nothing if it's already fully on screen, and never scrolls the panel's
    // heading off the top when the panel is taller than the window.
    function revealDetail() {
      const margin = 16;
      const rect = detailEl.getBoundingClientRect();
      const overflow = rect.bottom - (window.innerHeight - margin);
      if (rect.height === 0 || overflow <= 0) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      window.scrollBy({
        top: Math.min(overflow, rect.top - margin),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }

    gridEl.addEventListener("click", (e) => selectFrom(e.target));
    gridEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectFrom(e.target);
      }
    });

    prevBtn.addEventListener("click", () => {
      viewIndex--;
      render();
    });
    nextBtn.addEventListener("click", () => {
      viewIndex++;
      render();
    });

    setInterval(updateProgress, 60 * 1000);
    render();
  });
}

if (typeof exports === "object") {
  module.exports = monthCalendarUtils;
}
