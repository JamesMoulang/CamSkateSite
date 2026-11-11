document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  const week_schedule = document.getElementById("week_schedule");
  console.log(week_schedule);

  function formatEventTime(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const day = start.toLocaleDateString("en-US", { weekday: "short" });
    const date = start.getDate();
    const month = start.toLocaleDateString("en-US", { month: "short" });

    const suffix = (date) => {
      if (date > 3 && date < 21) return "th";
      switch (date % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const startTime = start
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .replace(" ", "")
      .toLowerCase();
    const endTime = end
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      .replace(" ", "")
      .toLowerCase();

    return `${startTime}-${endTime}`;
  }

  async function fetchAndPopulateCarousel() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeMinToday = today.toISOString();

    const aWeekFromNow = new Date(today);
    aWeekFromNow.setDate(today.getDate() + 7);
    const timeMaxToday = aWeekFromNow.toISOString();

    try {
      const events = await calendarEvents
        .getCalendarEvents({
          timeMin: timeMinToday,
          timeMax: timeMaxToday,
          maxResults: 100,
          singleEvents: true,
          orderBy: "startTime",
        })
        .catch((error) => {
          console.error("Error fetching calendar events:", error);
          if (week_schedule) {
            week_schedule.innerHTML =
              '<p style="color: red;">Error loading week schedule.</p>';
          }
        });

      // Group events by day. Construction events are kept apart from
      // sessions: they're shown as a notice at the top of the day rather than
      // as overlapping session blocks.
      const dates = {};

      for (const event of events) {
        const dateString = event.start.dateTime || event.start.date;
        const date = new Date(dateString);
        let formattedDay = date.toLocaleDateString("en-GB", {
          weekday: "long",
          // day: 'numeric',
          // month: 'short'
        });

        const dayOfMonth = date.getDate();
        const ordinal = (d) => {
          const s = ["th", "st", "nd", "rd"];
          const v = d % 100;
          return s[(v - 20) % 10] || s[v] || s[0];
        };
        formattedDay = formattedDay.replace(
          String(dayOfMonth),
          dayOfMonth + ordinal(dayOfMonth),
        );

        if (!dates[formattedDay]) {
          dates[formattedDay] = { sessions: [], construction: [] };
        }

        if (isConstructionEvent(event)) {
          dates[formattedDay].construction.push(event);
        } else {
          dates[formattedDay].sessions.push(event);
        }
      }

      let scheduleHTML = ""; // No wrapper div
      for (const day in dates) {
        const { sessions, construction } = dates[day];
        const isConstructionDay = construction.length > 0;

        scheduleHTML += `
                    <div class="day-capsule${isConstructionDay ? " construction-day" : ""}">
                        <h3>${day}</h3>
                `;

        for (const closure of construction) {
          scheduleHTML += `
                        <div class="construction-notice construction-${closure.construction.level}">
                            <div class="session-time">🚧 ${formatEventTime(closure.start.dateTime, closure.end.dateTime)}</div>
                            <div class="session-title">${closure.title}</div>
                            ${closure.construction.detail ? `<div class="construction-detail">${closure.construction.detail}</div>` : ""}
                        </div>
                    `;
        }

        for (const event of sessions) {
          const session = {
            time: formatEventTime(event.start.dateTime, event.end.dateTime),
            title: event.summary,
            color: event.color,
            tags: event.tags || [],
            links: event.links || [],
          };
          const isCoached = session.tags?.includes("coached") ?? false;
          const bookCoaching =
            isCoached && session.links?.length > 0
              ? session.links
                  .map(
                    (link) =>
                      `<li><a href="${link.href}" target="_blank">${link.text}</a></li>`,
                  )
                  .join("")
              : "";
          const tags =
            session.tags?.length > 0
              ? `<div class="session-tags">${session.tags.map((tag) => `<span class="session-tag">${tag}</span>`).join("")}</div>`
              : "";
          const clashes = constructionClashes(event, construction)
            .map(
              (c) =>
                `<div class="session-construction-note">🚧 ${c.construction.note}</div>`,
            )
            .join("");

          scheduleHTML += `
                        <div class="session-item" style="background: ${session.color};">
                            <div class="session-time">${session.time}</div>
                            <div class="session-title">${session.title}</div>
                            ${clashes}
                            ${bookCoaching ? `<ul class="book-coaching-links">${bookCoaching}</ul>` : ""}
                            ${tags}
                        </div>
                    `;
        }
        scheduleHTML += "</div>";
      }

      if (week_schedule) {
        week_schedule.classList.add("schedule-capsules"); // Add class to the element
        week_schedule.innerHTML = scheduleHTML;
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      if (week_schedule) {
        week_schedule.innerHTML =
          '<p style="color: red;">Error loading week schedule.</p>';
      }
    }
  }

  if (week_schedule) {
    fetchAndPopulateCarousel();
  }
});
