document.addEventListener("DOMContentLoaded", () => {
  // --- Configuration ---
  const CALENDAR_ID =
    "648a32abb0a80624c5f98e8e4bfd057578a6aed5110ba2addc6f9496fa9cabb4@group.calendar.google.com";
  const API_KEY = "AIzaSyAbxzGY7irnlqDnG9NwmLuzwVb2Q3tkr3I";

  let UNIQUE_EVENTS_ONLY = true; // Set to false to show all upcoming events
  if (window.carousel_load_today) {
    UNIQUE_EVENTS_ONLY = false;
  }

  const makeSampleEvent = (summary, startHour, endHour) => ({
    visibility: "public",
    summary,
    start: {
      dateTime: new Date(new Date().setHours(startHour, 0, 0)).toISOString(),
    },
    end: {
      dateTime: new Date(new Date().setHours(endHour, 0, 0)).toISOString(),
    },
  });

  // Set to true to group all instances of each event type and show all their dates
  let GROUP_ALL_INSTANCES = false;
  if (window.carousel_group_instances) {
    GROUP_ALL_INSTANCES = true;
  }

  const carousel = document.getElementById("schedule_carousel");

  let assetRoot = "";
  if (window.carousel_asset_root) assetRoot = window.carousel_asset_root;

  // Default image to use for carousel items if no specific image is found
  const DEFAULT_IMAGE = "img/advanced.jpg";

  const SAMPLE_EVENTS = Object.keys(SESSION_CONFIG).map((key, index) =>
    makeSampleEvent(key, 9 + index, 10 + index),
  );

  function getDisciplinesForEvent(title) {
    return SESSION_CONFIG[title.toLowerCase()]?.disciplines || null;
  }

  function generateDisciplineHTML(title) {
    const disciplines = getDisciplinesForEvent(title);
    if (!disciplines) return "";

    if (disciplines[0] === "all wheels welcome") {
      return '<div class="carousel-disciplines"><span class="discipline-tag all-wheels">All wheels welcome</span></div>';
    }

    let html = '<div class="carousel-disciplines">';
    for (const d of disciplines) {
      html += `<span class="discipline-tag">${d}</span>`;
    }
    html += "</div>";
    return html;
  }

  function getImageForEvent(title) {
    const images = SESSION_CONFIG[title.toLowerCase()]?.images || [
      DEFAULT_IMAGE,
    ];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }

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
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "")
      .toLowerCase();
    const endTime = end
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "")
      .toLowerCase();

    return `${day} ${date}${suffix(date)} ${month}, ${startTime}-${endTime}`;
  }

  function generateLinkHTML(title) {
    const links = SESSION_CONFIG[title.toLowerCase()]?.links || [];
    return (links.length > 0 ? links : SESSION_CONFIG["default"].links)
      .map(
        (link) =>
          `<a href="${assetRoot + link.href}" class="carousel-item-link">${link.text}</a>`,
      )
      .join("");
  }

  async function fetchAndPopulateCarousel() {
    if (
      API_KEY === "YOUR_GOOGLE_API_KEY" ||
      CALENDAR_ID === "YOUR_CALENDAR_ID"
    ) {
      console.error(
        "Please replace 'YOUR_GOOGLE_API_KEY' and 'YOUR_CALENDAR_ID' in carousel_loader.js",
      );
      carousel.innerHTML =
        '<p style="color: red;">Please configure the Google Calendar API Key and Calendar ID.</p>';
      return;
    }

    // Create a Date object for today at midnight (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Convert to ISO string format for the API (e.g., "2025-12-13T00:00:00.000Z")
    const timeMinToday = today.toISOString();

    // Create a Date object for tomorrow at midnight (used only if loading today's events)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    let timeMaxToday = tomorrow.toISOString();

    if (window.carousel_load_week) {
      const in_a_week = new Date(today);
      in_a_week.setDate(today.getDate() + 7);
      timeMaxToday = in_a_week.toISOString();
    }

    // Build the Google Calendar API URL:
    // - timeMin: Start from today at midnight (always included)
    // - timeMax: Only included if window.carousel_load_today is true (limits to today's events only)
    //   If window.carousel_load_today is false/undefined, no timeMax is set, so the API will return
    //   events from today onwards, limited only by maxResults (100 events)
    // - maxResults=100: Maximum number of events to return (this is the hard limit)
    // - singleEvents=true: Expand recurring events into individual instances
    // - orderBy=startTime: Sort events chronologically
    //
    // NOTE: Without timeMax, you'll get up to 100 events starting from today. If you see events
    // loading up to a specific date like Jan 14th, it's likely because you have ~100 events
    // between now and that date, hitting the maxResults limit.
    let url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${timeMinToday}${window.carousel_load_today || window.carousel_load_week ? `&timeMax=${timeMaxToday}` : ""}&maxResults=100&singleEvents=true&orderBy=startTime`;

    let events = [];
    try {
      const response = await fetch(url);
      const data = await response.json();
      events = data.items || [];

      if (!response.ok && !location.hostname.includes("cam-skate.co.uk")) {
        events = SAMPLE_EVENTS;
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      carousel.innerHTML =
        '<p style="color: red;">Error loading upcoming events.</p>';
    }

    let eventsToDisplay;

    if (GROUP_ALL_INSTANCES) {
      // Group all events by title and collect all their times
      const groupedEvents = {};
      for (const event of events) {
        const title = event.summary;
        if (!groupedEvents[title]) {
          groupedEvents[title] = [];
        }
        groupedEvents[title].push(event);
      }
      eventsToDisplay = groupedEvents;
    } else if (UNIQUE_EVENTS_ONLY) {
      const nextUpcomingEvents = {};
      for (const event of events) {
        const title = event.summary;
        if (!nextUpcomingEvents[title]) {
          nextUpcomingEvents[title] = event;
        }
      }
      eventsToDisplay = Object.values(nextUpcomingEvents);
    } else {
      eventsToDisplay = events;
    }

    let carouselHTML = "";

    if (GROUP_ALL_INSTANCES) {
      // Generate carousel items with all dates for each event type
      for (const title in eventsToDisplay) {
        const eventGroup = eventsToDisplay[title];
        const image = getImageForEvent(title);
        const links = generateLinkHTML(title);
        const disciplines = generateDisciplineHTML(title);

        // Generate all time strings for this event type
        let timesHTML = "";
        for (const event of eventGroup) {
          const time = formatEventTime(
            event.start.dateTime,
            event.end.dateTime,
          );
          timesHTML += `<div>${time}</div>`;
        }

        carouselHTML += `
                        <div class="carousel-item" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${assetRoot + image}');">
                            <div class="carousel-item-text-container">
                                ${disciplines}
                                <div class="carousel-item-title">${title}</div>
                                <div class="carousel-item-subtitle">${timesHTML}</div>
                                <div class="carousel-item-links">${links}</div>
                            </div>
                        </div>
                    `;
      }
    } else {
      // Original behavior - one carousel item per event
      for (const event of eventsToDisplay) {
        const title = event.summary;
        const image = getImageForEvent(title);
        const time = formatEventTime(event.start.dateTime, event.end.dateTime);
        const links = generateLinkHTML(title);
        const disciplines = generateDisciplineHTML(title);

        carouselHTML += `
                        <div class="carousel-item" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${assetRoot + image}');">
                            <div class="carousel-item-text-container">
                                ${disciplines}
                                <div class="carousel-item-title">${title}</div>
                                <div class="carousel-item-subtitle">${time}</div>
                                <div class="carousel-item-links">${links}</div>
                            </div>
                        </div>
                    `;
      }
    }

    carousel.innerHTML = carouselHTML;
  }

  fetchAndPopulateCarousel();
});
